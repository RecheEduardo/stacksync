// T-00 Página de entrada (DESIGN.md v2.1 "Concreto Aparente"; modo Persuade; gate DG-14 BLOCKER). Brutalismo em
// escala de cartaz: "MUDAR." gigante, na largura da grade, com letras que caem, blocos que se sobrepõem com projeções
// zebradas e chapadas, fitas de obra cruzadas que andam com a rolagem, números enormes vazando dos blocos e uma
// coreografia de entrada diferente em cada seção. Atrás de tudo, as camadas de fundo (forma de concreto, eixos e
// blocos figurativos). O mecanismo aparece com componentes reais: o mapa de ajuste do Exemplo B calculado pelo
// motor, um cartão de pergunta, as marcas de origem e a régua do Índice de Ajuste. Nenhuma afirmação comercial
// (IV-22). Com "reduzir movimento", tudo aparece pronto e as fitas ficam paradas.
import { Link } from '@tanstack/react-router';
import { m, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { lazy, Suspense, useRef, type ReactNode } from 'react';
import { useCatalogo, useT } from '../../lib/catalogo.tsx';
import { Botao } from '../../components/ui/botao.tsx';
import { useContagem } from '../../components/ui/contador.tsx';
import { CamadasFundo, Projecao } from '../../components/ui/fundo.tsx';
import { EsqueletoCartaz } from '../../components/ui/esqueleto.tsx';
import { Assinatura } from '../../components/ui/marca.tsx';
import { EscalaNiveis, NIVEIS } from '../../components/ui/niveis.tsx';
import { EscalaIndice } from '../../components/laudo/escala.tsx';
import { MarcaOrigem } from '../../components/laudo/certeza.tsx';

const CartazExemplo = lazy(() => import('./cartaz.tsx'));
const SAIDA = [0.23, 1, 0.32, 1] as const;
const NA_TELA = { once: true, margin: '0px 0px -12% 0px' } as const;

/** Linha do título que sobe de dentro de uma máscara. */
function Linha({ children, ordem }: { children: ReactNode; ordem: number }) {
  const sem = useReducedMotion();
  return (
    <span className="block overflow-hidden pb-micro">
      <m.span className="block" initial={sem ? false : { y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.75, ease: SAIDA, delay: 0.08 * ordem }}>
        {children}
      </m.span>
    </span>
  );
}

/** Palavra gigante cujas letras caem uma a uma e assentam com um passo além do ponto (DV-48). */
function PalavraQueCai({ palavra }: { palavra: string }) {
  const sem = useReducedMotion();
  // As letras soltas ficam fora da leitura de tela; ela lê a palavra inteira, não "m u d a r".
  return (
    <span className="block">
      <span className="sr-only">{palavra}</span>
      <span aria-hidden className="flex whitespace-nowrap">
        {Array.from(palavra).map((letra, i) => (
          <m.span
            key={`${letra}${i}`}
            className="inline-block"
            initial={sem ? false : { y: '-120%', rotate: i % 2 ? 10 : -10, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14, mass: 0.9, delay: 0.3 + i * 0.07 }}
          >
            {letra}
          </m.span>
        ))}
      </span>
    </span>
  );
}

/** Rótulo de bloco: tinta chapada com texto em papel, como placa de obra. */
function Placa({ children, cor = 'bg-nanquim text-folha' }: { children: ReactNode; cor?: string }) {
  return <span className={`inline-flex self-start px-compacto py-micro text-rotulo ${cor}`}>{children}</span>;
}

/** Texto de apoio solto sobre o fundo: caixa de tinta com texto em papel, para contrastar com a textura. */
function CaixaTexto({ children, codigo = false }: { children: ReactNode; codigo?: boolean }) {
  return <p className={`w-fit max-w-texto bg-nanquim px-curto py-compacto text-folha ${codigo ? 'text-codigo' : 'text-subtitulo'}`}>{children}</p>;
}

function Navegacao() {
  const t = useT();
  const link = 'h-botao items-center whitespace-nowrap borda bg-folha px-curto text-acao text-nanquim aperta hover:bg-sinal hover:text-sobre-sinal';
  return (
    <header className="regua-base bg-folha">
      <div className="mx-auto flex w-full max-w-pagina items-center gap-base px-base py-curto md:px-amplo">
        <Link to="/" className="rounded-controle">
          <Assinatura nome={t('ui.produto')} />
        </Link>
        <nav aria-label={t('entrada.nav.rotulo')} className="ml-auto flex items-center gap-curto">
          <Link to="/metodo" className={`${link} hidden md:inline-flex`}>
            {t('entrada.nav.metodo')}
          </Link>
          <Link to="/analises" className={`${link} inline-flex`}>
            {t('entrada.nav.analises')}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Abertura() {
  const sem = useReducedMotion();
  const t = useT();
  return (
    <section aria-labelledby="entrada-titulo" className="relative overflow-x-clip pt-amplo md:pt-secao">
      {/* @container: o tamanho de "MUDAR." é medido pela largura desta div (cqw), então a palavra nunca passa dela. */}
      <div className="@container mx-auto w-full max-w-pagina px-base md:px-amplo">
        <h1 id="entrada-titulo" className="relative text-nanquim">
          <span className="text-display">
            <Linha ordem={0}>
              {t('entrada.titulo.a')} {t('entrada.titulo.b')}
            </Linha>
          </span>
          {/* "MUDAR." na largura da grade, sobre um bloco amarelo deslocado. */}
          <span className="relative block text-gigante text-marca">
            <span aria-hidden className="absolute bottom-base left-faixa top-amplo hidden w-1/2 borda bg-sinal md:block" />
            <span className="relative">
              <PalavraQueCai palavra={t('entrada.titulo.c')} />
            </span>
          </span>
        </h1>
      </div>
      <div className="mx-auto grid w-full max-w-pagina gap-amplo px-base pt-medio md:px-amplo lg:grid-cols-12 lg:gap-medio">
        <m.div className="lg:col-span-5 lg:pt-secao" initial={sem ? false : { opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: SAIDA, delay: 0.7 }}>
          <Projecao grande>
            <div className="flex h-full flex-col justify-between gap-base borda bg-folha p-medio">
              <p className="text-subtitulo text-nanquim">{t('entrada.sub')}</p>
              <p className="text-codigo text-grafite">{t('entrada.tempo')}</p>
            </div>
          </Projecao>
        </m.div>
        <m.div className="lg:col-span-7 lg:-mt-amplo" initial={sem ? false : { opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.85 }}>
          <Projecao tipo="sinal" lado="direita" grande>
            <div className="flex flex-col gap-base borda bg-nanquim p-medio text-folha md:p-amplo">
              <Placa cor="bg-sinal text-sobre-sinal">{t('entrada.pergunta.rotulo')}</Placa>
              <p id="entrada-pergunta" className="text-pergunta text-folha">
                {t('entrada.pergunta.texto')}
              </p>
              <ul aria-labelledby="entrada-pergunta" className="grid gap-curto md:grid-cols-2">
                {(['planejamento', 'refatoracao'] as const).map((r, i) => (
                  <li key={r}>
                    <Link
                      to="/analises/nova"
                      search={{ ramo: r }}
                      className="group flex h-full items-start gap-curto borda border-folha bg-folha p-base text-nanquim aperta hover:bg-sinal hover:text-sobre-sinal"
                    >
                      <span aria-hidden className="grid size-selo shrink-0 place-items-center bg-nanquim text-dado text-folha">
                        {i + 1}
                      </span>
                      <span className="flex flex-col gap-micro">
                        <span className="text-subtitulo uppercase">{t(`ui.enquadramento.${r}`)}</span>
                        <span className="text-compacto">{t(`ui.enquadramento.${r}.detalhe`)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Projecao>
        </m.div>
      </div>
    </section>
  );
}

/** Uma fita de obra: frases reais do produto em caixa-alta, separadas por quadrados, repetidas para cobrir a largura. */
function Fita({ frases, x, inclinacao, clara }: { frases: string[]; x: ReturnType<typeof useTransform<number, string>> | undefined; inclinacao: string; clara: boolean }) {
  // A fita escura usa a tinta escura de sobre-sinal, a mesma do texto sobre o amarelo.
  const cor = clara ? 'bg-sinal text-sobre-sinal' : 'bg-sobre-sinal text-sinal';
  const quadrado = clara ? 'bg-sobre-sinal' : 'bg-sinal';
  const itens = [...frases, ...frases, ...frases];
  return (
    <div className={`absolute inset-x-0 border-y-4 border-nanquim ${cor} ${inclinacao}`} style={{ left: '-10%', right: '-10%' }}>
      <m.div className="flex w-max items-center gap-medio whitespace-nowrap py-curto" style={x ? { x } : {}}>
        {itens.map((f, i) => (
          <span key={i} className="flex items-center gap-medio text-secao">
            {f}
            <span className={`inline-block size-base ${quadrado}`} />
          </span>
        ))}
      </m.div>
    </div>
  );
}

/** Fitas de obra cruzadas que andam conforme a rolagem (DV-47): sem movimento automático, então sem pausa. */
function FitasDeObra() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const reduzir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-30%', '0%']);
  const frases = [1, 2, 3, 4, 5, 6].map((n) => t(`entrada.fita.${n}`));
  return (
    <div ref={ref} aria-hidden className="relative mt-secao h-trilho overflow-hidden select-none">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
        <Fita frases={frases} x={reduzir ? undefined : x1} inclinacao="-rotate-3 -translate-y-1/2" clara />
        <Fita frases={[...frases].reverse()} x={reduzir ? undefined : x2} inclinacao="rotate-2" clara={false} />
      </div>
    </div>
  );
}

function Cartaz() {
  const sem = useReducedMotion();
  const t = useT();
  return (
    <section aria-labelledby="entrada-exemplo" className="mx-auto w-full max-w-pagina px-base pt-secao md:px-amplo">
      <m.div initial={sem ? false : { opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={NA_TELA} transition={{ duration: 0.6, ease: SAIDA }}>
        <Projecao tipo="sinal" lado="direita" grande>
          <figure data-regiao="invertida" className="flex flex-col gap-medio borda border-cabecalho bg-mesa p-base text-nanquim md:p-amplo">
            <figcaption className="flex flex-col gap-curto regua-base pb-medio md:flex-row md:items-end md:justify-between md:gap-amplo">
              <span className="flex flex-col gap-compacto">
                <Placa cor="bg-sinal text-sobre-sinal">{t('entrada.exemplo.rotulo')}</Placa>
                <h2 id="entrada-exemplo" className="text-titulo text-nanquim">
                  {t('entrada.exemplo.titulo')}
                </h2>
              </span>
              <p className="max-w-texto text-compacto text-grafite">{t('entrada.exemplo.legenda')}</p>
            </figcaption>
            <Suspense fallback={<EsqueletoCartaz rotulo={t('entrada.exemplo.carregando')} />}>
              <CartazExemplo />
            </Suspense>
          </figure>
        </Projecao>
      </m.div>
    </section>
  );
}

/** Faixa de obra (DV-37): a passagem para "como funciona", com a placa no meio. */
function FaixaDeObra({ rotulo }: { rotulo: string }) {
  return (
    <div className="mt-faixa flex items-stretch regua-topo regua-base">
      <span aria-hidden className="zebrado min-h-maior flex-1" />
      <span className="flex items-center bg-nanquim px-amplo py-curto text-titulo text-folha">{rotulo}</span>
      <span aria-hidden className="zebrado min-h-maior flex-1" />
    </div>
  );
}

function FragmentoPergunta() {
  const t = useT();
  const respostas = ['entrada.como.amostra.r1', 'entrada.como.amostra.r2', 'entrada.como.amostra.r3', 'entrada.como.amostra.naoSei'];
  return (
    <div className="flex flex-col gap-compacto">
      <p className="text-subtitulo text-nanquim">{t('entrada.como.amostra.pergunta')}</p>
      {respostas.map((r, i) => (
        <span key={r} className={`flex min-h-botao items-center gap-curto borda-fina px-compacto text-compacto font-medium ${i === 1 ? 'bg-sinal text-sobre-sinal' : 'bg-folha text-nanquim'}`}>
          <span className={`grid size-icone-grande shrink-0 place-items-center text-codigo ${i === 1 ? 'bg-folha text-sobre-sinal' : 'bg-nanquim text-folha'}`}>{i + 1}</span>
          {t(r)}
        </span>
      ))}
    </div>
  );
}

const PROJECAO_ETAPA = ['madeira', 'zebra', 'marca', 'sinal'] as const;

function ComoFunciona() {
  const sem = useReducedMotion();
  const t = useT();
  return (
    <section aria-labelledby="entrada-como" className="mx-auto flex w-full max-w-pagina flex-col gap-faixa px-base pt-secao md:px-amplo">
      <div className="flex flex-col gap-curto">
        <h2 id="entrada-como" className="text-display text-nanquim">
          {t('entrada.como.titulo')}
        </h2>
        <CaixaTexto>{t('entrada.como.sub')}</CaixaTexto>
      </div>
      <ol className="grid gap-faixa md:grid-cols-2 md:gap-x-secao xl:grid-cols-4 xl:gap-x-amplo">
        {([1, 2, 3, 4] as const).map((n, i) => (
          <m.li
            key={n}
            className="pt-secao md:pt-faixa"
            initial={sem ? false : { opacity: 0, x: i % 2 ? 80 : -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={NA_TELA}
            transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.08 * i }}
          >
            <div className="relative h-full">
              <Projecao tipo={PROJECAO_ETAPA[i] ?? 'zebra'} lado="esquerda" className="h-full">
                <div className="flex h-full flex-col borda bg-folha">
                  <h3 className="regua-base p-base text-secao text-nanquim">
                    <span className="sr-only">{t('entrada.como.passo', { n })}: </span>
                    {t(`entrada.como.${n}.titulo`)}
                  </h3>
                  <p className="p-base text-corpo text-grafite">{t(`entrada.como.${n}.texto`)}</p>
                  <div aria-hidden className="mt-auto regua-topo bg-campo p-base">
                    {n === 1 ? (
                      <div className="flex flex-col gap-compacto">
                        {(['planejamento', 'refatoracao'] as const).map((r, j) => (
                          <span key={r} className={`flex min-h-botao items-center gap-curto borda-fina px-compacto text-compacto font-medium ${j === 1 ? 'bg-sinal text-sobre-sinal' : 'bg-folha text-nanquim'}`}>
                            <span className={`grid size-icone place-items-center borda-fina ${j === 1 ? 'border-sobre-sinal bg-folha' : 'bg-folha'}`}>
                              {j === 1 ? <span className="size-compacto bg-sobre-sinal" /> : null}
                            </span>
                            {t(`ui.enquadramento.${r}`)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {n === 2 ? <FragmentoPergunta /> : null}
                    {n === 3 ? (
                      <div className="flex flex-col gap-compacto">
                        {(['medida', 'estimativa', 'desconhecida'] as const).map((o) => (
                          <MarcaOrigem key={o} origem={o} />
                        ))}
                        <p className="text-codigo text-grafite">{t('entrada.como.amostra.composicao')}</p>
                      </div>
                    ) : null}
                    {n === 4 ? (
                      <div className="flex flex-col gap-compacto">
                        <p className="text-subtitulo text-nanquim">{t('entrada.como.amostra.frase')}</p>
                        <EscalaIndice faixa={{ lo: 52, hi: 66, pt: 59 }} rotulo={t('entrada.como.amostra.indice')} />
                        <p className="text-codigo text-grafite">{t('entrada.como.amostra.indice')}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Projecao>
              {/* Número gigante apoiado no topo do bloco, vazando só na borda (DV-48): nunca cobre o título. */}
              <span aria-hidden className="pointer-events-none absolute bottom-full right-0 translate-y-curto text-display text-marca">
                {String(n).padStart(2, '0')}
              </span>
            </div>
          </m.li>
        ))}
      </ol>
    </section>
  );
}

function Niveis() {
  const sem = useReducedMotion();
  const t = useT();
  const cat = useCatalogo();
  return (
    <section aria-labelledby="entrada-niveis" className="mx-auto flex w-full max-w-pagina flex-col gap-amplo px-base pt-faixa md:px-amplo">
      <div className="flex flex-col gap-curto">
        <Placa>{t('entrada.niveis.rotulo')}</Placa>
        <h2 id="entrada-niveis" className="text-titulo text-nanquim">
          {t('entrada.niveis.titulo')}
        </h2>
        <CaixaTexto>{t('entrada.niveis.texto')}</CaixaTexto>
      </div>
      <m.div initial={sem ? false : { opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={NA_TELA} transition={{ duration: 0.6, ease: SAIDA }}>
        <Projecao grande>
          <div className="folha flex flex-col gap-amplo">
            <EscalaNiveis />
            <dl className="grid gap-medio md:grid-cols-3">
              {NIVEIS.map((p) => (
                <div key={p} className="flex flex-col gap-compacto regua-topo pt-curto">
                  <dt className="text-secao text-nanquim">{cat.estrutura.profundidades[p].rotulo}</dt>
                  <dd className="text-compacto text-grafite">{t(`entrada.niveis.traz.${p}`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Projecao>
      </m.div>
    </section>
  );
}

/** Percentual que conta de zero ao entrar na tela, e a barra que sobe junto. */
function BarraPercentual({ valor, centro, rotulo }: { valor: number; centro: boolean; rotulo: string }) {
  const sem = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, NA_TELA);
  const contado = useContagem(visto || sem ? valor : 0, { duracao: 1.1, casas: 1, desde: 0 });
  return (
    <div ref={ref} className="flex h-full flex-col justify-end gap-compacto">
      <span className={`whitespace-nowrap text-numero ${centro ? 'text-marca' : 'text-nanquim'}`}>{`${contado.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</span>
      <m.span
        className={`block w-full borda ${centro ? 'zebrado' : 'bg-folha'}`}
        style={{ height: `${(valor / 33.3) * 62}%`, originY: 1 }}
        initial={sem ? false : { scaleY: 0 }}
        animate={{ scaleY: visto || sem ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      />
      <span className={`text-rotulo ${centro ? 'text-nanquim' : 'text-grafite'}`}>{rotulo}</span>
    </div>
  );
}

function ViesDeAcao() {
  const t = useT();
  const barras = [
    { rotulo: 'entrada.vies.ladoA', valor: 14.2, centro: false },
    { rotulo: 'entrada.vies.centro', valor: 33.3, centro: true },
    { rotulo: 'entrada.vies.ladoB', valor: 12.6, centro: false },
  ];
  return (
    <section aria-labelledby="entrada-vies" className="mx-auto w-full max-w-pagina px-base pt-faixa md:px-amplo">
      <Projecao tipo="marca" grande>
        <div className="grid borda bg-folha lg:grid-cols-12">
          <div className="flex flex-col gap-base p-medio md:p-amplo lg:col-span-5 lg:traco-direita">
            <Placa>{t('entrada.vies.rotulo')}</Placa>
            <h2 id="entrada-vies" className="text-titulo text-nanquim">
              {t('entrada.vies.titulo')}
            </h2>
            <p className="text-corpo text-grafite">{t('entrada.vies.texto')}</p>
            <p className="borda bg-sinal p-base text-subtitulo text-sobre-sinal">{t('entrada.vies.produto')}</p>
            <p className="text-codigo text-grafite">{t('entrada.vies.fonte')}</p>
          </div>
          <figure role="img" aria-label={t('entrada.vies.aria')} className="flex flex-col gap-base regua-topo bg-campo p-medio md:p-amplo lg:col-span-7 lg:border-t-0">
            <figcaption className="text-rotulo text-grafite">{t('entrada.vies.grafico')}</figcaption>
            <div aria-hidden className="grid min-h-faixa grid-cols-3 items-end gap-base regua-base pb-compacto md:h-trilho lg:h-auto lg:flex-1">
              {barras.map((b) => (
                <BarraPercentual key={b.rotulo} valor={b.valor} centro={b.centro} rotulo={t(b.rotulo)} />
              ))}
            </div>
            <p className="text-subtitulo text-nanquim">{t('entrada.vies.ficou')}</p>
          </figure>
        </div>
      </Projecao>
    </section>
  );
}

function PapelDaIa() {
  const sem = useReducedMotion();
  const t = useT();
  const lista = (chave: 'faz' | 'naoFaz', desde: number) => (
    <m.div className="flex flex-col gap-base p-medio md:p-amplo" initial={sem ? false : { opacity: 0, x: desde }} whileInView={{ opacity: 1, x: 0 }} viewport={NA_TELA} transition={{ duration: 0.55, ease: SAIDA }}>
      <h3 className="text-secao text-nanquim">{t(`entrada.ia.${chave}`)}</h3>
      <ul className="flex flex-col traco-topo">
        {[1, 2, 3, 4].map((n) => (
          <li key={n} className="traco-base py-curto text-corpo text-nanquim">
            {t(`entrada.ia.${chave}.${n}`)}
          </li>
        ))}
      </ul>
    </m.div>
  );
  return (
    <section aria-labelledby="entrada-ia" className="mx-auto flex w-full max-w-pagina flex-col gap-amplo overflow-x-clip px-base pt-faixa md:px-amplo">
      <div className="flex flex-col gap-curto">
        <Placa>{t('entrada.ia.rotulo')}</Placa>
        <h2 id="entrada-ia" className="text-display text-nanquim">
          {t('entrada.ia.titulo')}
        </h2>
        <CaixaTexto>{t('entrada.ia.texto')}</CaixaTexto>
      </div>
      <Projecao tipo="madeira" lado="direita" grande>
        <div className="grid borda bg-folha md:grid-cols-2">
          <div className="md:border-r-8 md:border-marca">{lista('faz', -80)}</div>
          <div className="regua-topo md:border-t-0">{lista('naoFaz', 80)}</div>
        </div>
      </Projecao>
      <CaixaTexto codigo>{t('entrada.ia.chave')}</CaixaTexto>
    </section>
  );
}

function Fechamento() {
  const sem = useReducedMotion();
  const t = useT();
  return (
    <section aria-labelledby="entrada-fim" className="mx-auto w-full max-w-pagina px-base pb-faixa pt-faixa md:px-amplo">
      <m.div initial={sem ? false : { opacity: 0, scale: 0.9, rotate: -1.5 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={NA_TELA} transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
        <Projecao grande lado="direita">
          <div className="flex flex-col gap-medio borda bg-sinal p-amplo text-sobre-sinal md:p-secao">
            <h2 id="entrada-fim" className="text-titulo text-sobre-sinal sm:text-display">
              {t('entrada.fim.titulo')}
            </h2>
            <div className="flex flex-col gap-base border-t-4 border-sobre-sinal pt-medio md:flex-row md:items-center md:justify-between">
              <p className="text-subtitulo">{t('entrada.fim.texto')}</p>
              <Botao variante="sobreMarca" comoFilho>
                <Link to="/analises/nova">{t('entrada.fim.acao')}</Link>
              </Botao>
            </div>
          </div>
        </Projecao>
      </m.div>
    </section>
  );
}

export function PaginaEntrada() {
  const t = useT();
  return (
    <div className="min-h-dvh">
      <CamadasFundo variante="entrada" />
      <div className="relative z-base">
        <Navegacao />
        <main className="overflow-x-clip">
          <Abertura />
          <FitasDeObra />
          <Cartaz />
          <FaixaDeObra rotulo={t('entrada.como.rotulo')} />
          <ComoFunciona />
          <Niveis />
          <ViesDeAcao />
          <PapelDaIa />
          <Fechamento />
        </main>
        <footer className="regua-grossa bg-folha">
          <div className="mx-auto flex w-full max-w-pagina flex-wrap items-center gap-base px-base py-medio md:px-amplo">
            <Assinatura nome={t('ui.produto')} />
            <span className="text-codigo text-grafite">{t('entrada.rodape.ilustrativo')}</span>
            <span className="ml-auto flex gap-base">
              <Link to="/metodo" className="text-acao text-nanquim underline decoration-2">
                {t('ui.painel.metodo')}
              </Link>
              <Link to="/configuracoes/dados" className="text-acao text-nanquim underline decoration-2">
                {t('entrada.rodape.dados')}
              </Link>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
