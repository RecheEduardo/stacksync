// Gramática de certeza (DESIGN.md, A Regra da Certeza que Tem Traço; C-11): contínuo para medida,
// tracejado para estimativa, pontilhado para inferência, vazio para desconhecido, barrado para
// "não se aplica". O mesmo glifo em toda tela e na impressão.
import { useT } from '../../lib/catalogo.tsx';
import type { OrigemResposta } from '../../lib/tipos.ts';

export function GlifoCerteza({ origem, className = '' }: { origem: OrigemResposta | 'antiga'; className?: string }) {
  const comum = { x: 1, y: 1, width: 14, height: 8, rx: 0 };
  return (
    <svg aria-hidden viewBox="0 0 16 10" width="16" height="10" className={`shrink-0 ${className}`}>
      {origem === 'medida' ? <rect {...comum} fill="var(--cor-nanquim)" stroke="var(--cor-nanquim)" strokeWidth="1.5" /> : null}
      {origem === 'estimativa' ? <rect {...comum} fill="none" stroke="var(--cor-nanquim)" strokeWidth="1.5" strokeDasharray="3 2" /> : null}
      {origem === 'inferencia' ? <rect {...comum} fill="none" stroke="var(--cor-nanquim)" strokeWidth="1.5" strokeDasharray="0.1 2.4" strokeLinecap="round" /> : null}
      {origem === 'desconhecida' ? <rect {...comum} fill="none" stroke="var(--cor-grafite-claro)" strokeWidth="1" /> : null}
      {origem === 'nao_se_aplica' ? (
        <g stroke="var(--cor-grafite-claro)" strokeWidth="1" fill="none">
          <rect {...comum} />
          <line x1="2" y1="9" x2="14" y2="1" />
        </g>
      ) : null}
      {origem === 'antiga' ? <rect {...comum} fill="none" stroke="var(--cor-grafite)" strokeWidth="1.5" strokeDasharray="5 1.5 1 1.5" /> : null}
    </svg>
  );
}

/** Glifo e uma palavra ("estimado", "inferido"...); aparece em toda resposta e número derivado dela. */
export function MarcaOrigem({ origem, extras = [] }: { origem: OrigemResposta; extras?: Array<'antiga' | 'alterada' | 'livre'> }) {
  const t = useT();
  return (
    <span className="inline-flex flex-wrap items-center gap-x-compacto gap-y-micro text-legenda text-grafite">
      <span className="inline-flex items-center gap-micro">
        <GlifoCerteza origem={origem} />
        {t(`ui.origem.${origem}`)}
      </span>
      {extras.map((x) => (
        <span key={x} className="inline-flex items-center gap-micro">
          {x === 'antiga' ? <GlifoCerteza origem="antiga" /> : null}
          {t(`ui.origem.marca.${x}`)}
        </span>
      ))}
    </span>
  );
}

/** Composição das respostas com os glifos (cabeçalho do laudo e revisão). */
export function Composicao({ contagens }: { contagens: Record<'medida' | 'estimativa' | 'inferencia' | 'desconhecida', number> }) {
  const t = useT();
  const total = Object.values(contagens).reduce((s, n) => s + n, 0) || 1;
  return (
    <ul className="flex flex-wrap gap-x-base gap-y-micro">
      {(['medida', 'estimativa', 'inferencia', 'desconhecida'] as const).map((o) => (
        <li key={o} className="inline-flex items-center gap-micro text-compacto text-nanquim">
          <GlifoCerteza origem={o} />
          <span className="numeros">{t('ui.composicao.item', { pct: Math.round((contagens[o] / total) * 100), origem: t(`ui.composicao.${o}`) })}</span>
        </li>
      ))}
    </ul>
  );
}
