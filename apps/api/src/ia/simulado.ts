// Provedor simulado, só para desenvolvimento e testes (STACKSYNC_PERMITIR_SIMULADO=1, nunca em
// produção). Responde de forma determinística a partir do contexto estruturado de cada etapa, para
// exercitar a esteira, os validadores e a interface sem chamar um provedor real.
import type { DadosIdeia, DadosInterpretacao, DadosPercurso, DadosRaciocinio, DadosSugestoes, DadosCandidatas } from './contexto.ts';
import { ErroIA, type AdaptadorIA, type PedidoBruto } from './tipos.ts';

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function responder(p: PedidoBruto): unknown {
  switch (p.etapa) {
    case 'teste':
      return { ok: true, mensagem: 'Saída estruturada funcionando (provedor simulado).' };
    case 'RG-12': {
      const d = p.dados as DadosPercurso;
      const escolhida = d.elegiveis.find((e) => e.id === d.ordemPadrao) ?? d.elegiveis[0]!;
      return {
        perfil: 'Perfil estimado pelo provedor simulado a partir das respostas dadas.',
        pergunta: escolhida.id,
        motivo: 'Segue a ordem padrão da estrutura de decisão.',
        sugestoes: escolhida.padrao,
      };
    }
    case 'RG-13':
      return { opcoes: (p.dados as DadosSugestoes).padrao };
    case 'RG-01': {
      const d = p.dados as DadosInterpretacao;
      const texto = normalizar(d.texto);
      const achadas = d.opcoes.filter((o) => normalizar(o.rotulo).split(/[^a-z0-9]+/).some((w) => w.length > 3 && texto.includes(w)));
      const numeros = texto.match(/\d+/g) ?? [];
      const porNumero = d.opcoes.filter((o) => numeros.some((n) => normalizar(o.rotulo).includes(n)));
      const opcoes = (achadas.length ? achadas : porNumero).slice(0, 2).map((o) => o.id);
      return {
        opcoes,
        explicacao: opcoes.length ? `Leitura do provedor simulado a partir de “${d.texto.slice(0, 80)}”.` : 'O texto não permite escolher uma opção.',
        entendeu: opcoes.length > 0,
      };
    }
    case 'ideia': {
      const d = p.dados as DadosIdeia;
      const texto = normalizar(d.texto);
      const regras: Array<[RegExp, string]> = [
        [/microsservic|separar|dividir/, d.movimentos.some((m) => m.id === 'arq.separar_varias') ? 'arq.separar_varias' : ''],
        [/evento/, 'arq.eventos'],
        [/modulariz|modular/, 'arq.modularizar'],
        [/reescrev/, 'arq.reescrever'],
        [/atualiz/, 'fer.atualizar'],
        [/trocar|migrar para|adotar/, 'fer.trocar'],
      ];
      const ids = new Set(d.movimentos.map((m) => m.id));
      const movimentos: Array<{ id: string; parametro: string | null }> = [];
      for (const [re, id] of regras) if (id && ids.has(id) && re.test(texto) && !movimentos.some((m) => m.id === id)) movimentos.push({ id, parametro: null });
      for (const m of movimentos)
        if (m.id === 'fer.trocar') m.parametro = d.tecnologias.find((t) => texto.includes(normalizar(t.nome)))?.id ?? null;
      return {
        movimentos: movimentos.filter((m) => m.id !== 'fer.trocar' || m.parametro),
        explicacao: 'Leitura do provedor simulado por palavras-chave.',
        foraDoCatalogo: movimentos.length ? [] : [d.texto.slice(0, 120)],
      };
    }
    case 'RG-10': {
      const d = p.dados as DadosRaciocinio;
      return {
        blocos: d.alvos.map((a) => ({
          alvo: a.id,
          resumo: `O motor avaliou ${a.rotulo.toLowerCase()} com as respostas dadas.`,
          evidencias: a.citaveis.slice(0, 2),
          contraArgumento: 'Parte das respostas é estimativa; uma medida poderia deslocar a conclusão.',
          oQueMudaria: 'Uma resposta medida diferente nas perguntas citadas.',
          avaliacao: 'concorda',
          justificativa: 'As respostas citadas sustentam a conclusão do motor.',
        })),
        sintese: 'O provedor simulado concorda com o motor em todos os pontos.',
      };
    }
    case 'RG-14':
      return { candidatas: (p.dados as DadosCandidatas).decisoes.length ? [] : [] };
  }
}

export function adaptadorSimulado(modelo = 'simulado-1'): AdaptadorIA {
  return {
    provedor: 'simulado',
    modelo,
    async chamar(p) {
      if (p.sinal?.aborted) throw new ErroIA('cancelada', 'Cancelado.');
      // Modelos de teste dos caminhos de falha: o provedor cai, ou responde fora do formato.
      if (modelo === 'simulado-falha' && p.etapa !== 'teste') throw new ErroIA('indisponivel', 'Provedor simulado fora do ar.');
      const texto = modelo === 'simulado-invalido' && p.etapa !== 'teste' ? 'isto não é JSON' : JSON.stringify(responder(p));
      return { texto, tokensEntrada: Math.ceil((p.sistema.length + p.usuario.length) / 4), tokensSaida: Math.ceil(texto.length / 4), modelo, reserva: false };
    },
  };
}
