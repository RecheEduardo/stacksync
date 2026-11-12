// FF-06 e FD-04 sobre o pacote compilado: todo texto oficial, de interface e de prompt passa no lint de
// vocabulário, as mensagens ICU fecham as chaves e "IA" nunca é a sigla do Índice de Ajuste.
import { describe, expect, it } from 'vitest';
import { pacote } from '../src/index.ts';
import { lintVocabulario } from '../src/vocabulario.ts';

const textos = Object.entries(pacote.textos);
const prompts = Object.entries(pacote.prompts).filter(([k]) => k !== 'versao');

describe('pacote de conteúdo', () => {
  it('tem a estrutura, o catálogo e os casos-âncora', () => {
    expect(Object.keys(pacote.estrutura.subniveis)).toHaveLength(6);
    expect(pacote.ordemPerguntas.length).toBeGreaterThan(50);
    expect(pacote.casosAncora.length).toBeGreaterThanOrEqual(14);
    expect(pacote.hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('nenhum texto ou prompt usa vocabulário proibido (FF-06, FD-04)', () => {
    const problemas = [...textos, ...prompts].flatMap(([k, v]) => lintVocabulario(v, pacote.vocabularioProibido).map((p) => `${k}: ${p}`));
    expect(problemas).toEqual([]);
  });

  it('"Índice de Ajuste" aparece sempre por extenso; "IA" só como inteligência artificial (DV-11)', () => {
    const siglaDoIndice = [...textos, ...prompts].filter(([, v]) => /\bIA\s+(entre|de\s+\d|igual)/.test(v) || /índice\s*\(IA\)/i.test(v));
    expect(siglaDoIndice).toEqual([]);
  });

  it('toda mensagem ICU fecha as chaves', () => {
    const abertas = textos.filter(([, v]) => {
      let p = 0;
      for (const c of v) {
        if (c === '{') p++;
        if (c === '}') p--;
        if (p < 0) return true;
      }
      return p !== 0;
    });
    expect(abertas.map(([k]) => k)).toEqual([]);
  });

  it('as etapas da esteira têm prompt versionado', () => {
    for (const k of ['sistema', 'proximaPergunta', 'sugestoes', 'interpretacao', 'ideia', 'raciocinio', 'candidatas', 'teste']) expect(pacote.prompts[k]).toBeTruthy();
    expect(pacote.prompts.versao).toMatch(/^\d{4}\.\d+\.\d+$/);
  });
});
