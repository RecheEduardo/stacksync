// Cliente da API: mesma origem, cookie HttpOnly, cabeçalho de proteção nos métodos que alteram
// estado e erros em application/problem+json (Parte 4, 12.1).
import { marcarSalvamento } from './salvamento.ts';

export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly tipo: string,
    titulo: string,
    readonly detalhe: string | null,
    readonly corpo: Record<string, unknown>,
  ) {
    super(titulo);
    this.name = 'ErroApi';
  }
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  /** Versão conhecida da resposta (If-Match); 0 quando ainda não existia. */
  versao?: number;
  /** Mostra "Salvando..." e "Salvo" na barra superior. */
  salvamento?: boolean;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const metodo = opcoes.metodo ?? 'GET';
  if (opcoes.salvamento) marcarSalvamento('salvando');
  let resposta: Response;
  try {
    resposta = await fetch(`/api/v1${caminho}`, {
      method: metodo,
      credentials: 'same-origin',
      headers: {
        'x-stacksync': '1',
        ...(opcoes.corpo !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(opcoes.versao !== undefined ? { 'if-match': `"${opcoes.versao}"` } : {}),
      },
      ...(opcoes.corpo !== undefined ? { body: JSON.stringify(opcoes.corpo) } : {}),
    });
  } catch {
    if (opcoes.salvamento) marcarSalvamento('sem-conexao');
    throw new ErroApi(0, 'sem-conexao', 'Sem conexão', null, {});
  }
  if (!resposta.ok) {
    let corpo: Record<string, unknown> = {};
    try {
      corpo = (await resposta.json()) as Record<string, unknown>;
    } catch {
      corpo = {};
    }
    if (opcoes.salvamento) marcarSalvamento(resposta.status === 412 ? 'conflito' : 'erro');
    const tipo = String(corpo.type ?? '').replace('/problemas/', '') || 'erro';
    throw new ErroApi(resposta.status, tipo, String(corpo.title ?? 'Erro'), corpo.detail ? String(corpo.detail) : null, corpo);
  }
  if (opcoes.salvamento) marcarSalvamento('salvo');
  if (resposta.status === 204 || resposta.status === 304) return undefined as T;
  return (await resposta.json()) as T;
}

export const ehErroApi = (e: unknown, status?: number): e is ErroApi => e instanceof ErroApi && (status === undefined || e.status === status);
