# StackSync em contêiner: uma imagem com o conteúdo compilado, a interface compilada e a API (Fastify, rodando com
# tsx, como no MVP). A API serve a interface na mesma origem. Sem DATABASE_URL, usa o PostgreSQL embutido (PGlite)
# gravado em /dados, que o compose monta como volume.

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
WORKDIR /app

# Dependências primeiro, para o cache do Docker reaproveitar a instalação quando só o código muda.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/content/package.json packages/content/
COPY packages/contracts/package.json packages/contracts/
COPY packages/engine/package.json packages/engine/
RUN pnpm install --frozen-lockfile

# Compila o pacote de conteúdo (validações e lint de vocabulário) e a interface (tokens do DESIGN.md e fontes).
FROM deps AS build
COPY . .
RUN pnpm --filter @stacksync/content run build \
 && pnpm --filter @stacksync/web run build

FROM base AS app
ENV HOST=0.0.0.0 \
    PORT=8787 \
    STACKSYNC_DADOS=/dados
COPY --from=build /app /app
RUN mkdir -p /dados && chown -R node:node /dados
USER node
WORKDIR /app/apps/api
EXPOSE 8787
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/v1/catalogo').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
# Chama o tsx direto (o mesmo que `pnpm start` da API), sem baixar o pnpm na partida do contêiner.
CMD ["./node_modules/.bin/tsx", "src/main.ts"]
