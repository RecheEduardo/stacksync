// Percurso adaptativo (RG-12) e respostas sugeridas (RG-13), numa chamada só por pergunta para
// reduzir a espera. A IA escolhe só entre as elegíveis da estrutura; sem resposta válida do
// provedor, valem a ordem e as opções padrão (RN-91, RF-55). O contexto nunca leva a ideia prévia
// nem resultado parcial (RN-92, FF-19). Nenhuma transação fica aberta durante a chamada à IA.
import type { Pergunta } from '@stacksync/content/tipos';
import { saidaPercurso, saidaSugestoes } from '@stacksync/contracts';
import { canonico, opcoesDaPergunta, opcoesPadrao, sha256, type RespostaEntrada } from '@stacksync/engine';
import { contextoPercurso, contextoSugestoes } from '../ia/contexto.ts';
import { executar, type RegistroChamada } from '../ia/esteira.ts';
import { ErroIA, mensagensErroIA } from '../ia/tipos.ts';
import { validarPercurso, validarSugestoes } from '../ia/validadores.ts';
import { Problema, naoEncontrado } from '../http/erros.ts';
import {
  alteradasAposVeredito,
  carregarAnalise,
  carregarRespostas,
  cartaoDe,
  entradaDe,
  estadoDa,
  progressoDe,
  type Analise,
  type CartaoPergunta,
  type Progresso,
  type Sugestao,
} from '../dominio/analises.ts';
import { adaptadorDaOrg } from './credenciais.ts';
import { gravarChamadas, type Servicos } from './servicos.ts';

export interface RespostaProxima {
  concluido: boolean;
  pergunta: CartaoPergunta | null;
  /** "ia": escolhida pela IA; "padrao": ordem da estrutura (provedor falhou ou só havia uma). */
  origem: 'ia' | 'padrao' | null;
  aviso: string | null;
  progresso: Progresso;
}

const esforcoPercurso = 'baixo' as const;

async function lerEstado(s: Servicos, orgId: string, analiseId: string) {
  return s.banco.comOrg(orgId, async (tx) => {
    const a = await carregarAnalise(tx, analiseId);
    if (!a) throw naoEncontrado('Análise');
    const respostas = await carregarRespostas(tx, a.id);
    const alteradas = await alteradasAposVeredito(tx, a.id);
    const sugeridas = await tx.q<{ pergunta: string; opcoes: string[]; origem: 'ia' | 'padrao'; falha: string | null }>(
      'SELECT pergunta, opcoes, origem, falha FROM sugestoes_resposta WHERE analise_id = $1',
      [a.id],
    );
    return { a, respostas, alteradas, entrada: entradaDe(respostas, alteradas), sugeridas: new Map(sugeridas.map((x) => [x.pergunta, x])) };
  });
}

function padraoDe(s: Servicos, entrada: Record<string, RespostaEntrada>) {
  return (p: Pergunta) => opcoesPadrao(s.conteudo, p, entrada);
}

/** Sugestões padrão da estrutura, validadas como qualquer outra (C-02). */
function sugestaoPadrao(s: Servicos, p: Pergunta, entrada: Record<string, RespostaEntrada>, falha: string | null): Sugestao {
  const ids = opcoesDaPergunta(s.conteudo, p, entrada).map((o) => o.id);
  const padrao = opcoesPadrao(s.conteudo, p, entrada).filter((o) => ids.includes(o));
  return { opcoes: ids.filter((o) => padrao.includes(o)), origem: 'padrao', falha };
}

async function gravarSugestao(s: Servicos, orgId: string, a: Analise, pergunta: string, sug: Sugestao) {
  await s.banco.comOrg(orgId, (tx) =>
    tx.q(
      `INSERT INTO sugestoes_resposta (analise_id, org_id, pergunta, opcoes, origem, falha) VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       ON CONFLICT (analise_id, pergunta) DO NOTHING`,
      [a.id, orgId, pergunta, JSON.stringify(sug.opcoes), sug.origem, sug.falha],
    ),
  );
}

/** RG-13 isolado: sugestões para uma pergunta específica (volta a uma resposta, revisão). */
export async function sugestoesPara(s: Servicos, orgId: string, sessaoHash: string, analiseId: string, perguntaId: string) {
  const { a, respostas, alteradas, entrada, sugeridas } = await lerEstado(s, orgId, analiseId);
  const p = s.conteudo.perguntas[perguntaId];
  const estado = estadoDa(s.conteudo, a, entrada);
  if (!p || (!estado.aplicaveis.includes(perguntaId) && !respostas[perguntaId])) throw naoEncontrado('Pergunta');
  let sug: Sugestao;
  const guardada = sugeridas.get(perguntaId);
  if (guardada) sug = { opcoes: guardada.opcoes, origem: guardada.origem, falha: guardada.falha };
  else {
    const registros: RegistroChamada[] = [];
    const ids = opcoesDaPergunta(s.conteudo, p, entrada).map((o) => o.id);
    try {
      const ad = await adaptadorDaOrg(s, orgId, sessaoHash);
      const ctx = contextoSugestoes(s.conteudo, a.subnivel, p, entrada, opcoesPadrao(s.conteudo, p, entrada));
      const r = await executar(
        s.conteudo,
        ad,
        { etapa: 'RG-13', schema: saidaSugestoes, nomeSchema: 'sugestoes', usuario: ctx.usuario, dados: ctx.dados, esforco: esforcoPercurso, maxTokens: 4000 },
        (x) => void registros.push(x),
      );
      const v = validarSugestoes(r.saida.opcoes, p, ids);
      sug = v.ok ? { opcoes: v.opcoes, origem: 'ia', falha: null } : sugestaoPadrao(s, p, entrada, `VI-08: ${v.motivo}`);
    } catch (e) {
      if (e instanceof Problema && e.status !== 409) throw e;
      sug = sugestaoPadrao(s, p, entrada, e instanceof ErroIA ? mensagensErroIA[e.tipo] : e instanceof Problema ? e.titulo : 'falha');
    }
    await s.banco.comOrg(orgId, (tx) => gravarChamadas(tx, orgId, a.id, registros));
    await gravarSugestao(s, orgId, a, perguntaId, sug);
  }
  return cartaoDe(s.conteudo, a, p, entrada, sug, respostas[perguntaId] ?? null, alteradas);
}

export async function proximaPergunta(s: Servicos, orgId: string, sessaoHash: string, analiseId: string, pular: string[]): Promise<RespostaProxima> {
  const { a, respostas, alteradas, entrada, sugeridas } = await lerEstado(s, orgId, analiseId);
  const estado = estadoDa(s.conteudo, a, entrada);
  const progresso = progressoDe(s.conteudo, a, entrada);
  if (estado.concluido) return { concluido: true, pergunta: null, origem: null, aviso: null, progresso };

  // Pular deixa a pergunta para depois; se tudo foi pulado, o percurso volta a elas.
  const restantes = estado.elegiveis.filter((id) => !pular.includes(id));
  const elegiveis = restantes.length ? restantes : estado.elegiveis;
  const ordemPadrao = elegiveis[0]!;
  const hashEstado = sha256(
    canonico({
      p: a.profundidade,
      r: Object.fromEntries(Object.entries(entrada).map(([k, v]) => [k, [v.valor, v.origem, v.faixaOpcoes ?? null, v.faixaSinal ?? null]])),
      e: elegiveis,
    }),
  );

  const anterior = await s.banco.comOrg(orgId, (tx) =>
    tx.um<{ pergunta: string; origem: 'ia' | 'padrao' }>(
      'SELECT pergunta, origem FROM percursos WHERE analise_id = $1 AND hash_estado = $2 ORDER BY id DESC LIMIT 1',
      [a.id, hashEstado],
    ),
  );
  const cartao = (pid: string, sug: Sugestao) => cartaoDe(s.conteudo, a, s.conteudo.perguntas[pid]!, entrada, sug, respostas[pid] ?? null, alteradas);

  // Mesmo estado, mesma pergunta: a IA não é chamada de novo (e o percurso não muda ao recarregar).
  if (anterior && elegiveis.includes(anterior.pergunta)) {
    const g = sugeridas.get(anterior.pergunta);
    const sug: Sugestao = g ? { opcoes: g.opcoes, origem: g.origem, falha: g.falha } : sugestaoPadrao(s, s.conteudo.perguntas[anterior.pergunta]!, entrada, null);
    return { concluido: false, pergunta: cartao(anterior.pergunta, sug), origem: anterior.origem, aviso: null, progresso };
  }

  const registros: RegistroChamada[] = [];
  let escolhida = ordemPadrao;
  let origem: 'ia' | 'padrao' = 'padrao';
  let perfil: string | null = null;
  let motivo: string | null = null;
  let falha: string | null = null;
  let sug: Sugestao | null = null;

  if (elegiveis.length > 1) {
    try {
      const ad = await adaptadorDaOrg(s, orgId, sessaoHash);
      const ctx = contextoPercurso(s.conteudo, a, entrada, { ...estado, ordemPadrao }, elegiveis, padraoDe(s, entrada));
      const r = await executar(
        s.conteudo,
        ad,
        { etapa: 'RG-12', schema: saidaPercurso, nomeSchema: 'percurso', usuario: ctx.usuario, dados: ctx.dados, esforco: esforcoPercurso, maxTokens: 6000 },
        (x) => void registros.push(x),
      );
      const v = validarPercurso(r.saida, elegiveis);
      if (v.ok) {
        escolhida = r.saida.pergunta;
        origem = 'ia';
        perfil = r.saida.perfil.slice(0, 300);
        motivo = r.saida.motivo.slice(0, 300);
        const p = s.conteudo.perguntas[escolhida]!;
        const ids = opcoesDaPergunta(s.conteudo, p, entrada).map((o) => o.id);
        const vs = validarSugestoes(r.saida.sugestoes, p, ids);
        sug = vs.ok ? { opcoes: vs.opcoes, origem: 'ia', falha: null } : sugestaoPadrao(s, p, entrada, `VI-08: ${vs.motivo}`);
      } else falha = `VI-08: ${v.motivo}`;
    } catch (e) {
      if (e instanceof Problema && e.status !== 409) throw e;
      falha = e instanceof ErroIA ? mensagensErroIA[e.tipo] : e instanceof Problema ? e.titulo : 'falha';
    }
  }

  await s.banco.comOrg(orgId, async (tx) => {
    await gravarChamadas(tx, orgId, a.id, registros);
    await tx.q(
      `INSERT INTO percursos (org_id, analise_id, hash_estado, pergunta, origem, ordem_padrao, elegiveis, perfil, motivo, falha, versao_estrutura)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)`,
      [orgId, a.id, hashEstado, escolhida, origem, ordemPadrao, JSON.stringify(elegiveis), perfil, motivo, falha, s.conteudo.estrutura.versao],
    );
  });

  const guardada = sugeridas.get(escolhida);
  if (guardada) sug = { opcoes: guardada.opcoes, origem: guardada.origem, falha: guardada.falha };
  if (!sug) {
    // Só uma elegível, ou a IA falhou na escolha: as sugestões vêm do RG-13 isolado ou do padrão.
    if (falha) sug = sugestaoPadrao(s, s.conteudo.perguntas[escolhida]!, entrada, falha);
    else return { concluido: false, pergunta: await sugestoesPara(s, orgId, sessaoHash, a.id, escolhida), origem, aviso: null, progresso };
  }
  if (!guardada) await gravarSugestao(s, orgId, a, escolhida, sug);
  return {
    concluido: false,
    pergunta: cartao(escolhida, sug),
    origem,
    aviso: falha ? (s.conteudo.textos['ui.pergunta.sugestoesIndisponiveis'] ?? null) : null,
    progresso,
  };
}
