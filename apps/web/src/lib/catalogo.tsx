// Catálogo público (textos, estrutura, eixos, calibração) e o tradutor de mensagens ICU.
// Todo texto de interface vem do pacote de conteúdo, sob o lint de vocabulário (FD-04, DT-28).
import { formatar, type Valores } from '@stacksync/engine/mensagens';
import { useQuery } from '@tanstack/react-query';
import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { api } from './api.ts';
import type { Catalogo } from './tipos.ts';

const ContextoCatalogo = createContext<Catalogo | null>(null);

export function useConsultaCatalogo() {
  return useQuery({ queryKey: ['catalogo'], queryFn: () => api<Catalogo>('/catalogo'), staleTime: Infinity, gcTime: Infinity });
}

export function ProvedorCatalogo({ catalogo, children }: { catalogo: Catalogo; children: ReactNode }) {
  return <ContextoCatalogo.Provider value={catalogo}>{children}</ContextoCatalogo.Provider>;
}

export function useCatalogo(): Catalogo {
  const c = useContext(ContextoCatalogo);
  if (!c) throw new Error('Catálogo indisponível fora do provedor.');
  return c;
}

export type Tradutor = (chave: string, valores?: Valores) => string;

export function useT(): Tradutor {
  const { textos } = useCatalogo();
  return useCallback(
    (chave: string, valores?: Valores) => {
      const fonte = textos[chave];
      if (fonte === undefined) {
        if (import.meta.env.DEV) console.warn(`Texto ausente no pacote de conteúdo: ${chave}`);
        return import.meta.env.DEV ? `⟦${chave}⟧` : '';
      }
      return formatar(fonte, valores);
    },
    [textos],
  );
}
