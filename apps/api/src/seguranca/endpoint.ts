// Proteção contra SSRF nos endpoints compatíveis informados pelo usuário (Parte 4, 14.1).
// A URL precisa ser HTTPS e resolver para endereço público; a verificação se repete na conexão
// (lookup do agente), o que fecha a brecha de troca de DNS entre a checagem e o uso.
import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import { isIP, type LookupFunction } from 'node:net';
import { Agent, fetch as undiciFetch } from 'undici';

export class EndpointRecusado extends Error {}

function ipv4Privado(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number) as [number, number];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export function enderecoPrivado(ip: string): boolean {
  if (isIP(ip) === 4) return ipv4Privado(ip);
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return ipv4Privado(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80') || v.startsWith('ff');
}

export function validarUrlEndpoint(url: string, permitirLocal: boolean): URL {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new EndpointRecusado('URL inválida.');
  }
  if (u.username || u.password) throw new EndpointRecusado('A URL não pode conter usuário ou senha.');
  if (u.protocol !== 'https:' && !(permitirLocal && u.protocol === 'http:'))
    throw new EndpointRecusado('Use uma URL HTTPS.');
  if (!permitirLocal && isIP(u.hostname.replace(/^\[|\]$/g, '')) && enderecoPrivado(u.hostname.replace(/^\[|\]$/g, '')))
    throw new EndpointRecusado('Endereços de rede interna não são aceitos.');
  return u;
}

/** fetch que recusa conexões a endereços internos, inclusive depois de redirecionamento de DNS. */
export function fetchProtegido(permitirLocal: boolean): typeof fetch {
  if (permitirLocal) return fetch;
  const agente = new Agent({
    connect: {
      lookup: ((hostname, opcoes, cb) => {
        dnsLookup(hostname, { ...opcoes, all: true }, (erro, enderecos: LookupAddress[]) => {
          if (erro) return cb(erro, '', 0);
          if (!enderecos.length || enderecos.some((e) => enderecoPrivado(e.address)))
            return cb(Object.assign(new Error('Endereço interno recusado.'), { code: 'EACCES' }), '', 0);
          if (opcoes.all) return (cb as unknown as (e: null, a: LookupAddress[]) => void)(null, enderecos);
          cb(null, enderecos[0]!.address, enderecos[0]!.family);
        });
      }) as LookupFunction,
    },
  });
  return ((entrada: Parameters<typeof undiciFetch>[0], init?: Parameters<typeof undiciFetch>[1]) =>
    undiciFetch(entrada, { ...init, dispatcher: agente })) as unknown as typeof fetch;
}
