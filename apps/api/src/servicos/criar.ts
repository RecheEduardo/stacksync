// Monta os serviços: banco (PostgreSQL externo ou embutido), migrações e conteúdo.
import { pacote } from '@stacksync/content';
import type { Config } from '../config.ts';
import { bancoEmbutido, bancoPostgres } from '../db/banco.ts';
import { migrar } from '../db/migrar.ts';
import { criarAdaptador } from '../ia/fabrica.ts';
import { Geracoes } from './geracoes.ts';
import type { Servicos } from './servicos.ts';

export async function criarServicos(config: Config, extras: Partial<Servicos> = {}): Promise<Servicos> {
  const banco = config.databaseUrl ? await bancoPostgres(config.databaseUrl) : await bancoEmbutido(config.dirDados);
  await migrar(banco);
  return {
    config,
    banco,
    conteudo: pacote,
    chavesSessao: new Map(),
    geracoes: new Geracoes(),
    criarAdaptador,
    ...extras,
  };
}
