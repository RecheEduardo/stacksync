// T-09 Resultado: entender o veredito e o porquê, e levar um plano. A folha do laudo contém só o
// oficial, na ordem do brief; o raciocínio guiado fica abaixo, fora da folha (A Regra da Folha Oficial).
// Camadas por nível (PRODUCT.md): o Rápido mostra frase, faixa, motivos, direções e forma; o
// Equilibrado acrescenta tecnologias e o mapa; o Avançado, passos, saúde, robustez e portões.
import type { DocumentoVeredito } from '@stacksync/engine/tipos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { api } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import type { LinkLeitura, Raciocinio } from '../../lib/tipos.ts';
import { RaciocinioGuiado } from '../../components/laudo/ia.tsx';
import { CabecalhoLaudo, ListaRazoes, PlanoIdeal } from '../../components/laudo/laudo.tsx';
import { MapaAjuste } from '../../components/laudo/diagrama.tsx';
import { ListaSaude, Obrigacoes } from '../../components/laudo/status.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Aviso, ErroCarga, Recolhivel, Secao } from '../../components/ui/estado.tsx';
import { EsqueletoLaudo } from '../../components/ui/esqueleto.tsx';
import { useAnalise } from '../casca/analise.tsx';
import { BlocoIdeia, CabecaVeredito, ListaSimples, PerguntasDecidiriam, ReguasOU, useEMax } from './veredito.tsx';

export interface VereditoCompleto {
  id: string;
  criadoEm: string;
  ehOMaisRecente: boolean;
  analise: { id: string; nome: string; subnivel: DocumentoVeredito['subnivel']; profundidade: DocumentoVeredito['profundidade'] };
  documento: DocumentoVeredito;
  raciocinio: Raciocinio | null;
  links: LinkLeitura[];
}

export function useVeredito(vid: string) {
  return useQuery({ queryKey: ['veredito', vid], queryFn: () => api<VereditoCompleto>(`/vereditos/${vid}`) });
}

/** Quantos blocos o raciocínio guiado deve trazer, para reservar o espaço (DESIGN.md, carregamento). */
export function alvosEsperados(doc: DocumentoVeredito): number {
  const cat = doc.ajuste.categoria;
  const fora = doc.eixos.filter((e) => e.avaliado && e.lado !== 'dentro').length;
  const base = cat === 'ajustado' || cat === 'indefinido' || cat === 'inconclusivo' ? 1 : Math.min(4, fora);
  const portoes = doc.ideia ? doc.ideia.portoes.filter((g) => g.estado !== 'nao_avaliado').length : 0;
  return base + portoes + (cat === 'ajustado' ? 0 : 1);
}

export function PaginaResultado() {
  const t = useT();
  const cat = useCatalogo();
  const eMax = useEMax();
  const { id, vid } = useParams({ strict: false }) as { id: string; vid: string };
  const navegar = useNavigate();
  const qc = useQueryClient();
  const dados = useAnalise(id).data!;
  const consulta = useVeredito(vid);
  const novo = useMutation({
    mutationFn: () => api<{ id: string }>(`/analises/${id}/vereditos`, { metodo: 'POST' }),
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ['analise', id] });
      void navegar({ to: '/analises/$id/resultado/$vid', params: { id, vid: r.id } });
    },
  });

  if (consulta.isError)
    return (
      <main className="mx-auto w-full max-w-laudo px-base py-medio">
        <ErroCarga mensagem={t('ui.resultado.erroCarga')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void consulta.refetch()} />
      </main>
    );
  if (!consulta.data)
    return (
      <main className="mx-auto w-full max-w-laudo px-base py-medio">
        <EsqueletoLaudo rotulo={t('ui.carregando.resultado')} />
      </main>
    );

  const v = consulta.data;
  const doc = v.documento;
  const prof = doc.profundidade;
  const categoria = doc.ajuste.categoria;
  const ajustado = categoria === 'ajustado';
  const incerto = categoria === 'indefinido' || categoria === 'inconclusivo';
  const comMapa = prof !== 'rapido';
  const avancado = prof === 'avancado';
  const alteradoDepois = new Date(dados.analise.atualizadaEm).getTime() > new Date(v.criadoEm).getTime() + 1000;
  const ideiaSemConfirmar = dados.analise.temIdeia && !doc.ideia;
  const naoMudar = cat.estrutura.subniveis[doc.subnivel].naoMudar;

  return (
    <main className="mx-auto flex w-full max-w-laudo flex-col gap-amplo px-base py-medio md:px-amplo md:py-amplo">
      <article aria-label={t('ui.resultado.titulo')} className="folha flex flex-col">
        <div className="flex flex-col gap-amplo">
          <div className="flex flex-wrap items-start justify-between gap-base">
            <CabecalhoLaudo nome={v.analise.nome} subnivel={v.analise.subnivel} profundidade={v.analise.profundidade} doc={doc} />
          </div>
          {!v.ehOMaisRecente ? <Aviso>{t('ui.resultado.naoMaisRecente')}</Aviso> : null}
          {v.ehOMaisRecente && alteradoDepois ? (
            <div className="flex flex-wrap items-center gap-compacto">
              <Aviso regra="RN-81">{t('ui.resultado.alteradoDepois')}</Aviso>
              <Botao variante="secundario" onClick={() => novo.mutate()} disabled={novo.isPending}>
                {t('ui.resultado.gerarNovo')}
              </Botao>
            </div>
          ) : null}
          <CabecaVeredito doc={doc} />
        </div>

        {incerto && doc.perguntasDeMaiorValor.length ? (
          <Secao titulo={t('ui.resultado.decidiriam')} id="decidiriam">
            <p className="max-w-texto text-compacto text-grafite">{t('ui.resultado.decidiriam.explica')}</p>
            <PerguntasDecidiriam doc={doc} analiseId={id} acao />
          </Secao>
        ) : null}

        {doc.ideia ? (
          <Secao titulo={t('ui.resultado.ideia')} id="ideia">
            <BlocoIdeia doc={doc} comPortoes={avancado} />
          </Secao>
        ) : ideiaSemConfirmar ? (
          <Secao titulo={t('ui.resultado.ideia')} id="ideia">
            <Aviso>
              {t('ui.resultado.ideiaSemConfirmar')}{' '}
              <Link to="/analises/$id/revisao" params={{ id }} className="text-acao underline underline-offset-4">
                {t('ui.resultado.irRevisao')}
              </Link>
            </Aviso>
          </Secao>
        ) : null}

        {doc.razoes.length ? (
          <Secao titulo={t('ui.resultado.motivos')} id="motivos">
            <ListaRazoes razoes={doc.razoes} />
          </Secao>
        ) : null}

        <Secao titulo={t('ui.resultado.plano')} id="plano">
          <PlanoIdeal plano={doc.plano} naoMudar={naoMudar} />
        </Secao>

        {comMapa ? (
          <Secao titulo={t('ui.resultado.mapa')} id="mapa">
            <p className="max-w-texto text-compacto text-grafite">{t('ui.resultado.mapa.explica')}</p>
            <MapaAjuste eixos={doc.eixos} eMax={eMax} />
            {!ajustado ? <ReguasOU doc={doc} /> : null}
            {doc.quantitativo ? <p className="max-w-texto text-compacto text-nanquim">{doc.quantitativo}</p> : null}
          </Secao>
        ) : null}

        {avancado && doc.saude.length ? (
          <Secao titulo={t('ui.resultado.saude')} id="saude">
            <ListaSaude indicadores={doc.saude} compacta={ajustado} />
          </Secao>
        ) : null}

        {doc.obrigacoes.length ? (
          <Secao titulo={t('ui.resultado.obrigacoes')} id="obrigacoes">
            <Obrigacoes obrigacoes={doc.obrigacoes} asOf={doc.asOf} />
          </Secao>
        ) : null}

        {avancado && doc.robustez ? (
          <Secao titulo={t('ui.resultado.robustez')} id="robustez">
            <p className="max-w-texto text-corpo text-nanquim">{doc.robustez.texto}</p>
          </Secao>
        ) : null}

        {!incerto && doc.perguntasDeMaiorValor.length ? (
          <Secao titulo={t('ui.resultado.decidiriam')} id="decidiriam">
            <PerguntasDecidiriam doc={doc} analiseId={id} acao />
          </Secao>
        ) : null}

        {doc.alteracoesAposVeredito.length ? (
          <Secao titulo={t('ui.resultado.alteracoes')} id="alteracoes">
            <ListaSimples itens={doc.alteracoesAposVeredito} />
          </Secao>
        ) : null}

        <div className="flex flex-col gap-compacto pt-secao">
          {doc.oQueMudaria.length ? (
            <Recolhivel titulo={t('ui.resultado.oQueMudaria')} contagem={doc.oQueMudaria.length}>
              <ListaSimples itens={doc.oQueMudaria} />
            </Recolhivel>
          ) : null}
          {doc.consideradoEDescartado.length ? (
            <Recolhivel titulo={t('ui.resultado.descartado')} contagem={doc.consideradoEDescartado.length}>
              <ListaSimples itens={doc.consideradoEDescartado} />
            </Recolhivel>
          ) : null}
          {doc.inferencias.length ? (
            <Recolhivel titulo={t('ui.resultado.inferencias')} contagem={doc.inferencias.length}>
              <ListaSimples itens={doc.inferencias.map((x) => x.texto)} />
            </Recolhivel>
          ) : null}
        </div>

        <footer className="flex flex-col gap-base pt-secao">
          <p className="max-w-texto text-compacto text-grafite">{t('ui.resultado.decisaoSua')}</p>
          <div className="nao-imprimir flex flex-wrap items-center gap-compacto">
            <Botao variante="primario" comoFilho>
              <Link to="/analises/$id/relatorio/$vid" params={{ id, vid }}>
                {t('ui.resultado.exportar')}
              </Link>
            </Botao>
            <Link to="/analises/$id/perguntas" params={{ id }} className="rounded-controle px-compacto text-acao text-nanquim underline-offset-4 hover:underline">
              {t('ui.resultado.voltarPerguntas')}
            </Link>
          </div>
        </footer>
      </article>

      <RaciocinioGuiado vereditoId={vid} guardado={v.raciocinio} alvosEsperados={alvosEsperados(doc)} />
    </main>
  );
}
