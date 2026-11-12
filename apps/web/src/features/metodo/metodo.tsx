// T-03 Como o StackSync decide (modo Read): entender o método antes de confiar. Gerado do pacote de
// conteúdo vigente (RF-45): eixos, tolerâncias, pesos, faixas, materialidade, portões e calibração.
// Linha de no máximo 68 caracteres; sem seções de efeito nem ícones em caixinhas.
import type { EixoDoc } from '@stacksync/engine/tipos';
import { Link } from '@tanstack/react-router';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { dataPt, num } from '../../lib/formato.ts';
import { DiagramaTolerancia, leituraEixo } from '../../components/laudo/diagrama.tsx';
import { EscalaIndice } from '../../components/laudo/escala.tsx';
import { Recolhivel, Secao } from '../../components/ui/estado.tsx';
import { BarraSuperior } from '../casca/casca.tsx';

function Paragrafos({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('\n').filter(Boolean).map((p) => (
        <p key={p} className="max-w-texto text-corpo text-nanquim">
          {p}
        </p>
      ))}
    </>
  );
}

export function PaginaMetodo() {
  const t = useT();
  const cat = useCatalogo();
  const cal = cat.calibracao;
  const tolE2 = cal.tolerancias.E2 ?? { sobra: 0.5, falta: 0.5 };
  // Exemplo ilustrativo de um eixo com sobra, rotulado como tal (DESIGN.md, dados de exemplo).
  const exemplo: EixoDoc = {
    id: 'E2',
    nome: cat.eixos.arquitetura.find((e) => e.id === 'E2')?.nome ?? 'Distribuição',
    peso: cal.pesos.E2 ?? 5,
    avaliado: true,
    temSinal: true,
    N: { lo: 0.5, hi: 1 },
    C: { lo: 2.6, hi: 3.3 },
    desvio: { lo: 1.6, hi: 2.8 },
    desvioPonto: 2.2,
    lado: 'sobra',
    cruzaTolerancia: false,
    saturado: false,
    tolerancia: tolE2,
    contribuicao: { lo: 0, hi: 0 },
    sinaisN: [],
    sinaisC: [],
    guardas: [],
    ancoraN: null,
    ancoraC: null,
    verificacao: null,
  };
  const leitura = leituraEixo(t, exemplo);
  const portoes = ['P1', 'P2', 'P3', 'P4', 'P5'] as const;
  return (
    <div className="min-h-dvh">
      <BarraSuperior />
      <main className="mx-auto w-full max-w-laudo px-base py-amplo">
        <article className="folha flex flex-col">
          <header className="flex flex-col gap-curto">
            <h1 className="text-titulo">{t('ui.metodo.titulo')}</h1>
            <p className="max-w-texto text-corpo text-grafite">{t('ui.metodo.resumo')}</p>
          </header>

          <Secao titulo={t('ui.metodo.ajuste.titulo')} id="m-ajuste">
            <Paragrafos texto={t('ui.metodo.ajuste.texto')} />
            <figure className="flex flex-col gap-compacto">
              <DiagramaTolerancia eixo={exemplo} eMax={cal.eMax} altura={84} aria={leitura.aria} />
              <figcaption className="max-w-texto text-legenda text-grafite">{t('ui.metodo.ajuste.legenda', { valor: leitura.valor, faixa: leitura.faixa })}</figcaption>
            </figure>
          </Secao>

          <Secao titulo={t('ui.metodo.eixos.titulo')} id="m-eixos">
            <p className="max-w-texto text-corpo text-nanquim">{t('ui.metodo.eixos.texto')}</p>
            <table className="w-full border-collapse text-compacto">
              <caption className="sr-only">{t('ui.metodo.eixos.titulo')}</caption>
              <thead>
                <tr className="traco-base">
                  <th scope="col" className="py-compacto pr-curto text-left text-rotulo text-grafite">
                    {t('ui.metodo.eixos.eixo')}
                  </th>
                  <th scope="col" className="py-compacto pr-curto text-right text-rotulo text-grafite">
                    {t('ui.metodo.eixos.peso')}
                  </th>
                  <th scope="col" className="hidden py-compacto text-right text-rotulo text-grafite md:table-cell">
                    {t('ui.metodo.eixos.tolerancia')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cat.eixos.arquitetura.map((e) => (
                  <tr key={e.id} className="traco-base align-top last:border-b-0">
                    <th scope="row" className="py-compacto pr-curto text-left font-normal">
                      <span className="font-medium text-nanquim">{e.nome}</span>
                      <span className="block text-compacto text-grafite">{e.perguntaGuia}</span>
                    </th>
                    <td className="py-compacto pr-curto text-right text-dado numeros">{cal.pesos[e.id]}</td>
                    <td className="hidden py-compacto text-right text-dado numeros md:table-cell">
                      {t('ui.metodo.eixos.toleranciaValor', { falta: num(cal.tolerancias[e.id]?.falta ?? 0), sobra: num(cal.tolerancias[e.id]?.sobra ?? 0) })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="max-w-texto text-compacto text-grafite">{t('ui.metodo.eixos.ferramenta', { eixos: cat.eixos.ferramenta.map((e) => e.nome).join(', ') })}</p>
          </Secao>

          <Secao titulo={t('ui.metodo.indice.titulo')} id="m-indice">
            <Paragrafos texto={t('ui.metodo.indice.texto', { limiar: cal.limiarCategoria })} />
            <figure className="flex flex-col gap-compacto">
              <EscalaIndice faixa={{ lo: 58, hi: 76, pt: 67 }} rotulo={t('ui.metodo.indice.exemplo')} />
              <figcaption className="max-w-texto text-legenda text-grafite">{t('ui.metodo.indice.legenda', { limites: cal.faixasAderencia.join(', ') })}</figcaption>
            </figure>
            <ul className="flex flex-col gap-compacto">
              {['85', '70', '50', '30', '0'].map((f) => (
                <li key={f} className="max-w-texto text-compacto text-nanquim">
                  {t(`ui.metodo.faixa.${f}`)}
                </li>
              ))}
            </ul>
          </Secao>

          <Secao titulo={t('ui.metodo.onus.titulo')} id="m-onus">
            <Paragrafos texto={t('ui.metodo.onus.texto', { materialidade: cal.materialidade })} />
            <ol className="flex flex-col gap-compacto">
              {portoes.map((p) => (
                <li key={p} className="max-w-texto text-compacto text-nanquim">
                  <span className="font-medium">
                    <span className="numeros">{p}</span> {t(`portao.${p}`)}.
                  </span>{' '}
                  {t(`ui.metodo.portao.${p}`, { materialidade: cal.materialidade })}
                </li>
              ))}
            </ol>
          </Secao>

          <Secao titulo={t('ui.metodo.naoSei.titulo')} id="m-naosei">
            <Paragrafos texto={t('ui.metodo.naoSei.texto')} />
          </Secao>

          <Secao titulo={t('ui.metodo.ia.titulo')} id="m-ia">
            <Paragrafos texto={t('ui.metodo.ia.texto')} />
          </Secao>

          <Secao titulo={t('ui.metodo.calibracao.titulo')} id="m-calibracao">
            <p className="max-w-texto text-corpo text-nanquim">{t('ui.metodo.calibracao.texto', { versao: cal.versao, data: dataPt(cal.data) })}</p>
            <p className="max-w-texto text-compacto text-grafite">{cal.notas}</p>
          </Secao>

          <Secao titulo={t('ui.metodo.naoFaz.titulo')} id="m-naofaz">
            <Paragrafos texto={t('ui.metodo.naoFaz.texto')} />
          </Secao>

          <div className="pt-secao">
            <Recolhivel titulo={t('ui.metodo.fontes')} contagem={cat.evidencias.length}>
              <ul className="flex flex-col gap-curto">
                {cat.evidencias.map((e) => (
                  <li key={e.id} className="max-w-texto text-compacto text-grafite">
                    <span className="text-nanquim">{t('ui.citacao', { autores: e.autores, ano: String(e.ano) })}</span>. {e.titulo}. {e.achado}
                    {e.url ? (
                      <>
                        {' '}
                        <a href={e.url} target="_blank" rel="noreferrer noopener" className="text-nanquim underline underline-offset-4">
                          {t('ui.metodo.abrirFonte')}
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </Recolhivel>
          </div>
          <p className="pt-amplo text-compacto">
            <Link to="/analises" className="text-acao text-nanquim underline-offset-4 hover:underline">
              {t('ui.metodo.voltar')}
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
