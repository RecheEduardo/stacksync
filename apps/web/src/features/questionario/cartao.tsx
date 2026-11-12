// T-05 Cartão de pergunta e C-02 Respostas sugeridas. As sugestões adiantam a leitura, nunca a
// escolha: nenhuma vem marcada (IV-19), a ordem é a do catálogo, "Não sei" tem as mesmas classes e
// medidas (IV-02) e o campo livre está sempre lá. Escolher com o ponteiro salva e avança; com o
// teclado, as setas marcam e Enter (ou "Próxima") salva.
import type { CorpoResposta } from '@stacksync/contracts';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { api, ehErroApi } from '../../lib/api.ts';
import { useT } from '../../lib/catalogo.tsx';
import { useEu } from '../../lib/sessao.ts';
import { useMidia } from '../../lib/tela.ts';
import type { CartaoPergunta, Profundidade } from '../../lib/tipos.ts';
import { PropostaIa } from '../../components/laudo/ia.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { Campo } from '../../components/ui/campo.tsx';
import { CaixaSelecao, classeOpcao, GrupoOpcoes, Opcao, OpcaoCaixa, SeloAtalho } from '../../components/ui/escolha.tsx';
import { Aviso, Recolhivel } from '../../components/ui/estado.tsx';
import { EsqueletoTexto } from '../../components/ui/esqueleto.tsx';
import { Projecao } from '../../components/ui/fundo.tsx';
import { ContextoPergunta } from './contexto.tsx';

const NAO_SEI = '__nao_sei';

export interface Interpretacao {
  id: string;
  proposta: { opcoes: string[]; rotulos: string[]; explicacao: string; entendeu: boolean } | null;
  falha: string | null;
  opcoes: Array<{ id: string; rotulo: string }>;
}

/** Proposta de leitura de um texto livre, com confirmar, ajustar ou descartar (RN-79). */
export function LeituraTextoLivre({
  analiseId,
  interpretacao,
  multipla,
  aoDecidido,
  aoDescartado,
}: {
  analiseId: string;
  interpretacao: Interpretacao;
  multipla: boolean;
  aoDecidido: () => void;
  aoDescartado: () => void;
}) {
  const t = useT();
  const eu = useEu();
  const [ajustando, setAjustando] = useState(!interpretacao.proposta?.entendeu);
  const [escolha, setEscolha] = useState<string[]>(interpretacao.proposta?.opcoes ?? []);
  const [erro, setErro] = useState<string | null>(null);
  const decidir = useMutation({
    mutationFn: (corpo: { decisao: 'confirmada' | 'ajustada' | 'descartada'; opcoes?: string[] }) =>
      api(`/analises/${analiseId}/interpretacoes/${interpretacao.id}/decisao`, { metodo: 'POST', corpo, salvamento: corpo.decisao !== 'descartada' }),
    onSuccess: (_, corpo) => (corpo.decisao === 'descartada' ? aoDescartado() : aoDecidido()),
    onError: (e) => setErro(ehErroApi(e) ? [e.message, e.detalhe].filter(Boolean).join(' ') : t('ui.erroSalvar')),
  });
  const ia = eu.data?.ia;
  const p = interpretacao.proposta;
  return (
    <PropostaIa
      titulo={t('ui.livre.titulo')}
      provedor={ia?.provedor ?? null}
      modelo={ia?.modelo ?? null}
      ocupado={decidir.isPending}
      aoConfirmar={p?.entendeu && !ajustando ? () => decidir.mutate({ decisao: 'confirmada' }) : undefined}
      aoAjustar={() => (ajustando && escolha.length ? decidir.mutate({ decisao: 'ajustada', opcoes: escolha }) : setAjustando(true))}
      aoDescartar={() => decidir.mutate({ decisao: 'descartada' })}
    >
      {interpretacao.falha ? <p className="max-w-texto text-compacto text-nanquim">{t('ui.livre.falha', { motivo: interpretacao.falha })}</p> : null}
      {p?.entendeu ? (
        <div className="flex flex-col gap-micro">
          <p className="text-corpo text-nanquim">{t(p.opcoes.length > 1 && !multipla ? 'ui.livre.entendemosFaixa' : 'ui.livre.entendemos', { leitura: p.rotulos.join(multipla ? '; ' : ' a ') })}</p>
          {p.explicacao ? <p className="max-w-texto text-compacto text-grafite">{p.explicacao}</p> : null}
        </div>
      ) : !interpretacao.falha ? (
        <p className="text-compacto text-nanquim">{t('ui.livre.naoEntendeu')}</p>
      ) : null}
      {ajustando ? (
        <fieldset className="flex flex-col gap-compacto">
          <legend className="pb-compacto text-rotulo text-nanquim">{t('ui.livre.ajustar')}</legend>
          {interpretacao.opcoes.map((o) => (
            <OpcaoCaixa
              key={o.id}
              checked={escolha.includes(o.id)}
              onCheckedChange={(v) => setEscolha((atual) => (v === true ? [...atual, o.id] : atual.filter((x) => x !== o.id)))}
            >
              {o.rotulo}
            </OpcaoCaixa>
          ))}
          <p className="text-legenda text-grafite">{multipla ? t('ui.livre.ajustarMultipla') : t('ui.livre.ajustarFaixa')}</p>
        </fieldset>
      ) : null}
      {erro ? (
        <p role="alert" className="text-compacto text-critico">
          {erro}
        </p>
      ) : null}
    </PropostaIa>
  );
}

export function Cartao({
  analiseId,
  profundidade,
  cartao,
  salvando,
  aoSalvar,
  aoNaoSei,
  aoPular,
  aoRespondidaPorTexto,
  semContexto = false,
}: {
  semContexto?: boolean;
  analiseId: string;
  profundidade: Profundidade;
  cartao: CartaoPergunta;
  salvando: boolean;
  aoSalvar: (corpo: CorpoResposta) => void;
  aoNaoSei: () => void;
  aoPular: () => void;
  aoRespondidaPorTexto: () => void;
}) {
  const t = useT();
  const largo = useMidia('(min-width: 1280px)') && !semContexto;
  const tituloId = useId();
  const idMedida = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  const ponteiro = useRef(false);
  const multipla = cartao.tipo === 'multipla';
  const atual = cartao.resposta;
  const valorAtual = atual && atual.origem !== 'desconhecida' ? atual.valor : null;

  const [sel, setSel] = useState<string>(typeof valorAtual === 'string' ? valorAtual : '');
  const [marcadas, setMarcadas] = useState<string[]>(Array.isArray(valorAtual) ? valorAtual : []);
  const sugeridas = cartao.opcoes.filter((o) => cartao.sugeridas.includes(o.id));
  const outras = cartao.opcoes.filter((o) => !cartao.sugeridas.includes(o.id));
  const respondidaForaDasSugestoes = (typeof valorAtual === 'string' && !cartao.sugeridas.includes(valorAtual)) || (Array.isArray(valorAtual) && valorAtual.some((v) => !cartao.sugeridas.includes(v)));
  const [verTodas, setVerTodas] = useState(!sugeridas.length || respondidaForaDasSugestoes);
  const [medida, setMedida] = useState(atual?.origem === 'medida');
  const [fonte, setFonte] = useState(atual?.fonte ?? '');
  const [mes, setMes] = useState(atual?.medidaEm ?? '');
  const [erroMedida, setErroMedida] = useState<string | null>(null);
  const [livre, setLivre] = useState('');
  const [interpretacao, setInterpretacao] = useState<Interpretacao | null>(null);

  // Nova pergunta em foco: o título recebe o foco, para teclado e leitor de tela.
  useEffect(() => {
    titulo.current?.focus();
  }, [cartao.id]);

  const interpretar = useMutation({
    mutationFn: () => api<Interpretacao>(`/analises/${analiseId}/perguntas/${cartao.id}/interpretacoes`, { metodo: 'POST', corpo: { texto: livre.trim(), modo: 'outra' } }),
    onSuccess: setInterpretacao,
  });

  const origemEscolhida = () => (profundidade !== 'rapido' && medida ? 'medida' : 'estimativa');
  const extrasMedida = () => (profundidade !== 'rapido' && medida ? { fonte: fonte.trim(), medidaEm: mes } : {});
  const medidaValida = () => {
    if (profundidade === 'rapido' || !medida) return true;
    if (!fonte.trim() || !/^\d{4}-\d{2}$/.test(mes)) {
      setErroMedida(t('ui.pergunta.medida.erro'));
      return false;
    }
    setErroMedida(null);
    return true;
  };

  const salvarOpcao = (valor: string) => {
    if (valor === NAO_SEI) return aoNaoSei();
    if (!medidaValida()) return;
    aoSalvar({ valor, origem: origemEscolhida(), meio: cartao.sugeridas.includes(valor) ? 'sugestao' : 'lista', ...extrasMedida() });
  };
  const salvarMultipla = () => {
    if (!marcadas.length || !medidaValida()) return;
    aoSalvar({ valor: marcadas, origem: origemEscolhida(), meio: marcadas.every((m) => cartao.sugeridas.includes(m)) ? 'sugestao' : 'lista', ...extrasMedida() });
  };

  const aoTeclar = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && sel) {
      e.preventDefault();
      salvarOpcao(sel);
    }
  };

  const limite = multipla && cartao.maxSelecoes ? cartao.maxSelecoes : null;
  const visiveis = [...sugeridas, ...(verTodas ? outras : [])];
  const atalho = (i: number) => (i < 9 ? i + 1 : undefined);
  const atalhoNaoSei = atalho(visiveis.length);

  // Teclas 1 a 9 escolhem a opção do mesmo número, inclusive "Não sei" (DV-27). Só valem com o foco dentro
  // do cartão e fora de campos de texto (WCAG 2.1.4), e escolher pela tecla salva como escolher pelo ponteiro.
  const aoTeclarCartao = (e: KeyboardEvent<HTMLElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || salvando) return;
    const alvo = e.target as HTMLElement;
    if (alvo.closest('input, textarea, select, [contenteditable="true"]')) return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1 || n > 9) return;
    const i = n - 1;
    if (i === visiveis.length) {
      e.preventDefault();
      aoNaoSei();
      return;
    }
    const opcao = visiveis[i];
    if (!opcao) return;
    e.preventDefault();
    if (multipla) {
      const marcada = marcadas.includes(opcao.id);
      if (!marcada && limite !== null && marcadas.length >= limite) return;
      setMarcadas((m) => (marcada ? m.filter((x) => x !== opcao.id) : [...m, opcao.id]));
    } else {
      setSel(opcao.id);
      salvarOpcao(opcao.id);
    }
  };
  const marcarPonteiro = () => {
    ponteiro.current = true;
  };

  return (
    <div className={largo ? 'grade-pergunta' : 'flex flex-col'}>
      <article aria-labelledby={tituloId} onKeyDown={aoTeclarCartao} className="flex min-w-0 flex-col gap-medio">
        <header className="flex flex-col gap-compacto">
          <p className="flex flex-wrap items-center gap-compacto">
            <span className="bg-nanquim px-compacto py-micro text-rotulo text-folha">{cartao.ambitoRotulo}</span>
            {cartao.pesoMaximo ? <span className="borda-fina bg-folha px-compacto py-micro text-rotulo text-nanquim">{t('ui.pergunta.pesoMaximo')}</span> : null}
          </p>
          <h2 id={tituloId} ref={titulo} tabIndex={-1} className="max-w-texto text-pergunta text-nanquim outline-none">
            {cartao.texto}
          </h2>
          {cartao.termos.length ? (
            <dl className="flex flex-col gap-micro">
              {cartao.termos.map((x) => (
                <div key={x.termo} className="text-compacto text-grafite">
                  <dt className="inline font-medium text-nanquim">{x.termo}: </dt>
                  <dd className="inline">{x.explicacao}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        <div className="flex flex-col gap-compacto">
          {cartao.origemSugestoes === 'padrao' ? (
            <Aviso>{cartao.avisoSugestoes ?? t('ui.pergunta.sugestoesIndisponiveis')}</Aviso>
          ) : sugeridas.length ? (
            <p className="text-legenda text-grafite">{t('ui.pergunta.sugeridas')} {t('ui.pergunta.atalhos')}</p>
          ) : null}

          {multipla ? (
            <fieldset aria-labelledby={tituloId} className="flex flex-col gap-compacto">
              {visiveis.map((o, i) => {
                const marcada = marcadas.includes(o.id);
                return (
                  <OpcaoCaixa
                    key={o.id}
                    atalho={atalho(i)}
                    checked={marcada}
                    disabled={!marcada && limite !== null && marcadas.length >= limite}
                    detalhe={o.detalhe}
                    onCheckedChange={(v) => setMarcadas((m) => (v === true ? [...m, o.id] : m.filter((x) => x !== o.id)))}
                  >
                    {o.rotulo}
                  </OpcaoCaixa>
                );
              })}
              <button type="button" className={classeOpcao} onClick={aoNaoSei}>
                {atalhoNaoSei ? <SeloAtalho n={atalhoNaoSei} /> : null}
                <span aria-hidden className="size-icone-grande shrink-0 rounded-caixa borda-fina bg-folha" />
                {t('ui.pergunta.naoSei')}
              </button>
              {limite ? <p className="text-legenda text-grafite">{t('ui.pergunta.limite', { n: limite })}</p> : null}
            </fieldset>
          ) : (
            <GrupoOpcoes
              aria-labelledby={tituloId}
              value={sel}
              onKeyDown={aoTeclar}
              onValueChange={(v) => {
                setSel(v);
                if (ponteiro.current) {
                  ponteiro.current = false;
                  salvarOpcao(v);
                }
              }}
              className="flex flex-col gap-compacto"
            >
              {visiveis.map((o, i) => (
                <Opcao key={o.id} value={o.id} detalhe={o.detalhe} atalho={atalho(i)} onPointerDown={marcarPonteiro} disabled={salvando}>
                  {o.rotulo}
                </Opcao>
              ))}
              <Opcao value={NAO_SEI} atalho={atalhoNaoSei} onPointerDown={marcarPonteiro} disabled={salvando}>
                {t('ui.pergunta.naoSei')}
              </Opcao>
            </GrupoOpcoes>
          )}

          {outras.length && sugeridas.length ? (
            <div>
              <Botao variante="discreto" aria-expanded={verTodas} onClick={() => setVerTodas((v) => !v)}>
                {verTodas ? t('ui.pergunta.verSugeridas') : t('ui.pergunta.verTodas', { n: cartao.opcoes.length })}
              </Botao>
            </div>
          ) : null}
        </div>

        {cartao.permiteMedida ? (
          <div className="flex flex-col gap-curto">
            <CaixaSelecao id={idMedida} checked={medida} onCheckedChange={(v) => setMedida(v === true)}>
              {t('ui.pergunta.medido')}
            </CaixaSelecao>
            {medida ? (
              <div className="grid gap-curto md:grid-cols-2">
                <Campo rotulo={t('ui.pergunta.fonte')} ajuda={t('ui.pergunta.fonte.ajuda')} value={fonte} maxLength={300} onChange={(e) => setFonte(e.target.value)} />
                <Campo rotulo={t('ui.pergunta.dataMedida')} type="month" value={mes} onChange={(e) => setMes(e.target.value)} erro={erroMedida} />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-compacto">
          <div className="flex flex-col gap-compacto md:flex-row md:items-end">
            <div className="min-w-0 flex-1">
              <Campo rotulo={t('ui.pergunta.outra')} ajuda={t('ui.pergunta.outra.ajuda')} value={livre} maxLength={1000} onChange={(e) => setLivre(e.target.value)} />
            </div>
            <Botao variante="secundario" disabled={livre.trim().length < 2 || interpretar.isPending} onClick={() => interpretar.mutate()}>
              {interpretar.isPending ? t('ui.livre.interpretando') : t('ui.livre.interpretar')}
            </Botao>
          </div>
          {interpretar.isPending ? <EsqueletoTexto linhas={3} rotulo={t('ui.livre.lendo')} /> : null}
          {interpretar.isError ? <p className="text-compacto text-critico">{ehErroApi(interpretar.error) ? interpretar.error.message : t('ui.ia.foraDoAr')}</p> : null}
          {interpretacao ? (
            <LeituraTextoLivre
              analiseId={analiseId}
              interpretacao={interpretacao}
              multipla={multipla}
              aoDecidido={aoRespondidaPorTexto}
              aoDescartado={() => {
                setInterpretacao(null);
                setLivre('');
              }}
            />
          ) : null}
        </div>

        {!largo ? (
          <Recolhivel titulo={t('ui.pergunta.porQue')} nivel="compacto">
            <ContextoPergunta cartao={cartao} />
          </Recolhivel>
        ) : null}

        <div className="flex flex-wrap items-center gap-compacto">
          <Botao variante="secundario" disabled={salvando || (multipla ? !marcadas.length : !sel)} onClick={() => (multipla ? salvarMultipla() : salvarOpcao(sel))}>
            {t('ui.pergunta.proxima')}
          </Botao>
          <Botao variante="discreto" onClick={aoPular} disabled={salvando}>
            {t('ui.pergunta.pular')}
          </Botao>
        </div>
      </article>

      {largo ? (
        <div className="flex flex-col gap-medio">
          <Projecao lado="direita">
            <aside aria-label={t('ui.pergunta.porQue')} className="flex flex-col gap-curto borda bg-campo p-medio">
              <h3 className="text-secao text-nanquim">{t('ui.pergunta.porQue')}</h3>
              <ContextoPergunta cartao={cartao} />
            </aside>
          </Projecao>
          {/* Textura de âmbito (DV-38): o nome do âmbito como material da coluna, no espaço que sobraria vazio. As linhas
              ficam fora do fluxo (absolutas), então a textura não dá altura à coluna: ela termina junto com os botões da
              pergunta, nunca abaixo deles, e tem no mínimo a altura do trilho. */}
          <Projecao tipo="madeira" lado="direita" className="flex flex-1 flex-col">
            <div aria-hidden className="relative h-full min-h-trilho overflow-hidden borda bg-campo select-none">
              <div className="absolute inset-0 flex flex-col p-compacto">
                {Array.from({ length: 40 }, (_, i) => (
                  <p key={i} className={`whitespace-pre text-codigo text-grafite-claro ${i % 2 ? '-ml-medio' : ''}`}>
                    {`${cartao.ambitoRotulo.toUpperCase()}   `.repeat(8)}
                  </p>
                ))}
              </div>
              <p className="absolute inset-x-0 bottom-0 bg-marca px-curto py-compacto text-secao text-sobre-marca">{cartao.ambitoRotulo}</p>
            </div>
          </Projecao>
        </div>
      ) : null}
    </div>
  );
}
