// FF-08 no banco: isolamento por organização (RLS) e vereditos imutáveis (RN-82), direto no SQL.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bancoEmbutido, type Banco } from '../src/db/banco.ts';
import { migrar } from '../src/db/migrar.ts';

let b: Banco;
let orgA: string;
let orgB: string;
let analiseA: string;
let vereditoA: string;

const novaOrg = () => b.sistema(async (tx) => (await tx.um<{ id: string }>('INSERT INTO organizacoes DEFAULT VALUES RETURNING id'))!.id);
const inserirAnalise = (org: string, dona: string) =>
  b.comOrg(org, async (tx) =>
    (await tx.um<{ id: string }>(
      "INSERT INTO analises (org_id, nome, subnivel, profundidade, versao_conteudo) VALUES ($1, 'x', 'refatoracao.sistema', 'rapido', 'v') RETURNING id",
      [dona],
    ))!.id,
  );

beforeAll(async () => {
  b = await bancoEmbutido(null);
  expect(await migrar(b)).toEqual(['001_inicial.sql']);
  expect(await migrar(b)).toEqual([]);
  orgA = await novaOrg();
  orgB = await novaOrg();
  analiseA = await inserirAnalise(orgA, orgA);
  vereditoA = await b.comOrg(orgA, async (tx) =>
    (await tx.um<{ id: string }>(
      `INSERT INTO vereditos (org_id, analise_id, hash_entradas, as_of, versao_motor, versao_conteudo, versao_calibracao,
         categoria, indice_lo, indice_hi, confianca, variante_plano, entrada, documento)
       VALUES ($1, $2, 'h', '2026-11-11', '1.0.0', 'c', 'v0.2', 'ajustado', 80, 90, 'alta', 'nao_mexa', '{}', '{}') RETURNING id`,
      [orgA, analiseA],
    ))!.id,
  );
}, 60_000);

afterAll(() => b.fechar());

describe('isolamento por organização', () => {
  it('uma organização não lê as análises de outra', async () => {
    expect(await b.comOrg(orgB, (tx) => tx.q('SELECT id FROM analises'))).toHaveLength(0);
    expect(await b.comOrg(orgA, (tx) => tx.q('SELECT id FROM analises'))).toHaveLength(1);
  });

  it('uma organização não grava em nome de outra', async () => {
    await expect(inserirAnalise(orgB, orgA)).rejects.toThrow(/row-level security/);
  });

  it('sem o contexto da organização, o acesso falha fechado', async () => {
    await expect(
      b.comOrg(orgA, async (tx) => {
        await tx.q("SELECT set_config('app.org_id', '', true)");
        return tx.q('SELECT id FROM analises');
      }),
    ).rejects.toThrow();
  });
});

describe('vereditos imutáveis', () => {
  it('ninguém altera um veredito', async () => {
    await expect(b.comOrg(orgA, (tx) => tx.q("UPDATE vereditos SET categoria = 'x' WHERE id = $1", [vereditoA]))).rejects.toThrow();
    await expect(b.sistema((tx) => tx.q("UPDATE vereditos SET categoria = 'x' WHERE id = $1", [vereditoA]))).rejects.toThrow(/imutáveis/);
  });

  it('só o expurgo pedido pelo titular apaga, junto com a organização', async () => {
    await expect(b.sistema((tx) => tx.q('DELETE FROM vereditos WHERE id = $1', [vereditoA]))).rejects.toThrow(/imutáveis/);
    await b.sistema(async (tx) => {
      await tx.q("SELECT set_config('app.expurgo', 'on', true)");
      await tx.q('DELETE FROM organizacoes WHERE id = $1', [orgA]);
    });
    const restam = await b.sistema((tx) => tx.um<{ n: number }>('SELECT count(*)::int AS n FROM vereditos'));
    expect(restam!.n).toBe(0);
  });
});
