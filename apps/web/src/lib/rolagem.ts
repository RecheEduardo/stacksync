// Rolagem suave com o Lenis (DESIGN.md, Motion; DV-51). A página continua rolando pelo scroll nativo do navegador
// (o Lenis só suaviza a roda e o trackpad), então o teclado, a busca, a restauração de rolagem do roteador e o
// useScroll do Motion seguem funcionando. Desligado com "reduzir movimento" (e religado se a preferência mudar).
// Áreas que rolam por dentro (trilho, menus, diálogos) rolam sozinhas (allowNestedScroll); com um diálogo ou menu
// modal aberto, o Radix trava a página (body[data-scroll-locked]) e o Lenis não a move por trás.
import Lenis from 'lenis';
import { useEffect } from 'react';

export function useRolagemSuave() {
  useEffect(() => {
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    const ligar = () => {
      lenis?.destroy();
      lenis = null;
      if (reduzir.matches) return;
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        virtualScroll: () => !document.body.hasAttribute('data-scroll-locked'),
      });
    };
    ligar();
    reduzir.addEventListener('change', ligar);
    return () => {
      reduzir.removeEventListener('change', ligar);
      lenis?.destroy();
    };
  }, []);
}
