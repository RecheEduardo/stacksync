// Validadores da saída da IA (Parte 4, 10.3, VI-01 a VI-08). O que não passa é descartado e
// aparece como descartado, com o motivo (RF-54); no percurso, valem a ordem e as opções padrão.
import type { PacoteConteudo, Pergunta } from '@stacksync/content/tipos';
import { lintVocabulario } from '@stacksync/content/vocabulario';
import type { SaidaCandidatas, SaidaIdeia, SaidaInterpretacao, SaidaPercurso, SaidaRaciocinio } from '@stacksync/contracts';
import type { DadosIdeia, DadosRaciocinio } from './contexto.ts';

// ---------------------------------------------------------------- utilitários

/** Identificadores (RN-73, E2, P4, B-01, T-03-db, F-10.p1) não contam como números citados. */
const IDENTIFICADOR = /\b[A-Za-z]{1,3}-?\d+[a-z]?(?:[.-][A-Za-z0-9]+)*\b/g;

function normalizarNumero(bruto: string): string {
  let s = bruto;
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : s;
}

export function numerosDe(texto: string): Set<string> {
  const out = new Set<string>();
  for (const m of texto.replace(IDENTIFICADOR, ' ').matchAll(/\d+(?:[.,]\d+)*/g)) out.add(normalizarNumero(m[0]));
  return out;
}

/** VI-03: todo número do texto existe no contexto (documento de veredito ou respostas). */
export function numerosNovos(texto: string, permitidos: Set<string>): string[] {
  const escala = new Set(['0', '1', '2', '3', '4']);
  return [...numerosDe(texto)].filter((n) => !permitidos.has(n) && !escala.has(n));
}

/** VI-07: texto em pt-BR. Heurística simples: palavras funcionais do inglês dominando o texto. */
export function pareceIngles(texto: string): boolean {
  const en = texto.match(/\b(the|and|is|are|of|with|this|that|should|would|because)\b/gi)?.length ?? 0;
  const pt = texto.match(/\b(o|a|os|as|de|do|da|que|e|é|com|não|para|por)\b/gi)?.length ?? 0;
  return en >= 3 && en > pt;
}

/** VI-07: tamanho máximo por campo, cortando em fim de palavra. */
export function limitar(texto: string, max: number): string {
  const t = texto.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  return `${corte.slice(0, Math.max(corte.lastIndexOf(' '), max - 20)).trimEnd()}…`;
}

const normalizarNome = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** VI-04: nomes de tecnologia da base citados fora dos permitidos. */
export function tecnologiasNaoPermitidas(c: PacoteConteudo, texto: string, permitidas: string[]): string[] {
  const alvo = ` ${normalizarNome(texto)} `;
  const ok = new Set(permitidas.map(normalizarNome));
  return Object.values(c.tecnologias)
    .filter((t) => !ok.has(normalizarNome(t.nome)) && alvo.includes(` ${normalizarNome(t.nome)} `))
    .map((t) => t.nome);
}

/** VI-05: forma de sugestão de mudança (proibida no veredito Ajustado; RN-75). */
const SUGESTAO =
  /\b(recomend\w*|sugir\w*|sugest\w*|sugere\w*|deveria\w*|deve(?:m)? (?:adotar|mudar|migrar|separar|trocar|investir|considerar)|considere\w*|vale a pena|seria (?:bom|melhor|interessante|recomendável)|adote|adotem|implemente|implementem|migre|migrem|troque|troquem|introduza|invista|melhore|melhorem|próximos passos)\b/i;
export const temFormaDeSugestao = (texto: string) => SUGESTAO.test(texto);

// ---------------------------------------------------------------- VI-08: percurso e sugestões

export function validarSugestoes(saida: string[], p: Pergunta, idsOpcoes: string[]): { ok: true; opcoes: string[] } | { ok: false; motivo: string } {
  const unicas = [...new Set(saida)];
  if (unicas.length !== saida.length) return { ok: false, motivo: 'sugestões repetidas' };
  if (unicas.length < 2 || unicas.length > 4) return { ok: false, motivo: 'precisam ser de 2 a 4 sugestões' };
  const fora = unicas.filter((o) => !idsOpcoes.includes(o));
  if (fora.length) return { ok: false, motivo: `opções fora do domínio da pergunta ${p.id}` };
  // Sem ordem de preferência: as sugestões aparecem na ordem do catálogo (RN-92).
  return { ok: true, opcoes: idsOpcoes.filter((o) => unicas.includes(o)) };
}

export function validarPercurso(saida: SaidaPercurso, elegiveis: string[]): { ok: true } | { ok: false; motivo: string } {
  if (!elegiveis.includes(saida.pergunta)) return { ok: false, motivo: 'pergunta fora das elegíveis da estrutura' };
  return { ok: true };
}

// ---------------------------------------------------------------- RG-01: interpretação de texto livre

export function validarInterpretacao(
  c: PacoteConteudo,
  saida: SaidaInterpretacao,
  p: Pergunta,
  idsOpcoes: string[],
  contexto: string,
): { ok: true; opcoes: string[]; explicacao: string; entendeu: boolean } | { ok: false; motivo: string } {
  const fora = saida.opcoes.filter((o) => !idsOpcoes.includes(o));
  if (fora.length) return { ok: false, motivo: 'opção fora do domínio da pergunta' };
  let opcoes = idsOpcoes.filter((o) => saida.opcoes.includes(o));
  if (p.tipo === 'opcao' && opcoes.length > 1) {
    // Faixa de opções vizinhas: do menor ao maior índice, sem buracos.
    const i = idsOpcoes.indexOf(opcoes[0]!);
    const j = idsOpcoes.indexOf(opcoes[opcoes.length - 1]!);
    opcoes = idsOpcoes.slice(i, j + 1);
  }
  if (p.tipo === 'multipla' && p.maxSelecoes && opcoes.length > p.maxSelecoes) opcoes = opcoes.slice(0, p.maxSelecoes);
  const explicacao = limitar(saida.explicacao, 300);
  const problemas = [...lintVocabulario(explicacao, c.vocabularioProibido), ...numerosNovos(explicacao, numerosDe(contexto)).map((n) => `número novo: ${n}`)];
  if (pareceIngles(explicacao)) problemas.push('texto fora do pt-BR');
  if (problemas.length) return { ok: false, motivo: problemas.join('; ') };
  const entendeu = saida.entendeu && opcoes.length > 0;
  return { ok: true, opcoes: entendeu ? opcoes : [], explicacao, entendeu };
}

// ---------------------------------------------------------------- ideia prévia

export function validarIdeia(
  c: PacoteConteudo,
  saida: SaidaIdeia,
  dados: DadosIdeia,
  ferramenta: boolean,
): { movimentos: Array<{ id: string; parametro: string | null }>; explicacao: string; foraDoCatalogo: string[]; descartados: string[] } {
  const descartados: string[] = [];
  const permitidos = new Set(dados.movimentos.map((m) => m.id));
  const tecnologias = new Set(dados.tecnologias.map((t) => t.id));
  const comParametro = new Set(['fer.trocar', 'fer.codigo_novo']);
  const vistos = new Set<string>();
  let movimentos: Array<{ id: string; parametro: string | null }> = [];
  for (const m of saida.movimentos) {
    if (!permitidos.has(m.id)) {
      descartados.push(`${m.id}: fora do catálogo deste nível`);
      continue;
    }
    if (vistos.has(m.id)) continue;
    let parametro = m.parametro;
    if (ferramenta && comParametro.has(m.id)) {
      if (!parametro || !tecnologias.has(parametro)) {
        descartados.push(`${m.id}: a tecnologia citada não está na base de referência`);
        continue;
      }
    } else parametro = null;
    vistos.add(m.id);
    movimentos.push({ id: m.id, parametro });
  }
  // Uma ideia sobre a ferramenta é um movimento só (o motor avalia o primeiro).
  if (ferramenta && movimentos.length > 1) movimentos = movimentos.slice(0, 1);
  movimentos = movimentos.slice(0, 6);
  let explicacao = limitar(saida.explicacao, 400);
  if (lintVocabulario(explicacao, c.vocabularioProibido).length || pareceIngles(explicacao)) explicacao = '';
  const foraDoCatalogo = saida.foraDoCatalogo.map((s) => limitar(s, 200)).filter(Boolean).slice(0, 5);
  return { movimentos, explicacao, foraDoCatalogo, descartados };
}

// ---------------------------------------------------------------- RG-10: raciocínio guiado

export interface BlocoValidado {
  alvo: string;
  rotulo: string;
  resumo: string;
  evidencias: string[];
  contraArgumento: string;
  oQueMudaria: string;
  avaliacao: 'concorda' | 'mais_favoravel_a_mudar' | 'menos_favoravel_a_mudar';
  justificativa: string;
  conclusaoMotor: string;
  /** VI-06: a avaliação própria da IA diverge da do motor. */
  divergencia: null | 'mais_favoravel' | 'menos_favoravel';
}

export interface Descartado {
  alvo: string;
  motivo: string;
}

export function validarRaciocinio(
  c: PacoteConteudo,
  saida: SaidaRaciocinio,
  dados: DadosRaciocinio,
  contexto: string,
): { blocos: BlocoValidado[]; descartados: Descartado[]; sintese: string | null } {
  const permitidosNum = numerosDe(contexto);
  const citaveis = new Set(dados.citaveis);
  const blocos: BlocoValidado[] = [];
  const descartados: Descartado[] = [];
  const vistos = new Set<string>();

  const problemasTexto = (texto: string): string[] => {
    const p: string[] = [];
    const novos = numerosNovos(texto, permitidosNum);
    if (novos.length) p.push(`número que não está no resultado (${novos.join(', ')}), VI-03`);
    const voc = lintVocabulario(texto, c.vocabularioProibido);
    if (voc.length) p.push(`vocabulário (${voc[0]}), VI-04`);
    const tec = tecnologiasNaoPermitidas(c, texto, dados.tecnologias);
    if (tec.length) p.push(`tecnologia fora do plano (${tec.join(', ')}), VI-04`);
    if (dados.ajustado && temFormaDeSugestao(texto)) p.push('forma de sugestão num veredito Ajustado, VI-05');
    if (pareceIngles(texto)) p.push('texto fora do pt-BR, VI-07');
    return p;
  };

  for (const b of saida.blocos) {
    const alvo = dados.alvos.find((a) => a.id === b.alvo);
    if (!alvo) {
      descartados.push({ alvo: b.alvo, motivo: 'alvo fora dos pontos avaliados pelo motor, VI-01' });
      continue;
    }
    if (vistos.has(b.alvo)) continue;
    const evidencias = [...new Set(b.evidencias.map((e) => e.trim().replace(/^\[|\]$/g, '')))].filter((e) => citaveis.has(e));
    if (!evidencias.length) {
      descartados.push({ alvo: b.alvo, motivo: 'nenhuma citação a resposta, regra ou fonte existente, VI-02' });
      continue;
    }
    const campos = {
      resumo: limitar(b.resumo, 600),
      contraArgumento: limitar(b.contraArgumento, 500),
      oQueMudaria: limitar(b.oQueMudaria, 400),
      justificativa: limitar(b.justificativa, 500),
    };
    const problemas = Object.values(campos).flatMap(problemasTexto);
    if (problemas.length) {
      descartados.push({ alvo: b.alvo, motivo: [...new Set(problemas)].join('; ') });
      continue;
    }
    vistos.add(b.alvo);
    blocos.push({
      alvo: b.alvo,
      rotulo: alvo.rotulo,
      ...campos,
      evidencias,
      avaliacao: b.avaliacao,
      conclusaoMotor: alvo.conclusao,
      divergencia: b.avaliacao === 'concorda' ? null : b.avaliacao === 'mais_favoravel_a_mudar' ? 'mais_favoravel' : 'menos_favoravel',
    });
  }
  // A ordem dos blocos segue a dos alvos do motor, não a da IA.
  blocos.sort((x, y) => dados.alvos.findIndex((a) => a.id === x.alvo) - dados.alvos.findIndex((a) => a.id === y.alvo));
  const sintese = limitar(saida.sintese, 700);
  const problemasSintese = problemasTexto(sintese);
  if (problemasSintese.length) descartados.push({ alvo: 'sintese', motivo: [...new Set(problemasSintese)].join('; ') });
  return { blocos, descartados, sintese: problemasSintese.length || !sintese ? null : sintese };
}

// ---------------------------------------------------------------- RG-14: candidatas

export function validarCandidatas(
  c: PacoteConteudo,
  saida: SaidaCandidatas,
  decisoes: string[],
): { candidatas: Array<{ decisao: string; nome: string; motivo: string }>; descartados: Descartado[] } {
  const naBase = new Set(Object.values(c.tecnologias).flatMap((t) => [normalizarNome(t.nome), normalizarNome(t.id)]));
  const out: Array<{ decisao: string; nome: string; motivo: string }> = [];
  const descartados: Descartado[] = [];
  for (const k of saida.candidatas) {
    const nome = limitar(k.nome, 60);
    const motivo = limitar(k.motivo, 300);
    if (!decisoes.includes(k.decisao)) descartados.push({ alvo: nome, motivo: 'decisão fora do plano, VI-01' });
    else if (naBase.has(normalizarNome(nome))) descartados.push({ alvo: nome, motivo: 'já está na base de referência' });
    else if (lintVocabulario(`${nome} ${motivo}`, c.vocabularioProibido).length || pareceIngles(motivo))
      descartados.push({ alvo: nome, motivo: 'vocabulário, VI-04' });
    else if (!out.some((o) => normalizarNome(o.nome) === normalizarNome(nome))) out.push({ decisao: k.decisao, nome, motivo });
  }
  return { candidatas: out.slice(0, 3), descartados };
}

export { normalizarNome };
