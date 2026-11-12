// Conversão determinística das perguntas-ponte em faixa (RN-80; P3 8.3 e 8.5; T-06).
// Um nível de perguntas-ponte só. A conversão é curada no conteúdo e igual em toda análise;
// a IA não participa dela (Parte 4, 10.1).
import type { Faixa, PacoteConteudo, Pergunta } from '@stacksync/content/tipos';
import { formatar, lista } from './mensagens.ts';

export interface ConversaoPontes {
  /** Opções da pergunta original compatíveis com as respostas, na ordem do catálogo. */
  faixaOpcoes: string[] | null;
  /** Faixa direta do sinal (perguntas de múltipla escolha). */
  faixaSinal: { sinal: string; faixa: Faixa } | null;
  /** As respostas às perguntas-ponte apontam para lados diferentes; a faixa ficou mais larga. */
  contraditorias: boolean;
  explicacoes: string[];
  texto: string;
}

/**
 * Converte as respostas às perguntas-ponte (id da ponte → id da opção) numa faixa.
 * Várias pontes estreitam a faixa pela interseção; se ela ficar vazia, vale a união.
 */
export function converterPontes(
  conteudo: PacoteConteudo,
  pergunta: Pergunta,
  respostas: Record<string, string>,
): ConversaoPontes | null {
  const conjuntos: Set<string>[] = [];
  const sinais: Array<{ sinal: string; faixa: Faixa }> = [];
  const explicacoes: string[] = [];
  const rotulos: string[] = [];
  for (const ponte of pergunta.pontes ?? []) {
    const escolhida = respostas[ponte.id];
    if (escolhida === undefined) continue;
    const opcao = ponte.opcoes.find((o) => o.id === escolhida);
    if (!opcao) continue;
    rotulos.push(opcao.rotulo);
    explicacoes.push(opcao.explicacao);
    if (opcao.converte) conjuntos.push(new Set(opcao.converte));
    if (opcao.faixaSinal) sinais.push(opcao.faixaSinal);
  }
  if (!rotulos.length) return null;

  let contraditorias = false;
  let faixaOpcoes: string[] | null = null;
  if (conjuntos.length) {
    const ordem = pergunta.opcoes.map((o) => o.id);
    let inter = ordem.filter((id) => conjuntos.every((c) => c.has(id)));
    if (!inter.length) {
      contraditorias = true;
      inter = ordem.filter((id) => conjuntos.some((c) => c.has(id)));
    }
    faixaOpcoes = inter;
  }

  let faixaSinal: ConversaoPontes['faixaSinal'] = null;
  if (sinais.length) {
    const sinal = sinais[0]!.sinal;
    const doSinal = sinais.filter((s) => s.sinal === sinal);
    let lo = Math.max(...doSinal.map((s) => s.faixa[0]));
    let hi = Math.min(...doSinal.map((s) => s.faixa[1]));
    if (lo > hi) {
      contraditorias = true;
      lo = Math.min(...doSinal.map((s) => s.faixa[0]));
      hi = Math.max(...doSinal.map((s) => s.faixa[1]));
    }
    faixaSinal = { sinal, faixa: [lo, hi] };
  }

  const resposta = lista(rotulos.map((r) => `“${r}”`));
  const t = (chave: string, valores: Record<string, string>) => formatar(conteudo.textos[chave] ?? '', valores);
  let texto: string;
  if (faixaOpcoes && faixaOpcoes.length) {
    const rot = (id: string) => pergunta.opcoes.find((o) => o.id === id)?.rotulo ?? id;
    texto =
      faixaOpcoes.length === 1
        ? t('ui.naoSei.conversaoUma', { resposta, opcao: rot(faixaOpcoes[0]!) })
        : t('ui.naoSei.conversaoFaixa', { resposta, de: rot(faixaOpcoes[0]!), ate: rot(faixaOpcoes[faixaOpcoes.length - 1]!) });
  } else texto = t('ui.naoSei.conversaoSinal', { resposta, explicacao: explicacoes.join(' ') });
  if (contraditorias) texto = `${texto} ${conteudo.textos['ui.naoSei.contraditorias'] ?? ''}`.trim();
  return { faixaOpcoes, faixaSinal, contraditorias, explicacoes, texto };
}
