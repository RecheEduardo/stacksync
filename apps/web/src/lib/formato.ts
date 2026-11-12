// Números e datas em pt-BR com o mesmo formatador do motor (DT-28): vírgula decimal, faixas por extenso.
import { numeroPt } from '@stacksync/engine/mensagens';

export const num = (n: number, casas = 1) => numeroPt(n, casas);

/** Sinal explícito com o menos tipográfico: +2,5 e −1. */
export const comSinal = (n: number, casas = 1) => (n > 0 ? `+${numeroPt(n, casas)}` : n < 0 ? `−${numeroPt(-n, casas)}` : '0');

/** Data ISO (AAAA-MM-DD ou com hora) em DD/MM/AAAA. */
export function dataPt(iso: string | null | undefined): string {
  if (!iso) return '';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/** Data e hora curtas para listas: "11/11/2026, 14:05". */
export function dataHoraPt(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}, ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}
