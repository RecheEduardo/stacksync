// FF-03: casos-âncora com gabarito (P3 11.3). Os gabaritos ficam no pacote de conteúdo e só mudam
// em commit de calibração (FF-18). Um veredito Indefinido é aceito quando todas as categorias
// possíveis estão entre as aceitas pelo gabarito.
import { describe, expect, test } from 'vitest';
import { avaliarCaso, conteudo } from './apoio.ts';

describe('casos-âncora', () => {
  for (const caso of conteudo.casosAncora) {
    test(`${caso.id}: ${caso.testa}`, () => {
      const doc = avaliarCaso(caso);
      const g = caso.gabarito;
      const aceitas = g.categoria ? [g.categoria] : (g.categoriasAceitas ?? null);
      if (aceitas) {
        const ok =
          aceitas.includes(doc.ajuste.categoria) ||
          (doc.ajuste.categoria === 'indefinido' && doc.ajuste.categoriasPossiveis.every((c) => aceitas.includes(c)));
        expect(ok, `categoria ${doc.ajuste.categoria} (${doc.ajuste.categoriasPossiveis.join(', ')})`).toBe(true);
      }
      if (g.plano) expect(doc.plano.variante).toBe(g.plano);
      if (g.ideia) expect(doc.ideia?.veredito).toBe(g.ideia);
      if (g.conviver !== undefined) expect(doc.ajuste.conviver).toBe(g.conviver);
    });
  }

  test('métricas da bateria: falso alarme até 5% e concordância de pelo menos 85% (P3 11.3)', () => {
    let falsoAlarme = 0;
    let deveriaNaoMudar = 0;
    let concordam = 0;
    let comCategoria = 0;
    for (const caso of conteudo.casosAncora) {
      const doc = avaliarCaso(caso);
      const g = caso.gabarito;
      if (g.categoria === 'ajustado' || g.plano === 'nao_mexa') {
        deveriaNaoMudar++;
        if (doc.plano.variante === 'mudanca' || doc.plano.variante === 'trocar') falsoAlarme++;
      }
      const aceitas = g.categoria ? [g.categoria] : g.categoriasAceitas;
      if (aceitas) {
        comCategoria++;
        if (aceitas.includes(doc.ajuste.categoria) || (doc.ajuste.categoria === 'indefinido' && doc.ajuste.categoriasPossiveis.every((c) => aceitas.includes(c))))
          concordam++;
      }
    }
    expect(falsoAlarme / Math.max(1, deveriaNaoMudar)).toBeLessThanOrEqual(0.05);
    expect(concordam / comCategoria).toBeGreaterThanOrEqual(0.85);
  });
});
