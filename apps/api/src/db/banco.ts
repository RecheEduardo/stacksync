// Acesso ao banco com isolamento por organização (Parte 4, 11.6). Toda transação de dado de
// cliente roda com o papel `stacksync_app`, sem BYPASSRLS, e com `app.org_id` definido só para a
// transação; sem o contexto, as políticas falham fechado.
//
// Desvio documentado da Parte 4: a aplicação conecta com um único usuário dono das tabelas e troca
// de papel por transação (`SET LOCAL ROLE`), em vez de conectar com um papel separado. O isolamento
// por linha continua valendo em toda consulta de organização; só migração, sessão e expurgo rodam
// como dono.
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

export interface Tx {
  q<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  um<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  /** Várias instruções sem parâmetros (migrações). */
  executar(sql: string): Promise<void>;
}

export interface Banco {
  /** Transação como dono das tabelas: migrações, sessões e expurgo. */
  sistema<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  /** Transação com o papel da aplicação e o contexto da organização (RLS). */
  comOrg<T>(orgId: string, fn: (tx: Tx) => Promise<T>): Promise<T>;
  /** Transação com o papel da aplicação para a leitura pública por link (só o token dá acesso). */
  publico<T>(tokenHash: string, fn: (tx: Tx) => Promise<T>): Promise<T>;
  fechar(): Promise<void>;
}

type Executor = (sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

function criarTx(exec: Executor, executar: (sql: string) => Promise<void>): Tx {
  return {
    executar,
    q: async <T>(sql: string, params?: unknown[]) => (await exec(sql, params)) as T[],
    um: async <T>(sql: string, params?: unknown[]) => ((await exec(sql, params))[0] as T | undefined) ?? null,
  };
}

async function prepararOrg(tx: Tx, orgId: string) {
  await tx.q('SET LOCAL ROLE stacksync_app');
  await tx.q("SELECT set_config('app.org_id', $1, true)", [orgId]);
}

async function prepararPublico(tx: Tx, tokenHash: string) {
  await tx.q('SET LOCAL ROLE stacksync_app');
  await tx.q("SELECT set_config('app.link_token', $1, true)", [tokenHash]);
}

export async function bancoEmbutido(dir: string | null): Promise<Banco> {
  const db = dir ? new PGlite(dir) : new PGlite();
  await db.waitReady;
  const rodar = <T>(preparo: ((tx: Tx) => Promise<void>) | null, fn: (tx: Tx) => Promise<T>) =>
    db.transaction(async (t) => {
      const tx = criarTx(
        async (sql, params) => (await t.query(sql, params as unknown[])).rows as Record<string, unknown>[],
        async (sql) => {
          await t.exec(sql);
        },
      );
      if (preparo) await preparo(tx);
      return fn(tx);
    });
  return {
    sistema: (fn) => rodar(null, fn),
    comOrg: (orgId, fn) => rodar((tx) => prepararOrg(tx, orgId), fn),
    publico: (h, fn) => rodar((tx) => prepararPublico(tx, h), fn),
    fechar: () => db.close(),
  };
}

export async function bancoPostgres(url: string): Promise<Banco> {
  // bigint e numeric chegam como texto no driver; as consultas fazem cast para int quando precisam.
  const pool = new pg.Pool({ connectionString: url, max: 10 });
  const rodar = async <T>(preparo: ((tx: Tx) => Promise<void>) | null, fn: (tx: Tx) => Promise<T>) => {
    const cliente = await pool.connect();
    const tx = criarTx(
      async (sql, params) => (await cliente.query(sql, params as unknown[])).rows,
      async (sql) => {
        await cliente.query(sql);
      },
    );
    try {
      await cliente.query('BEGIN');
      if (preparo) await preparo(tx);
      const r = await fn(tx);
      await cliente.query('COMMIT');
      return r;
    } catch (e) {
      await cliente.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      cliente.release();
    }
  };
  return {
    sistema: (fn) => rodar(null, fn),
    comOrg: (orgId, fn) => rodar((tx) => prepararOrg(tx, orgId), fn),
    publico: (h, fn) => rodar((tx) => prepararPublico(tx, h), fn),
    fechar: () => pool.end(),
  };
}

/** Data e hora em ISO 8601, venha o valor como Date (pg, PGlite) ou como texto. */
export const iso = (v: unknown): string | null => (v === null || v === undefined ? null : v instanceof Date ? v.toISOString() : String(v));
