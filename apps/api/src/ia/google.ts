// Adaptador Google (Gemini) sobre o SDK oficial @google/genai (Parte 4, 10.5).
// Saída estruturada por `responseMimeType: application/json` com `responseJsonSchema`.
// O nível de raciocínio vai em `thinkingConfig.thinkingLevel`; modelos que não aceitam o campo
// recebem o pedido sem ele na segunda tentativa.
import { ApiError, GoogleGenAI, ThinkingLevel, type GenerateContentConfig } from '@google/genai';
import { ErroIA, type AdaptadorIA } from './tipos.ts';

const NIVEL = { baixo: ThinkingLevel.LOW, medio: ThinkingLevel.MEDIUM, alto: ThinkingLevel.HIGH } as const;

export function traduzirErroGoogle(e: unknown): ErroIA {
  if (e instanceof ErroIA) return e;
  if (e instanceof ApiError) {
    if (e.status === 401 || e.status === 403) return new ErroIA('chave_invalida', 'Chave recusada pelo Google.');
    if (e.status === 404) return new ErroIA('modelo_inexistente', 'Modelo não encontrado.');
    if (e.status === 429) return new ErroIA('limite', 'Limite de taxa do Google.');
    if (e.status === 400) return new ErroIA('requisicao', 'Pedido recusado pelo Google; confira a chave e o modelo.');
    if (e.status >= 500) return new ErroIA('indisponivel', 'Google indisponível.');
    return new ErroIA('outro', `Erro do Google (${e.status}).`);
  }
  if (e instanceof Error && e.name === 'AbortError') return new ErroIA('cancelada', 'Cancelado.');
  return new ErroIA('indisponivel', 'Falha ao chamar o Google.');
}

export async function listarModelosGoogle(chave: string): Promise<string[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: chave });
    const ids: string[] = [];
    const pagina = await ai.models.list();
    for await (const m of pagina) {
      const acoes = m.supportedActions ?? [];
      if (m.name && (!acoes.length || acoes.includes('generateContent'))) ids.push(m.name.replace(/^models\//, ''));
    }
    return ids;
  } catch (e) {
    throw traduzirErroGoogle(e);
  }
}

export function adaptadorGoogle(chave: string, modelo: string): AdaptadorIA {
  const ai = new GoogleGenAI({ apiKey: chave });
  let comNivel = true;
  return {
    provedor: 'google',
    modelo,
    async chamar(p) {
      for (;;) {
        const config: GenerateContentConfig = {
          systemInstruction: p.sistema,
          responseMimeType: 'application/json',
          responseJsonSchema: p.jsonSchema,
          maxOutputTokens: p.maxTokens,
          ...(comNivel ? { thinkingConfig: { thinkingLevel: NIVEL[p.esforco] } } : {}),
          ...(p.sinal ? { abortSignal: p.sinal } : {}),
        };
        try {
          const r = await ai.models.generateContent({ model: modelo, contents: p.usuario, config });
          if (r.promptFeedback?.blockReason) throw new ErroIA('recusa', 'O modelo recusou o pedido.');
          const fim = r.candidates?.[0]?.finishReason;
          if (fim === 'SAFETY' || fim === 'PROHIBITED_CONTENT' || fim === 'BLOCKLIST') throw new ErroIA('recusa', 'O modelo recusou o pedido.');
          if (fim === 'MAX_TOKENS') throw new ErroIA('cortada', 'Resposta cortada pelo limite de tokens.');
          return {
            texto: r.text ?? '',
            tokensEntrada: r.usageMetadata?.promptTokenCount ?? 0,
            tokensSaida: (r.usageMetadata?.candidatesTokenCount ?? 0) + (r.usageMetadata?.thoughtsTokenCount ?? 0),
            modelo: r.modelVersion ?? modelo,
            reserva: false,
          };
        } catch (e) {
          if (comNivel && e instanceof ApiError && e.status === 400) {
            comNivel = false;
            continue;
          }
          throw traduzirErroGoogle(e);
        }
      }
    },
  };
}
