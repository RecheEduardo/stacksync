// Diagrama de tolerância (C-05), a assinatura do produto, e o mapa de ajuste por eixo.
// Domínio fixo e compartilhado de −3,5 a +3,5 níveis: os diagramas ficam alinhados pela linha zero.
// Sobra e falta com o mesmo peso: posição, hachura e texto além da cor (A Regra da Simetria).
import type { EixoDoc, SinalUsado } from '@stacksync/engine/tipos';
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { useCatalogo, useT, type Tradutor } from '../../lib/catalogo.tsx';
import { comSinal, num } from '../../lib/formato.ts';
import { MarcaOrigem } from './certeza.tsx';
import { Cota, DefsHachura, limitar, useHachura, useLargura } from './medida.tsx';

const DOMINIO = 3.5;
const MARGEM = 8;

function escalaX(largura: number) {
  const util = largura - 2 * MARGEM;
  return (v: number) => MARGEM + ((limitar(v, -DOMINIO, DOMINIO) + DOMINIO) / (2 * DOMINIO)) * util;
}

export function leituraEixo(t: Tradutor, e: EixoDoc): { valor: string; faixa: string; situacao: string; aria: string } {
  if (!e.avaliado) return { valor: t('ui.mapa.naoAvaliado'), faixa: '', situacao: '', aria: `${e.nome}: ${t('ui.mapa.naoAvaliado')}` };
  if (!e.temSinal || !e.desvio || e.desvioPonto === null)
    return { valor: t('ui.mapa.semSinal'), faixa: '', situacao: '', aria: `${e.nome}: ${t('ui.mapa.semSinal')}` };
  const pt = e.desvioPonto;
  const faixa = t('ui.mapa.faixa', { de: comSinal(e.desvio.lo), ate: comSinal(e.desvio.hi) });
  const valor = e.lado === 'dentro' ? t('ui.mapa.dentro') : t('ui.mapa.desvio', { valor: comSinal(pt), um: Math.abs(pt) === 1 ? 'sim' : 'nao' });
  const marcas = [e.cruzaTolerancia ? t('ui.mapa.cruza') : null, e.saturado ? t('ui.mapa.saturado') : null].filter(Boolean).join('; ');
  const lado = e.lado === 'dentro' ? t('ui.mapa.dentro') : t(`ui.mapa.lado.${e.lado}`, { valor: num(Math.abs(pt)) });
  const aria = t('ui.mapa.aria', { eixo: e.nome, lado, de: num(e.desvio.lo), ate: num(e.desvio.hi), marcas: marcas ? `; ${marcas}` : '' });
  return { valor, faixa, situacao: marcas, aria };
}

/** Uma linha do diagrama: zona hachurada, linha zero, faixa de incerteza com cota, desvio e batente. */
export function DiagramaTolerancia({ eixo, eMax, altura = 48, aria }: { eixo: EixoDoc; eMax: number; altura?: 48 | 84; aria: string }) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const ids = useHachura();
  const tituloId = useId();
  const x = escalaX(largura);
  const meio = altura / 2;
  const alturaFaixa = altura === 84 ? 40 : 26;
  const alturaBarra = altura === 84 ? 20 : 14;
  const t = eixo.tolerancia;
  const lado = eixo.lado;
  const comSinalValido = eixo.avaliado && eixo.temSinal && eixo.desvio && eixo.desvioPonto !== null;
  const veu = eixo.cruzaTolerancia || lado === 'dentro' ? 'var(--cor-realce)' : lado === 'sobra' ? 'var(--cor-sobra-veu)' : 'var(--cor-falta-veu)';
  const cor = lado === 'sobra' ? 'var(--cor-sobra)' : 'var(--cor-falta)';
  const pt = eixo.desvioPonto ?? 0;
  const corteDir = comSinalValido && eixo.desvio!.hi > DOMINIO;
  const corteEsq = comSinalValido && eixo.desvio!.lo < -DOMINIO;
  const batente = eixo.saturado && lado !== 'dentro' ? (lado === 'sobra' ? t.sobra + eMax : -(t.falta + eMax)) : null;

  return (
    <div ref={ref} className="w-full">
      <svg role="img" aria-labelledby={tituloId} viewBox={`0 0 ${largura} ${altura}`} width="100%" className="block cor-exata" preserveAspectRatio="xMinYMid meet">
        <title id={tituloId}>{aria}</title>
        <DefsHachura ids={ids} />
        <rect x={x(-t.falta)} y={0} width={x(t.sobra) - x(-t.falta)} height={altura} fill="var(--cor-zona)" />
        <rect x={x(-t.falta)} y={0} width={x(t.sobra) - x(-t.falta)} height={altura} fill={`url(#${ids.zona})`} />
        {comSinalValido ? (
          <>
            <Cota x1={x(eixo.desvio!.lo)} x2={x(eixo.desvio!.hi)} y={meio - alturaFaixa / 2} altura={alturaFaixa} preenchimento={veu} terminal="var(--cor-nanquim)" traco={2} />
            {lado === 'dentro' ? (
              <rect x={x(pt) - 1.5} y={meio - alturaFaixa / 2} width={3} height={alturaFaixa} fill="var(--cor-nanquim)" />
            ) : (
              <g>
                <rect x={Math.min(x(0), x(pt))} y={meio - alturaBarra / 2} width={Math.abs(x(pt) - x(0))} height={alturaBarra} fill={cor} stroke="var(--cor-nanquim)" strokeWidth="2" />
                <rect x={Math.min(x(0), x(pt))} y={meio - alturaBarra / 2} width={Math.abs(x(pt) - x(0))} height={alturaBarra} fill={`url(#${lado === 'sobra' ? ids.sobra : ids.falta})`} />
              </g>
            )}
            {corteDir ? <path d={`M ${largura - 1} ${meio} l -6 -5 v 10 z`} fill="var(--cor-grafite)" /> : null}
            {corteEsq ? <path d={`M 1 ${meio} l 6 -5 v 10 z`} fill="var(--cor-grafite)" /> : null}
          </>
        ) : (
          <rect x={x(-DOMINIO)} y={meio - alturaFaixa / 2} width={x(DOMINIO) - x(-DOMINIO)} height={alturaFaixa} fill="none" stroke="var(--cor-traco-controle)" strokeDasharray="2 3" strokeWidth="1" />
        )}
        <line x1={x(0)} x2={x(0)} y1={0} y2={altura} stroke="var(--cor-nanquim)" strokeWidth="3" />
        {batente !== null ? <rect x={x(batente) - 1.5} y={2} width={3} height={altura - 4} fill="var(--cor-nanquim)" /> : null}
      </svg>
    </div>
  );
}

/** Escala do mapa, uma vez no topo: marcas a cada 0,5 nível, números nos inteiros, falta à esquerda e sobra à direita. */
function EscalaMapa() {
  const t = useT();
  const [ref, largura] = useLargura<HTMLDivElement>();
  const x = escalaX(largura);
  const marcas = Array.from({ length: 15 }, (_, i) => -3.5 + i * 0.5);
  return (
    <div ref={ref} className="w-full" aria-hidden>
      <svg viewBox={`0 0 ${largura} 42`} width="100%" className="block" preserveAspectRatio="xMinYMid meet">
        <text x={MARGEM} y={11} fontSize="12" fill="var(--cor-grafite)">
          {t('ui.mapa.escala.falta')}
        </text>
        <text x={largura - MARGEM} y={11} fontSize="12" textAnchor="end" fill="var(--cor-grafite)">
          {t('ui.mapa.escala.sobra')}
        </text>
        {marcas.filter(Number.isInteger).map((m) => (
          <text key={`n${m}`} x={x(m)} y={27} textAnchor="middle" fontSize="12" fill="var(--cor-grafite)" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {m === 0 ? '0' : comSinal(m, 0)}
          </text>
        ))}
        {marcas.map((m) => (
          <line key={m} x1={x(m)} x2={x(m)} y1={Number.isInteger(m) ? 32 : 35} y2={40} stroke="var(--cor-traco-controle)" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

/** Régua de nível de 0 a 4 para necessidade e capacidade, com a mesma gramática de cota. */
function ReguaNivel({ faixa, rotulo }: { faixa: { lo: number; hi: number } | null; rotulo: string }) {
  const [ref, largura] = useLargura<HTMLDivElement>(240);
  const x = (v: number) => MARGEM + (limitar(v, 0, 4) / 4) * (largura - 2 * MARGEM);
  return (
    <div ref={ref} className="w-full">
      <svg role="img" aria-label={rotulo} viewBox={`0 0 ${largura} 34`} width="100%" className="block cor-exata" preserveAspectRatio="xMinYMid meet">
        <line x1={x(0)} x2={x(4)} y1={14} y2={14} stroke="var(--cor-traco-controle)" strokeWidth="1" />
        {[0, 1, 2, 3, 4].map((n) => (
          <g key={n}>
            <line x1={x(n)} x2={x(n)} y1={10} y2={18} stroke="var(--cor-traco-controle)" strokeWidth="1" />
            <text x={x(n)} y={31} textAnchor="middle" fontSize="12" fill="var(--cor-grafite)">
              {n}
            </text>
          </g>
        ))}
        {faixa ? <Cota x1={x(faixa.lo)} x2={x(faixa.hi)} y={7} altura={14} preenchimento="var(--cor-faixa-indice)" /> : null}
      </svg>
    </div>
  );
}

function ListaSinais({ sinais }: { sinais: SinalUsado[] }) {
  const t = useT();
  if (!sinais.length) return <p className="text-compacto text-grafite">{t('ui.eixo.semSinais')}</p>;
  return (
    <ul className="flex flex-col gap-compacto">
      {sinais.map((s) => (
        <li key={`${s.id}${s.pergunta}`} className="flex flex-col gap-micro">
          <span className="text-compacto text-nanquim">
            {s.rotulo}: <span className="font-medium">{s.resposta}</span>
          </span>
          <span className="flex flex-wrap items-center gap-compacto">
            <MarcaOrigem origem={s.origem} extras={s.marcas.includes('antiga') ? ['antiga'] : []} />
            <span className="text-legenda text-grafite-claro">{t(`ui.eixo.efeito.${s.efeito}`)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Detalhe do eixo (T-10) aberto na própria linha: âncoras, sinais e evidências. */
function DetalheEixo({ eixo, eMax }: { eixo: EixoDoc; eMax: number }) {
  const t = useT();
  const cat = useCatalogo();
  const def = [...cat.eixos.arquitetura, ...cat.eixos.ferramenta].find((x) => x.id === eixo.id);
  const leitura = leituraEixo(t, eixo);
  const fontes = (def?.evidencias ?? []).map((id) => cat.evidencias.find((e) => e.id === id)).filter((e) => !!e);
  return (
    <div className="flex flex-col gap-medio borda bg-campo p-base md:p-medio">
      {def ? <p className="text-corpo text-grafite">{def.perguntaGuia}</p> : null}
      <DiagramaTolerancia eixo={eixo} eMax={eMax} altura={84} aria={leitura.aria} />
      <div className="grid gap-medio md:grid-cols-2">
        {(['N', 'C'] as const).map((lado) => (
          <div key={lado} className="flex flex-col gap-compacto">
            <h4 className="text-rotulo text-nanquim">{t(lado === 'N' ? 'ui.eixo.necessidade' : 'ui.eixo.capacidade')}</h4>
            <ReguaNivel faixa={lado === 'N' ? eixo.N : eixo.C} rotulo={t('ui.eixo.reguaAria', { lado: t(lado === 'N' ? 'ui.eixo.necessidade' : 'ui.eixo.capacidade'), de: num((lado === 'N' ? eixo.N : eixo.C)?.lo ?? 0, 2), ate: num((lado === 'N' ? eixo.N : eixo.C)?.hi ?? 0, 2) })} />
            {(lado === 'N' ? eixo.ancoraN : eixo.ancoraC) ? <p className="text-compacto text-grafite">{lado === 'N' ? eixo.ancoraN : eixo.ancoraC}</p> : null}
            <ListaSinais sinais={lado === 'N' ? eixo.sinaisN : eixo.sinaisC} />
          </div>
        ))}
      </div>
      {eixo.guardas.length || eixo.verificacao ? (
        <ul className="flex flex-col gap-compacto">
          {[...eixo.guardas, ...(eixo.verificacao ? [eixo.verificacao] : [])].map((g) => (
            <li key={g} className="text-compacto text-nanquim">
              {g}
            </li>
          ))}
        </ul>
      ) : null}
      {fontes.length ? (
        <div className="flex flex-col gap-compacto">
          <h4 className="text-rotulo text-nanquim">{t('ui.eixo.evidencias')}</h4>
          <ul className="flex flex-col gap-compacto">
            {fontes.map((f) => (
              <li key={f!.id} className="text-compacto text-grafite">
                <span className="text-nanquim">{t('ui.citacao', { autores: f!.autores, ano: String(f!.ano) })}</span> {f!.achado}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function LinhaMapa({ eixo, eMax }: { eixo: EixoDoc; eMax: number }) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const idDetalhe = useId();
  const leitura = leituraEixo(t, eixo);
  return (
    <li className="flex flex-col gap-compacto">
      {/* O nome acessível vem do conteúdo visível (WCAG 2.5.3) mais o título do diagrama, que lê o desvio. */}
      <button
        type="button"
        aria-expanded={aberto}
        aria-controls={idDetalhe}
        onClick={() => setAberto((v) => !v)}
        className="group grade-mapa w-full items-center rounded-controle px-compacto py-micro text-left hover:bg-mesa aria-expanded:bg-mesa"
      >
        <span className="area-rotulo flex min-w-0 items-center gap-compacto">
          <ChevronDown aria-hidden className="nao-imprimir size-icone shrink-0 -rotate-90 text-grafite transition-transform duration-150 ease-saida group-aria-expanded:rotate-0" strokeWidth={1.5} />
          <span className="flex min-w-0 flex-col">
            <span className="text-subtitulo text-nanquim">{eixo.nome}</span>
            <span className="text-codigo text-grafite">{t('ui.mapa.peso', { peso: eixo.peso, id: eixo.id })}</span>
          </span>
        </span>
        <span className="area-diagrama">
          <DiagramaTolerancia eixo={eixo} eMax={eMax} aria={leitura.aria} />
        </span>
        <span className="area-leitura flex flex-col items-end text-right md:items-start md:text-left">
          <span className="text-dado numeros text-nanquim">{leitura.valor}</span>
          {leitura.faixa ? <span className="text-legenda numeros text-grafite">{leitura.faixa}</span> : null}
          {leitura.situacao ? <span className="text-legenda text-grafite">{leitura.situacao}</span> : null}
        </span>
      </button>
      {aberto ? (
        <div id={idDetalhe} className="surge">
          <DetalheEixo eixo={eixo} eMax={eMax} />
        </div>
      ) : null}
    </li>
  );
}

/** Mapa de ajuste: todos os eixos avaliados, alinhados pela linha zero, com a escala uma vez no topo. */
export function MapaAjuste({ eixos, eMax }: { eixos: EixoDoc[]; eMax: number }) {
  const t = useT();
  const avaliados = eixos.filter((e) => e.avaliado);
  return (
    <div className="flex flex-col gap-compacto">
      <div className="grade-mapa px-compacto">
        <span className="area-rotulo hidden text-legenda text-grafite md:block">{t('ui.mapa.cabecalho.eixo')}</span>
        <span className="area-diagrama">
          <EscalaMapa />
        </span>
        <span className="area-leitura hidden text-legenda text-grafite md:block">{t('ui.mapa.cabecalho.leitura')}</span>
      </div>
      <ul className="flex flex-col gap-micro">
        {avaliados.map((e) => (
          <LinhaMapa key={e.id} eixo={e} eMax={eMax} />
        ))}
      </ul>
      <Legenda />
    </div>
  );
}

function Legenda() {
  const t = useT();
  const ids = useHachura();
  const amostra = (conteudo: React.ReactNode, texto: string) => (
    <li className="inline-flex items-center gap-compacto text-legenda text-grafite">
      <svg aria-hidden viewBox="0 0 24 12" width="24" height="12" className="cor-exata">
        <DefsHachura ids={ids} />
        {conteudo}
      </svg>
      {texto}
    </li>
  );
  return (
    <ul className="flex flex-wrap gap-x-base gap-y-compacto pt-compacto">
      {amostra(
        <>
          <rect x="0" y="0" width="24" height="12" fill="var(--cor-zona)" />
          <rect x="0" y="0" width="24" height="12" fill={`url(#${ids.zona})`} />
          <rect x="11" y="0" width="3" height="12" fill="var(--cor-nanquim)" />
        </>,
        t('ui.mapa.legenda.zona'),
      )}
      {amostra(
        <>
          <rect x="0" y="3" width="24" height="6" fill="var(--cor-sobra)" />
          <rect x="0" y="3" width="24" height="6" fill={`url(#${ids.sobra})`} />
        </>,
        t('ui.mapa.legenda.sobra'),
      )}
      {amostra(
        <>
          <rect x="0" y="3" width="24" height="6" fill="var(--cor-falta)" />
          <rect x="0" y="3" width="24" height="6" fill={`url(#${ids.falta})`} />
        </>,
        t('ui.mapa.legenda.falta'),
      )}
      {amostra(<Cota x1={2} x2={22} y={1} altura={10} preenchimento="var(--cor-realce)" />, t('ui.mapa.legenda.faixa'))}
      {amostra(<rect x="11" y="0" width="2" height="12" fill="var(--cor-grafite)" />, t('ui.mapa.legenda.batente'))}
    </ul>
  );
}
