// Estrutura de decisão do percurso adaptativo (DT-30; RN-89 a RN-91; FF-20).
// A IA do usuário escolhe a próxima pergunta entre as elegíveis; sem provedor, vale a ordem padrão,
// que é determinística. A estrutura garante a cobertura dos fatores de peso 5 em todos os níveis.
import type { FatorPeso5, Opcao, PacoteConteudo, Pergunta, Profundidade, Subnivel } from '@stacksync/content/tipos';
import { aplicaveis, normalizar } from './nucleo.ts';
import { dataPt } from './tecnologias.ts';
import type { RespostaEntrada } from './tipos.ts';

export interface EntradaPercurso {
  subnivel: Subnivel;
  profundidade: Profundidade;
  respostas: Record<string, RespostaEntrada>;
  temIdeia: boolean;
  asOf: string;
}

export interface EstadoPercurso {
  /** Perguntas que o motor considera (qualquer modo). */
  aplicaveis: string[];
  /** Perguntas que este nível pode perguntar. */
  perguntaveis: string[];
  respondidas: string[];
  elegiveis: string[];
  ordemPadrao: string | null;
  orcamento: number | null;
  restantes: number | null;
  minutosRestantes: number;
  ambitosCobertos: string[];
  ambitosDoNivel: string[];
  fatores: Record<FatorPeso5, 'pergunta' | 'estimativa' | 'descoberto'>;
  concluido: boolean;
}

const FATORES: FatorPeso5[] = ['F1', 'F2', 'F3', 'F4', 'F5'];

export function estadoPercurso(conteudo: PacoteConteudo, e: EntradaPercurso): EstadoPercurso {
  const prof = conteudo.estrutura.profundidades[e.profundidade];
  const sub = conteudo.estrutura.subniveis[e.subnivel];
  const norm = normalizar(conteudo, e.profundidade, e.asOf, e.respostas);
  const todas = aplicaveis(conteudo, e.subnivel, e.profundidade, norm, e.temIdeia);
  const perguntaveis = aplicaveis(conteudo, e.subnivel, e.profundidade, norm, e.temIdeia, prof.modos);
  const respondidas = todas.filter((id) => e.respostas[id] !== undefined);
  const setResp = new Set(respondidas);

  const fatores = {} as EstadoPercurso['fatores'];
  for (const f of FATORES) {
    const porPergunta = respondidas.some((id) => conteudo.perguntas[id]!.cobre?.includes(f));
    const porEstimativa =
      e.profundidade === 'rapido' && (sub.coberturaEstimada[f] ?? []).some((id) => setResp.has(id));
    fatores[f] = porPergunta ? 'pergunta' : porEstimativa ? 'estimativa' : 'descoberto';
  }

  const pendentes = perguntaveis.filter((id) => !setResp.has(id));
  const obrigatorias = pendentes.filter((id) => conteudo.perguntas[id]!.obrigatoria);
  const descobertos = FATORES.filter((f) => fatores[f] === 'descoberto');
  // No Rápido, um fator pode ser coberto por estimativa a partir de outras respostas (RN-90).
  const fontesEstimativa = new Set(e.profundidade === 'rapido' ? descobertos.flatMap((f) => sub.coberturaEstimada[f] ?? []) : []);
  const cobrem = pendentes.filter((id) => conteudo.perguntas[id]!.cobre?.some((f) => descobertos.includes(f)) || fontesEstimativa.has(id));
  const respondidasNoNivel = perguntaveis.filter((id) => setResp.has(id)).length;
  const orcamento = prof.perguntas;
  const restantes = orcamento === null ? null : Math.max(0, orcamento - respondidasNoNivel);

  const urgentes = [...new Set([...obrigatorias, ...cobrem])];
  let elegiveis: string[];
  if (restantes !== null && restantes <= urgentes.length) elegiveis = urgentes;
  else elegiveis = pendentes;
  if (restantes !== null && restantes <= 0 && !urgentes.length) elegiveis = [];

  // Ordem padrão: obrigatórias, depois as que cobrem fator de peso 5 em aberto, depois as que
  // completam um eixo já começado, depois o peso; em empate, a ordem do catálogo.
  const iniciadas = new Set(respondidas.flatMap((id) => eixosDa(conteudo, id)));
  const pontuar = (id: string) => {
    const p = conteudo.perguntas[id]!;
    const completa = eixosDa(conteudo, id).some((x) => iniciadas.has(x)) ? 0.5 : 0;
    return (p.obrigatoria ? 100 : 0) + (p.cobre?.some((f) => descobertos.includes(f)) || fontesEstimativa.has(id) ? 50 : 0) + p.peso + completa;
  };
  const ordenadas = [...elegiveis].sort(
    (a, b) => pontuar(b) - pontuar(a) || conteudo.ordemPerguntas.indexOf(a) - conteudo.ordemPerguntas.indexOf(b),
  );

  const proximas = restantes === null ? pendentes : ordenadas.slice(0, restantes);
  const segundos = (restantes === null ? pendentes : proximas).reduce((s, id) => s + conteudo.perguntas[id]!.segundos, 0);
  const ambitosCobertos = [...new Set(respondidas.map((id) => conteudo.perguntas[id]!.ambito))];
  const ambitosDoNivel = [...new Set(perguntaveis.map((id) => conteudo.perguntas[id]!.ambito))];
  return {
    aplicaveis: todas,
    perguntaveis,
    respondidas,
    elegiveis: ordenadas,
    ordemPadrao: ordenadas[0] ?? null,
    orcamento,
    restantes,
    minutosRestantes: Math.ceil(segundos / 60),
    ambitosCobertos,
    ambitosDoNivel,
    fatores,
    concluido: ordenadas.length === 0,
  };
}

export function eixosDa(conteudo: PacoteConteudo, perguntaId: string): string[] {
  const out = new Set<string>();
  for (const modelo of Object.values(conteudo.modelos))
    for (const s of Object.values(modelo.sinais)) if (s.pergunta === perguntaId) for (const e of modelo.eixos) if (JSON.stringify(e).includes(`"sinal":"${s.id}"`)) out.add(e.id);
  return [...out];
}

/** Preposição com o artigo do alvo, contraída como no português ("de o sistema" vira "do sistema"). */
function contraida(prep: string, valor: string): string {
  const m = /^(o|a|os|as) (.*)$/.exec(valor);
  if (!m) return `${prep} ${valor}`;
  const c = (prep.toLowerCase() === 'de' ? 'd' : 'n') + m[1];
  return `${prep[0] === prep[0]!.toUpperCase() ? c[0]!.toUpperCase() + c.slice(1) : c} ${m[2]}`;
}

/** Troca {alvo} e {existente} pelo alvo do subnível (P3 5.9), com as contrações e a maiúscula inicial. */
export function trocarAlvo(conteudo: PacoteConteudo, subnivel: Subnivel, texto: string): string {
  const sub = conteudo.estrutura.subniveis[subnivel];
  const valores: Record<string, string> = { alvo: sub.alvo, existente: sub.existente };
  const r = texto
    .replace(/\b(de|em|De|Em) \{(alvo|existente)\}/g, (_, prep: string, chave: string) => contraida(prep, valores[chave]!))
    .replace(/\{(alvo|existente)\}/g, (_, chave: string) => valores[chave]!);
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/** Texto da pergunta com o alvo do subnível (P3 5.9). */
export function textoPergunta(conteudo: PacoteConteudo, p: Pergunta, subnivel: Subnivel): string {
  return trocarAlvo(conteudo, subnivel, p.textoPorSubnivel?.[subnivel] ?? p.texto);
}

/** Opções da pergunta, inclusive as dinâmicas (tecnologias da categoria, ciclos de versão). */
export function opcoesDaPergunta(conteudo: PacoteConteudo, p: Pergunta, respostas: Record<string, RespostaEntrada>): Opcao[] {
  if (!p.opcoesDinamicas) return p.opcoes;
  const valor = (id: string) => {
    const v = respostas[id]?.valor;
    return typeof v === 'string' ? v : null;
  };
  if (p.opcoesDinamicas === 'tecnologias') {
    const cat = valor('T-01');
    if (!cat) return [];
    return Object.values(conteudo.tecnologias)
      .filter((t) => t.categorias.includes(cat))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .map((t) => ({ id: t.id, rotulo: t.nome }));
  }
  const tecId = valor('T-02');
  const tec = tecId ? conteudo.tecnologias[tecId] : undefined;
  const prod = tec?.eol ? conteudo.eol.produtos[tec.eol.produto] : undefined;
  if (!prod) return [];
  return prod.ciclos.slice(0, 8).map((c) => ({
    id: c.ciclo,
    rotulo: c.ciclo,
    detalhe:
      c.fimSuporte === 'encerrado'
        ? 'Suporte encerrado'
        : c.fimSuporte
          ? `Suporte até ${dataPt(c.fimSuporte)}`
          : c.mantido
            ? 'Mantida, sem data de fim anunciada'
            : 'Sem manutenção indicada',
  }));
}

/** Opções padrão da estrutura (C-02), usadas quando o provedor de IA não responde. */
export function opcoesPadrao(conteudo: PacoteConteudo, p: Pergunta, respostas: Record<string, RespostaEntrada>): string[] {
  if (!p.opcoesDinamicas) return p.padrao;
  return opcoesDaPergunta(conteudo, p, respostas)
    .slice(0, p.tipo === 'multipla' ? 4 : 3)
    .map((o) => o.id);
}
