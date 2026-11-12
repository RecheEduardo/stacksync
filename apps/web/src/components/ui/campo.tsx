// Campos (DESIGN.md v2.0, Inputs / Fields): papel, contorno de 3px em tinta, raio zero, 52px,
// rótulo sempre visível acima; erro de formato em crítico, logo abaixo, dizendo como corrigir.
import { CircleAlert } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

const controle =
  'w-full rounded-controle borda bg-folha text-corpo text-nanquim placeholder:text-grafite-claro hover:bg-campo aria-invalid:border-critico disabled:border-inativo disabled:bg-mesa disabled:text-inativo';

interface Moldura {
  rotulo: ReactNode;
  ajuda?: ReactNode;
  erro?: string | null | undefined;
  /** Rótulo visualmente oculto (o nome acessível continua). */
  rotuloOculto?: boolean;
}

function MolduraCampo({ id, rotulo, ajuda, erro, rotuloOculto, children }: Moldura & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-micro">
      <label htmlFor={id} className={rotuloOculto ? 'sr-only' : 'text-rotulo text-nanquim'}>
        {rotulo}
      </label>
      {ajuda ? (
        <p id={`${id}-ajuda`} className="text-legenda text-grafite">
          {ajuda}
        </p>
      ) : null}
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="flex items-start gap-micro text-compacto text-critico">
          <CircleAlert aria-hidden className="mt-micro size-icone shrink-0" strokeWidth={1.5} />
          {erro}
        </p>
      ) : null}
    </div>
  );
}

const descritoPor = (id: string, ajuda: unknown, erro: unknown) =>
  [ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(' ') || undefined;

export const Campo = forwardRef<HTMLInputElement, Moldura & InputHTMLAttributes<HTMLInputElement>>(function Campo(
  { rotulo, ajuda, erro, rotuloOculto, id: idProp, className = '', ...props },
  ref,
) {
  const gerado = useId();
  const id = idProp ?? gerado;
  return (
    <MolduraCampo id={id} rotulo={rotulo} ajuda={ajuda} erro={erro} rotuloOculto={!!rotuloOculto}>
      <input
        ref={ref}
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, ajuda, erro)}
        className={`${controle} h-campo px-base ${className}`}
        {...props}
      />
    </MolduraCampo>
  );
});

export const AreaTexto = forwardRef<HTMLTextAreaElement, Moldura & TextareaHTMLAttributes<HTMLTextAreaElement>>(function AreaTexto(
  { rotulo, ajuda, erro, rotuloOculto, id: idProp, className = '', rows = 3, ...props },
  ref,
) {
  const gerado = useId();
  const id = idProp ?? gerado;
  return (
    <MolduraCampo id={id} rotulo={rotulo} ajuda={ajuda} erro={erro} rotuloOculto={!!rotuloOculto}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, ajuda, erro)}
        className={`${controle} px-base py-curto resize-y ${className}`}
        {...props}
      />
    </MolduraCampo>
  );
});

export function Selecao({
  rotulo,
  ajuda,
  erro,
  id: idProp,
  children,
  className = '',
  ...props
}: Moldura & React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const gerado = useId();
  const id = idProp ?? gerado;
  return (
    <MolduraCampo id={id} rotulo={rotulo} ajuda={ajuda} erro={erro}>
      <select id={id} aria-describedby={descritoPor(id, ajuda, erro)} className={`${controle} h-campo px-base ${className}`} {...props}>
        {children}
      </select>
    </MolduraCampo>
  );
}
