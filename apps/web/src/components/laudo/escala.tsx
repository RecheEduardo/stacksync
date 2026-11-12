// Escala do índice (C-06) e selo de confiança (C-04). Régua linear de 0 a 100 com a faixa em cota:
// sem zonas coloridas, sem ponteiro radial, sem número gigante (A Regra da Frase que Vence o Número).
import type { FaixaIndice } from '@stacksync/engine/tipos';
import { useId } from 'react';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { Dica } from '../ui/sobreposicao.tsx';
import { Cota, useLargura } from './medida.tsx';

const M = 8;

/** Texto da faixa por extenso: "entre 43 e 57" (IV-04: o número nunca aparece sem a faixa). */
export function useTextoFaixa() {
  const t = useT();
  return (f: { lo: number; hi: number }) => (f.lo === f.hi ? t('ui.indice.igual', { valor: f.lo }) : t('ui.indice.entre', { de: f.lo, ate: f.hi }));
}

export function EscalaIndice({
  faixa,
  tom = 'indice',
  rotulo,
  limites = true,
}: {
  faixa: FaixaIndice;
  tom?: 'indice' | 'sobra' | 'falta';
  rotulo: string;
  limites?: boolean;
}) {
  const cat = useCatalogo();
  const [ref, largura] = useLargura<HTMLDivElement>(480);
  const tituloId = useId();
  const x = (v: number) => M + (Math.min(100, Math.max(0, v)) / 100) * (largura - 2 * M);
  const preenchimento = tom === 'sobra' ? 'var(--cor-sobra-veu)' : tom === 'falta' ? 'var(--cor-falta-veu)' : 'var(--cor-faixa-indice)';
  const centro = tom === 'sobra' ? 'var(--cor-sobra)' : tom === 'falta' ? 'var(--cor-falta)' : 'var(--cor-nanquim)';
  return (
    <div ref={ref} className="w-full">
      <svg role="img" aria-labelledby={tituloId} viewBox={`0 0 ${largura} 52`} width="100%" className="block cor-exata" preserveAspectRatio="xMinYMid meet">
        <title id={tituloId}>{rotulo}</title>
        <rect x={x(0)} y={8} width={x(100) - x(0)} height={28} fill="var(--cor-folha)" stroke="var(--cor-nanquim)" strokeWidth="2" />
        <line x1={x(0)} x2={x(100)} y1={22} y2={22} stroke="var(--cor-traco-controle)" strokeWidth="1" />
        {Array.from({ length: 11 }, (_, i) => i * 10).map((v) => (
          <line key={v} x1={x(v)} x2={x(v)} y1={v % 50 === 0 ? 14 : 18} y2={v % 50 === 0 ? 30 : 26} stroke="var(--cor-traco-controle)" strokeWidth="1" />
        ))}
        {limites
          ? cat.calibracao.faixasAderencia.map((v) => <line key={`l${v}`} x1={x(v)} x2={x(v)} y1={4} y2={40} stroke="var(--cor-grafite-claro)" strokeWidth="1" strokeDasharray="2 2" />)
          : null}
        <Cota x1={x(faixa.lo)} x2={x(faixa.hi)} y={8} altura={28} preenchimento={preenchimento} terminal="var(--cor-nanquim)" traco={2} />
        <rect x={x(faixa.pt) - 2} y={2} width={4} height={40} fill={centro} />
        {[0, 50, 100].map((v) => (
          <text key={`t${v}`} x={x(v)} y={51} textAnchor={v === 0 ? 'start' : v === 100 ? 'end' : 'middle'} fontSize="12" fill="var(--cor-grafite)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {v}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** Selo de confiança: texto e um glifo de cota cuja largura cresce com a incerteza. */
export function SeloConfianca({ nivel, explicacao }: { nivel: 'alta' | 'media' | 'baixa'; explicacao: string }) {
  const t = useT();
  const largura = nivel === 'alta' ? 10 : nivel === 'media' ? 20 : 32;
  return (
    <Dica conteudo={explicacao}>
      <button type="button" className="inline-flex h-botao items-center gap-compacto borda-fina bg-folha px-curto text-rotulo text-nanquim hover:bg-campo">
        <svg aria-hidden viewBox="0 0 34 10" width="34" height="10" className="cor-exata">
          <line x1={17 - largura / 2} x2={17 + largura / 2} y1={5} y2={5} stroke="var(--cor-nanquim)" strokeWidth="1.5" />
          <line x1={17 - largura / 2} x2={17 - largura / 2} y1={1} y2={9} stroke="var(--cor-nanquim)" strokeWidth="1.5" />
          <line x1={17 + largura / 2} x2={17 + largura / 2} y1={1} y2={9} stroke="var(--cor-nanquim)" strokeWidth="1.5" />
        </svg>
        {t(`confianca.${nivel}`)}
        <span className="sr-only">. {explicacao}</span>
      </button>
    </Dica>
  );
}
