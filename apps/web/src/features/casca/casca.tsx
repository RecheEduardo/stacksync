// Casca do aplicativo (DESIGN.md, Layout; DV-50): cabeçalho preto de 80px em três colunas: a análise atual à
// esquerda, o símbolo e o nome do produto no centro (levam à página de entrada), o indicador de salvamento, o botão
// "Análises" e o menu da conta à direita.
import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useEffect } from 'react';
import { useT } from '../../lib/catalogo.tsx';
import { useSalvamento } from '../../lib/salvamento.ts';
import { useEu } from '../../lib/sessao.ts';
import { ErroCarga } from '../../components/ui/estado.tsx';
import { BarraRetratil, ItemBarra } from '../../components/ui/barra-retratil.tsx';
import { Barra, CabecalhoCarregando, EsqueletoPagina } from '../../components/ui/esqueleto.tsx';
import { CamadasFundo } from '../../components/ui/fundo.tsx';
import { BOTAO_CABECALHO } from '../../components/ui/cabecalho.tsx';
import { Assinatura } from '../../components/ui/marca.tsx';

const LIVRES_DE_IA = ['/configuracoes/ia', '/configuracoes/dados', '/metodo'];

function IndicadorSalvamento() {
  const t = useT();
  const estado = useSalvamento();
  const texto =
    estado === 'salvando'
      ? t('ui.salvando')
      : estado === 'salvo'
        ? t('ui.salvo')
        : estado === 'sem-conexao'
          ? t('ui.semConexao')
          : estado === 'conflito'
            ? t('ui.conflitoCurto')
            : estado === 'erro'
              ? t('ui.erroSalvar')
              : '';
  return (
    <p aria-live="polite" className="hidden min-w-0 truncate text-codigo text-sobre-cabecalho sm:block">
      {texto}
    </p>
  );
}

function MenuConta() {
  const t = useT();
  const item = 'flex h-botao items-center px-curto text-acao text-nanquim outline-none data-highlighted:bg-sinal data-highlighted:text-sobre-sinal';
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={BOTAO_CABECALHO}>
        {t('ui.menu.conta')}
        <ChevronDown aria-hidden className="size-icone" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-sobreposicao flex min-w-contexto flex-col borda bg-folha p-micro flutua surge">
          <DropdownMenu.Item asChild className={item}>
            <Link to="/analises">{t('ui.menu.analises')}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link to="/configuracoes/ia">{t('ui.menu.ia')}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link to="/configuracoes/dados">{t('ui.menu.dados')}</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={item}>
            <Link to="/metodo">{t('ui.painel.metodo')}</Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function BarraSuperior({ titulo, carregando = false }: { titulo?: string | null; carregando?: boolean }) {
  const t = useT();
  return (
    <BarraRetratil className="grade-barra h-barra border-b-4 border-sinal bg-cabecalho px-base text-sobre-cabecalho nao-imprimir md:px-medio">
      <ItemBarra className="min-w-0">
        {carregando ? <Barra largura="w-1/2 md:w-1/3" /> : <p className="min-w-0 truncate text-dado text-sobre-cabecalho">{titulo ?? ''}</p>}
      </ItemBarra>
      <ItemBarra>
        <Link to="/" className="flex items-center">
          <Assinatura nome={t('ui.produto')} />
        </Link>
      </ItemBarra>
      <ItemBarra className="flex min-w-0 items-center justify-end gap-curto md:gap-base">
        <IndicadorSalvamento />
        {/* No celular o botão não cabe ao lado do símbolo; "Minhas análises" segue no menu da conta. */}
        <Link to="/analises" className={`${BOTAO_CABECALHO} max-md:hidden`}>
          {t('ui.cabecalho.analises')}
        </Link>
        <MenuConta />
      </ItemBarra>
    </BarraRetratil>
  );
}

/** Casca das telas autenticadas: garante a sessão e leva à conexão da IA no primeiro acesso (RF-48). */
export function CascaApp() {
  const t = useT();
  const eu = useEu();
  const navegar = useNavigate();
  // O caminho da rota já carregada, não o do endereço: ao sair da casca (a logo leva à página de entrada), o endereço
  // muda para "/" antes de a casca desmontar, e pedir a conexão da IA nessa hora prendia a pessoa em "Conectar a IA".
  const caminho = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).pathname });
  const naCasca = useRouterState({ select: (s) => s.status === 'idle' && s.matches.some((m) => m.routeId === '/app') });
  const semIa = eu.data && (!eu.data.ia || !eu.data.ia.disponivel);
  useEffect(() => {
    if (semIa && naCasca && !LIVRES_DE_IA.includes(caminho)) void navegar({ to: '/configuracoes/ia', search: { voltar: `${caminho}${window.location.search}` } });
  }, [semIa, naCasca, caminho, navegar]);

  if (eu.isError)
    return (
      <main className="mx-auto flex max-w-leitura flex-col gap-base p-medio">
        <ErroCarga mensagem={t('ui.erroSessao')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void eu.refetch()} />
      </main>
    );
  if (!eu.data)
    return (
      <div className="min-h-dvh">
        <CamadasFundo />
        <div className="relative z-base">
          <CabecalhoCarregando />
          <EsqueletoPagina rotulo={t('ui.carregando.sessao')} />
        </div>
      </div>
    );
  return (
    <>
      <CamadasFundo />
      <div className="relative z-base">
        <Outlet />
      </div>
    </>
  );
}
