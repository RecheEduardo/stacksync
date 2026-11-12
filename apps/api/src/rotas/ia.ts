// Conectar a IA do usuário (RF-48, T-23): chave só de escrita, teste com saída estruturada antes de
// salvar, listagem de modelos pelo provedor e consumo visível da própria chave (10.5).
import { corpoCredencial, corpoListarModelos } from '@stacksync/contracts';
import type { FastifyInstance } from 'fastify';
import { listarModelos, type Credencial } from '../ia/fabrica.ts';
import { ErroIA, mensagensErroIA } from '../ia/tipos.ts';
import { Problema } from '../http/erros.ts';
import { exigirSessao } from '../http/sessao.ts';
import { lerCredencial, salvarCredencial, testarCredencial } from '../servicos/credenciais.ts';
import type { Servicos } from '../servicos/servicos.ts';

/** Modelo sugerido por provedor, quando aparece na lista do próprio provedor. */
const RECOMENDADOS: Record<string, string[]> = {
  anthropic: ['claude-opus-5-5', 'claude-sonnet-5-5'],
  openai: [],
  google: [],
  compativel: [],
  simulado: ['simulado-1'],
};

export async function rotasIa(api: FastifyInstance, s: Servicos) {
  const limiteIa = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

  async function chaveOuGuardada(orgId: string, tokenHash: string, provedor: string, chave: string | undefined): Promise<string> {
    if (chave) return chave.trim();
    if (provedor === 'simulado') return '';
    const lida = await lerCredencial(s, orgId, tokenHash);
    if (lida?.cred && lida.cred.provedor === provedor) return lida.cred.chave;
    if (provedor === 'compativel') return '';
    throw new Problema(422, 'ia-sem-chave', 'Informe a chave do provedor');
  }

  api.post('/ia/modelos', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const corpo = corpoListarModelos.parse(req.body);
    const chave = await chaveOuGuardada(sessao.orgId, sessao.tokenHash, corpo.provedor, corpo.chave);
    try {
      const modelos = await listarModelos(corpo.provedor, chave, corpo.endpoint ?? null, s.config);
      return { modelos, recomendado: RECOMENDADOS[corpo.provedor]!.find((m) => modelos.includes(m)) ?? null };
    } catch (e) {
      const tipo = e instanceof ErroIA ? e.tipo : 'outro';
      throw new Problema(422, `ia-${tipo.replace(/_/g, '-')}`, mensagensErroIA[tipo]);
    }
  });

  api.put('/ia', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const corpo = corpoCredencial.parse(req.body);
    if (corpo.provedor === 'simulado' && !s.config.permitirSimulado) throw new Problema(422, 'ia-simulado', 'O provedor simulado só existe em desenvolvimento.');
    const cred: Credencial = {
      provedor: corpo.provedor,
      modelo: corpo.modelo.trim(),
      chave: await chaveOuGuardada(sessao.orgId, sessao.tokenHash, corpo.provedor, corpo.chave),
      endpoint: corpo.provedor === 'compativel' ? (corpo.endpoint ?? null) : null,
    };
    await testarCredencial(s, sessao.orgId, cred);
    await salvarCredencial(s, sessao.orgId, sessao.tokenHash, cred, !!corpo.soSessao);
    return { ia: (await lerCredencial(s, sessao.orgId, sessao.tokenHash))!.visao };
  });

  api.post('/ia/teste', limiteIa, async (req) => {
    const sessao = exigirSessao(req);
    const lida = await lerCredencial(s, sessao.orgId, sessao.tokenHash);
    if (!lida) throw new Problema(409, 'ia-nao-conectada', 'Conecte a IA para continuar');
    if (!lida.cred) throw new Problema(409, 'ia-chave-da-sessao', 'Informe a chave de novo', 'A chave valia só para a sessão anterior.');
    await testarCredencial(s, sessao.orgId, lida.cred);
    await s.banco.comOrg(sessao.orgId, (tx) => tx.q('UPDATE credenciais_ia SET testada_em = now() WHERE org_id = $1', [sessao.orgId]));
    return { ia: (await lerCredencial(s, sessao.orgId, sessao.tokenHash))!.visao };
  });

  api.delete('/ia', async (req) => {
    const sessao = exigirSessao(req);
    s.chavesSessao.delete(sessao.tokenHash);
    await s.banco.comOrg(sessao.orgId, (tx) => tx.q('DELETE FROM credenciais_ia WHERE org_id = $1', [sessao.orgId]));
    return { ia: null };
  });

  // Consumo da própria chave (10.5): só metadados, sem conteúdo.
  api.get('/ia/consumo', async (req) => {
    const sessao = exigirSessao(req);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const total = await tx.um<{ chamadas: number; entrada: number; saida: number }>(
        `SELECT count(*)::int AS chamadas, coalesce(sum(tokens_entrada), 0)::int AS entrada, coalesce(sum(tokens_saida), 0)::int AS saida
         FROM chamadas_ia WHERE criado_em > now() - interval '13 months'`,
      );
      const porEtapa = await tx.q(
        `SELECT etapa, count(*)::int AS chamadas, coalesce(sum(tokens_entrada), 0)::int AS entrada, coalesce(sum(tokens_saida), 0)::int AS saida,
           count(*) FILTER (WHERE resultado NOT LIKE 'ok%')::int AS falhas
         FROM chamadas_ia WHERE criado_em > now() - interval '13 months' GROUP BY etapa ORDER BY etapa`,
      );
      const porAnalise = await tx.q(
        `SELECT a.id, a.nome, count(c.*)::int AS chamadas, coalesce(sum(c.tokens_entrada), 0)::int AS entrada, coalesce(sum(c.tokens_saida), 0)::int AS saida
         FROM chamadas_ia c JOIN analises a ON a.id = c.analise_id
         WHERE c.criado_em > now() - interval '13 months' GROUP BY a.id, a.nome ORDER BY max(c.criado_em) DESC LIMIT 50`,
      );
      return { total, porEtapa, porAnalise };
    });
  });
}
