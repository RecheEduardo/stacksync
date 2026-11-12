// Casca de uma análise: trilho de 240px na mesa com as etapas e o progresso por tempo e por âmbito,
// nunca "passo 7 de 30" nem pista de veredito (RN-81). Abaixo de 1024px, o trilho vira um seletor no topo.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Outlet, useParams, useRouterState } from '@tanstack/react-router';
import { Check, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useContagem } from '../../components/ui/contador.tsx';
import { api } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import type { DetalheAnalise, Profundidade } from '../../lib/tipos.ts';
import { ErroCarga } from '../../components/ui/estado.tsx';
import { EsqueletoLaudo, EsqueletoPergunta, EsqueletoRevisao, EsqueletoTrilho, FaixaCarregando } from '../../components/ui/esqueleto.tsx';
import { useMidia } from '../../lib/tela.ts';
import { Balao } from '../../components/ui/sobreposicao.tsx';
import { BarraSuperior } from './casca.tsx';

export function useAnalise(id: string) {
  return useQuery({ queryKey: ['analise', id], queryFn: () => api<DetalheAnalise>(`/analises/${id}`) });
}

function TrocarProfundidade({ id, atual }: { id: string; atual: Profundidade }) {
  const t = useT();
  const cat = useCatalogo();
  const qc = useQueryClient();
  const trocar = useMutation({
    mutationFn: (profundidade: Profundidade) => api(`/analises/${id}`, { metodo: 'PATCH', corpo: { profundidade }, salvamento: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['analise', id] }),
  });
  return (
    <Balao
      rotulo={t('ui.trilho.trocarNivel')}
      gatilho={
        <button type="button" className="rounded-controle px-compacto text-rotulo text-nanquim underline decoration-2 underline-offset-4 hover:bg-realce">
          {t('ui.trilho.trocarNivel')}
        </button>
      }
    >
      <p className="text-compacto text-grafite">{t('ui.trilho.trocarNivel.explica')}</p>
      <ul className="flex flex-col gap-micro">
        {(['rapido', 'equilibrado', 'avancado'] as const).map((p) => (
          <li key={p}>
            <button
              type="button"
              aria-pressed={p === atual}
              disabled={p === atual || trocar.isPending}
              onClick={() => trocar.mutate(p)}
              className="flex w-full flex-col items-start rounded-controle borda-fina px-compacto py-compacto text-left hover:bg-campo aria-pressed:bg-sinal aria-pressed:text-sobre-sinal"
            >
              <span className="text-acao text-nanquim">{cat.estrutura.profundidades[p].rotulo}</span>
              <span className="text-codigo">{cat.estrutura.profundidades[p].minutosRotulo}</span>
            </button>
          </li>
        ))}
      </ul>
    </Balao>
  );
}

function Etapas({ dados, compacto }: { dados: DetalheAnalise; compacto: boolean }) {
  const t = useT();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const id = dados.analise.id;
  const ultimo = dados.vereditos[0];
  const etapas = [
    { rotulo: t('ui.trilho.perguntas'), para: `/analises/${id}/perguntas`, ativo: caminho.endsWith('/perguntas') },
    { rotulo: t('ui.trilho.revisao'), para: `/analises/${id}/revisao`, ativo: caminho.endsWith('/revisao') },
    ...(ultimo
      ? [
          { rotulo: t('ui.trilho.resultado'), para: `/analises/${id}/resultado/${ultimo.id}`, ativo: caminho.includes('/resultado/') },
          { rotulo: t('ui.trilho.relatorio'), para: `/analises/${id}/relatorio/${ultimo.id}`, ativo: caminho.includes('/relatorio/') },
        ]
      : []),
  ];
  const classeItem = (ativo: boolean) =>
    `flex h-botao items-center rounded-controle borda px-curto text-acao aperta ${ativo ? 'bg-sinal text-sobre-sinal' : 'bg-folha text-nanquim hover:bg-campo'}`;
  if (compacto)
    return (
      <ul className="flex flex-wrap gap-curto">
        {etapas.map((e) => (
          <li key={e.para}>
            <Link to={e.para} aria-current={e.ativo ? 'page' : undefined} className={classeItem(e.ativo)}>
              {e.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    );
  return (
    <ul className="flex flex-col gap-curto">
      {etapas.map((e) => (
        <li key={e.para}>
          <Link to={e.para} aria-current={e.ativo ? 'page' : undefined} className={classeItem(e.ativo)}>
            {e.rotulo}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Índice "Nesta página" do resultado e do relatório: os títulos de seção com id, na ordem do laudo (T-09). */
function NestaPagina() {
  const t = useT();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const [secoes, setSecoes] = useState<Array<{ id: string; texto: string }>>([]);
  useEffect(() => {
    const ler = () => {
      const lista = Array.from(document.querySelectorAll<HTMLElement>('main h2[id]')).map((h) => ({ id: h.id, texto: h.textContent ?? '' }));
      setSecoes((atual) => (atual.length === lista.length && atual.every((a, i) => a.id === lista[i]!.id && a.texto === lista[i]!.texto) ? atual : lista));
    };
    ler();
    const observador = new MutationObserver(ler);
    observador.observe(document.body, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, [caminho]);
  if (secoes.length < 3) return null;
  return (
    <div className="flex flex-col gap-compacto">
      <p className="text-rotulo text-grafite">{t('ui.trilho.nestaPagina')}</p>
      <ul className="flex flex-col traco-topo">
        {secoes.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="flex min-h-botao items-center traco-base px-compacto text-compacto font-medium text-nanquim hover:bg-sinal hover:text-sobre-sinal">
              {s.texto}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Progresso({ dados }: { dados: DetalheAnalise }) {
  const t = useT();
  const p = dados.progresso;
  const cobertos = p.ambitos.filter((a) => a.coberto).length;
  const cobertosAnimado = useContagem(cobertos);
  const minutos = useContagem(Math.max(1, p.minutosRestantes));
  return (
    <div className="flex flex-col gap-curto">
      <p className="text-subtitulo text-nanquim numeros">{p.concluido ? t('ui.trilho.concluido') : t('ui.pergunta.tempoRestante', { minutos })}</p>
      <div aria-hidden className="flex gap-micro">
        {p.ambitos.map((a) => (
          <span key={a.id} className={`h-curto flex-1 borda-fina ${a.coberto ? 'bg-nanquim' : 'bg-folha'}`} />
        ))}
      </div>
      <p className="text-dado text-nanquim">{t('ui.trilho.ambitosCobertos', { n: cobertosAnimado, total: p.ambitos.length })}</p>
      <ul className="flex flex-col gap-micro">
        {p.ambitos.map((a) => (
          <li key={a.id} className="flex items-center gap-compacto text-compacto text-nanquim">
            {a.coberto ? <Check aria-hidden className="size-icone text-nanquim" strokeWidth={3} /> : <Square aria-hidden className="size-icone text-grafite-claro" strokeWidth={2} />}
            <span className={a.coberto ? 'text-nanquim' : 'text-grafite'}>{a.rotulo}</span>
            <span className="sr-only">{a.coberto ? t('ui.trilho.coberto') : t('ui.trilho.naoCoberto')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Enquanto a análise carrega, a etapa aparece em esqueleto com a forma dela: pergunta, revisão ou laudo. */
function EtapaCarregando() {
  const t = useT();
  const caminho = useRouterState({ select: (s) => s.location.pathname });
  const largo = useMidia('(min-width: 1280px)');
  if (/\/perguntas$/.test(caminho))
    return (
      <main className="mx-auto w-full max-w-tabela px-base py-medio md:px-amplo md:py-amplo">
        <FaixaCarregando />
        <div className="folha">
          <EsqueletoPergunta largo={largo} rotulo={t('ui.carregando.analise')} />
        </div>
      </main>
    );
  if (/\/revisao$/.test(caminho))
    return (
      <main className="mx-auto w-full max-w-laudo px-base py-medio">
        <div className="folha">
          <EsqueletoRevisao rotulo={t('ui.carregando.revisao')} />
        </div>
      </main>
    );
  return (
    <main className="mx-auto w-full max-w-laudo px-base py-medio">
      <EsqueletoLaudo rotulo={t(/\/relatorio\//.test(caminho) ? 'ui.carregando.relatorio' : 'ui.carregando.resultado')} />
    </main>
  );
}

export function CascaAnalise() {
  const t = useT();
  const cat = useCatalogo();
  const { id } = useParams({ strict: false }) as { id: string };
  const consulta = useAnalise(id);
  const dados = consulta.data;
  const sub = dados ? cat.estrutura.subniveis[dados.analise.subnivel] : null;
  return (
    <div className="min-h-dvh">
      <BarraSuperior titulo={dados?.analise.nome ?? null} carregando={!dados && !consulta.isError} />
      <div className="grade-analise">
        <aside aria-label={t('ui.trilho.rotulo')} className="nao-imprimir hidden traco-direita bg-folha lg:block">
          {dados && sub ? (
            <nav className="sticky top-barra flex altura-trilho flex-col gap-amplo overflow-y-auto px-base py-medio">
              <div className="flex flex-col gap-compacto">
                <p className="text-rotulo text-grafite">{t('ui.trilho.enquadramento')}</p>
                <p className="text-subtitulo uppercase text-nanquim">{`${t(`ui.enquadramento.${sub.ramo}`)}, ${sub.rotulo.toLowerCase()}`}</p>
                <div className="flex flex-wrap items-center gap-compacto">
                  <span className="borda-fina bg-sinal px-compacto py-micro text-rotulo text-sobre-sinal">{cat.estrutura.profundidades[dados.analise.profundidade].rotulo}</span>
                  <TrocarProfundidade id={id} atual={dados.analise.profundidade} />
                </div>
              </div>
              <Etapas dados={dados} compacto={false} />
              <NestaPagina />
              <Progresso dados={dados} />
            </nav>
          ) : !consulta.isError ? (
            <EsqueletoTrilho rotulo={t('ui.carregando.analise')} />
          ) : null}
        </aside>
        <div className="flex min-w-0 flex-col">
          {dados ? (
            <nav aria-label={t('ui.trilho.rotulo')} className="nao-imprimir flex flex-col gap-compacto px-base pt-base lg:hidden">
              <Etapas dados={dados} compacto />
            </nav>
          ) : null}
          {consulta.isError ? (
            <main className="mx-auto w-full max-w-leitura p-medio">
              <ErroCarga mensagem={t('ui.analise.erroCarga')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void consulta.refetch()} />
            </main>
          ) : dados ? (
            <Outlet />
          ) : (
            <EtapaCarregando />
          )}
        </div>
      </div>
    </div>
  );
}
