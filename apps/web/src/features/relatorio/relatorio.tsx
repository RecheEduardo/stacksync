// T-18 Relatório para liderança e /r/:token (modo Read). Página principal com o veredito em uma
// frase, até três razões, o índice com faixa e confiança, a ideia prévia, o plano, o que mudaria e a
// composição; apêndice com mapa, saúde e portões; o raciocínio da IA num capítulo próprio, rotulado,
// depois de tudo (RF-53). Nunca omite incerteza nem alterações após o veredito (IV-14).
import type { DocumentoVeredito } from '@stacksync/engine/tipos';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Check, Copy, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { dataPt } from '../../lib/formato.ts';
import type { LinkLeitura, Raciocinio } from '../../lib/tipos.ts';
import { Composicao } from '../../components/laudo/certeza.tsx';
import { MapaAjuste } from '../../components/laudo/diagrama.tsx';
import { RaciocinioEstatico } from '../../components/laudo/ia.tsx';
import { CabecalhoLaudo, ListaRazoes, PlanoIdeal } from '../../components/laudo/laudo.tsx';
import { ListaPortoes, ListaSaude, Obrigacoes } from '../../components/laudo/status.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { ErroCarga, Secao } from '../../components/ui/estado.tsx';
import { EsqueletoLaudo } from '../../components/ui/esqueleto.tsx';
import { BOTAO_CABECALHO, ProjecaoClara } from '../../components/ui/cabecalho.tsx';
import { Assinatura } from '../../components/ui/marca.tsx';
import { BlocoIdeia, CabecaVeredito, ListaSimples, PerguntasDecidiriam, ReguasOU, useEMax } from '../resultado/veredito.tsx';
import { useVeredito } from '../resultado/resultado.tsx';

interface DadosRelatorio {
  nome: string;
  subnivel: DocumentoVeredito['subnivel'];
  profundidade: DocumentoVeredito['profundidade'];
  criadoEm: string;
  documento: DocumentoVeredito;
  raciocinio: Raciocinio | null;
}

export function CorpoRelatorio({ r }: { r: DadosRelatorio }) {
  const t = useT();
  const cat = useCatalogo();
  const rodape = t('ui.relatorio.rodape', { nome: r.nome, data: dataPt(r.documento.asOf), calibracao: r.documento.versoes.calibracao });
  // Rodapé da impressão numa caixa de margem da página (@page), sem sobrepor o conteúdo (DESIGN.md, Impressão).
  useEffect(() => {
    document.documentElement.style.setProperty('--rodape-relatorio', JSON.stringify(rodape));
    return () => {
      document.documentElement.style.removeProperty('--rodape-relatorio');
    };
  }, [rodape]);
  const eMax = useEMax();
  const doc = r.documento;
  const sub = cat.estrutura.subniveis[doc.subnivel];
  const pronto = r.raciocinio && r.raciocinio.status === 'pronto' ? r.raciocinio : null;
  return (
    <>
      <article aria-label={t('ui.relatorio.titulo')} className="folha flex flex-col">
        <div className="flex flex-col gap-amplo">
          <CabecalhoLaudo nome={r.nome} subnivel={r.subnivel} profundidade={r.profundidade} doc={doc} />
          <CabecaVeredito doc={doc} />
        </div>
        {doc.razoes.length ? (
          <Secao titulo={t('ui.resultado.motivos')} id="r-motivos">
            <ListaRazoes razoes={doc.razoes} />
          </Secao>
        ) : null}
        {doc.ideia ? (
          <Secao titulo={t('ui.resultado.ideia')} id="r-ideia">
            <BlocoIdeia doc={doc} comPortoes={false} />
          </Secao>
        ) : null}
        <Secao titulo={t('ui.resultado.plano')} id="r-plano">
          <PlanoIdeal plano={doc.plano} naoMudar={sub.naoMudar} />
        </Secao>
        {doc.obrigacoes.length ? (
          <Secao titulo={t('ui.resultado.obrigacoes')} id="r-obrigacoes">
            <Obrigacoes obrigacoes={doc.obrigacoes} asOf={doc.asOf} />
          </Secao>
        ) : null}
        {doc.oQueMudaria.length ? (
          <Secao titulo={t('ui.resultado.oQueMudaria')} id="r-mudaria">
            <ListaSimples itens={doc.oQueMudaria} />
          </Secao>
        ) : null}
        {doc.perguntasDeMaiorValor.length ? (
          <Secao titulo={t('ui.resultado.decidiriam')} id="r-decidiriam">
            <PerguntasDecidiriam doc={doc} />
          </Secao>
        ) : null}
        <Secao titulo={t('ui.relatorio.composicao')} id="r-composicao">
          <Composicao contagens={doc.composicao} />
          {doc.inferencias.length ? <ListaSimples itens={doc.inferencias.map((x) => x.texto)} /> : null}
        </Secao>
        {doc.alteracoesAposVeredito.length ? (
          <Secao titulo={t('ui.resultado.alteracoes')} id="r-alteracoes">
            <ListaSimples itens={doc.alteracoesAposVeredito} />
          </Secao>
        ) : null}

        <section aria-labelledby="r-apendice" className="quebra-antes flex flex-col gap-base pt-secao">
          <h2 id="r-apendice" className="text-secao">
            {t('ui.relatorio.apendice')}
          </h2>
          <div className="flex flex-col gap-base">
            <h3 className="text-acao text-nanquim">{t('ui.resultado.mapa')}</h3>
            <MapaAjuste eixos={doc.eixos} eMax={eMax} />
            <ReguasOU doc={doc} />
            {doc.quantitativo ? <p className="max-w-texto text-compacto text-nanquim">{doc.quantitativo}</p> : null}
          </div>
          {doc.saude.length ? (
            <div className="flex flex-col gap-base pt-medio">
              <h3 className="text-acao text-nanquim">{t('ui.resultado.saude')}</h3>
              <ListaSaude indicadores={doc.saude} />
            </div>
          ) : null}
          {doc.ideia?.portoes.length ? (
            <div className="flex flex-col gap-base pt-medio">
              <h3 className="text-acao text-nanquim">{t('ui.ideia.portoes')}</h3>
              <ListaPortoes portoes={doc.ideia.portoes} />
            </div>
          ) : null}
          {doc.robustez ? <p className="max-w-texto pt-medio text-compacto text-nanquim">{doc.robustez.texto}</p> : null}
          {doc.consideradoEDescartado.length ? (
            <div className="flex flex-col gap-base pt-medio">
              <h3 className="text-acao text-nanquim">{t('ui.resultado.descartado')}</h3>
              <ListaSimples itens={doc.consideradoEDescartado} />
            </div>
          ) : null}
        </section>

        <footer className="flex flex-col gap-compacto pt-secao">
          <p className="max-w-texto text-compacto text-grafite">{t('ui.relatorio.responsabilidade')}</p>
          <p className="text-legenda text-grafite-claro numeros">
            {t('ui.relatorio.versoes', {
              motor: doc.versoes.motor,
              catalogo: doc.versoes.catalogo,
              calibracao: doc.versoes.calibracao,
              base: doc.versoes.baseTecnologias,
              data: dataPt(doc.asOf),
              hash: doc.hashEntradas.slice(7, 19),
            })}
          </p>
        </footer>
      </article>
      {pronto ? (
        <div className="quebra-antes">
          <RaciocinioEstatico raciocinio={pronto} />
        </div>
      ) : null}
    </>
  );
}

function Compartilhar({ vid, links }: { vid: string; links: LinkLeitura[] }) {
  const t = useT();
  const qc = useQueryClient();
  const [novo, setNovo] = useState<{ url: string; expiraEm: string | null } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const criar = useMutation({
    mutationFn: () => api<{ id: string; token: string; expiraEm: string | null }>(`/vereditos/${vid}/links`, { metodo: 'POST', corpo: { dias: 30 } }),
    onSuccess: (r) => {
      setNovo({ url: `${window.location.origin}/r/${r.token}`, expiraEm: r.expiraEm });
      setCopiado(false);
      void qc.invalidateQueries({ queryKey: ['veredito', vid] });
    },
  });
  const revogar = useMutation({
    mutationFn: (id: string) => api(`/links/${id}`, { metodo: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['veredito', vid] }),
  });
  const ativos = links.filter((l) => !l.revogadoEm && (!l.expiraEm || new Date(l.expiraEm).getTime() > Date.now()));
  return (
    <section aria-labelledby="compartilhar" className="nao-imprimir folha flex flex-col gap-base">
      <h2 id="compartilhar" className="text-secao">
        {t('ui.relatorio.compartilhar')}
      </h2>
      <p className="max-w-texto text-compacto text-grafite">{t('ui.relatorio.compartilhar.explica')}</p>
      <div className="flex flex-wrap gap-compacto">
        <Botao variante="primario" onClick={() => window.print()}>
          {t('ui.relatorio.imprimir')}
        </Botao>
        <Botao variante="secundario" comoFilho>
          <a href={`/api/v1/vereditos/${vid}/relatorio.md`} download>
            {t('ui.relatorio.markdown')}
          </a>
        </Botao>
        <Botao variante="secundario" onClick={() => criar.mutate()} disabled={criar.isPending}>
          {t('ui.relatorio.link')}
        </Botao>
      </div>
      {criar.isError ? <p className="text-compacto text-critico">{ehErroApi(criar.error) ? criar.error.message : t('ui.erroSalvar')}</p> : null}
      {novo ? (
        <div className="flex flex-col gap-compacto rounded-controle bg-campo p-curto">
          <p className="text-compacto text-nanquim">{t('ui.relatorio.linkCriado', { data: dataPt(novo.expiraEm) })}</p>
          <div className="flex flex-col gap-compacto md:flex-row md:items-center">
            <code className="min-w-0 flex-1 break-all text-compacto text-nanquim">{novo.url}</code>
            <Botao
              variante="secundario"
              onClick={() =>
                void navigator.clipboard.writeText(novo.url).then(
                  () => setCopiado(true),
                  () => setCopiado(false),
                )
              }
            >
              {copiado ? <Check aria-hidden className="size-icone" strokeWidth={1.5} /> : <Copy aria-hidden className="size-icone" strokeWidth={1.5} />}
              {copiado ? t('ui.relatorio.copiado') : t('ui.relatorio.copiar')}
            </Botao>
          </div>
          <p className="text-legenda text-grafite">{t('ui.relatorio.linkUmaVez')}</p>
        </div>
      ) : null}
      {ativos.length ? (
        <ul className="flex flex-col">
          {ativos.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-compacto traco-base py-compacto last:border-b-0">
              <span className="text-compacto text-nanquim numeros">
                {t('ui.relatorio.linkAtivo', { criado: dataPt(l.criadoEm), expira: dataPt(l.expiraEm), acessos: l.acessos })}
              </span>
              <Botao variante="discreto" onClick={() => revogar.mutate(l.id)} disabled={revogar.isPending}>
                {t('ui.relatorio.revogar')}
              </Botao>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function PaginaRelatorio() {
  const t = useT();
  const { vid } = useParams({ strict: false }) as { vid: string };
  const consulta = useVeredito(vid);
  if (consulta.isError)
    return (
      <main className="mx-auto w-full max-w-laudo px-base py-medio">
        <ErroCarga mensagem={t('ui.resultado.erroCarga')} rotuloTentar={t('ui.resultado.tentarDeNovo')} aoTentar={() => void consulta.refetch()} />
      </main>
    );
  if (!consulta.data)
    return (
      <main className="mx-auto w-full max-w-laudo px-base py-medio">
        <EsqueletoLaudo rotulo={t('ui.carregando.relatorio')} />
      </main>
    );
  const v = consulta.data;
  return (
    <main className="mx-auto flex w-full max-w-laudo flex-col gap-amplo px-base py-medio">
      <Compartilhar vid={vid} links={v.links} />
      <CorpoRelatorio r={{ nome: v.analise.nome, subnivel: v.analise.subnivel, profundidade: v.analise.profundidade, criadoEm: v.criadoEm, documento: v.documento, raciocinio: v.raciocinio }} />
    </main>
  );
}

interface RespostaPublica {
  criadoEm: string;
  analise: { nome: string; subnivel: DocumentoVeredito['subnivel']; profundidade: DocumentoVeredito['profundidade'] };
  documento: DocumentoVeredito;
  raciocinio: Raciocinio | null;
}

/** Leitura pública por link: só leitura, sem sessão; a única ação é imprimir. */
export function PaginaRelatorioPublico() {
  const t = useT();
  const { token } = useParams({ strict: false }) as { token: string };
  const consulta = useQuery({ queryKey: ['publico', token], queryFn: () => api<RespostaPublica>(`/publico/${token}`), retry: false });
  return (
    <div className="min-h-dvh">
      <header className="nao-imprimir grade-barra h-barra border-b-4 border-sinal bg-cabecalho px-base text-sobre-cabecalho md:px-medio">
        <p className="min-w-0 truncate text-dado text-sobre-cabecalho">{consulta.data?.analise.nome ?? ''}</p>
        <Assinatura nome={t('ui.produto')} />
        <div className="flex justify-end">
          {consulta.data ? (
            // Só ícone no celular: o texto continua como nome acessível (sem rolagem horizontal a 320px).
            <ProjecaoClara>
              <button type="button" onClick={() => window.print()} className={BOTAO_CABECALHO}>
                <Printer aria-hidden className="size-icone" />
                <span className="sr-only md:not-sr-only">{t('ui.relatorio.imprimir')}</span>
              </button>
            </ProjecaoClara>
          ) : null}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-laudo flex-col gap-amplo px-base py-medio">
        {consulta.isError ? (
          <div className="folha flex flex-col gap-curto">
            <h1 className="text-titulo">{t('ui.publico.indisponivel')}</h1>
            <p className="max-w-texto text-corpo text-grafite">{t('ui.publico.indisponivel.explica')}</p>
          </div>
        ) : !consulta.data ? (
          <EsqueletoLaudo rotulo={t('ui.carregando.relatorio')} />
        ) : (
          <>
            <p className="nao-imprimir text-compacto text-grafite">{t('ui.publico.aviso')}</p>
            <CorpoRelatorio
              r={{
                nome: consulta.data.analise.nome,
                subnivel: consulta.data.analise.subnivel,
                profundidade: consulta.data.analise.profundidade,
                criadoEm: consulta.data.criadoEm,
                documento: consulta.data.documento,
                raciocinio: consulta.data.raciocinio,
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
