// Esteira de raciocínio (Parte 4, 10.2): etapas fixas, sem ferramentas e sem sair da estrutura.
// Cada chamada pede saída estruturada, valida o schema (VI-01) com uma nova tentativa e registra
// só metadados (etapa, modelo, tokens, latência, resultado), nunca conteúdo (DT-18).
import type { PacoteConteudo } from '@stacksync/content/tipos';
import type { z } from 'zod';
import { paraJsonSchema } from './esquema.ts';
import { ErroIA, type AdaptadorIA, type Esforco, type Etapa } from './tipos.ts';

export interface RegistroChamada {
  etapa: Etapa;
  provedor: string;
  modelo: string;
  tokensEntrada: number;
  tokensSaida: number;
  latenciaMs: number;
  resultado: string;
}

export type Registrar = (r: RegistroChamada) => void | Promise<void>;

export interface Chamada<T> {
  etapa: Etapa;
  schema: z.ZodType<T>;
  nomeSchema: string;
  usuario: string;
  dados: unknown;
  esforco: Esforco;
  maxTokens: number;
  sinal?: AbortSignal | undefined;
}

/** Tira cercas de código e texto em volta do objeto JSON (modo texto dos endpoints compatíveis). */
export function extrairJson(texto: string): string {
  const t = texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const i = t.indexOf('{');
  const j = t.lastIndexOf('}');
  return i >= 0 && j > i ? t.slice(i, j + 1) : t;
}

export async function executar<T>(
  c: PacoteConteudo,
  ad: AdaptadorIA,
  ch: Chamada<T>,
  registrar: Registrar,
): Promise<{ saida: T; modelo: string; reserva: boolean; versaoPrompt: string }> {
  const jsonSchema = paraJsonSchema(ch.schema);
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    const inicio = performance.now();
    const base = { etapa: ch.etapa, provedor: ad.provedor, modelo: ad.modelo };
    let resposta;
    try {
      resposta = await ad.chamar({
        etapa: ch.etapa,
        sistema: c.prompts.sistema!,
        usuario: ch.usuario,
        jsonSchema,
        nomeSchema: ch.nomeSchema,
        esforco: ch.esforco,
        maxTokens: ch.maxTokens,
        dados: ch.dados,
        sinal: ch.sinal,
      });
    } catch (e) {
      const erro = e instanceof ErroIA ? e : new ErroIA('outro', 'Falha inesperada no provedor.');
      await registrar({ ...base, tokensEntrada: 0, tokensSaida: 0, latenciaMs: Math.round(performance.now() - inicio), resultado: `falha:${erro.tipo}` });
      throw erro;
    }
    const latenciaMs = Math.round(performance.now() - inicio);
    let json: unknown = undefined;
    try {
      json = JSON.parse(extrairJson(resposta.texto));
    } catch {
      json = undefined;
    }
    const v = json === undefined ? null : ch.schema.safeParse(json);
    const ok = !!v?.success;
    await registrar({
      ...base,
      modelo: resposta.modelo,
      tokensEntrada: resposta.tokensEntrada,
      tokensSaida: resposta.tokensSaida,
      latenciaMs,
      resultado: ok ? (resposta.reserva ? 'ok:reserva' : 'ok') : 'invalida',
    });
    if (v?.success) return { saida: v.data, modelo: resposta.modelo, reserva: resposta.reserva, versaoPrompt: c.prompts.versao };
  }
  throw new ErroIA('saida_invalida', 'A resposta não passou na verificação de formato duas vezes.');
}
