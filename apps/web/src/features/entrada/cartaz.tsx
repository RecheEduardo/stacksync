// Diagrama de tolerância em escala de cartaz para a página de entrada (DESIGN.md, T-00): o mapa de ajuste do
// Exemplo B da Parte 3, calculado pelo motor real no navegador e rotulado como ilustrativo (IV-22).
// Carregado sob demanda para não pesar no JavaScript inicial do aplicativo (DG-11).
import { pacote } from '@stacksync/content';
import type { CasoAncora } from '@stacksync/content/tipos';
import { avaliar, type EntradaAvaliacao } from '@stacksync/engine';
import type { EixoDoc } from '@stacksync/engine/tipos';
import { m, useReducedMotion } from 'motion/react';
import { useId, useMemo } from 'react';
import { useT } from '../../lib/catalogo.tsx';
import { leituraEixo } from '../../components/laudo/diagrama.tsx';
import { Cota, DefsHachura, limitar, useHachura, useLargura } from '../../components/laudo/medida.tsx';

const DOMINIO = 3.5;
const ALTURA = 60;
const CASO = 'EX-B';

function entradaDoCaso(caso: CasoAncora): EntradaAvaliacao {
  const respostas: EntradaAvaliacao['respostas'] = {};
  for (const [id, r] of Object.entries(caso.respostas)) {
    const origem = r.origem ?? 'estimativa';
    respostas[id] = { valor: r.valor, origem, ...(origem === 'medida' ? { fonte: 'caso-âncora', medidaEm: caso.asOf.slice(0, 7) } : {}) };
  }
  return { subnivel: caso.subnivel, profundidade: caso.profundidade, asOf: caso.asOf, respostas, ideia: caso.ideia ?? null };
}

function LinhaCartaz({ eixo, ordem }: { eixo: EixoDoc; ordem: number }) {
  const t = useT();
  const [ref, largura] = useLargura<HTMLDivElement>(640);
  const ids = useHachura();
  const tituloId = useId();
  const x = (v: number) => ((limitar(v, -DOMINIO, DOMINIO) + DOMINIO) / (2 * DOMINIO)) * largura;
  const leitura = leituraEixo(t, eixo);
  const sem = useReducedMotion();
  const tol = eixo.tolerancia;
  const meio = ALTURA / 2;
  const pt = eixo.desvioPonto ?? 0;
  const fora = eixo.lado !== 'dentro' && eixo.desvio;
  const cor = eixo.lado === 'sobra' ? 'var(--cor-sobra)' : 'var(--cor-falta)';
  const veu = eixo.cruzaTolerancia || eixo.lado === 'dentro' ? 'var(--cor-realce)' : eixo.lado === 'sobra' ? 'var(--cor-sobra-veu)' : 'var(--cor-falta-veu)';
  return (
    <li className="grade-cartaz items-center traco-base">
      <span className="area-rotulo flex flex-col">
        <span className="text-subtitulo text-nanquim">{eixo.nome}</span>
        <span className="text-codigo text-grafite">{eixo.id}</span>
      </span>
      <span ref={ref} className="area-diagrama block w-full">
        <svg role="img" aria-labelledby={tituloId} viewBox={`0 0 ${largura} ${ALTURA}`} width="100%" height={ALTURA} className="block cor-exata">
          <title id={tituloId}>{leitura.aria}</title>
          <DefsHachura ids={ids} />
          <rect x={x(-tol.falta)} y={0} width={x(tol.sobra) - x(-tol.falta)} height={ALTURA} fill="var(--cor-zona)" />
          <rect x={x(-tol.falta)} y={0} width={x(tol.sobra) - x(-tol.falta)} height={ALTURA} fill={`url(#${ids.zona})`} />
          {eixo.desvio ? <Cota x1={x(eixo.desvio.lo)} x2={x(eixo.desvio.hi)} y={meio - 16} altura={32} preenchimento={veu} terminal="var(--cor-nanquim)" traco={2} /> : null}
          {fora ? (
            // As barras crescem a partir da linha zero ao entrar na tela (momento autoral, uma vez).
            <m.g
              style={{ originX: eixo.lado === 'sobra' ? 0 : 1 }}
              initial={sem ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.06 * ordem }}
            >
              <rect x={Math.min(x(0), x(pt))} y={meio - 11} width={Math.abs(x(pt) - x(0))} height={22} fill={cor} stroke="var(--cor-nanquim)" strokeWidth="2" />
              <rect x={Math.min(x(0), x(pt))} y={meio - 11} width={Math.abs(x(pt) - x(0))} height={22} fill={`url(#${eixo.lado === 'sobra' ? ids.sobra : ids.falta})`} />
            </m.g>
          ) : (
            <rect x={x(pt) - 2} y={meio - 16} width={4} height={32} fill="var(--cor-nanquim)" />
          )}
          <rect x={x(0) - 1.5} y={0} width={3} height={ALTURA} fill="var(--cor-nanquim)" />
        </svg>
      </span>
      <span className="area-leitura flex flex-wrap items-baseline gap-x-compacto md:flex-col md:items-start">
        <span className="text-dado text-nanquim numeros">{leitura.valor}</span>
        {leitura.faixa ? <span className="text-legenda text-grafite numeros">{leitura.faixa}</span> : null}
      </span>
    </li>
  );
}

export default function CartazExemplo() {
  const t = useT();
  const doc = useMemo(() => {
    const caso = pacote.casosAncora.find((c) => c.id === CASO)!;
    return avaliar(entradaDoCaso(caso), pacote);
  }, []);
  const eixos = doc.eixos.filter((e) => e.avaliado);
  return (
    <div className="flex flex-col gap-base">
      <div aria-hidden className="grade-cartaz items-end">
        <span className="area-rotulo hidden md:block" />
        <span className="area-diagrama flex items-end justify-between text-rotulo">
          <span className="flex items-center gap-compacto text-nanquim">
            <span className="h-base w-amplo borda-fina bg-falta" />
            {t('entrada.exemplo.falta')}
          </span>
          <span className="flex items-center gap-compacto text-nanquim">
            <span className="h-medio w-borda bg-nanquim" />
            {t('entrada.exemplo.zero')}
          </span>
          <span className="flex items-center gap-compacto text-nanquim">
            {t('entrada.exemplo.sobra')}
            <span className="h-base w-amplo borda-fina bg-sobra" />
          </span>
        </span>
        <span className="area-leitura hidden md:block" />
      </div>
      <ul className="flex flex-col traco-topo">
        {eixos.map((e, i) => (
          <LinhaCartaz key={e.id} eixo={e} ordem={i} />
        ))}
      </ul>
    </div>
  );
}
