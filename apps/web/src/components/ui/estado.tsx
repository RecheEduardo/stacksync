// Disclosures, avisos em linha e estados de erro (DESIGN.md: Disclosures; Avisos de validação). Os esqueletos de
// carregamento ficam em esqueleto.tsx. Sem faixa amarela, sem caixa de alerta, sem toast.
import { ChevronDown, Info } from 'lucide-react';
import { Collapsible } from 'radix-ui';
import { useState, type ReactNode } from 'react';
import { Botao } from './botao.tsx';

/** Disclosure com o título como gatilho e a contagem de itens. */
export function Recolhivel({
  titulo,
  contagem,
  aberto: abertoInicial = false,
  children,
  nivel = 'secao',
}: {
  titulo: ReactNode;
  contagem?: number;
  aberto?: boolean;
  children: ReactNode;
  nivel?: 'secao' | 'compacto';
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  return (
    <Collapsible.Root open={aberto} onOpenChange={setAberto} className="flex flex-col">
      <Collapsible.Trigger className={`group flex w-full items-center gap-compacto rounded-controle borda bg-folha px-curto py-curto text-left aperta hover:bg-campo aria-expanded:bg-sinal aria-expanded:text-sobre-sinal ${nivel === 'secao' ? 'text-secao' : 'text-acao'}`}>
        <ChevronDown aria-hidden className="size-icone-grande shrink-0 -rotate-90 transition-transform duration-150 ease-saida group-aria-expanded:rotate-0" strokeWidth={1.5} />
        <span>{titulo}</span>
        {contagem !== undefined ? <span className="ml-auto borda-fina bg-folha px-compacto text-dado text-nanquim">{contagem}</span> : null}
      </Collapsible.Trigger>
      <Collapsible.Content className="surge pt-base">{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

/** Nota em linha logo abaixo do que a provocou, com a regra citada em legenda (C-13). */
export function Aviso({ children, regra }: { children: ReactNode; regra?: string }) {
  return (
    <p className="flex items-start gap-compacto text-compacto text-nanquim">
      <Info aria-hidden className="mt-micro size-icone shrink-0" strokeWidth={1.5} />
      <span>
        {children}
        {regra ? <span className="ml-compacto text-legenda text-grafite-claro">{regra}</span> : null}
      </span>
    </p>
  );
}

/** Falha de carga: diz o que aconteceu e oferece tentar de novo. */
export function ErroCarga({ mensagem, rotuloTentar, aoTentar }: { mensagem: string; rotuloTentar: string; aoTentar: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-curto">
      <p className="text-corpo text-nanquim">{mensagem}</p>
      <Botao variante="secundario" onClick={aoTentar}>
        {rotuloTentar}
      </Botao>
    </div>
  );
}

/** Título e conteúdo de uma seção da folha: mais espaço acima do título do que abaixo. */
export function Secao({ titulo, children, id, acao }: { titulo: ReactNode; children: ReactNode; id?: string; acao?: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-amplo flex scroll-mt-faixa flex-col gap-base regua-topo pt-amplo first:mt-0 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-compacto">
        <h2 id={id} className="text-secao">
          {titulo}
        </h2>
        {acao}
      </div>
      {children}
    </section>
  );
}
