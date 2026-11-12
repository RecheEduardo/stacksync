// Avaliação de tecnologias no motor (DT-31, DC-20, RN-95). Toda candidata passa pelos mesmos
// critérios; popularidade só aparece como sinal e nunca decide (RN-01, RN-58).
import type { CicloEol, PacoteConteudo, Tecnologia } from '@stacksync/content/tipos';
import { avaliarEixos, calcularAjuste, parametrosDe, type EixoAvaliado, type ResultadoAjuste } from './ajuste.ts';
import { iv, limita, ponto, subtrai, type Intervalo } from './intervalo.ts';
import { numeroPt } from './mensagens.ts';
import type { Contexto, TecnologiaAvaliada } from './nucleo.ts';
import type { DecisaoTecnologica, LinhaTecnologia } from './tipos.ts';

export function mesesAte(asOf: string, data: string): number {
  const [a, b, c] = asOf.split('-').map(Number) as [number, number, number];
  const [d, e, f] = data.split('-').map(Number) as [number, number, number];
  return (d - a) * 12 + (e - b) + (f < c ? -1 : 0);
}

export const dataPt = (iso: string): string => {
  const [a, m, d] = iso.split('-');
  return d ? `${d}/${m}/${a}` : `${m}/${a}`;
};

export interface CicloInfo {
  ciclo: string | null;
  faixa: Intervalo;
  texto: string;
  data: string | null;
  fonte: string | null;
  consultadoEm: string | null;
  meses: number | null;
}

function escolherCiclo(ciclos: CicloEol[], asOf: string): CicloEol | null {
  const mantidos = ciclos.filter((c) => c.mantido && c.fimSuporte !== 'encerrado' && (!c.fimSuporte || mesesAte(asOf, c.fimSuporte) >= 0));
  if (!mantidos.length) return ciclos[0] ?? null;
  // Prefere o ciclo mantido com o fim de suporte mais distante; sem datas, o mais recente.
  const datados = mantidos.filter((c) => c.fimSuporte);
  if (datados.length) return [...datados].sort((x, y) => (x.fimSuporte! < y.fimSuporte! ? 1 : -1))[0]!;
  return mantidos[0]!;
}

export function infoCiclo(conteudo: PacoteConteudo, tec: Tecnologia, ciclo: string | null, asOf: string): CicloInfo {
  const prod = tec.eol ? conteudo.eol.produtos[tec.eol.produto] : undefined;
  if (!prod) {
    return {
      ciclo: null,
      faixa: iv(2, 3),
      texto: 'Sem data de fim de suporte publicada na fonte usada',
      data: null,
      fonte: null,
      consultadoEm: null,
      meses: null,
    };
  }
  const c = ciclo ? (prod.ciclos.find((x) => x.ciclo === ciclo) ?? null) : escolherCiclo(prod.ciclos, asOf);
  const fonte = prod.pagina;
  const consultadoEm = conteudo.eol.consultadoEm;
  if (!c) {
    return { ciclo, faixa: iv(1, 2.5), texto: `Versão ${ciclo ?? ''} fora da base consultada`, data: null, fonte, consultadoEm, meses: null };
  }
  const rot = `${prod.rotulo} ${c.ciclo}`;
  if (c.fimSuporte === 'encerrado') return { ciclo: c.ciclo, faixa: iv(0), texto: `${rot}: suporte encerrado`, data: null, fonte, consultadoEm, meses: -1 };
  if (!c.fimSuporte) {
    return {
      ciclo: c.ciclo,
      faixa: c.mantido ? iv(2.5, 3.5) : iv(1, 2),
      texto: c.mantido ? `${rot}: mantida, sem data de fim anunciada` : `${rot}: sem data e sem manutenção indicada`,
      data: null,
      fonte,
      consultadoEm,
      meses: null,
    };
  }
  const meses = mesesAte(asOf, c.fimSuporte);
  const faixa = meses < 0 ? iv(0) : meses < 6 ? iv(1) : meses < 18 ? iv(2) : meses < 36 ? iv(3) : iv(3.5, 4);
  const texto = meses < 0 ? `${rot}: suporte terminou em ${dataPt(c.fimSuporte)}` : `${rot}: suporte até ${dataPt(c.fimSuporte)}`;
  return { ciclo: c.ciclo, faixa, texto, data: c.fimSuporte, fonte, consultadoEm, meses };
}

function penalidadeLicenca(tec: Tecnologia, asOf: string): number {
  const ano = Number(asOf.slice(0, 4));
  let p = 0;
  if (!tec.licenca.aberta) p += 0.5;
  if ((tec.mudancasLicenca ?? []).some((m) => m.ano >= ano - 3)) p += 0.5;
  return p;
}

const MERCADO_E10: Record<string, [number, number]> = { facil: [3, 4], moderado: [2, 3], dificil: [0.5, 1.5] };

export function tecnologiaAvaliada(
  ctx: Contexto,
  tec: Tecnologia,
  categoria: string,
  opcoes: { ciclo?: string | null; atual?: boolean; praticas?: boolean } = {},
): TecnologiaAvaliada & { cicloInfo: CicloInfo } {
  const cicloInfo = infoCiclo(ctx.conteudo, tec, opcoes.ciclo ?? null, ctx.asOf);
  const cicloFaixa = limita(subtrai(cicloInfo.faixa, iv(penalidadeLicenca(tec, ctx.asOf))), 0, 4);
  const t07 = ctx.respostas['T-07'];
  const conhecimento =
    t07 && ctx.aplicaveis.has('T-07') && t07.origem !== 'desconhecida' && t07.origem !== 'nao_se_aplica'
      ? t07.opcoes.includes(tec.id)
        ? iv(3.5, 4)
        : iv(0.5, 1.5)
      : null;
  const e10 = ctx.respostas['E-10'];
  const mercadoE10 = opcoes.atual && e10 && ctx.aplicaveis.has('E-10') ? MERCADO_E10[e10.opcoes[0] ?? ''] : undefined;
  const mercado = mercadoE10 ? iv(mercadoE10[0], mercadoE10[1]) : iv(tec.perfil.mercado[0], tec.perfil.mercado[1]);
  const tecFinal =
    opcoes.praticas && (tec.atende ?? []).includes('tipagem_gradual')
      ? { ...tec, atende: [...(tec.atende ?? []), 'tipagem_estatica'] }
      : tec;
  return { tec: tecFinal, categoria, ciclo: cicloInfo.ciclo, cicloFaixa, conhecimento, mercado, cicloInfo };
}

export interface AvaliacaoTecnologia {
  tec: Tecnologia;
  ciclo: CicloInfo;
  eixos: EixoAvaliado[];
  ajuste: ResultadoAjuste;
}

/** Avalia uma tecnologia com o modelo de ferramenta, sobre as respostas do contexto. */
export function avaliarTecnologia(
  ctxBase: Contexto,
  tec: Tecnologia,
  categoria: string,
  opcoes: { ciclo?: string | null; atual?: boolean; praticas?: boolean } = {},
): AvaliacaoTecnologia {
  const conteudo = ctxBase.conteudo;
  const ctx: Contexto = { ...ctxBase, modelo: conteudo.modelos.ferramenta, usarFormaMaisSimples: false };
  const ta = tecnologiaAvaliada(ctx, tec, categoria, opcoes);
  ctx.tecnologia = ta;
  const { eixos } = avaliarEixos(ctx);
  const cal = conteudo.calibracao;
  return { tec: ta.tec, ciclo: ta.cicloInfo, eixos, ajuste: calcularAjuste(eixos, parametrosDe(cal), cal.minimoSinal, cal.confianca) };
}

const nivelTexto = (f: [number, number] | Intervalo): string => {
  const v = Array.isArray(f) ? (f[0] + f[1]) / 2 : ponto(f);
  return v >= 3.5 ? 'Muito amplo' : v >= 2.75 ? 'Amplo' : v >= 2 ? 'Razoável' : v >= 1.25 ? 'Pequeno' : 'Escasso';
};
const segurancaTexto = (f: [number, number]): string => {
  const v = (f[0] + f[1]) / 2;
  return v >= 3.5 ? 'Forte por construção' : v >= 2.75 ? 'Sólida' : v >= 2 ? 'Razoável' : 'Frágil';
};

export function linhaTecnologia(conteudo: PacoteConteudo, a: AvaliacaoTecnologia, escolhida: boolean, atual: boolean): LinhaTecnologia {
  const t = a.tec;
  const obs: string[] = [];
  if (!t.licenca.aberta) obs.push('Licença não aprovada pela OSI.');
  for (const m of t.mudancasLicenca ?? []) obs.push(`${m.ano}: ${m.descricao}`);
  return {
    id: t.id,
    nome: t.nome,
    escolhida,
    atual,
    indice: a.ajuste.indice,
    complexidade: t.complexidade,
    simplicidade: t.simplicidade,
    popularidade: t.popularidade
      ? { percentual: t.popularidade.percentual, fonte: t.popularidade.fonte, consultadoEm: t.popularidade.consultadoEm, levantamento: t.popularidade.levantamento }
      : null,
    ecossistema: nivelTexto(t.perfil.ecossistema),
    licenca: {
      nome: t.licenca.nome,
      fonte: t.licenca.fonte,
      consultadoEm: t.licenca.consultadoEm,
      mudancas: (t.mudancasLicenca ?? []).map((m) => `${m.ano}: ${m.descricao}`),
    },
    fimSuporte: { texto: a.ciclo.texto, data: a.ciclo.data, fonte: a.ciclo.fonte, consultadoEm: a.ciclo.consultadoEm },
    cadeiaSuprimentos: segurancaTexto(t.perfil.seguranca),
    observacoes: obs,
  };
}

/** Ordena avaliações: maior Índice de Ajuste no limite desfavorável; empate pela menor exigência operacional (DC-20). */
export function ordenarAvaliacoes(lista: AvaliacaoTecnologia[]): AvaliacaoTecnologia[] {
  return [...lista].sort((x, y) => {
    const d = y.ajuste.bruto.indice.lo - x.ajuste.bruto.indice.lo;
    if (Math.abs(d) > 1e-9) return d;
    const ex = (x.tec.perfil.exigenciaOperacional[0] + x.tec.perfil.exigenciaOperacional[1]) / 2;
    const ey = (y.tec.perfil.exigenciaOperacional[0] + y.tec.perfil.exigenciaOperacional[1]) / 2;
    if (ex !== ey) return ex - ey;
    return x.tec.id < y.tec.id ? -1 : 1;
  });
}

export function candidatasDa(conteudo: PacoteConteudo, categoria: string): Tecnologia[] {
  return Object.values(conteudo.tecnologias)
    .filter((t) => t.categorias.includes(categoria))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** Decisão de tecnologia do plano ideal de arquitetura (Equilibrado e Avançado). */
export function avaliarDecisao(ctx: Contexto, decisaoId: string): DecisaoTecnologica | null {
  const conteudo = ctx.conteudo;
  const d = conteudo.decisoes[decisaoId];
  if (!d) return null;
  const avaliadas = ordenarAvaliacoes(candidatasDa(conteudo, d.categoria).map((t) => avaliarTecnologia(ctx, t, d.categoria)));
  if (!avaliadas.length) return null;
  const escolhida = avaliadas[0]!;
  const motivo = `${escolhida.tec.nome} tem o maior Índice de Ajuste no limite desfavorável (entre ${escolhida.ajuste.indice.lo} e ${escolhida.ajuste.indice.hi}); empates vão para a opção mais simples de operar. Popularidade não entra na escolha.`;
  return {
    id: d.id,
    nome: d.nome,
    descricao: d.descricao,
    linhas: avaliadas.map((a) => linhaTecnologia(conteudo, a, a === escolhida, false)),
    motivo,
  };
}

export const formatarMeses = (m: number): string => (m === 1 ? '1 mês' : `${numeroPt(m, 0)} meses`);
