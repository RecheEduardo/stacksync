// Aplicação Fastify: plugins de segurança, sessão, erros e rotas (Parte 4, 12 e 14).
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ZodError } from 'zod';
import { Problema } from './http/erros.ts';
import { lerSessao } from './http/sessao.ts';
import { rotasAnalises } from './rotas/analises.ts';
import { rotasConta } from './rotas/conta.ts';
import { rotasIa } from './rotas/ia.ts';
import { rotasQuestionario } from './rotas/questionario.ts';
import { rotasSessao } from './rotas/sessao.ts';
import { rotasVereditos } from './rotas/vereditos.ts';
import type { Servicos } from './servicos/servicos.ts';

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function criarApp(s: Servicos): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? (s.config.producao ? 'info' : 'warn'),
      // Logs nunca levam cookie, chave, prompt, saída da IA nem o token de links (DT-18, 14.1).
      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
      serializers: {
        req: (req) => ({ method: req.method, url: req.url.replace(/\/publico\/[^/?]+/, '/publico/***'), ip: req.ip }),
      },
    },
    trustProxy: s.config.producao,
    bodyLimit: 256 * 1024,
  });

  await app.register(cookie);
  await app.register(helmet, {
    contentSecurityPolicy: s.config.producao
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            styleSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            baseUri: ["'none'"],
            objectSrc: ["'none'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
  });
  await app.register(rateLimit, { global: true, max: 600, timeWindow: '1 minute' });

  app.decorateRequest('sessao', null);
  app.addHook('onRequest', async (req) => {
    if (!req.url.startsWith('/api/')) return;
    // Métodos que alteram estado: cabeçalho próprio (não enviável entre origens sem CORS) e Origin conhecida.
    if (!METODOS_SEGUROS.has(req.method)) {
      if (req.headers['x-stacksync'] !== '1') throw new Problema(403, 'origem', 'Pedido recusado', 'Cabeçalho de proteção ausente.');
      const origem = req.headers.origin;
      const propria = `${req.protocol}://${req.headers.host}`;
      if (origem && origem !== propria && !s.config.origens.includes(origem))
        throw new Problema(403, 'origem', 'Pedido recusado', 'Origem não reconhecida.');
    }
    req.sessao = await lerSessao(s, req);
  });

  app.setErrorHandler((erro, req, reply) => {
    if (erro instanceof Problema) return reply.status(erro.status).type('application/problem+json').send(erro.corpo());
    if (erro instanceof ZodError)
      return reply
        .status(400)
        .type('application/problem+json')
        .send({
          type: '/problemas/validacao',
          title: 'Dados inválidos',
          status: 400,
          erros: erro.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
        });
    const status = (erro as { statusCode?: number }).statusCode ?? 500;
    if (status === 429)
      return reply.status(429).type('application/problem+json').send({ type: '/problemas/limite', title: 'Muitos pedidos seguidos', status: 429, detail: 'Espere um pouco e tente de novo.' });
    if (status < 500) return reply.status(status).type('application/problem+json').send({ type: '/problemas/pedido', title: 'Pedido inválido', status });
    req.log.error({ err: { name: (erro as Error).name, message: (erro as Error).message, stack: (erro as Error).stack } }, 'erro interno');
    return reply.status(500).type('application/problem+json').send({ type: '/problemas/interno', title: 'Erro interno', status: 500 });
  });

  await app.register(
    async (api) => {
      await rotasSessao(api, s);
      await rotasIa(api, s);
      await rotasAnalises(api, s);
      await rotasQuestionario(api, s);
      await rotasVereditos(api, s);
      await rotasConta(api, s);
    },
    { prefix: '/api/v1' },
  );

  // Interface compilada servida na mesma origem; rotas da SPA caem no index.html.
  if (s.config.dirWeb && existsSync(join(s.config.dirWeb, 'index.html'))) {
    // O HTML nunca fica em cache (ele aponta para os arquivos com hash da versão atual; em cache, o navegador seguia
    // mostrando a versão antiga depois de um novo build). Os arquivos em /assets têm o hash no nome, então não mudam.
    await app.register(fastifyStatic, {
      root: s.config.dirWeb,
      wildcard: false,
      cacheControl: false,
      setHeaders: (res, caminho) => {
        const cache = caminho.endsWith('.html') ? 'no-cache' : /[\\/]assets[\\/]/.test(caminho) ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
        res.header('Cache-Control', cache);
      },
    });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) return reply.status(404).type('application/problem+json').send({ type: '/problemas/nao-encontrado', title: 'Rota não encontrada', status: 404 });
      return reply.type('text/html').sendFile('index.html', { maxAge: 0 });
    });
  }
  return app;
}
