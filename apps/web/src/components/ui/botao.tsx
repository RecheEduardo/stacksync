// Botões (DESIGN.md v2.0, Buttons): raio zero, 48px, contorno de 3px em tinta, rótulo em caixa-alta.
// Primário em amarelo de sinalização (o amarelo é escolha), no máximo um por região, e nunca a ação de mudar
// a arquitetura. Primário e secundário têm a sombra que aperta; o discreto é um link sublinhado, sem sombra.
import { Slot } from 'radix-ui';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

export type VarianteBotao = 'primario' | 'secundario' | 'discreto' | 'destrutivo' | 'sobreMarca';

const base =
  'inline-flex items-center justify-center gap-compacto h-botao rounded-controle text-acao whitespace-nowrap select-none disabled:cursor-not-allowed';

const variantes: Record<VarianteBotao, string> = {
  primario: 'borda aperta bg-sinal text-sobre-sinal px-medio disabled:border-inativo disabled:bg-folha disabled:text-inativo',
  secundario: 'borda aperta bg-folha text-nanquim px-medio hover:bg-campo disabled:border-inativo disabled:text-inativo',
  discreto:
    'pressionavel px-curto text-nanquim underline decoration-2 underline-offset-4 hover:bg-realce disabled:text-inativo disabled:no-underline disabled:hover:bg-transparent',
  destrutivo: 'borda aperta bg-critico text-folha px-medio disabled:border-inativo disabled:bg-folha disabled:text-inativo',
  // Ação sobre um bloco de cor da marca ou do sinal: papel com contorno, para não somar outra cor.
  sobreMarca: 'borda aperta bg-folha text-nanquim px-medio',
};

export interface PropsBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  /** Renderiza o filho (por exemplo, um Link) com o estilo do botão. */
  comoFilho?: boolean;
}

export const Botao = forwardRef<HTMLButtonElement, PropsBotao>(function Botao(
  { variante = 'secundario', comoFilho = false, className = '', type, ...props },
  ref,
) {
  const Comp = comoFilho ? Slot.Root : 'button';
  return <Comp ref={ref} {...(comoFilho ? {} : { type: type ?? 'button' })} className={`${base} ${variantes[variante]} ${className}`} {...props} />;
});
