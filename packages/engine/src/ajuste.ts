// Desvios, tolerância, saturação, O, U e Índice de Ajuste em faixa (P3 9.3; DC-05, DC-06, DC-07).
import type { Calibracao } from '@stacksync/content/tipos';
import { inteiro, iv, pisoInt, ponto, r6, tetoInt, type Intervalo } from './intervalo.ts';
import { Derivacao, type Contexto, type OpcoesDerivacao } from './nucleo.ts';
import type { Categoria, FaixaIndice, SinalUsado } from './tipos.ts';

export interface EixoAvaliado {
  id: string;
  nome: string;
  peso: number;
  avaliado: boolean;
  temSinal: boolean;
  N: Intervalo | null;
  C: Intervalo | null;
  d: Intervalo | null;
  dPt: number | null;
  alinhado: boolean;
  tol: { sobra: number; falta: number };
  sinaisN: SinalUsado[];
  sinaisC: SinalUsado[];
  guardas: string[];
}

export interface Parametros {
  pesos: Record<string, number>;
  tolerancias: Record<string, { sobra: number; falta: number }>;
  eMax: number;
  limiar: number;
}

export const parametrosDe = (cal: Calibracao): Parametros => ({
  pesos: cal.pesos,
  tolerancias: cal.tolerancias,
  eMax: cal.eMax,
  limiar: cal.limiarCategoria,
});

export function avaliarEixos(ctx: Contexto, op: OpcoesDerivacao = {}): { eixos: EixoAvaliado[]; der: Derivacao } {
  const der = new Derivacao(ctx, op);
  const cal = ctx.conteudo.calibracao;
  const eixos = ctx.modelo.eixos.map((e): EixoAvaliado => {
    const n = der.lado(e.id, 'N');
    let c = der.lado(e.id, 'C');
    const avaliado = !!(n.faixa && c.faixa);
    const sobres = op.sobrescritas?.[`${e.id}.C`];
    const alinhado = !!sobres?.length && sobres[sobres.length - 1]!.tipo === 'alinhar';
    let d = avaliado ? (alinhado ? iv(0) : iv(c.faixa!.lo - n.faixa!.hi, c.faixa!.hi - n.faixa!.lo)) : null;
    let dPt = avaliado ? (alinhado ? 0 : r6(ponto(c.faixa!) - ponto(n.faixa!))) : null;
    // Capacidade que depende da própria necessidade (ex.: E1): desvio exato, sem contar a incerteza
    // da necessidade duas vezes. Vale porque C(N) − N não cresce com N (inclinação de C em N ≤ 1).
    const refPropria = `${e.id}.N`;
    if (avaliado && !alinhado && JSON.stringify(e.capacidade.expr).includes(`"ref":"${refPropria}"`)) {
      const com = (v: Intervalo) => new Derivacao(ctx, { ...op, refsFixas: { ...(op.refsFixas ?? {}), [refPropria]: v } }).lado(e.id, 'C').faixa!;
      const N = n.faixa!;
      const cLo = com(iv(N.lo));
      const cHi = com(iv(N.hi));
      const cPt = com(iv(ponto(N)));
      d = iv(cHi.lo - N.hi, cLo.hi - N.lo);
      dPt = r6(ponto(cPt) - ponto(N));
      c = { ...c, faixa: iv(Math.min(cLo.lo, cHi.lo), Math.max(cLo.hi, cHi.hi)) };
    }
    return {
      id: e.id,
      nome: e.nome,
      peso: cal.pesos[e.id]!,
      avaliado,
      temSinal: avaliado && (n.conhecido || c.conhecido),
      N: n.faixa,
      C: c.faixa,
      d,
      dPt,
      alinhado,
      tol: cal.tolerancias[e.id]!,
      sinaisN: n.sinais,
      sinaisC: c.sinais,
      guardas: [...n.guardas, ...c.guardas],
    };
  });
  return { eixos, der };
}

// e⁺ e e⁻ por eixo (P3 9.3)
export const sobra = (d: number, t: number, eMax: number) => Math.min(Math.max(0, d - t), eMax);
export const falta = (d: number, t: number, eMax: number) => Math.min(Math.max(0, -d - t), eMax);

export interface Contribuicao {
  O: Intervalo;
  U: Intervalo;
  total: Intervalo;
  pt: { O: number; U: number };
}

export function contribuicao(e: EixoAvaliado, p: Parametros): Contribuicao {
  const w = p.pesos[e.id] ?? e.peso;
  const t = p.tolerancias[e.id] ?? e.tol;
  if (!e.d) return { O: iv(0), U: iv(0), total: iv(0), pt: { O: 0, U: 0 } };
  const { lo, hi } = e.d;
  const cAt = (d: number) => w * (sobra(d, t.sobra, p.eMax) + falta(d, t.falta, p.eMax));
  const tocaZona = lo <= t.sobra && hi >= -t.falta;
  const minTotal = tocaZona ? 0 : Math.min(cAt(lo), cAt(hi));
  return {
    O: iv(w * sobra(lo, t.sobra, p.eMax), w * sobra(hi, t.sobra, p.eMax)),
    U: iv(w * falta(hi, t.falta, p.eMax), w * falta(lo, t.falta, p.eMax)),
    total: iv(minTotal, Math.max(cAt(lo), cAt(hi))),
    pt: { O: w * sobra(e.dPt!, t.sobra, p.eMax), U: w * falta(e.dPt!, t.falta, p.eMax) },
  };
}

export interface ResultadoAjuste {
  indice: FaixaIndice;
  O: FaixaIndice;
  U: FaixaIndice;
  /** Valores brutos (sem arredondar), para comparações e diferenças. */
  bruto: { indice: Intervalo; indicePt: number; O: Intervalo; U: Intervalo; Opt: number; Upt: number; escala: number };
  categoria: Categoria;
  categoriasPossiveis: Categoria[];
  predominante: 'sobra' | 'falta' | null;
  confianca: 'alta' | 'media' | 'baixa';
  pesoSemSinal: number;
}

const faixaInt = (lo: number, hi: number, pt: number): FaixaIndice => {
  const plo = pisoInt(lo);
  const phi = tetoInt(hi);
  const ppt = Math.min(Math.max(inteiro(pt), plo), phi);
  return { lo: plo, hi: phi, pt: ppt };
};

export function calcularAjuste(eixos: EixoAvaliado[], p: Parametros, minimoSinal: number, conf: { alta: number; media: number }): ResultadoAjuste {
  const avaliados = eixos.filter((e) => e.avaliado);
  const pesoTotal = eixos.reduce((s, e) => s + (p.pesos[e.id] ?? e.peso), 0);
  const pesoSemSinal = eixos.filter((e) => !e.temSinal).reduce((s, e) => s + (p.pesos[e.id] ?? e.peso), 0) / (pesoTotal || 1);
  const W = avaliados.reduce((s, e) => s + (p.pesos[e.id] ?? e.peso), 0);
  const escala = W > 0 ? 100 / (p.eMax * W) : 0;
  const cs = avaliados.map((e) => ({ e, c: contribuicao(e, p) }));
  const somaI = (f: (c: Contribuicao) => number) => cs.reduce((s, x) => s + f(x.c), 0);
  const O = iv(escala * somaI((c) => c.O.lo), escala * somaI((c) => c.O.hi));
  const U = iv(escala * somaI((c) => c.U.lo), escala * somaI((c) => c.U.hi));
  const indice = iv(100 - escala * somaI((c) => c.total.hi), 100 - escala * somaI((c) => c.total.lo));
  const Opt = escala * somaI((c) => c.pt.O);
  const Upt = escala * somaI((c) => c.pt.U);
  const indicePt = 100 - Opt - Upt;

  // Categorias alcançáveis (DC-06, com o ponto mais próximo da zona de tolerância para o Ajustado).
  const L = p.limiar;
  const possiveis = new Set<Categoria>();
  if (W === 0 || pesoSemSinal > 1 - minimoSinal) {
    possiveis.add('inconclusivo');
  } else {
    const perto = cs.reduce(
      (acc, { e, c }) => {
        const t = p.tolerancias[e.id] ?? e.tol;
        if (e.d!.lo <= t.sobra && e.d!.hi >= -t.falta) return acc;
        return e.d!.lo > t.sobra ? { O: acc.O + c.O.lo, U: acc.U } : { O: acc.O, U: acc.U + c.U.lo };
      },
      { O: 0, U: 0 },
    );
    if (r6(escala * perto.O) < L && r6(escala * perto.U) < L) possiveis.add('ajustado');
    if (r6(O.hi) >= L && r6(escala * somaI((c) => c.U.lo)) < L) possiveis.add('sobreajustado');
    if (r6(U.hi) >= L && r6(escala * somaI((c) => c.O.lo)) < L) possiveis.add('subajustado');
    // Misto: enumeração dos vértices (2^n, n ≤ 8).
    const n = cs.length;
    let misto = false;
    for (let mask = 0; mask < 1 << n && !misto; mask++) {
      let o = 0;
      let u = 0;
      for (let i = 0; i < n; i++) {
        const { c } = cs[i]!;
        if (mask & (1 << i)) {
          o += c.O.hi;
          u += c.U.lo;
        } else {
          o += c.O.lo;
          u += c.U.hi;
        }
      }
      if (r6(escala * o) >= L && r6(escala * u) >= L) misto = true;
    }
    if (misto) possiveis.add('misto');
  }
  const ordem: Categoria[] = ['ajustado', 'sobreajustado', 'subajustado', 'misto', 'inconclusivo'];
  const categoriasPossiveis = ordem.filter((c) => possiveis.has(c));
  const categoria: Categoria = categoriasPossiveis.length === 1 ? categoriasPossiveis[0]! : 'indefinido';
  const indiceF = faixaInt(indice.lo, indice.hi, indicePt);
  const largura = indiceF.hi - indiceF.lo;
  return {
    indice: indiceF,
    O: faixaInt(O.lo, O.hi, Opt),
    U: faixaInt(U.lo, U.hi, Upt),
    bruto: { indice, indicePt, O, U, Opt, Upt, escala },
    categoria,
    categoriasPossiveis,
    predominante: categoria === 'misto' ? (Opt >= 2 * Upt ? 'sobra' : Upt >= 2 * Opt ? 'falta' : null) : null,
    confianca: largura <= conf.alta ? 'alta' : largura <= conf.media ? 'media' : 'baixa',
    pesoSemSinal,
  };
}

export function ladoDe(e: EixoAvaliado, p: Parametros): 'sobra' | 'falta' | 'dentro' {
  if (e.dPt === null) return 'dentro';
  const t = p.tolerancias[e.id] ?? e.tol;
  if (e.dPt > t.sobra) return 'sobra';
  if (e.dPt < -t.falta) return 'falta';
  return 'dentro';
}
