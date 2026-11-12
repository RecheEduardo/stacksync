// Consulta de mídia para decidir entre painel lateral e folha modal (DESIGN.md, Pontos de quebra).
import { useSyncExternalStore } from 'react';

export function useMidia(consulta: string): boolean {
  return useSyncExternalStore(
    (aviso) => {
      const m = window.matchMedia(consulta);
      m.addEventListener('change', aviso);
      return () => m.removeEventListener('change', aviso);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}
