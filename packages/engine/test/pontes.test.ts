// Perguntas-ponte: conversão determinística em faixa (RN-80; P3 8.5).
import { pacote } from '@stacksync/content';
import { describe, expect, it } from 'vitest';
import { converterPontes } from '../src/pontes.ts';

describe('converterPontes', () => {
  const b01 = pacote.perguntas['B-01']!;
  const f10 = pacote.perguntas['F-10']!;

  it('estreita a faixa pela interseção das pontes', () => {
    const r = converterPontes(pacote, b01, { 'B-01.p1': 'sim', 'B-01.p2': 'sem_data' })!;
    expect(r.faixaOpcoes).toEqual(['1_3']);
    expect(r.contraditorias).toBe(false);
    expect(r.texto).toContain('(inferido)');
  });

  it('usa a união quando as pontes se contradizem, e diz isso', () => {
    const r = converterPontes(pacote, b01, { 'B-01.p1': 'sim', 'B-01.p2': 'nao' })!;
    expect(r.contraditorias).toBe(true);
    expect(r.faixaOpcoes!.length).toBeGreaterThan(2);
    expect(r.texto).toContain('lados diferentes');
  });

  it('converte pontes de múltipla escolha em faixa do sinal', () => {
    const r = converterPontes(pacote, f10, { 'F-10.p1': 'alerta', 'F-10.p2': 'semanas' })!;
    expect(r.faixaSinal).toEqual({ sinal: 'automacao', faixa: [0.5, 1.5] });
    expect(r.faixaOpcoes).toBeNull();
  });

  it('sem resposta a nenhuma ponte, não há conversão', () => {
    expect(converterPontes(pacote, b01, {})).toBeNull();
  });
});
