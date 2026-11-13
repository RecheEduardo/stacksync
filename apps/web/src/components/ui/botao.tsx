// Botões (DESIGN.md v2.0, Buttons): raio zero, 48px, contorno de 3px em tinta, rótulo em caixa-alta.
// Primário em amarelo de sinalização (o amarelo é escolha), no máximo um por região, e nunca a ação de mudar
// a arquitetura. Primário e secundário têm a sombra que aperta; o discreto é um link sublinhado, sem sombra.
// Duas famílias com movimento próprio, cada uma com um papel (DESIGN.md, DV-62 e DV-63):
// - placa e placaClara: seguir adiante no fluxo; um bloco sobe e preenche o botão e a seta gira para cima.
// - carimbo: abrir uma análise nova; inclinado, endireita no hover e bate ao apertar. No máximo um por tela.
import { ArrowRight } from 'lucide-react';
import { Slot } from 'radix-ui';
import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';

export type VarianteBotao = 'primario' | 'secundario' | 'discreto' | 'destrutivo' | 'sobreMarca' | 'placa' | 'placaClara' | 'carimbo';

const base =
  'inline-flex items-center justify-center gap-compacto h-botao rounded-controle text-acao whitespace-nowrap select-none';

const variantes: Record<VarianteBotao, string> = {
  primario: 'borda aperta bg-sinal text-sobre-sinal px-medio disabled:border-inativo disabled:bg-folha disabled:text-inativo',
  secundario: 'borda aperta bg-folha text-nanquim px-medio hover:bg-campo disabled:border-inativo disabled:text-inativo',
  discreto:
    'pressionavel px-curto text-nanquim underline decoration-2 underline-offset-4 hover:bg-realce disabled:text-inativo disabled:no-underline disabled:hover:bg-transparent',
  destrutivo: 'borda aperta bg-critico text-folha px-medio disabled:border-inativo disabled:bg-folha disabled:text-inativo',
  // Ação sobre um bloco de cor da marca ou do sinal: papel com contorno, para não somar outra cor.
  sobreMarca: 'borda aperta bg-folha text-nanquim px-medio',
  placa: 'placa px-medio',
  placaClara: 'placa placa-clara px-medio',
  carimbo: 'carimbo px-medio',
};

/** Seta das placas: gira para cima quando o bloco sobe. Ponha no fim do rótulo. */
export function SetaBotao() {
  return <ArrowRight aria-hidden className="seta-botao size-icone shrink-0" />;
}

export interface PropsBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  /** Renderiza o filho (por exemplo, um Link) com o estilo do botão. */
  comoFilho?: boolean;
}

/** O carimbo solta uma onda a cada clique: o atributo é tirado e posto de novo para a animação recomeçar. */
function bater(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.removeAttribute('data-bate');
  void el.offsetWidth;
  el.setAttribute('data-bate', '');
  el.addEventListener('animationend', () => el.removeAttribute('data-bate'), { once: true });
}

export const Botao = forwardRef<HTMLButtonElement, PropsBotao>(function Botao(
  { variante = 'secundario', comoFilho = false, className = '', type, onClick, ...props },
  ref,
) {
  const Comp = comoFilho ? Slot.Root : 'button';
  const aoClicar =
    variante === 'carimbo'
      ? (e: MouseEvent<HTMLButtonElement>) => {
          bater(e);
          onClick?.(e);
        }
      : onClick;
  return (
    <Comp
      ref={ref}
      {...(comoFilho ? {} : { type: type ?? 'button' })}
      className={`${base} ${variantes[variante]} ${className}`}
      onClick={aoClicar}
      {...props}
    />
  );
});
