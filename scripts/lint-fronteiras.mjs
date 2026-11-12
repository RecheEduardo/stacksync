// FF-01 e FF-02: fronteiras entre áreas e pureza do motor. Falha com código 1 se algo quebrar.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const problemas = [];

function arquivos(dir, ext = /\.(ts|tsx)$/) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (nome === 'node_modules' || nome === 'dist' || nome === 'gerado') continue;
    if (statSync(p).isDirectory()) out.push(...arquivos(p, ext));
    else if (ext.test(nome)) out.push(p);
  }
  return out;
}

// FF-02: o motor é puro (sem I/O, relógio, aleatoriedade ou funções transcendentes; DC-01).
const proibidosMotor = [
  [/\bDate\b/, 'Date (a data de referência é entrada)'],
  [/Math\.random/, 'Math.random'],
  [/Math\.pow|\*\*/, 'potência fora de multiplicação repetida (DC-01)'],
  [/Math\.exp|Math\.log/, 'Math.exp ou Math.log (DC-01)'],
  [/from ['"]node:/, 'módulo do Node.js (I/O)'],
  [/from ['"](fs|path|http|https|net|child_process|crypto)['"]/, 'módulo de I/O'],
  [/\bfetch\(/, 'fetch (I/O)'],
  [/from ['"]@stacksync\/(api|web)/, 'importa uma aplicação'],
];
for (const f of arquivos(join(raiz, 'packages/engine/src'))) {
  const texto = readFileSync(f, 'utf8');
  const codigo = texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  for (const [re, motivo] of proibidosMotor) if (re.test(codigo)) problemas.push(`${relative(raiz, f)}: ${motivo}`);
  for (const linha of texto.split('\n'))
    if (/^import .* from ['"]@stacksync\/content/.test(linha) && !/^import type /.test(linha))
      problemas.push(`${relative(raiz, f)}: importa conteúdo em tempo de execução; use "import type" (FF-02)`);
}

// FF-01: o motor não conhece a IA; a interface do questionário não importa nada de veredito (IV-01).
const webSrc = join(raiz, 'apps/web/src');
try {
  for (const f of arquivos(webSrc)) {
    const rel = relative(raiz, f).replace(/\\/g, '/');
    const texto = readFileSync(f, 'utf8');
    if (/features\/questionario\//.test(rel) && /(veredito|resultado|features\/resultado)/i.test(texto.split('\n').filter((l) => l.startsWith('import')).join('\n')))
      problemas.push(`${rel}: o questionário não pode importar consultas ou componentes de veredito (RN-81, IV-01)`);
  }
} catch {
  // A interface ainda pode não existir.
}

if (problemas.length) {
  console.error(`Fronteiras violadas (${problemas.length}):\n- ${problemas.join('\n- ')}`);
  process.exit(1);
}
console.log('Fronteiras e pureza do motor: ok.');
