// Símbolo e assinatura (DESIGN.md: Shapes > O símbolo do produto). Um tema só, o claro (DV-49): sem troca de tema.
// O símbolo é uma placa de obra: um quadrado amarelo com duas barras empilhadas e desalinhadas ("stack")
// atravessadas por uma barra vermelha vertical ("sync"), a pilha que se acerta na linha zero. Raio zero.

export function Simbolo({ className = 'size-simbolo' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={`shrink-0 cor-exata ${className}`}>
      <rect x="1.5" y="1.5" width="29" height="29" fill="var(--cor-sinal)" stroke="var(--cor-sobre-sinal)" strokeWidth="3" />
      <rect x="6" y="9" width="15" height="5" fill="var(--cor-sobre-sinal)" />
      <rect x="11" y="18" width="15" height="5" fill="var(--cor-sobre-sinal)" />
      <rect x="15" y="4" width="3" height="24" fill="var(--cor-marca)" />
    </svg>
  );
}

/** Assinatura: símbolo e o nome em caixa-alta, extra largo. No celular, só o símbolo (o nome segue acessível). */
export function Assinatura({ nome, className = '' }: { nome: string; className?: string }) {
  return (
    <span className={`flex items-center gap-curto ${className}`}>
      <Simbolo />
      <span className="sr-only text-secao md:not-sr-only">{nome}</span>
    </span>
  );
}
