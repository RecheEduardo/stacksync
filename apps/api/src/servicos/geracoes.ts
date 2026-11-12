// Gerações de raciocínio em andamento (Parte 4, 12.3): cada evento tem um identificador, e quem
// reconecta retoma do último recebido. Em memória: uma geração interrompida por reinício do
// servidor é marcada como falha e pode ser tentada de novo.
export interface EventoSse {
  id: number;
  tipo: string;
  dados: unknown;
}

interface Geracao {
  eventos: EventoSse[];
  ouvintes: Set<(e: EventoSse) => void>;
  fim: boolean;
}

export class Geracoes {
  private ativas = new Map<string, Geracao>();

  ativa(chave: string): boolean {
    const g = this.ativas.get(chave);
    return !!g && !g.fim;
  }

  iniciar(chave: string, trabalho: (emitir: (tipo: string, dados: unknown) => void) => Promise<void>): void {
    const g: Geracao = { eventos: [], ouvintes: new Set(), fim: false };
    this.ativas.set(chave, g);
    const emitir = (tipo: string, dados: unknown) => {
      const e = { id: g.eventos.length + 1, tipo, dados };
      g.eventos.push(e);
      for (const o of g.ouvintes) o(e);
    };
    void trabalho(emitir).finally(() => {
      g.fim = true;
      for (const o of g.ouvintes) o({ id: g.eventos.length + 1, tipo: '__fim', dados: null });
      // Mantém os eventos por um minuto para quem reconectar; depois, o banco é a fonte.
      setTimeout(() => {
        if (this.ativas.get(chave) === g) this.ativas.delete(chave);
      }, 60_000).unref();
    });
  }

  /** Assina os eventos a partir de `depoisDe`; devolve a função para cancelar. */
  assinar(chave: string, depoisDe: number, ouvinte: (e: EventoSse) => void): (() => void) | null {
    const g = this.ativas.get(chave);
    if (!g) return null;
    for (const e of g.eventos) if (e.id > depoisDe) ouvinte(e);
    if (g.fim) {
      ouvinte({ id: g.eventos.length + 1, tipo: '__fim', dados: null });
      return () => undefined;
    }
    g.ouvintes.add(ouvinte);
    return () => g.ouvintes.delete(ouvinte);
  }
}
