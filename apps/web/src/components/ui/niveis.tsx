// Escala de tempo dos três níveis (DESIGN.md: T-00, T-01 e T-02). A mesma gramática de faixa do produto:
// o tempo de cada nível é uma faixa numa régua de minutos, nunca um cartão de plano (Considerado e descartado).
import type { Profundidade } from '@stacksync/content/tipos';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';

const MAXIMO = 50;
const pct = (v: number) => `${(Math.min(MAXIMO, Math.max(0, v)) / MAXIMO) * 100}%`;
export const NIVEIS: Profundidade[] = ['rapido', 'equilibrado', 'avancado'];

/** Faixa curta de minutos, dentro de uma opção ou de uma linha. Decorativa: o texto ao lado diz o tempo. */
export function FaixaMinutos({ profundidade, destaque = false }: { profundidade: Profundidade; destaque?: boolean }) {
  const def = useCatalogo().estrutura.profundidades[profundidade];
  const de = def.minutosDe === def.minutosAte ? def.minutosDe - 0.5 : def.minutosDe;
  const ate = def.minutosDe === def.minutosAte ? def.minutosAte + 0.5 : def.minutosAte;
  return (
    <span aria-hidden className="relative block h-curto w-full borda-fina bg-folha">
      <span className={`absolute inset-y-0 ${destaque ? 'bg-marca' : 'bg-nanquim'}`} style={{ left: pct(de), width: `calc(${pct(ate)} - ${pct(de)})` }} />
    </span>
  );
}

/** Régua de 0 a 50 minutos com os três níveis como faixas, para a página de entrada. */
export function EscalaNiveis() {
  const t = useT();
  const cat = useCatalogo();
  const marcas = Array.from({ length: MAXIMO / 5 + 1 }, (_, i) => i * 5);
  return (
    <figure role="img" aria-label={t('entrada.niveis.aria')} className="flex flex-col gap-curto">
      <div aria-hidden className="flex flex-col gap-curto md:relative md:block md:h-faixa">
        {NIVEIS.map((p) => {
          const def = cat.estrutura.profundidades[p];
          const direita = def.minutosAte >= 40;
          return (
            <div
              key={p}
              className={`flex flex-col gap-micro md:absolute md:bottom-0 ${direita ? 'md:items-end md:text-right' : ''}`}
              style={direita ? { right: `calc(100% - ${pct(def.minutosAte)})` } : { left: pct(def.minutosDe) }}
            >
              <span className="text-secao text-nanquim md:whitespace-nowrap">
                {def.rotulo}
                {def.recomendado ? <span className="ml-compacto inline-block borda-fina bg-sinal px-compacto py-micro align-middle text-rotulo whitespace-nowrap text-sobre-sinal">{t('ui.enquadramento.recomendado')}</span> : null}
              </span>
              <span className="text-dado text-nanquim md:whitespace-nowrap">{def.minutosRotulo}</span>
            </div>
          );
        })}
      </div>
      <div aria-hidden className="relative h-faixa">
        <span className="absolute inset-x-0 top-curto h-borda bg-nanquim" />
        {NIVEIS.map((p) => {
          const def = cat.estrutura.profundidades[p];
          const de = def.minutosDe === def.minutosAte ? def.minutosDe - 0.5 : def.minutosDe;
          const ate = def.minutosDe === def.minutosAte ? def.minutosAte + 0.5 : def.minutosAte;
          return <span key={p} className={`absolute top-0 h-amplo borda ${def.recomendado ? 'bg-marca' : 'bg-nanquim'}`} style={{ left: pct(de), width: `calc(${pct(ate)} - ${pct(de)})` }} />;
        })}
        {marcas.map((m) => (
          <span key={m} className="absolute top-secao -translate-x-1/2 text-codigo text-nanquim" style={{ left: pct(m) }}>
            {m % 10 === 0 ? m : ''}
          </span>
        ))}
      </div>
      <p aria-hidden className="text-right text-legenda text-grafite">
        {t('entrada.niveis.eixo')}
      </p>
    </figure>
  );
}
