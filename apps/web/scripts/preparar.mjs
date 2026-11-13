// Prepara a interface antes do dev e do build:
// 1. gera src/styles/tokens.css a partir do frontmatter do DESIGN.md (fonte única dos tokens, FD-01),
//    com o tema claro (o único, DV-49), a paleta da região invertida (blocos pretos locais, como o cartaz da página
//    de entrada) e a impressão sempre clara (DG-13);
// 2. copia as fontes auto-hospedadas para public/fontes (FD-09): Archivo variável redonda e itálica
//    (peso e largura) e Courier Prime 400 e 700 (DV-31).
// Com --verificar, só confere se tokens.css está em dia com o DESIGN.md (usado pelo lint de design).
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const raiz = join(web, '../..');
const design = readFileSync(join(raiz, 'DESIGN.md'), 'utf8');
const fm = /^---\n([\s\S]*?)\n---/.exec(design.replace(/\r\n/g, '\n'));
if (!fm) throw new Error('DESIGN.md sem frontmatter.');
const t = parse(fm[1]);

const claro = t.colors;
const invertido = t['colors-invertido'];
for (const nome of Object.keys(claro)) if (!(nome in invertido)) throw new Error(`Token de cor sem valor na região invertida: ${nome} (FD-14).`);
for (const nome of Object.keys(invertido)) if (!(nome in claro)) throw new Error(`Token de cor só na região invertida: ${nome} (FD-14).`);
for (const [nome, v] of Object.entries(t.rounded)) if (v !== '0px') throw new Error(`Raio ${nome} = ${v}: o brutalismo exige raio zero em tudo (FD-15).`);

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

/** Cores, opacidades derivadas da tinta do tema e as sombras duras (DESIGN.md, Colors e Elevation & Depth). */
function tema(cores, invertida) {
  const tinta = cores.nanquim;
  const linhas = Object.entries(cores).map(([nome, valor]) => `  --cor-${nome}: ${valor};`);
  linhas.push(
    `  --cor-traco: rgba(${rgb(tinta)}, 0.16);`,
    `  --cor-hachura: rgba(${rgb(tinta)}, 0.3);`,
    `  --cor-faixa-indice: rgba(${rgb(tinta)}, 0.14);`,
    `  --cor-zona: rgba(${rgb(tinta)}, 0.08);`,
    `  --cor-textura: rgba(${rgb(tinta)}, 0.07);`,
    // Sombra que aperta e sombra que flutua: duras, em tinta, sem desfoque (DV-33).
    `  --sombra-aperta: 4px 4px 0 0 ${tinta};`,
    `  --sombra-aperta-alta: 6px 6px 0 0 ${tinta};`,
    `  --sombra-flutua: 8px 8px 0 0 ${tinta};`,
    '  --sombra-folha: none;',
    `  --textura-forma: ${texturaForma(tinta)};`,
    `  color-scheme: ${invertida ? 'dark' : 'light'};`,
  );
  return linhas;
}

/** Textura de forma de concreto (DESIGN.md, Camadas de fundo; DV-42): uma placa com as marcas das tábuas, as juntas
 *  (no topo e na esquerda) e os furos dos tirantes, na tinta do tema. SVG em data URI, um por tema. O SVG não tem
 *  tamanho próprio: ele se estica até o tamanho de ladrilho que o CSS der (utilitário textura-planta), com as posições
 *  em porcentagem, para que cada placa seja exatamente uma célula da grade dos eixos A–F e 1–4. */
function texturaForma(tinta) {
  const t = tinta.replace('#', '%23');
  const r = (x, y, w, h) => `%3Crect x='${x}' y='${y}' width='${w}' height='${h}'/%3E`;
  const tabuas = ['20%25', '40%25', '60%25', '80%25'].map((y) => r(0, y, '100%25', 1)).join('');
  const juntas = r(0, 0, '100%25', 2) + r(0, 0, 2, '100%25');
  const furos = [['12%25', '23%25'], ['88%25', '23%25'], ['12%25', '73%25'], ['88%25', '73%25']].map(([x, y]) => r(x, y, 6, 6)).join('');
  return (
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E` +
    `%3Cg fill='${t}' fill-opacity='.035'%3E${tabuas}%3C/g%3E` +
    `%3Cg fill='${t}' fill-opacity='.08'%3E${juntas}%3C/g%3E` +
    `%3Cg fill='${t}' fill-opacity='.16'%3E${furos}%3C/g%3E%3C/svg%3E")`
  );
}

const pilha = (familia) => familia.split(',').map((f) => (f.trim().includes(' ') ? `"${f.trim()}"` : f.trim())).join(', ');
const ehMono = (familia) => familia.startsWith('Courier');

const linhas = [
  '/* Gerado por apps/web/scripts/preparar.mjs a partir do frontmatter do DESIGN.md. Não edite à mão. */',
  '/* Único arquivo com literais de cor e medida (FD-01). Um tema só, o claro (DV-49). data-regiao="invertida" num',
  '   elemento cria um bloco preto local com a paleta invertida (o cartaz da página de entrada); impressão clara (DG-13). */',
  ':root {',
  ...tema(claro, false),
];
for (const [nome, v] of Object.entries(t.typography)) {
  linhas.push(
    `  --tipo-${nome}-familia: ${ehMono(v.fontFamily) ? 'var(--fonte-mono)' : 'var(--fonte)'};`,
    `  --tipo-${nome}-tamanho: ${v.fontSize};`,
    `  --tipo-${nome}-altura: ${v.lineHeight};`,
    `  --tipo-${nome}-peso: ${v.fontWeight};`,
    `  --tipo-${nome}-espacamento: ${v.letterSpacing ?? '0em'};`,
    `  --tipo-${nome}-largura: ${v.fontStretch ?? '100%'};`,
    `  --tipo-${nome}-caixa: ${v.textTransform ?? 'none'};`,
  );
}
linhas.push(`  --fonte: ${pilha(t.typography.corpo.fontFamily)};`, `  --fonte-mono: ${pilha(t.typography.dado.fontFamily)};`);
for (const [nome, v] of Object.entries(t.rounded)) linhas.push(`  --raio-${nome}: ${v};`);
for (const [nome, v] of Object.entries(t.spacing)) linhas.push(`  --esp-${nome}: ${v};`);
// Medidas de componentes e larguras da casca (DESIGN.md, Components e Layout).
const c = t.components;
linhas.push(
  `  --altura-botao: ${c['botao-primario'].height};`,
  `  --altura-campo: ${c.campo.height};`,
  `  --altura-opcao: ${c['opcao-resposta'].height};`,
  `  --altura-linha-tabela: ${c['linha-tabela'].height};`,
  `  --folha-padding: ${c['folha-laudo'].padding};`,
  `  --anotacao-padding: ${c['anotacao-ia'].padding};`,
  '  --borda: 3px;',
  '  --borda-fina: 2px;',
  '  --regua-grossa: 6px;',
  '  --altura-barra: 80px;',
  '  --largura-trilho: 272px;',
  '  --largura-leitura: 760px;',
  '  --largura-contexto: 380px;',
  '  --largura-laudo: 960px;',
  '  --largura-tabela: 1240px;',
  '  --largura-pagina: 1320px;',
  '  --largura-texto: 68ch;',
  '  --largura-rotulo-eixo: 208px;',
  '  --largura-leitura-eixo: 152px;',
  '  --altura-diagrama: 48px;',
  '  --altura-diagrama-detalhe: 84px;',
  '  --altura-diagrama-cartaz: 60px;',
  '  --altura-regua: 56px;',
  '  --icone: 16px;',
  '  --icone-grande: 20px;',
  '  --selo-atalho: 28px;',
  '  --simbolo: 48px;',
  '  --zebrado: 12px;',
  // Movimento (DESIGN.md, Motion).
  '  --curva-saida: cubic-bezier(0.23, 1, 0.32, 1);',
  '}',
  '',
  '[data-regiao="invertida"] {',
  ...tema(invertido, true),
  '}',
  '',
  '@media print {',
  '  [data-regiao="invertida"] {',
  ...tema(claro, false).map((l) => `  ${l}`),
  '  }',
  '}',
  '',
);
const css = linhas.join('\n');
const destino = join(web, 'src/styles/tokens.css');

if (process.argv.includes('--verificar')) {
  const atual = existsSync(destino) ? readFileSync(destino, 'utf8') : '';
  if (atual !== css) {
    console.error('tokens.css está desatualizado em relação ao DESIGN.md. Rode: pnpm --filter @stacksync/web run preparar');
    process.exit(1);
  }
  console.log('tokens.css em dia com o DESIGN.md.');
  process.exit(0);
}

writeFileSync(destino, css);
const fontes = join(web, 'public/fontes');
mkdirSync(fontes, { recursive: true });
// Só as fontes do orçamento atual ficam na pasta pública (FD-09).
for (const nome of readdirSync(fontes)) rmSync(join(fontes, nome));
const archivo = join(web, 'node_modules/@fontsource-variable/archivo');
copyFileSync(join(archivo, 'files/archivo-latin-wdth-normal.woff2'), join(fontes, 'archivo.woff2'));
copyFileSync(join(archivo, 'files/archivo-latin-wdth-italic.woff2'), join(fontes, 'archivo-italico.woff2'));
copyFileSync(join(archivo, 'LICENSE'), join(fontes, 'LICENCA-OFL-ARCHIVO.txt'));
const courier = join(web, 'node_modules/@fontsource/courier-prime');
for (const peso of [400, 700]) copyFileSync(join(courier, `files/courier-prime-latin-${peso}-normal.woff2`), join(fontes, `courier-prime-${peso}.woff2`));
copyFileSync(join(courier, 'LICENSE'), join(fontes, 'LICENCA-OFL-COURIER.txt'));
console.log('Tokens do tema claro e da região invertida gerados do DESIGN.md e fontes copiadas (Archivo redonda e itálica; Courier Prime 400 e 700).');
