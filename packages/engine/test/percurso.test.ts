// FF-20: todo percurso possível, em cada nível, cobre os fatores de peso 5 (RN-90, QA-29).
// Simula uma IA que escolhe qualquer pergunta elegível e qualquer resposta.
import fc from 'fast-check';
import { describe, expect, test } from 'vitest';
import type { Subnivel } from '@stacksync/content/tipos';
import { estadoPercurso, opcoesDaPergunta } from '../src/index.ts';
import type { RespostaEntrada } from '../src/tipos.ts';
import { conteudo } from './apoio.ts';

const SUBS = Object.keys(conteudo.estrutura.subniveis) as Subnivel[];

describe('percurso adaptativo', () => {
  for (const subnivel of SUBS)
    for (const profundidade of ['rapido', 'equilibrado', 'avancado'] as const)
      for (const temIdeia of [false, true])
        test(`${subnivel} ${profundidade}${temIdeia ? ' com ideia' : ''}: cobre os fatores de peso 5 e termina`, () => {
          fc.assert(
            fc.property(fc.array(fc.nat(), { minLength: 140, maxLength: 140 }), fc.array(fc.nat(), { minLength: 140, maxLength: 140 }), (escolhas, valores) => {
              const respostas: Record<string, RespostaEntrada> = {};
              let passos = 0;
              for (;;) {
                const est = estadoPercurso(conteudo, { subnivel, profundidade, respostas, temIdeia, asOf: '2026-11-10' });
                if (est.concluido) {
                  for (const f of ['F1', 'F2', 'F3', 'F4', 'F5'] as const) expect(est.fatores[f], `${f} em ${subnivel}`).not.toBe('descoberto');
                  if (est.orcamento !== null) expect(est.respondidas.filter((id) => est.perguntaveis.includes(id)).length).toBeLessThanOrEqual(est.orcamento + 6);
                  return;
                }
                expect(est.elegiveis.length).toBeGreaterThan(0);
                const id = est.elegiveis[escolhas[passos % escolhas.length]! % est.elegiveis.length]!;
                const p = conteudo.perguntas[id]!;
                const opcoes = opcoesDaPergunta(conteudo, p, respostas);
                const desconhecida = valores[passos % valores.length]! % 9 === 0;
                if (!opcoes.length || desconhecida) respostas[id] = { valor: null, origem: 'desconhecida' };
                else {
                  const o = opcoes[valores[passos % valores.length]! % opcoes.length]!.id;
                  respostas[id] = { valor: p.tipo === 'multipla' ? [o] : o, origem: 'estimativa' };
                }
                passos++;
                expect(passos).toBeLessThan(120);
              }
            }),
            { numRuns: 12 },
          );
        });

  test('o Rápido respeita o orçamento de cerca de 11 perguntas', () => {
    const respostas: Record<string, RespostaEntrada> = {};
    for (;;) {
      const est = estadoPercurso(conteudo, { subnivel: 'refatoracao.sistema', profundidade: 'rapido', respostas, temIdeia: false, asOf: '2026-11-10' });
      if (est.concluido) {
        expect(est.respondidas.length).toBeLessThanOrEqual(13);
        expect(est.respondidas.length).toBeGreaterThanOrEqual(9);
        return;
      }
      const id = est.ordemPadrao!;
      const p = conteudo.perguntas[id]!;
      const o = opcoesDaPergunta(conteudo, p, respostas)[0]!.id;
      respostas[id] = { valor: p.tipo === 'multipla' ? [o] : o, origem: 'estimativa' };
    }
  });
});

describe('trocarAlvo', () => {
  test('contrai a preposição com o artigo do alvo', async () => {
    const { pacote } = await import('@stacksync/content');
    const { trocarAlvo } = await import('../src/percurso.ts');
    expect(trocarAlvo(pacote, 'refatoracao.sistema', 'O que mais precisa melhorar em {alvo}?')).toBe('O que mais precisa melhorar no sistema?');
    expect(trocarAlvo(pacote, 'planejamento.sistema', 'Quais tarefas já são automáticas em {existente}?')).toBe('Quais tarefas já são automáticas na organização?');
    expect(trocarAlvo(pacote, 'refatoracao.modulo', 'Partes de {alvo} mudam?')).toBe('Partes do módulo mudam?');
    expect(trocarAlvo(pacote, 'refatoracao.sistema', '{alvo} tem donos?')).toBe('O sistema tem donos?');
    expect(trocarAlvo(pacote, 'refatoracao.sistema', 'Trabalha com {existente}?')).toBe('Trabalha com o sistema?');
  });
});
