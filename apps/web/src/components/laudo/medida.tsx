// Utilitários das visualizações próprias (DT-06): largura medida, padrões de hachura com ID único por
// instância e terminais de cota. SVG próprio, sem biblioteca de gráficos.
import { useId, useLayoutEffect, useRef, useState } from 'react';

export function useLargura<T extends HTMLElement>(inicial = 560) {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(inicial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setLargura(Math.max(120, Math.round(el.clientWidth)));
    const ro = new ResizeObserver((entradas) => {
      const w = entradas[0]?.contentRect.width;
      if (w) setLargura(Math.max(120, Math.round(w)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, largura] as const;
}

/** IDs dos padrões de hachura desta instância (zona de tolerância, sentido da sobra e da falta). */
export function useHachura() {
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  return { zona: `zona${base}`, sobra: `sobra${base}`, falta: `falta${base}` };
}

export function DefsHachura({ ids }: { ids: ReturnType<typeof useHachura> }) {
  return (
    <defs>
      {/* Zona de tolerância: linhas a 45° em hachura (tinta a 30%), espaçadas 5px (A Regra da Hachura). */}
      <pattern id={ids.zona} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="var(--cor-hachura)" strokeWidth="1" />
      </pattern>
      {/* Sentido do desvio: barra para a direita na sobra, para a esquerda na falta. */}
      <pattern id={ids.sobra} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="var(--cor-folha)" strokeOpacity="0.55" strokeWidth="1.2" />
      </pattern>
      <pattern id={ids.falta} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="var(--cor-folha)" strokeOpacity="0.55" strokeWidth="1.2" />
      </pattern>
    </defs>
  );
}

/** Faixa com terminais de cota: retângulo e duas linhas verticais nas pontas. */
export function Cota({ x1, x2, y, altura, preenchimento, terminal = 'var(--cor-grafite)', traco = 1.5 }: { x1: number; x2: number; y: number; altura: number; preenchimento: string; terminal?: string; traco?: number }) {
  const a = Math.min(x1, x2);
  const b = Math.max(x1, x2);
  return (
    <g>
      <rect x={a} y={y} width={Math.max(1, b - a)} height={altura} fill={preenchimento} />
      <line x1={a + traco / 2} x2={a + traco / 2} y1={y} y2={y + altura} stroke={terminal} strokeWidth={traco} />
      <line x1={b - traco / 2} x2={b - traco / 2} y1={y} y2={y + altura} stroke={terminal} strokeWidth={traco} />
    </g>
  );
}

export const limitar = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
