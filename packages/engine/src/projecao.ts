// Projeção de movimentos e diferença contra a linha de base (DC-14, DC-18, DC-19).
// A diferença é calculada com a mesma necessidade dos dois lados (correlacionada), para que a
// incerteza da necessidade não seja contada duas vezes; quando a necessidade muda (E7), vale o
// cálculo independente, que é conservador.
import type { Movimento } from '@stacksync/content/tipos';
import { avaliarEixos, calcularAjuste, contribuicao, falta, sobra, type EixoAvaliado, type Parametros, type ResultadoAjuste } from './ajuste.ts';
import { inteiro, iv, pisoInt, tetoInt, type Intervalo } from './intervalo.ts';
import type { Contexto, Sobrescrita } from './nucleo.ts';
import type { FaixaIndice } from './tipos.ts';

export function sobrescritasDe(movimentos: Movimento[]): Record<string, Sobrescrita[]> {
  const out: Record<string, Sobrescrita[]> = {};
  for (const m of movimentos)
    for (const e of m.efeitos) {
      const chave = `${e.eixo}.${e.lado}`;
      const s: Sobrescrita = e.tipo === 'alinhar' ? { tipo: 'alinhar' } : { tipo: e.tipo, valor: iv(e.valor![0], e.valor![1]) };
      (out[chave] ??= []).push(s);
    }
  return out;
}

function deltaCorrelacionado(N: Intervalo, C: Intervalo, Cp: Intervalo, e: EixoAvaliado, p: Parametros): Intervalo {
  const w = p.pesos[e.id] ?? e.peso;
  const t = p.tolerancias[e.id] ?? e.tol;
  const c = (d: number) => w * (sobra(d, t.sobra, p.eMax) + falta(d, t.falta, p.eMax));
  const maxSobre = (X: Intervalo, n: number) => Math.max(c(X.lo - n), c(X.hi - n));
  const minSobre = (X: Intervalo, n: number) =>
    X.lo - n <= t.sobra && X.hi - n >= -t.falta ? 0 : Math.min(c(X.lo - n), c(X.hi - n));
  const ks = [t.sobra, t.sobra + p.eMax, -t.falta, -t.falta - p.eMax];
  const cand = new Set<number>([N.lo, N.hi]);
  for (const x of [C.lo, C.hi, Cp.lo, Cp.hi])
    for (const k of ks) {
      const n = x - k;
      if (n >= N.lo && n <= N.hi) cand.add(n);
    }
  for (let i = 1; i < 8; i++) cand.add(N.lo + ((N.hi - N.lo) * i) / 8);
  let lo = Infinity;
  let hi = -Infinity;
  for (const n of cand) {
    lo = Math.min(lo, minSobre(C, n) - maxSobre(Cp, n));
    hi = Math.max(hi, maxSobre(C, n) - minSobre(Cp, n));
  }
  return iv(lo, hi);
}

/** Necessidade mudou e capacidade ficou igual (ex.: E7 quando a distribuição muda): correlaciona pela capacidade. */
function deltaPelaCapacidade(C: Intervalo, N: Intervalo, Np: Intervalo, e: EixoAvaliado, p: Parametros): Intervalo {
  const w = p.pesos[e.id] ?? e.peso;
  const t = p.tolerancias[e.id] ?? e.tol;
  const c = (d: number) => w * (sobra(d, t.sobra, p.eMax) + falta(d, t.falta, p.eMax));
  const maxSobre = (X: Intervalo, cap: number) => Math.max(c(cap - X.lo), c(cap - X.hi));
  const minSobre = (X: Intervalo, cap: number) =>
    cap - X.hi <= t.sobra && cap - X.lo >= -t.falta ? 0 : Math.min(c(cap - X.lo), c(cap - X.hi));
  const ks = [t.sobra, t.sobra + p.eMax, -t.falta, -t.falta - p.eMax];
  const cand = new Set<number>([C.lo, C.hi]);
  for (const x of [N.lo, N.hi, Np.lo, Np.hi])
    for (const k of ks) {
      const cap = x + k;
      if (cap >= C.lo && cap <= C.hi) cand.add(cap);
    }
  for (let i = 1; i < 8; i++) cand.add(C.lo + ((C.hi - C.lo) * i) / 8);
  let lo = Infinity;
  let hi = -Infinity;
  for (const cap of cand) {
    lo = Math.min(lo, minSobre(N, cap) - maxSobre(Np, cap));
    hi = Math.max(hi, maxSobre(N, cap) - minSobre(Np, cap));
  }
  return iv(lo, hi);
}

export interface Comparacao {
  projetado: ResultadoAjuste;
  eixos: EixoAvaliado[];
  /** Diferença do Índice de Ajuste projetado contra a base, em pontos. */
  delta: FaixaIndice;
  deltaBruto: Intervalo;
  deltaPt: number;
  porEixo: Record<string, Intervalo>;
}

const iguais = (a: Intervalo | null, b: Intervalo | null) => !!a && !!b && a.lo === b.lo && a.hi === b.hi;

export function comparar(base: { eixos: EixoAvaliado[]; ajuste: ResultadoAjuste }, proj: EixoAvaliado[], p: Parametros, conf: { minimoSinal: number; confianca: { alta: number; media: number } }): Comparacao {
  const projetado = calcularAjuste(proj, p, conf.minimoSinal, conf.confianca);
  const escala = base.ajuste.bruto.escala;
  let lo = 0;
  let hi = 0;
  const porEixo: Record<string, Intervalo> = {};
  for (const b of base.eixos) {
    if (!b.avaliado) continue;
    const q = proj.find((x) => x.id === b.id)!;
    let d: Intervalo;
    if (!q.avaliado) d = iv(0);
    else if (iguais(b.N, q.N) && iguais(b.C, q.C) && !q.alinhado) d = iv(0);
    else if (iguais(b.N, q.N) && q.alinhado) d = contribuicao(b, p).total;
    else if (iguais(b.N, q.N)) d = deltaCorrelacionado(b.N!, b.C!, q.C!, b, p);
    else if (iguais(b.C, q.C) && !q.alinhado) d = deltaPelaCapacidade(b.C!, b.N!, q.N!, b, p);
    else {
      const cb = contribuicao(b, p).total;
      const cq = contribuicao(q, p).total;
      d = iv(cb.lo - cq.hi, cb.hi - cq.lo);
    }
    porEixo[b.id] = iv(d.lo * escala, d.hi * escala);
    lo += d.lo;
    hi += d.hi;
  }
  const deltaPt = projetado.bruto.indicePt - base.ajuste.bruto.indicePt;
  const dlo = lo * escala;
  const dhi = hi * escala;
  return {
    projetado,
    eixos: proj,
    delta: { lo: pisoInt(dlo), hi: tetoInt(dhi), pt: Math.min(Math.max(inteiro(deltaPt), pisoInt(dlo)), tetoInt(dhi)) },
    deltaBruto: iv(dlo, dhi),
    deltaPt,
    porEixo,
  };
}

export function projetar(ctx: Contexto, movimentos: Movimento[]): EixoAvaliado[] {
  return avaliarEixos(ctx, { sobrescritas: sobrescritasDe(movimentos) }).eixos;
}

/** Pontuação de invasividade para desempate (menor é menos invasivo). */
export function invasividade(movs: Movimento[]): number {
  let s = 0;
  for (const m of movs) {
    const i = m.invasividade;
    s += (i.escopo === 'total' ? 3 : 1) + (i.reversivel ? 0 : 3) + (i.trocaTecnologia ? 2 : 0) + (i.movimentaDados ? 2 : 0);
  }
  return s;
}

export function invasividadeAgregada(movs: Movimento[]) {
  return {
    escopo: movs.some((m) => m.invasividade.escopo === 'total') ? 'total' : 'parcial',
    reversivel: movs.every((m) => m.invasividade.reversivel),
    trocaTecnologia: movs.some((m) => m.invasividade.trocaTecnologia),
    movimentaDados: movs.some((m) => m.invasividade.movimentaDados),
  } as const;
}
