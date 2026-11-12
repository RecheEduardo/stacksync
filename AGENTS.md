# AGENTS.md

Regras inegociáveis para qualquer agente que mexa neste repositório. Leia antes de qualquer tarefa.

## Ordem de autoridade

1. `PRODUCT.md`: escopo e decisões de produto. Define exatamente o que entra; nada além.
2. Partes 1 a 4 (raiz do repositório): regras de negócio (RN), fórmulas, telas e arquitetura.
3. `DESIGN.md` (v2.2, "Concreto Aparente", brutalista e neobrutalista, com fundo em camadas, projeções e um tema só, o claro): decisões visuais, pesquisa e dissecação das referências, invariantes (IV) e gates (DG, com o DG-14 Brutalismo). Toda interface consulta este arquivo e `ai-ui-slop-research.md`.
4. `.interface-design/system.md`: medidas de componentes derivadas do DESIGN.md.

## Regras

- **O motor é puro** (`packages/engine`): sem I/O, sem `Date`, sem `Math.random`, `Math.pow`, `Math.exp` ou `Math.log`. A data de referência é entrada. Verificado por `scripts/lint-fronteiras.mjs` (FF-02).
- **A IA nunca entra no cálculo nem no veredito** (DT-21). Ela escolhe a próxima pergunta dentro da estrutura, sugere respostas, interpreta texto livre e explica o resultado. Nada que ela produz é gravado sem confirmação do usuário (RN-79).
- **Conteúdo, calibração e prompts são dados** (`packages/content/conhecimento`), nunca código (DT-20). Mudar um peso, um limiar ou um texto não muda código.
- **O texto oficial do veredito só sai de modelos de texto** do pacote de conteúdo (Parte 4, 9.8).
- **Sugestões de resposta não recebem a ideia prévia nem resultado parcial** (RN-92, FF-19). Nenhuma sugestão vem marcada.
- **Nenhuma prévia do resultado durante o preenchimento** (RN-81, IV-01). As rotas do questionário não importam nada de veredito.
- **Tokens como fonte única** (FD-01): nenhum literal de cor, nenhum valor arbitrário do Tailwind fora de `apps/web/src/styles/tokens.css`. Sem `transition-all` (FD-02).
- **Um tema só, o claro** (DV-49): nada de tema escuro, `prefers-color-scheme` ou troca de tema. A paleta escura do frontmatter (`colors-invertido`) serve só a blocos pretos locais com `data-regiao="invertida"` (o cartaz da página de entrada); o lint confere contraste e paridade dos dois conjuntos (FD-13, FD-14).
- **Brutalismo com regra** (DG-14): raio zero em tudo (FD-15), contorno de 3px em tinta, sombra dura só no que é clicável, caixa-alta só em textos de até cinco palavras, textura só do domínio.
- **A cor da marca nunca codifica veredito** (IV-21): vermelho é identidade e ênfase; amarelo é ação e escolha.
- **O veredito não anima** (IV-23, FD-16): `motion` só em troca de etapa, contadores de progresso e na página de entrada; nunca em `features/resultado`, `features/relatorio` ou `components/laudo`. Os esqueletos de carregamento ali usam `parado` (DV-52; o lint confere). A rolagem suave (Lenis, DV-51) vale para a aplicação inteira e desliga com "reduzir movimento".
- **Todo carregamento tem esqueleto** (DV-52): o que depende de resposta da API ou da IA aparece com o esqueleto da sua forma (`components/ui/esqueleto.tsx`), nunca em branco nem com um texto solto de "carregando".
- **"Índice de Ajuste" sempre por extenso.** "IA" significa só inteligência artificial.
- **Toda dependência nova é justificada** no pull request (DT-26).
- **Gabaritos dos casos-âncora e testes de aceitação da Parte 3 nunca mudam para fazer um teste passar** (FF-18). Mudança de gabarito só com registro de calibração.

## Comandos

- `docker compose up`: na raiz, sobe a aplicação inteira num contêiner em http://localhost:8080 (interface e API na mesma porta, banco embutido num volume, provedor de IA "Simulado" ligado para testar sem chave). A imagem é recompilada a cada `up` (`pull_policy: build`), então sempre roda o código atual.
- `pnpm install`: instala (quarentena de 7 dias para versões novas).
- `pnpm dev`: compila o conteúdo e sobe a API (porta 8787, PostgreSQL embutido em `.data/`) e a interface (porta 5173). No desenvolvimento, o provedor de IA "Simulado" fica disponível para testar o fluxo sem chave real; ele não existe em produção.
- `pnpm test`: testes de conteúdo, motor e API.
- `pnpm verificar`: lints de design (FD-01, FD-02, FD-04, FD-12) e de fronteiras (FF-01, FF-02, IV-01), tipos e testes.
- `pnpm --filter @stacksync/web e2e`: jornadas no navegador com `pnpm dev` rodando (capturas nas cinco larguras e impressão em `evidencias/capturas/`, axe). Usa o Edge instalado; `STACKSYNC_CANAL=chrome` troca o navegador; `STACKSYNC_URL` aponta para outro servidor.

## Rotas da interface

- `/`: página de entrada pública (T-00), fora da casca e antes de qualquer pedido de chave.
- `/analises`: painel (T-01). `/analises/nova?ramo=&profundidade=` abre o enquadramento já com a escolha.
- `/configuracoes/ia?voltar=`: conexão da IA; depois dela, o usuário volta para a análise que ia começar.

## Desvios registrados em relação à Parte 4

Decididos para caber no PRODUCT.md v1 sem acrescentar escopo; cada um tem o motivo no código.

- **Sem login nesta versão:** o PRODUCT.md não inclui contas. Cada navegador tem um espaço anônimo (cookie HttpOnly), com exportação e exclusão dos dados. A porta de identidade aceita contas depois sem mudar o domínio.
- **Migrações em SQL puro** (`apps/api/src/db/migracoes`) em vez do drizzle-kit, para manter RLS, papéis e o gatilho de imutabilidade legíveis num só lugar.
- **Um usuário de banco com troca de papel por transação** (`SET LOCAL ROLE stacksync_app`) em vez de dois usuários; o isolamento por linha vale em toda consulta de organização.
- **PostgreSQL embutido (PGlite) no desenvolvimento**; `DATABASE_URL` aponta para um PostgreSQL externo.
- **Percurso e sugestões numa chamada só** (RG-12 e RG-13 juntos) para reduzir a espera por pergunta; os validadores e o isolamento da ideia prévia são os mesmos.
- **Fora do escopo do PRODUCT.md e não construídos:** contestação de nível, matriz de prontidão, checklist go/no-go, ADR, comparação entre rodadas, revisão crítica da IA (RG-02) e propostas nos portões (RG-03 a RG-09).
