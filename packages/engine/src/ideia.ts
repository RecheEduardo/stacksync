// Avaliação da ideia prévia (PRODUCT.md; P3 9.7, 9.12, 10.2; RN-93).
// A ideia vale como o conjunto de movimentos que o usuário confirmou (RN-79). Ela é medida contra
// a linha de base (não mudar, a solução mais simples ou a opção mais simples) e passa pelos portões
// P1 a P5, que explicam o veredito. Os portões P3 e P4 são decisivos: uma ideia que piora o ajuste,
// ou cujo melhor caso não alcança a materialidade, não é salva por evidência de motivo ou de meta.
import type { Movimento, PacoteConteudo } from '@stacksync/content/tipos';
import { ladoDe, parametrosDe, type EixoAvaliado, type ResultadoAjuste } from './ajuste.ts';
import { ponto } from './intervalo.ts';
import { lista } from './mensagens.ts';
import type { Contexto } from './nucleo.ts';
import { comparar, invasividadeAgregada, projetar, type Comparacao } from './projecao.ts';
import { comSinalInt, frasesAderencia, t, type BuscaPlano } from './plano.ts';
import { avaliarTecnologia, type AvaliacaoTecnologia } from './tecnologias.ts';
import type { AvaliacaoIdeia, MovimentoIdeia, Portao, Razao, VereditoIdeia } from './tipos.ts';

const LEGITIMOS = new Set(['fim_suporte', 'licenca', 'regulacao', 'incidentes', 'custo', 'entregas_lentas', 'requisito_novo', 'manutencao', 'escala']);

interface Alternativa {
  nome: string;
  movimentos: Movimento[];
  comparacao: Comparacao;
}

function menosInvasiva(a: Movimento[], b: Movimento[]): boolean {
  const x = invasividadeAgregada(a);
  const y = invasividadeAgregada(b);
  const piorEm = (k: keyof typeof x) =>
    k === 'escopo' ? x.escopo === 'total' && y.escopo === 'parcial' : k === 'reversivel' ? !x.reversivel && y.reversivel : x[k] && !y[k];
  const melhorEm = (k: keyof typeof x) =>
    k === 'escopo' ? x.escopo === 'parcial' && y.escopo === 'total' : k === 'reversivel' ? x.reversivel && !y.reversivel : !x[k] && y[k];
  const ks = ['escopo', 'reversivel', 'trocaTecnologia', 'movimentaDados'] as const;
  return ks.some(melhorEm) && !ks.some(piorEm);
}

export interface EntradaIdeia {
  texto: string;
  movimentos: MovimentoIdeia[];
}

export function avaliarIdeia(
  ctx: Contexto,
  ideia: EntradaIdeia,
  base: { eixos: EixoAvaliado[]; ajuste: ResultadoAjuste },
  baseRotulo: string,
  baseChave: 'nao_mudar' | 'outra',
  alternativas: Alternativa[],
  ferramenta: { categoria: string; atual: AvaliacaoTecnologia | null } | null,
): AvaliacaoIdeia | null {
  const conteudo = ctx.conteudo;
  const cal = conteudo.calibracao;
  const p = parametrosDe(cal);
  let comp: Comparacao;
  let movs: Movimento[] = [];
  let nomes: Array<{ id: string; nome: string }> = [];

  if (ferramenta) {
    const m = ideia.movimentos[0];
    if (!m) return null;
    const mov = conteudo.movimentos.find((x) => x.id === m.id);
    if (!mov) return null;
    const alvo = m.parametro ? conteudo.tecnologias[m.parametro] : ferramenta.atual?.tec;
    if (!alvo) return null;
    let av: AvaliacaoTecnologia;
    if (m.id === 'fer.atualizar') av = avaliarTecnologia(ctx, alvo, ferramenta.categoria, { atual: true });
    else if (m.id === 'fer.adotar_pratica') av = avaliarTecnologia(ctx, alvo, ferramenta.categoria, { atual: true, praticas: true, ciclo: ferramenta.atual?.ciclo.ciclo ?? null });
    else av = avaliarTecnologia(ctx, alvo, ferramenta.categoria);
    let eixos = av.eixos;
    if (m.id === 'fer.codigo_novo' && ferramenta.atual) {
      // Código novo na outra linguagem: metade do sistema ganha o perfil novo (aproximação explicada na trilha).
      eixos = av.eixos.map((e) => {
        const a = ferramenta.atual!.eixos.find((x) => x.id === e.id)!;
        if (!e.C || !a.C || !e.N) return e;
        const C = { lo: (e.C.lo + a.C.lo) / 2, hi: (e.C.hi + a.C.hi) / 2 };
        return { ...e, C, d: { lo: C.lo - e.N.hi, hi: C.hi - e.N.lo }, dPt: ponto(C) - ponto(e.N) };
      });
    }
    comp = comparar(base, eixos, p, cal);
    movs = [{ ...mov, nome: m.parametro ? `${mov.nome}: ${alvo.nome}` : mov.nome }];
    nomes = movs.map((x) => ({ id: x.id, nome: x.nome }));
  } else {
    movs = ideia.movimentos.map((m) => conteudo.movimentos.find((x) => x.id === m.id)).filter((x): x is Movimento => !!x);
    if (!movs.length) return null;
    comp = comparar(base, projetar(ctx, movs), p, cal);
    nomes = movs.map((m) => ({ id: m.id, nome: m.nome }));
  }

  const indice = comp.projetado.indice;
  const { frases, curtas } = frasesAderencia(conteudo, indice, 'aderencia');
  const delta = comp.delta;
  const portoes: Portao[] = [];

  // P1 Gatilho legítimo
  const m03 = ctx.respostas['M-03'];
  const m04 = ctx.respostas['M-04'];
  let p1: Portao['estado'];
  let p1m: string;
  if (!m03 || m03.origem === 'desconhecida' || !m03.opcoes.length) {
    p1 = 'indeterminado';
    p1m = t(conteudo, 'portao.P1.semResposta');
  } else if (m03.opcoes.every((o) => o === 'tendencia')) {
    p1 = 'nao_passa';
    p1m = t(conteudo, 'portao.P1.naoPassa');
  } else if (m03.opcoes.some((o) => LEGITIMOS.has(o))) {
    if (ctx.profundidade === 'rapido' && !m04) {
      p1 = 'passa';
      p1m = t(conteudo, 'portao.P1.passaEstimado');
    } else if (m04?.opcoes.includes('sim')) {
      p1 = 'passa';
      p1m = t(conteudo, 'portao.P1.passa');
    } else {
      p1 = 'indeterminado';
      p1m = t(conteudo, 'portao.P1.indeterminado');
    }
  } else {
    p1 = 'indeterminado';
    p1m = t(conteudo, 'portao.P1.indeterminado');
  }
  portoes.push({ id: 'P1', nome: t(conteudo, 'portao.P1'), estado: p1, motivo: p1m, defineVeredito: false });

  // P2 Meta mensurável
  const m01 = ctx.respostas['M-01'];
  const m02 = ctx.respostas['M-02'];
  let p2: Portao['estado'];
  let p2m: string;
  if (m01?.opcoes.includes('nada_especifico')) {
    p2 = 'nao_passa';
    p2m = t(conteudo, 'portao.P2.semMeta');
  } else if (m02?.opcoes.includes('valor_e_meta')) {
    p2 = 'passa';
    p2m = t(conteudo, 'portao.P2.passa');
  } else if (m02?.opcoes.includes('nenhum')) {
    p2 = 'nao_passa';
    p2m = t(conteudo, 'portao.P2.naoPassa');
  } else {
    p2 = 'indeterminado';
    p2m = t(conteudo, 'portao.P2.indeterminado');
  }
  portoes.push({ id: 'P2', nome: t(conteudo, 'portao.P2'), estado: p2, motivo: p2m, defineVeredito: false });

  // P3 Direção do ajuste e P4 Materialidade, no limite desfavorável (RN-74)
  const d = comp.deltaBruto;
  const p3: Portao['estado'] = d.lo > 0 ? 'passa' : d.hi < 0 ? 'nao_passa' : 'indeterminado';
  portoes.push({ id: 'P3', nome: t(conteudo, 'portao.P3'), estado: p3, motivo: t(conteudo, `portao.P3.${p3 === 'passa' ? 'passa' : p3 === 'nao_passa' ? 'naoPassa' : 'indeterminado'}`), defineVeredito: false });
  const mat = cal.materialidade;
  const p4: Portao['estado'] = d.lo >= mat ? 'passa' : d.hi < mat ? 'nao_passa' : 'indeterminado';
  portoes.push({
    id: 'P4',
    nome: t(conteudo, 'portao.P4'),
    estado: p4,
    motivo: t(conteudo, `portao.P4.${p4 === 'passa' ? 'passa' : p4 === 'nao_passa' ? 'naoPassa' : 'indeterminado'}`, { limiar: mat }),
    defineVeredito: false,
  });

  // P5 Alternativa menos invasiva (dominância de 80%, K-07)
  let melhorAlt: Alternativa | null = null;
  const alvoGanho = comp.deltaPt > 0 ? cal.dominancia * comp.deltaPt : comp.deltaPt;
  for (const alt of alternativas) {
    if (alt.movimentos.map((m) => m.id).sort().join() === movs.map((m) => m.id).sort().join()) continue;
    if (alt.comparacao.deltaPt + 1e-9 < alvoGanho || alt.comparacao.deltaPt <= 0) continue;
    if (!menosInvasiva(alt.movimentos, movs)) continue;
    if (!melhorAlt || alt.comparacao.deltaPt > melhorAlt.comparacao.deltaPt) melhorAlt = alt;
  }
  const pct = Math.round(cal.dominancia * 100);
  const p5: Portao['estado'] = melhorAlt ? 'nao_passa' : 'passa';
  portoes.push({
    id: 'P5',
    nome: t(conteudo, 'portao.P5'),
    estado: p5,
    motivo: melhorAlt ? t(conteudo, 'portao.P5.naoPassa', { alternativa: melhorAlt.nome, pct }) : t(conteudo, 'portao.P5.passa'),
    defineVeredito: false,
  });

  // Veredito: P1, P3, P4 e P5 decisivos; P2 e indeterminados levam a Inconclusiva.
  const porId = Object.fromEntries(portoes.map((x) => [x.id, x])) as Record<Portao['id'], Portao>;
  let veredito: VereditoIdeia;
  let define: Portao['id'] | null = null;
  if (p1 === 'nao_passa') [veredito, define] = ['sem_fundamento', 'P1'];
  else if (p3 === 'nao_passa') [veredito, define] = ['contraproducente', 'P3'];
  else if (p4 === 'nao_passa') [veredito, define] = ['ganho_irrisorio', 'P4'];
  else if (p5 === 'nao_passa') [veredito, define] = ['existe_caminho_melhor', 'P5'];
  else if (p2 === 'nao_passa') [veredito, define] = ['inconclusiva', 'P2'];
  else {
    const ind = portoes.find((x) => x.estado === 'indeterminado');
    if (ind) [veredito, define] = ['inconclusiva', ind.id];
    else veredito = 'justificada_em_principio';
  }
  if (define) porId[define].defineVeredito = true;

  let fraseVeredito: string;
  switch (veredito) {
    case 'sem_fundamento':
      fraseVeredito = t(conteudo, 'ideia.veredito.sem_fundamento');
      break;
    case 'contraproducente':
      fraseVeredito = t(conteudo, 'ideia.veredito.contraproducente', {
        projLo: indice.lo,
        projHi: indice.hi,
        atualLo: base.ajuste.indice.lo,
        atualHi: base.ajuste.indice.hi,
      });
      break;
    case 'ganho_irrisorio':
      fraseVeredito = t(conteudo, 'ideia.veredito.ganho_irrisorio', {
        ganho: comSinalInt(delta.pt),
        limiar: mat,
        base: baseChave,
        baseRotulo: baseRotulo.charAt(0).toUpperCase() + baseRotulo.slice(1),
      });
      break;
    case 'existe_caminho_melhor':
      fraseVeredito = t(conteudo, 'ideia.veredito.existe_caminho_melhor', {
        alternativa: melhorAlt!.nome,
        pct,
        criterio: invasividadeAgregada(melhorAlt!.movimentos).reversivel && !invasividadeAgregada(movs).reversivel ? t(conteudo, 'ideia.criterio.mais_reversivel') : t(conteudo, 'ideia.criterio.menos_invasiva'),
      });
      break;
    case 'inconclusiva':
      fraseVeredito = t(conteudo, 'ideia.veredito.inconclusiva', { portao: define!, motivo: porId[define!].motivo });
      break;
    default:
      fraseVeredito = t(conteudo, 'ideia.veredito.justificada_em_principio');
  }

  // Motivos: os eixos em que a ideia mais aproxima ou afasta a capacidade da necessidade.
  const modelo = ctx.modelo.id === 'ferramenta' || ferramenta ? conteudo.modelos.ferramenta : ctx.modelo;
  const razoes: Razao[] = Object.entries(comp.porEixo)
    .filter(([, faixa]) => Math.abs(ponto(faixa)) > 0.5)
    .sort((a, b) => Math.abs(ponto(b[1])) - Math.abs(ponto(a[1])))
    .slice(0, 3)
    .map(([eixoId, faixa]) => {
      const def = modelo.eixos.find((x) => x.id === eixoId)!;
      const proj = comp.eixos.find((x) => x.id === eixoId);
      const piora = ponto(faixa) < 0;
      const lado = proj ? ladoDe(proj, p) : 'dentro';
      const complemento = lado === 'sobra' ? ` ${def.sinaisSobra}` : lado === 'falta' ? ` ${def.sinaisFalta}` : '';
      return {
        texto: t(conteudo, piora ? 'razao.ideia.piora' : 'razao.ideia.melhora', { eixo: def.nome }) + (piora ? complemento : ''),
        eixo: eixoId,
        evidencias: def.evidencias.slice(0, 2),
        regras: def.regras.slice(0, 2),
      };
    });

  return {
    texto: ideia.texto,
    movimentos: nomes,
    indice,
    frases,
    frasesCurtas: curtas,
    contraBase: delta,
    baseRotulo,
    veredito,
    fraseVeredito,
    portoes,
    razoes,
    alternativa: melhorAlt?.nome ?? null,
  };
}

/** Alternativas para o portão P5: o plano ideal e cada movimento candidato isolado. */
export function alternativasDe(busca: { avaliadas: BuscaPlano[]; melhor: BuscaPlano | null } | null): Alternativa[] {
  if (!busca) return [];
  const out: Alternativa[] = [];
  if (busca.melhor) out.push({ nome: `o plano ideal (${lista(busca.melhor.movimentos.map((m) => m.nome.toLowerCase()))})`, movimentos: busca.melhor.movimentos, comparacao: busca.melhor.comparacao });
  for (const a of busca.avaliadas) if (a.movimentos.length === 1) out.push({ nome: a.movimentos[0]!.nome.toLowerCase(), movimentos: a.movimentos, comparacao: a.comparacao });
  return out;
}

export { comparar };
export type { PacoteConteudo };
