// Sessão por cookie HttpOnly, Secure e SameSite=Lax, na mesma origem (Parte 4, 12.1 e 14.2).
// Sem login nesta versão (PRODUCT.md não inclui contas): cada navegador tem um espaço anônimo,
// e a porta de identidade aceita um provedor de contas depois sem mudar o domínio.
import type { FastifyReply, FastifyRequest } from 'fastify';
import { hashToken, novoToken } from '../seguranca/cifra.ts';
import type { Servicos } from '../servicos/servicos.ts';
import { Problema } from './erros.ts';

export const COOKIE = 'stacksync_sessao';

export interface Sessao {
  tokenHash: string;
  orgId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    sessao: Sessao | null;
  }
}

export async function lerSessao(s: Servicos, req: FastifyRequest): Promise<Sessao | null> {
  const token = req.cookies[COOKIE];
  if (!token || token.length > 100) return null;
  const tokenHash = hashToken(token);
  const r = await s.banco.sistema((tx) =>
    tx.um<{ org_id: string }>('UPDATE sessoes SET vista_em = now() WHERE token_hash = $1 RETURNING org_id', [tokenHash]),
  );
  return r ? { tokenHash, orgId: r.org_id } : null;
}

export async function criarSessao(s: Servicos, reply: FastifyReply): Promise<Sessao> {
  const token = novoToken();
  const tokenHash = hashToken(token);
  const orgId = await s.banco.sistema(async (tx) => {
    const org = await tx.um<{ id: string }>('INSERT INTO organizacoes DEFAULT VALUES RETURNING id');
    await tx.q('INSERT INTO sessoes (token_hash, org_id) VALUES ($1, $2)', [tokenHash, org!.id]);
    return org!.id;
  });
  reply.setCookie(COOKIE, token, {
    httpOnly: true,
    secure: s.config.cookieSeguro,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 400,
  });
  return { tokenHash, orgId };
}

export function exigirSessao(req: FastifyRequest): Sessao {
  if (!req.sessao) throw new Problema(401, 'sem-sessao', 'Sessão não encontrada', 'Recarregue a página para começar.');
  return req.sessao;
}
