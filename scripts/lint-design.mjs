// Fitness functions de design (DESIGN.md, FD-01, FD-02, FD-04, FD-12), verificadas no código da interface.
// - FD-01: nenhum literal de cor nem valor arbitrário do Tailwind fora de tokens.css; espaços e medidas
//   só pelos tokens nomeados (nada de p-4, w-64, h-10).
// - FD-02: sem transition-all e sem animar propriedades de layout.
// - FD-12: camadas só pela escala fixa (z-base, z-trilho, z-sobreposicao, z-dialogo, z-aviso).
// - FD-04: todo texto de interface citado por chave existe no pacote de conteúdo (sob o lint de vocabulário).
// - FD-13 e FD-14: contraste mínimo e paridade de tokens no tema claro (o único) e na região invertida.
// - FD-15: raio zero em tudo. FD-16: nada de animação no veredito.
// - DV-65: nenhum cursor do sistema pelas classes do Tailwind; só os cursores em pixel do app.
// - tokens.css em dia com o frontmatter do DESIGN.md.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const src = join(raiz, 'apps/web/src');
const problemas = [];

function arquivos(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...arquivos(p));
    else if (/\.(tsx?|css)$/.test(nome)) out.push(p);
  }
  return out;
}

const COR = /(#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|\brgba?\(|\bhsla?\(|\boklch\()/;
// Valor arbitrário do Tailwind: utilitário terminado em -[...] (w-[...], data-[...]:) ou propriedade [x:y].
const ARBITRARIO = /(?:^|[\s"'`])(?:[\w-]+:)*[\w-]*-\[[^\]]+\]|(?:^|[\s"'`])\[[a-z-]+:[^\]]+\]/;
const ESPACO = /(?<![\w-])-?(?:p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|w|h|min-[wh]|max-[wh]|size|inset(?:-[xy])?|top|left|right|bottom|translate-[xy])-(\d+(?:\.\d+)?)(?![\d/.\w])/g;
const CAMADA = /(?<![\w-])z-\d+/;
// DV-65: os cursores do Tailwind trariam o do sistema de volta; use os utilitários cursor-* do app.css (pixel grotesco).
const CURSOR_SISTEMA = /(?<![\w-])cursor-(auto|default|pointer|wait|text|move|help|not-allowed|none|context-menu|progress|cell|crosshair|vertical-text|alias|copy|no-drop|grab|grabbing|all-scroll|[a-z]+-resize|zoom-in|zoom-out)(?![\w-])/;

for (const f of arquivos(src)) {
  const rel = relative(raiz, f).replace(/\\/g, '/');
  const texto = readFileSync(f, 'utf8');
  const ehTokens = rel.endsWith('styles/tokens.css');
  const linhas = texto.split('\n');
  linhas.forEach((linha, i) => {
    const onde = `${rel}:${i + 1}`;
    const codigo = linha.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    if (!ehTokens && COR.test(codigo)) problemas.push(`${onde}: literal de cor fora de tokens.css (FD-01)`);
    if (/transition-all|transition:\s*all|transition-property:\s*all/.test(codigo)) problemas.push(`${onde}: transition-all (FD-02)`);
    if (/transition(-property)?:\s*[^;]*\b(width|height|top|left|right|bottom|margin|padding)\b/.test(codigo)) problemas.push(`${onde}: animação de propriedade de layout (FD-02)`);
    if (rel.endsWith('.tsx') || rel.endsWith('.ts')) {
      // Só dentro de strings: classes do Tailwind.
      for (const s of codigo.match(/(["'`])(?:(?!\1).)*\1/g) ?? []) {
        // Expressões ${...} de template são código, não classes.
        if (ARBITRARIO.test(s.replace(/\$\{[^}]*\}/g, ' '))) problemas.push(`${onde}: valor arbitrário do Tailwind (FD-01): ${s.slice(0, 60)}`);
        for (const m of s.matchAll(ESPACO)) if (Number(m[1]) !== 0) problemas.push(`${onde}: espaço ou medida fora dos tokens (${m[0]})`);
        if (CAMADA.test(s)) problemas.push(`${onde}: z-index fora da escala fixa (FD-12)`);
        if (CURSOR_SISTEMA.test(s)) problemas.push(`${onde}: cursor do sistema; use cursor-padrao, cursor-clique etc. (DV-65)`);
      }
    }
    if (!ehTokens && rel.endsWith('.css') && /z-index:\s*\d/.test(codigo) && !/@utility z-/.test(linhas.slice(Math.max(0, i - 2), i).join('\n')))
      problemas.push(`${onde}: z-index literal fora da escala fixa (FD-12)`);
  });
}

// FD-04: chaves de texto citadas existem no pacote de conteúdo.
const pacote = JSON.parse(readFileSync(join(raiz, 'packages/content/gerado/conteudo.json'), 'utf8'));
for (const f of arquivos(src).filter((x) => /\.tsx?$/.test(x) && !x.includes('mostruario'))) {
  const rel = relative(raiz, f).replace(/\\/g, '/');
  for (const m of readFileSync(f, 'utf8').matchAll(/\bt\('([\w.-]+)'/g))
    if (!(m[1] in pacote.textos)) problemas.push(`${rel}: texto "${m[1]}" ausente do pacote de conteúdo (FD-04)`);
}

// FD-13 e FD-14: o tema claro e a região invertida (blocos pretos locais) têm os mesmos tokens de cor e passam os mínimos de contraste da WCAG 2.2
// (texto 4,5:1; gráficos e contornos 3:1), lidos do tokens.css gerado a partir do DESIGN.md.
{
  const css = readFileSync(join(src, 'styles/tokens.css'), 'utf8');
  const bloco = (seletor) => {
    const i = css.indexOf(`${seletor} {`);
    if (i < 0) return {};
    const fim = css.indexOf('}', i);
    return Object.fromEntries([...css.slice(i, fim).matchAll(/--cor-([\w-]+):\s*(#[0-9A-Fa-f]{6});/g)].map((m) => [m[1], m[2]]));
  };
  const temas = { claro: bloco(':root'), 'região invertida': bloco('[data-regiao="invertida"]') };
  const chaves = (o) => Object.keys(o).sort().join(',');
  if (chaves(temas.claro) !== chaves(temas['região invertida'])) problemas.push('tokens de cor diferentes entre o tema claro e a região invertida (FD-14)');
  // Tema escuro não existe mais (DV-49): nada de prefers-color-scheme nem data-tema.
  if (/prefers-color-scheme|data-tema/.test(css)) problemas.push('tokens.css com tema escuro: o StackSync tem um tema só, o claro (DV-49)');
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contraste = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  // Pares da v2.0 do DESIGN.md: texto sobre as superfícies; texto escuro sobre o amarelo; vermelho só como texto
  // grande (3:1); contornos e status contra papel e concreto; sobra e falta contra o papel, onde ficam os diagramas.
  const texto = [];
  for (const sup of ['mesa', 'folha', 'campo', 'realce', 'sobra-veu', 'falta-veu']) for (const cor of ['nanquim', 'grafite', 'grafite-claro']) texto.push([cor, sup]);
  texto.push(['sobre-sinal', 'sinal'], ['sobre-marca', 'marca'], ['sobre-marca', 'marca-hover'], ['sobre-cabecalho', 'cabecalho'], ['critico', 'folha']);
  const grafico = [['marca', 'folha'], ['marca', 'mesa'], ['sobra', 'folha'], ['falta', 'folha']];
  for (const cor of ['traco-controle', 'saudavel', 'critico']) for (const sup of ['folha', 'mesa']) grafico.push([cor, sup]);
  for (const [nome, cores] of Object.entries(temas)) {
    for (const [lista, minimo] of [[texto, 4.5], [grafico, 3]]) {
      for (const [a, b] of lista) {
        if (!cores[a] || !cores[b]) continue;
        const c = contraste(cores[a], cores[b]);
        if (c < minimo) problemas.push(`${nome}: ${a} sobre ${b} tem ${c.toFixed(2)}:1, abaixo de ${minimo}:1 (FD-13)`);
      }
    }
  }
}

// FD-15: raio zero em tudo (tokens e classes). FD-16: o veredito não anima (nada de motion no resultado).
{
  const css = readFileSync(join(src, 'styles/tokens.css'), 'utf8');
  for (const m of css.matchAll(/--raio-([\w-]+):\s*([^;]+);/g)) if (m[2].trim() !== '0px') problemas.push(`raio ${m[1]} = ${m[2]}: o brutalismo exige raio zero (FD-15)`);
  for (const f of arquivos(src)) {
    const rel = relative(raiz, f).replace(/\\/g, '/');
    const texto = readFileSync(f, 'utf8');
    if (/(?<![\w-])rounded-(full|sm|md|lg|xl|2xl|3xl)(?![\w-])/.test(texto) || [...texto.matchAll(/border-radius:\s*([^;]+);/g)].some((m) => !/^(0|0px|var\(--raio-[\w-]+\))$/.test(m[1].trim()))) problemas.push(`${rel}: raio diferente de zero (FD-15)`);
    if (/features\/(resultado|relatorio)\/|components\/laudo\//.test(rel) && /from 'motion/.test(texto)) problemas.push(`${rel}: animação no veredito (FD-16, IV-23)`);
    // O esqueleto do laudo também não anima: a faixa de obra fica parada no resultado e no relatório (DV-52).
    if (/features\/(resultado|relatorio)\/|components\/laudo\//.test(rel))
      for (const m of texto.matchAll(/<(Esqueleto\w*|Forma)\b[^>]*>/g)) if (!/\bparado\b/.test(m[0]) && m[1] !== 'EsqueletoLaudo') problemas.push(`${rel}: esqueleto animado no veredito (FD-16, DV-52)`);
  }
}

try {
  execFileSync(process.execPath, [join(raiz, 'apps/web/scripts/preparar.mjs'), '--verificar'], { stdio: 'pipe' });
} catch (e) {
  problemas.push(String(e.stderr || e.stdout || 'tokens.css desatualizado').trim());
}

if (problemas.length) {
  console.error(`Design fora das regras (${problemas.length}):\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log('Design: tokens, contraste do tema e da região invertida, raio zero, veredito sem animação, movimento, camadas e textos ok.');
