// T-01 Painel de análises: retomar ou começar. Tabela compacta por atividade recente, nunca por
// "gravidade" (IV-16). Vazio ensina e oferece uma ação.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useState } from 'react';
import { api } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { dataPt } from '../../lib/formato.ts';
import type { AnaliseResumo } from '../../lib/tipos.ts';
import { Botao } from '../../components/ui/botao.tsx';
import { ErroCarga } from '../../components/ui/estado.tsx';
import { EsqueletoTabela } from '../../components/ui/esqueleto.tsx';
import { Dialogo } from '../../components/ui/sobreposicao.tsx';
import { IconeSaude } from '../../components/laudo/status.tsx';
import { Projecao } from '../../components/ui/fundo.tsx';
import { FaixaMinutos, NIVEIS } from '../../components/ui/niveis.tsx';
import { BarraSuperior } from '../casca/casca.tsx';

type Linha = AnaliseResumo & {
  ultimoVeredito: (NonNullable<AnaliseResumo['ultimoVeredito']> & { obrigacaoProxima: { texto: string; data: string; status: 'vencida' | 'proxima' } | null }) | null;
};

function destino(a: Linha) {
  return a.ultimoVeredito ? `/analises/${a.id}/resultado/${a.ultimoVeredito.id}` : `/analises/${a.id}/perguntas`;
}

function AcoesLinha({ a, arquivadas }: { a: Linha; arquivadas: boolean }) {
  const t = useT();
  const qc = useQueryClient();
  const [excluir, setExcluir] = useState(false);
  const arquivar = useMutation({
    mutationFn: () => api(`/analises/${a.id}/arquivar`, { metodo: 'POST', corpo: { arquivada: !arquivadas } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['analises'] }),
  });
  const apagar = useMutation({
    mutationFn: () => api(`/analises/${a.id}`, { metodo: 'DELETE' }),
    onSuccess: () => {
      setExcluir(false);
      void qc.invalidateQueries({ queryKey: ['analises'] });
    },
  });
  const item = 'flex h-botao items-center px-curto text-acao text-nanquim outline-none data-highlighted:bg-sinal data-highlighted:text-sobre-sinal';
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger aria-label={t('ui.painel.acoes', { nome: a.nome })} className="grid size-campo place-items-center rounded-controle text-nanquim hover:bg-realce aria-expanded:bg-realce">
          <MoreHorizontal aria-hidden className="size-icone" strokeWidth={1.5} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" sideOffset={4} className="z-sobreposicao flex min-w-contexto flex-col borda bg-folha p-micro flutua surge">
            <DropdownMenu.Item className={item} onSelect={() => arquivar.mutate()}>
              {arquivadas ? t('ui.painel.desarquivar') : t('ui.painel.arquivar')}
            </DropdownMenu.Item>
            <DropdownMenu.Item className={item} onSelect={() => setExcluir(true)}>
              {t('ui.painel.excluir')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Dialogo aberto={excluir} aoMudar={setExcluir} titulo={t('ui.painel.excluir.titulo')} descricao={t('ui.painel.excluir.descricao', { nome: a.nome })} rotuloFechar={t('ui.fechar')}>
        <div className="flex flex-wrap justify-end gap-compacto">
          <Botao variante="secundario" onClick={() => setExcluir(false)}>
            {t('ui.cancelar')}
          </Botao>
          <Botao variante="destrutivo" onClick={() => apagar.mutate()} disabled={apagar.isPending}>
            {t('ui.painel.excluir')}
          </Botao>
        </div>
      </Dialogo>
    </>
  );
}

function Tabela({ analises, arquivadas, calibracaoVigente }: { analises: Linha[]; arquivadas: boolean; calibracaoVigente: string }) {
  const t = useT();
  const cat = useCatalogo();
  const objetivo = (a: Linha) => {
    const s = cat.estrutura.subniveis[a.subnivel];
    return `${t(`ui.enquadramento.${s.ramo}`)}, ${s.rotulo.toLowerCase()}`;
  };
  const veredito = (a: Linha) =>
    a.ultimoVeredito
      ? t('ui.painel.vereditoResumo', { categoria: t(`categoria.${a.ultimoVeredito.categoria}`), de: a.ultimoVeredito.indice.lo, ate: a.ultimoVeredito.indice.hi })
      : t('ui.painel.semVeredito');
  return (
    <>
      <table className="hidden w-full border-collapse text-compacto lg:table">
        <caption className="sr-only">{t('ui.painel.titulo')}</caption>
        <thead>
          <tr className="traco-base">
            {['analise', 'estado', 'veredito', 'confianca', 'calibracao', 'obrigacao', 'atualizada'].map((c) => (
              <th key={c} scope="col" className="h-linha px-curto text-left text-rotulo text-grafite">
                {t(`ui.painel.coluna.${c}`)}
              </th>
            ))}
            <th scope="col">
              <span className="sr-only">{t('ui.painel.coluna.acoes')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {analises.map((a) => (
            <tr key={a.id} className="traco-base align-top hover:bg-mesa">
              <td className="px-curto py-compacto">
                <Link to={destino(a)} className="rounded-controle text-subtitulo text-nanquim underline-offset-4 hover:underline">
                  {a.nome}
                </Link>
                <p className="text-legenda text-grafite">{`${objetivo(a)}. ${cat.estrutura.profundidades[a.profundidade].rotulo}`}</p>
              </td>
              <td className="px-curto py-compacto">
                <span className={`inline-flex borda-fina px-compacto py-micro text-rotulo ${a.ultimoVeredito ? 'bg-nanquim text-folha' : 'bg-folha text-nanquim'}`}>
                  {a.ultimoVeredito ? t('ui.painel.estado.veredito') : t('ui.painel.estado.preenchendo')}
                </span>
              </td>
              <td className="px-curto py-compacto text-nanquim numeros">{veredito(a)}</td>
              <td className="px-curto py-compacto text-nanquim">{a.ultimoVeredito ? t(`confianca.${a.ultimoVeredito.confianca}`) : ''}</td>
              <td className="px-curto py-compacto text-nanquim numeros">
                {a.ultimoVeredito?.versaoCalibracao ?? ''}
                {a.ultimoVeredito && a.ultimoVeredito.versaoCalibracao !== calibracaoVigente ? <span className="block text-legenda text-grafite">{t('ui.painel.novaCalibracao')}</span> : null}
              </td>
              <td className="px-curto py-compacto">
                {a.ultimoVeredito?.obrigacaoProxima ? (
                  <span className="flex items-start gap-compacto text-nanquim">
                    <IconeSaude status={a.ultimoVeredito.obrigacaoProxima.status} />
                    <span className="numeros">{dataPt(a.ultimoVeredito.obrigacaoProxima.data)}</span>
                  </span>
                ) : null}
              </td>
              <td className="px-curto py-compacto text-nanquim numeros">{dataPt(a.atualizadaEm)}</td>
              <td className="px-micro py-micro">
                <AcoesLinha a={a} arquivadas={arquivadas} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="flex flex-col lg:hidden">
        {analises.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-base traco-base py-curto">
            <div className="flex min-w-0 flex-col gap-micro">
              <Link to={destino(a)} className="rounded-controle text-acao text-nanquim underline-offset-4 hover:underline">
                {a.nome}
              </Link>
              <p className="text-legenda text-grafite">{`${objetivo(a)}. ${cat.estrutura.profundidades[a.profundidade].rotulo}`}</p>
              <p className="text-compacto text-nanquim numeros">{veredito(a)}</p>
              <p className="text-legenda text-grafite numeros">{t('ui.painel.atualizadaEm', { data: dataPt(a.atualizadaEm) })}</p>
            </div>
            <AcoesLinha a={a} arquivadas={arquivadas} />
          </li>
        ))}
      </ul>
    </>
  );
}

function ComecarDireto({ horizontal = false }: { horizontal?: boolean }) {
  const t = useT();
  const cat = useCatalogo();
  return (
    <Projecao tipo={horizontal ? 'madeira' : 'zebra'} lado={horizontal ? 'direita' : 'esquerda'} className={horizontal ? '' : 'fixo-ao-rolar'}>
    <aside aria-labelledby="comecar-direto" className={horizontal ? 'grid gap-base borda bg-folha p-medio md:grid-cols-2 xl:grid-cols-4' : 'flex flex-col gap-base borda bg-folha p-medio'}>
      <div className="flex flex-col gap-micro">
        <h2 id="comecar-direto" className="text-secao text-nanquim">
          {t('ui.painel.comecarDireto')}
        </h2>
        <p className="text-compacto text-grafite">{t('ui.painel.comecarDireto.explica')}</p>
      </div>
      <ul className={horizontal ? 'contents' : 'flex flex-col gap-compacto'}>
        {NIVEIS.map((p) => {
          const def = cat.estrutura.profundidades[p];
          return (
            <li key={p}>
              <Link
                to="/analises/nova"
                search={{ profundidade: p }}
                className="flex flex-col gap-compacto borda bg-folha px-base py-curto aperta hover:bg-sinal hover:text-sobre-sinal"
              >
                <span className="flex items-baseline justify-between gap-compacto">
                  <span className="text-subtitulo text-nanquim">{def.rotulo}</span>
                  <span className="text-dado text-grafite numeros">{def.minutosRotulo}</span>
                </span>
                <FaixaMinutos profundidade={p} destaque={def.recomendado} />
              </Link>
            </li>
          );
        })}
      </ul>
      <Link to="/metodo" className="text-acao text-nanquim underline underline-offset-4">
        {t('ui.painel.metodo')}
      </Link>
    </aside>
    </Projecao>
  );
}

function PrimeiroUso() {
  const t = useT();
  return (
    <div className="flex flex-col gap-amplo">
      <div className="flex max-w-texto flex-col gap-curto">
        <p className="text-veredito text-nanquim">{t('ui.painel.vazio')}</p>
        <p className="text-corpo text-grafite">{t('ui.painel.vazio.explica')}</p>
      </div>
      <div className="flex flex-col gap-base">
        <h2 className="text-subtitulo text-nanquim">{t('ui.painel.etapas')}</h2>
        <ol className="grid gap-base md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex gap-curto traco-topo pt-curto">
              <span aria-hidden className="text-numero text-marca numeros">
                {n}
              </span>
              <span className="flex flex-col gap-micro">
                <span className="text-subtitulo text-nanquim">{t(`entrada.como.${n}.titulo`)}</span>
                <span className="text-compacto text-grafite">{t(`entrada.como.${n}.texto`)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function PaginaPainel() {
  const t = useT();
  const [arquivadas, setArquivadas] = useState(false);
  const consulta = useQuery({
    queryKey: ['analises', arquivadas],
    queryFn: () => api<{ analises: Linha[]; calibracaoVigente: string }>(`/analises${arquivadas ? '?arquivadas=1' : ''}`),
  });
  const lista = consulta.data?.analises ?? [];
  const vazioPrimeiroUso = consulta.data && !lista.length && !arquivadas;
  return (
    <div className="min-h-dvh">
      <BarraSuperior />
      <main className="mx-auto flex w-full max-w-pagina flex-col gap-amplo px-base py-amplo md:px-amplo md:py-secao">
        <header className="flex flex-wrap items-end justify-between gap-base">
          <div className="flex flex-col gap-compacto">
            <h1 className="text-titulo">{arquivadas ? t('ui.painel.arquivadas') : t('ui.painel.titulo')}</h1>
            <p className="text-corpo text-grafite">{t('ui.painel.subtitulo')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-compacto">
            <Botao variante="discreto" onClick={() => setArquivadas((v) => !v)}>
              {arquivadas ? t('ui.painel.verAtivas') : t('ui.painel.verArquivadas')}
            </Botao>
            <Botao variante="carimbo" comoFilho>
              <Link to="/analises/nova">{t('ui.painel.nova')}</Link>
            </Botao>
          </div>
        </header>
        <div className={vazioPrimeiroUso ? 'grade-tarefa' : 'flex flex-col gap-amplo'}>
          <div className="folha overflow-x-auto">
            {consulta.isError ? (
              <ErroCarga mensagem={t('ui.painel.erro')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void consulta.refetch()} />
            ) : !consulta.data ? (
              <EsqueletoTabela linhas={4} colunas={5} rotulo={t('ui.carregando.analises')} />
            ) : vazioPrimeiroUso ? (
              <PrimeiroUso />
            ) : !lista.length ? (
              <p className="text-corpo text-grafite">{t('ui.painel.semArquivadas')}</p>
            ) : (
              <Tabela analises={lista} arquivadas={arquivadas} calibracaoVigente={consulta.data.calibracaoVigente} />
            )}
          </div>
          <ComecarDireto horizontal={!vazioPrimeiroUso} />
        </div>
      </main>
    </div>
  );
}
