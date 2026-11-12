// Contexto de cada etapa montado pelo sistema, de forma determinística, a partir do pacote de
// conteúdo (Parte 4, 10.3). Minimização (10.6): nunca vai o nome da análise nem da organização;
// RG-12 e RG-13 nunca recebem a ideia prévia nem resultado parcial (RN-92, FF-19).
import type { PacoteConteudo, Pergunta, Subnivel } from '@stacksync/content/tipos';
import {
  numeroPt,
  opcoesDaPergunta,
  rotuloOpcao,
  textoPergunta,
  type DocumentoVeredito,
  type EstadoPercurso,
  type RespostaEntrada,
} from '@stacksync/engine';

export const preencher = (modelo: string, valores: Record<string, string>): string =>
  modelo.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? '');

const ORIGEM: Record<string, string> = {
  medida: 'medida',
  estimativa: 'estimativa',
  inferencia: 'inferida',
  desconhecida: 'não sabe',
  nao_se_aplica: 'não se aplica',
};

export function enquadramento(c: PacoteConteudo, subnivel: Subnivel): string {
  const s = c.estrutura.subniveis[subnivel];
  const ramo = c.textos[`ui.enquadramento.${s.ramo}`] ?? s.ramo;
  return `${ramo}, ${s.rotulo.toLowerCase()}: ${s.descricao.replace(/\.$/, '').toLowerCase()}`;
}

/** O que a pergunta alimenta, em palavras (eixos, portões, fatores de peso 5). */
export function alimentaRotulos(c: PacoteConteudo, p: Pergunta): string[] {
  const eixos = new Map([...c.modelos.arquitetura.eixos, ...c.modelos.ferramenta.eixos].map((e) => [e.id, e.nome]));
  const out = new Set<string>();
  for (const a of p.alimenta) {
    const [id, lado] = a.split('.');
    if (id && eixos.has(id)) out.add(`eixo ${eixos.get(id)}${lado === 'N' ? ' (necessidade)' : lado === 'C' ? ' (capacidade)' : ''}`);
    else if (/^P\d$/.test(a)) out.add(`portão ${c.textos[`portao.${a}`] ?? a}`);
    else out.add(a.toLowerCase());
  }
  for (const f of p.cobre ?? []) out.add(`fator de peso 5: ${c.estrutura.fatoresPeso5[f]}`);
  return [...out];
}

export function valorEmTexto(c: PacoteConteudo, p: Pergunta, r: RespostaEntrada): string {
  if (r.origem === 'desconhecida') return 'não sabe';
  if (r.origem === 'nao_se_aplica') return 'não se aplica';
  if (r.faixaSinal) return 'faixa estimada por perguntas-ponte';
  const opcoes = r.faixaOpcoes?.length ? r.faixaOpcoes : Array.isArray(r.valor) ? r.valor : r.valor ? [r.valor] : [];
  const rot = opcoes.map((o) => rotuloOpcao(p, o, c));
  if (p.tipo === 'multipla') return rot.join('; ') || 'nenhuma';
  if (rot.length > 1) return `entre ${rot[0]} e ${rot[rot.length - 1]}`;
  return rot[0] ?? 'sem resposta';
}

export function linhasRespostas(c: PacoteConteudo, subnivel: Subnivel, respostas: Record<string, RespostaEntrada>): string {
  const linhas = c.ordemPerguntas
    .filter((id) => respostas[id])
    .map((id) => {
      const p = c.perguntas[id]!;
      const r = respostas[id]!;
      return `- [${id}] ${textoPergunta(c, p, subnivel)} → ${valorEmTexto(c, p, r)} (${ORIGEM[r.origem] ?? r.origem})`;
    });
  return linhas.length ? linhas.join('\n') : '- nenhuma ainda';
}

const listaOpcoes = (c: PacoteConteudo, p: Pergunta, respostas: Record<string, RespostaEntrada>) =>
  opcoesDaPergunta(c, p, respostas).map((o) => ({ id: o.id, rotulo: o.rotulo, ...(o.detalhe ? { detalhe: o.detalhe } : {}) }));

// ---------------------------------------------------------------- RG-12 e RG-13: percurso

export interface DadosPercurso {
  elegiveis: Array<{ id: string; texto: string; opcoes: Array<{ id: string; rotulo: string }>; padrao: string[] }>;
  ordemPadrao: string | null;
}

export function contextoPercurso(
  c: PacoteConteudo,
  a: { subnivel: Subnivel; profundidade: keyof PacoteConteudo['estrutura']['profundidades'] },
  respostas: Record<string, RespostaEntrada>,
  estado: EstadoPercurso,
  elegiveis: string[],
  padraoDe: (p: Pergunta) => string[],
): { usuario: string; dados: DadosPercurso } {
  const prof = c.estrutura.profundidades[a.profundidade];
  const descobertos = (Object.entries(estado.fatores) as Array<[keyof typeof estado.fatores, string]>)
    .filter(([, v]) => v === 'descoberto')
    .map(([f]) => c.estrutura.fatoresPeso5[f]);
  const itens = elegiveis.map((id) => {
    const p = c.perguntas[id]!;
    return { id, texto: textoPergunta(c, p, a.subnivel), opcoes: listaOpcoes(c, p, respostas), padrao: padraoDe(p), alimenta: alimentaRotulos(c, p) };
  });
  const usuario = preencher(c.prompts.proximaPergunta!, {
    enquadramento: enquadramento(c, a.subnivel),
    profundidade: `${prof.rotulo} (${prof.minutosRotulo})`,
    restantes: estado.restantes === null ? 'Sem limite de perguntas neste nível.' : `Restam cerca de ${estado.restantes} perguntas no orçamento deste nível.`,
    respostas: linhasRespostas(c, a.subnivel, respostas),
    fatores: descobertos.length ? descobertos.join('; ') : 'nenhum',
    elegiveis: itens
      .map((i) => `- [${i.id}] ${i.texto} | alimenta: ${i.alimenta.join('; ')} | opções: ${i.opcoes.map((o) => `${o.id} = ${o.rotulo}`).join('; ')}`)
      .join('\n'),
  });
  return { usuario, dados: { elegiveis: itens.map(({ id, texto, opcoes, padrao }) => ({ id, texto, opcoes, padrao })), ordemPadrao: estado.ordemPadrao } };
}

export interface DadosSugestoes {
  pergunta: string;
  opcoes: Array<{ id: string; rotulo: string }>;
  padrao: string[];
}

export function contextoSugestoes(
  c: PacoteConteudo,
  subnivel: Subnivel,
  p: Pergunta,
  respostas: Record<string, RespostaEntrada>,
  padrao: string[],
): { usuario: string; dados: DadosSugestoes } {
  const opcoes = listaOpcoes(c, p, respostas);
  const outras = Object.fromEntries(Object.entries(respostas).filter(([id]) => id !== p.id));
  const usuario = preencher(c.prompts.sugestoes!, {
    enquadramento: enquadramento(c, subnivel),
    respostas: linhasRespostas(c, subnivel, outras),
    pergunta: `[${p.id}] ${textoPergunta(c, p, subnivel)}`,
    opcoes: opcoes.map((o) => `- ${o.id}: ${o.rotulo}${o.detalhe ? ` (${o.detalhe})` : ''}`).join('\n'),
  });
  return { usuario, dados: { pergunta: p.id, opcoes, padrao } };
}

// ---------------------------------------------------------------- RG-01: texto livre

export interface DadosInterpretacao {
  pergunta: string;
  tipo: 'opcao' | 'multipla';
  opcoes: Array<{ id: string; rotulo: string }>;
  texto: string;
}

export function contextoInterpretacao(
  c: PacoteConteudo,
  subnivel: Subnivel,
  p: Pergunta,
  respostas: Record<string, RespostaEntrada>,
  texto: string,
  modo: 'outra' | 'nao_sei_mas',
): { usuario: string; dados: DadosInterpretacao } {
  const opcoes = listaOpcoes(c, p, respostas);
  const usuario = preencher(c.prompts.interpretacao!, {
    pergunta: `${textoPergunta(c, p, subnivel)}${p.tipo === 'multipla' ? ' (múltipla escolha)' : ''}`,
    opcoes: opcoes.map((o) => `- ${o.id}: ${o.rotulo}${o.detalhe ? ` (${o.detalhe})` : ''}`).join('\n'),
    modo: modo === 'outra' ? c.prompts.modoOutra! : c.prompts.modoNaoSeiMas!,
    texto,
  });
  return { usuario, dados: { pergunta: p.id, tipo: p.tipo, opcoes, texto } };
}

// ---------------------------------------------------------------- ideia prévia

export interface DadosIdeia {
  texto: string;
  movimentos: Array<{ id: string; nome: string; descricao: string }>;
  tecnologias: Array<{ id: string; nome: string }>;
}

/** Movimentos do catálogo que podem representar uma ideia no subnível. */
export function movimentosDaIdeia(c: PacoteConteudo, subnivel: Subnivel) {
  const modelo = c.estrutura.subniveis[subnivel].modelo;
  return c.movimentos.filter((m) => m.modelo === modelo && (m.subniveis.includes(subnivel) || m.apenasIdeia));
}

export function tecnologiasDaIdeia(c: PacoteConteudo, respostas: Record<string, RespostaEntrada>) {
  const cat = typeof respostas['T-01']?.valor === 'string' ? (respostas['T-01'].valor as string) : null;
  return Object.values(c.tecnologias)
    .filter((t) => !cat || t.categorias.includes(cat))
    .map((t) => ({ id: t.id, nome: t.nome }))
    .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
}

export function contextoIdeia(
  c: PacoteConteudo,
  subnivel: Subnivel,
  texto: string,
  respostas: Record<string, RespostaEntrada>,
): { usuario: string; dados: DadosIdeia } {
  const movimentos = movimentosDaIdeia(c, subnivel).map((m) => ({ id: m.id, nome: m.nome, descricao: m.descricao }));
  const ferramenta = c.estrutura.subniveis[subnivel].modelo === 'ferramenta';
  const tecnologias = ferramenta ? tecnologiasDaIdeia(c, respostas) : [];
  const usuario = preencher(c.prompts.ideia!, {
    enquadramento: enquadramento(c, subnivel),
    texto,
    movimentos: movimentos.map((m) => `- ${m.id}: ${m.nome}. ${m.descricao}`).join('\n'),
    tecnologias: ferramenta
      ? `Tecnologias da base de referência (identificador: nome), para o parâmetro dos movimentos que trocam ou adotam uma ferramenta; uma ideia sobre a ferramenta usa um movimento só:\n${tecnologias.map((t) => `- ${t.id}: ${t.nome}`).join('\n')}`
      : 'Nesta análise nenhum movimento leva parâmetro; use nulo.',
  });
  return { usuario, dados: { texto, movimentos, tecnologias } };
}

// ---------------------------------------------------------------- RG-10: raciocínio guiado

export interface AlvoRaciocinio {
  id: string;
  rotulo: string;
  /** Conclusão do motor para este alvo, para comparar com a avaliação própria da IA (VI-06). */
  conclusao: string;
  citaveis: string[];
}

export interface DadosRaciocinio {
  alvos: AlvoRaciocinio[];
  ajustado: boolean;
  citaveis: string[];
  /** Números que o texto da IA pode citar (VI-03). */
  numeros: string[];
  /** Tecnologias que o texto da IA pode citar (VI-04). */
  tecnologias: string[];
}

const fx = (f: { lo: number; hi: number }) => `${numeroPt(f.lo, 2)} a ${numeroPt(f.hi, 2)}`;
const fxInt = (f: { lo: number; hi: number }) => `entre ${f.lo} e ${f.hi}`;

export function contextoRaciocinio(
  c: PacoteConteudo,
  doc: DocumentoVeredito,
  respostas: Record<string, RespostaEntrada>,
): { usuario: string; dados: DadosRaciocinio } {
  const categoria = c.textos[`categoria.${doc.ajuste.categoria}`] ?? doc.ajuste.categoria;
  const ajustado = doc.ajuste.categoria === 'ajustado';
  const fora = doc.eixos.filter((e) => e.avaliado && e.lado !== 'dentro');
  const eixosTexto = (ajustado ? doc.eixos.filter((e) => e.avaliado) : fora)
    .map((e) => {
      const sinais = [...e.sinaisN, ...e.sinaisC].map((s) => `[${s.pergunta}] ${s.rotulo}: ${s.resposta} (${ORIGEM[s.origem] ?? s.origem})`);
      return `- ${e.id} ${e.nome}: necessidade ${e.N ? fx(e.N) : 'sem sinal'}${e.ancoraN ? ` (${e.ancoraN})` : ''}; capacidade ${e.C ? fx(e.C) : 'sem sinal'}${e.ancoraC ? ` (${e.ancoraC})` : ''}; ${e.lado === 'dentro' ? 'dentro da tolerância' : e.lado === 'sobra' ? 'sobra' : 'falta'}${e.desvio ? `, desvio ${fx(e.desvio)}` : ''}. Sinais: ${sinais.join('; ') || 'nenhum'}`;
    })
    .join('\n');

  const alvos: AlvoRaciocinio[] = [];
  const citaveisDe = (evid: string[], regras: string[], perguntas: string[]) => [...new Set([...perguntas, ...regras, ...evid])];
  if (ajustado)
    alvos.push({ id: 'ajuste', rotulo: 'O ajuste atual', conclusao: 'ajustado', citaveis: citaveisDe([], [], doc.trilha.filter((n) => n.tipo === 'resposta').map((n) => n.id).slice(0, 6)) });
  else if (doc.ajuste.categoria === 'inconclusivo' || doc.ajuste.categoria === 'indefinido')
    alvos.push({ id: 'incerteza', rotulo: 'A incerteza do resultado', conclusao: doc.ajuste.categoria, citaveis: doc.perguntasDeMaiorValor.map((p) => p.pergunta) });
  else
    for (const e of fora.slice(0, 4)) {
      const eixo = [...c.modelos.arquitetura.eixos, ...c.modelos.ferramenta.eixos].find((x) => x.id === e.id);
      alvos.push({
        id: e.id,
        rotulo: `O eixo ${e.nome}`,
        conclusao: e.lado,
        citaveis: citaveisDe(eixo?.evidencias ?? [], eixo?.regras ?? [], [...e.sinaisN, ...e.sinaisC].map((s) => s.pergunta)),
      });
    }
  if (doc.ideia)
    for (const g of doc.ideia.portoes.filter((x) => x.estado !== 'nao_avaliado'))
      alvos.push({ id: g.id, rotulo: `O portão ${g.nome}`, conclusao: g.estado, citaveis: [g.id] });
  if (!ajustado) alvos.push({ id: 'plano', rotulo: 'O plano ideal', conclusao: doc.plano.variante, citaveis: doc.plano.razoes.flatMap((r) => [...r.regras, ...r.evidencias]) });

  // Referências citáveis: regras e evidências das razões, dos eixos fora da tolerância e do plano.
  const idsRef = new Set<string>();
  for (const r of [...doc.razoes, ...doc.plano.razoes, ...(doc.ideia?.razoes ?? [])]) [...r.regras, ...r.evidencias].forEach((x) => idsRef.add(x));
  for (const a of alvos) a.citaveis.filter((x) => c.regras[x] || c.evidencias[x]).forEach((x) => idsRef.add(x));
  const refs = [...idsRef].slice(0, 18).map((id) => {
    const r = c.regras[id];
    if (r) return `- ${id}: ${r.resumo}`;
    const ev = c.evidencias[id]!;
    return `- ${id}: ${ev.autores} (${ev.ano}). ${ev.achado}`;
  });
  const nos = doc.trilha.filter((n) => n.tipo !== 'resposta').slice(0, 40);
  const respondidas = Object.keys(respostas);

  const ideiaTexto = doc.ideia
    ? `Avaliação da ideia prévia pelo motor: ${doc.ideia.fraseVeredito} Índice de Ajuste da ideia ${fxInt(doc.ideia.indice)}; contra ${doc.ideia.baseRotulo}, ${fxInt(doc.ideia.contraBase)} pontos. Portões:\n${doc.ideia.portoes
        .map((g) => `- ${g.id} ${g.nome}: ${c.textos[`portao.estado.${g.estado}`] ?? g.estado}. ${g.motivo}`)
        .join('\n')}`
    : 'Não há ideia prévia avaliada.';
  const planoTexto = `${doc.plano.frase}${doc.plano.movimentos.length ? ` Movimentos: ${doc.plano.movimentos.map((m) => m.nome).join('; ')}.` : ''}${
    doc.plano.tecnologias.length
      ? ` Tecnologias: ${doc.plano.tecnologias.map((d) => `${d.nome}: ${d.linhas.find((l) => l.escolhida)?.nome ?? 'nenhuma escolhida'}`).join('; ')}.`
      : ''
  }${doc.plano.indice ? ` Índice de Ajuste projetado ${fxInt(doc.plano.indice)}.` : ''}`;

  const usuario = preencher(c.prompts.raciocinio!, {
    enquadramento: enquadramento(c, doc.subnivel),
    categoria,
    frase: `${doc.textos.frase} Índice de Ajuste ${fxInt(doc.ajuste.indice)}. ${doc.textos.confianca}`,
    eixos: eixosTexto || '- nenhum eixo avaliado',
    ideia: ideiaTexto,
    plano: planoTexto,
    referencias: refs.join('\n') || '- nenhuma',
    nos: [...respondidas.map((id) => `[${id}]`), ...nos.map((n) => `[${n.id}] ${n.rotulo}`)].join('; '),
    alvos: alvos.map((a) => a.id).join(', '),
    restricaoAjustado: ajustado ? c.prompts.restricaoAjustado! : '',
  });

  const tecnologias = [
    ...doc.plano.tecnologias.flatMap((d) => d.linhas.map((l) => l.nome)),
    ...(doc.ferramenta?.atual ? [c.tecnologias[doc.ferramenta.atual]?.nome ?? ''] : []),
    ...(doc.ideia?.movimentos.map((m) => m.nome) ?? []),
  ].filter(Boolean);
  return {
    usuario,
    dados: {
      alvos,
      ajustado,
      citaveis: [...new Set([...respondidas, ...nos.map((n) => n.id), ...idsRef, ...alvos.flatMap((a) => a.citaveis)])],
      numeros: [],
      tecnologias,
    },
  };
}

// ---------------------------------------------------------------- RG-14: candidatas

export interface DadosCandidatas {
  decisoes: Array<{ id: string; nome: string }>;
  avaliadas: string[];
}

export function contextoCandidatas(c: PacoteConteudo, doc: DocumentoVeredito): { usuario: string; dados: DadosCandidatas } {
  const decisoes = doc.plano.tecnologias.map((d) => ({ id: d.id, nome: d.nome }));
  const avaliadas = Object.values(c.tecnologias).map((t) => t.nome);
  const usuario = preencher(c.prompts.candidatas!, {
    decisoes: doc.plano.tecnologias
      .map((d) => `- ${d.id} (${d.nome}): ${d.descricao}. Avaliadas: ${d.linhas.map((l) => `${l.nome}${l.escolhida ? ' (escolhida)' : ''}`).join(', ')}`)
      .join('\n'),
    avaliadas: avaliadas.join(', '),
  });
  return { usuario, dados: { decisoes, avaliadas } };
}
