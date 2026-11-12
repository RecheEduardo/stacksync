// Geração do veredito pelo motor (DT-21) e persistência imutável (RN-82). Gerar nunca é
// bloqueado, mesmo com respostas incompletas (RN-78). Mesmas entradas e versões, mesmo documento:
// pedir de novo devolve o veredito já gerado.
import { avaliar, type DocumentoVeredito, type EntradaAvaliacao } from '@stacksync/engine';
import { iso, type Tx } from '../db/banco.ts';
import { naoEncontrado } from '../http/erros.ts';
import {
  alteradasAposVeredito,
  carregarAnalise,
  carregarRespostas,
  entradaAvaliacao,
  entradaDe,
  hoje,
  type Analise,
} from '../dominio/analises.ts';
import type { Servicos } from './servicos.ts';

export interface VereditoGravado {
  id: string;
  analiseId: string;
  criadoEm: string;
  entrada: EntradaAvaliacao;
  documento: DocumentoVeredito;
}

export async function gerarVeredito(s: Servicos, orgId: string, analiseId: string): Promise<{ id: string; novo: boolean }> {
  return s.banco.comOrg(orgId, async (tx) => {
    const a = await carregarAnalise(tx, analiseId);
    if (!a) throw naoEncontrado('Análise');
    const entrada = entradaAvaliacao(a, entradaDe(await carregarRespostas(tx, a.id), await alteradasAposVeredito(tx, a.id)), hoje());
    const doc = avaliar(entrada, s.conteudo);
    const ultimo = await tx.um<{ id: string; hash_entradas: string; versao_motor: string; versao_conteudo: string }>(
      'SELECT id, hash_entradas, versao_motor, versao_conteudo FROM vereditos WHERE analise_id = $1 ORDER BY criado_em DESC LIMIT 1',
      [a.id],
    );
    if (ultimo && ultimo.hash_entradas === doc.hashEntradas && ultimo.versao_motor === doc.versoes.motor && ultimo.versao_conteudo === doc.versoes.conteudoHash)
      return { id: ultimo.id, novo: false };
    const r = await tx.um<{ id: string }>(
      `INSERT INTO vereditos (org_id, analise_id, hash_entradas, as_of, versao_motor, versao_conteudo, versao_calibracao, categoria,
         indice_lo, indice_hi, confianca, veredito_ideia, variante_plano, entrada, documento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15::jsonb) RETURNING id`,
      [
        orgId,
        a.id,
        doc.hashEntradas,
        doc.asOf,
        doc.versoes.motor,
        doc.versoes.conteudoHash,
        doc.versoes.calibracao,
        doc.ajuste.categoria,
        doc.ajuste.indice.lo,
        doc.ajuste.indice.hi,
        doc.ajuste.confianca,
        doc.ideia?.veredito ?? null,
        doc.plano.variante,
        JSON.stringify(entrada),
        JSON.stringify(doc),
      ],
    );
    await tx.q('UPDATE analises SET primeiro_veredito_em = coalesce(primeiro_veredito_em, now()), atualizada_em = now() WHERE id = $1', [a.id]);
    return { id: r!.id, novo: true };
  });
}

export async function carregarVeredito(tx: Tx, id: string): Promise<(VereditoGravado & { analise: Analise }) | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const v = await tx.um('SELECT id, analise_id, criado_em, entrada, documento FROM vereditos WHERE id = $1', [id]);
  if (!v) return null;
  const a = await carregarAnalise(tx, v.analise_id as string);
  if (!a) return null;
  return {
    id: v.id as string,
    analiseId: v.analise_id as string,
    criadoEm: iso(v.criado_em)!,
    entrada: v.entrada as EntradaAvaliacao,
    documento: v.documento as DocumentoVeredito,
    analise: a,
  };
}
