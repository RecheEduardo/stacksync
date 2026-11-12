// Cifragem da chave de IA do usuário (Parte 4, 10.5 e 14.1): AES-256-GCM com chave mestra do
// ambiente. A chave nunca volta para o navegador; a interface só vê os últimos 4 caracteres.
// Em produção gerenciada, a chave mestra vem do KMS (cifragem envelope); a forma do dado é a mesma.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const VERSAO = 'v1';

export function cifrar(chaveMestra: Buffer, texto: string, contexto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', chaveMestra, iv);
  // O contexto (organização) entra como dado autenticado: a cifra de uma organização não abre em outra.
  c.setAAD(Buffer.from(contexto, 'utf8'));
  const cifrado = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  return [VERSAO, iv.toString('base64'), c.getAuthTag().toString('base64'), cifrado.toString('base64')].join(':');
}

export function decifrar(chaveMestra: Buffer, guardado: string, contexto: string): string {
  const [versao, iv, tag, dado] = guardado.split(':');
  if (versao !== VERSAO || !iv || !tag || !dado) throw new Error('Formato de chave cifrada desconhecido.');
  const d = createDecipheriv('aes-256-gcm', chaveMestra, Buffer.from(iv, 'base64'));
  d.setAAD(Buffer.from(contexto, 'utf8'));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(dado, 'base64')), d.final()]).toString('utf8');
}

/** Token aleatório para cookie de sessão e link de leitura; só o hash vai para o banco. */
export const novoToken = (): string => randomBytes(32).toString('base64url');
export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
export const hashTexto = (texto: string): string => `sha256:${createHash('sha256').update(texto).digest('hex')}`;
