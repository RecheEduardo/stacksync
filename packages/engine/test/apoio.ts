import { pacote } from '@stacksync/content';
import type { CasoAncora } from '@stacksync/content/tipos';
import { avaliar } from '../src/index.ts';
import type { EntradaAvaliacao } from '../src/tipos.ts';

export const conteudo = pacote;

export function entradaDoCaso(caso: CasoAncora): EntradaAvaliacao {
  const respostas: EntradaAvaliacao['respostas'] = {};
  for (const [id, r] of Object.entries(caso.respostas)) {
    const origem = r.origem ?? 'estimativa';
    respostas[id] = {
      valor: r.valor,
      origem,
      ...(origem === 'medida' ? { fonte: 'caso-âncora', medidaEm: caso.asOf.slice(0, 7) } : {}),
    };
  }
  return {
    subnivel: caso.subnivel,
    profundidade: caso.profundidade,
    asOf: caso.asOf,
    respostas,
    ideia: caso.ideia ? { texto: caso.ideia.texto, movimentos: caso.ideia.movimentos } : null,
  };
}

export const avaliarCaso = (caso: CasoAncora) => avaliar(entradaDoCaso(caso), conteudo);
