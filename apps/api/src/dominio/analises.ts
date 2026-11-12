// Análises e respostas: leitura do banco, entrada do motor, progresso e cartão de pergunta.
// Nada aqui decide resultado; o veredito só sai do motor (DT-21).
import type { PacoteConteudo, Pergunta, Profundidade, Subnivel } from '@stacksync/content/tipos';
import {
  estadoPercurso,
  opcoesDaPergunta,
  textoPergunta,
  trocarAlvo,
  type EntradaAvaliacao,
  type MovimentoIdeia,
  type RespostaEntrada,
} from '@stacksync/engine';
import { iso, type Tx } from '../db/banco.ts';
import { alimentaRotulos, valorEmTexto } from '../ia/contexto.ts';

export type DecisaoIdeia = 'confirmada' | 'ajustada' | 'descartada';

export interface PropostaIdeia {
  movimentos: Array<{ id: string; parametro: string | null }>;
  explicacao: string;
  foraDoCatalogo: string[];
  descartados: string[];
  provedor: string | null;
  modelo: string | null;
  versaoPrompt: string | null;
  falha: string | null;
}

export interface Analise {
  id: string;
  nome: string;
  subnivel: Subnivel;
  profundidade: Profundidade;
  ideia: string | null;
  ideiaProposta: PropostaIdeia | null;
  ideiaMovimentos: MovimentoIdeia[] | null;
  ideiaDecisao: DecisaoIdeia | null;
  versaoConteudo: string;
  arquivada: boolean;
  primeiroVereditoEm: string | null;
  criadaEm: string;
  atualizadaEm: string;
}

export interface RespostaGravada {
  pergunta: string;
  valor: string | string[] | null;
  origem: RespostaEntrada['origem'];
  faixaOpcoes: string[] | null;
  faixaSinal: { sinal: string; faixa: [number, number] } | null;
  fonte: string | null;
  medidaEm: string | null;
  textoLivre: string | null;
  meio: string;
  versao: number;
  atualizadaEm: string;
}

type Linha = Record<string, unknown>;

export const analiseDe = (r: Linha): Analise => ({
  id: r.id as string,
  nome: r.nome as string,
  subnivel: r.subnivel as Subnivel,
  profundidade: r.profundidade as Profundidade,
  ideia: (r.ideia as string | null) ?? null,
  ideiaProposta: (r.ideia_proposta as PropostaIdeia | null) ?? null,
  ideiaMovimentos: (r.ideia_movimentos as MovimentoIdeia[] | null) ?? null,
  ideiaDecisao: (r.ideia_decisao as DecisaoIdeia | null) ?? null,
  versaoConteudo: r.versao_conteudo as string,
  arquivada: r.arquivada as boolean,
  primeiroVereditoEm: iso(r.primeiro_veredito_em),
  criadaEm: iso(r.criada_em)!,
  atualizadaEm: iso(r.atualizada_em)!,
});

export const respostaDe = (r: Linha): RespostaGravada => ({
  pergunta: r.pergunta as string,
  valor: (r.valor as string | string[] | null) ?? null,
  origem: r.origem as RespostaEntrada['origem'],
  faixaOpcoes: (r.faixa_opcoes as string[] | null) ?? null,
  faixaSinal: (r.faixa_sinal as RespostaGravada['faixaSinal']) ?? null,
  fonte: (r.fonte as string | null) ?? null,
  medidaEm: (r.medida_em as string | null) ?? null,
  textoLivre: (r.texto_livre as string | null) ?? null,
  meio: r.meio as string,
  versao: r.versao as number,
  atualizadaEm: iso(r.atualizada_em)!,
});

export async function carregarAnalise(tx: Tx, id: string): Promise<Analise | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const r = await tx.um('SELECT * FROM analises WHERE id = $1', [id]);
  return r ? analiseDe(r) : null;
}

export async function carregarRespostas(tx: Tx, analiseId: string): Promise<Record<string, RespostaGravada>> {
  const linhas = await tx.q('SELECT * FROM respostas WHERE analise_id = $1', [analiseId]);
  return Object.fromEntries(linhas.map((l) => [l.pergunta as string, respostaDe(l)]));
}

export async function alteradasAposVeredito(tx: Tx, analiseId: string): Promise<Set<string>> {
  const linhas = await tx.q<{ pergunta: string }>('SELECT DISTINCT pergunta FROM eventos_resposta WHERE analise_id = $1 AND apos_veredito', [analiseId]);
  return new Set(linhas.map((l) => l.pergunta));
}

export function entradaDe(respostas: Record<string, RespostaGravada>, alteradas: Set<string>): Record<string, RespostaEntrada> {
  const out: Record<string, RespostaEntrada> = {};
  for (const [id, r] of Object.entries(respostas)) {
    out[id] = {
      valor: r.valor,
      origem: r.origem,
      ...(r.faixaOpcoes?.length ? { faixaOpcoes: r.faixaOpcoes } : {}),
      ...(r.faixaSinal ? { faixaSinal: r.faixaSinal } : {}),
      ...(r.fonte ? { fonte: r.fonte } : {}),
      ...(r.medidaEm ? { medidaEm: r.medidaEm } : {}),
      ...(r.textoLivre ? { textoLivre: r.textoLivre } : {}),
      ...(alteradas.has(id) ? { alteradaAposVeredito: true } : {}),
    };
  }
  return out;
}

/** Data de referência (DC-16): hoje, no fuso do produto. */
export function hoje(agora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora);
}

/** A ideia só entra no cálculo depois de confirmada ou ajustada pelo usuário (RN-79). */
export function ideiaParaMotor(a: Analise): EntradaAvaliacao['ideia'] {
  if (!a.ideia || !a.ideiaMovimentos?.length || (a.ideiaDecisao !== 'confirmada' && a.ideiaDecisao !== 'ajustada')) return null;
  return { texto: a.ideia, movimentos: a.ideiaMovimentos.map((m) => ({ id: m.id, ...(m.parametro ? { parametro: m.parametro } : {}) })) };
}

export function entradaAvaliacao(a: Analise, respostas: Record<string, RespostaEntrada>, asOf: string): EntradaAvaliacao {
  return { subnivel: a.subnivel, profundidade: a.profundidade, asOf, respostas, ideia: ideiaParaMotor(a) };
}

export function estadoDa(c: PacoteConteudo, a: Analise, entrada: Record<string, RespostaEntrada>) {
  return estadoPercurso(c, { subnivel: a.subnivel, profundidade: a.profundidade, respostas: entrada, temIdeia: !!a.ideia, asOf: hoje() });
}

/** Progresso por tempo e por âmbito, sem nenhuma pista de direção do veredito (RF-07, RN-81). */
export function progressoDe(c: PacoteConteudo, a: Analise, entrada: Record<string, RespostaEntrada>) {
  const e = estadoDa(c, a, entrada);
  return {
    respondidas: e.perguntaveis.filter((id) => entrada[id]).length,
    orcamento: e.orcamento,
    restantes: e.restantes,
    minutosRestantes: e.minutosRestantes,
    ambitos: e.ambitosDoNivel.map((id) => ({ id, rotulo: c.estrutura.ambitos[id] ?? id, coberto: e.ambitosCobertos.includes(id) })),
    fatores: (Object.keys(e.fatores) as Array<keyof typeof e.fatores>).map((f) => ({ id: f, rotulo: c.estrutura.fatoresPeso5[f], estado: e.fatores[f] })),
    concluido: e.concluido,
  };
}

export type Progresso = ReturnType<typeof progressoDe>;

const comAlvo = (c: PacoteConteudo, subnivel: Subnivel, t: string) => trocarAlvo(c, subnivel, t);

export function visaoResposta(c: PacoteConteudo, p: Pergunta, r: RespostaGravada, alteradas: Set<string>) {
  const entrada = entradaDe({ [r.pergunta]: r }, alteradas)[r.pergunta]!;
  return {
    valor: r.valor,
    origem: r.origem,
    faixaOpcoes: r.faixaOpcoes,
    faixaSinal: r.faixaSinal,
    fonte: r.fonte,
    medidaEm: r.medidaEm,
    textoLivre: r.textoLivre,
    meio: r.meio,
    versao: r.versao,
    rotulo: valorEmTexto(c, p, entrada),
    alteradaAposVeredito: alteradas.has(r.pergunta),
    atualizadaEm: r.atualizadaEm,
  };
}

export interface Sugestao {
  opcoes: string[];
  origem: 'ia' | 'padrao';
  falha: string | null;
}

/** Cartão de pergunta (T-05): sugestões sem marca, "Não sei" e campo livre no mesmo componente. */
export function cartaoDe(
  c: PacoteConteudo,
  a: Analise,
  p: Pergunta,
  entrada: Record<string, RespostaEntrada>,
  sugestao: Sugestao,
  resposta: RespostaGravada | null,
  alteradas: Set<string>,
) {
  return {
    id: p.id,
    ambito: p.ambito,
    ambitoRotulo: c.estrutura.ambitos[p.ambito] ?? p.ambito,
    texto: textoPergunta(c, p, a.subnivel),
    porQue: comAlvo(c, a.subnivel, p.porQue),
    termos: p.termos ?? [],
    tipo: p.tipo,
    maxSelecoes: p.maxSelecoes ?? null,
    opcoes: opcoesDaPergunta(c, p, entrada),
    sugeridas: sugestao.opcoes,
    origemSugestoes: sugestao.origem,
    avisoSugestoes: sugestao.falha ? (c.textos['ui.pergunta.sugestoesIndisponiveis'] ?? null) : null,
    permiteMedida: a.profundidade !== 'rapido' && p.permiteMedida,
    alimenta: alimentaRotulos(c, p),
    pesoMaximo: !!p.cobre?.length,
    pontes: (p.pontes ?? []).map((b) => ({ id: b.id, texto: comAlvo(c, a.subnivel, b.texto), opcoes: b.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo })) })),
    comoDescobrir: p.comoDescobrir ? comAlvo(c, a.subnivel, p.comoDescobrir) : null,
    quemPodeSaber: p.quemPodeSaber ?? null,
    resposta: resposta ? visaoResposta(c, p, resposta, alteradas) : null,
  };
}

export type CartaoPergunta = ReturnType<typeof cartaoDe>;
