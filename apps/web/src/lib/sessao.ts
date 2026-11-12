// Sessão anônima por navegador: na primeira visita, a API cria o espaço e devolve o cookie.
import { useQuery } from '@tanstack/react-query';
import { api } from './api.ts';
import type { Eu } from './tipos.ts';

export async function lerEu(): Promise<Eu> {
  const eu = await api<Eu>('/eu');
  if (eu.sessao) return eu;
  return api<Eu>('/sessao', { metodo: 'POST' });
}

export function useEu() {
  return useQuery({ queryKey: ['eu'], queryFn: lerEu, staleTime: 60_000 });
}

/** Chave da lista de perguntas puladas desta análise (só nesta aba). */
export const chavePuladas = (analiseId: string) => `stacksync:puladas:${analiseId}`;

export function lerPuladas(analiseId: string): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(chavePuladas(analiseId)) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function gravarPuladas(analiseId: string, ids: string[]) {
  try {
    sessionStorage.setItem(chavePuladas(analiseId), JSON.stringify(ids));
  } catch {
    // Sem armazenamento da aba: pular vale só até recarregar.
  }
}
