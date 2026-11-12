// Migrações em SQL puro, versionadas no repositório e aplicadas em ordem (Parte 4, 11.8).
// Desvio documentado: SQL escrito à mão em vez do drizzle-kit, para manter RLS, papéis e gatilhos
// legíveis num só lugar e evitar uma dependência a mais (DT-26).
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Banco } from './banco.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'migracoes');

export async function migrar(banco: Banco): Promise<string[]> {
  await banco.sistema((tx) =>
    tx.executar('CREATE TABLE IF NOT EXISTS migracoes (id text PRIMARY KEY, aplicada_em timestamptz NOT NULL DEFAULT now())'),
  );
  const aplicadas = new Set(
    (await banco.sistema((tx) => tx.q<{ id: string }>('SELECT id FROM migracoes'))).map((r) => r.id),
  );
  const novas: string[] = [];
  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (aplicadas.has(arquivo)) continue;
    const sql = readFileSync(join(dir, arquivo), 'utf8');
    await banco.sistema(async (tx) => {
      await tx.executar(sql);
      await tx.q('INSERT INTO migracoes (id) VALUES ($1)', [arquivo]);
    });
    novas.push(arquivo);
  }
  return novas;
}
