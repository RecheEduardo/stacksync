// Camadas de fundo e projeções (DESIGN.md v2.1: Camadas de fundo; Elevation & Depth > Projeção; DV-42 a DV-46).
// O fundo nunca é um cinza liso: a textura de forma de concreto (--textura-forma, ladrilhada pelo utilitário
// textura-planta em células da mesma grade dos eixos) fica neste mesmo contêiner, e sobre ela entram os
// eixos estruturais de uma planta (rótulos quadrados A–F e 1–4, linhas tracejadas e marcas de cruz) e blocos
// figurativos grandes, parcialmente escondidos atrás do conteúdo. Tudo decorativo, fixo, sem clique e fora da
// leitura de tela. A projeção zebrada ou chapada fica atrás de blocos estáticos de destaque: é a sombra da obra,
// diferente da sombra sólida em tinta, que promete clique.
import type { ReactNode } from 'react';

const COLUNAS = ['A', 'B', 'C', 'D', 'E', 'F'];
const LINHAS = ['1', '2', '3', '4'];
const pct = (i: number, n: number) => `${((i + 0.5) / n) * 100}%`;

type Bloco = { classe: string; estilo: React.CSSProperties };

const BLOCOS: Record<'app' | 'entrada', Bloco[]> = {
  app: [
    { classe: 'zebrado borda', estilo: { left: '-72px', bottom: '-48px', width: '320px', height: '200px' } },
    { classe: 'bg-madeira borda', estilo: { right: '-56px', top: '38%', width: '240px', height: '300px' } },
    { classe: 'bg-concreto-escuro borda', estilo: { right: '12%', bottom: '-80px', width: '360px', height: '160px' } },
  ],
  entrada: [
    { classe: 'bg-sinal borda', estilo: { right: '-64px', top: '14%', width: '280px', height: '220px' } },
    { classe: 'zebrado borda', estilo: { left: '-90px', top: '58%', width: '260px', height: '180px' } },
    { classe: 'bg-madeira borda', estilo: { right: '18%', bottom: '-70px', width: '300px', height: '150px' } },
    // Branco com contorno em tinta: o bloco preto escondia o texto preto que passava por cima dele.
    { classe: 'bg-folha borda', estilo: { left: '30%', top: '-60px', width: '120px', height: '120px' } },
  ],
};

/** Camadas de fundo fixas, atrás do conteúdo. Coloque antes do conteúdo, que deve vir num contêiner `relative z-base`. */
export function CamadasFundo({ variante = 'app' }: { variante?: 'app' | 'entrada' }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-base textura-planta overflow-hidden select-none nao-imprimir">
      {/* Eixos verticais e horizontais da planta, tracejados. */}
      {COLUNAS.map((c, i) => (
        <span key={c} className="absolute inset-y-0 border-l-2 border-dashed border-traco" style={{ left: pct(i, COLUNAS.length) }} />
      ))}
      {LINHAS.map((l, i) => (
        <span key={l} className="absolute inset-x-0 border-t-2 border-dashed border-traco" style={{ top: pct(i, LINHAS.length) }} />
      ))}
      {/* Blocos figurativos. */}
      {BLOCOS[variante].map((b, i) => (
        <span key={i} className={`absolute ${b.classe}`} style={b.estilo} />
      ))}
      {/* Marcas de cruz nas interseções. */}
      {COLUNAS.flatMap((c, i) =>
        LINHAS.map((l, j) => (
          <span key={`${c}${l}`} className="absolute size-base -translate-x-1/2 -translate-y-1/2" style={{ left: pct(i, COLUNAS.length), top: pct(j, LINHAS.length) }}>
            <span className="absolute inset-x-0 top-1/2 h-borda-fina -translate-y-1/2 bg-grafite-claro" />
            <span className="absolute inset-y-0 left-1/2 w-borda-fina -translate-x-1/2 bg-grafite-claro" />
          </span>
        )),
      )}
      {/* Rótulos dos eixos, em quadrados, como numa planta de estrutura. */}
      {COLUNAS.map((c, i) => (
        <span key={`r${c}`} className="absolute bottom-base grid size-medio -translate-x-1/2 place-items-center borda-fina bg-folha text-codigo text-grafite" style={{ left: pct(i, COLUNAS.length) }}>
          {c}
        </span>
      ))}
      {LINHAS.map((l, j) => (
        <span key={`r${l}`} className="absolute right-base grid size-medio -translate-y-1/2 place-items-center borda-fina bg-folha text-codigo text-grafite" style={{ top: pct(j, LINHAS.length) }}>
          {l}
        </span>
      ))}
    </div>
  );
}

export type TipoProjecao = 'zebra' | 'sinal' | 'marca' | 'madeira' | 'tinta';

const FUNDO: Record<TipoProjecao, string> = {
  zebra: 'zebrado',
  sinal: 'bg-sinal',
  marca: 'bg-marca',
  madeira: 'bg-madeira',
  tinta: 'bg-nanquim',
};

/**
 * Projeção atrás de um bloco estático (DV-43, DV-44): um bloco com contorno, deslocado para baixo e para a esquerda
 * (ou para a direita), em zebrado de obra ou cor chapada. O filho precisa ter fundo opaco.
 */
export function Projecao({
  children,
  tipo = 'zebra',
  lado = 'esquerda',
  grande = false,
  className = '',
}: {
  children: ReactNode;
  tipo?: TipoProjecao;
  lado?: 'esquerda' | 'direita';
  grande?: boolean;
  className?: string;
}) {
  // Classes escritas por extenso para o Tailwind encontrá-las. No celular a projeção só desce (borda embaixo, sem
  // lado); a partir de md ela também desloca para o lado.
  const deslocamento = grande
    ? lado === 'esquerda'
      ? 'translate-y-base md:-translate-x-base'
      : 'translate-y-base md:translate-x-base'
    : lado === 'esquerda'
      ? 'translate-y-curto md:-translate-x-curto'
      : 'translate-y-curto md:translate-x-curto';
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden className={`absolute inset-0 borda ${FUNDO[tipo]} ${deslocamento}`} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
