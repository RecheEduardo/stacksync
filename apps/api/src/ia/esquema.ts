// Schemas zod da esteira convertidos em JSON Schema para a saída estruturada nativa de cada
// provedor (Parte 4, 10.3). Objetos estritos e todos os campos obrigatórios, como o modo estrito pede.
import { z } from 'zod';

export function paraJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const js = z.toJSONSchema(schema, { target: 'draft-2020-12' }) as Record<string, unknown>;
  delete js.$schema;
  return js;
}
