// Questionário adaptativo (T-04, T-05, T-06). Nenhuma rota daqui devolve veredito ou resultado
// parcial (RN-81, IV-01): o progresso é por tempo e por âmbito.
import { corpoDecisaoInterpretacao, corpoInterpretacao, corpoPonte, corpoResposta, saidaInterpretacao, type CorpoResposta } from '@stacksync/contracts';
import { converterPontes, opcoesDaPergunta } from '@stacksync/engine';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  alteradasAposVeredito,
  carregarAnalise,
  carregarRespostas,
  entradaDe,
  estadoDa,
  progressoDe,
  visaoResposta,
} from '../dominio/analises.ts';
import { gravarResposta, validarResposta } from '../dominio/respostas.ts';
import { contextoInterpretacao } from '../ia/contexto.ts';
import { executar, type RegistroChamada } from '../ia/esteira.ts';
import { ErroIA, mensagensErroIA } from '../ia/tipos.ts';
import { validarInterpretacao } from '../ia/validadores.ts';
import { Problema, naoEncontrado } from '../http/erros.ts';
import { exigirSessao } from '../http/sessao.ts';
import { adaptadorDaOrg } from '../servicos/credenciais.ts';
import { proximaPergunta, sugestoesPara } from '../servicos/percurso.ts';
import { gravarChamadas, type Servicos } from '../servicos/servicos.ts';

const paramsPergunta = z.object({ id: z.string(), pid: z.string().max(40) });

export async function rotasQuestionario(api: FastifyInstance, s: Servicos) {
  const c = s.conteudo;
  // Protege o servidor e a chave do usuário de laços; no desenvolvimento, folga para as jornadas automáticas.
  const limiteIa = { config: { rateLimit: { max: s.config.producao ? 40 : 600, timeWindow: '1 minute' } } };

  api.post('/analises/:id/proxima', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { pular } = z.strictObject({ pular: z.array(z.string().max(40)).max(80).optional() }).parse(req.body ?? {});
    return proximaPergunta(s, sessao.orgId, sessao.tokenHash, id, pular ?? []);
  });

  api.get('/analises/:id/perguntas/:pid', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const { id, pid } = paramsPergunta.parse(req.params);
    return { pergunta: await sugestoesPara(s, sessao.orgId, sessao.tokenHash, id, pid) };
  });

  async function salvar(orgId: string, analiseId: string, pid: string, corpo: CorpoResposta, versaoEsperada: number | null) {
    return s.banco.comOrg(orgId, async (tx) => {
      const a = await carregarAnalise(tx, analiseId);
      if (!a) throw naoEncontrado('Análise');
      const p = c.perguntas[pid];
      if (!p || !p.subniveis.includes(a.subnivel)) throw naoEncontrado('Pergunta');
      const respostas = await carregarRespostas(tx, a.id);
      const alteradas = await alteradasAposVeredito(tx, a.id);
      const entrada = entradaDe(respostas, alteradas);
      const estado = estadoDa(c, a, entrada);
      if (!estado.aplicaveis.includes(pid) && !respostas[pid]) throw new Problema(409, 'pergunta-fora-do-percurso', 'Esta pergunta não se aplica às respostas atuais');
      validarResposta(c, a, p, corpo, entrada);
      const g = await gravarResposta(tx, orgId, a, pid, corpo, versaoEsperada);
      if (g.aposVeredito) alteradas.add(pid);
      const novas = entradaDe({ ...respostas, [pid]: g.resposta }, alteradas);
      return { resposta: visaoResposta(c, p, g.resposta, alteradas), aposVeredito: g.aposVeredito, progresso: progressoDe(c, a, novas) };
    });
  }

  // Salvamento contínuo com concorrência otimista (If-Match com a versão conhecida; 0 = nova).
  api.put('/analises/:id/respostas/:pid', async (req) => {
    const sessao = exigirSessao(req);
    const { id, pid } = paramsPergunta.parse(req.params);
    const corpo = corpoResposta.parse(req.body);
    const ifMatch = req.headers['if-match'];
    const versao = typeof ifMatch === 'string' && /^"?\d+"?$/.test(ifMatch) ? Number(ifMatch.replace(/"/g, '')) : (corpo.versao ?? null);
    return salvar(sessao.orgId, id, pid, corpo, versao);
  });

  // Perguntas-ponte: conversão determinística em faixa, com explicação (RN-80). Não grava nada.
  api.post('/analises/:id/perguntas/:pid/pontes', async (req) => {
    const sessao = exigirSessao(req);
    const { id, pid } = paramsPergunta.parse(req.params);
    const corpo = corpoPonte.parse(req.body);
    const a = await s.banco.comOrg(sessao.orgId, (tx) => carregarAnalise(tx, id));
    if (!a) throw naoEncontrado('Análise');
    const p = c.perguntas[pid];
    if (!p?.pontes?.length) throw naoEncontrado('Pergunta-ponte');
    const conv = converterPontes(c, p, corpo.respostas);
    if (!conv) throw new Problema(422, 'ponte-sem-resposta', 'Responda ao menos uma pergunta-ponte');
    return conv;
  });

  // "Outra resposta" e "não sei, mas...": a IA propõe uma leitura; nada vale sem confirmação (RN-79).
  api.post('/analises/:id/perguntas/:pid/interpretacoes', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const { id, pid } = paramsPergunta.parse(req.params);
    const corpo = corpoInterpretacao.parse(req.body);
    const { a, entrada } = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const a = await carregarAnalise(tx, id);
      if (!a) throw naoEncontrado('Análise');
      return { a, entrada: entradaDe(await carregarRespostas(tx, a.id), new Set()) };
    });
    const p = c.perguntas[pid];
    if (!p || !p.subniveis.includes(a.subnivel)) throw naoEncontrado('Pergunta');
    const ids = opcoesDaPergunta(c, p, entrada).map((o) => o.id);
    const registros: RegistroChamada[] = [];
    let proposta: { opcoes: string[]; explicacao: string; entendeu: boolean } | null = null;
    let falha: string | null = null;
    let meta = { provedor: null as string | null, modelo: null as string | null, versaoPrompt: null as string | null };
    try {
      const ad = await adaptadorDaOrg(s, sessao.orgId, sessao.tokenHash);
      const ctx = contextoInterpretacao(c, a.subnivel, p, entrada, corpo.texto, corpo.modo);
      const r = await executar(
        c,
        ad,
        { etapa: 'RG-01', schema: saidaInterpretacao, nomeSchema: 'interpretacao', usuario: ctx.usuario, dados: ctx.dados, esforco: 'baixo', maxTokens: 4000 },
        (x) => void registros.push(x),
      );
      meta = { provedor: ad.provedor, modelo: r.modelo, versaoPrompt: r.versaoPrompt };
      const v = validarInterpretacao(c, r.saida, p, ids, ctx.usuario);
      if (v.ok) proposta = { opcoes: v.opcoes, explicacao: v.explicacao, entendeu: v.entendeu };
      else falha = `A leitura não passou na verificação: ${v.motivo}`;
    } catch (e) {
      if (e instanceof Problema && e.status !== 409) throw e;
      falha = e instanceof ErroIA ? mensagensErroIA[e.tipo] : e instanceof Problema ? e.titulo : mensagensErroIA.outro;
    }
    const linha = await s.banco.comOrg(sessao.orgId, async (tx) => {
      await gravarChamadas(tx, sessao.orgId, a.id, registros);
      return tx.um<{ id: string }>(
        `INSERT INTO interpretacoes (org_id, analise_id, pergunta, modo, texto, proposta, status, falha, provedor, modelo, versao_prompt)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11) RETURNING id`,
        [sessao.orgId, a.id, pid, corpo.modo, corpo.texto, proposta ? JSON.stringify(proposta) : null, proposta ? 'proposta' : 'falha', falha, meta.provedor, meta.modelo, meta.versaoPrompt],
      );
    });
    const rotulo = (o: string) => opcoesDaPergunta(c, p, entrada).find((x) => x.id === o)?.rotulo ?? o;
    return {
      id: linha!.id,
      proposta: proposta ? { ...proposta, rotulos: proposta.opcoes.map(rotulo) } : null,
      falha,
      // Com falha do provedor, o usuário escolhe a faixa vendo as opções (RF-15).
      opcoes: opcoesDaPergunta(c, p, entrada),
    };
  });

  api.post('/analises/:id/interpretacoes/:iid/decisao', async (req) => {
    const sessao = exigirSessao(req);
    const { id, iid } = z.object({ id: z.string(), iid: z.string().uuid() }).parse(req.params);
    const corpo = corpoDecisaoInterpretacao.parse(req.body);
    const it = await s.banco.comOrg(sessao.orgId, (tx) =>
      tx.um<{ pergunta: string; modo: string; texto: string; proposta: { opcoes: string[] } | null; status: string }>(
        'SELECT pergunta, modo, texto, proposta, status FROM interpretacoes WHERE id = $1 AND analise_id = $2',
        [iid, id],
      ),
    );
    if (!it) throw naoEncontrado('Interpretação');
    if (it.status !== 'proposta' && it.status !== 'falha') throw new Problema(409, 'ja-decidida', 'Esta interpretação já foi decidida');
    const marcar = (status: string) =>
      s.banco.comOrg(sessao.orgId, (tx) => tx.q('UPDATE interpretacoes SET status = $2, decidida_em = now() WHERE id = $1', [iid, status]));
    if (corpo.decisao === 'descartada') {
      await marcar('descartada');
      return { decisao: 'descartada', resposta: null };
    }
    const opcoes = corpo.decisao === 'ajustada' ? (corpo.opcoes ?? []) : (it.proposta?.opcoes ?? []);
    if (!opcoes.length) throw new Problema(422, 'sem-opcao', 'Escolha ao menos uma opção');
    const p = c.perguntas[it.pergunta]!;
    // "Outra resposta" com uma opção é a resposta do próprio usuário; faixa ou "não sei, mas..." é inferência.
    const unica = opcoes.length === 1 || p.tipo === 'multipla';
    const corpoResp: CorpoResposta =
      it.modo === 'outra' && unica
        ? { valor: p.tipo === 'multipla' ? opcoes : opcoes[0]!, origem: 'estimativa', textoLivre: it.texto, meio: 'livre' }
        : p.tipo === 'multipla'
          ? { valor: opcoes, origem: 'inferencia', textoLivre: it.texto, meio: 'livre' }
          : { valor: null, origem: 'inferencia', faixaOpcoes: opcoes, textoLivre: it.texto, meio: 'livre' };
    const r = await salvar(sessao.orgId, id, it.pergunta, corpoResp, null);
    await marcar(corpo.decisao);
    return { decisao: corpo.decisao, ...r };
  });
}
