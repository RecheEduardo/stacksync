// Cursores "pixel grotesco" (DESIGN.md, Cursores; DV-65): mapas de 16 por 16, preto chapado com contorno branco
// gerado sozinho, para ler no concreto, no cabeçalho preto e nos blocos amarelos. O amarelo e o vermelho só entram em
// detalhes (punho da mão, ampulheta, ajuda, proibido, centro da mira).
//
// O navegador não deixa o CSS redimensionar a imagem de um cursor: o tamanho vai dentro dela. Por isso os cursores
// são desenhados aqui, na partida, lendo do CSS o tamanho (--cursor-tamanho, no app.css) e as cores do tema
// (--cor-*), e gravados como variáveis --cursor-* no <html>. No desenvolvimento, mudar --cursor-tamanho no app.css
// redesenha na hora. Cada mapa tem até 14 por 14 e entra com 1 pixel de margem, onde cabe o contorno.
// Letras: X tinta, W papel, Y sinal, R marca, "." vazio.

const PADRAO = ['X', 'XX', 'XXX', 'XXXX', 'XXXXX', 'XXXXXX', 'XXXXXXX', 'XXXXXXXX', 'XXXXXXXXX', 'XXXXXX', 'XXX.XXX', 'XX..XXX', 'X....XXX', '.....XXX'];

const CLIQUE = ['....XX', '....XX', '....XX', '....XX', '....XXXXXX', '....XXWXWXX', '.XX.XXWXWXWX', '.XXXXXXXXXXX', '..XXXXXXXXXX', '..XXXXXXXXXX', '...XXXXXXXX', '....XXXXXXX', '....YYYYYYY', '....YYYYYYY'];

const TEXTO = ['...XXX.XXX', '......X', '......X', '......X', '......X', '......X', '.....XXX', '......X', '......X', '......X', '......X', '......X', '...XXX.XXX'];

const ESPERA = ['..XXXXXXXXXX', '...XWWWWWWX', '...XYYYYYYX', '....XYYYYX', '.....XYYX', '......XX', '.....XWWX', '....XWWWWX', '...XWWYYWWX', '...XYYYYYYX', '..XXXXXXXXXX'];

const AJUDA = ['X', 'XX', 'XXX', 'XXXX', 'XXXXX', 'XXXXXX', 'XXXXXXX', 'XXXX...YYYYYY', 'XX.XX..YXXXXY', 'X..XX..YYYYXY', '....XX.YYXXXY', '....XX.YYXYYY', '.......YYYYYY', '.......YYXYYY'];

const AGARRAR = ['..XX.XX.XX....', '..XX.XX.XX.XX.', '..XX.XX.XX.XX.', '..XX.XX.XX.XX.', '..XXXXXXXXXXX.', 'XX.XXXXXXXXXX.', 'XXXXXXXXXXXXX.', '.XXXXXXXXXXXX.', '..XXXXXXXXXX..', '...XXXXXXXXX..', '....XXXXXXX...', '....YYYYYYY...', '....YYYYYYY...'];

const AGARRANDO = ['..............', '..............', '...XX.XX.XX...', '..XXXWXXWXXXX.', '.XXXXXXXXXXXX.', 'XXXXXXXXXXXXX.', 'XXXXXXXXXXXXX.', '.XXXXXXXXXXXX.', '..XXXXXXXXXX..', '...XXXXXXXXX..', '....XXXXXXX...', '....YYYYYYY...', '....YYYYYYY...'];

const MOVER = ['......XX......', '.....XXXX.....', '....XXXXXX....', '......XX......', '..X...XX...X..', '.XX...XX...XX.', 'XXXXXXXXXXXXXX', 'XXXXXXXXXXXXXX', '.XX...XX...XX.', '..X...XX...X..', '......XX......', '....XXXXXX....', '.....XXXX.....', '......XX......'];

const COLUNA = ['..............', '..............', '.....X..X.....', '.....X..X.....', '..X..X..X..X..', '.XX..X..X..XX.', 'XXXXXX..XXXXXX', 'XXXXXX..XXXXXX', '.XX..X..X..XX.', '..X..X..X..X..', '.....X..X.....', '.....X..X.....', '..............', '..............'];

const LUPA = ['...XXXXX......', '..XWWWWWX.....', '.XWWWXWWWX....', '.XWWWXWWWX....', '.XWXXXXXWX....', '.XWWWXWWWX....', '.XWWWXWWWX....', '..XWWWWWX.....', '...XXXXXXX....', '........XXX...', '.........XXX..', '..........XXX.', '...........XX.'];

/** Gera um mapa de 14 por 14 a partir de uma regra por pixel. */
function gerar(regra: (r: number, c: number) => string): string[] {
  return Array.from({ length: 14 }, (_, r) => Array.from({ length: 14 }, (_, c) => regra(r, c)).join(''));
}

/** Placa de proibido: anel e diagonal em vermelho, miolo em papel. */
const PROIBIDO = gerar((r, c) => {
  const dx = c - 6.5;
  const dy = r - 6.5;
  const d = Math.sqrt(dx * dx + dy * dy);
  return d >= 4.4 && d <= 6.6 ? 'R' : d < 4.4 ? (Math.abs(dx - dy) <= 1 ? 'R' : 'W') : '.';
});

/** Mira: a cruz dos eixos da planta, com o centro em vermelho. */
const MIRA = gerar((r, c) => {
  const meioC = c === 6 || c === 7;
  const meioR = r === 6 || r === 7;
  return meioC && meioR ? 'R' : (meioC && (r <= 4 || r >= 9)) || (meioR && (c <= 4 || c >= 9)) ? 'X' : '.';
});

const transpor = (linhas: string[]) => Array.from({ length: 14 }, (_, c) => linhas.map((l) => l[c] ?? '.').join(''));
const semTracoVertical = (linhas: string[]) => linhas.map((l, r) => ([2, 3, 5, 6].includes(r) ? `${l.slice(0, 5)}W${l.slice(6)}` : l));

/** Nome, mapa, ponto quente (na grade de 16) e o cursor do sistema de reserva. */
const LISTA: [string, string[], number, number, string][] = [
  ['padrao', PADRAO, 1, 1, 'default'],
  ['clique', CLIQUE, 5.5, 1, 'pointer'],
  ['texto', TEXTO, 7.5, 7, 'text'],
  ['bloqueado', PROIBIDO, 7.5, 7.5, 'not-allowed'],
  ['espera', ESPERA, 7.5, 6.5, 'progress'],
  ['ajuda', AJUDA, 1, 1, 'help'],
  ['agarrar', AGARRAR, 7.5, 6.5, 'grab'],
  ['agarrando', AGARRANDO, 7.5, 7.5, 'grabbing'],
  ['mover', MOVER, 7.5, 7.5, 'move'],
  ['coluna', COLUNA, 7.5, 7.5, 'col-resize'],
  ['linha', transpor(COLUNA), 7.5, 7.5, 'row-resize'],
  ['ampliar', LUPA, 6.5, 5.5, 'zoom-in'],
  ['reduzir', semTracoVertical(LUPA), 6.5, 5.5, 'zoom-out'],
  ['mira', MIRA, 7.5, 7.5, 'crosshair'],
];

type Cores = Record<'X' | 'W' | 'Y' | 'R', string>;

/** Desenha um mapa num SVG do tamanho pedido: um caminho por cor, um quadrado por pixel, na grade de 16. */
function desenhar(mapa: string[], cores: Cores, tamanho: number): string {
  const g = Array.from({ length: 16 }, () => Array<string>(16).fill('.'));
  mapa.forEach((l, r) => [...l].forEach((v, c) => v !== '.' && (g[r + 1]![c + 1] = v)));
  const caminhos: Record<string, string> = { X: '', W: '', Y: '', R: '' };
  for (let r = 0; r < 16; r++)
    for (let c = 0; c < 16; c++) {
      let v = g[r]![c]!;
      if (v === '.') {
        // O vazio vizinho de qualquer pixel pintado (menos o papel) vira contorno de papel.
        let perto = false;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const x = g[r + dr]?.[c + dc];
            if (x && x !== '.' && x !== 'W') perto = true;
          }
        if (perto) v = 'W';
      }
      if (v !== '.') caminhos[v] += `M${c} ${r}h1v1h-1z`;
    }
  const corpo = Object.entries(caminhos)
    .filter(([, d]) => d)
    .map(([v, d]) => `<path fill='${cores[v as keyof Cores]}' d='${d}'/>`)
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${tamanho}' height='${tamanho}' viewBox='0 0 16 16' shape-rendering='crispEdges'>${corpo}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Lê o tamanho e as cores do CSS e grava as variáveis --cursor-* no <html>. Devolve false se o CSS ainda não chegou. */
function aplicar(): boolean {
  const raiz = document.documentElement;
  const css = getComputedStyle(raiz);
  const ler = (nome: string) => css.getPropertyValue(nome).trim();
  const cores: Cores = { X: ler('--cor-nanquim'), W: ler('--cor-folha'), Y: ler('--cor-sinal'), R: ler('--cor-marca') };
  const tamanho = Math.round(Math.min(128, Math.max(12, parseFloat(ler('--cursor-tamanho')) || 0)));
  if (!cores.X || !tamanho) return false;
  const escala = tamanho / 16;
  for (const [nome, mapa, x, y, reserva] of LISTA)
    raiz.style.setProperty(`--cursor-${nome}`, `url("${desenhar(mapa, cores, tamanho)}") ${Math.round(x * escala)} ${Math.round(y * escala)}, ${reserva}`);
  return true;
}

/** Desenha os cursores assim que o CSS estiver aplicado e, no desenvolvimento, de novo a cada mudança de CSS. */
export function iniciarCursores() {
  let tentativas = 0;
  const tentar = () => {
    if (!aplicar() && tentativas++ < 60) requestAnimationFrame(tentar);
  };
  tentar();
  if (import.meta.hot) import.meta.hot.on('vite:afterUpdate', () => aplicar());
}
