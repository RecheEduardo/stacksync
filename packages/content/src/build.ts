// Compila o conhecimento (YAML) num pacote JSON versionado e com hash (DT-20).
// Valida schemas, integridade referencial (FF-07) e vocabulário (FF-06). Falha o build se algo quebrar.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { z } from 'zod';
import {
  calibracaoSchema,
  casoSchema,
  modeloSchema,
  movimentoSchema,
  perguntaSchema,
  tecnologiaSchema,
} from './schemas.ts';
import type {
  CasoAncora,
  Condicao,
  Expr,
  ModeloEixos,
  Movimento,
  PacoteConteudo,
  Pergunta,
  SnapshotEol,
  Tecnologia,
} from './tipos.ts';
import { lintVocabulario } from './vocabulario.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(raiz, 'conhecimento');
const ler = (rel: string): unknown => parse(readFileSync(join(dir, rel), 'utf8'), { merge: true, maxAliasCount: -1 });
const erros: string[] = [];
const falhar = (m: string) => erros.push(m);

function validar<T>(schema: z.ZodType<T>, dado: unknown, onde: string): T {
  const r = schema.safeParse(dado);
  if (!r.success) {
    for (const issue of r.error.issues) falhar(`${onde}: ${issue.path.join('.')} ${issue.message}`);
    return dado as T;
  }
  return r.data;
}

// ---------------------------------------------------------------- leitura
const estrutura = ler('estrutura.yaml') as PacoteConteudo['estrutura'];
const catalogoArq = ler('catalogo/arquitetura.yaml') as { perguntas: unknown[] };
const catalogoFer = ler('catalogo/ferramenta.yaml') as { perguntas: unknown[] };
const perguntasLista: Pergunta[] = [...catalogoArq.perguntas, ...catalogoFer.perguntas].map((p, i) =>
  validar(perguntaSchema, p, `pergunta[${i}]`),
) as Pergunta[];
const modeloArq = validar(modeloSchema, ler('modelo/arquitetura.yaml'), 'modelo/arquitetura') as ModeloEixos;
const modeloFer = validar(modeloSchema, ler('modelo/ferramenta.yaml'), 'modelo/ferramenta') as ModeloEixos;
for (const m of [modeloArq, modeloFer]) for (const [id, s] of Object.entries(m.sinais)) (s as { id: string }).id = id;
const movimentos = ((ler('movimentos.yaml') as { movimentos: unknown[] }).movimentos ?? []).map((m, i) =>
  validar(movimentoSchema, m, `movimento[${i}]`),
) as Movimento[];
const baseTec = ler('tecnologias/base.yaml') as {
  categorias: PacoteConteudo['categoriasFerramenta'] & Record<string, { troca: unknown }>;
  decisoes: Record<string, Omit<PacoteConteudo['decisoes'][string], 'id'>>;
  tecnologias: unknown[];
};
const tecnologias = baseTec.tecnologias.map((t, i) => validar(tecnologiaSchema, t, `tecnologia[${i}]`)) as Tecnologia[];
const eol = JSON.parse(readFileSync(join(dir, 'tecnologias/eol-snapshot.json'), 'utf8')) as SnapshotEol;
// A calibração vigente é a de maior versão publicada em calibracao/ (UC-22, RN-88).
const arquivosCalibracao = readdirSync(join(dir, 'calibracao'))
  .filter((f) => /^v\d+\.\d+\.yaml$/.test(f))
  .sort((a, b) => {
    const [ma, na] = a.slice(1, -5).split('.').map(Number) as [number, number];
    const [mb, nb] = b.slice(1, -5).split('.').map(Number) as [number, number];
    return ma - mb || na - nb;
  });
const calibracao = validar(calibracaoSchema, ler(`calibracao/${arquivosCalibracao[arquivosCalibracao.length - 1]}`), 'calibracao');
const textos = ler('textos/veredito.yaml') as Record<string, string>;
// Textos de interface em três arquivos: ui.yaml (geral), interface.yaml (telas) e entrada.yaml (página de entrada e tema).
const arquivosUi = ['textos/ui.yaml', 'textos/interface.yaml', 'textos/entrada.yaml'];
const textosUi: Record<string, string> = {};
for (const arquivo of arquivosUi)
  for (const [k, v] of Object.entries(ler(arquivo) as Record<string, string>)) {
    if (k in textosUi) falhar(`texto ${k} definido em mais de um arquivo de interface (${arquivo})`);
    textosUi[k] = v;
  }
const prompts = ler('ia/prompts.yaml') as PacoteConteudo['prompts'];
for (const k of ['versao', 'sistema', 'proximaPergunta', 'sugestoes', 'interpretacao', 'ideia', 'raciocinio', 'candidatas', 'teste']) if (!prompts[k]) falhar(`prompt ausente: ${k}`);
const evidencias = (ler('evidencias.yaml') as { evidencias: PacoteConteudo['evidencias'][string][] }).evidencias;
const regras = (ler('regras.yaml') as { regras: PacoteConteudo['regras'][string][] }).regras;
const saudeYaml = ler('saude.yaml') as { indicadores: PacoteConteudo['saude']; vocabularioProibido: PacoteConteudo['vocabularioProibido'] };
const casos: CasoAncora[] = readdirSync(join(dir, 'casos-ancora'))
  .filter((f) => f.endsWith('.yaml'))
  .flatMap((f) => ((ler(`casos-ancora/${f}`) as { casos: unknown[] }).casos ?? []).map((c, i) => validar(casoSchema, c, `${f}[${i}]`))) as CasoAncora[];

// ---------------------------------------------------------------- índices
const perguntas: Record<string, Pergunta> = {};
for (const p of perguntasLista) {
  if (perguntas[p.id]) falhar(`pergunta duplicada: ${p.id}`);
  perguntas[p.id] = p;
}
const evidenciasPorId = Object.fromEntries(evidencias.map((e) => [e.id, e]));
const regrasPorId = Object.fromEntries(regras.map((r) => [r.id, r]));
const tecnologiasPorId = Object.fromEntries(tecnologias.map((t) => [t.id, t]));
const movimentosPorId = Object.fromEntries(movimentos.map((m) => [m.id, m]));

// ---------------------------------------------------------------- integridade (FF-07)
function verificarCondicao(c: Condicao, onde: string) {
  if ('pergunta' in c) {
    const p = perguntas[c.pergunta];
    if (!p) return falhar(`${onde}: condição cita pergunta inexistente ${c.pergunta}`);
    const ids = 'em' in c ? c.em : 'naoEm' in c ? c.naoEm : [];
    if (!p.opcoesDinamicas) for (const id of ids) if (!p.opcoes.some((o) => o.id === id)) falhar(`${onde}: opção ${id} não existe em ${p.id}`);
  } else if ('todas' in c) c.todas.forEach((x) => verificarCondicao(x, onde));
  else if ('alguma' in c) c.alguma.forEach((x) => verificarCondicao(x, onde));
  else if ('nao' in c) verificarCondicao(c.nao, onde);
}

for (const p of perguntasLista) {
  const ids = new Set(p.opcoes.map((o) => o.id));
  if (!p.opcoesDinamicas) {
    if (p.opcoes.length < 2) falhar(`${p.id}: precisa de ao menos 2 opções`);
    if (p.padrao.length < 2 || p.padrao.length > 4) falhar(`${p.id}: padrão precisa ter de 2 a 4 opções (C-02)`);
  }
  for (const id of p.padrao) if (!ids.has(id)) falhar(`${p.id}: opção padrão ${id} inexistente`);
  if (p.condicao) verificarCondicao(p.condicao, p.id);
  for (const ponte of p.pontes ?? [])
    for (const o of ponte.opcoes) {
      for (const c of o.converte ?? []) if (!ids.has(c)) falhar(`${ponte.id}: converte para opção inexistente ${c}`);
      if (!o.converte && !o.faixaSinal) falhar(`${ponte.id}.${o.id}: precisa de converte ou faixaSinal`);
    }
  if (p.alimenta.length === 0) falhar(`${p.id}: toda pergunta precisa alimentar algo (FF-07)`);
}

function sinaisDe(e: Expr, out: string[] = []): string[] {
  if ('sinal' in e) out.push(e.sinal);
  else if ('media' in e) e.media.forEach((x) => sinaisDe(x.expr, out));
  else if ('soma' in e) e.soma.forEach((x) => sinaisDe(x, out));
  else if ('subtrai' in e) e.subtrai.forEach((x) => sinaisDe(x, out));
  else if ('min' in e) e.min.forEach((x) => sinaisDe(x, out));
  else if ('max' in e) e.max.forEach((x) => sinaisDe(x, out));
  else if ('limita' in e) sinaisDe(e.limita.valor, out);
  else if ('primeiro' in e) e.primeiro.forEach((x) => sinaisDe(x, out));
  return out;
}

for (const modelo of [modeloArq, modeloFer]) {
  for (const [id, s] of Object.entries(modelo.sinais)) {
    const p = perguntas[s.pergunta];
    if (!p) {
      falhar(`sinal ${id}: pergunta inexistente ${s.pergunta}`);
      continue;
    }
    if (s.mapa && !p.opcoesDinamicas) {
      for (const o of p.opcoes) if (!(o.id in s.mapa)) falhar(`sinal ${id}: mapa não cobre a opção ${o.id} de ${p.id}`);
      for (const k of Object.keys(s.mapa)) if (!p.opcoes.some((o) => o.id === k)) falhar(`sinal ${id}: opção ${k} inexistente em ${p.id}`);
    }
    if (s.mapaMultipla) for (const k of Object.keys(s.mapaMultipla.pesos)) if (!p.opcoes.some((o) => o.id === k)) falhar(`sinal ${id}: opção ${k} inexistente em ${p.id}`);
    for (const r of s.regras ?? []) if (!regrasPorId[r]) falhar(`sinal ${id}: regra ${r} inexistente`);
    for (const ev of s.evidencias ?? []) if (!evidenciasPorId[ev]) falhar(`sinal ${id}: evidência ${ev} inexistente`);
  }
  for (const eixo of modelo.eixos) {
    if (calibracao.pesos[eixo.id] === undefined) falhar(`${eixo.id}: sem peso na calibração`);
    if (!calibracao.tolerancias[eixo.id]) falhar(`${eixo.id}: sem tolerância na calibração`);
    for (const lado of [eixo.necessidade, eixo.capacidade]) {
      const usados = sinaisDe(lado.expr);
      for (const s of usados) if (!modelo.sinais[s]) falhar(`${eixo.id}: sinal ${s} inexistente`);
      if (new Set(usados).size !== usados.length) falhar(`${eixo.id}: um sinal aparece duas vezes na mesma expressão (DC-02)`);
      for (const g of lado.guardas ?? []) verificarCondicao(g.quando, `${eixo.id} guarda`);
    }
    for (const ev of eixo.evidencias) if (!evidenciasPorId[ev]) falhar(`${eixo.id}: evidência ${ev} inexistente`);
    for (const r of eixo.regras) if (!regrasPorId[r]) falhar(`${eixo.id}: regra ${r} inexistente`);
  }
  for (const r of modelo.requisitos ?? []) verificarCondicao(r.quando, `requisito ${r.requer}`);
}

for (const m of movimentos) {
  const modelo = m.modelo === 'arquitetura' ? modeloArq : modeloFer;
  for (const e of m.efeitos) if (!modelo.eixos.some((x) => x.id === e.eixo)) falhar(`${m.id}: eixo ${e.eixo} inexistente`);
  for (const id of [...(m.prerequisitos ?? []), ...(m.incompativel ?? [])]) if (!movimentosPorId[id]) falhar(`${m.id}: movimento ${id} inexistente`);
  for (const d of m.decisoes ?? []) if (!baseTec.decisoes[d]) falhar(`${m.id}: decisão ${d} inexistente`);
  for (const ev of m.evidencias) if (!evidenciasPorId[ev]) falhar(`${m.id}: evidência ${ev} inexistente`);
  for (const r of m.regras) if (!regrasPorId[r]) falhar(`${m.id}: regra ${r} inexistente`);
}

// FF-21: toda tecnologia tem fonte e data para licença; fim de suporte aponta para o snapshot.
for (const t of tecnologias) {
  if (!t.licenca.fonte || !t.licenca.consultadoEm) falhar(`${t.id}: licença sem fonte ou data (FF-21)`);
  if (t.eol && !eol.produtos[t.eol.produto]) falhar(`${t.id}: produto ${t.eol.produto} fora do snapshot de fim de suporte`);
  for (const c of t.categorias) if (!baseTec.categorias[c]) falhar(`${t.id}: categoria ${c} inexistente`);
}

for (const ind of saudeYaml.indicadores) {
  const p = perguntas[ind.pergunta];
  if (!p) falhar(`${ind.id}: pergunta ${ind.pergunta} inexistente`);
  else for (const o of p.opcoes) if (!ind.status[o.id]) falhar(`${ind.id}: status não cobre a opção ${o.id}`);
}

for (const caso of casos) {
  for (const [pid, r] of Object.entries(caso.respostas)) {
    const p = perguntas[pid];
    if (!p) {
      falhar(`${caso.id}: pergunta ${pid} inexistente`);
      continue;
    }
    if (!p.subniveis.includes(caso.subnivel)) falhar(`${caso.id}: ${pid} não se aplica a ${caso.subnivel}`);
    const valores = Array.isArray(r.valor) ? r.valor : [r.valor];
    if (!p.opcoesDinamicas) for (const v of valores) if (!p.opcoes.some((o) => o.id === v)) falhar(`${caso.id}: opção ${v} inexistente em ${pid}`);
  }
  for (const m of caso.ideia?.movimentos ?? []) if (!movimentosPorId[m.id] && !m.id.startsWith('fer.')) falhar(`${caso.id}: movimento ${m.id} inexistente`);
}

// ---------------------------------------------------------------- vocabulário (FF-06)
const textosParaLint: Array<[string, string]> = [
  ...Object.entries(textos).map(([k, v]) => [`texto ${k}`, v] as [string, string]),
  ...Object.entries(textosUi).map(([k, v]) => [`ui ${k}`, v] as [string, string]),
  ...perguntasLista.flatMap((p) => [
    [`${p.id} texto`, p.texto] as [string, string],
    [`${p.id} porQue`, p.porQue] as [string, string],
    ...p.opcoes.map((o) => [`${p.id}.${o.id}`, o.rotulo] as [string, string]),
  ]),
  ...movimentos.map((m) => [`${m.id}`, m.descricao] as [string, string]),
  ...Object.entries(prompts).map(([k, v]) => [`prompt ${k}`, v] as [string, string]),
];
for (const [onde, texto] of textosParaLint) for (const problema of lintVocabulario(texto, saudeYaml.vocabularioProibido)) falhar(`${onde}: ${problema}`);
for (const [k, v] of Object.entries({ ...textos, ...textosUi, ...prompts })) {
  let prof = 0;
  for (const ch of v) {
    if (ch === '{') prof++;
    if (ch === '}') prof--;
    if (prof < 0) break;
  }
  if (prof !== 0) falhar(`texto ${k}: chaves desbalanceadas`);
}

if (erros.length) {
  console.error(`Conteúdo inválido (${erros.length} problemas):\n- ${erros.join('\n- ')}`);
  process.exit(1);
}

// ---------------------------------------------------------------- pacote
const ordemPerguntas = perguntasLista.map((p) => p.id);
const pacoteSemHash: Omit<PacoteConteudo, 'hash'> = {
  versao: estrutura.versao,
  estrutura,
  perguntas,
  ordemPerguntas,
  modelos: { arquitetura: modeloArq, ferramenta: modeloFer },
  movimentos,
  tecnologias: tecnologiasPorId,
  decisoes: Object.fromEntries(Object.entries(baseTec.decisoes).map(([id, d]) => [id, { id, ...d }])),
  categoriasFerramenta: baseTec.categorias,
  eol,
  calibracao,
  textos: { ...textos, ...textosUi },
  evidencias: evidenciasPorId,
  regras: regrasPorId,
  saude: saudeYaml.indicadores,
  casosAncora: casos,
  vocabularioProibido: saudeYaml.vocabularioProibido,
  prompts,
};

function canonico(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonico).join(',')}]`;
  if (v && typeof v === 'object')
    return `{${Object.keys(v as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonico((v as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  return JSON.stringify(v);
}
const hash = `sha256:${createHash('sha256').update(canonico(pacoteSemHash)).digest('hex')}`;
const pacote: PacoteConteudo = { ...pacoteSemHash, hash };
mkdirSync(join(raiz, 'gerado'), { recursive: true });
writeFileSync(join(raiz, 'gerado/conteudo.json'), JSON.stringify(pacote));
console.log(
  `Conteúdo ${pacote.versao} compilado: ${ordemPerguntas.length} perguntas, ${movimentos.length} movimentos, ${tecnologias.length} tecnologias, ${casos.length} casos-âncora. ${hash.slice(0, 19)}…`,
);
