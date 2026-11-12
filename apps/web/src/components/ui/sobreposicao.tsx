// Sobreposições sobre Radix: diálogo, confirmação destrutiva, folha modal, dica e popover.
// Profundidade declarada uma vez: anel de sombra, sem contorno extra (DESIGN.md, Elevation & Depth).
import { X } from 'lucide-react';
import { AlertDialog, Dialog, Popover, Tooltip } from 'radix-ui';
import type { ReactNode } from 'react';
import { Botao } from './botao.tsx';

const veu = 'fixed inset-0 z-dialogo bg-cabecalho/60 surge';

export function Dialogo({
  aberto,
  aoMudar,
  titulo,
  descricao,
  children,
  rotuloFechar,
}: {
  aberto: boolean;
  aoMudar: (v: boolean) => void;
  titulo: ReactNode;
  descricao?: ReactNode;
  children: ReactNode;
  rotuloFechar: string;
}) {
  return (
    <Dialog.Root open={aberto} onOpenChange={aoMudar}>
      <Dialog.Portal>
        <Dialog.Overlay className={veu} />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-dialogo flex caixa-dialogo -translate-x-1/2 -translate-y-1/2 flex-col gap-base overflow-y-auto rounded-folha borda bg-folha p-medio flutua surge">
          <div className="flex items-start justify-between gap-base">
            <Dialog.Title className="text-secao">{titulo}</Dialog.Title>
            <Dialog.Close asChild>
              <Botao variante="discreto" aria-label={rotuloFechar}>
                <X aria-hidden className="size-icone" strokeWidth={1.5} />
              </Botao>
            </Dialog.Close>
          </div>
          {descricao ? <Dialog.Description className="text-corpo text-grafite">{descricao}</Dialog.Description> : <Dialog.Description className="sr-only">{titulo}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Confirmação de ação destrutiva: nomeia o que será perdido; o botão usa crítico (DESIGN.md, Buttons). */
export function ConfirmacaoDestrutiva({
  gatilho,
  titulo,
  descricao,
  confirmar,
  cancelar,
  aoConfirmar,
}: {
  gatilho: ReactNode;
  titulo: string;
  descricao: string;
  confirmar: string;
  cancelar: string;
  aoConfirmar: () => void;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{gatilho}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={veu} />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-dialogo flex caixa-confirmacao -translate-x-1/2 -translate-y-1/2 flex-col gap-base rounded-folha borda bg-folha p-medio flutua surge">
          <AlertDialog.Title className="text-secao">{titulo}</AlertDialog.Title>
          <AlertDialog.Description className="text-corpo text-grafite">{descricao}</AlertDialog.Description>
          <div className="flex flex-wrap justify-end gap-compacto">
            <AlertDialog.Cancel asChild>
              <Botao variante="secundario">{cancelar}</Botao>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Botao variante="destrutivo" onClick={aoConfirmar}>
                {confirmar}
              </Botao>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** Folha modal que sobe da base, para painéis laterais em telas abaixo de 1024px (T-06). */
export function FolhaModal({
  aberto,
  aoMudar,
  titulo,
  children,
  rotuloFechar,
}: {
  aberto: boolean;
  aoMudar: (v: boolean) => void;
  titulo: string;
  children: ReactNode;
  rotuloFechar: string;
}) {
  return (
    <Dialog.Root open={aberto} onOpenChange={aoMudar}>
      <Dialog.Portal>
        <Dialog.Overlay className={veu} />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-dialogo flex altura-folha-modal flex-col gap-base overflow-y-auto rounded-t-folha bg-folha p-medio borda flutua surge">
          <div className="flex items-start justify-between gap-base">
            <Dialog.Title className="text-secao">{titulo}</Dialog.Title>
            <Dialog.Close asChild>
              <Botao variante="discreto" aria-label={rotuloFechar}>
                <X aria-hidden className="size-icone" strokeWidth={1.5} />
              </Botao>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{titulo}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Dica({ conteudo, children }: { conteudo: ReactNode; children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            className="z-sobreposicao max-w-contexto rounded-controle bg-nanquim px-curto py-compacto text-legenda text-folha borda flutua surge"
          >
            {conteudo}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function Balao({ gatilho, children, rotulo }: { gatilho: ReactNode; children: ReactNode; rotulo: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{gatilho}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label={rotulo}
          sideOffset={6}
          collisionPadding={16}
          className="z-sobreposicao flex max-w-contexto flex-col gap-compacto rounded-folha bg-folha p-base text-compacto borda flutua surge"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
