// Contadores (DESIGN.md v2.0, Motion): o número conta até o valor novo em 300 a 600ms quando muda. Só para
// etapa, âmbitos cobertos, minutos restantes e os números da página de entrada; nunca para o Índice de Ajuste
// nem para qualquer número do veredito (IV-23, FD-16). Com "reduzir movimento", mostra o valor final na hora.
import { animate, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function useContagem(valor: number, { duracao = 0.45, casas = 0, desde }: { duracao?: number; casas?: number; desde?: number } = {}) {
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(desde ?? valor);
  const anterior = useRef(desde ?? valor);
  useEffect(() => {
    if (reduzir || anterior.current === valor) {
      anterior.current = valor;
      setAtual(valor);
      return;
    }
    const controle = animate(anterior.current, valor, {
      duration: duracao,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => setAtual(Number(v.toFixed(casas))),
    });
    anterior.current = valor;
    return () => controle.stop();
  }, [valor, duracao, casas, reduzir]);
  return atual;
}
