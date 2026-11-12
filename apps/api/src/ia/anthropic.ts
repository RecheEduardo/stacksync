// Adaptador Anthropic (Claude) sobre o SDK oficial.
// - Saída estruturada por `output_config.format` (json_schema) e esforço por `output_config.effort`,
//   só quando o modelo declara suporte (Models API, `capabilities`).
// - Sem `thinking` explícito: nos modelos atuais o raciocínio adaptativo já vem ligado.
// - Sem parâmetros de amostragem.
// - Recusa (`stop_reason: "refusal"`) tratada antes de ler o conteúdo. Nos modelos que aceitam,
//   o fallback do servidor (`fallbacks: "default"`) refaz um pedido recusado no modelo de reserva
//   recomendado; a tela de conexão avisa o usuário disso.
// - Streaming com `finalMessage()`, para não esbarrar em tempo-limite de pedidos longos.
import Anthropic from '@anthropic-ai/sdk';
import { ErroIA, type AdaptadorIA, type RespostaBruta } from './tipos.ts';

/** Modelos com fallback do servidor no modo "default" (beta server-side-fallback-2026-07-01). */
export const MODELOS_COM_RESERVA = new Set(['claude-fable-5-2', 'claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']);
const ESFORCO = { baixo: 'low', medio: 'medium', alto: 'high' } as const;

export function traduzirErroAnthropic(e: unknown): ErroIA {
  if (e instanceof ErroIA) return e;
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError)
    return new ErroIA('chave_invalida', 'Chave recusada pela Anthropic.');
  if (e instanceof Anthropic.NotFoundError) return new ErroIA('modelo_inexistente', 'Modelo não encontrado.');
  if (e instanceof Anthropic.RateLimitError) return new ErroIA('limite', 'Limite de taxa da Anthropic.');
  if (e instanceof Anthropic.BadRequestError) return new ErroIA('requisicao', 'Pedido recusado pela Anthropic.');
  if (e instanceof Anthropic.APIConnectionTimeoutError) return new ErroIA('tempo', 'Tempo esgotado.');
  if (e instanceof Anthropic.APIUserAbortError) return new ErroIA('cancelada', 'Cancelado.');
  if (e instanceof Anthropic.APIConnectionError || e instanceof Anthropic.InternalServerError)
    return new ErroIA('indisponivel', 'Anthropic indisponível.');
  if (e instanceof Anthropic.APIError) return new ErroIA('outro', `Erro da Anthropic (${e.status ?? 'sem status'}).`);
  return new ErroIA('outro', 'Falha ao chamar a Anthropic.');
}

export function clienteAnthropic(chave: string): Anthropic {
  return new Anthropic({ apiKey: chave, maxRetries: 2, timeout: 180_000 });
}

export async function listarModelosAnthropic(chave: string): Promise<string[]> {
  try {
    const ids: string[] = [];
    for await (const m of clienteAnthropic(chave).models.list()) ids.push(m.id);
    return ids;
  } catch (e) {
    throw traduzirErroAnthropic(e);
  }
}

export function adaptadorAnthropic(chave: string, modelo: string): AdaptadorIA {
  const cliente = clienteAnthropic(chave);
  let capacidades: Promise<{ esforco: boolean; estruturada: boolean }> | null = null;
  const lerCapacidades = () =>
    (capacidades ??= cliente.models.retrieve(modelo).then(
      (m) => ({
        esforco: m.capabilities?.effort?.supported ?? false,
        estruturada: m.capabilities?.structured_outputs?.supported ?? false,
      }),
      (e: unknown) => {
        capacidades = null;
        throw traduzirErroAnthropic(e);
      },
    ));

  return {
    provedor: 'anthropic',
    modelo,
    async chamar(p): Promise<RespostaBruta> {
      const cap = await lerCapacidades();
      if (!cap.estruturada) throw new ErroIA('modelo_incompativel', 'Modelo sem saída estruturada.');
      const reserva = MODELOS_COM_RESERVA.has(modelo);
      try {
        const fluxo = cliente.beta.messages.stream(
          {
            model: modelo,
            max_tokens: p.maxTokens,
            system: p.sistema,
            messages: [{ role: 'user', content: p.usuario }],
            output_config: {
              ...(cap.esforco ? { effort: ESFORCO[p.esforco] } : {}),
              format: { type: 'json_schema', schema: p.jsonSchema },
            },
            ...(reserva ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
          },
          p.sinal ? { signal: p.sinal } : undefined,
        );
        const msg = await fluxo.finalMessage();
        if (msg.stop_reason === 'refusal') throw new ErroIA('recusa', 'O modelo recusou o pedido.');
        if (msg.stop_reason === 'max_tokens') throw new ErroIA('cortada', 'Resposta cortada pelo limite de tokens.');
        const texto = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
        const usouReserva = (msg.usage.iterations ?? []).some((it) => it.type === 'fallback_message');
        return {
          texto,
          tokensEntrada: msg.usage.input_tokens,
          tokensSaida: msg.usage.output_tokens,
          modelo: msg.model,
          reserva: usouReserva,
        };
      } catch (e) {
        throw traduzirErroAnthropic(e);
      }
    },
  };
}
