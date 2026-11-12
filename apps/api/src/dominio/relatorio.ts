// Relatório para liderança em Markdown (T-18; RF-44). Página principal e apêndice; nunca omite
// incerteza nem alterações feitas depois do veredito. O raciocínio da IA vem num capítulo próprio,
// rotulado com provedor, modelo e versão do prompt, depois do veredito oficial (RF-53).
import type { PacoteConteudo } from '@stacksync/content/tipos';
import { numeroPt, type DocumentoVeredito, type FaixaIndice } from '@stacksync/engine';
import type { Raciocinio } from '../servicos/raciocinio.ts';
import type { Analise } from './analises.ts';

const faixa = (f: FaixaIndice) => (f.lo === f.hi ? `${f.lo}` : `entre ${f.lo} e ${f.hi}`);
const comSinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const faixaDelta = (f: FaixaIndice) => (f.lo === f.hi ? comSinal(f.lo) : `entre ${comSinal(f.lo)} e ${comSinal(f.hi)}`);
const dataPt = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
};

export function relatorioMarkdown(c: PacoteConteudo, a: Analise, doc: DocumentoVeredito, criadoEm: string, r: Raciocinio | null): string {
  const t = (k: string) => c.textos[k] ?? k;
  const sub = c.estrutura.subniveis[doc.subnivel];
  const prof = c.estrutura.profundidades[doc.profundidade];
  const L: string[] = [];
  const secao = (titulo: string) => L.push('', `## ${titulo}`, '');

  L.push(`# ${a.nome}`, '');
  L.push(`${t(`ui.enquadramento.${sub.ramo}`)} · ${sub.rotulo} · nível ${prof.rotulo} · veredito de ${dataPt(criadoEm)}`);

  secao('Veredito');
  L.push(`**${t(`categoria.${doc.ajuste.categoria}`)}.** ${doc.textos.frase}`);
  if (doc.textos.fechamento) L.push('', doc.textos.fechamento);
  for (const x of doc.textos.complemento) L.push('', x);
  L.push('', `Índice de Ajuste ${faixa(doc.ajuste.indice)}, de 0 a 100. ${doc.textos.confianca}`);
  L.push('', doc.textos.composicao);
  if (doc.robustez) L.push('', doc.robustez.texto);

  if (doc.razoes.length) {
    secao(t('ui.resultado.motivos'));
    doc.razoes.forEach((x, i) => L.push(`${i + 1}. ${x.texto}${x.evidencias.length ? ` (${x.evidencias.map((e) => fonte(c, e)).join('; ')})` : ''}`));
  }

  if (doc.ideia) {
    const i = doc.ideia;
    secao(t('ui.resultado.ideia'));
    L.push(`> ${i.texto}`, '');
    L.push(`Lida como: ${i.movimentos.map((m) => m.nome).join('; ')}.`, '');
    L.push(`**${i.frases.join(' ')}** Índice de Ajuste da ideia ${faixa(i.indice)}.`);
    L.push('', `Comparada a ${i.baseRotulo}: ${faixaDelta(i.contraBase)} pontos.`);
    L.push('', i.fraseVeredito);
    if (i.portoes.length) {
      L.push('', '| Portão | Resultado | Motivo |', '| --- | --- | --- |');
      for (const g of i.portoes) L.push(`| ${g.nome} | ${t(`portao.estado.${g.estado}`)} | ${g.motivo} |`);
    }
  }

  secao(t('ui.resultado.plano'));
  L.push(doc.plano.frase);
  if (doc.plano.indice) L.push('', `Índice de Ajuste projetado ${faixa(doc.plano.indice)}${doc.plano.contraBase ? `; contra ${sub.naoMudar}, ${faixaDelta(doc.plano.contraBase)} pontos` : ''}.`);
  if (doc.plano.direcoes.length) {
    L.push('', '**Direções**', '');
    for (const d of doc.plano.direcoes) L.push(`- ${d.texto}`);
  }
  if (doc.plano.forma.length) {
    L.push('', '**Forma da arquitetura**', '');
    for (const f of doc.plano.forma) L.push(`- ${f}`);
  }
  for (const d of doc.plano.tecnologias) {
    L.push('', `**${d.nome}.** ${d.motivo}`, '');
    L.push('| Tecnologia | Índice de Ajuste | Licença | Fim de suporte |', '| --- | --- | --- | --- |');
    for (const l of d.linhas)
      L.push(`| ${l.nome}${l.escolhida ? ' (escolhida)' : ''}${l.atual ? ' (atual)' : ''} | ${faixa(l.indice)} | ${l.licenca.nome} | ${l.fimSuporte.texto} |`);
  }
  if (doc.plano.passos.length) {
    L.push('', '**Passos**', '');
    for (const p of doc.plano.passos) L.push(`${p.ordem}. ${p.titulo}. ${p.tecnica} Ponto de volta: ${p.pontoDeVolta}${p.seRespostaErrada ? ` ${p.seRespostaErrada}` : ''}`);
  }
  if (doc.plano.custoTransicao) L.push('', `Custo de transição ${doc.plano.custoTransicao.nivel === 'medio' ? 'médio' : doc.plano.custoTransicao.nivel}: ${doc.plano.custoTransicao.motivos.join('; ')}.`);
  if (doc.plano.deixariaDeBastar.length) {
    L.push('', '**Deixaria de bastar se**', '');
    for (const x of doc.plano.deixariaDeBastar) L.push(`- ${x}`);
  }

  if (doc.oQueMudaria.length) {
    secao(t('ui.resultado.oQueMudaria'));
    for (const x of doc.oQueMudaria) L.push(`- ${x}`);
  }
  if (doc.perguntasDeMaiorValor.length) {
    secao(t('ui.resultado.decidiriam'));
    for (const p of doc.perguntasDeMaiorValor) L.push(`- ${p.texto} ${p.efeito}${p.comoDescobrir ? ` ${t('ui.naoSei.comoDescobrir')}: ${p.comoDescobrir}` : ''}`);
  }
  const obrig = doc.obrigacoes.filter((o) => o.status !== 'futura');
  if (obrig.length) {
    secao('Obrigações datadas');
    for (const o of obrig) L.push(`- ${o.texto}${o.fonte ? ` (fonte: ${o.fonte})` : ''}`);
  }
  if (doc.alteracoesAposVeredito.length) {
    secao('Alterações depois do veredito');
    for (const x of doc.alteracoesAposVeredito) L.push(`- ${x}`);
  }
  if (doc.inferencias.length) {
    secao('Respostas inferidas');
    for (const x of doc.inferencias) L.push(`- ${x.texto}`);
  }

  if (r && r.status === 'pronto') {
    secao(`${t('ui.relatorio.capituloIa')} (${r.provedor ?? 'provedor'}, ${r.modelo ?? 'modelo'}, prompts ${r.versaoPrompt ?? '?'})`);
    L.push('Segunda opinião da IA conectada pelo usuário. Ela não decide o resultado; na divergência, vale o motor.');
    for (const b of r.blocos) {
      L.push('', `### ${b.rotulo}`, '', b.resumo, '', `Contra-argumento: ${b.contraArgumento}`, '', `O que mudaria: ${b.oQueMudaria}`);
      L.push('', `Avaliação da IA: ${b.avaliacao === 'concorda' ? 'concorda com o motor' : b.avaliacao === 'mais_favoravel_a_mudar' ? 'mais favorável a mudar que o motor (vale o motor)' : 'menos favorável a mudar que o motor (risco a registrar)'}. ${b.justificativa}`);
      L.push('', `Cita: ${b.evidencias.join(', ')}`);
    }
    if (r.sintese) L.push('', `**Síntese.** ${r.sintese}`);
    if (r.candidatas.length) {
      L.push('', `**${t('ui.resultado.candidatas')}.** ${t('ui.resultado.candidatas.explica')}`, '');
      for (const k of r.candidatas) L.push(`- ${k.nome}: ${k.motivo}`);
    }
    if (r.descartados.length) {
      L.push('', '**Itens descartados pela verificação**', '');
      for (const d of r.descartados) L.push(`- ${d.alvo}: ${d.motivo}`);
    }
  }

  secao(t('ui.relatorio.apendice'));
  L.push('**Mapa de ajuste por eixo** (necessidade e capacidade de 0 a 4; tolerância por eixo)', '');
  L.push('| Eixo | Necessidade | Capacidade | Situação |', '| --- | --- | --- | --- |');
  const n = (x: { lo: number; hi: number } | null) => (x ? (x.lo === x.hi ? numeroPt(x.lo, 2) : `${numeroPt(x.lo, 2)} a ${numeroPt(x.hi, 2)}`) : 'sem sinal');
  for (const e of doc.eixos.filter((x) => x.avaliado))
    L.push(`| ${e.nome} | ${n(e.N)} | ${n(e.C)} | ${e.lado === 'dentro' ? 'dentro da tolerância' : e.lado === 'sobra' ? 'sobra' : 'falta'}${e.cruzaTolerancia ? ' (a faixa cruza a tolerância)' : ''}${e.saturado ? ', saturado' : ''} |`);
  if (doc.saude.length) {
    L.push('', '**Saúde**', '');
    for (const h of doc.saude) L.push(`- ${h.nome}: ${h.status === 'saudavel' ? 'saudável' : h.status === 'atencao' ? 'atenção' : h.status === 'critico' ? 'crítico' : 'desconhecido'}. ${h.criterio}`);
  }
  if (doc.quantitativo) L.push('', doc.quantitativo);
  if (doc.consideradoEDescartado.length) {
    L.push('', `**${t('ui.resultado.descartado')}**`, '');
    for (const x of doc.consideradoEDescartado) L.push(`- ${x}`);
  }
  L.push('', '---', '', t('ui.relatorio.responsabilidade'));
  L.push('', `Versões: motor ${doc.versoes.motor}, catálogo ${doc.versoes.catalogo}, calibração ${doc.versoes.calibracao}, base de tecnologias ${doc.versoes.baseTecnologias}. Data de referência ${dataPt(doc.asOf)}. Hash das entradas ${doc.hashEntradas.slice(0, 19)}…`);
  return `${L.join('\n')}\n`;
}

function fonte(c: PacoteConteudo, id: string): string {
  const ev = c.evidencias[id];
  if (ev) return `${ev.autores}, ${ev.ano}`;
  return c.regras[id] ? id : id;
}
