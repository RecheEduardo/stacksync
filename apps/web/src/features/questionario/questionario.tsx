// T-04 Questionário adaptativo: uma pergunta em foco, as anteriores resumidas e editáveis acima,
// salvamento contínuo com conflito de versão (412) e o fluxo "não sei" ao lado (T-06).
// Nada de veredito aqui (IV-01): o progresso é por tempo e por âmbito, no trilho.
import { m } from 'motion/react';
import type { CorpoResposta } from '@stacksync/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { gravarPuladas, lerPuladas } from '../../lib/sessao.ts';
import { useMidia } from '../../lib/tela.ts';
import type { CartaoPergunta, DetalheAnalise, Profundidade, RespostaProxima, VisaoResposta } from '../../lib/tipos.ts';
import { Botao, SetaBotao } from '../../components/ui/botao.tsx';
import { Aviso, ErroCarga } from '../../components/ui/estado.tsx';
import { EsqueletoPergunta } from '../../components/ui/esqueleto.tsx';
import { Dialogo, FolhaModal } from '../../components/ui/sobreposicao.tsx';
import { useAnalise } from '../casca/analise.tsx';
import { RespostasAnteriores } from './anteriores.tsx';
import { Cartao } from './cartao.tsx';
import { PainelNaoSei } from './nao-sei.tsx';

const PROXIMO: Record<Profundidade, Profundidade | null> = { rapido: 'equilibrado', equilibrado: 'avancado', avancado: null };

function Concluido({ dados }: { dados: DetalheAnalise }) {
  const t = useT();
  const cat = useCatalogo();
  const qc = useQueryClient();
  const proximo = PROXIMO[dados.analise.profundidade];
  const aprofundar = useMutation({
    mutationFn: () => api(`/analises/${dados.analise.id}`, { metodo: 'PATCH', corpo: { profundidade: proximo }, salvamento: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['analise', dados.analise.id] }),
  });
  return (
    <div className="flex flex-col gap-base">
      <h2 className="text-pergunta text-nanquim">{t('ui.pergunta.fim', { nivel: cat.estrutura.profundidades[dados.analise.profundidade].rotulo })}</h2>
      <p className="max-w-texto text-corpo text-grafite">{t('ui.pergunta.fim.explica')}</p>
      <div className="flex flex-wrap gap-compacto">
        <Botao variante="placa" comoFilho>
          <Link to="/analises/$id/revisao" params={{ id: dados.analise.id }}>
            {t('ui.pergunta.irRevisao')}
            <SetaBotao />
          </Link>
        </Botao>
        {proximo ? (
          <Botao variante="placaClara" onClick={() => aprofundar.mutate()} disabled={aprofundar.isPending}>
            {t('ui.pergunta.aprofundar', { nivel: cat.estrutura.profundidades[proximo].rotulo })}
          </Botao>
        ) : null}
      </div>
      {proximo ? <p className="text-legenda text-grafite">{t('ui.enquadramento.trocarDepois')}</p> : null}
    </div>
  );
}

export function PaginaQuestionario() {
  const t = useT();
  const { id } = useParams({ strict: false }) as { id: string };
  const { pergunta: perguntaPedida } = useSearch({ strict: false }) as { pergunta?: string };
  const navegar = useNavigate();
  const qc = useQueryClient();
  const analise = useAnalise(id);
  const dados = analise.data!;
  const largo = useMidia('(min-width: 1024px)');
  const largoCartao = useMidia('(min-width: 1280px)');
  const [atual, setAtual] = useState<RespostaProxima | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [naoSei, setNaoSei] = useState(false);
  const [conflito, setConflito] = useState<{ corpo: CorpoResposta; pergunta: string; atual: VisaoResposta | null } | null>(null);

  const aplicarProgresso = useCallback(
    (r: RespostaProxima) => qc.setQueryData<DetalheAnalise>(['analise', id], (d) => (d ? { ...d, progresso: r.progresso } : d)),
    [qc, id],
  );

  const proxima = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setNaoSei(false);
    try {
      const r = await api<RespostaProxima>(`/analises/${id}/proxima`, { metodo: 'POST', corpo: { pular: lerPuladas(id) } });
      setAtual(r);
      aplicarProgresso(r);
    } catch (e) {
      // A pergunta anterior já foi respondida: sai da tela, e fica a explicação com "Tentar de novo".
      setAtual(null);
      setErro(ehErroApi(e) && e.status === 0 ? t('ui.semConexao') : ehErroApi(e, 429) ? [e.message, e.detalhe].filter(Boolean).join('. ') : t('ui.pergunta.erroCarga'));
    } finally {
      setCarregando(false);
    }
  }, [id, aplicarProgresso, t]);

  const abrir = useCallback(
    async (pid: string) => {
      setCarregando(true);
      setErro(null);
      setNaoSei(false);
      try {
        const r = await api<{ pergunta: CartaoPergunta }>(`/analises/${id}/perguntas/${pid}`);
        setAtual({ concluido: false, pergunta: r.pergunta, origem: null, aviso: null, progresso: dados.progresso });
        window.scrollTo({ top: 0 });
      } catch {
        setErro(t('ui.pergunta.erroCarga'));
      } finally {
        setCarregando(false);
      }
    },
    [id, dados.progresso, t],
  );

  // Vindo da revisão ou do resultado com uma pergunta escolhida, ela abre em foco; senão, o percurso decide.
  useEffect(() => {
    if (perguntaPedida) void abrir(perguntaPedida);
    else void proxima();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perguntaPedida, dados.analise.profundidade]);

  const pergunta = atual?.pergunta ?? null;

  const depoisDeResponder = useCallback(async () => {
    if (pergunta) gravarPuladas(id, lerPuladas(id).filter((p) => p !== pergunta.id));
    await qc.invalidateQueries({ queryKey: ['analise', id] });
    if (perguntaPedida) void navegar({ to: '/analises/$id/perguntas', params: { id }, search: {}, replace: true });
    else await proxima();
  }, [pergunta, id, qc, proxima, perguntaPedida, navegar]);

  const salvar = useMutation({
    mutationFn: ({ corpo, pid, versao }: { corpo: CorpoResposta; pid: string; versao: number }) =>
      api(`/analises/${id}/respostas/${pid}`, { metodo: 'PUT', corpo, versao, salvamento: true }),
    onSuccess: () => void depoisDeResponder(),
    onError: (e, vars) => {
      if (ehErroApi(e, 412)) setConflito({ corpo: vars.corpo, pergunta: vars.pid, atual: (e.corpo.atual as VisaoResposta | null) ?? null });
      else setErro(ehErroApi(e) ? [e.message, e.detalhe].filter(Boolean).join(' ') : t('ui.erroSalvar'));
    },
  });

  const aoSalvar = (corpo: CorpoResposta) => {
    if (!pergunta) return;
    salvar.mutate({ corpo, pid: pergunta.id, versao: pergunta.resposta?.versao ?? 0 });
  };

  const pular = () => {
    if (!pergunta) return;
    gravarPuladas(id, [...new Set([...lerPuladas(id), pergunta.id])]);
    void proxima();
  };

  const painel = pergunta ? (
    <PainelNaoSei analiseId={id} cartao={pergunta} salvando={salvar.isPending} aoUsar={aoSalvar} aoRespondidaPorTexto={() => void depoisDeResponder()} />
  ) : null;

  return (
    <main className="relative isolate w-full overflow-hidden">
      <div className={`relative mx-auto w-full px-base py-medio md:px-amplo md:py-amplo ${naoSei && largo ? 'grade-com-painel max-w-tabela' : 'max-w-tabela'}`}>
      <h1 className="sr-only">{t('ui.pergunta.titulo', { nome: dados.analise.nome })}</h1>
      <div className="flex min-w-0 flex-col">
      {/* Faixa de obra: o questionário está em obra (DV-37). Enquanto a próxima pergunta é escolhida, ela anda (DV-52). */}
      <div aria-hidden className={`zebrado h-zebrado borda border-b-0 ${carregando ? 'obra-andando' : ''}`} />
      <div className="folha flex min-w-0 flex-col gap-amplo">
        {dados.analise.primeiroVereditoEm ? <Aviso regra="RN-81">{t('ui.pergunta.aposVeredito')}</Aviso> : null}
        <RespostasAnteriores respostas={dados.respostas} aoAlterar={(pid) => void abrir(pid)} />
        <p className="text-compacto text-nanquim lg:hidden">
          {dados.progresso.concluido ? t('ui.trilho.concluido') : t('ui.pergunta.tempoRestante', { minutos: Math.max(1, dados.progresso.minutosRestantes) })}
        </p>
        <div aria-live="polite" className="flex flex-col gap-medio">
          {carregando ? (
            <EsqueletoPergunta largo={largoCartao && !(naoSei && largo)} rotulo={t('ui.pergunta.escolhendo')} />
          ) : erro && !atual ? (
            <ErroCarga mensagem={erro} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void proxima()} />
          ) : atual?.concluido ? (
            <Concluido dados={dados} />
          ) : pergunta ? (
            <>
              {erro ? (
                <p role="alert" className="text-compacto text-critico">
                  {erro}
                </p>
              ) : null}
              {/* Troca de pergunta: a próxima entra da direita (DESIGN.md v2.0, Motion). Só a entrada anima:
                  a anterior sai na hora, para nunca haver dois cartões ao mesmo tempo. */}
                <m.div
                  key={pergunta.id}
                  initial={{ opacity: 0, x: 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 44 }}
                >
                  <Cartao
                    key={`${pergunta.id}-${pergunta.resposta?.versao ?? 0}`}
                    analiseId={id}
                    profundidade={dados.analise.profundidade}
                    cartao={pergunta}
                    semContexto={naoSei && largo}
                    salvando={salvar.isPending}
                    aoSalvar={aoSalvar}
                    aoNaoSei={() => setNaoSei(true)}
                    aoPular={pular}
                    aoRespondidaPorTexto={() => void depoisDeResponder()}
                  />
                </m.div>
              <div className="flex flex-wrap items-center gap-compacto regua-topo pt-base">
                <Link to="/analises/$id/revisao" params={{ id }} className="rounded-controle px-compacto text-acao text-nanquim underline decoration-2 underline-offset-4 hover:bg-realce">
                  {t('ui.pergunta.irRevisao')}
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
      </div>

      {naoSei && pergunta && largo ? (
        <aside aria-labelledby="titulo-nao-sei" className="folha flex flex-col gap-base self-start flutua surge">
          <div className="flex items-start justify-between gap-base">
            <h2 id="titulo-nao-sei" className="text-secao">
              {t('ui.pergunta.naoSei')}
            </h2>
            <Botao variante="discreto" aria-label={t('ui.fechar')} onClick={() => setNaoSei(false)}>
              <X aria-hidden className="size-icone" strokeWidth={1.5} />
            </Botao>
          </div>
          {painel}
        </aside>
      ) : null}
      {pergunta && !largo ? (
        <FolhaModal aberto={naoSei} aoMudar={setNaoSei} titulo={t('ui.pergunta.naoSei')} rotuloFechar={t('ui.fechar')}>
          {painel}
        </FolhaModal>
      ) : null}

      <Dialogo aberto={!!conflito} aoMudar={(v) => !v && setConflito(null)} titulo={t('ui.conflito.titulo')} descricao={t('ui.conflito')} rotuloFechar={t('ui.fechar')}>
        {conflito ? (
          <div className="flex flex-col gap-base">
            <dl className="grid gap-base md:grid-cols-2">
              <div className="flex flex-col gap-micro">
                <dt className="text-legenda text-grafite">{t('ui.conflito.outraAba')}</dt>
                <dd className="text-compacto text-nanquim">{conflito.atual?.rotulo ?? '—'}</dd>
              </div>
              <div className="flex flex-col gap-micro">
                <dt className="text-legenda text-grafite">{t('ui.conflito.minha')}</dt>
                <dd className="text-compacto text-nanquim">{t('ui.conflito.minhaDescricao')}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap justify-end gap-compacto">
              <Botao
                variante="secundario"
                onClick={() => {
                  setConflito(null);
                  void abrir(conflito.pergunta);
                }}
              >
                {t('ui.conflito.usarOutra')}
              </Botao>
              <Botao
                variante="secundario"
                onClick={() => {
                  const c = conflito;
                  setConflito(null);
                  salvar.mutate({ corpo: c.corpo, pid: c.pergunta, versao: c.atual?.versao ?? 0 });
                }}
              >
                {t('ui.conflito.manterMinha')}
              </Botao>
            </div>
          </div>
        ) : null}
      </Dialogo>
      </div>
    </main>
  );
}
