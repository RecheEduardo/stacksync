// Contêiner de serviços da API: configuração, banco, conteúdo e estado em memória.
import type { PacoteConteudo } from '@stacksync/content/tipos';
import type { Config } from '../config.ts';
import type { Banco, Tx } from '../db/banco.ts';
import type { RegistroChamada } from '../ia/esteira.ts';
import type { AdaptadorIA } from '../ia/tipos.ts';
import type { Credencial } from '../ia/fabrica.ts';
import type { Geracoes } from './geracoes.ts';

export interface Servicos {
  config: Config;
  banco: Banco;
  conteudo: PacoteConteudo;
  /** Chaves "só nesta sessão": hash do token da sessão → chave. Nunca persistidas. */
  chavesSessao: Map<string, string>;
  geracoes: Geracoes;
  /** Permite trocar a fábrica de adaptadores nos testes. */
  criarAdaptador: (cred: Credencial, config: Config) => AdaptadorIA;
}

export async function gravarChamadas(tx: Tx, orgId: string, analiseId: string | null, registros: RegistroChamada[]) {
  for (const r of registros)
    await tx.q(
      `INSERT INTO chamadas_ia (org_id, analise_id, etapa, provedor, modelo, tokens_entrada, tokens_saida, latencia_ms, resultado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [orgId, analiseId, r.etapa, r.provedor, r.modelo, r.tokensEntrada, r.tokensSaida, r.latenciaMs, r.resultado],
    );
}
