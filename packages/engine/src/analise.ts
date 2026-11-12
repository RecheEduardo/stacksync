// Robustez (DC-10), valor da informação (DC-11) e "o que mudaria este veredito" (DC-12).
import type { PacoteConteudo } from '@stacksync/content/tipos';
import { calcularAjuste, type EixoAvaliado, type Parametros, type ResultadoAjuste } from './ajuste.ts';
import { numeroPt } from './mensagens.ts';
import { t } from './plano.ts';
import type { Categoria, Pergunta as PerguntaDoc } from './tipos.ts';

const nomeCategoria = (conteudo: PacoteConteudo, c: Categoria) => t(conteudo, `categoria.${c}`);

export interface Variacao {
  descricao: string;
  categoria: Categoria;
}

export function robustez(
  conteudo: PacoteConteudo,
  eixos: EixoAvaliado[],
  base: ResultadoAjuste,
  p: Parametros,
  respostasIncertas: Array<{ pergunta: string; rotulo: string }>,
  recalcularExtremo: (pergunta: string, lado: 'lo' | 'hi') => EixoAvaliado[] | null,
): { percentual: number; classe: 'robusto' | 'moderado' | 'fragil'; texto: string; maisSensivel: string | null } | null {
  const cal = conteudo.calibracao;
  const avaliados = eixos.filter((e) => e.avaliado).sort((a, b) => b.peso - a.peso);
  if (!avaliados.length || base.categoria === 'inconclusivo') return null;
  const variacoes: Variacao[] = [];
  const cat = (ps: Parametros, es: EixoAvaliado[] = eixos) => calcularAjuste(es, ps, cal.minimoSinal, cal.confianca).categoria;
  const dv = cal.robustez.variacaoTolerancia;
  for (const e of avaliados)
    for (const lado of ['sobra', 'falta'] as const) {
      const tol = p.tolerancias[e.id]![lado];
      if (tol >= 4) continue;
      for (const s of [-1, 1]) {
        const novo = Math.max(0, tol + s * dv);
        const ps: Parametros = { ...p, tolerancias: { ...p.tolerancias, [e.id]: { ...p.tolerancias[e.id]!, [lado]: novo } } };
        variacoes.push({
          descricao: `a tolerância de ${lado} em ${e.nome} for ${numeroPt(novo, 2)} nível`,
          categoria: cat(ps),
        });
      }
    }
  for (const e of avaliados)
    for (const s of [-1, 1]) {
      const w = p.pesos[e.id]! + s * cal.robustez.variacaoPeso;
      if (w < 1 || w > 5) continue;
      variacoes.push({ descricao: `o peso de ${e.nome} for ${w}`, categoria: cat({ ...p, pesos: { ...p.pesos, [e.id]: w } }) });
    }
  for (const s of [-1, 1]) {
    const l = p.limiar + s * cal.robustez.variacaoLimiar;
    variacoes.push({ descricao: `o limiar de categoria for ${l}`, categoria: cat({ ...p, limiar: l }) });
  }
  for (const r of respostasIncertas)
    for (const lado of ['lo', 'hi'] as const) {
      const es = recalcularExtremo(r.pergunta, lado);
      if (!es) continue;
      variacoes.push({
        descricao: `a resposta “${r.rotulo}” estiver no extremo ${lado === 'lo' ? 'inferior' : 'superior'} da faixa`,
        categoria: cat(p, es),
      });
    }
  if (!variacoes.length) return null;
  const iguais = variacoes.filter((v) => v.categoria === base.categoria).length;
  const percentual = iguais / variacoes.length;
  const classe = percentual >= 0.9 ? 'robusto' : percentual >= 0.7 ? 'moderado' : 'fragil';
  const sensivel = variacoes.find((v) => v.categoria !== base.categoria) ?? null;
  const sensivelTexto = sensivel ? `${sensivel.descricao} (passa a ${nomeCategoria(conteudo, sensivel.categoria)})` : null;
  const pct = Math.round(percentual * 100);
  return {
    percentual,
    classe,
    texto: t(conteudo, `robustez.${classe}`, { pct, sensivel: sensivelTexto ?? '' }),
    maisSensivel: sensivelTexto,
  };
}

export interface CandidatoInformacao {
  pergunta: string;
  texto: string;
  opcoes: string[];
  respondida: boolean;
  comoDescobrir: string | null;
  quemPodeSaber: string | null;
}

export function valorInformacao(
  conteudo: PacoteConteudo,
  base: ResultadoAjuste,
  candidatos: CandidatoInformacao[],
  simular: (pergunta: string, opcao: string) => ResultadoAjuste | null,
): { maiorValor: PerguntaDoc[]; podePular: PerguntaDoc[] } {
  const cal = conteudo.calibracao;
  const larguraBase = base.bruto.indice.hi - base.bruto.indice.lo;
  const conjunto = (r: ResultadoAjuste) => r.categoriasPossiveis.join('|');
  const baseSet = conjunto(base);
  const avaliados: Array<PerguntaDoc & { fracao: number; muda: boolean }> = [];
  for (const c of candidatos) {
    const res = c.opcoes.map((o) => simular(c.pergunta, o)).filter((x): x is ResultadoAjuste => !!x);
    if (!res.length) continue;
    const reducao = res.reduce((s, r) => s + (larguraBase - (r.bruto.indice.hi - r.bruto.indice.lo)), 0) / res.length;
    const definem = base.categoriasPossiveis.length > 1 ? res.filter((r) => r.categoriasPossiveis.length === 1).length / res.length : 0;
    const muda = res.some((r) => conjunto(r) !== baseSet);
    const reducaoInt = Math.max(0, Math.round(reducao));
    avaliados.push({
      pergunta: c.pergunta,
      texto: c.texto,
      efeito: definem > 0 ? `${t(conteudo, 'lacuna.definiria')} ${t(conteudo, 'lacuna.estreitaria', { reducao: reducaoInt })}` : t(conteudo, 'lacuna.estreitaria', { reducao: reducaoInt }),
      defineCategoria: definem > 0,
      reducao: reducaoInt,
      comoDescobrir: c.comoDescobrir,
      quemPodeSaber: c.quemPodeSaber,
      respondida: c.respondida,
      fracao: definem,
      muda,
    });
  }
  const ordenados = [...avaliados].sort((a, b) => b.fracao - a.fracao || b.reducao - a.reducao || (a.pergunta < b.pergunta ? -1 : 1));
  const maiorValor = ordenados
    .filter((x) => x.fracao > 0 || x.reducao >= cal.limiarPodePular)
    .slice(0, 3)
    .map(({ fracao: _f, muda: _m, ...x }) => x);
  const podePular = avaliados
    .filter((x) => x.respondida && !x.muda && x.reducao < cal.limiarPodePular)
    .map(({ fracao: _f, muda: _m, ...x }) => ({ ...x, efeito: t(conteudo, 'lacuna.podePular') }));
  return { maiorValor, podePular };
}

export function oQueMudaria(
  conteudo: PacoteConteudo,
  base: ResultadoAjuste,
  candidatos: Array<{ pergunta: string; rotulo: string; atual: string; opcoes: Array<{ id: string; rotulo: string }> }>,
  simular: (pergunta: string, opcao: string) => ResultadoAjuste | null,
): Array<{ texto: string; pergunta: string; opcao: string; rotuloPergunta: string; rotuloOpcao: string; categoria: Categoria }> {
  const out: Array<{ texto: string; pergunta: string; opcao: string; rotuloPergunta: string; rotuloOpcao: string; categoria: Categoria }> = [];
  for (const c of candidatos) {
    if (out.length >= 3) break;
    const idx = c.opcoes.findIndex((o) => o.id === c.atual);
    const ordem = c.opcoes
      .map((o, i) => ({ o, dist: Math.abs(i - idx) }))
      .filter((x) => x.o.id !== c.atual)
      .sort((a, b) => a.dist - b.dist);
    for (const { o } of ordem) {
      const r = simular(c.pergunta, o.id);
      if (!r || r.categoria === base.categoria || r.categoria === 'indefinido' || r.categoria === 'inconclusivo') continue;
      out.push({
        texto: t(conteudo, 'mudaria.texto', { pergunta: c.rotulo, valor: o.rotulo, categoria: nomeCategoria(conteudo, r.categoria).toLowerCase() }),
        pergunta: c.pergunta,
        opcao: o.id,
        rotuloPergunta: c.rotulo,
        rotuloOpcao: o.rotulo,
        categoria: r.categoria,
      });
      break;
    }
  }
  return out;
}
