// FF-04: exemplos da Parte 3 como testes de aceitação (Parte 4, 9.10, item 1).
import { describe, expect, test } from 'vitest';
import { calcularAjuste, parametrosDe, potencia, type EixoAvaliado } from '../src/index.ts';
import { conteudo } from './apoio.ts';

const cal = conteudo.calibracao;

// Exemplo B no nível dos eixos, com a calibração inicial da Parte 3 (tolerância 0,5; E7: 1,0 para sobra).
const exemploB: Array<[string, number, number, number]> = [
  ['E1', 4, 1.5, 2.0],
  ['E2', 5, 1.0, 3.5],
  ['E3', 4, 1.0, 3.0],
  ['E4', 3, 1.0, 2.5],
  ['E5', 3, 2.0, 2.0],
  ['E6', 5, 1.0, 3.5],
  ['E7', 4, 3.0, 2.5],
  ['E8', 2, 1.0, 2.0],
];

describe('Exemplo B da Parte 3 (P3 10.5)', () => {
  test('O = 50, U = 0 e Índice de Ajuste = 50 com os níveis da tabela', () => {
    const eixos: EixoAvaliado[] = exemploB.map(([id, peso, n, c]) => ({
      id,
      nome: id,
      peso,
      avaliado: true,
      temSinal: true,
      N: { lo: n, hi: n },
      C: { lo: c, hi: c },
      d: { lo: c - n, hi: c - n },
      dPt: c - n,
      alinhado: false,
      tol: id === 'E7' ? { sobra: 1, falta: 0.5 } : { sobra: 0.5, falta: 0.5 },
      sinaisN: [],
      sinaisC: [],
      guardas: [],
    }));
    const p = {
      ...parametrosDe(cal),
      tolerancias: Object.fromEntries(exemploB.map(([id]) => [id, id === 'E7' ? { sobra: 1, falta: 0.5 } : { sobra: 0.5, falta: 0.5 }])),
      pesos: Object.fromEntries(exemploB.map(([id, peso]) => [id, peso])),
    };
    const r = calcularAjuste(eixos, p, cal.minimoSinal, cal.confianca);
    expect(r.O.pt).toBe(50);
    expect(r.U.pt).toBe(0);
    expect(r.indice.pt).toBe(50);
    expect(r.categoria).toBe('sobreajustado');
  });

  test('disponibilidade composta do fluxo de agendamento: 99,95% elevado a 6 ≈ 99,70%', () => {
    const composta = potencia(0.9995, 6);
    expect(Math.round(composta * 10000) / 100).toBe(99.7);
  });
});
