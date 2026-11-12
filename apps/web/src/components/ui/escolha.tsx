// Opções de resposta (C-02) e caixas de seleção (DESIGN.md v2.0). Linhas de largura total, 60px, contorno de 3px
// e a sombra que aperta, mesmo peso para todas; a selecionada em amarelo (o amarelo é escolha), com o texto sempre
// em tinta escura nos dois temas. Nada vem marcado por padrão (IV-19), e "Não sei" usa as mesmas classes, medidas e
// selo de tecla das sugestões (IV-02). Raio zero: a marca de rádio também é quadrada.
import { Check } from 'lucide-react';
import { Checkbox, RadioGroup } from 'radix-ui';
import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export const classeOpcao =
  'group flex w-full min-h-opcao items-center gap-curto rounded-controle borda aperta bg-folha px-base py-curto text-left text-corpo font-medium text-nanquim hover:bg-campo aria-checked:bg-sinal aria-checked:text-sobre-sinal aria-pressed:bg-sinal aria-pressed:text-sobre-sinal aria-expanded:bg-realce disabled:border-inativo disabled:text-inativo';

function MarcaRadio() {
  return (
    <span aria-hidden className="grid size-icone-grande shrink-0 place-items-center rounded-reto borda-fina bg-folha group-aria-checked:border-sobre-sinal">
      <span className="size-compacto bg-sobre-sinal opacity-0 group-aria-checked:opacity-100" />
    </span>
  );
}

function MarcaCaixa() {
  return (
    <span aria-hidden className="grid size-icone-grande shrink-0 place-items-center rounded-caixa borda-fina bg-folha group-aria-checked:border-sobre-sinal group-aria-checked:bg-sobre-sinal">
      <Check className="size-icone text-sinal opacity-0 group-aria-checked:opacity-100" strokeWidth={3} />
    </span>
  );
}

/** Selo da tecla de atalho (DV-27): o mesmo em toda opção e em "Não sei" (IV-02); invertido quando marcada. */
export function SeloAtalho({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="grid size-selo shrink-0 place-items-center rounded-caixa bg-nanquim text-dado text-folha group-aria-checked:bg-folha group-aria-checked:text-sobre-sinal group-aria-pressed:bg-folha group-aria-pressed:text-sobre-sinal"
    >
      {n}
    </span>
  );
}

function Textos({ id, children, detalhe }: { id: string; children: ReactNode; detalhe?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span id={`${id}-rotulo`}>{children}</span>
      {detalhe ? (
        <span id={`${id}-detalhe`} className="text-compacto font-normal text-grafite group-aria-checked:text-sobre-sinal group-aria-pressed:text-sobre-sinal">
          {detalhe}
        </span>
      ) : null}
    </span>
  );
}

export const GrupoOpcoes = RadioGroup.Root;

export function Opcao({ children, detalhe, atalho, ...props }: ComponentPropsWithoutRef<typeof RadioGroup.Item> & { detalhe?: ReactNode; atalho?: number | undefined }) {
  const id = useId();
  return (
    <RadioGroup.Item className={classeOpcao} aria-labelledby={`${id}-rotulo`} aria-describedby={detalhe ? `${id}-detalhe` : undefined} {...props}>
      {atalho ? <SeloAtalho n={atalho} /> : <MarcaRadio />}
      <Textos id={id} detalhe={detalhe}>
        {children}
      </Textos>
    </RadioGroup.Item>
  );
}

export function OpcaoCaixa({
  children,
  detalhe,
  atalho,
  ...props
}: ComponentPropsWithoutRef<typeof Checkbox.Root> & { detalhe?: ReactNode; atalho?: number | undefined }) {
  const id = useId();
  return (
    <Checkbox.Root className={classeOpcao} aria-labelledby={`${id}-rotulo`} aria-describedby={detalhe ? `${id}-detalhe` : undefined} {...props}>
      {atalho ? <SeloAtalho n={atalho} /> : null}
      <MarcaCaixa />
      <Textos id={id} detalhe={detalhe}>
        {children}
      </Textos>
    </Checkbox.Root>
  );
}

/** Caixa de seleção compacta, com rótulo ao lado (por exemplo, "Tenho esse dado medido"). */
export function CaixaSelecao({ children, id, ...props }: ComponentPropsWithoutRef<typeof Checkbox.Root> & { children: ReactNode; id: string }) {
  return (
    <div className="flex items-center gap-compacto">
      <Checkbox.Root id={id} className="group grid size-icone-grande place-items-center rounded-reto" {...props}>
        <MarcaCaixa />
      </Checkbox.Root>
      <label htmlFor={id} className="text-compacto text-nanquim">
        {children}
      </label>
    </div>
  );
}
