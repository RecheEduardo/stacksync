// Esqueletos de carregamento (DESIGN.md: Estados vazios e carregamento; DV-52). O esqueleto é a fôrma antes do
// concreto: o desenho do que vai chegar, no lugar e no tamanho certos, em concreto ainda sem acabamento.
// - Blocos com o contorno de 3px em concreto escuro e fundo de papel (`forma`); linhas de texto e títulos como barras
//   de concreto escuro, com larguras que lembram texto. Raio zero, como todo o resto.
// - Nada de sombra: nada ali é clicável ainda (DG-14). Nada de brilho deslizando (clichê de kit).
// - O único movimento é a faixa de obra no topo, andando como fita de obra. Ela para com "reduzir movimento" e fica
//   parada no resultado e no relatório (`parado`, IV-23; conferido pelo lint de design).
// - Só aparece depois de 300ms, para não piscar quando a resposta é rápida; até lá, reserva o espaço.
import { useEffect, useState, type ReactNode } from 'react';
import { Simbolo } from './marca.tsx';

const LARGURAS = ['w-full', 'w-11/12', 'w-3/4', 'w-5/6', 'w-2/3'] as const;
const ALTURA = { texto: 'h-curto', rotulo: 'h-medio', titulo: 'h-amplo', pagina: 'h-secao', display: 'h-faixa' } as const;
type Altura = keyof typeof ALTURA;
const larg = (lista: readonly string[], i: number) => lista[i % lista.length] ?? 'w-full';

function useAtraso(ms = 300) {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisivel(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return visivel;
}

/** Faixa de obra do esqueleto: anda enquanto carrega; parada no resultado e no relatório. */
export function FaixaCarregando({ parado = false }: { parado?: boolean }) {
  return <span aria-hidden className={`block h-compacto shrink-0 zebrado border-2 border-nanquim ${parado ? '' : 'obra-andando'}`} />;
}

/** Contêiner de todo esqueleto: anuncia o carregamento, espera 300ms e põe a faixa de obra no topo. */
export function Forma({
  rotulo,
  parado = false,
  faixa = true,
  className = '',
  children,
}: {
  rotulo: string;
  parado?: boolean;
  faixa?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const visivel = useAtraso();
  return (
    <div role="status" aria-busy="true" className={`flex flex-col gap-base ${visivel ? '' : 'invisible'} ${className}`}>
      <span className="sr-only">{rotulo}</span>
      {faixa ? <FaixaCarregando parado={parado} /> : null}
      <div aria-hidden className="flex flex-col gap-base">
        {children}
      </div>
    </div>
  );
}

/** Uma barra de concreto no lugar de uma linha de texto, de um título ou de um rótulo. */
export function Barra({ altura = 'texto', largura = 'w-full', cor = 'bg-concreto-escuro', className = '' }: { altura?: Altura; largura?: string; cor?: string; className?: string }) {
  return <span className={`block shrink-0 ${cor} ${ALTURA[altura]} ${largura} ${className}`} />;
}

/** Linhas de texto: larguras variadas e a última mais curta, como um parágrafo de verdade. */
export function Linhas({ n = 3, altura = 'texto' }: { n?: number; altura?: Altura }) {
  return (
    <span className={`flex flex-col ${altura === 'texto' ? 'gap-compacto' : 'gap-curto'}`}>
      {Array.from({ length: n }, (_, i) => (
        <Barra key={i} altura={altura} largura={n > 1 && i === n - 1 ? 'w-2/3' : larg(LARGURAS, i)} />
      ))}
    </span>
  );
}

/** Bloco de fôrma: contorno de 3px em concreto escuro, papel por dentro (ou o fundo pedido). */
export function Caixa({ children, fundo = 'bg-folha', className = '' }: { children?: ReactNode; fundo?: string; className?: string }) {
  return <span className={`flex flex-col gap-curto forma p-base ${fundo} ${className}`}>{children}</span>;
}

/** Linha de opção (resposta, rádio, item de lista): selo quadrado e o texto. */
function LinhaOpcao({ largura = 'w-1/2' }: { largura?: string }) {
  return (
    <span className="flex min-h-opcao items-center gap-curto forma bg-folha px-base">
      <span className="size-selo shrink-0 bg-concreto-escuro" />
      <Barra largura={largura} />
    </span>
  );
}

const LARGURAS_OPCAO = ['w-1/2', 'w-1/3', 'w-2/5', 'w-3/5', 'w-1/4'];

/** Esqueleto genérico em linhas de opção (o formato mais comum do produto). */
export function Esqueleto({ linhas = 1, rotulo, parado = false }: { linhas?: number; rotulo: string; parado?: boolean }) {
  return (
    <Forma rotulo={rotulo} parado={parado}>
      <span className="flex flex-col gap-compacto">
        {Array.from({ length: linhas }, (_, i) => (
          <LinhaOpcao key={i} largura={larg(LARGURAS_OPCAO, i)} />
        ))}
      </span>
    </Forma>
  );
}

/** Texto que a IA ainda está lendo ou escrevendo: só linhas, sem bloco. */
export function EsqueletoTexto({ linhas = 3, rotulo, parado = false }: { linhas?: number; rotulo: string; parado?: boolean }) {
  return (
    <Forma rotulo={rotulo} parado={parado}>
      <Linhas n={linhas} />
    </Forma>
  );
}

/** Tabela: cabeçalho em rótulos e linhas separadas por traço. */
export function EsqueletoTabela({ linhas = 4, colunas = 4, rotulo, parado = false }: { linhas?: number; colunas?: number; rotulo: string; parado?: boolean }) {
  const celulas = (larg: (j: number) => string, altura: Altura = 'texto') =>
    Array.from({ length: colunas }, (_, j) => (
      <span key={j} className={`flex ${j === 0 ? 'flex-2' : 'hidden flex-1 md:flex'}`}>
        <Barra altura={altura} largura={larg(j)} />
      </span>
    ));
  return (
    <Forma rotulo={rotulo} parado={parado}>
      <span className="flex flex-col">
        <span className="flex items-center gap-base traco-base py-curto">{celulas((j) => (j === 0 ? 'w-1/4' : 'w-1/2'))}</span>
        {Array.from({ length: linhas }, (_, i) => (
          <span key={i} className="flex min-h-linha items-center gap-base traco-base py-curto last:border-b-0">
            {celulas((j) => (j === 0 ? larg(LARGURAS, i + 2) : 'w-2/3'))}
          </span>
        ))}
      </span>
    </Forma>
  );
}

/** Cartão de pergunta: rótulos, título, opções, campo de outra resposta e botões; ao lado, o "por que" e a textura. */
export function EsqueletoPergunta({ largo, rotulo }: { largo: boolean; rotulo: string }) {
  return (
    <Forma rotulo={rotulo} faixa={false}>
      <span className={largo ? 'grade-pergunta' : 'flex flex-col'}>
        <span className="flex min-w-0 flex-col gap-medio">
          <span className="flex gap-compacto">
            <Barra altura="rotulo" largura="w-faixa" />
            <Barra altura="rotulo" largura="w-trilho" className="hidden md:block" />
          </span>
          <Linhas n={2} altura="titulo" />
          <span className="flex flex-col gap-compacto">
            <Barra largura="w-1/2" />
            {LARGURAS_OPCAO.map((l) => (
              <LinhaOpcao key={l} largura={l} />
            ))}
          </span>
          <span className="flex flex-col gap-compacto">
            <Barra altura="texto" largura="w-1/4" />
            <span className="h-campo forma bg-folha" />
          </span>
          <span className="flex gap-compacto">
            <span className="h-botao w-trilho max-w-1/2 forma bg-folha" />
            <Barra altura="rotulo" largura="w-faixa" className="self-center" />
          </span>
        </span>
        {largo ? (
          <span className="flex flex-col gap-medio">
            <Caixa fundo="bg-campo">
              <Linhas n={2} altura="titulo" />
              <Linhas n={4} />
            </Caixa>
            <span className="min-h-trilho flex-1 forma bg-campo" />
          </span>
        ) : null}
      </span>
    </Forma>
  );
}

/** Folha do laudo (resultado, relatório, leitura pública): metadados, frase do veredito, índice e seções. Parada. */
export function EsqueletoLaudo({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo} parado className="folha">
      <span className="grid grid-cols-2 gap-base md:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="flex flex-col gap-compacto">
            <Barra largura="w-2/3" />
            <Barra largura={i % 2 ? 'w-full' : 'w-3/4'} />
          </span>
        ))}
      </span>
      <span className="regua-topo pt-amplo">
        <Linhas n={4} altura="titulo" />
      </span>
      <Caixa fundo="bg-campo">
        <Barra largura="w-1/4" />
        <Barra altura="titulo" largura="w-1/3" />
        <span className="h-regua forma bg-folha" />
      </Caixa>
      {[0, 1].map((i) => (
        <span key={i} className="flex flex-col gap-base regua-topo pt-amplo">
          <Barra altura="rotulo" largura="w-1/3" />
          <Linhas n={3} />
        </span>
      ))}
    </Forma>
  );
}

/** Revisão: título de cada seção e blocos com linhas. */
export function EsqueletoRevisao({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo}>
      {[3, 2, 4].map((n, i) => (
        <span key={i} className="flex flex-col gap-base regua-topo pt-amplo first:border-t-0 first:pt-0">
          <Barra altura="rotulo" largura="w-1/3" />
          <Caixa>
            <Linhas n={n} />
          </Caixa>
        </span>
      ))}
    </Forma>
  );
}

/** Trilho da análise: enquadramento, etapas em blocos, progresso em segmentos e âmbitos. */
export function EsqueletoTrilho({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo} className="px-base py-medio">
      <span className="flex flex-col gap-compacto">
        <Barra largura="w-1/2" />
        <Linhas n={2} altura="rotulo" />
        <Barra altura="rotulo" largura="w-1/3" />
      </span>
      <span className="flex flex-col gap-compacto">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex h-botao items-center forma bg-folha px-curto">
            <Barra largura={i % 2 ? 'w-1/2' : 'w-2/3'} />
          </span>
        ))}
      </span>
      <span className="flex gap-micro">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-curto flex-1 border-2 border-concreto-escuro" />
        ))}
      </span>
      <Linhas n={6} />
    </Forma>
  );
}

/** Formulário de conexão da IA: provedores em linhas de opção, campos e o botão. */
export function EsqueletoFormulario({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo}>
      <span className="flex flex-col gap-compacto">
        <Barra altura="rotulo" largura="w-1/3" />
        {['w-1/3', 'w-1/4', 'w-2/5', 'w-1/3', 'w-1/2'].map((l, i) => (
          <LinhaOpcao key={i} largura={l} />
        ))}
      </span>
      {[0, 1].map((i) => (
        <span key={i} className="flex flex-col gap-compacto">
          <Barra largura="w-1/4" />
          <span className="h-campo forma bg-folha" />
        </span>
      ))}
      <span className="h-botao w-trilho max-w-full forma bg-folha" />
    </Forma>
  );
}

/** Mapa de ajuste do cartaz da página de entrada: nome do eixo e a barra do diagrama, linha a linha. */
export function EsqueletoCartaz({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo}>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="grid gap-compacto traco-base pb-curto md:grid-cols-3 md:items-center">
          <Barra altura="rotulo" largura={larg(LARGURAS, i)} />
          <span className="h-secao forma bg-campo" />
          <Barra largura="w-1/2" className="hidden md:block" />
        </span>
      ))}
    </Forma>
  );
}

/** Uma página do aplicativo: título, linha de apoio e o bloco principal com uma coluna de contexto. */
export function EsqueletoPagina({ rotulo }: { rotulo: string }) {
  return (
    <Forma rotulo={rotulo} className="mx-auto w-full max-w-pagina px-base py-amplo md:px-amplo md:py-secao">
      <span className="flex flex-col gap-curto">
        <Barra altura="pagina" largura="w-2/3 md:w-1/3" />
        <Barra largura="w-3/4 md:w-1/3" />
      </span>
      <span className="grade-tarefa">
        <span className="folha flex flex-col gap-amplo">
          <Linhas n={3} altura="titulo" />
          <Linhas n={3} />
          <span className="grid gap-base md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Caixa key={i}>
                <Barra altura="rotulo" largura="w-1/2" />
                <Linhas n={2} />
              </Caixa>
            ))}
          </span>
        </span>
        <Caixa className="self-start">
          <Barra altura="titulo" largura="w-3/4" />
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-faixa forma bg-folha" />
          ))}
        </Caixa>
      </span>
    </Forma>
  );
}

/** Cabeçalho preto durante o carregamento: a assinatura no centro e o lugar dos botões. */
export function CabecalhoCarregando() {
  return (
    <div aria-hidden className="grade-barra h-barra border-b-4 border-sinal bg-cabecalho px-base md:px-medio">
      <Barra largura="w-1/2 md:w-1/3" />
      <Simbolo />
      <span className="flex justify-end">
        <span className="h-botao w-faixa border-2 border-concreto-escuro" />
      </span>
    </div>
  );
}

/**
 * Antes do catálogo de textos chegar (primeira carga da página): a casca vazia. Na página de entrada, o cabeçalho
 * claro e o título gigante em barras; no aplicativo, o cabeçalho preto e uma página. O rótulo vem pronto (sem
 * catálogo, não há chave de texto para consultar).
 */
export function EsqueletoInicio({ entrada, rotulo }: { entrada: boolean; rotulo: string }) {
  if (!entrada)
    return (
      <div className="min-h-dvh">
        <CabecalhoCarregando />
        <EsqueletoPagina rotulo={rotulo} />
      </div>
    );
  return (
    <div className="min-h-dvh">
      <div aria-hidden className="regua-base bg-folha">
        <div className="mx-auto flex h-barra w-full max-w-pagina items-center justify-between gap-base px-base md:px-amplo">
          <Simbolo />
          <span className="h-botao w-trilho max-w-1/2 forma bg-folha" />
        </div>
      </div>
      <Forma rotulo={rotulo} className="mx-auto w-full max-w-pagina px-base pt-amplo md:px-amplo md:pt-secao">
        <span className="flex flex-col gap-curto">
          <Barra altura="display" largura="w-2/3" />
          <Barra altura="display" largura="w-5/6" />
          <Barra altura="display" largura="w-full" cor="bg-marca" />
        </span>
        <span className="grid gap-amplo lg:grid-cols-12">
          <Caixa className="lg:col-span-5">
            <Linhas n={4} />
          </Caixa>
          <Caixa fundo="bg-cabecalho" className="lg:col-span-7">
            <Barra altura="rotulo" largura="w-1/3" />
            <Barra altura="titulo" largura="w-2/3" />
          </Caixa>
        </span>
      </Forma>
    </div>
  );
}
