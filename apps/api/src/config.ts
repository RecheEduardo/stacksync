// Configuração por ambiente (Parte 4, 15.2). Nada de segredo no código: a chave mestra vem do
// ambiente; só em desenvolvimento ela é gerada e guardada em .data/, que fica fora do git.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Config {
  porta: number;
  host: string;
  producao: boolean;
  /** PostgreSQL externo; sem ele, usa o PostgreSQL embutido (PGlite) em `dirDados`. */
  databaseUrl: string | null;
  /** Diretório do banco embutido; `null` mantém o banco só em memória (testes). */
  dirDados: string | null;
  chaveMestra: Buffer;
  /** Provedor simulado de IA, só para desenvolvimento e testes. */
  permitirSimulado: boolean;
  /** Endpoints compatíveis em rede local (por exemplo, um modelo rodando na própria máquina). */
  permitirEndpointLocal: boolean;
  /** Origem pública da interface, para a verificação de Origin. */
  origens: string[];
  /** Interface compilada a servir na mesma origem. */
  dirWeb: string | null;
  /** Cookie com o atributo Secure (exige HTTPS). */
  cookieSeguro: boolean;
}

export const raizRepositorio = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function chaveMestraDe(producao: boolean, dir: string): Buffer {
  const env = process.env.STACKSYNC_CHAVE_MESTRA;
  if (env) {
    const k = Buffer.from(env, 'base64');
    if (k.length !== 32) throw new Error('STACKSYNC_CHAVE_MESTRA precisa ter 32 bytes em base64.');
    return k;
  }
  if (producao) throw new Error('Defina STACKSYNC_CHAVE_MESTRA (32 bytes em base64) em produção.');
  const arquivo = join(dir, 'chave-mestra');
  if (existsSync(arquivo)) return Buffer.from(readFileSync(arquivo, 'utf8').trim(), 'base64');
  mkdirSync(dir, { recursive: true });
  const k = randomBytes(32);
  writeFileSync(arquivo, k.toString('base64'), { mode: 0o600 });
  return k;
}

export function carregarConfig(sobrescritas: Partial<Config> = {}): Config {
  const producao = process.env.NODE_ENV === 'production';
  const dirBase = resolve(raizRepositorio, process.env.STACKSYNC_DADOS ?? '.data');
  const porta = Number(process.env.PORT ?? 8787);
  const origens = (process.env.STACKSYNC_ORIGENS ?? `http://localhost:${porta},http://localhost:5173,http://127.0.0.1:5173`)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const dirWebPadrao = resolve(raizRepositorio, 'apps/web/dist');
  return {
    porta,
    host: process.env.HOST ?? (producao ? '0.0.0.0' : '127.0.0.1'),
    producao,
    databaseUrl: process.env.DATABASE_URL ?? null,
    dirDados: join(dirBase, 'pglite'),
    chaveMestra: sobrescritas.chaveMestra ?? chaveMestraDe(producao, dirBase),
    permitirSimulado: process.env.STACKSYNC_PERMITIR_SIMULADO === '1' && !producao,
    permitirEndpointLocal: process.env.STACKSYNC_PERMITIR_ENDPOINT_LOCAL === '1',
    origens,
    dirWeb: existsSync(dirWebPadrao) ? dirWebPadrao : null,
    cookieSeguro: producao,
    ...sobrescritas,
  };
}
