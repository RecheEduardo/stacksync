// Componente único para todo texto vindo da IA do usuário (Parte 4, 13.4; IV-07): superfície de
// anotação na mesa, fora da folha oficial, com provedor e modelo. Nada de faísca, gradiente, bolha de
// chat, avatar de robô ou efeito de digitação.
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '../../lib/api.ts';
import { useT } from '../../lib/catalogo.tsx';
import type { BlocoRaciocinio, Raciocinio } from '../../lib/tipos.ts';
import { Botao } from '../ui/botao.tsx';
import { EsqueletoTexto } from '../ui/esqueleto.tsx';
import { Recolhivel } from '../ui/estado.tsx';
import { Citacao } from './laudo.tsx';

export function SuperficieIa({ titulo, rotulo, children, acoes }: { titulo: ReactNode; rotulo?: ReactNode; children: ReactNode; acoes?: ReactNode }) {
  return (
    <section className="flex flex-col gap-base borda-tracejada bg-campo p-medio">
      <header className="flex flex-col gap-micro">
        <h2 className="text-secao text-nanquim">{titulo}</h2>
        {rotulo ? <p className="text-legenda text-grafite">{rotulo}</p> : null}
      </header>
      {children}
      {acoes ? <div className="flex flex-wrap gap-compacto">{acoes}</div> : null}
    </section>
  );
}

/** Proposta da IA (texto livre, ideia prévia): nada vale sem Confirmar, Ajustar ou Descartar (RN-79). */
export function PropostaIa({
  titulo,
  provedor,
  modelo,
  children,
  aoConfirmar,
  aoAjustar,
  aoDescartar,
  ocupado = false,
}: {
  titulo: string;
  provedor: string | null;
  modelo: string | null;
  children: ReactNode;
  aoConfirmar?: (() => void) | undefined;
  aoAjustar: () => void;
  aoDescartar: () => void;
  ocupado?: boolean;
}) {
  const t = useT();
  return (
    <SuperficieIa
      titulo={titulo}
      rotulo={provedor ? t('ui.ia.rotuloProposta', { provedor: t(`ui.provedor.${provedor}`), modelo: modelo ?? '' }) : undefined}
      acoes={
        <>
          {aoConfirmar ? (
            <Botao variante="secundario" onClick={aoConfirmar} disabled={ocupado}>
              {t('ui.proposta.confirmar')}
            </Botao>
          ) : null}
          <Botao variante="secundario" onClick={aoAjustar} disabled={ocupado}>
            {t('ui.proposta.ajustar')}
          </Botao>
          <Botao variante="secundario" onClick={aoDescartar} disabled={ocupado}>
            {t('ui.proposta.descartar')}
          </Botao>
        </>
      }
    >
      {children}
    </SuperficieIa>
  );
}

// ---------------------------------------------------------------- raciocínio guiado (RG-10) por SSE

interface EstadoRaciocinio {
  status: 'aguardando' | 'gerando' | 'pronto' | 'falhou';
  versao: number | null;
  provedor: string | null;
  modelo: string | null;
  versaoPrompt: string | null;
  blocos: BlocoRaciocinio[];
  descartados: Array<{ alvo: string; motivo: string }>;
  sintese: string | null;
  candidatas: Raciocinio['candidatas'];
  falha: string | null;
}

const vazio: EstadoRaciocinio = { status: 'aguardando', versao: null, provedor: null, modelo: null, versaoPrompt: null, blocos: [], descartados: [], sintese: null, candidatas: [], falha: null };

function deGuardado(r: Raciocinio): EstadoRaciocinio {
  return {
    status: r.status === 'gerando' ? 'gerando' : r.status,
    versao: r.versao,
    provedor: r.provedor,
    modelo: r.modelo,
    versaoPrompt: r.versaoPrompt,
    blocos: r.blocos,
    descartados: r.descartados,
    sintese: r.sintese,
    candidatas: r.candidatas,
    falha: r.falha,
  };
}

export function useRaciocinio(vereditoId: string, guardado: Raciocinio | null) {
  const [estado, setEstado] = useState<EstadoRaciocinio>(guardado && guardado.status !== 'gerando' ? deGuardado(guardado) : vazio);
  const fonte = useRef<EventSource | null>(null);
  const qc = useQueryClient();

  const conectar = useCallback(() => {
    fonte.current?.close();
    setEstado((e) => ({ ...vazio, status: 'gerando', versao: e.versao }));
    const es = new EventSource(`/api/v1/vereditos/${vereditoId}/raciocinio/eventos`);
    fonte.current = es;
    const json = (ev: MessageEvent) => JSON.parse(ev.data as string) as Record<string, unknown>;
    es.addEventListener('inicio', (ev) => {
      const d = json(ev as MessageEvent);
      setEstado({ ...vazio, status: 'gerando', versao: d.versao as number, provedor: d.provedor as string, modelo: d.modelo as string, versaoPrompt: d.versaoPrompt as string });
    });
    es.addEventListener('bloco', (ev) => setEstado((e) => ({ ...e, blocos: [...e.blocos.filter((b) => b.alvo !== (json(ev as MessageEvent).alvo as string)), json(ev as MessageEvent) as unknown as BlocoRaciocinio] })));
    es.addEventListener('descartado', (ev) => setEstado((e) => ({ ...e, descartados: [...e.descartados, json(ev as MessageEvent) as { alvo: string; motivo: string }] })));
    es.addEventListener('sintese', (ev) => setEstado((e) => ({ ...e, sintese: (json(ev as MessageEvent).texto as string | null) ?? null })));
    es.addEventListener('candidatas', (ev) => setEstado((e) => ({ ...e, candidatas: json(ev as MessageEvent).candidatas as Raciocinio['candidatas'] })));
    es.addEventListener('fim', () => {
      es.close();
      setEstado((e) => ({ ...e, status: 'pronto' }));
      void qc.invalidateQueries({ queryKey: ['veredito', vereditoId] });
    });
    es.addEventListener('falhou', (ev) => {
      es.close();
      setEstado((e) => ({ ...e, status: 'falhou', falha: (json(ev as MessageEvent).mensagem as string) ?? null }));
    });
    es.onerror = () => {
      // Sem conexão: o navegador tenta de novo sozinho e retoma do último evento. Fechado de vez: falha.
      if (es.readyState === EventSource.CLOSED) setEstado((e) => (e.status === 'gerando' ? { ...e, status: 'falhou', falha: null } : e));
    };
  }, [vereditoId, qc]);

  useEffect(() => {
    if (!guardado || guardado.status === 'gerando') conectar();
    return () => fonte.current?.close();
    // A conexão abre uma vez por veredito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vereditoId]);

  const tentarDeNovo = useCallback(async () => {
    await api(`/vereditos/${vereditoId}/raciocinio/regenerar`, { metodo: 'POST' });
    conectar();
  }, [vereditoId, conectar]);

  return { estado, tentarDeNovo };
}

function Divergencia({ bloco }: { bloco: BlocoRaciocinio }) {
  const t = useT();
  if (!bloco.divergencia) return null;
  return (
    <div className="flex flex-col gap-micro borda-fina bg-folha p-curto">
      <p className="text-rotulo text-nanquim">{t('ui.raciocinio.diverge')}</p>
      <p className="text-compacto text-nanquim">{t(bloco.divergencia === 'mais_favoravel' ? 'ui.raciocinio.divergeMais' : 'ui.raciocinio.divergeMenos')}</p>
    </div>
  );
}

export function Bloco({ bloco }: { bloco: BlocoRaciocinio }) {
  const t = useT();
  return (
    <article className="flex flex-col gap-curto traco-topo pt-base surge sem-quebra">
      <h3 className="text-subtitulo text-nanquim">{bloco.rotulo}</h3>
      <p className="max-w-texto text-corpo text-nanquim">{bloco.resumo}</p>
      <dl className="flex flex-col gap-compacto">
        <div className="flex flex-col gap-micro">
          <dt className="text-rotulo text-grafite">{t('ui.raciocinio.contraArgumento')}</dt>
          <dd className="max-w-texto text-compacto text-nanquim">{bloco.contraArgumento}</dd>
        </div>
        <div className="flex flex-col gap-micro">
          <dt className="text-rotulo text-grafite">{t('ui.raciocinio.oQueMudaria')}</dt>
          <dd className="max-w-texto text-compacto text-nanquim">{bloco.oQueMudaria}</dd>
        </div>
        <div className="flex flex-col gap-micro">
          <dt className="text-rotulo text-grafite">{t('ui.raciocinio.avaliacao')}</dt>
          <dd className="max-w-texto text-compacto text-nanquim">
            <span className="font-medium">{t(`ui.raciocinio.avaliacao.${bloco.avaliacao}`)}</span> {bloco.justificativa}
          </dd>
        </div>
      </dl>
      <Divergencia bloco={bloco} />
      {bloco.evidencias.length ? (
        <p className="flex flex-wrap items-baseline gap-x-curto gap-y-micro">
          <span className="text-legenda text-grafite">{t('ui.raciocinio.cita')}</span>
          {bloco.evidencias.map((id) => (
            <Citacao key={id} id={id} />
          ))}
        </p>
      ) : null}
    </article>
  );
}

/** Raciocínio guiado: segunda opinião rotulada, abaixo do veredito oficial e fora da folha. */
export function RaciocinioGuiado({ vereditoId, guardado, alvosEsperados }: { vereditoId: string; guardado: Raciocinio | null; alvosEsperados: number }) {
  const t = useT();
  const { estado, tentarDeNovo } = useRaciocinio(vereditoId, guardado);
  const rotulo =
    estado.provedor && estado.modelo
      ? t('ui.raciocinio.rotulo', { provedor: t(`ui.provedor.${estado.provedor}`), modelo: estado.modelo })
      : t('ui.raciocinio.rotuloSemModelo');
  const faltam = Math.max(0, alvosEsperados - estado.blocos.length);
  return (
    <SuperficieIa titulo={t('ui.resultado.raciocinio')} rotulo={rotulo}>
      <p className="max-w-texto text-compacto text-grafite">{t('ui.raciocinio.explica')}</p>
      <div aria-live="polite" className="flex flex-col gap-base">
        {/* Com a síntese pronta, ela vem primeiro e os blocos ficam recolhidos (DESIGN.md, Conteúdo da IA). */}
        {estado.sintese ? (
          <div className="flex flex-col gap-micro rounded-controle bg-folha p-base">
            <h3 className="text-subtitulo text-nanquim">{t('ui.raciocinio.sintese')}</h3>
            <p className="max-w-texto text-corpo text-nanquim">{estado.sintese}</p>
          </div>
        ) : null}
        {estado.sintese && estado.blocos.length ? (
          <Recolhivel titulo={t('ui.raciocinio.blocos')} contagem={estado.blocos.length} nivel="compacto">
            <div className="flex flex-col gap-base">
              {estado.blocos.map((b) => (
                <Bloco key={b.alvo} bloco={b} />
              ))}
            </div>
          </Recolhivel>
        ) : (
          estado.blocos.map((b) => <Bloco key={b.alvo} bloco={b} />)
        )}
        {estado.status === 'gerando' && faltam > 0 ? <EsqueletoTexto linhas={Math.min(faltam, 3) + 1} rotulo={t('ui.resultado.aguardandoRaciocinio')} parado /> : null}
      </div>
      {estado.candidatas.length ? (
        <div className="flex flex-col gap-compacto traco-topo pt-base">
          <h3 className="text-acao text-nanquim">{t('ui.resultado.candidatas')}</h3>
          <p className="max-w-texto text-compacto text-grafite">{t('ui.resultado.candidatas.explica')}</p>
          <ul className="flex flex-col gap-compacto">
            {estado.candidatas.map((k) => (
              <li key={k.nome} className="text-compacto text-nanquim">
                <span className="font-medium">{k.nome}</span> <span className="text-legenda text-grafite">{t('ui.raciocinio.candidataAvaliar')}</span>. {k.motivo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {estado.descartados.length ? (
        <Recolhivel titulo={t('ui.raciocinio.descartados')} contagem={estado.descartados.length} nivel="compacto">
          <ul className="flex flex-col gap-compacto">
            {estado.descartados.map((d, i) => (
              <li key={`${d.alvo}${i}`} className="text-compacto text-grafite">
                {t('ui.resultado.descartadoIa', { motivo: `${d.alvo}: ${d.motivo}` })}
              </li>
            ))}
          </ul>
        </Recolhivel>
      ) : null}
      {estado.status === 'falhou' ? (
        <div role="alert" className="flex flex-col items-start gap-curto">
          <p className="max-w-texto text-compacto text-nanquim">{estado.falha ? `${estado.falha} ${t('ui.resultado.falhaIa')}` : t('ui.resultado.falhaIa')}</p>
          <Botao variante="secundario" onClick={() => void tentarDeNovo()}>
            {t('ui.resultado.tentarDeNovo')}
          </Botao>
        </div>
      ) : null}
    </SuperficieIa>
  );
}

/** Raciocínio já concluído, sem fluxo (relatório e link de leitura). */
export function RaciocinioEstatico({ raciocinio }: { raciocinio: Raciocinio }) {
  const t = useT();
  return (
    <SuperficieIa
      titulo={t('ui.relatorio.capituloIa')}
      rotulo={t('ui.raciocinio.rotuloRelatorio', { provedor: t(`ui.provedor.${raciocinio.provedor ?? 'compativel'}`), modelo: raciocinio.modelo ?? '', versao: raciocinio.versaoPrompt ?? '' })}
    >
      <p className="max-w-texto text-compacto text-grafite">{t('ui.raciocinio.explica')}</p>
      {raciocinio.blocos.map((b) => (
        <Bloco key={b.alvo} bloco={b} />
      ))}
      {raciocinio.sintese ? (
        <div className="flex flex-col gap-micro traco-topo pt-base">
          <h3 className="text-acao text-nanquim">{t('ui.raciocinio.sintese')}</h3>
          <p className="max-w-texto text-corpo text-nanquim">{raciocinio.sintese}</p>
        </div>
      ) : null}
      {raciocinio.candidatas.length ? (
        <div className="flex flex-col gap-compacto traco-topo pt-base">
          <h3 className="text-acao text-nanquim">{t('ui.resultado.candidatas')}</h3>
          <p className="max-w-texto text-compacto text-grafite">{t('ui.resultado.candidatas.explica')}</p>
          <ul className="flex flex-col gap-compacto">
            {raciocinio.candidatas.map((k) => (
              <li key={k.nome} className="text-compacto text-nanquim">
                <span className="font-medium">{k.nome}</span>. {k.motivo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {raciocinio.descartados.length ? (
        <div className="flex flex-col gap-compacto traco-topo pt-base">
          <h3 className="text-acao text-nanquim">{t('ui.raciocinio.descartados')}</h3>
          <ul className="flex flex-col gap-micro">
            {raciocinio.descartados.map((d, n) => (
              <li key={`${d.alvo}${n}`} className="text-compacto text-grafite">
                {t('ui.resultado.descartadoIa', { motivo: `${d.alvo}: ${d.motivo}` })}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SuperficieIa>
  );
}
