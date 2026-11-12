// Peças do cabeçalho preto (DESIGN.md: Casca do aplicativo; DV-50). O cabeçalho é uma grade de três colunas: a
// análise atual à esquerda, a assinatura no centro e as ações à direita. Os botões são blocos de papel branco com a
// projeção zebrada em branco, embaixo e à direita; ao apertar, o botão desce para dentro da projeção.
import type { ReactNode } from 'react';

/** Classes do botão do cabeçalho (gatilho do menu, imprimir). */
export const BOTAO_CABECALHO =
  'relative inline-flex h-botao items-center gap-compacto bg-folha px-curto text-acao text-nanquim aperta-projecao hover:bg-sinal hover:text-sobre-sinal aria-expanded:bg-sinal aria-expanded:text-sobre-sinal';

/** Envolve um botão do cabeçalho com a projeção zebrada branca. */
export function ProjecaoClara({ children }: { children: ReactNode }) {
  return (
    // A margem de 4px embaixo e à direita conta a projeção no alinhamento: o conjunto fica centrado na faixa.
    <span className="relative mr-micro mb-micro inline-flex shrink-0">
      <span aria-hidden className="absolute inset-0 translate-x-micro translate-y-micro border-2 border-folha zebrado-claro" />
      {children}
    </span>
  );
}
