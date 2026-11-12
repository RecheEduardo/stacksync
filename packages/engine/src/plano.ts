// Direções de ajuste (P3 9.6) e plano ideal em camadas (P3 9.11; DC-19; RN-94).
// O plano só traz mudança quando o ganho passa da materialidade no limite desfavorável (RN-73, RN-74).
import type { Movimento, PacoteConteudo, Profundidade, Subnivel } from '@stacksync/content/tipos';
import { calcularAjuste, contribuicao, ladoDe, parametrosDe, type EixoAvaliado, type Parametros, type ResultadoAjuste } from './ajuste.ts';
import { inteiro, iv, pisoInt, ponto, tetoInt } from './intervalo.ts';
import { formatar, lista, type Valores } from './mensagens.ts';
import type { Contexto } from './nucleo.ts';
import { comparar, invasividade, projetar, type Comparacao } from './projecao.ts';
import { avaliarDecisao, avaliarTecnologia, candidatasDa, linhaTecnologia, ordenarAvaliacoes, type AvaliacaoTecnologia } from './tecnologias.ts';
import type { DecisaoTecnologica, Direcao, FaixaIndice, PassoPlano, Plano, Razao, VariantePlano } from './tipos.ts';

export const t = (conteudo: PacoteConteudo, chave: string, valores: Valores = {}): string => {
  const fonte = conteudo.textos[chave];
  if (fonte === undefined) throw new Error(`Texto ausente: ${chave}`);
  return formatar(fonte, valores);
};

export function camadasDo(profundidade: Profundidade): Plano['camadas'] {
  if (profundidade === 'rapido') return ['direcoes', 'forma'];
  if (profundidade === 'equilibrado') return ['direcoes', 'forma', 'tecnologias'];
  return ['direcoes', 'forma', 'tecnologias', 'passos'];
}

export function frasesAderencia(conteudo: PacoteConteudo, f: FaixaIndice, prefixo: 'aderencia' | 'plano.aderencia'): { frases: string[]; curtas: string[] } {
  const limites = conteudo.calibracao.faixasAderencia;
  const faixa = (v: number) => (v >= limites[3] ? 85 : v >= limites[2] ? 70 : v >= limites[1] ? 50 : v >= limites[0] ? 30 : 0);
  const a = faixa(f.hi);
  const b = faixa(f.lo);
  if (a === b) return { frases: [t(conteudo, `${prefixo}.${a}`)], curtas: [t(conteudo, `aderencia.curta.${a}`)] };
  return {
    frases: [t(conteudo, `${prefixo}.${a}`), t(conteudo, `${prefixo}.${b}`)],
    curtas: [t(conteudo, `aderencia.curta.${a}`), t(conteudo, `aderencia.curta.${b}`)],
  };
}

export const comSinalInt = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

// ---------------------------------------------------------------- direções (informativas)

const PRIORIDADE: Record<string, number> = { 'E7.falta': 0, 'E1.falta': 1, 'E6.falta': 2, 'E2.falta': 3 };

export interface DirecoesResultado {
  direcoes: Direcao[];
  descartadas: string[];
}

export function direcoes(conteudo: PacoteConteudo, eixos: EixoAvaliado[], base: ResultadoAjuste, p: Parametros, conviver: boolean): DirecoesResultado {
  const cal = conteudo.calibracao;
  const modelo = conteudo.modelos[eixos.some((e) => e.id.startsWith('T')) ? 'ferramenta' : 'arquitetura'];
  const escala = base.bruto.escala;
  const lista: Array<Direcao & { prioridade: number; ganhoPt: number }> = [];
  const descartadas: string[] = [];
  let maiorGanho = 0;
  for (const e of eixos) {
    if (!e.avaliado) continue;
    const lado = ladoDe(e, p);
    const c = contribuicao(e, p);
    const ganhoPt = escala * (c.pt.O + c.pt.U);
    maiorGanho = Math.max(maiorGanho, ganhoPt);
    if (lado === 'dentro') continue;
    const def = modelo.eixos.find((x) => x.id === e.id)!;
    if (ganhoPt < cal.materialidade) {
      descartadas.push(t(conteudo, 'descartado.direcao', { eixo: e.nome, ganho: inteiro(ganhoPt), limiar: cal.materialidade }));
      continue;
    }
    if (conviver) continue;
    const ganho: FaixaIndice = { lo: pisoInt(escala * c.total.lo), hi: tetoInt(escala * c.total.hi), pt: inteiro(ganhoPt) };
    lista.push({
      eixo: e.id,
      lado,
      texto: t(conteudo, 'direcao.texto', { descricao: lado === 'sobra' ? def.direcaoSobra : def.direcaoFalta, ganho: ganho.hi }),
      ganho,
      evidencias: def.evidencias.slice(0, 2),
      prioridade: PRIORIDADE[`${e.id}.${lado}`] ?? 9,
      ganhoPt,
    });
  }
  if (!lista.length && !descartadas.length && eixos.some((e) => e.avaliado))
    descartadas.push(t(conteudo, 'descartado.semGanho', { limiar: cal.materialidade, maior: inteiro(maiorGanho) }));
  lista.sort((a, b) => a.prioridade - b.prioridade || b.ganhoPt - a.ganhoPt);
  return { direcoes: lista.map(({ prioridade: _p, ganhoPt: _g, ...d }) => d), descartadas };
}

// ---------------------------------------------------------------- plano de arquitetura

export interface BuscaPlano {
  movimentos: Movimento[];
  comparacao: Comparacao;
}

const PRE = new Set(['arq.modularizar', 'arq.donos', 'arq.automatizar_ops']);

export function ordenarMovimentos(movs: Movimento[], comp: Comparacao): Movimento[] {
  const ganho = (m: Movimento) => ponto(comp.porEixo[m.eixos[0] ?? ''] ?? iv(0));
  return [...movs].sort((a, b) => {
    const pa = PRE.has(a.id) ? 0 : 1;
    const pb = PRE.has(b.id) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return ganho(b) - ganho(a) || (a.id < b.id ? -1 : 1);
  });
}

export function candidatosArquitetura(ctx: Contexto, eixos: EixoAvaliado[], p: Parametros): Movimento[] {
  const lados = new Map(eixos.filter((e) => e.avaliado).map((e) => [e.id, ladoDe(e, p)]));
  return ctx.conteudo.movimentos.filter(
    (m) => m.modelo === 'arquitetura' && !m.apenasIdeia && m.subniveis.includes(ctx.subnivel) && m.eixos.slice(0, 2).some((id) => lados.get(id) === m.lado),
  );
}

export function buscarPlano(ctx: Contexto, base: { eixos: EixoAvaliado[]; ajuste: ResultadoAjuste }, p: Parametros): { melhor: BuscaPlano | null; maiorHi: number; maiorPt: BuscaPlano | null; avaliadas: BuscaPlano[] } {
  const cal = ctx.conteudo.calibracao;
  let cand = candidatosArquitetura(ctx, base.eixos, p);
  if (cand.length > 9) cand = cand.slice(0, 9);
  const ids = new Set(cand.map((m) => m.id));
  const porId = new Map(cand.map((m) => [m.id, m]));
  const vistos = new Set<string>();
  const avaliadas: BuscaPlano[] = [];
  for (let mask = 1; mask < 1 << cand.length; mask++) {
    const escolhidos: Movimento[] = [];
    for (let i = 0; i < cand.length; i++) if (mask & (1 << i)) escolhidos.push(cand[i]!);
    // Pré-requisitos que também são candidatos entram junto (E1 antes de E2; RN-21).
    for (const m of [...escolhidos]) for (const pre of m.prerequisitos ?? []) if (ids.has(pre) && !escolhidos.some((x) => x.id === pre)) escolhidos.push(porId.get(pre)!);
    const chave = escolhidos.map((m) => m.id).sort().join('+');
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    if (escolhidos.some((m) => (m.incompativel ?? []).some((x) => escolhidos.some((y) => y.id === x)))) continue;
    const proj = projetar(ctx, escolhidos);
    avaliadas.push({ movimentos: escolhidos, comparacao: comparar(base, proj, p, { minimoSinal: cal.minimoSinal, confianca: cal.confianca }) });
  }
  if (!avaliadas.length) return { melhor: null, maiorHi: 0, maiorPt: null, avaliadas };
  const ordenadas = [...avaliadas].sort((a, b) => {
    const d = b.comparacao.deltaBruto.lo - a.comparacao.deltaBruto.lo;
    if (Math.abs(d) > 1e-9) return d;
    const inv = invasividade(a.movimentos) - invasividade(b.movimentos);
    if (inv) return inv;
    return a.movimentos.length - b.movimentos.length;
  });
  const maiorPt = [...avaliadas].sort((a, b) => b.comparacao.deltaPt - a.comparacao.deltaPt || invasividade(a.movimentos) - invasividade(b.movimentos))[0]!;
  return { melhor: ordenadas[0]!, maiorHi: Math.max(...avaliadas.map((a) => a.comparacao.deltaBruto.hi)), maiorPt, avaliadas };
}

export function forma(ctx: Contexto, base: EixoAvaliado[], proj: EixoAvaliado[], todos = false): string[] {
  const modelo = ctx.modelo;
  const out: string[] = [];
  for (const e of proj) {
    if (!e.avaliado || !e.C) continue;
    const b = base.find((x) => x.id === e.id)!;
    const mudou = e.alinhado || !b.C || b.C.lo !== e.C.lo || b.C.hi !== e.C.hi;
    if (!mudou && !todos) continue;
    const def = modelo.eixos.find((x) => x.id === e.id)!;
    const nivelC = e.alinhado && e.N ? ponto(e.N) : ponto(e.C);
    const idx = Math.min(4, Math.max(0, Math.round(nivelC)));
    out.push(t(ctx.conteudo, 'plano.forma.eixo', { eixo: def.nome, ancora: def.capacidade.ancoras[idx] }));
  }
  return out;
}

export interface Simulador {
  /** Reavalia os eixos com uma resposta trocada (para "o que muda se uma resposta estiver errada"). */
  eixosCom(pergunta: string, opcao: string): EixoAvaliado[] | null;
}

function sensibilidadeDoPasso(ctx: Contexto, m: Movimento, base: EixoAvaliado[], p: Parametros, sim: Simulador): string | null {
  const eixoId = m.eixos[0];
  if (!eixoId) return null;
  const e = base.find((x) => x.id === eixoId);
  if (!e?.avaliado) return null;
  const perguntas = [...new Set([...e.sinaisN, ...e.sinaisC].filter((s) => s.origem !== 'desconhecida').map((s) => s.pergunta))];
  for (const pid of perguntas) {
    const perg = ctx.conteudo.perguntas[pid];
    const r = ctx.respostas[pid];
    if (!perg || !r || perg.tipo !== 'opcao' || r.opcoes.length !== 1) continue;
    const idx = perg.opcoes.findIndex((o) => o.id === r.opcoes[0]);
    for (const j of [idx - 1, idx + 1]) {
      const o = perg.opcoes[j];
      if (!o) continue;
      const eixos = sim.eixosCom(pid, o.id);
      const novo = eixos?.find((x) => x.id === eixoId);
      if (novo && novo.avaliado && ladoDe(novo, p) === 'dentro') {
        const rotulo = ctx.modelo.sinais[[...e.sinaisN, ...e.sinaisC].find((s) => s.pergunta === pid)!.id]?.rotulo ?? pid;
        return t(ctx.conteudo, 'plano.sensibilidade', { pergunta: rotulo, valor: o.rotulo, efeito: 'desnecessario' });
      }
    }
  }
  return null;
}

function custoAjustado(ctx: Contexto, m: Movimento): PassoPlano['custo'] {
  const motivos = [...m.custoTransicao.motivos];
  let nivel = m.custoTransicao.nivel;
  const d09 = ctx.respostas['D-09'];
  if (m.invasividade.movimentaDados && d09 && ['varios', 'muitos'].some((o) => d09.opcoes.includes(o))) {
    nivel = 'alto';
    motivos.push(`Consumidores diretos do banco a migrar: ${d09.rotulo}`);
  }
  const gt = ctx.respostas['G-T'];
  if (m.invasividade.movimentaDados && gt?.opcoes.includes('inviavel')) motivos.push(t(ctx.conteudo, 'plano.paralelo.inviavel'));
  return { nivel, motivos };
}

export function passosDo(ctx: Contexto, movs: Movimento[], base: EixoAvaliado[], p: Parametros, sim: Simulador | null): PassoPlano[] {
  const out: PassoPlano[] = [];
  let ordem = 1;
  for (const m of movs) {
    const sens = sim ? sensibilidadeDoPasso(ctx, m, base, p, sim) : null;
    const custo = custoAjustado(ctx, m);
    m.passos.forEach((ps, i) => {
      out.push({
        ordem: ordem++,
        movimento: m.nome,
        titulo: ps.titulo,
        tecnica: ps.tecnica,
        pontoDeVolta: ps.pontoDeVolta,
        custo,
        seRespostaErrada: i === 0 ? sens : null,
      });
    });
  }
  return out;
}

function custoAgregado(ctx: Contexto, movs: Movimento[]): Plano['custoTransicao'] {
  if (!movs.length) return null;
  const nivelNum = { baixo: 0, medio: 1, alto: 2 } as const;
  let pior: 'baixo' | 'medio' | 'alto' = 'baixo';
  const motivos = new Set<string>();
  for (const m of movs) {
    const c = custoAjustado(ctx, m);
    if (nivelNum[c.nivel] > nivelNum[pior]) pior = c.nivel;
    c.motivos.forEach((x) => motivos.add(x));
  }
  return { nivel: pior, motivos: [...motivos] };
}

const planoVazio = (variante: VariantePlano, frase: string, camadas: Plano['camadas']): Plano => ({
  variante,
  frase,
  camadas,
  movimentos: [],
  direcoes: [],
  forma: [],
  indice: null,
  frasesAderencia: [],
  contraBase: null,
  tecnologias: [],
  passos: [],
  custoTransicao: null,
  razoes: [],
  deixariaDeBastar: [],
});

export function horizonteRotulo(ctx: Contexto): string {
  const r = ctx.respostas['B-01'];
  return r?.opcoes[0] && ctx.conteudo.textos[`horizonte.${r.opcoes[0]}`] ? t(ctx.conteudo, `horizonte.${r.opcoes[0]}`) : 'vida útil restante';
}

export function decisoesPlanejamento(subnivel: Subnivel): string[] {
  return subnivel === 'planejamento.sistema' ? ['banco_dados'] : [];
}

export function planoArquitetura(
  ctx: Contexto,
  base: { eixos: EixoAvaliado[]; ajuste: ResultadoAjuste },
  conviver: boolean,
  sim: Simulador | null,
): { plano: Plano; busca: ReturnType<typeof buscarPlano> | null } {
  const conteudo = ctx.conteudo;
  const cal = conteudo.calibracao;
  const p = parametrosDe(cal);
  const camadas = camadasDo(ctx.profundidade);
  const tec = (movs: Movimento[]): DecisaoTecnologica[] => {
    if (!camadas.includes('tecnologias')) return [];
    const ids = [...new Set([...decisoesPlanejamento(ctx.subnivel), ...movs.flatMap((m) => m.decisoes ?? [])])];
    return ids.map((d) => avaliarDecisao(ctx, d)).filter((x): x is DecisaoTecnologica => !!x);
  };
  const naoMexa = (): Plano => {
    const formaSimples = forma(ctx, base.eixos, base.eixos, true).slice(0, 3);
    const plano = planoVazio('nao_mexa', t(conteudo, `plano.naoMexa.${ctx.subnivel}`, { forma: lista(formaSimples.map((f) => f.charAt(0).toLowerCase() + f.slice(1))) }), camadas);
    if (ctx.subnivel === 'planejamento.sistema') {
      plano.forma = formaSimples;
      plano.indice = base.ajuste.indice;
      plano.frasesAderencia = frasesAderencia(conteudo, base.ajuste.indice, 'plano.aderencia').frases;
      plano.tecnologias = tec([]);
    }
    return plano;
  };

  if (base.ajuste.categoria === 'ajustado') return { plano: naoMexa(), busca: null };
  if (conviver) return { plano: planoVazio('conviver', t(conteudo, 'plano.conviver', { horizonte: horizonteRotulo(ctx) }), camadas), busca: null };
  const busca = buscarPlano(ctx, base, p);
  const melhor = busca.melhor;
  if (!melhor || busca.maiorHi < cal.materialidade) return { plano: naoMexa(), busca };
  if (melhor.comparacao.deltaBruto.lo < cal.materialidade) {
    const ref = busca.maiorPt ?? melhor;
    return {
      plano: planoVazio('inconclusivo', t(conteudo, 'plano.inconclusivo', { lo: comSinalInt(ref.comparacao.delta.lo), hi: comSinalInt(ref.comparacao.delta.hi) }), camadas),
      busca,
    };
  }
  const movs = ordenarMovimentos(melhor.movimentos, melhor.comparacao);
  const comp = melhor.comparacao;
  const projetado = comp.projetado;
  const razoes: Razao[] = Object.entries(comp.porEixo)
    .filter(([, d]) => ponto(d) > 0)
    .sort((a, b) => ponto(b[1]) - ponto(a[1]))
    .slice(0, 3)
    .map(([eixoId]) => {
      const m = movs.find((x) => x.eixos.includes(eixoId)) ?? movs[0]!;
      const def = ctx.modelo.eixos.find((x) => x.id === eixoId)!;
      return { texto: t(conteudo, 'razao.plano', { eixo: def.nome, direcao: m.descricao }), eixo: eixoId, evidencias: m.evidencias.slice(0, 2), regras: m.regras.slice(0, 2) };
    });
  const plano: Plano = {
    variante: 'mudanca',
    frase: frasesAderencia(conteudo, projetado.indice, 'plano.aderencia').frases[0]!,
    camadas,
    movimentos: movs.map((m) => ({ id: m.id, nome: m.nome, descricao: m.descricao })),
    direcoes: movs.map((m) => {
      const g = comp.porEixo[m.eixos[0] ?? ''] ?? iv(0);
      return {
        eixo: m.eixos[0] ?? '',
        lado: m.lado,
        texto: m.descricao,
        ganho: { lo: pisoInt(g.lo), hi: tetoInt(g.hi), pt: inteiro(ponto(g)) },
        evidencias: m.evidencias.slice(0, 2),
      };
    }),
    forma: forma(ctx, base.eixos, comp.eixos),
    indice: projetado.indice,
    frasesAderencia: frasesAderencia(conteudo, projetado.indice, 'plano.aderencia').frases,
    contraBase: comp.delta,
    tecnologias: tec(movs),
    passos: camadas.includes('passos') ? passosDo(ctx, movs, base.eixos, p, sim) : [],
    custoTransicao: custoAgregado(ctx, movs),
    razoes,
    deixariaDeBastar: [],
  };
  return { plano, busca };
}

// ---------------------------------------------------------------- plano de ferramenta

export interface PlanoFerramenta {
  plano: Plano;
  escolhida: AvaliacaoTecnologia | null;
  avaliacoes: AvaliacaoTecnologia[];
  atualizada: AvaliacaoTecnologia | null;
}

export function planoFerramenta(
  ctx: Contexto,
  categoria: string,
  atual: AvaliacaoTecnologia | null,
  conviver: boolean,
): PlanoFerramenta {
  const conteudo = ctx.conteudo;
  const cal = conteudo.calibracao;
  const p = parametrosDe(cal);
  const camadas = camadasDo(ctx.profundidade);
  const outras = candidatasDa(conteudo, categoria).filter((x) => x.id !== atual?.tec.id);
  const avaliacoes = ordenarAvaliacoes(outras.map((x) => avaliarTecnologia(ctx, x, categoria)));
  const movTrocar = conteudo.movimentos.find((m) => m.id === 'fer.trocar')!;
  const movAtualizar = conteudo.movimentos.find((m) => m.id === 'fer.atualizar')!;
  const troca = conteudo.categoriasFerramenta[categoria] as unknown as { troca?: { escopo: 'parcial' | 'total'; reversivel: boolean; movimentaDados: boolean } };

  const tabela = (escolhidaId: string | null): DecisaoTecnologica[] => {
    if (!camadas.includes('tecnologias')) return [];
    const todas = ordenarAvaliacoes([...(atual ? [atual] : []), ...avaliacoes]);
    const d = conteudo.decisoes[conteudo.categoriasFerramenta[categoria]?.decisao ?? ''];
    return [
      {
        id: d?.id ?? categoria,
        nome: d?.nome ?? categoria,
        descricao: d?.descricao ?? '',
        linhas: todas.map((a) => linhaTecnologia(conteudo, a, a.tec.id === escolhidaId, a.tec.id === atual?.tec.id)),
        motivo: 'Todas as candidatas passam pelos mesmos critérios. A escolhida tem o maior Índice de Ajuste no limite desfavorável; empates vão para a mais simples de operar. Popularidade não entra na escolha.',
      },
    ];
  };

  if (!atual) {
    // Planejamento: a opção mais simples que atende, dentro da materialidade da melhor (ônus da prova na complexidade).
    const melhor = avaliacoes[0] ?? null;
    if (!melhor) return { plano: planoVazio('inconclusivo', t(conteudo, 'veredito.inconclusivo.frase'), camadas), escolhida: null, avaliacoes, atualizada: null };
    const exig = (a: AvaliacaoTecnologia) => (a.tec.perfil.exigenciaOperacional[0] + a.tec.perfil.exigenciaOperacional[1]) / 2;
    const proximas = avaliacoes.filter((a) => a.ajuste.bruto.indice.lo >= melhor.ajuste.bruto.indice.lo - cal.materialidade);
    const escolhida = [...proximas].sort((a, b) => exig(a) - exig(b) || b.ajuste.bruto.indice.lo - a.ajuste.bruto.indice.lo)[0]!;
    const plano = planoVazio('mais_simples', t(conteudo, 'plano.naoMexa.planejamento.ferramenta', { forma: `${escolhida.tec.nome}. ${escolhida.tec.simplicidade}` }), camadas);
    plano.indice = escolhida.ajuste.indice;
    plano.frasesAderencia = frasesAderencia(conteudo, escolhida.ajuste.indice, 'plano.aderencia').frases;
    plano.tecnologias = tabela(escolhida.tec.id);
    plano.forma = [`${escolhida.tec.nome}: ${escolhida.tec.resumo}`];
    plano.razoes = razoesFerramenta(conteudo, escolhida, null);
    return { plano, escolhida, avaliacoes, atualizada: null };
  }

  // Refatoração: manter, atualizar a versão ou trocar.
  let atualizada: AvaliacaoTecnologia | null = null;
  const recomendada = avaliarTecnologia(ctx, atual.tec, categoria, { atual: true });
  if (recomendada.ciclo.ciclo && recomendada.ciclo.ciclo !== atual.ciclo.ciclo && recomendada.ajuste.bruto.indice.lo > atual.ajuste.bruto.indice.lo) atualizada = recomendada;
  const base = { eixos: atual.eixos, ajuste: atual.ajuste };
  const opcoes = [
    ...(atualizada ? [{ a: atualizada, mov: movAtualizar, comp: comparar(base, atualizada.eixos, p, cal) }] : []),
    ...avaliacoes.map((a) => ({
      a,
      mov: { ...movTrocar, invasividade: { ...movTrocar.invasividade, ...(troca.troca ?? {}), trocaTecnologia: true } },
      comp: comparar(base, a.eixos, p, cal),
    })),
  ];
  opcoes.sort((x, y) => {
    const d = y.comp.deltaBruto.lo - x.comp.deltaBruto.lo;
    if (Math.abs(d) > 1e-9) return d;
    return invasividade([x.mov]) - invasividade([y.mov]);
  });
  const melhor = opcoes[0];
  const maiorHi = Math.max(0, ...opcoes.map((o) => o.comp.deltaBruto.hi));
  const naoMexa = (): Plano => {
    const pl = planoVazio('nao_mexa', t(conteudo, 'plano.naoMexa.refatoracao.ferramenta'), camadas);
    pl.tecnologias = tabela(atual.tec.id);
    return pl;
  };
  if (atual.ajuste.categoria === 'ajustado') return { plano: naoMexa(), escolhida: atual, avaliacoes, atualizada };
  if (conviver) return { plano: planoVazio('conviver', t(conteudo, 'plano.conviver', { horizonte: horizonteRotulo(ctx) }), camadas), escolhida: atual, avaliacoes, atualizada };
  if (!melhor || maiorHi < cal.materialidade) return { plano: naoMexa(), escolhida: atual, avaliacoes, atualizada };
  if (melhor.comp.deltaBruto.lo < cal.materialidade) {
    return {
      plano: planoVazio('inconclusivo', t(conteudo, 'plano.inconclusivo', { lo: comSinalInt(melhor.comp.delta.lo), hi: comSinalInt(melhor.comp.delta.hi) }), camadas),
      escolhida: atual,
      avaliacoes,
      atualizada,
    };
  }
  const ehAtualizar = melhor.a === atualizada;
  const frase = ehAtualizar
    ? t(conteudo, 'plano.atualizar', { tecnologia: atual.tec.nome, ciclo: melhor.a.ciclo.ciclo ?? '', data: melhor.a.ciclo.data ? melhor.a.ciclo.data.split('-').reverse().join('/') : 'sem data anunciada' })
    : t(conteudo, 'plano.trocar', { tecnologia: melhor.a.tec.nome });
  const plano: Plano = {
    variante: ehAtualizar ? 'atualizar' : 'trocar',
    frase,
    camadas,
    movimentos: [{ id: melhor.mov.id, nome: melhor.mov.nome, descricao: melhor.mov.descricao }],
    direcoes: [],
    forma: [ehAtualizar ? melhor.a.ciclo.texto : `${melhor.a.tec.nome}: ${melhor.a.tec.resumo}`],
    indice: melhor.a.ajuste.indice,
    frasesAderencia: frasesAderencia(conteudo, melhor.a.ajuste.indice, 'plano.aderencia').frases,
    contraBase: melhor.comp.delta,
    tecnologias: tabela(ehAtualizar ? atual.tec.id : melhor.a.tec.id),
    passos: camadas.includes('passos') ? passosDo(ctx, [melhor.mov], [], p, null) : [],
    custoTransicao: { nivel: melhor.mov.custoTransicao.nivel, motivos: melhor.mov.custoTransicao.motivos },
    razoes: razoesFerramenta(conteudo, melhor.a, atual),
    deixariaDeBastar: [],
  };
  return { plano, escolhida: melhor.a, avaliacoes, atualizada };
}

function razoesFerramenta(conteudo: PacoteConteudo, a: AvaliacaoTecnologia, atual: AvaliacaoTecnologia | null): Razao[] {
  const modelo = conteudo.modelos.ferramenta;
  const p = parametrosDe(conteudo.calibracao);
  const out: Razao[] = [];
  for (const e of a.eixos) {
    if (!e.avaliado) continue;
    const def = modelo.eixos.find((x) => x.id === e.id)!;
    const antes = atual?.eixos.find((x) => x.id === e.id);
    const ca = contribuicao(e, p);
    const cb = antes ? contribuicao(antes, p) : null;
    const ganho = cb ? cb.pt.O + cb.pt.U - (ca.pt.O + ca.pt.U) : -(ca.pt.O + ca.pt.U);
    out.push({ texto: '', eixo: e.id, evidencias: def.evidencias.slice(0, 2), regras: def.regras.slice(0, 2), ganho } as Razao & { ganho: number });
  }
  return (out as Array<Razao & { ganho: number }>)
    .sort((x, y) => y.ganho - x.ganho)
    .slice(0, 3)
    .map(({ ganho: _g, ...r }) => {
      const e = a.eixos.find((x) => x.id === r.eixo)!;
      const def = modelo.eixos.find((x) => x.id === r.eixo)!;
      const lado = ladoDe(e, p);
      return {
        ...r,
        texto:
          lado === 'dentro'
            ? t(conteudo, 'razao.ajustado', { eixo: def.nome, sinais: `${a.tec.nome}: ${def.perguntaGuia.replace(/\?$/, '')}.` })
            : t(conteudo, lado === 'sobra' ? 'razao.sobra' : 'razao.falta', { eixo: def.nome, desvio: Math.round(Math.abs(e.dPt ?? 0) * 10) / 10, sinais: lado === 'sobra' ? def.sinaisSobra : def.sinaisFalta }),
      };
    });
}

export { calcularAjuste };
