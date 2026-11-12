// Núcleo do motor: aplicabilidade, normalização das respostas (DC-03) e derivação dos níveis
// por eixo a partir das regras declarativas do conteúdo (DC-04, Parte 4 9.5). Puro (FF-02).
import type {
  Condicao,
  Eixo,
  Expr,
  Faixa,
  ModeloEixos,
  PacoteConteudo,
  Pergunta,
  Profundidade,
  Subnivel,
  Tecnologia,
} from '@stacksync/content/tipos';
import {
  alarga,
  casco,
  iv,
  limita,
  maxI,
  mediaPonderada,
  minI,
  potencia,
  soma,
  subtrai,
  type Intervalo,
} from './intervalo.ts';
import type { Certeza, EntradaAvaliacao, RespostaEntrada, SinalUsado } from './tipos.ts';

export interface RespostaNorm {
  pergunta: string;
  opcoes: string[];
  multipla: boolean;
  origem: Certeza;
  marcas: string[];
  faixaSinal?: { sinal: string; faixa: Faixa } | undefined;
  rotulo: string;
}

export interface Contexto {
  conteudo: PacoteConteudo;
  modelo: ModeloEixos;
  subnivel: Subnivel;
  profundidade: Profundidade;
  asOf: string;
  temIdeia: boolean;
  respostas: Record<string, RespostaNorm>;
  aplicaveis: Set<string>;
  /** Tecnologia em avaliação (modelo de ferramenta). */
  tecnologia?: TecnologiaAvaliada | undefined;
  /** Usa a "solução mais simples" como capacidade (planejamento de sistema novo). */
  usarFormaMaisSimples: boolean;
}

export interface TecnologiaAvaliada {
  tec: Tecnologia;
  categoria: string;
  ciclo: string | null;
  /** Faixa de ciclo de vida calculada a partir do fim de suporte e da licença. */
  cicloFaixa: Intervalo;
  conhecimento: Intervalo | null;
  mercado: Intervalo;
}

// ---------------------------------------------------------------- respostas e condições

function mesesEntre(asOf: string, mes: string): number {
  const [a, b] = asOf.split('-').map(Number) as [number, number];
  const [c, d] = mes.split('-').map(Number) as [number, number];
  return (a - c) * 12 + (b - d);
}

export function rotuloOpcao(p: Pergunta | undefined, id: string, conteudo: PacoteConteudo): string {
  if (!p) return id;
  const o = p.opcoes.find((x) => x.id === id);
  if (o) return o.rotulo;
  if (p.opcoesDinamicas === 'tecnologias') return conteudo.tecnologias[id]?.nome ?? id;
  return id;
}

export function normalizar(
  conteudo: PacoteConteudo,
  profundidade: Profundidade,
  asOf: string,
  respostas: Record<string, RespostaEntrada>,
): Record<string, RespostaNorm> {
  const cal = conteudo.calibracao;
  const out: Record<string, RespostaNorm> = {};
  for (const [id, r] of Object.entries(respostas)) {
    const p = conteudo.perguntas[id];
    const multipla = p?.tipo === 'multipla';
    const marcas: string[] = [];
    let origem: Certeza = r.origem;
    let opcoes: string[] = [];
    if (r.valor !== null && r.valor !== undefined) opcoes = Array.isArray(r.valor) ? [...r.valor] : [r.valor];
    if (r.faixaOpcoes && r.faixaOpcoes.length) opcoes = [...r.faixaOpcoes];
    if (origem === 'desconhecida' || origem === 'nao_se_aplica') opcoes = [];
    if (origem === 'medida') {
      if (!r.fonte || !r.medidaEm) {
        origem = 'estimativa';
        marcas.push('sem_fonte');
      } else if (mesesEntre(asOf, r.medidaEm) > cal.validadeMeses) {
        origem = 'estimativa';
        marcas.push('antiga');
      }
    }
    if (profundidade === 'rapido' && origem === 'medida') origem = 'estimativa';
    if (r.alteradaAposVeredito) marcas.push('alterada_apos_veredito');
    if (r.textoLivre) marcas.push('texto_livre');
    const rotulo =
      origem === 'desconhecida'
        ? 'Não sei'
        : origem === 'nao_se_aplica'
          ? 'Não se aplica'
          : opcoes.map((o) => rotuloOpcao(p, o, conteudo)).join(multipla ? ', ' : ' a ');
    out[id] = { pergunta: id, opcoes, multipla, origem, marcas, faixaSinal: r.faixaSinal, rotulo };
  }
  return out;
}

export function avaliarCondicao(
  c: Condicao,
  respostas: Record<string, RespostaNorm>,
  ctx: { temIdeia: boolean; profundidade: Profundidade; subnivel: Subnivel },
): boolean {
  if ('todas' in c) return c.todas.every((x) => avaliarCondicao(x, respostas, ctx));
  if ('alguma' in c) return c.alguma.some((x) => avaliarCondicao(x, respostas, ctx));
  if ('nao' in c) return !avaliarCondicao(c.nao, respostas, ctx);
  if ('ideiaPrevia' in c) return c.ideiaPrevia === ctx.temIdeia;
  if ('profundidade' in c) return c.profundidade.includes(ctx.profundidade);
  if ('subnivel' in c) return c.subnivel.includes(ctx.subnivel);
  const r = respostas[c.pergunta];
  const conhecidas = r && r.origem !== 'desconhecida' && r.origem !== 'nao_se_aplica' ? r.opcoes : [];
  if ('respondida' in c) return (conhecidas.length > 0 || (r?.multipla === true && r.origem !== 'desconhecida')) === c.respondida;
  if (!conhecidas.length) return false;
  if ('em' in c) return r!.multipla ? conhecidas.some((o) => c.em.includes(o)) : conhecidas.every((o) => c.em.includes(o));
  return !conhecidas.some((o) => c.naoEm.includes(o));
}

/** Perguntas aplicáveis ao enquadramento e às respostas atuais. Com `modos`, filtra pelo nível. */
export function aplicaveis(
  conteudo: PacoteConteudo,
  subnivel: Subnivel,
  profundidade: Profundidade,
  respostas: Record<string, RespostaNorm>,
  temIdeia: boolean,
  modos?: Array<'E' | 'C'>,
): string[] {
  const ctx = { temIdeia, profundidade, subnivel };
  // Condições podem depender de perguntas que só valem se elas mesmas forem aplicáveis: iteramos até estabilizar.
  let atual = new Set<string>();
  for (let rodada = 0; rodada < 4; rodada++) {
    const visiveis: Record<string, RespostaNorm> = {};
    for (const [k, v] of Object.entries(respostas)) if (rodada === 0 || atual.has(k)) visiveis[k] = v;
    const prox = new Set<string>();
    for (const id of conteudo.ordemPerguntas) {
      const p = conteudo.perguntas[id]!;
      if (!p.subniveis.includes(subnivel)) continue;
      if (modos && !modos.includes(p.modo)) continue;
      if (p.condicao && !avaliarCondicao(p.condicao, visiveis, ctx)) continue;
      prox.add(id);
    }
    const igual = prox.size === atual.size && [...prox].every((x) => atual.has(x));
    atual = prox;
    if (igual) break;
  }
  return conteudo.ordemPerguntas.filter((id) => atual.has(id));
}

export function criarContexto(
  conteudo: PacoteConteudo,
  entrada: EntradaAvaliacao,
  tecnologia?: TecnologiaAvaliada,
): Contexto {
  const sub = conteudo.estrutura.subniveis[entrada.subnivel];
  const respostas = normalizar(conteudo, entrada.profundidade, entrada.asOf, entrada.respostas);
  const temIdeia = !!entrada.ideia?.texto;
  return {
    conteudo,
    modelo: conteudo.modelos[sub.modelo],
    subnivel: entrada.subnivel,
    profundidade: entrada.profundidade,
    asOf: entrada.asOf,
    temIdeia,
    respostas,
    aplicaveis: new Set(aplicaveis(conteudo, entrada.subnivel, entrada.profundidade, respostas, temIdeia)),
    tecnologia,
    usarFormaMaisSimples: sub.linhaDeBase === 'mais_simples',
  };
}

// ---------------------------------------------------------------- derivação

export interface Valor {
  faixa: Intervalo;
  perguntado: boolean;
  conhecido: boolean;
  estrutural: boolean;
}

const NADA: Valor = { faixa: iv(0), perguntado: false, conhecido: false, estrutural: false };

export interface LadoAvaliado {
  faixa: Intervalo | null;
  conhecido: boolean;
  sinais: SinalUsado[];
  guardas: string[];
}

export type Sobrescrita = { tipo: 'alvo' | 'piso' | 'teto'; valor: Intervalo } | { tipo: 'alinhar' };

export interface OpcoesDerivacao {
  /** Projeção: efeitos sobre lados de eixos ('E2.C'). */
  sobrescritas?: Record<string, Sobrescrita[]> | undefined;
  /** Robustez: força os sinais de uma pergunta para o extremo da faixa. */
  extremo?: { pergunta: string; lado: 'lo' | 'hi' } | undefined;
  /** Fixa o valor de uma referência (ex.: 'E1.N'), para calcular desvios correlacionados. */
  refsFixas?: Record<string, Intervalo> | undefined;
}

export function avaliarSinal(ctx: Contexto, id: string, usados: SinalUsado[] | null, op: OpcoesDerivacao): Valor {
  const s = ctx.modelo.sinais[id];
  if (!s) throw new Error(`Sinal inexistente: ${id}`);
  const r = ctx.respostas[s.pergunta];
  if (!r || !ctx.aplicaveis.has(s.pergunta) || r.origem === 'nao_se_aplica') return NADA;
  const cal = ctx.conteudo.calibracao;
  const dom = iv(s.dominio[0], s.dominio[1]);
  let faixa: Intervalo;
  let conhecido = true;
  if (r.origem === 'desconhecida') {
    faixa = dom;
    conhecido = false;
  } else {
    let base: Intervalo | null = null;
    if (r.faixaSinal && r.faixaSinal.sinal === id) base = iv(r.faixaSinal.faixa[0], r.faixaSinal.faixa[1]);
    else if (s.mapaMultipla) {
      let t = 0;
      for (const o of r.opcoes) t += s.mapaMultipla.pesos[o] ?? 0;
      base = iv(Math.min(t, s.mapaMultipla.teto));
    } else if (s.mapa) {
      for (const o of r.opcoes) {
        const f = s.mapa[o];
        if (f) base = base ? casco(base, iv(f[0], f[1])) : iv(f[0], f[1]);
      }
    }
    if (!base) {
      faixa = dom;
      conhecido = false;
    } else {
      const k =
        r.origem === 'medida' ? cal.fatoresOrigem.medida : r.origem === 'inferencia' ? cal.fatoresOrigem.inferencia : cal.fatoresOrigem.estimativa;
      faixa = limita(alarga(base, (1 - k) * cal.delta), dom.lo, dom.hi);
    }
  }
  if (op.extremo && op.extremo.pergunta === s.pergunta) faixa = op.extremo.lado === 'lo' ? iv(faixa.lo) : iv(faixa.hi);
  usados?.push({
    id,
    rotulo: s.rotulo,
    pergunta: s.pergunta,
    resposta: r.rotulo,
    origem: r.origem,
    faixa,
    efeito: s.efeito,
    marcas: r.marcas,
  });
  return { faixa, perguntado: true, conhecido, estrutural: false };
}

export class Derivacao {
  private cache = new Map<string, LadoAvaliado>();
  private emCurso = new Set<string>();
  constructor(
    private ctx: Contexto,
    private op: OpcoesDerivacao = {},
  ) {}

  eixo(id: string): Eixo {
    const e = this.ctx.modelo.eixos.find((x) => x.id === id);
    if (!e) throw new Error(`Eixo inexistente: ${id}`);
    return e;
  }

  lado(eixoId: string, lado: 'N' | 'C'): LadoAvaliado {
    const chave = `${eixoId}.${lado}`;
    const pronto = this.cache.get(chave);
    if (pronto) return pronto;
    if (this.emCurso.has(chave)) throw new Error(`Dependência circular em ${chave}`);
    this.emCurso.add(chave);
    const r = this.calcular(eixoId, lado);
    this.emCurso.delete(chave);
    this.cache.set(chave, r);
    return r;
  }

  /** Lado sem as sobrescritas de projeção (para a referência "alinhar" ao valor da necessidade). */
  private calcular(eixoId: string, lado: 'N' | 'C'): LadoAvaliado {
    const ctx = this.ctx;
    const eixo = this.eixo(eixoId);
    const def = lado === 'N' ? eixo.necessidade : eixo.capacidade;
    const usados: SinalUsado[] = [];
    const guardas: string[] = [];
    let v: Valor;
    const mais = ctx.modelo.formaMaisSimples?.[eixoId];
    if (lado === 'C' && ctx.usarFormaMaisSimples && mais) {
      v = { faixa: iv(mais[0], mais[1]), perguntado: true, conhecido: true, estrutural: true };
      guardas.push('Forma mais simples: um artefato, módulos internos, banco único, comunicação no mesmo processo.');
    } else {
      v = this.expr(def.expr, usados);
      for (const g of def.guardas ?? []) {
        if (!avaliarCondicao(g.quando, this.visiveis(), ctx)) continue;
        if (g.valor) {
          v = { faixa: iv(g.valor[0], g.valor[1]), perguntado: true, conhecido: true, estrutural: false };
          guardas.push(g.motivo);
        } else if (v.perguntado) {
          if (g.teto !== undefined && v.faixa.hi > g.teto) {
            v = { ...v, faixa: iv(Math.min(v.faixa.lo, g.teto), g.teto) };
            guardas.push(g.motivo);
          }
          if (g.piso !== undefined && v.faixa.lo < g.piso) {
            v = { ...v, faixa: iv(g.piso, Math.max(v.faixa.hi, g.piso)) };
            guardas.push(g.motivo);
          }
        }
      }
      if (lado === 'C' && eixoId === ctx.modelo.quantitativo?.eixo && v.perguntado) v = this.quantitativo(v, guardas);
      if (lado === 'C' && ctx.tecnologia && v.perguntado) v = this.requisitos(eixoId, v, guardas);
    }
    let faixa: Intervalo | null = v.perguntado ? limita(v.faixa, 0, 4) : null;
    const sobrescritas = this.op.sobrescritas?.[`${eixoId}.${lado}`];
    if (sobrescritas && faixa) {
      for (const s of sobrescritas) {
        if (s.tipo === 'alinhar') faixa = this.lado(eixoId, lado === 'C' ? 'N' : 'C').faixa ?? faixa;
        else if (s.tipo === 'alvo') faixa = s.valor;
        else if (s.tipo === 'piso') faixa = maxI(faixa, s.valor);
        else faixa = minI(faixa, s.valor);
      }
    }
    return { faixa, conhecido: v.conhecido || v.estrutural, sinais: usados, guardas };
  }

  private visiveis(): Record<string, RespostaNorm> {
    const out: Record<string, RespostaNorm> = {};
    for (const [k, v] of Object.entries(this.ctx.respostas)) if (this.ctx.aplicaveis.has(k)) out[k] = v;
    return out;
  }

  private quantitativo(v: Valor, guardas: string[]): Valor {
    const q = this.ctx.modelo.quantitativo!;
    const resp = (id: string) => {
      const r = this.ctx.respostas[id];
      return r && this.ctx.aplicaveis.has(id) && r.origem !== 'desconhecida' && r.origem !== 'nao_se_aplica' && r.opcoes.length === 1
        ? r.opcoes[0]!
        : null;
    };
    const s = resp(q.saltos.pergunta);
    const d = resp(q.disponibilidadeParte.pergunta);
    const m = resp(q.meta.pergunta);
    if (!s || !d || !m) return v;
    const saltos = q.saltos.valores[s];
    const disp = q.disponibilidadeParte.valores[d];
    const meta = q.meta.valores[m];
    if (!saltos || disp === undefined || meta === undefined) return v;
    const tolerado = 1 - meta;
    const deficit = (n: number) => {
      const indisponivel = 1 - potencia(disp, n);
      if (indisponivel <= tolerado) return 0;
      return indisponivel > 2 * tolerado ? 2 : 1;
    };
    const lo = deficit(saltos[0]);
    const hi = deficit(saltos[1]);
    const melhor = potencia(disp, saltos[0]);
    const pior = potencia(disp, saltos[1]);
    this.notaQuantitativa = { pior, melhor, meta };
    if (hi === 0) return v;
    guardas.push('Verificação quantitativa: a disponibilidade composta da cadeia viola a meta (K-16).');
    return { ...v, faixa: limita(subtrai(v.faixa, iv(lo, hi)), 0, 4) };
  }

  notaQuantitativa: { pior: number; melhor: number; meta: number } | null = null;

  private requisitos(eixoId: string, v: Valor, guardas: string[]): Valor {
    const tec = this.ctx.tecnologia!.tec;
    let faixa = v.faixa;
    for (const r of this.ctx.modelo.requisitos ?? []) {
      if (r.eixo !== eixoId) continue;
      if (r.categoria && r.categoria !== this.ctx.tecnologia!.categoria) continue;
      if (!avaliarCondicao(r.quando, this.visiveis(), this.ctx)) continue;
      if ((tec.atende ?? []).includes(r.requer)) continue;
      faixa = limita(subtrai(faixa, iv(r.penalidade)), 0, 4);
      guardas.push(r.motivo);
    }
    return { ...v, faixa };
  }

  expr(e: Expr, usados: SinalUsado[]): Valor {
    if ('sinal' in e) return avaliarSinal(this.ctx, e.sinal, usados, this.op);
    if ('constante' in e) return { faixa: iv(e.constante), perguntado: true, conhecido: false, estrutural: true };
    if ('ref' in e) {
      const fixa = this.op.refsFixas?.[e.ref];
      if (fixa) return { faixa: fixa, perguntado: true, conhecido: true, estrutural: false };
      const [eixo, lado] = e.ref.split('.') as [string, 'N' | 'C'];
      const l = this.lado(eixo, lado);
      return l.faixa ? { faixa: l.faixa, perguntado: true, conhecido: l.conhecido, estrutural: false } : NADA;
    }
    if ('tecnologia' in e) {
      const t = this.ctx.tecnologia;
      if (!t) return NADA;
      const p = t.tec.perfil;
      const f = (x: Faixa) => iv(x[0], x[1]);
      let faixa: Intervalo | null = null;
      switch (e.tecnologia) {
        case 'capacidade': {
          const c = p.capacidade[t.categoria];
          faixa = c ? f(c) : null;
          break;
        }
        case 'ecossistema':
          faixa = f(p.ecossistema);
          break;
        case 'seguranca':
          faixa = f(p.seguranca);
          break;
        case 'exigenciaOperacional':
          faixa = f(p.exigenciaOperacional);
          break;
        case 'mercado':
          faixa = t.mercado;
          break;
        case 'ciclo':
          faixa = t.cicloFaixa;
          break;
        case 'conhecimento':
          faixa = t.conhecimento;
          break;
      }
      return faixa ? { faixa, perguntado: true, conhecido: true, estrutural: false } : NADA;
    }
    if ('media' in e) {
      const itens = e.media.map((x) => ({ peso: x.peso, v: this.expr(x.expr, usados) })).filter((x) => x.v.perguntado);
      if (!itens.length) return NADA;
      return {
        faixa: mediaPonderada(itens.map((x) => ({ peso: x.peso, valor: x.v.faixa }))),
        perguntado: true,
        conhecido: itens.some((x) => x.v.conhecido),
        estrutural: itens.every((x) => x.v.estrutural),
      };
    }
    if ('soma' in e) {
      const vs = e.soma.map((x) => this.expr(x, usados));
      if (!vs.some((x) => x.perguntado && !x.estrutural)) return NADA;
      const validos = vs.filter((x) => x.perguntado);
      return {
        faixa: validos.reduce((acc, x) => soma(acc, x.faixa), iv(0)),
        perguntado: true,
        conhecido: validos.some((x) => x.conhecido),
        estrutural: false,
      };
    }
    if ('subtrai' in e) {
      const a = this.expr(e.subtrai[0], usados);
      if (!a.perguntado) {
        this.expr(e.subtrai[1], usados);
        return NADA;
      }
      const b = this.expr(e.subtrai[1], usados);
      if (!b.perguntado) return a;
      return { faixa: subtrai(a.faixa, b.faixa), perguntado: true, conhecido: a.conhecido || b.conhecido, estrutural: false };
    }
    if ('min' in e || 'max' in e) {
      const lista = 'min' in e ? e.min : e.max;
      const vs = lista.map((x) => this.expr(x, usados)).filter((x) => x.perguntado);
      if (!vs.length) return NADA;
      const f = vs.slice(1).reduce((acc, x) => ('min' in e ? minI(acc, x.faixa) : maxI(acc, x.faixa)), vs[0]!.faixa);
      return { faixa: f, perguntado: true, conhecido: vs.some((x) => x.conhecido), estrutural: vs.every((x) => x.estrutural) };
    }
    if ('limita' in e) {
      const v = this.expr(e.limita.valor, usados);
      return v.perguntado ? { ...v, faixa: limita(v.faixa, e.limita.faixa[0], e.limita.faixa[1]) } : v;
    }
    if ('primeiro' in e) {
      for (const x of e.primeiro) {
        const v = this.expr(x, usados);
        if (v.perguntado) return v;
      }
      return NADA;
    }
    throw new Error('Expressão desconhecida');
  }
}
