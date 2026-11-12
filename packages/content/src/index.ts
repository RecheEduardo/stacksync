// Pacote de conhecimento compilado (DT-20). Gere com `pnpm --filter @stacksync/content build`.
import conteudo from '../gerado/conteudo.json' with { type: 'json' };
import type { PacoteConteudo } from './tipos.ts';

export type * from './tipos.ts';
export const pacote = conteudo as unknown as PacoteConteudo;
