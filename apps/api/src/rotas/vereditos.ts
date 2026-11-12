// Resultado (T-09), raciocínio guiado por SSE (RG-10), relatório (T-18) e links de leitura.
import { corpoLink } from '@stacksync/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { iso, type Tx } from '../db/banco.ts';
import { relatorioMarkdown } from '../dominio/relatorio.ts';
import { naoEncontrado } from '../http/erros.ts';
import { exigirSessao } from '../http/sessao.ts';
import { hashToken, novoToken } from '../seguranca/cifra.ts';
import type { EventoSse } from '../servicos/geracoes.ts';
import { eventosDe, iniciarRaciocinio, ultimoRaciocinio, ultimoRaciocinioPronto, type Raciocinio } from '../servicos/raciocinio.ts';
import type { Servicos } from '../servicos/servicos.ts';
import { carregarVeredito, gerarVeredito } from '../servicos/veredito.ts';

const paramsId = z.object({ id: z.string() });

function nomeArquivo(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);
  return `${base || 'analise'}-stacksync.md`;
}

export async function rotasVereditos(api: FastifyInstance, s: Servicos) {
  const c = s.conteudo;

  api.post('/analises/:id/vereditos', async (req, reply) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const r = await gerarVeredito(s, sessao.orgId, id);
    reply.status(r.novo ? 201 : 200);
    return r;
  });

  const linksDe = (tx: Tx, vereditoId: string) =>
    tx
      .q('SELECT id, expira_em, revogado_em, acessos, criado_em FROM links WHERE veredito_id = $1 ORDER BY criado_em DESC', [vereditoId])
      .then((ls) =>
        ls.map((l) => ({ id: l.id as string, expiraEm: iso(l.expira_em), revogadoEm: iso(l.revogado_em), acessos: l.acessos as number, criadoEm: iso(l.criado_em) })),
      );

  api.get('/vereditos/:id', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    return s.banco.comOrg(sessao.orgId, async (tx) => {
      const v = await carregarVeredito(tx, id);
      if (!v) throw naoEncontrado('Veredito');
      const ultimo = await tx.um<{ id: string }>('SELECT id FROM vereditos WHERE analise_id = $1 ORDER BY criado_em DESC LIMIT 1', [v.analiseId]);
      return {
        id: v.id,
        criadoEm: v.criadoEm,
        ehOMaisRecente: ultimo?.id === v.id,
        analise: { id: v.analise.id, nome: v.analise.nome, subnivel: v.analise.subnivel, profundidade: v.analise.profundidade },
        documento: v.documento,
        raciocinio: await ultimoRaciocinio(tx, v.id),
        links: await linksDe(tx, v.id),
      };
    });
  });

  // ------------------------------------------------------------ raciocínio guiado (SSE)
  function abrirSse(req: FastifyRequest, reply: FastifyReply) {
    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    const enviar = (e: { id: number; tipo: string; dados: unknown }) => res.write(`id: ${e.id}\nevent: ${e.tipo}\ndata: ${JSON.stringify(e.dados)}\n\n`);
    const ping = setInterval(() => res.write(': ping\n\n'), 15_000);
    const fechar = () => {
      clearInterval(ping);
      res.end();
    };
    req.raw.on('close', () => clearInterval(ping));
    return { enviar, fechar, aoFechar: (fn: () => void) => req.raw.on('close', fn) };
  }

  const replay = (r: Raciocinio, sse: ReturnType<typeof abrirSse>) => {
    eventosDe(r).forEach((e, i) => sse.enviar({ id: i + 1, ...e }));
    sse.fechar();
  };

  api.get('/vereditos/:id/raciocinio/eventos', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const desde = Number(req.headers['last-event-id'] ?? 0) || 0;
    const ultimo = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const v = await tx.um('SELECT id FROM vereditos WHERE id = $1', [/^[0-9a-f-]{36}$/i.test(id) ? id : '00000000-0000-0000-0000-000000000000']);
      if (!v) throw naoEncontrado('Veredito');
      return ultimoRaciocinio(tx, id);
    });
    if (ultimo && ultimo.status !== 'gerando') return replay(ultimo, abrirSse(req, reply));
    if (!s.geracoes.ativa(id)) {
      if (ultimo) {
        // Geração interrompida (por exemplo, reinício do servidor): fica registrada como falha.
        const r = await s.banco.comOrg(sessao.orgId, async (tx) => {
          await tx.q("UPDATE raciocinios SET status = 'falhou', falha = $3, concluido_em = now() WHERE veredito_id = $1 AND versao = $2", [
            id,
            ultimo.versao,
            'A geração foi interrompida. Tente de novo.',
          ]);
          return ultimoRaciocinio(tx, id);
        });
        return replay(r!, abrirSse(req, reply));
      }
      await iniciarRaciocinio(s, sessao.orgId, sessao.tokenHash, id);
    }
    const sse = abrirSse(req, reply);
    const cancelar = s.geracoes.assinar(id, desde, (e: EventoSse) => (e.tipo === '__fim' ? sse.fechar() : sse.enviar(e)));
    if (!cancelar) return sse.fechar();
    sse.aoFechar(cancelar);
  });

  api.post('/vereditos/:id/raciocinio/regenerar', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const v = await s.banco.comOrg(sessao.orgId, (tx) => carregarVeredito(tx, id));
    if (!v) throw naoEncontrado('Veredito');
    return { versao: await iniciarRaciocinio(s, sessao.orgId, sessao.tokenHash, id) };
  });

  // ------------------------------------------------------------ relatório e links (T-18)
  api.get('/vereditos/:id/relatorio.md', async (req, reply) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const { v, r } = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const v = await carregarVeredito(tx, id);
      if (!v) throw naoEncontrado('Veredito');
      return { v, r: await ultimoRaciocinioPronto(tx, id) };
    });
    reply
      .type('text/markdown; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${nomeArquivo(v.analise.nome)}"`);
    return relatorioMarkdown(c, v.analise, v.documento, v.criadoEm, r);
  });

  api.post('/vereditos/:id/links', async (req, reply) => {
    const sessao = exigirSessao(req);
    const { id } = paramsId.parse(req.params);
    const { dias } = corpoLink.parse(req.body ?? {});
    const token = novoToken();
    const link = await s.banco.comOrg(sessao.orgId, async (tx) => {
      const v = await carregarVeredito(tx, id);
      if (!v) throw naoEncontrado('Veredito');
      return tx.um<{ id: string; expira_em: unknown }>(
        `INSERT INTO links (org_id, veredito_id, token_hash, expira_em) VALUES ($1, $2, $3, now() + make_interval(days => $4)) RETURNING id, expira_em`,
        [sessao.orgId, id, hashToken(token), dias ?? 30],
      );
    });
    reply.status(201);
    // O token só aparece aqui; o banco guarda o hash.
    return { id: link!.id, token, expiraEm: iso(link!.expira_em) };
  });

  api.delete('/links/:id', async (req) => {
    const sessao = exigirSessao(req);
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const r = await s.banco.comOrg(sessao.orgId, (tx) =>
      tx.um('UPDATE links SET revogado_em = coalesce(revogado_em, now()) WHERE id = $1 RETURNING id', [id]),
    );
    if (!r) throw naoEncontrado('Link');
    return { revogado: true };
  });

  // Leitura pública por link: só o token dá acesso, e só a este veredito.
  async function lerPublico(token: string) {
    if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) throw naoEncontrado('Relatório');
    const h = hashToken(token);
    return s.banco.publico(h, async (tx) => {
      const l = await tx.um<{ id: string; org_id: string; veredito_id: string; vencido: boolean; revogado_em: unknown }>(
        'SELECT id, org_id, veredito_id, expira_em < now() AS vencido, revogado_em FROM links WHERE token_hash = $1',
        [h],
      );
      // Mesma resposta para inexistente, vencido ou revogado: nada a descobrir pelo erro.
      if (!l || l.vencido || l.revogado_em) throw naoEncontrado('Relatório');
      await tx.q("SELECT set_config('app.org_id', $1, true)", [l.org_id]);
      await tx.q('UPDATE links SET acessos = acessos + 1 WHERE id = $1', [l.id]);
      const v = await carregarVeredito(tx, l.veredito_id);
      if (!v) throw naoEncontrado('Relatório');
      return { v, rac: await ultimoRaciocinioPronto(tx, v.id) };
    });
  }


  api.get('/publico/:token', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { token } = z.object({ token: z.string() }).parse(req.params);
    const { v, rac } = await lerPublico(token);
    reply.header('Cache-Control', 'no-store').header('X-Robots-Tag', 'noindex');
    return {
      criadoEm: v.criadoEm,
      analise: { nome: v.analise.nome, subnivel: v.analise.subnivel, profundidade: v.analise.profundidade },
      documento: v.documento,
      raciocinio: rac,
    };
  });

  api.get('/publico/:token/relatorio.md', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { token } = z.object({ token: z.string() }).parse(req.params);
    const { v, rac } = await lerPublico(token);
    reply
      .type('text/markdown; charset=utf-8')
      .header('Cache-Control', 'no-store')
      .header('Content-Disposition', `attachment; filename="${nomeArquivo(v.analise.nome)}"`);
    return relatorioMarkdown(c, v.analise, v.documento, v.criadoEm, rac);
  });

}
