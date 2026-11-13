// Barra do topo que se recolhe (DV-60; cabeçalho preto do aplicativo e da página de entrada). Fica fixa no alto; ao rolar
// para baixo ela sobe e some, e ao rolar para cima ela volta. A barra desce com uma mola leve; o que há dentro dela
// (os ItemBarra) chega com uma mola mais forte, passa um pouco do lugar e assenta depois. Com "reduzir movimento",
// a barra só fica fixa, sem sumir nem molejar. Não use no resultado nem no relatório (FD-16, IV-23).
import { m, useMotionValueEvent, useReducedMotion, useScroll, type Variants } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';

const SAIDA = [0.23, 1, 0.32, 1] as const;
const MOLA_BARRA = { type: 'spring', stiffness: 300, damping: 26 } as const;
const MOLA_ITENS = { type: 'spring', stiffness: 380, damping: 15 } as const;

const BARRA: Variants = {
  visivel: { y: 0, transition: MOLA_BARRA },
  oculto: { y: '-100%', transition: { type: 'spring', stiffness: 420, damping: 42 } },
};
const ITEM: Variants = {
  visivel: { y: 0, transition: { ...MOLA_ITENS, delay: 0.06 } },
  oculto: { y: -32, transition: { duration: 0.2, ease: SAIDA } },
};

export function BarraRetratil({ className = '', children }: { className?: string; children: ReactNode }) {
  const sem = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [oculta, setOculta] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (atual) => {
    const delta = atual - (scrollY.getPrevious() ?? atual);
    // Perto do topo ela fica sempre à vista; depois, a direção da rolagem decide (ignora tremidas de 2px ou menos).
    if (atual < (ref.current?.offsetHeight ?? 0) || delta < -2) setOculta(false);
    else if (delta > 2) setOculta(true);
  });
  return (
    <m.header
      ref={ref}
      {...(sem ? {} : { variants: BARRA, initial: false, animate: oculta ? 'oculto' : 'visivel' })}
      // Quem chega pelo teclado precisa ver onde está o foco.
      onFocusCapture={() => setOculta(false)}
      // A extensão acima da barra esconde o vão que a mola abre quando passa um pouco do topo.
      className={`sticky top-0 z-trilho before:absolute before:inset-x-0 before:bottom-full before:h-amplo before:bg-cabecalho ${className}`}
    >
      {children}
    </m.header>
  );
}

/** Peça de dentro da barra: leva a mola mais forte, que passa um pouco do lugar. */
export function ItemBarra({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <m.div variants={ITEM} className={className}>
      {children}
    </m.div>
  );
}
