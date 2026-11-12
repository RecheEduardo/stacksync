// Porta única da IA do usuário (Parte 4, 10.5): cada adaptador traduz saída estruturada, esforço,
// tempos-limite e erros do provedor. Parâmetros de amostragem não são enviados.
import type { Provedor } from '@stacksync/contracts';

/** Etapas da esteira (10.2) usadas nesta versão. */
export type Etapa = 'RG-01' | 'RG-10' | 'RG-12' | 'RG-13' | 'RG-14' | 'ideia' | 'teste';
export type Esforco = 'baixo' | 'medio' | 'alto';

export interface PedidoBruto {
  etapa: Etapa;
  sistema: string;
  usuario: string;
  /** JSON Schema da saída (convertido do schema zod). */
  jsonSchema: Record<string, unknown>;
  nomeSchema: string;
  esforco: Esforco;
  maxTokens: number;
  /** Contexto estruturado da etapa; só o provedor simulado o lê. */
  dados: unknown;
  sinal?: AbortSignal | undefined;
}

export interface RespostaBruta {
  texto: string;
  tokensEntrada: number;
  tokensSaida: number;
  /** Modelo que efetivamente respondeu (pode ser o de reserva da Anthropic). */
  modelo: string;
  /** Um modelo de reserva respondeu depois de uma recusa (fallback do servidor). */
  reserva: boolean;
}

export interface AdaptadorIA {
  provedor: Provedor;
  modelo: string;
  chamar(p: PedidoBruto): Promise<RespostaBruta>;
}

export type TipoErroIA =
  | 'chave_invalida'
  | 'modelo_inexistente'
  | 'modelo_incompativel'
  | 'limite'
  | 'tempo'
  | 'recusa'
  | 'cortada'
  | 'saida_invalida'
  | 'requisicao'
  | 'indisponivel'
  | 'endpoint'
  | 'cancelada'
  | 'outro';

export class ErroIA extends Error {
  constructor(
    readonly tipo: TipoErroIA,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroIA';
  }
}

/** Mensagens para a interface, em linguagem simples e sem culpar o usuário. */
export const mensagensErroIA: Record<TipoErroIA, string> = {
  chave_invalida: 'O provedor recusou a chave. Confira a chave e teste de novo.',
  modelo_inexistente: 'O provedor não encontrou esse modelo para esta chave.',
  modelo_incompativel: 'Este modelo não oferece saída estruturada, que o StackSync exige. Escolha outro modelo.',
  limite: 'O provedor limitou o número de pedidos agora. Tente de novo em instantes.',
  tempo: 'O provedor demorou demais para responder.',
  recusa: 'O modelo recusou este pedido.',
  cortada: 'A resposta do modelo foi cortada antes do fim.',
  saida_invalida: 'A resposta do modelo não passou na verificação de formato.',
  requisicao: 'O provedor recusou o pedido. Confira o modelo e o endereço.',
  indisponivel: 'O provedor de IA não respondeu. Tente de novo em instantes.',
  endpoint: 'O endereço informado não é aceito.',
  cancelada: 'O pedido foi cancelado.',
  outro: 'Não foi possível falar com o provedor de IA.',
};
