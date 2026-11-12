// Partes da folha oficial do laudo: cabeçalho (carimbo feito com componentes comuns), motivos com
// evidência, plano ideal em camadas e a tabela comparativa de tecnologias. Só o que o motor calcula
// e os modelos de texto oficiais escrevem (A Regra da Folha Oficial).
import type { DecisaoTecnologica, DocumentoVeredito, LinhaTecnologia, Plano, Razao } from '@stacksync/engine/tipos';
import type { ReactNode } from 'react';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { comSinal, dataPt } from '../../lib/formato.ts';
import type { Profundidade, Subnivel } from '../../lib/tipos.ts';
import { Dica } from '../ui/sobreposicao.tsx';
import { Composicao } from './certeza.tsx';
import { EscalaIndice, useTextoFaixa } from './escala.tsx';

export function CabecalhoLaudo({
  nome,
  subnivel,
  profundidade,
  doc,
}: {
  nome: string;
  subnivel: Subnivel;
  profundidade: Profundidade;
  doc: DocumentoVeredito;
}) {
  const t = useT();
  const cat = useCatalogo();
  const sub = cat.estrutura.subniveis[subnivel];
  const itens: Array<[string, ReactNode]> = [
    [t('ui.laudo.sistema'), <span className="break-words">{nome}</span>],
    [t('ui.laudo.objetivo'), `${t(`ui.enquadramento.${sub.ramo}`)}, ${sub.rotulo.toLowerCase()}`],
    [t('ui.laudo.profundidade'), cat.estrutura.profundidades[profundidade].rotulo],
    [t('ui.laudo.dataReferencia'), <span className="numeros">{dataPt(doc.asOf)}</span>],
    [t('ui.laudo.calibracao'), <span className="numeros">{t('ui.laudo.calibracaoValor', { versao: doc.versoes.calibracao })}</span>],
  ];
  return (
    <dl className="grid gap-x-medio gap-y-curto traco-base pb-medio md:grid-cols-2 xl:grid-cols-5">
      {itens.map(([rotulo, valor]) => (
        <div key={rotulo} className="flex min-w-0 flex-col gap-micro">
          <dt className="text-rotulo text-grafite">{rotulo}</dt>
          <dd className="text-compacto font-medium text-nanquim">{valor}</dd>
        </div>
      ))}
      <div className="flex min-w-0 flex-col gap-micro md:col-span-2 xl:col-span-5">
        <dt className="text-rotulo text-grafite">{t('ui.laudo.composicao')}</dt>
        <dd>
          <Composicao contagens={doc.composicao} />
        </dd>
      </div>
    </dl>
  );
}

/** Rótulo curto de uma citação: autores e ano para evidências, o próprio identificador para regras. */
export function Citacao({ id }: { id: string }) {
  const t = useT();
  const cat = useCatalogo();
  const ev = cat.evidencias.find((e) => e.id === id);
  const regra = cat.regras.find((r) => r.id === id);
  if (!ev && !regra) return <span className="text-legenda text-grafite-claro">{id}</span>;
  const rotulo = ev ? t('ui.citacao', { autores: ev.autores, ano: String(ev.ano) }) : id;
  const detalhe = ev ? `${ev.titulo}. ${ev.achado}` : regra!.resumo;
  return (
    <Dica conteudo={detalhe}>
      <button type="button" className="rounded-controle text-legenda text-grafite underline decoration-dotted underline-offset-4">
        {rotulo}
        <span className="sr-only">: {detalhe}</span>
      </button>
    </Dica>
  );
}

export function ListaRazoes({ razoes }: { razoes: Razao[] }) {
  return (
    <ol className="flex flex-col gap-curto">
      {razoes.slice(0, 3).map((r, i) => (
        <li key={i} className="grade-numerada gap-x-curto">
          <span className="text-dado numeros text-grafite">{i + 1}</span>
          <div className="flex flex-col gap-micro">
            <p className="max-w-texto text-corpo text-nanquim">{r.texto}</p>
            {r.evidencias.length || r.regras.length ? (
              <p className="flex flex-wrap gap-x-curto gap-y-micro">
                {[...r.evidencias, ...r.regras].map((id) => (
                  <Citacao key={id} id={id} />
                ))}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

const CRITERIOS = ['indice', 'complexidade', 'simplicidade', 'popularidade', 'ecossistema', 'licenca', 'fimSuporte', 'cadeiaSuprimentos'] as const;

function ValorCriterio({ linha, criterio }: { linha: LinhaTecnologia; criterio: (typeof CRITERIOS)[number] }) {
  const t = useT();
  const faixa = useTextoFaixa();
  switch (criterio) {
    case 'indice':
      return <span className="numeros">{faixa(linha.indice)}</span>;
    case 'popularidade':
      return linha.popularidade ? (
        <span className="flex flex-col gap-micro">
          <span className="numeros">{t('ui.tecnologias.popularidadeValor', { pct: linha.popularidade.percentual })}</span>
          <span className="text-legenda text-grafite-claro">{t('ui.tecnologias.fonteData', { fonte: linha.popularidade.levantamento, data: dataPt(linha.popularidade.consultadoEm) })}</span>
        </span>
      ) : (
        <span className="text-grafite">{t('ui.tecnologias.semPopularidade')}</span>
      );
    case 'licenca':
      return (
        <span className="flex flex-col gap-micro">
          <span>{linha.licenca.nome}</span>
          {linha.licenca.mudancas.map((m) => (
            <span key={m} className="text-legenda text-grafite">
              {m}
            </span>
          ))}
          <span className="text-legenda text-grafite-claro">{t('ui.tecnologias.consultadoEm', { data: dataPt(linha.licenca.consultadoEm) })}</span>
        </span>
      );
    case 'fimSuporte':
      return (
        <span className="flex flex-col gap-micro">
          <span>{linha.fimSuporte.texto}</span>
          {linha.fimSuporte.fonte ? (
            <span className="text-legenda text-grafite-claro">{t('ui.tecnologias.fonteData', { fonte: linha.fimSuporte.fonte, data: dataPt(linha.fimSuporte.consultadoEm) })}</span>
          ) : null}
        </span>
      );
    default:
      return <span>{linha[criterio]}</span>;
  }
}

/** Tecnologias sempre em comparação: a escolhida e as concorrentes avaliadas, com critérios e fontes. */
export function TabelaTecnologias({ decisao }: { decisao: DecisaoTecnologica }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-curto">
      <div className="flex flex-col gap-micro">
        <h4 className="text-acao text-nanquim">{decisao.nome}</h4>
        <p className="max-w-texto text-compacto text-grafite">{decisao.motivo}</p>
      </div>
      {/* Até 768px, cada tecnologia vira um bloco empilhado com rótulo e valor. */}
      <div role="region" tabIndex={0} aria-label={t('ui.tecnologias.legenda', { decisao: decisao.nome })} className="hidden overflow-x-auto rounded-controle md:block">
        <table className="w-full border-collapse text-compacto">
          <caption className="sr-only">{t('ui.tecnologias.legenda', { decisao: decisao.nome })}</caption>
          <thead>
            <tr className="traco-base">
              <th scope="col" className="py-compacto pr-curto text-left text-rotulo text-grafite">
                {t('ui.tecnologias.criterio')}
              </th>
              {decisao.linhas.map((l) => (
                <th key={l.id} scope="col" className={`py-compacto pr-curto text-left text-rotulo ${l.escolhida ? 'font-semibold text-nanquim' : 'text-nanquim'}`}>
                  {l.nome}
                  {l.escolhida ? <span className="block text-legenda font-normal text-grafite">{t('ui.tecnologias.escolhida')}</span> : null}
                  {l.atual ? <span className="block text-legenda font-normal text-grafite">{t('ui.tecnologias.atual')}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CRITERIOS.map((c) => (
              <tr key={c} className="traco-base align-top last:border-b-0">
                <th scope="row" className="py-compacto pr-curto text-left text-rotulo font-medium text-grafite">
                  {t(`ui.tecnologias.c.${c}`)}
                </th>
                {decisao.linhas.map((l) => (
                  <td key={l.id} className={`py-compacto pr-curto text-nanquim ${l.escolhida ? 'font-medium' : ''}`}>
                    <ValorCriterio linha={l} criterio={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-base md:hidden">
        {decisao.linhas.map((l) => (
          <li key={l.id} className="flex flex-col gap-compacto traco-topo pt-curto">
            <p className={`text-acao ${l.escolhida ? 'font-semibold' : ''}`}>
              {l.nome}
              {l.escolhida ? <span className="ml-compacto text-legenda font-normal text-grafite">{t('ui.tecnologias.escolhida')}</span> : null}
            </p>
            <dl className="flex flex-col gap-compacto">
              {CRITERIOS.map((c) => (
                <div key={c} className="flex flex-col">
                  <dt className="text-legenda text-grafite">{t(`ui.tecnologias.c.${c}`)}</dt>
                  <dd className="text-compacto text-nanquim">
                    <ValorCriterio linha={l} criterio={c} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Plano ideal nas camadas do nível (PRODUCT.md): direções e forma; tecnologias no Equilibrado; passos no Avançado. */
export function PlanoIdeal({ plano, naoMudar }: { plano: Plano; naoMudar: string }) {
  const t = useT();
  const faixa = useTextoFaixa();
  const curto = plano.variante === 'nao_mexa' || plano.variante === 'conviver';
  return (
    <div className="flex flex-col gap-medio">
      <p className="max-w-texto borda bg-campo p-base text-subtitulo text-nanquim">{plano.frase}</p>
      {plano.indice && !curto ? (
        <div className="flex flex-col gap-compacto">
          <EscalaIndice faixa={plano.indice} rotulo={t('ui.plano.indiceAria', { faixa: faixa(plano.indice) })} />
          <p className="text-dado numeros text-nanquim">{t('ui.plano.indice', { faixa: faixa(plano.indice) })}</p>
          {plano.contraBase ? (
            <p className="text-compacto numeros text-nanquim">
              {t('ui.plano.contraBase', {
                base: naoMudar,
                valor: comSinal(plano.contraBase.pt, 0),
                de: comSinal(plano.contraBase.lo, 0),
                ate: comSinal(plano.contraBase.hi, 0),
              })}
            </p>
          ) : null}
        </div>
      ) : null}
      {plano.direcoes.length && plano.camadas.includes('direcoes') ? (
        <Camada titulo={t('ui.plano.direcoes')}>
          <ul className="flex list-disc flex-col gap-compacto pl-medio marker:text-grafite-claro">
            {plano.direcoes.map((d) => (
              <li key={d.texto} className="max-w-texto text-corpo text-nanquim">
                {d.texto}
              </li>
            ))}
          </ul>
        </Camada>
      ) : null}
      {plano.forma.length && plano.camadas.includes('forma') ? (
        <Camada titulo={t('ui.plano.forma')}>
          <dl className="flex flex-col gap-compacto">
            {plano.forma.map((f) => {
              const [eixo, ...resto] = f.split(': ');
              return (
                <div key={f} className="grade-definicao gap-x-curto">
                  <dt className="text-rotulo text-grafite">{resto.length ? eixo : ''}</dt>
                  <dd className="text-compacto text-nanquim">{resto.length ? resto.join(': ') : f}</dd>
                </div>
              );
            })}
          </dl>
        </Camada>
      ) : null}
      {plano.tecnologias.length && plano.camadas.includes('tecnologias') ? (
        <Camada titulo={t('ui.plano.tecnologias')}>
          <div className="flex flex-col gap-medio">
            {plano.tecnologias.map((d) => (
              <TabelaTecnologias key={d.id} decisao={d} />
            ))}
          </div>
        </Camada>
      ) : null}
      {plano.passos.length && plano.camadas.includes('passos') ? (
        <Camada titulo={t('ui.plano.passos')}>
          <ol className="flex flex-col gap-curto">
            {plano.passos.map((p) => (
              <li key={p.ordem} className="grade-numerada gap-x-curto sem-quebra">
                <span className="text-dado numeros text-grafite">{p.ordem}</span>
                <div className="flex flex-col gap-micro">
                  <p className="text-corpo font-medium text-nanquim">{p.titulo}</p>
                  <p className="max-w-texto text-compacto text-nanquim">{p.tecnica}</p>
                  <p className="max-w-texto text-compacto text-grafite">{t('ui.plano.pontoDeVolta', { texto: p.pontoDeVolta })}</p>
                  <p className="text-legenda text-grafite">{t('ui.plano.custo', { nivel: t(`ui.plano.custo.${p.custo.nivel}`), motivos: p.custo.motivos.join('; ') })}</p>
                  {p.seRespostaErrada ? <p className="max-w-texto text-legenda text-grafite">{p.seRespostaErrada}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </Camada>
      ) : null}
      {plano.custoTransicao && !curto ? (
        <p className="max-w-texto text-compacto text-nanquim">
          {t('ui.plano.custoTransicao', { nivel: t(`ui.plano.custo.${plano.custoTransicao.nivel}`), motivos: plano.custoTransicao.motivos.join('; ') })}
        </p>
      ) : null}
      {plano.deixariaDeBastar.length ? (
        <Camada titulo={t('ui.plano.deixariaDeBastar')}>
          <ul className="flex list-disc flex-col gap-compacto pl-medio marker:text-grafite-claro">
            {plano.deixariaDeBastar.map((d) => (
              <li key={d} className="max-w-texto text-compacto text-nanquim">
                {d}
              </li>
            ))}
          </ul>
        </Camada>
      ) : null}
    </div>
  );
}

function Camada({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-curto">
      <h3 className="text-acao text-nanquim">{titulo}</h3>
      {children}
    </div>
  );
}
