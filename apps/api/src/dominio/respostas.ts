// Gravação de respostas (Parte 4, 11.3): estado atual em `respostas` e histórico só por acréscimo
// em `eventos_resposta`, na mesma transação; concorrência otimista por versão (If-Match).
import type { PacoteConteudo, Pergunta } from '@stacksync/content/tipos';
import type { CorpoResposta } from '@stacksync/contracts';
import { opcoesDaPergunta, type RespostaEntrada } from '@stacksync/engine';
import type { Tx } from '../db/banco.ts';
import { Problema } from '../http/erros.ts';
import { respostaDe, type Analise, type RespostaGravada } from './analises.ts';

/** Valida a resposta contra o domínio da pergunta e as regras do nível (RF-08, RN-89). */
export function validarResposta(c: PacoteConteudo, a: Analise, p: Pergunta, corpo: CorpoResposta, entrada: Record<string, RespostaEntrada>): void {
  const invalida = (detalhe: string) => new Problema(422, 'resposta-invalida', 'Resposta inválida', detalhe);
  const ids = opcoesDaPergunta(c, p, entrada).map((o) => o.id);
  const valores = corpo.valor === null ? [] : Array.isArray(corpo.valor) ? corpo.valor : [corpo.valor];

  if (corpo.origem === 'nao_se_aplica') throw invalida('"Não se aplica" é decidido pela estrutura, não pela resposta.');
  if (corpo.origem === 'medida') {
    if (a.profundidade === 'rapido') throw invalida('No nível Rápido, toda resposta conta como estimativa.');
    if (!p.permiteMedida) throw invalida('Esta pergunta não aceita dado medido.');
    if (!corpo.fonte || !corpo.medidaEm) throw invalida('Dado medido pede a fonte e o mês da medida.');
  }
  if (corpo.origem === 'desconhecida') {
    if (valores.length || corpo.faixaOpcoes?.length || corpo.faixaSinal) throw invalida('Resposta desconhecida não leva valor.');
    return;
  }
  if (Array.isArray(corpo.valor) !== (p.tipo === 'multipla') && corpo.valor !== null)
    throw invalida(p.tipo === 'multipla' ? 'Esta pergunta aceita uma lista de opções.' : 'Esta pergunta aceita uma opção.');
  for (const v of [...valores, ...(corpo.faixaOpcoes ?? [])]) if (!ids.includes(v)) throw invalida(`Opção ${v} fora do domínio da pergunta.`);
  if (new Set(valores).size !== valores.length) throw invalida('Opção repetida.');
  if (p.tipo === 'multipla' && p.maxSelecoes && valores.length > p.maxSelecoes) throw invalida(`Escolha até ${p.maxSelecoes} opções.`);
  if (corpo.faixaOpcoes?.length && p.tipo === 'opcao') {
    const idx = corpo.faixaOpcoes.map((o) => ids.indexOf(o)).sort((x, y) => x - y);
    if (idx.some((v, i) => i > 0 && v !== idx[i - 1]! + 1)) throw invalida('A faixa precisa ser de opções vizinhas.');
  }
  if (corpo.faixaSinal) {
    const sinais = new Set((p.pontes ?? []).flatMap((b) => b.opcoes.map((o) => o.faixaSinal?.sinal)).filter(Boolean));
    if (!sinais.has(corpo.faixaSinal.sinal)) throw invalida('Faixa de sinal fora das perguntas-ponte desta pergunta.');
    const [lo, hi] = corpo.faixaSinal.faixa;
    if (!(lo >= 0 && hi <= 4 && lo <= hi)) throw invalida('Faixa de sinal fora da escala.');
  }
  const temValor = corpo.valor !== null && (!Array.isArray(corpo.valor) || p.tipo === 'multipla');
  if (!temValor && !corpo.faixaOpcoes?.length && !corpo.faixaSinal) throw invalida('Escolha uma opção, uma faixa ou "Não sei".');
}

const json = (v: unknown) => (v === null || v === undefined ? null : JSON.stringify(v));

export interface ResultadoGravacao {
  resposta: RespostaGravada;
  aposVeredito: boolean;
}

/** Grava a resposta e o evento. `versaoEsperada` vem do If-Match (0 = ainda não existia). */
export async function gravarResposta(
  tx: Tx,
  orgId: string,
  a: Analise,
  pergunta: string,
  corpo: CorpoResposta,
  versaoEsperada: number | null,
): Promise<ResultadoGravacao> {
  const atual = await tx.um('SELECT * FROM respostas WHERE analise_id = $1 AND pergunta = $2 FOR UPDATE', [a.id, pergunta]);
  const anterior = atual ? respostaDe(atual) : null;
  if (versaoEsperada !== null && (anterior?.versao ?? 0) !== versaoEsperada)
    throw new Problema(412, 'conflito-de-versao', 'A resposta mudou em outra aba', 'Escolha qual versão manter.', { atual: anterior });

  const origem = a.profundidade === 'rapido' && corpo.origem === 'medida' ? 'estimativa' : corpo.origem;
  const params = [
    a.id,
    orgId,
    pergunta,
    json(corpo.valor),
    origem,
    json(corpo.faixaOpcoes?.length ? corpo.faixaOpcoes : null),
    json(corpo.faixaSinal ?? null),
    corpo.origem === 'medida' ? (corpo.fonte ?? null) : null,
    corpo.origem === 'medida' ? (corpo.medidaEm ?? null) : null,
    corpo.textoLivre ?? null,
    corpo.meio,
  ];
  const linha = await tx.um(
    `INSERT INTO respostas (analise_id, org_id, pergunta, valor, origem, faixa_opcoes, faixa_sinal, fonte, medida_em, texto_livre, meio)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11)
     ON CONFLICT (analise_id, pergunta) DO UPDATE SET
       valor = EXCLUDED.valor, origem = EXCLUDED.origem, faixa_opcoes = EXCLUDED.faixa_opcoes, faixa_sinal = EXCLUDED.faixa_sinal,
       fonte = EXCLUDED.fonte, medida_em = EXCLUDED.medida_em, texto_livre = EXCLUDED.texto_livre, meio = EXCLUDED.meio,
       versao = respostas.versao + 1, atualizada_em = now()
     RETURNING *`,
    params,
  );
  const resposta = respostaDe(linha!);
  const aposVeredito = !!a.primeiroVereditoEm;
  const resumo = (r: RespostaGravada | null) =>
    r ? { valor: r.valor, origem: r.origem, faixaOpcoes: r.faixaOpcoes, faixaSinal: r.faixaSinal, fonte: r.fonte, medidaEm: r.medidaEm, meio: r.meio } : null;
  await tx.q(
    'INSERT INTO eventos_resposta (org_id, analise_id, pergunta, antes, depois, apos_veredito) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)',
    [orgId, a.id, pergunta, json(resumo(anterior)), json(resumo(resposta)), aposVeredito],
  );
  await tx.q('UPDATE analises SET atualizada_em = now() WHERE id = $1', [a.id]);
  // Métrica de ancoragem: o que foi escolhido diante das sugestões (Parte 4, 11.2).
  const sug = await tx.um<{ opcoes: string[] }>('SELECT opcoes FROM sugestoes_resposta WHERE analise_id = $1 AND pergunta = $2', [a.id, pergunta]);
  if (sug) {
    const valores = corpo.valor === null ? [] : Array.isArray(corpo.valor) ? corpo.valor : [corpo.valor];
    const escolha = corpo.meio === 'sugestao' && valores.length && valores.every((v) => sug.opcoes.includes(v)) ? 'sugestao' : corpo.meio === 'sugestao' ? 'lista' : corpo.meio;
    await tx.q('UPDATE sugestoes_resposta SET escolha = $3 WHERE analise_id = $1 AND pergunta = $2', [a.id, pergunta, escolha]);
  }
  return { resposta, aposVeredito };
}
