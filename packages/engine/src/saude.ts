// Indicadores de saúde (P3 5.6) e obrigações datadas (P3 5.7). Fatos, separados do ajuste (RN-85).
import type { PacoteConteudo } from '@stacksync/content/tipos';
import type { Contexto } from './nucleo.ts';
import { t } from './plano.ts';
import { dataPt, type CicloInfo } from './tecnologias.ts';
import type { IndicadorSaudeDoc, Obrigacao } from './tipos.ts';

export function saude(ctx: Contexto): IndicadorSaudeDoc[] {
  const conteudo = ctx.conteudo;
  return conteudo.saude
    .filter((ind) => conteudo.perguntas[ind.pergunta]?.subniveis.includes(ctx.subnivel))
    .map((ind) => {
      const r = ctx.respostas[ind.pergunta];
      const opcao = r && ctx.aplicaveis.has(ind.pergunta) && r.origem !== 'desconhecida' && r.origem !== 'nao_se_aplica' ? r.opcoes[0] : undefined;
      if (!opcao || !ind.status[opcao]) {
        return { id: ind.id, nome: ind.nome, status: 'desconhecido' as const, criterio: 'Sem resposta: não conta como saudável.', evidencias: ind.evidencias };
      }
      const marca = r!.origem === 'estimativa' ? ' (estimado)' : r!.origem === 'inferencia' ? ' (inferido)' : '';
      return { id: ind.id, nome: ind.nome, status: ind.status[opcao]!, criterio: `${ind.criterio[opcao] ?? ''}${marca}`, evidencias: ind.evidencias };
    });
}

export function obrigacoes(ctx: Contexto, ciclo: CicloInfo | null, produto: string | null): Obrigacao[] {
  const conteudo: PacoteConteudo = ctx.conteudo;
  const out: Obrigacao[] = [];
  const f12 = ctx.respostas['F-12'];
  if (f12 && ctx.aplicaveis.has('F-12') && f12.opcoes[0]) {
    const o = f12.opcoes[0];
    if (o === 'ja_perdeu') out.push({ id: 'eol-declarado', texto: 'O runtime, o framework principal ou o banco já perderam suporte', data: null, status: 'vencida', fonte: null });
    if (o === 'menos_6m') out.push({ id: 'eol-declarado', texto: 'O runtime, o framework principal ou o banco perdem suporte em menos de 6 meses', data: null, status: 'proxima', fonte: null });
    if (o === '6_18m') out.push({ id: 'eol-declarado', texto: 'O runtime, o framework principal ou o banco perdem suporte entre 6 e 18 meses', data: null, status: 'futura', fonte: null });
  }
  if (ciclo && produto && ciclo.meses !== null && ciclo.meses < 18) {
    out.push({
      id: 'eol-ferramenta',
      texto: `${t(conteudo, 'obrigacao.eol', { produto, ciclo: ciclo.ciclo ?? '' })}${ciclo.data ? ` em ${dataPt(ciclo.data)}` : ''}`,
      data: ciclo.data,
      status: ciclo.meses < 0 ? 'vencida' : ciclo.meses < 6 ? 'proxima' : 'futura',
      fonte: ciclo.fonte,
    });
  }
  const b08 = ctx.respostas['B-08'];
  if (b08 && ctx.aplicaveis.has('B-08')) {
    if (b08.opcoes.includes('ue')) {
      const cra = conteudo.evidencias['cra-2024']?.url ?? null;
      out.push({
        id: 'cra-notificacao',
        texto: `${t(conteudo, 'obrigacao.cra.notificacao')}, se o produto for vendido na União Europeia com elementos digitais`,
        data: '2026-09-11',
        status: ctx.asOf >= '2026-09-11' ? 'em_vigor' : 'futura',
        fonte: cra,
      });
      out.push({
        id: 'cra-sbom',
        texto: `${t(conteudo, 'obrigacao.cra.sbom')}, se o produto for vendido na União Europeia com elementos digitais`,
        data: '2027-12-11',
        status: ctx.asOf >= '2027-12-11' ? 'em_vigor' : 'futura',
        fonte: cra,
      });
    }
    if (b08.opcoes.includes('transferencia')) out.push({ id: 'lgpd', texto: t(conteudo, 'obrigacao.lgpd'), data: null, status: 'sem_data', fonte: null });
  }
  return out;
}
