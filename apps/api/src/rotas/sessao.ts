// Sessão, estado do usuário e pacote público do catálogo (T-03, T-23).
import type { FastifyInstance } from 'fastify';
import { criarSessao } from '../http/sessao.ts';
import { lerCredencial } from '../servicos/credenciais.ts';
import type { Servicos } from '../servicos/servicos.ts';

export async function rotasSessao(api: FastifyInstance, s: Servicos) {
  const eu = async (orgId: string | null, tokenHash: string | null) => ({
    sessao: !!orgId,
    ia: orgId && tokenHash ? ((await lerCredencial(s, orgId, tokenHash))?.visao ?? null) : null,
    simuladoDisponivel: s.config.permitirSimulado,
    conteudo: { versao: s.conteudo.versao, hash: s.conteudo.hash, calibracao: s.conteudo.calibracao.versao },
  });

  api.get('/eu', async (req) => eu(req.sessao?.orgId ?? null, req.sessao?.tokenHash ?? null));

  api.post('/sessao', { config: { rateLimit: { max: 20, timeWindow: '1 hour' } } }, async (req, reply) => {
    const sessao = req.sessao ?? (await criarSessao(s, reply));
    return eu(sessao.orgId, sessao.tokenHash);
  });

  // Pacote público do catálogo: estrutura, textos, eixos, calibração, movimentos e evidências.
  // Imutável por versão: o hash do conteúdo é o ETag (Parte 4, 12.2).
  const c = s.conteudo;
  const catalogo = {
    versao: c.versao,
    hash: c.hash,
    estrutura: {
      subniveis: Object.fromEntries(
        Object.entries(c.estrutura.subniveis).map(([id, x]) => [id, { ramo: x.ramo, rotulo: x.rotulo, descricao: x.descricao, modelo: x.modelo, naoMudar: x.naoMudar }]),
      ),
      profundidades: c.estrutura.profundidades,
      ambitos: c.estrutura.ambitos,
      fatoresPeso5: c.estrutura.fatoresPeso5,
    },
    textos: c.textos,
    eixos: Object.fromEntries(
      Object.entries(c.modelos).map(([id, m]) => [
        id,
        m.eixos.map((e) => ({ id: e.id, nome: e.nome, perguntaGuia: e.perguntaGuia, ancorasN: e.necessidade.ancoras, ancorasC: e.capacidade.ancoras, evidencias: e.evidencias })),
      ]),
    ),
    calibracao: {
      versao: c.calibracao.versao,
      data: c.calibracao.data,
      notas: c.calibracao.notas,
      pesos: c.calibracao.pesos,
      tolerancias: c.calibracao.tolerancias,
      eMax: c.calibracao.eMax,
      limiarCategoria: c.calibracao.limiarCategoria,
      materialidade: c.calibracao.materialidade,
      faixasAderencia: c.calibracao.faixasAderencia,
      confianca: c.calibracao.confianca,
    },
    movimentos: c.movimentos.map((m) => ({
      id: m.id,
      modelo: m.modelo,
      nome: m.nome,
      descricao: m.descricao,
      subniveis: m.subniveis,
      apenasIdeia: !!m.apenasIdeia,
      parametro: m.id === 'fer.trocar' || m.id === 'fer.codigo_novo',
    })),
    tecnologias: Object.values(c.tecnologias)
      .map((t) => ({ id: t.id, nome: t.nome, categorias: t.categorias }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    categoriasFerramenta: c.categoriasFerramenta,
    evidencias: Object.values(c.evidencias),
    regras: Object.values(c.regras),
    eol: { fonte: c.eol.fonte, consultadoEm: c.eol.consultadoEm },
  };
  api.get('/catalogo', async (req, reply) => {
    const etag = `"${c.hash.slice(7, 39)}"`;
    if (req.headers['if-none-match'] === etag) return reply.status(304).send();
    reply.header('ETag', etag).header('Cache-Control', 'public, max-age=3600');
    return catalogo;
  });

}
