// Blocos da folha do laudo compartilhados pelo resultado (T-09) e pelo relatório (T-18):
// a frase do veredito com o Índice de Ajuste em faixa, a avaliação da ideia prévia contra não mudar
// e as seções de incerteza. A frase vence o número; o número nunca aparece sem a faixa (IV-04).
import type { DocumentoVeredito } from '@stacksync/engine/tipos';
import { Link } from '@tanstack/react-router';
import { Projecao } from '../../components/ui/fundo.tsx';
import type { ReactNode } from 'react';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { comSinal } from '../../lib/formato.ts';
import { EscalaIndice, SeloConfianca, useTextoFaixa } from '../../components/laudo/escala.tsx';
import { ListaRazoes } from '../../components/laudo/laudo.tsx';
import { ListaPortoes } from '../../components/laudo/status.tsx';

/** Rótulo da categoria; no Indefinido, as categorias possíveis (P3 10.1). */
export function useRotuloCategoria() {
  const t = useT();
  return (doc: DocumentoVeredito) =>
    doc.ajuste.categoria === 'indefinido' && doc.ajuste.categoriasPossiveis.length > 1
      ? t('ui.resultado.indefinidoEntre', { categorias: doc.ajuste.categoriasPossiveis.map((c) => t(`categoria.${c}`).toLowerCase()).join(' e ') })
      : t(`categoria.${doc.ajuste.categoria}`);
}

export function explicacaoConfianca(doc: DocumentoVeredito) {
  // O primeiro período já diz o nível ("Confiança baixa."); o selo mostra o resto como explicação.
  return doc.textos.confianca.replace(/^[^.]*\.\s*/, '');
}

export function CabecaVeredito({ doc }: { doc: DocumentoVeredito }) {
  const t = useT();
  const faixa = useTextoFaixa();
  const rotulo = useRotuloCategoria();
  return (
    <div className="flex flex-col gap-medio">
      <h1 className="max-w-texto text-veredito text-nanquim">{doc.textos.frase}</h1>
      {doc.textos.fechamento ? <p className="max-w-texto text-corpo text-nanquim">{doc.textos.fechamento}</p> : null}
      {doc.textos.complemento.map((c) => (
        <p key={c} className="max-w-texto text-compacto text-grafite">
          {c}
        </p>
      ))}
      <Projecao tipo="madeira">
      <div className="flex flex-col gap-curto borda bg-campo p-base md:p-medio">
        <div className="flex flex-wrap items-end justify-between gap-x-medio gap-y-curto">
          <p className="flex flex-col gap-micro">
            <span className="text-rotulo text-grafite">{t('ui.indice.titulo')}</span>
            <span className="text-numero text-nanquim">
              <span className="sr-only">{t('ui.indice.titulo')} </span>
              {faixa(doc.ajuste.indice)}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-compacto">
            <span className="inline-flex h-botao items-center bg-nanquim px-curto text-rotulo text-folha">{rotulo(doc)}</span>
            <SeloConfianca nivel={doc.ajuste.confianca} explicacao={explicacaoConfianca(doc)} />
          </div>
        </div>
        <EscalaIndice faixa={doc.ajuste.indice} rotulo={t('ui.indice.aria', { faixa: faixa(doc.ajuste.indice) })} />
      </div>
      </Projecao>
    </div>
  );
}

/** Avaliação da ideia prévia: frase da faixa (duas quando cruza um limite) e a diferença contra não mudar. */
export function BlocoIdeia({ doc, comPortoes }: { doc: DocumentoVeredito; comPortoes: boolean }) {
  const t = useT();
  const faixa = useTextoFaixa();
  const i = doc.ideia;
  if (!i) return null;
  const frase = i.frases.length > 1 ? t('ui.ideia.entre', { a: i.frasesCurtas[0] ?? '', b: i.frasesCurtas[1] ?? '' }) : (i.frases[0] ?? '');
  return (
    <div className="flex flex-col gap-base">
      <blockquote className="max-w-texto text-corpo text-grafite">“{i.texto}”</blockquote>
      <p className="text-compacto text-grafite">{t('ui.ideia.lidaComo', { movimentos: i.movimentos.map((m) => m.nome).join('; ') })}</p>
      <p className="max-w-texto text-subtitulo text-nanquim">{frase}</p>
      {i.frases.length > 1 ? (
        <ul className="flex flex-col gap-micro">
          {i.frases.map((f) => (
            <li key={f} className="max-w-texto text-compacto text-grafite">
              {f}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-col gap-compacto">
        <p className="text-dado numeros text-nanquim">{t('ui.ideia.indice', { faixa: faixa(i.indice) })}</p>
        <EscalaIndice faixa={i.indice} rotulo={t('ui.ideia.indiceAria', { faixa: faixa(i.indice) })} />
        <p className="text-compacto numeros text-nanquim">
          {t('ui.ideia.contraBase', { base: i.baseRotulo, valor: comSinal(i.contraBase.pt, 0), de: comSinal(i.contraBase.lo, 0), ate: comSinal(i.contraBase.hi, 0) })}
        </p>
      </div>
      <p className="max-w-texto text-corpo font-medium text-nanquim">{i.fraseVeredito}</p>
      {i.razoes.length ? <ListaRazoes razoes={i.razoes} /> : null}
      {comPortoes && i.portoes.length ? (
        <div className="flex flex-col gap-curto">
          <h3 className="text-acao text-nanquim">{t('ui.ideia.portoes')}</h3>
          <ListaPortoes portoes={i.portoes} />
        </div>
      ) : null}
    </div>
  );
}

/** Perguntas de maior valor: o que estreitaria a faixa ou definiria a categoria (P3 9.10). */
export function PerguntasDecidiriam({ doc, analiseId, acao }: { doc: DocumentoVeredito; analiseId?: string; acao?: boolean }) {
  const t = useT();
  if (!doc.perguntasDeMaiorValor.length) return null;
  return (
    <ul className="flex flex-col">
      {doc.perguntasDeMaiorValor.map((p) => (
        <li key={p.pergunta} className="flex flex-col gap-micro traco-base py-curto first:pt-0 last:border-b-0">
          <div className="flex flex-wrap items-baseline justify-between gap-compacto">
            <span className="max-w-texto text-compacto text-nanquim">{p.texto}</span>
            {acao && analiseId ? (
              <Link to="/analises/$id/perguntas" params={{ id: analiseId }} search={{ pergunta: p.pergunta }} className="nao-imprimir text-acao text-nanquim underline-offset-4 hover:underline">
                {p.respondida ? t('ui.revisao.responderDeNovo') : t('ui.revisao.responder')}
              </Link>
            ) : null}
          </div>
          <p className="text-legenda text-grafite numeros">{p.efeito}</p>
          {p.comoDescobrir ? <p className="max-w-texto text-legenda text-grafite">{t('ui.revisao.comoDescobrir', { texto: p.comoDescobrir })}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function ListaSimples({ itens }: { itens: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-compacto pl-medio marker:text-grafite-claro">
      {itens.map((x) => (
        <li key={x} className="max-w-texto text-compacto text-nanquim">
          {x}
        </li>
      ))}
    </ul>
  );
}

/** Réguas de sobreajuste (O) e subajuste (U), separadas e alinhadas, nunca somadas (RN-72, IV-05). */
export function ReguasOU({ doc }: { doc: DocumentoVeredito }) {
  const t = useT();
  const faixa = useTextoFaixa();
  const linha = (rotulo: string, f: DocumentoVeredito['ajuste']['O'], tom: 'sobra' | 'falta'): ReactNode => (
    <div className="grade-definicao items-center gap-x-curto gap-y-micro">
      <p className="text-compacto text-nanquim">
        {rotulo} <span className="text-dado numeros">{faixa(f)}</span>
      </p>
      <EscalaIndice faixa={f} tom={tom} limites={false} rotulo={`${rotulo} ${faixa(f)}`} />
    </div>
  );
  return (
    <div className="flex flex-col gap-compacto">
      {linha(t('ui.resultado.sobreajuste'), doc.ajuste.O, 'sobra')}
      {linha(t('ui.resultado.subajuste'), doc.ajuste.U, 'falta')}
      <p className="max-w-texto text-legenda text-grafite">{t('ui.resultado.ouExplica')}</p>
    </div>
  );
}

export function useEMax() {
  return useCatalogo().calibracao.eMax;
}
