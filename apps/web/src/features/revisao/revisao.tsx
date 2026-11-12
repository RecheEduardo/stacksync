// T-08 Revisão antes do veredito: conferir a base antes de gerar. Composição das respostas, a leitura
// da ideia prévia para confirmar (RN-79), lacunas que podem mudar o resultado e "Gerar veredito",
// sempre habilitado (RN-78). Nenhuma prévia do resultado aqui.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useId, useRef, useState } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { useEu } from '../../lib/sessao.ts';
import type { DetalheAnalise, Revisao, VisaoIdeia } from '../../lib/tipos.ts';
import { Composicao } from '../../components/laudo/certeza.tsx';
import { PropostaIa } from '../../components/laudo/ia.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Selecao } from '../../components/ui/campo.tsx';
import { GrupoOpcoes, Opcao, OpcaoCaixa } from '../../components/ui/escolha.tsx';
import { Aviso, ErroCarga, Secao } from '../../components/ui/estado.tsx';
import { EsqueletoRevisao, EsqueletoTexto } from '../../components/ui/esqueleto.tsx';
import { useAnalise } from '../casca/analise.tsx';

type Escolha = Record<string, string | null>;

function AjusteIdeia({ ideia, ferramenta, categoria, aoSalvar, ocupado }: { ideia: VisaoIdeia; ferramenta: boolean; categoria: string | null; aoSalvar: (m: Array<{ id: string; parametro: string | null }>) => void; ocupado: boolean }) {
  const t = useT();
  const cat = useCatalogo();
  const inicial: Escolha = Object.fromEntries((ideia.movimentos ?? ideia.proposta?.movimentos ?? []).map((m) => [m.id, m.parametro]));
  const [escolha, setEscolha] = useState<Escolha>(inicial);
  const tecnologias = cat.tecnologias.filter((x) => !categoria || x.categorias.includes(categoria));
  const lista = Object.entries(escolha).map(([id, parametro]) => ({ id, parametro }));
  const faltaParametro = lista.some((m) => ideia.catalogo.find((c) => c.id === m.id)?.parametro && !m.parametro);
  const idGrupo = useId();
  return (
    <div className="flex flex-col gap-base">
      <p className="text-compacto text-nanquim">{ferramenta ? t('ui.revisao.ideia.ajustarUm') : t('ui.revisao.ideia.ajustarVarios')}</p>
      {ferramenta ? (
        <GrupoOpcoes value={lista[0]?.id ?? ''} onValueChange={(v) => setEscolha({ [v]: null })} aria-labelledby={idGrupo} className="flex flex-col gap-compacto">
          {ideia.catalogo.map((m) => (
            <Opcao key={m.id} value={m.id} detalhe={m.descricao}>
              {m.nome}
            </Opcao>
          ))}
        </GrupoOpcoes>
      ) : (
        <div className="flex flex-col gap-compacto">
          {ideia.catalogo.map((m) => (
            <OpcaoCaixa
              key={m.id}
              detalhe={m.descricao}
              checked={m.id in escolha}
              onCheckedChange={(v) =>
                setEscolha((e) => {
                  const n = { ...e };
                  if (v === true) n[m.id] = null;
                  else delete n[m.id];
                  return n;
                })
              }
            >
              {m.nome}
            </OpcaoCaixa>
          ))}
        </div>
      )}
      {lista
        .filter((m) => ideia.catalogo.find((c) => c.id === m.id)?.parametro)
        .map((m) => (
          <Selecao key={m.id} rotulo={t('ui.revisao.ideia.tecnologia')} value={m.parametro ?? ''} onChange={(e) => setEscolha((x) => ({ ...x, [m.id]: e.target.value || null }))}>
            <option value="">{t('ui.revisao.ideia.escolhaTecnologia')}</option>
            {tecnologias.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nome}
              </option>
            ))}
          </Selecao>
        ))}
      <div>
        <Botao variante="secundario" disabled={!lista.length || faltaParametro || ocupado} onClick={() => aoSalvar(lista)}>
          {t('ui.revisao.ideia.usarAjuste')}
        </Botao>
      </div>
    </div>
  );
}

function LeituraIdeia({ analiseId, ideia, dados }: { analiseId: string; ideia: VisaoIdeia; dados: DetalheAnalise }) {
  const t = useT();
  const cat = useCatalogo();
  const eu = useEu();
  const qc = useQueryClient();
  const [ajustando, setAjustando] = useState(false);
  const pedido = useRef(false);
  const ferramenta = cat.estrutura.subniveis[dados.analise.subnivel].modelo === 'ferramenta';
  const categoria = (dados.respostas.find((r) => r.pergunta === 'T-01')?.resposta.valor as string | null) ?? null;
  const atualizar = (r: { ideia: VisaoIdeia }) => {
    qc.setQueryData<Revisao>(['revisao', analiseId], (d) => (d ? { ...d, ideia: r.ideia } : d));
    void qc.invalidateQueries({ queryKey: ['analise', analiseId] });
  };
  const interpretar = useMutation({ mutationFn: () => api<{ ideia: VisaoIdeia }>(`/analises/${analiseId}/ideia/interpretacao`, { metodo: 'POST' }), onSuccess: atualizar });
  const decidir = useMutation({
    mutationFn: (corpo: { movimentos: Array<{ id: string; parametro: string | null }>; decisao: 'confirmada' | 'ajustada' | 'descartada' }) =>
      api<{ ideia: VisaoIdeia }>(`/analises/${analiseId}/ideia/decisao`, { metodo: 'POST', corpo, salvamento: true }),
    onSuccess: (r) => {
      setAjustando(false);
      atualizar(r);
    },
  });
  // A leitura da ideia é pedida uma vez, ao abrir a revisão sem leitura anterior.
  useEffect(() => {
    if (!ideia.proposta && !ideia.decisao && !pedido.current) {
      pedido.current = true;
      interpretar.mutate();
    }
  }, [ideia.proposta, ideia.decisao, interpretar]);

  const p = ideia.proposta;
  const decidida = ideia.decisao === 'confirmada' || ideia.decisao === 'ajustada';
  return (
    <Secao titulo={t('ui.revisao.ideia')} id="ideia">
      <blockquote className="max-w-texto text-corpo text-nanquim">“{ideia.texto}”</blockquote>
      {interpretar.isPending ? <EsqueletoTexto linhas={3} rotulo={t('ui.revisao.ideia.lendo')} /> : null}
      {decidida && !ajustando ? (
        <div className="flex flex-col gap-compacto">
          <p className="text-compacto text-nanquim">{t('ui.revisao.ideia.confirmada')}</p>
          <ul className="flex list-disc flex-col gap-micro pl-medio marker:text-grafite-claro">
            {(ideia.movimentos ?? []).map((m) => (
              <li key={m.id} className="text-compacto text-nanquim">
                {m.parametroNome ? `${m.nome}: ${m.parametroNome}` : m.nome}
              </li>
            ))}
          </ul>
          <div>
            <Botao variante="discreto" onClick={() => setAjustando(true)}>
              {t('ui.proposta.ajustar')}
            </Botao>
          </div>
        </div>
      ) : ideia.decisao === 'descartada' && !ajustando ? (
        <div className="flex flex-col gap-compacto">
          <Aviso>{t('ui.revisao.ideia.descartada')}</Aviso>
          <div>
            <Botao variante="discreto" onClick={() => setAjustando(true)}>
              {t('ui.proposta.ajustar')}
            </Botao>
          </div>
        </div>
      ) : p && !ajustando ? (
        <PropostaIa
          titulo={t('ui.revisao.ideia.proposta')}
          provedor={p.provedor ?? eu.data?.ia?.provedor ?? null}
          modelo={p.modelo ?? eu.data?.ia?.modelo ?? null}
          ocupado={decidir.isPending}
          aoConfirmar={p.movimentos.length ? () => decidir.mutate({ movimentos: p.movimentos.map((m) => ({ id: m.id, parametro: m.parametro })), decisao: 'confirmada' }) : undefined}
          aoAjustar={() => setAjustando(true)}
          aoDescartar={() => decidir.mutate({ movimentos: [], decisao: 'descartada' })}
        >
          {p.falha ? <p className="max-w-texto text-compacto text-nanquim">{t('ui.revisao.ideia.falha', { motivo: p.falha })}</p> : null}
          {p.movimentos.length ? (
            <ul className="flex list-disc flex-col gap-micro pl-medio marker:text-grafite-claro">
              {p.movimentos.map((m) => (
                <li key={m.id} className="text-corpo text-nanquim">
                  {m.parametroNome ? `${m.nome}: ${m.parametroNome}` : m.nome}
                </li>
              ))}
            </ul>
          ) : !p.falha ? (
            <p className="text-compacto text-nanquim">{t('ui.revisao.ideia.nenhumMovimento')}</p>
          ) : null}
          {p.explicacao ? <p className="max-w-texto text-compacto text-grafite">{p.explicacao}</p> : null}
          {p.foraDoCatalogo.length ? (
            <div className="flex flex-col gap-micro">
              <p className="text-rotulo text-nanquim">{t('ui.revisao.ideia.foraDoCatalogo')}</p>
              <ul className="flex flex-col gap-micro">
                {p.foraDoCatalogo.map((x) => (
                  <li key={x} className="text-compacto text-grafite">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </PropostaIa>
      ) : null}
      {ajustando ? (
        <AjusteIdeia
          ideia={ideia}
          ferramenta={ferramenta}
          categoria={categoria}
          ocupado={decidir.isPending}
          aoSalvar={(movimentos) => decidir.mutate({ movimentos, decisao: 'ajustada' })}
        />
      ) : null}
      {!decidida ? <p className="max-w-texto text-legenda text-grafite">{t('ui.revisao.ideia.semConfirmar')}</p> : null}
      {decidir.isError ? <p className="text-compacto text-critico">{ehErroApi(decidir.error) ? decidir.error.message : t('ui.erroSalvar')}</p> : null}
    </Secao>
  );
}

export function PaginaRevisao() {
  const t = useT();
  const { id } = useParams({ strict: false }) as { id: string };
  const navegar = useNavigate();
  const qc = useQueryClient();
  const dados = useAnalise(id).data!;
  const revisao = useQuery({ queryKey: ['revisao', id], queryFn: () => api<Revisao>(`/analises/${id}/revisao`) });
  const gerar = useMutation({
    mutationFn: () => api<{ id: string; novo: boolean }>(`/analises/${id}/vereditos`, { metodo: 'POST' }),
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ['analise', id] });
      void navegar({ to: '/analises/$id/resultado/$vid', params: { id, vid: r.id } });
    },
  });
  const r = revisao.data;
  const podem = r?.desconhecidas.filter((d) => d.podeMudar) ?? [];
  const ficam = r?.desconhecidas.filter((d) => !d.podeMudar) ?? [];
  return (
    <main className="mx-auto w-full max-w-laudo px-base py-medio">
      <div className="folha flex flex-col">
        <header className="flex flex-col gap-curto">
          <h1 className="text-titulo">{t('ui.revisao.titulo')}</h1>
          <p className="max-w-texto text-corpo text-grafite">{t('ui.revisao.explica')}</p>
        </header>
        {revisao.isError ? (
          <ErroCarga mensagem={t('ui.revisao.erroCarga')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void revisao.refetch()} />
        ) : !r ? (
          <EsqueletoRevisao rotulo={t('ui.carregando.revisao')} />
        ) : (
          <>
            <Secao titulo={t('ui.revisao.composicao')} id="composicao">
              <Composicao contagens={r.composicao} />
              <p className="text-compacto text-grafite numeros">{t('ui.revisao.respondidas', { n: r.respondidas })}</p>
            </Secao>

            {r.ideia ? <LeituraIdeia analiseId={id} ideia={r.ideia} dados={dados} /> : null}

            {r.interpretacoesPendentes.length ? (
              <Secao titulo={t('ui.revisao.pendentes')} id="pendentes">
                <ul className="flex flex-col gap-compacto">
                  {r.interpretacoesPendentes.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-compacto">
                      <span className="text-compacto text-nanquim">“{p.texto}”</span>
                      <Link to="/analises/$id/perguntas" params={{ id }} search={{ pergunta: p.pergunta }} className="text-acao text-nanquim underline-offset-4 hover:underline">
                        {t('ui.revisao.decidir')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Secao>
            ) : null}

            <Secao titulo={t('ui.revisao.podemMudar')} id="podem">
              {podem.length ? (
                <ul className="flex flex-col">
                  {podem.map((d) => (
                    <li key={d.pergunta} className="flex flex-col gap-micro traco-base py-curto first:pt-0 last:border-b-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-compacto">
                        <span className="max-w-texto text-compacto text-nanquim">{d.texto}</span>
                        <Link to="/analises/$id/perguntas" params={{ id }} search={{ pergunta: d.pergunta }} className="text-acao text-nanquim underline-offset-4 hover:underline">
                          {d.respondida ? t('ui.revisao.responderDeNovo') : t('ui.revisao.responder')}
                        </Link>
                      </div>
                      {d.comoDescobrir ? <p className="max-w-texto text-legenda text-grafite">{t('ui.revisao.comoDescobrir', { texto: d.comoDescobrir })}</p> : null}
                      {d.quemPodeSaber ? <p className="text-legenda text-grafite">{t('ui.revisao.quemPodeSaber', { texto: d.quemPodeSaber })}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-compacto text-grafite">{t('ui.revisao.nenhumaMuda')}</p>
              )}
            </Secao>

            {ficam.length ? (
              <Secao titulo={t('ui.revisao.podePular')} id="ficam">
                <ul className="flex flex-col gap-compacto">
                  {ficam.map((d) => (
                    <li key={d.pergunta} className="flex flex-wrap items-baseline justify-between gap-compacto">
                      <span className="max-w-texto text-compacto text-grafite">{d.texto}</span>
                      <Link to="/analises/$id/perguntas" params={{ id }} search={{ pergunta: d.pergunta }} className="text-acao text-nanquim underline-offset-4 hover:underline">
                        {t('ui.revisao.responder')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Secao>
            ) : null}

            {r.fatoresDescobertos.length ? (
              <Secao titulo={t('ui.revisao.fatores')} id="fatores">
                <p className="max-w-texto text-compacto text-grafite">{t('ui.revisao.fatores.explica')}</p>
                <ul className="flex list-disc flex-col gap-micro pl-medio marker:text-grafite-claro">
                  {r.fatoresDescobertos.map((f) => (
                    <li key={f} className="text-compacto text-nanquim">
                      {f}
                    </li>
                  ))}
                </ul>
              </Secao>
            ) : null}

            <div className="flex flex-col gap-compacto pt-secao">
              <div className="flex flex-wrap items-center gap-compacto">
                <Botao variante="primario" onClick={() => gerar.mutate()} disabled={gerar.isPending}>
                  {t('ui.revisao.gerar')}
                </Botao>
                <Link to="/analises/$id/perguntas" params={{ id }} className="rounded-controle px-compacto text-acao text-nanquim underline-offset-4 hover:underline">
                  {t('ui.revisao.voltar')}
                </Link>
              </div>
              <p className="max-w-texto text-legenda text-grafite">{t('ui.revisao.depois')}</p>
              {gerar.isError ? <p className="text-compacto text-critico">{ehErroApi(gerar.error) ? gerar.error.message : t('ui.erroSalvar')}</p> : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
