// Painel (T-01), enquadramento (T-02), revisão antes do veredito (T-08) e ideia prévia.
import { corpoAtualizarAnalise, corpoIdeiaConfirmada, corpoNovaAnalise, saidaIdeia } from '@stacksync/contracts';
import { avaliar, textoPergunta } from '@stacksync/engine';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { iso } from '../db/banco.ts';
import {
  alteradasAposVeredito,
  analiseDe,
  carregarAnalise,
  carregarRespostas,
  entradaAvaliacao,
  entradaDe,
  estadoDa,
  hoje,
  progressoDe,
  visaoResposta,
  type Analise,
  type PropostaIdeia,
} from '../dominio/analises.ts';
import { contextoIdeia, movimentosDaIdeia, tecnologiasDaIdeia } from '../ia/contexto.ts';
import { executar, type RegistroChamada } from '../ia/esteira.ts';
import { ErroIA, mensagensErroIA } from '../ia/tipos.ts';
import { validarIdeia } from '../ia/validadores.ts';
import { Problema, naoEncontrado } from '../http/erros.ts';
import { exigirSessao } from '../http/sessao.ts';
import { adaptadorDaOrg, lerCredencial } from '../servicos/credenciais.ts';
import { gravarChamadas, type Servicos } from '../servicos/servicos.ts';

const paramsId = z.object({ id: z.string() });

/** Obrigação datada mais próxima do último veredito (T-01): vencidas primeiro, depois as próximas. */
function obrigacaoProxima(lista: Array<{ texto: string; data: string | null; status: string }> | null) {
  const relevantes = (lista ?? []).filter((o) => o.data && (o.status === 'vencida' || o.status === 'proxima'));
  relevantes.sort((x, y) => (x.status === y.status ? x.data!.localeCompare(y.data!) : x.status === 'vencida' ? -1 : 1));
  const o = relevantes[0];
  return o ? { texto: o.texto, data: o.data, status: o.status } : null;
}

export async function rotasAnalises(api: FastifyInstance, s: Servicos) {
  const c = s.conteudo;

  function visaoIdeia(a: Analise) {
    if (!a.ideia) return null;
    const nome = (id: string) => c.movimentos.find((m) => m.id === id)?.nome ?? id;
    const tec = (id: string | null | undefined) => (id ? (c.tecnologias[id]?.nome ?? id) : null);
    const mov = (m: { id: string; parametro?: string | null | undefined }) => ({ id: m.id, nome: nome(m.id), parametro: m.parametro ?? null, parametroNome: tec(m.parametro) });
    return {
      texto: a.ideia,
      proposta: a.ideiaProposta ? { ...a.ideiaProposta, movimentos: a.ideiaProposta.movimentos.map(mov) } : null,
      movimentos: a.ideiaMovimentos?.map(mov) ?? null,
      decisao: a.ideiaDecisao,
      catalogo: movimentosDaIdeia(c, a.subnivel).map((m) => ({ id: m.id, nome: m.nome, descricao: m.descricao, parametro: m.id === 'fer.trocar' || m.id === 'fer.codigo_novo' })),
    };
  }

  const visaoAnalise = (a: Analise) => ({
    id: a.id,
    nome: a.nome,
    subnivel: a.subnivel,
    profundidade: a.profundidade,
    temIdeia: !!a.ideia,
    arquivada: a.arquivada,
    primeiroVereditoEm: a.primeiroVereditoEm,
    criadaEm: a.criadaEm,
    atualizadaEm: a.atualizadaEm,
  });

  // ------------------------------------------------------------ painel (T-01)
  api.get('/analises', async (req) => {
    const sessao = exigirSessao(req);
    const arquivadas = (req.query as { arquivadas?: string }).arquivadas === '1';
    const linhas = await s.banco.comOrg(sessao.orgId, (tx) =>
      tx.q(
        `SELECT a.*, v.id AS v_id, v.categoria AS v_categoria, v.indice_lo AS v_lo, v.indice_hi AS v_hi, v.confianca AS v_confianca,
           v.veredito_ideia AS v_ideia, v.variante_plano AS v_plano, v.versao_calibracao AS v_calibracao, v.criado_em AS v_criado,
           v.documento->'obrigacoes' AS v_obrigacoes,
           (SELECT count(*)::int FROM respostas r WHERE r.analise_id = a.id) AS respondidas
         FROM analises a
         LEFT JOIN LATERAL (SELECT * FROM vereditos WHERE analise_id = a.id ORDER BY criado_em DESC LIMIT 1) v ON true
         WHERE a.arquivada = $1 ORDER BY a.atualizada_em DESC LIMIT 200`,
        [arquivadas],
      ),
    );
    return {
      analises: linhas.map((l) => ({
        ...visaoAnalise(analiseDe(l)),
        respondidas: l.respondidas as number,
        ultimoVeredito: l.v_id
          ? {
              id: l.v_id as string,
              categoria: l.v_categoria as string,
              indice: { lo: l.v_lo as number, hi: l.v_hi as number },
              confianca: l.v_confianca as string,
              vereditoIdeia: (l.v_ideia as string | null) ?? null,
              variantePlano: l.v_plano as string,
              versaoCalibracao: l.v_calibracao as string,
              criadoEm: iso(l.v_criado),
              obrigacaoProxima: obrigacaoProxima(l.v_obrigacoes as Array<{ texto: string; data: string | null; status: string }> | null),
            }
          : null,
      })),
      calibracaoVigente: c.calibracao.versao,
    };
  });

  // ------------------------------------------------------------ enquadramento (T-02)
  api.post('/analises', async (req, reply) => {
    const sessao = exigirSessao(req);
    const corpo = corpoNovaAnalise.parse(req.body);
    // Sem IA conectada, a análise não começa (RF-55, D-16).
    const ia = await lerCredencial(s, sessao.orgId, sessao.tokenHash);
    if (!ia) throw new Problema(409, 'ia-nao-conectada', 'Conecte a IA para começar', 'A análise usa a IA que você conectar.');
    if (!ia.cred) throw new Problema(409, 'ia-chave-da-sessao', 'Informe a chave de novo', 'A chave valia só para a sessão anterior.');
    const a = await s.banco.comOrg(sessao.orgId, async (tx) =>
      analiseDe(
        (await tx.um(
          `INSERT INTO analises (org_id, nome, subnivel, profundidade, ideia, versao_conteudo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [sessao.orgId, corpo.nome, corpo.subnivel, corpo.profundidade, corpo.ideia || null, c.hash],
        ))!,
      ),
    );
    reply.status(201);
    return { analise: visaoAnalise(a) };
  });

  api.get('/analises/:id', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      const respostas = await carregarRespostas(tx, a.id);
      const alteradas = await alteradasAposVeredito(tx, a.id);
      const entrada = entradaDe(respostas, alteradas);
      const vereditos = await tx.q(
        'SELECT id, categoria, indice_lo, indice_hi, confianca, criado_em FROM vereditos WHERE analise_id = $1 ORDER BY criado_em DESC LIMIT 20',
        [a.id],
      );
      return {
        analise: visaoAnalise(a),
        ideia: visaoIdeia(a),
        progresso: progressoDe(c, a, entrada),
        // Respostas anteriores, resumidas e editáveis (T-04), na ordem do catálogo.
        respostas: c.ordemPerguntas
          .filter((pid) => respostas[pid])
          .map((pid) => {
            const p = c.perguntas[pid]!;
            return { pergunta: pid, texto: textoPergunta(c, p, a.subnivel), ambito: p.ambito, resposta: visaoResposta(c, p, respostas[pid]!, alteradas) };
          }),
        vereditos: vereditos.map((v) => ({
          id: v.id as string,
          categoria: v.categoria as string,
          indice: { lo: v.indice_lo as number, hi: v.indice_hi as number },
          confianca: v.confianca as string,
          criadoEm: iso(v.criado_em),
        })),
        alteradasAposVeredito: alteradas.size,
      };
    });
  });

  api.patch('/analises/:id', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const corpo = corpoAtualizarAnalise.parse(req.body);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      // Trocar de nível a qualquer momento, sem perder respostas (RF-05). Mudar a ideia descarta a leitura anterior.
      const ideiaMudou = corpo.ideia !== undefined && (corpo.ideia || null) !== a.ideia;
      const r = await tx.um(
        `UPDATE analises SET nome = coalesce($2, nome), profundidade = coalesce($3, profundidade),
           ideia = CASE WHEN $4 THEN $5 ELSE ideia END,
           ideia_proposta = CASE WHEN $4 THEN NULL ELSE ideia_proposta END,
           ideia_movimentos = CASE WHEN $4 THEN NULL ELSE ideia_movimentos END,
           ideia_decisao = CASE WHEN $4 THEN NULL ELSE ideia_decisao END,
           atualizada_em = now()
         WHERE id = $1 RETURNING *`,
        [a.id, corpo.nome ?? null, corpo.profundidade ?? null, ideiaMudou, corpo.ideia || null],
      );
      const nova = analiseDe(r!);
      return { analise: visaoAnalise(nova), ideia: visaoIdeia(nova) };
    });
  });

  api.post('/analises/:id/arquivar', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const { arquivada } = z.strictObject({ arquivada: z.boolean() }).parse(req.body);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const r = await tx.um('UPDATE analises SET arquivada = $2, atualizada_em = now() WHERE id = $1 RETURNING *', [id, arquivada]);
      if (!r) throw naoEncontrado('Análise');
      return { analise: visaoAnalise(analiseDe(r)) };
    });
  });

  // Exclusão pedida pelo usuário: a única via que apaga vereditos (expurgo, 11.4).
  api.delete('/analises/:id', async (req, reply) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const existe = await s.banco.comOrg(sessao.orgId, (tx) => carregarAnalise(tx, id));
    if (!existe) throw naoEncontrado('Análise');
    await s.banco.sistema(async (tx) => {
      await tx.q("SELECT set_config('app.expurgo', 'on', true)");
      await tx.q('DELETE FROM analises WHERE id = $1 AND org_id = $2', [id, sessao.orgId]);
    });
    reply.status(204);
  });

  // ------------------------------------------------------------ revisão antes do veredito (T-08)
  api.get('/analises/:id/revisao', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const { a, respostas, entrada, pendentes } = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      const respostas = await carregarRespostas(tx, a.id);
      const entrada = entradaDe(respostas, await alteradasAposVeredito(tx, a.id));
      const pendentes = await tx.q("SELECT id, pergunta, texto, proposta FROM interpretacoes WHERE analise_id = $1 AND status = 'proposta' ORDER BY criada_em", [a.id]);
      return { a, respostas, entrada, pendentes };
    });
    const estado = estadoDa(c, a, entrada);
    const composicao = { medida: 0, estimativa: 0, inferencia: 0, desconhecida: 0 };
    for (const r of Object.values(respostas)) if (r.origem in composicao) composicao[r.origem as keyof typeof composicao]++;
    // Quais lacunas podem mudar o resultado: o motor classifica, mas nada do veredito é exposto aqui.
    const doc = avaliar(entradaAvaliacao(a, entrada, hoje()), c);
    const decidiriam = new Set(doc.perguntasDeMaiorValor.map((p) => p.pergunta));
    const descobertos = (Object.keys(estado.fatores) as Array<keyof typeof estado.fatores>).filter((f) => estado.fatores[f] === 'descoberto');
    // Lacunas: respostas "não sei" e perguntas ainda abertas que podem mudar o resultado ou cobririam um fator de peso 5.
    const desconhecidas = estado.perguntaveis
      .filter((pid) => {
        const r = respostas[pid];
        if (r) return r.origem === 'desconhecida';
        return decidiriam.has(pid) || (c.perguntas[pid]!.cobre ?? []).some((f) => descobertos.includes(f));
      })
      .map((pid) => {
        const p = c.perguntas[pid]!;
        return {
          pergunta: pid,
          texto: textoPergunta(c, p, a.subnivel),
          respondida: !!respostas[pid],
          pesoMaximo: !!p.cobre?.length,
          podeMudar: decidiriam.has(pid),
          comoDescobrir: p.comoDescobrir ?? null,
          quemPodeSaber: p.quemPodeSaber ?? null,
        };
      });
    return {
      analise: visaoAnalise(a),
      composicao,
      respondidas: Object.keys(respostas).length,
      desconhecidas,
      fatoresDescobertos: descobertos.map((f) => c.estrutura.fatoresPeso5[f]),
      interpretacoesPendentes: pendentes.map((p) => ({ id: p.id as string, pergunta: p.pergunta as string, texto: p.texto as string, proposta: p.proposta })),
      ideia: visaoIdeia(a),
    };
  });

  // ------------------------------------------------------------ ideia prévia: leitura pela IA e confirmação
  api.post('/analises/:id/ideia/interpretacao', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const { a, entrada } = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      return { a, entrada: entradaDe(await carregarRespostas(tx, a.id), new Set()) };
    });
    if (!a.ideia) throw new Problema(422, 'sem-ideia', 'Esta análise não tem ideia prévia');
    const registros: RegistroChamada[] = [];
    const ferramenta = c.estrutura.subniveis[a.subnivel].modelo === 'ferramenta';
    let proposta: PropostaIdeia;
    try {
      const ad = await adaptadorDaOrg(s, sessao.orgId, sessao.tokenHash);
      const ctx = contextoIdeia(c, a.subnivel, a.ideia, entrada);
      const r = await executar(
        c,
        ad,
        { etapa: 'ideia', schema: saidaIdeia, nomeSchema: 'ideia', usuario: ctx.usuario, dados: ctx.dados, esforco: 'medio', maxTokens: 6000 },
        (x) => void registros.push(x),
      );
      const v = validarIdeia(c, r.saida, ctx.dados, ferramenta);
      proposta = { ...v, provedor: ad.provedor, modelo: r.modelo, versaoPrompt: r.versaoPrompt, falha: null };
    } catch (e) {
      if (e instanceof Problema && e.status !== 409) throw e;
      const falha = e instanceof ErroIA ? mensagensErroIA[e.tipo] : e instanceof Problema ? e.titulo : mensagensErroIA.outro;
      proposta = { movimentos: [], explicacao: '', foraDoCatalogo: [], descartados: [], provedor: null, modelo: null, versaoPrompt: null, falha };
    }
    const nova = await s.banco.comOrg(sessao.orgId, async (tx) => {
      await gravarChamadas(tx, sessao.orgId, a.id, registros);
      return analiseDe((await tx.um('UPDATE analises SET ideia_proposta = $2::jsonb WHERE id = $1 RETURNING *', [a.id, JSON.stringify(proposta)]))!);
    });
    return { ideia: visaoIdeia(nova) };
  });

  api.post('/analises/:id/ideia/decisao', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const corpo = corpoIdeiaConfirmada.parse(req.body);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      if (!a.ideia) throw new Problema(422, 'sem-ideia', 'Esta análise não tem ideia prévia');
      const ferramenta = c.estrutura.subniveis[a.subnivel].modelo === 'ferramenta';
      const permitidos = new Set(movimentosDaIdeia(c, a.subnivel).map((m) => m.id));
      const tecnologias = new Set(tecnologiasDaIdeia(c, entradaDe(await carregarRespostas(tx, a.id), new Set())).map((t) => t.id));
      const movimentos = corpo.decisao === 'descartada' ? [] : corpo.movimentos;
      for (const m of movimentos) {
        if (!permitidos.has(m.id)) throw new Problema(422, 'movimento-invalido', 'Movimento fora do catálogo deste nível', m.id);
        const pede = ferramenta && (m.id === 'fer.trocar' || m.id === 'fer.codigo_novo');
        if (pede && (!m.parametro || !tecnologias.has(m.parametro))) throw new Problema(422, 'movimento-invalido', 'Escolha uma tecnologia da base de referência', m.id);
      }
      if (corpo.decisao !== 'descartada' && !movimentos.length) throw new Problema(422, 'movimento-invalido', 'Escolha ao menos um movimento ou descarte a leitura');
      if (ferramenta && movimentos.length > 1) throw new Problema(422, 'movimento-invalido', 'Uma ideia sobre a ferramenta é um movimento só');
      const r = await tx.um('UPDATE analises SET ideia_movimentos = $2::jsonb, ideia_decisao = $3, atualizada_em = now() WHERE id = $1 RETURNING *', [
        a.id,
        JSON.stringify(movimentos.map((m) => ({ id: m.id, parametro: m.parametro ?? null }))),
        corpo.decisao,
      ]);
      return { ideia: visaoIdeia(analiseDe(r!)) };
    });
  });
}
