// Raciocínio guiado do resultado (RG-10) e tecnologias candidatas (RG-14), como segunda opinião
// rotulada e fora do hash do veredito (Parte 4, 10.2 a 10.4). O veredito oficial aparece antes,
// assim que o motor termina; o raciocínio chega por SSE e, na divergência, vale o motor (RN-73).
import { saidaCandidatas, saidaRaciocinio } from '@stacksync/contracts';
import { iso, type Tx } from '../db/banco.ts';
import { contextoCandidatas, contextoRaciocinio } from '../ia/contexto.ts';
import { executar, type RegistroChamada } from '../ia/esteira.ts';
import { ErroIA, mensagensErroIA } from '../ia/tipos.ts';
import { normalizarNome, validarCandidatas, validarRaciocinio, type BlocoValidado, type Descartado } from '../ia/validadores.ts';
import { Problema } from '../http/erros.ts';
import { hashTexto } from '../seguranca/cifra.ts';
import { adaptadorDaOrg } from './credenciais.ts';
import { gravarChamadas, type Servicos } from './servicos.ts';
import { carregarVeredito } from './veredito.ts';

export interface Raciocinio {
  id: string;
  versao: number;
  status: 'gerando' | 'pronto' | 'falhou';
  provedor: string | null;
  modelo: string | null;
  versaoPrompt: string | null;
  blocos: BlocoValidado[];
  descartados: Descartado[];
  sintese: string | null;
  candidatas: Array<{ decisao: string; nome: string; motivo: string }>;
  falha: string | null;
  criadoEm: string;
  concluidoEm: string | null;
}

export const raciocinioDe = (r: Record<string, unknown>): Raciocinio => ({
  id: r.id as string,
  versao: r.versao as number,
  status: r.status as Raciocinio['status'],
  provedor: (r.provedor as string | null) ?? null,
  modelo: (r.modelo as string | null) ?? null,
  versaoPrompt: (r.versao_prompt as string | null) ?? null,
  blocos: (r.blocos as BlocoValidado[]) ?? [],
  descartados: (r.descartados as Descartado[]) ?? [],
  sintese: (r.sintese as string | null) ?? null,
  candidatas: (r.candidatas as Raciocinio['candidatas']) ?? [],
  falha: (r.falha as string | null) ?? null,
  criadoEm: iso(r.criado_em)!,
  concluidoEm: iso(r.concluido_em),
});

export async function ultimoRaciocinio(tx: Tx, vereditoId: string): Promise<Raciocinio | null> {
  const r = await tx.um('SELECT * FROM raciocinios WHERE veredito_id = $1 ORDER BY versao DESC LIMIT 1', [vereditoId]);
  return r ? raciocinioDe(r) : null;
}

/** O raciocínio pronto mais recente: é o que o relatório e o link de leitura mostram. */
export async function ultimoRaciocinioPronto(tx: Tx, vereditoId: string): Promise<Raciocinio | null> {
  const r = await tx.um("SELECT * FROM raciocinios WHERE veredito_id = $1 AND status = 'pronto' ORDER BY versao DESC LIMIT 1", [vereditoId]);
  return r ? raciocinioDe(r) : null;
}

/** Eventos SSE que reproduzem um raciocínio já concluído (reconexão ou leitura posterior). */
export function eventosDe(r: Raciocinio): Array<{ tipo: string; dados: unknown }> {
  const ev: Array<{ tipo: string; dados: unknown }> = [
    { tipo: 'inicio', dados: { versao: r.versao, provedor: r.provedor, modelo: r.modelo, versaoPrompt: r.versaoPrompt } },
  ];
  for (const b of r.blocos) ev.push({ tipo: 'bloco', dados: b });
  for (const d of r.descartados) ev.push({ tipo: 'descartado', dados: d });
  if (r.status === 'pronto') {
    ev.push({ tipo: 'sintese', dados: { texto: r.sintese } });
    if (r.candidatas.length) ev.push({ tipo: 'candidatas', dados: { candidatas: r.candidatas } });
    ev.push({ tipo: 'fim', dados: { versao: r.versao } });
  } else if (r.status === 'falhou') ev.push({ tipo: 'falhou', dados: { mensagem: r.falha } });
  return ev;
}

async function criarVersao(s: Servicos, orgId: string, vereditoId: string): Promise<number> {
  return s.banco.comOrg(orgId, async (tx) => {
    const ult = await tx.um<{ versao: number }>('SELECT max(versao)::int AS versao FROM raciocinios WHERE veredito_id = $1', [vereditoId]);
    const versao = (ult?.versao ?? 0) + 1;
    await tx.q("INSERT INTO raciocinios (org_id, veredito_id, versao, status) VALUES ($1, $2, $3, 'gerando')", [orgId, vereditoId, versao]);
    return versao;
  });
}

/** Começa uma geração nova (versão nova; a anterior fica no histórico). */
export async function iniciarRaciocinio(s: Servicos, orgId: string, sessaoHash: string, vereditoId: string): Promise<number> {
  if (s.geracoes.ativa(vereditoId)) throw new Problema(409, 'raciocinio-em-andamento', 'O raciocínio ainda está sendo gerado');
  const versao = await criarVersao(s, orgId, vereditoId);
  s.geracoes.iniciar(vereditoId, (emitir) => gerar(s, orgId, sessaoHash, vereditoId, versao, emitir));
  return versao;
}

async function gerar(
  s: Servicos,
  orgId: string,
  sessaoHash: string,
  vereditoId: string,
  versao: number,
  emitir: (tipo: string, dados: unknown) => void,
): Promise<void> {
  const c = s.conteudo;
  const registros: RegistroChamada[] = [];
  const v = await s.banco.comOrg(orgId, (tx) => carregarVeredito(tx, vereditoId));
  if (!v) return;
  const doc = v.documento;
  let provedor: string | null = null;
  let modelo: string | null = null;
  const salvar = (campos: Record<string, unknown>) =>
    s.banco.comOrg(orgId, async (tx) => {
      const chaves = Object.keys(campos);
      const sets = chaves.map((k, i) => `${k} = $${i + 3}${['blocos', 'descartados', 'candidatas'].includes(k) ? '::jsonb' : ''}`).join(', ');
      await tx.q(`UPDATE raciocinios SET ${sets} WHERE veredito_id = $1 AND versao = $2`, [
        vereditoId,
        versao,
        ...chaves.map((k) => (['blocos', 'descartados', 'candidatas'].includes(k) ? JSON.stringify(campos[k]) : campos[k])),
      ]);
      await gravarChamadas(tx, orgId, v.analiseId, registros.splice(0));
    });

  try {
    const ad = await adaptadorDaOrg(s, orgId, sessaoHash);
    provedor = ad.provedor;
    modelo = ad.modelo;
    emitir('inicio', { versao, provedor, modelo, versaoPrompt: c.prompts.versao });
    const ctx = contextoRaciocinio(c, doc, v.entrada.respostas);
    const r = await executar(
      c,
      ad,
      { etapa: 'RG-10', schema: saidaRaciocinio, nomeSchema: 'raciocinio', usuario: ctx.usuario, dados: ctx.dados, esforco: 'alto', maxTokens: 16000 },
      (x) => void registros.push(x),
    );
    const val = validarRaciocinio(c, r.saida, ctx.dados, ctx.usuario);
    for (const b of val.blocos) emitir('bloco', b);
    for (const d of val.descartados) emitir('descartado', d);
    emitir('sintese', { texto: val.sintese });

    // RG-14 nos níveis Equilibrado e Avançado, quando o plano tem decisões de tecnologia.
    let candidatas: Raciocinio['candidatas'] = [];
    if (v.analise.profundidade !== 'rapido' && doc.plano.tecnologias.length) {
      try {
        const cc = contextoCandidatas(c, doc);
        const rc = await executar(
          c,
          ad,
          { etapa: 'RG-14', schema: saidaCandidatas, nomeSchema: 'candidatas', usuario: cc.usuario, dados: cc.dados, esforco: 'medio', maxTokens: 6000 },
          (x) => void registros.push(x),
        );
        const vc = validarCandidatas(c, rc.saida, cc.dados.decisoes.map((d) => d.id));
        candidatas = vc.candidatas;
        val.descartados.push(...vc.descartados.map((d) => ({ alvo: `candidata ${d.alvo}`, motivo: d.motivo })));
        for (const d of vc.descartados) emitir('descartado', { alvo: `candidata ${d.alvo}`, motivo: d.motivo });
        if (candidatas.length) emitir('candidatas', { candidatas });
        // Fila de curadoria da base (DT-31): só o nome e a decisão, sem dado da análise.
        await s.banco.comOrg(orgId, async (tx) => {
          for (const k of candidatas)
            await tx.q(
              `INSERT INTO candidatas_tecnologia (nome_normalizado, nome, decisoes) VALUES ($1, $2, $3::jsonb)
               ON CONFLICT (nome_normalizado) DO UPDATE SET ocorrencias = candidatas_tecnologia.ocorrencias + 1, ultima_em = now(),
                 decisoes = (SELECT jsonb_agg(DISTINCT x) FROM jsonb_array_elements(candidatas_tecnologia.decisoes || EXCLUDED.decisoes) x)`,
              [normalizarNome(k.nome), k.nome, JSON.stringify([k.decisao])],
            );
        });
      } catch (e) {
        const motivo = e instanceof ErroIA ? mensagensErroIA[e.tipo] : 'falha';
        val.descartados.push({ alvo: 'candidatas', motivo });
        emitir('descartado', { alvo: 'candidatas', motivo });
      }
    }
    await salvar({
      status: 'pronto',
      provedor,
      modelo: r.modelo,
      versao_prompt: r.versaoPrompt,
      hash_contexto: hashTexto(ctx.usuario),
      blocos: val.blocos,
      descartados: val.descartados,
      sintese: val.sintese,
      candidatas,
      concluido_em: new Date().toISOString(),
    });
    emitir('fim', { versao });
  } catch (e) {
    const mensagem = e instanceof ErroIA ? mensagensErroIA[e.tipo] : e instanceof Problema ? e.titulo : mensagensErroIA.outro;
    await salvar({ status: 'falhou', provedor, modelo, falha: mensagem, concluido_em: new Date().toISOString() }).catch(() => undefined);
    emitir('falhou', { mensagem });
  }
}
