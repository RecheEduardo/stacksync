// Formatador de mensagens no subconjunto ICU usado pelo pacote de conteúdo (DT-28).
// Puro e determinístico: não usa Intl (que varia com a versão do ICU do runtime) para não
// quebrar a reprodutibilidade byte a byte do documento de veredito (QA-01).
// Suporta {var}, {n, plural, one {...} other {...}} com #, e {x, select, a {...} other {...}}.

export type Valores = Record<string, string | number | null | undefined>;

/** Número em pt-BR: vírgula decimal, ponto de milhar, até `casas` decimais sem zeros à direita. */
export function numeroPt(n: number, casas = 1): string {
  const neg = n < 0;
  let fator = 1;
  for (let i = 0; i < casas; i++) fator *= 10;
  const arred = Math.round(Math.abs(n) * fator) / fator;
  const inteiroParte = Math.floor(arred);
  let decimal = Math.round((arred - inteiroParte) * fator);
  let dec = '';
  if (decimal > 0) {
    dec = String(decimal).padStart(casas, '0');
    while (dec.endsWith('0')) dec = dec.slice(0, -1);
  }
  const milhar = String(inteiroParte).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  decimal = 0;
  return `${neg && arred !== 0 ? '−' : ''}${milhar}${dec ? `,${dec}` : ''}`;
}

/** Número com sinal explícito (+3, −7), para diferenças contra não mudar. */
export function comSinal(n: number, casas = 0): string {
  if (n > 0) return `+${numeroPt(n, casas)}`;
  return numeroPt(n, casas);
}

interface No {
  tipo: 'texto' | 'arg' | 'plural' | 'select';
  texto?: string;
  nome?: string;
  ramos?: Record<string, No[]>;
}

function analisar(fonte: string): No[] {
  let i = 0;
  function blocos(fim: boolean): No[] {
    const out: No[] = [];
    let buf = '';
    while (i < fonte.length) {
      const ch = fonte[i]!;
      if (ch === '}') {
        if (fim) break;
        buf += ch;
        i++;
        continue;
      }
      if (ch === '{') {
        if (buf) out.push({ tipo: 'texto', texto: buf });
        buf = '';
        i++;
        out.push(argumento());
        continue;
      }
      buf += ch;
      i++;
    }
    if (buf) out.push({ tipo: 'texto', texto: buf });
    return out;
  }
  function ler(ate: RegExp): string {
    let s = '';
    while (i < fonte.length && !ate.test(fonte[i]!)) s += fonte[i++];
    return s.trim();
  }
  function argumento(): No {
    const nome = ler(/[,}]/);
    if (fonte[i] === '}') {
      i++;
      return { tipo: 'arg', nome };
    }
    i++;
    const tipo = ler(/[,}]/);
    if (fonte[i] === '}') {
      i++;
      return { tipo: 'arg', nome };
    }
    i++;
    const ramos: Record<string, No[]> = {};
    while (i < fonte.length) {
      while (fonte[i] === ' ' || fonte[i] === '\n') i++;
      if (fonte[i] === '}') {
        i++;
        break;
      }
      const chave = ler(/[{\s]/);
      while (fonte[i] === ' ') i++;
      if (fonte[i] !== '{') throw new Error(`Mensagem mal formada perto de "${chave}"`);
      i++;
      ramos[chave] = blocos(true);
      i++;
    }
    return { tipo: tipo === 'plural' ? 'plural' : 'select', nome, ramos };
  }
  return blocos(false);
}

const cache = new Map<string, No[]>();

function render(nos: No[], valores: Valores, numeroAtual: number | null): string {
  let s = '';
  for (const no of nos) {
    if (no.tipo === 'texto') s += numeroAtual === null ? no.texto! : no.texto!.replace(/#/g, numeroPt(numeroAtual, 2));
    else if (no.tipo === 'arg') {
      const v = valores[no.nome!];
      s += typeof v === 'number' ? numeroPt(v, 2) : (v ?? '');
    } else if (no.tipo === 'plural') {
      const n = Number(valores[no.nome!] ?? 0);
      const ramo = no.ramos![`=${n}`] ?? (n === 1 ? no.ramos!.one : undefined) ?? no.ramos!.other ?? [];
      s += render(ramo, valores, n);
    } else {
      const v = String(valores[no.nome!] ?? 'other');
      s += render(no.ramos![v] ?? no.ramos!.other ?? [], valores, numeroAtual);
    }
  }
  return s;
}

export function formatar(fonte: string, valores: Valores = {}): string {
  let nos = cache.get(fonte);
  if (!nos) {
    nos = analisar(fonte);
    cache.set(fonte, nos);
  }
  return render(nos, valores, null);
}

/** Junta itens em pt-BR: "a", "a e b", "a, b e c". */
export function lista(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}
