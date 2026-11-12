// Adaptador OpenAI e endpoints compatíveis com a API da OpenAI, sobre o SDK oficial (Parte 4, 10.5).
// Saída estruturada por `response_format` json_schema em modo estrito. Para endpoints compatíveis
// sem esse recurso, cai para o modo JSON e, por fim, para texto com o schema na instrução; a
// validação do schema e a nova tentativa ficam na esteira (10.3).
import OpenAI from 'openai';
import { ErroIA, type AdaptadorIA, type RespostaBruta } from './tipos.ts';

const ESFORCO = { baixo: 'low', medio: 'medium', alto: 'high' } as const;

export function traduzirErroOpenAI(e: unknown): ErroIA {
  if (e instanceof ErroIA) return e;
  if (e instanceof OpenAI.AuthenticationError || e instanceof OpenAI.PermissionDeniedError)
    return new ErroIA('chave_invalida', 'Chave recusada pelo provedor.');
  if (e instanceof OpenAI.NotFoundError) return new ErroIA('modelo_inexistente', 'Modelo ou endereço não encontrado.');
  if (e instanceof OpenAI.RateLimitError) return new ErroIA('limite', 'Limite de taxa do provedor.');
  if (e instanceof OpenAI.BadRequestError) return new ErroIA('requisicao', 'Pedido recusado pelo provedor.');
  if (e instanceof OpenAI.APIConnectionTimeoutError) return new ErroIA('tempo', 'Tempo esgotado.');
  if (e instanceof OpenAI.APIUserAbortError) return new ErroIA('cancelada', 'Cancelado.');
  if (e instanceof OpenAI.APIConnectionError || e instanceof OpenAI.InternalServerError)
    return new ErroIA('indisponivel', 'Provedor indisponível.');
  if (e instanceof OpenAI.APIError) return new ErroIA('outro', `Erro do provedor (${e.status ?? 'sem status'}).`);
  return new ErroIA('outro', 'Falha ao chamar o provedor.');
}

export function clienteOpenAI(chave: string, endpoint: string | null, fetchFn?: typeof fetch): OpenAI {
  return new OpenAI({
    apiKey: chave || 'sem-chave',
    maxRetries: 2,
    timeout: 180_000,
    ...(endpoint ? { baseURL: endpoint } : {}),
    ...(fetchFn ? { fetch: fetchFn } : {}),
  });
}

export async function listarModelosOpenAI(chave: string, endpoint: string | null, fetchFn?: typeof fetch): Promise<string[]> {
  try {
    const ids: string[] = [];
    for await (const m of clienteOpenAI(chave, endpoint, fetchFn).models.list()) ids.push(m.id);
    return ids.sort();
  } catch (e) {
    throw traduzirErroOpenAI(e);
  }
}

type Modo = 'schema' | 'objeto' | 'texto';

export function adaptadorOpenAI(
  provedor: 'openai' | 'compativel',
  chave: string,
  modelo: string,
  endpoint: string | null,
  fetchFn?: typeof fetch,
): AdaptadorIA {
  const cliente = clienteOpenAI(chave, endpoint, fetchFn);
  const compativel = provedor === 'compativel';
  let modo: Modo = 'schema';
  // Modelos sem raciocínio recusam reasoning_effort; o erro aponta o parâmetro, e o adaptador lembra.
  let enviarEsforco = !compativel;

  async function tentar(p: Parameters<AdaptadorIA['chamar']>[0], m: Modo): Promise<RespostaBruta> {
    const instrucaoSchema =
      m === 'schema' ? '' : `\n\nResponda só com um objeto JSON válido que siga este JSON Schema:\n${JSON.stringify(p.jsonSchema)}`;
    const resp = await cliente.chat.completions.create(
      {
        model: modelo,
        messages: [
          { role: 'system', content: p.sistema + instrucaoSchema },
          { role: 'user', content: p.usuario },
        ],
        ...(compativel ? { max_tokens: p.maxTokens } : { max_completion_tokens: p.maxTokens }),
        ...(enviarEsforco ? { reasoning_effort: ESFORCO[p.esforco] } : {}),
        ...(m === 'schema'
          ? { response_format: { type: 'json_schema' as const, json_schema: { name: p.nomeSchema, schema: p.jsonSchema, strict: true } } }
          : m === 'objeto'
            ? { response_format: { type: 'json_object' as const } }
            : {}),
      },
      p.sinal ? { signal: p.sinal } : undefined,
    );
    const escolha = resp.choices[0];
    if (!escolha) throw new ErroIA('saida_invalida', 'Resposta vazia.');
    if (escolha.message.refusal) throw new ErroIA('recusa', 'O modelo recusou o pedido.');
    if (escolha.finish_reason === 'length') throw new ErroIA('cortada', 'Resposta cortada pelo limite de tokens.');
    if (escolha.finish_reason === 'content_filter') throw new ErroIA('recusa', 'Filtro de conteúdo do provedor.');
    return {
      texto: escolha.message.content ?? '',
      tokensEntrada: resp.usage?.prompt_tokens ?? 0,
      tokensSaida: resp.usage?.completion_tokens ?? 0,
      modelo: resp.model || modelo,
      reserva: false,
    };
  }

  return {
    provedor,
    modelo,
    async chamar(p) {
      for (;;) {
        try {
          return await tentar(p, modo);
        } catch (e) {
          if (e instanceof OpenAI.BadRequestError) {
            if (enviarEsforco && e.param === 'reasoning_effort') {
              enviarEsforco = false;
              continue;
            }
            // Endpoint compatível sem saída estruturada: modo JSON, depois texto com o schema na instrução.
            if (compativel && modo !== 'texto') {
              modo = modo === 'schema' ? 'objeto' : 'texto';
              continue;
            }
          }
          throw traduzirErroOpenAI(e);
        }
      }
    },
  };
}
