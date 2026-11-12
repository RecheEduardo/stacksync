// Intervalo como tipo básico (DC-02). Só as quatro operações básicas (DC-01, FF-02).
export interface Intervalo {
  lo: number;
  hi: number;
}

export const iv = (lo: number, hi: number = lo): Intervalo => (lo <= hi ? { lo, hi } : { lo: hi, hi: lo });
export const ponto = (a: Intervalo): number => (a.lo + a.hi) / 2;
export const largura = (a: Intervalo): number => a.hi - a.lo;

export const soma = (a: Intervalo, b: Intervalo): Intervalo => ({ lo: a.lo + b.lo, hi: a.hi + b.hi });
export const subtrai = (a: Intervalo, b: Intervalo): Intervalo => ({ lo: a.lo - b.hi, hi: a.hi - b.lo });
export const escala = (a: Intervalo, k: number): Intervalo => (k >= 0 ? { lo: a.lo * k, hi: a.hi * k } : { lo: a.hi * k, hi: a.lo * k });
export const minI = (a: Intervalo, b: Intervalo): Intervalo => ({ lo: Math.min(a.lo, b.lo), hi: Math.min(a.hi, b.hi) });
export const maxI = (a: Intervalo, b: Intervalo): Intervalo => ({ lo: Math.max(a.lo, b.lo), hi: Math.max(a.hi, b.hi) });
export const limita = (a: Intervalo, lo: number, hi: number): Intervalo => ({
  lo: Math.min(Math.max(a.lo, lo), hi),
  hi: Math.min(Math.max(a.hi, lo), hi),
});
export const casco = (a: Intervalo, b: Intervalo): Intervalo => ({ lo: Math.min(a.lo, b.lo), hi: Math.max(a.hi, b.hi) });
export const alarga = (a: Intervalo, d: number): Intervalo => ({ lo: a.lo - d, hi: a.hi + d });

export function mediaPonderada(itens: Array<{ peso: number; valor: Intervalo }>): Intervalo {
  let pesos = 0;
  let lo = 0;
  let hi = 0;
  for (const { peso, valor } of itens) {
    pesos += peso;
    lo += peso * valor.lo;
    hi += peso * valor.hi;
  }
  return { lo: lo / pesos, hi: hi / pesos };
}

/** Arredonda a 6 casas para neutralizar ruído de ponto flutuante antes de pisos e tetos. */
export const r6 = (x: number): number => Math.round(x * 1e6) / 1e6;
/** Nível com 1 casa decimal (DC-01). */
export const nivel = (x: number): number => Math.round(r6(x) * 10) / 10;
/** Índice inteiro: ponto arredondado, faixa para fora (conservadora). */
export const inteiro = (x: number): number => Math.round(r6(x));
export const pisoInt = (x: number): number => Math.floor(r6(x));
export const tetoInt = (x: number): number => Math.ceil(r6(x));

/** Potência inteira por multiplicação repetida (DC-01: sem Math.pow). */
export function potencia(base: number, expoente: number): number {
  let r = 1;
  for (let i = 0; i < expoente; i++) r *= base;
  return r;
}
