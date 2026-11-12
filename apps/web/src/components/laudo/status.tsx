// Status de saúde (C-07), portões (C-09) e obrigações datadas (C-10). Três lentes, três vocabulários:
// saúde usa saudável, atenção, crítico e desconhecido; portões ficam em nanquim, nunca em vermelho
// (A Regra do Não é Alarme).
import type { IndicadorSaudeDoc, Obrigacao, Portao } from '@stacksync/engine/tipos';
import { Circle, CircleCheck, CircleX, OctagonAlert, TriangleAlert } from 'lucide-react';
import { useT } from '../../lib/catalogo.tsx';
import { dataPt } from '../../lib/formato.ts';
import { useLargura } from './medida.tsx';

const icone = 'size-icone-grande shrink-0';

export function IconeSaude({ status }: { status: IndicadorSaudeDoc['status'] | 'proxima' | 'vencida' | 'futura' }) {
  if (status === 'saudavel') return <CircleCheck aria-hidden className={`${icone} text-saudavel`} strokeWidth={1.5} />;
  if (status === 'atencao' || status === 'proxima') return <TriangleAlert aria-hidden className={`${icone} text-nanquim`} fill="var(--cor-atencao)" strokeWidth={1.5} />;
  if (status === 'critico' || status === 'vencida') return <OctagonAlert aria-hidden className={`${icone} text-critico`} strokeWidth={1.5} />;
  if (status === 'futura') return <Circle aria-hidden className={`${icone} text-nanquim`} fill="var(--cor-nanquim)" strokeWidth={1.5} />;
  return <Circle aria-hidden className={`${icone} text-grafite-claro`} strokeWidth={1.5} />;
}

export function ListaSaude({ indicadores, compacta = false }: { indicadores: IndicadorSaudeDoc[]; compacta?: boolean }) {
  const t = useT();
  // No Ajustado, a lista é compacta e só os críticos se destacam (C-07).
  const ordem = { critico: 0, atencao: 1, desconhecido: 2, saudavel: 3 } as const;
  const lista = compacta ? [...indicadores].sort((a, b) => ordem[a.status] - ordem[b.status]) : indicadores;
  return (
    <ul className="flex flex-col">
      {lista.map((h) => (
        <li key={h.id} className="grid gap-x-base gap-y-micro traco-base py-curto first:pt-0 last:border-b-0 md:grid-cols-2">
          <span className="text-compacto text-nanquim">{h.nome}</span>
          <span className="flex items-start gap-compacto">
            <IconeSaude status={h.status} />
            <span className="flex flex-col">
              <span className={`text-compacto ${h.status === 'critico' ? 'font-semibold' : ''} text-nanquim`}>{t(`ui.saude.${h.status}`)}</span>
              {!compacta || h.status === 'critico' || h.status === 'atencao' ? <span className="text-compacto text-grafite">{h.criterio}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function IconePortao({ estado }: { estado: Portao['estado'] }) {
  if (estado === 'passa') return <CircleCheck aria-hidden className={`${icone} text-nanquim`} strokeWidth={1.5} />;
  if (estado === 'nao_passa') return <CircleX aria-hidden className={`${icone} text-nanquim`} strokeWidth={1.5} />;
  if (estado === 'indeterminado')
    return (
      <svg aria-hidden viewBox="0 0 20 20" className={icone}>
        <circle cx="10" cy="10" r="8.25" fill="none" stroke="var(--cor-nanquim)" strokeWidth="1.5" strokeDasharray="3 2.2" />
        <path d="M6.5 11c1-1.6 2.2-1.6 3.5 0s2.5 1.6 3.5 0" fill="none" stroke="var(--cor-nanquim)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  return <Circle aria-hidden className={`${icone} text-grafite-claro`} strokeWidth={1.5} />;
}

/** Uma linha por portão; todos os avaliáveis aparecem, mesmo depois do que definiu o veredito. */
export function ListaPortoes({ portoes }: { portoes: Portao[] }) {
  const t = useT();
  return (
    <ol className="flex flex-col">
      {portoes.map((g) => (
        <li key={g.id} className="flex items-start gap-curto traco-base py-curto first:pt-0 last:border-b-0">
          <IconePortao estado={g.estado} />
          <div className="flex min-w-0 flex-col gap-micro">
            <p className={`text-compacto text-nanquim ${g.defineVeredito ? 'font-semibold' : ''}`}>
              <span className="numeros">{g.id}</span> {g.nome}: {t(`portao.estado.${g.estado}`)}
              {g.defineVeredito ? <span className="ml-compacto text-legenda font-normal text-grafite">{t('ui.portao.define')}</span> : null}
            </p>
            <p className="text-compacto text-grafite">{g.motivo}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Linha do tempo das obrigações (C-10) a partir de 768px e lista cronológica sempre. */
export function Obrigacoes({ obrigacoes, asOf }: { obrigacoes: Obrigacao[]; asOf: string }) {
  const t = useT();
  const [ref, largura] = useLargura<HTMLDivElement>(560);
  const datadas = obrigacoes.filter((o) => o.data).sort((a, b) => a.data!.localeCompare(b.data!));
  const tempo = (d: string) => new Date(`${d.slice(0, 10)}T00:00:00Z`).getTime();
  const hoje = tempo(asOf);
  const inicio = Math.min(hoje, ...datadas.map((o) => tempo(o.data!))) - 1000 * 60 * 60 * 24 * 60;
  const fim = Math.max(hoje + 1000 * 60 * 60 * 24 * 365, ...datadas.map((o) => tempo(o.data!))) + 1000 * 60 * 60 * 24 * 60;
  const x = (ms: number) => 12 + ((ms - inicio) / (fim - inicio)) * (largura - 24);
  return (
    <div className="flex flex-col gap-base">
      {datadas.length ? (
        <div ref={ref} className="hidden w-full md:block">
          <svg role="img" aria-label={t('ui.obrigacoes.aria', { n: datadas.length })} viewBox={`0 0 ${largura} 56`} width="100%" className="block cor-exata" preserveAspectRatio="xMinYMid meet">
            <line x1={12} x2={largura - 12} y1={28} y2={28} stroke="var(--cor-traco-controle)" strokeWidth="1" />
            <line x1={x(hoje)} x2={x(hoje)} y1={8} y2={48} stroke="var(--cor-nanquim)" strokeWidth="1.5" />
            <text x={x(hoje)} y={6} textAnchor="middle" fontSize="12" fill="var(--cor-nanquim)" dominantBaseline="hanging">
              {t('ui.obrigacoes.hoje')}
            </text>
            {datadas.map((o) => {
              const cx = x(tempo(o.data!));
              const cor = o.status === 'vencida' ? 'var(--cor-critico)' : o.status === 'proxima' ? 'var(--cor-atencao)' : 'var(--cor-nanquim)';
              return (
                <g key={o.id}>
                  {o.status === 'vencida' ? (
                    <polygon points={octogono(cx, 28, 6)} fill={cor} />
                  ) : o.status === 'proxima' ? (
                    <polygon points={`${cx},21 ${cx + 7},34 ${cx - 7},34`} fill={cor} stroke="var(--cor-nanquim)" strokeWidth="1" />
                  ) : (
                    <rect x={cx - 1} y={20} width={2} height={16} fill={cor} />
                  )}
                  <text x={cx} y={52} textAnchor="middle" fontSize="12" fill="var(--cor-grafite)" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {dataPt(o.data)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}
      <ul className="flex flex-col">
        {obrigacoes.map((o) => (
          <li key={o.id} className="flex items-start gap-curto traco-base py-curto first:pt-0 last:border-b-0">
            <IconeSaude status={o.status === 'vencida' ? 'vencida' : o.status === 'proxima' ? 'proxima' : o.status === 'futura' ? 'futura' : 'desconhecido'} />
            <div className="flex min-w-0 flex-col gap-micro">
              <p className="text-compacto text-nanquim">
                <span className="font-medium">{t(`ui.obrigacoes.${o.status}`)}</span>
                {o.data ? <span className="numeros"> {dataPt(o.data)}</span> : null}. {o.texto}
              </p>
              {o.fonte ? <p className="text-legenda text-grafite-claro">{t('ui.obrigacoes.fonte', { fonte: o.fonte })}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function octogono(cx: number, cy: number, r: number): string {
  const pontos: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 8) * (2 * i + 1);
    pontos.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pontos.join(' ');
}
