// Estado do salvamento contínuo, mostrado na barra superior como texto discreto (DESIGN.md,
// Indicador de salvamento): "Salvo", "Salvando...", "Sem conexão. Tentando de novo.".
import { useSyncExternalStore } from 'react';

export type EstadoSalvamento = 'ocioso' | 'salvando' | 'salvo' | 'sem-conexao' | 'conflito' | 'erro';

let estado: EstadoSalvamento = 'ocioso';
let pendentes = 0;
const ouvintes = new Set<() => void>();

export function marcarSalvamento(novo: EstadoSalvamento) {
  if (novo === 'salvando') pendentes++;
  else pendentes = Math.max(0, pendentes - 1);
  estado = novo === 'salvo' && pendentes > 0 ? 'salvando' : novo;
  for (const o of ouvintes) o();
}

export function useSalvamento(): EstadoSalvamento {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => estado,
  );
}
