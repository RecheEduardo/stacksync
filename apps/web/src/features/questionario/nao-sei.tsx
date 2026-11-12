// T-06 Fluxo "não sei": trocar desconhecimento por estimativa marcada ou por lacuna. Um nível de
// perguntas-ponte (RN-80), conversão determinística explicada, campo "não sei, mas..." com a leitura
// da IA confirmável (RN-79), "como descobrir" e "quem pode saber". Sem tom de erro.
import type { CorpoResposta } from '@stacksync/contracts';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useT } from '../../lib/catalogo.tsx';
import type { CartaoPergunta } from '../../lib/tipos.ts';
import { Botao } from '../../components/ui/botao.tsx';
import { AreaTexto } from '../../components/ui/campo.tsx';
import { GrupoOpcoes, Opcao, OpcaoCaixa } from '../../components/ui/escolha.tsx';
import { LeituraTextoLivre, type Interpretacao } from './cartao.tsx';

interface Conversao {
  faixaOpcoes: string[] | null;
  faixaSinal: { sinal: string; faixa: [number, number] } | null;
  contraditorias: boolean;
  explicacoes: string[];
  texto: string;
}

export function PainelNaoSei({
  analiseId,
  cartao,
  salvando,
  aoUsar,
  aoRespondidaPorTexto,
}: {
  analiseId: string;
  cartao: CartaoPergunta;
  salvando: boolean;
  aoUsar: (corpo: CorpoResposta) => void;
  aoRespondidaPorTexto: () => void;
}) {
  const t = useT();
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [conversao, setConversao] = useState<Conversao | null>(null);
  const [ajustando, setAjustando] = useState(false);
  const [faixa, setFaixa] = useState<string[]>([]);
  const [texto, setTexto] = useState('');
  const [interpretacao, setInterpretacao] = useState<Interpretacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const converter = useMutation({
    mutationFn: (r: Record<string, string>) => api<Conversao>(`/analises/${analiseId}/perguntas/${cartao.id}/pontes`, { metodo: 'POST', corpo: { respostas: r } }),
    onSuccess: (c) => {
      setConversao(c);
      setFaixa(c.faixaOpcoes ?? []);
    },
  });
  const interpretar = useMutation({
    mutationFn: () => api<Interpretacao>(`/analises/${analiseId}/perguntas/${cartao.id}/interpretacoes`, { metodo: 'POST', corpo: { texto: texto.trim(), modo: 'nao_sei_mas' } }),
    onSuccess: setInterpretacao,
    onError: (e) => setErro(ehErroApi(e) ? e.message : t('ui.ia.foraDoAr')),
  });

  const usar = () => {
    if (!conversao) return;
    if (ajustando) {
      if (!faixa.length) return;
      return aoUsar({ valor: null, origem: 'inferencia', faixaOpcoes: cartao.opcoes.map((o) => o.id).filter((o) => faixa.includes(o)), meio: 'ponte' });
    }
    if (conversao.faixaOpcoes?.length) return aoUsar({ valor: null, origem: 'inferencia', faixaOpcoes: conversao.faixaOpcoes, meio: 'ponte' });
    if (conversao.faixaSinal) aoUsar({ valor: null, origem: 'inferencia', faixaSinal: conversao.faixaSinal, meio: 'ponte' });
  };

  return (
    <div className="flex flex-col gap-medio">
      <p className="max-w-texto text-corpo text-nanquim">{cartao.pontes.length ? t('ui.naoSei.acolhimento') : t('ui.naoSei.acolhimentoSemPonte')}</p>

      {cartao.pontes.map((ponte) => (
        <fieldset key={ponte.id} className="flex flex-col gap-compacto">
          <legend className="pb-compacto text-compacto font-medium text-nanquim">{ponte.texto}</legend>
          <GrupoOpcoes
            value={respostas[ponte.id] ?? ''}
            onValueChange={(v) => {
              const novas = { ...respostas, [ponte.id]: v };
              setRespostas(novas);
              setAjustando(false);
              converter.mutate(novas);
            }}
            className="flex flex-col gap-micro"
          >
            {ponte.opcoes.map((o) => (
              <Opcao key={o.id} value={o.id}>
                {o.rotulo}
              </Opcao>
            ))}
          </GrupoOpcoes>
        </fieldset>
      ))}

      {conversao ? (
        <div aria-live="polite" className="flex flex-col gap-curto rounded-controle bg-campo p-base">
          <p className="max-w-texto text-corpo text-nanquim">{conversao.texto}</p>
          {conversao.explicacoes.length ? (
            <ul className="flex flex-col gap-micro">
              {conversao.explicacoes.map((x) => (
                <li key={x} className="text-compacto text-grafite">
                  {x}
                </li>
              ))}
            </ul>
          ) : null}
          {ajustando && conversao.faixaOpcoes ? (
            <fieldset className="flex flex-col gap-micro">
              <legend className="pb-compacto text-rotulo text-nanquim">{t('ui.naoSei.ajustar')}</legend>
              {cartao.opcoes.map((o) => (
                <OpcaoCaixa key={o.id} checked={faixa.includes(o.id)} onCheckedChange={(v) => setFaixa((f) => (v === true ? [...f, o.id] : f.filter((x) => x !== o.id)))}>
                  {o.rotulo}
                </OpcaoCaixa>
              ))}
              <p className="text-legenda text-grafite">{t('ui.livre.ajustarFaixa')}</p>
            </fieldset>
          ) : null}
          <div className="flex flex-wrap gap-compacto">
            <Botao variante="primario" onClick={usar} disabled={salvando || (ajustando && !faixa.length)}>
              {t('ui.naoSei.usar')}
            </Botao>
            {conversao.faixaOpcoes && !ajustando ? (
              <Botao variante="secundario" onClick={() => setAjustando(true)}>
                {t('ui.naoSei.ajustar')}
              </Botao>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-compacto">
        <AreaTexto rotulo={t('ui.naoSei.campoLivre')} ajuda={t('ui.naoSei.campoLivre.ajuda')} rows={2} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)} />
        <div>
          <Botao variante="secundario" disabled={texto.trim().length < 2 || interpretar.isPending} onClick={() => interpretar.mutate()}>
            {interpretar.isPending ? t('ui.livre.interpretando') : t('ui.livre.interpretar')}
          </Botao>
        </div>
        {erro ? <p className="text-compacto text-critico">{erro}</p> : null}
        {interpretacao ? (
          <LeituraTextoLivre
            analiseId={analiseId}
            interpretacao={interpretacao}
            multipla={cartao.tipo === 'multipla'}
            aoDecidido={aoRespondidaPorTexto}
            aoDescartado={() => {
              setInterpretacao(null);
              setTexto('');
            }}
          />
        ) : null}
      </div>

      {cartao.comoDescobrir || cartao.quemPodeSaber ? (
        <dl className="flex flex-col gap-compacto">
          {cartao.comoDescobrir ? (
            <div className="flex flex-col gap-micro">
              <dt className="text-rotulo text-nanquim">{t('ui.naoSei.comoDescobrir')}</dt>
              <dd className="text-compacto text-grafite">{cartao.comoDescobrir}</dd>
            </div>
          ) : null}
          {cartao.quemPodeSaber ? (
            <div className="flex flex-col gap-micro">
              <dt className="text-rotulo text-nanquim">{t('ui.naoSei.quemPodeSaber')}</dt>
              <dd className="text-compacto text-grafite">{cartao.quemPodeSaber}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="flex flex-wrap gap-compacto traco-topo pt-base">
        <Botao variante="secundario" disabled={salvando} onClick={() => aoUsar({ valor: null, origem: 'desconhecida', meio: 'nao_sei' })}>
          {t('ui.naoSei.manter')}
        </Botao>
      </div>
    </div>
  );
}
