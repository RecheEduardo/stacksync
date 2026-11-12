// Direitos do titular (LGPD; Parte 4, 11.7 e 14.5): exportar tudo e excluir o espaço.
import type { FastifyInstance } from 'fastify';
import { COOKIE, exigirSessao } from '../http/sessao.ts';
import type { Servicos } from '../servicos/servicos.ts';

export async function rotasConta(api: FastifyInstance, s: Servicos) {
  api.get('/conta/exportacao', async (req, reply) => {
    const sessao = exigirSessao(req);
    const dados = await s.banco.comOrg(sessao.orgId, async (tx) => ({
      formato: 'stacksync.exportacao/1',
      geradoEm: new Date().toISOString(),
      // A chave da IA nunca sai: só provedor, modelo e endereço.
      ia: await tx.um('SELECT provedor, modelo, endpoint, so_sessao, testada_em FROM credenciais_ia WHERE org_id = $1', [sessao.orgId]),
      analises: await tx.q('SELECT id, nome, subnivel, profundidade, ideia, ideia_proposta, ideia_movimentos, ideia_decisao, arquivada, criada_em, atualizada_em FROM analises ORDER BY criada_em'),
      respostas: await tx.q('SELECT analise_id, pergunta, valor, origem, faixa_opcoes, faixa_sinal, fonte, medida_em, texto_livre, meio, versao, atualizada_em FROM respostas'),
      eventosResposta: await tx.q('SELECT analise_id, pergunta, antes, depois, apos_veredito, criado_em FROM eventos_resposta ORDER BY id'),
      interpretacoes: await tx.q('SELECT analise_id, pergunta, modo, texto, proposta, status, provedor, modelo, criada_em, decidida_em FROM interpretacoes'),
      percursos: await tx.q('SELECT analise_id, pergunta, origem, ordem_padrao, perfil, motivo, criado_em FROM percursos ORDER BY id'),
      sugestoes: await tx.q('SELECT analise_id, pergunta, opcoes, origem, escolha, criado_em FROM sugestoes_resposta'),
      vereditos: await tx.q('SELECT id, analise_id, criado_em, entrada, documento FROM vereditos ORDER BY criado_em'),
      raciocinios: await tx.q('SELECT veredito_id, versao, status, provedor, modelo, versao_prompt, blocos, descartados, sintese, candidatas, falha, criado_em FROM raciocinios'),
      links: await tx.q('SELECT veredito_id, expira_em, revogado_em, acessos, criado_em FROM links'),
      chamadasIa: await tx.q('SELECT analise_id, etapa, provedor, modelo, tokens_entrada, tokens_saida, latencia_ms, resultado, criado_em FROM chamadas_ia ORDER BY id'),
    }));
    reply.header('Content-Disposition', 'attachment; filename="stacksync-exportacao.json"').header('Cache-Control', 'no-store');
    return dados;
  });

  // Exclusão definitiva do espaço: expurgo da organização e de tudo que pertence a ela.
  api.delete('/conta', async (req, reply) => {
    const sessao = exigirSessao(req);
    s.chavesSessao.delete(sessao.tokenHash);
    await s.banco.sistema(async (tx) => {
      await tx.q("SELECT set_config('app.expurgo', 'on', true)");
      await tx.q('DELETE FROM organizacoes WHERE id = $1', [sessao.orgId]);
    });
    reply.clearCookie(COOKIE, { path: '/' }).status(204);
  });
}
