// Testes de propriedade do motor (Parte 4, 9.10, item 2), com fast-check.
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import { avaliar, formatar, numeroPt, sha256 } from '../src/index.ts';
import type { EntradaAvaliacao, RespostaEntrada } from '../src/tipos.ts';
import { conteudo } from './apoio.ts';

const SUB = 'refatoracao.sistema' as const;
const perguntasSub = conteudo.ordemPerguntas
  .map((id) => conteudo.perguntas[id]!)
  .filter((p) => p.subniveis.includes(SUB) && !p.opcoesDinamicas && !p.condicao?.toString().includes('ideia'));

const arbResposta = (id: string): fc.Arbitrary<[string, RespostaEntrada] | null> => {
  const p = conteudo.perguntas[id]!;
  const opcoes = p.opcoes.map((o) => o.id);
  const valor =
    p.tipo === 'multipla'
      ? fc.subarray(opcoes, { minLength: 1, maxLength: Math.min(3, opcoes.length) })
      : fc.constantFrom(...opcoes);
  return fc.option(
    fc.tuple(valor, fc.constantFrom('estimativa', 'medida', 'inferencia', 'desconhecida')).map(
      ([v, origem]) =>
        [
          id,
          {
            valor: origem === 'desconhecida' ? null : v,
            origem: origem as RespostaEntrada['origem'],
            ...(origem === 'medida' ? { fonte: 'teste', medidaEm: '2026-10' } : {}),
          },
        ] as [string, RespostaEntrada],
    ),
    { freq: 3 },
  );
};

const arbEntrada: fc.Arbitrary<EntradaAvaliacao> = fc
  .tuple(fc.tuple(...perguntasSub.map((p) => arbResposta(p.id))), fc.constantFrom('rapido', 'equilibrado', 'avancado'))
  .map(([pares, profundidade]) => ({
    subnivel: SUB,
    profundidade: profundidade as EntradaAvaliacao['profundidade'],
    asOf: '2026-11-10',
    respostas: Object.fromEntries(pares.filter((x): x is [string, RespostaEntrada] => !!x)),
    ideia: null,
  }));

const params = { numRuns: 40 };

describe('propriedades do motor', () => {
  test('PROP-01: 0 ≤ O, U ≤ 100; O + U ≤ 100; Índice de Ajuste = 100 − O − U no ponto', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        const { O, U, indice } = d.ajuste;
        expect(O.lo).toBeGreaterThanOrEqual(0);
        expect(U.lo).toBeGreaterThanOrEqual(0);
        expect(O.hi).toBeLessThanOrEqual(100);
        expect(U.hi).toBeLessThanOrEqual(100);
        expect(O.pt + U.pt).toBeLessThanOrEqual(101);
        expect(Math.abs(indice.pt - (100 - O.pt - U.pt))).toBeLessThanOrEqual(1);
        expect(indice.lo).toBeLessThanOrEqual(indice.pt);
        expect(indice.pt).toBeLessThanOrEqual(indice.hi);
      }),
      params,
    );
  });

  test('PROP-02: estreitar uma resposta (estimativa para medida) nunca alarga a faixa do Índice de Ajuste', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const antes = avaliar(e, conteudo).ajuste.indice;
        const medidas: EntradaAvaliacao = {
          ...e,
          profundidade: e.profundidade === 'rapido' ? 'equilibrado' : e.profundidade,
          respostas: Object.fromEntries(
            Object.entries(e.respostas).map(([k, r]) => [k, r.origem === 'estimativa' ? { ...r, origem: 'medida', fonte: 'teste', medidaEm: '2026-10' } : r]),
          ),
        };
        if (e.profundidade === 'rapido') return;
        const depois = avaliar(medidas, conteudo).ajuste.indice;
        expect(depois.hi - depois.lo).toBeLessThanOrEqual(antes.hi - antes.lo);
      }),
      params,
    );
  });

  test('PROP-03: a mesma entrada gera o mesmo documento e o mesmo hash', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const a = avaliar(e, conteudo);
        const b = avaliar(structuredClone(e), conteudo);
        expect(a.hashEntradas).toBe(b.hashEntradas);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      }),
      { numRuns: 15 },
    );
  });

  test('PROP-04 e PROP-11: Ajustado implica zero direções e plano "não mexa", sem tecnologia (RN-75, QA-25, IV-11)', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        if (d.ajuste.categoria !== 'ajustado') return;
        expect(d.direcoes).toHaveLength(0);
        expect(d.plano.variante).toBe('nao_mexa');
        expect(d.plano.tecnologias).toHaveLength(0);
        expect(d.plano.movimentos).toHaveLength(0);
      }),
      params,
    );
  });

  test('PROP-05: sobra nunca reduz U e falta nunca reduz O (RN-72), conferido pela separação por eixo', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        for (const eixo of d.eixos) {
          if (!eixo.avaliado || eixo.desvioPonto === null) continue;
          if (eixo.lado === 'sobra') expect(eixo.desvioPonto).toBeGreaterThan(0);
          if (eixo.lado === 'falta') expect(eixo.desvioPonto).toBeLessThan(0);
        }
      }),
      params,
    );
  });

  test('PROP-11: plano com mudança sempre passa da materialidade no limite desfavorável (RN-74, RN-76)', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        if (d.plano.variante !== 'mudanca') return;
        expect(d.plano.contraBase!.lo).toBeGreaterThanOrEqual(conteudo.calibracao.materialidade);
      }),
      params,
    );
  });

  test('PROP-12: faixa que atravessa um limite de aderência gera as duas frases (RN-93)', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        const f = d.plano.indice;
        if (!f || !d.plano.frasesAderencia.length) return;
        const limites = conteudo.calibracao.faixasAderencia;
        const faixa = (v: number) => limites.filter((l) => v >= l).length;
        expect(d.plano.frasesAderencia.length).toBe(faixa(f.lo) === faixa(f.hi) ? 1 : 2);
      }),
      params,
    );
  });

  test('textos oficiais passam no lint de vocabulário (FF-06): sem exclamação nem sigla do índice', () => {
    fc.assert(
      fc.property(arbEntrada, (e) => {
        const d = avaliar(e, conteudo);
        const textos = [d.textos.frase, d.textos.fechamento ?? '', ...d.textos.complemento, d.plano.frase, ...d.razoes.map((r) => r.texto)];
        for (const t of textos) {
          expect(t).not.toContain('!');
          expect(t).not.toMatch(/\bIA\b/);
        }
      }),
      { numRuns: 20 },
    );
  });
});

describe('peças puras', () => {
  test('SHA-256 do vetor de teste "abc"', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  test('números em pt-BR e mensagens', () => {
    expect(numeroPt(2.5)).toBe('2,5');
    expect(numeroPt(1234.56, 2)).toBe('1.234,56');
    expect(formatar('{n, plural, one {# resposta} other {# respostas}}', { n: 3 })).toBe('3 respostas');
    expect(formatar('{lado, select, sobra {mais} other {menos}}', { lado: 'sobra' })).toBe('mais');
    expect(formatar('entre {lo} e {hi}', { lo: 43, hi: 57 })).toBe('entre 43 e 57');
  });
});
