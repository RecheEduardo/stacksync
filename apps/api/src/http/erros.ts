// Erros no formato application/problem+json (RFC 9457), com `type` estável por tipo (Parte 4, 12.1).
export class Problema extends Error {
  constructor(
    readonly status: number,
    readonly tipo: string,
    readonly titulo: string,
    readonly detalhe?: string,
    readonly extras?: Record<string, unknown>,
  ) {
    super(titulo);
    this.name = 'Problema';
  }

  corpo() {
    return {
      type: `/problemas/${this.tipo}`,
      title: this.titulo,
      status: this.status,
      ...(this.detalhe ? { detail: this.detalhe } : {}),
      ...this.extras,
    };
  }
}

export const naoEncontrado = (o: string) => new Problema(404, 'nao-encontrado', `${o} não encontrada`);
