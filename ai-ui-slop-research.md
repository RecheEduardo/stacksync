# Como reduzir o “AI slop” em interfaces feitas com Claude Code

**Pesquisa e recomendação técnica | 10 de novembro de 2026**  
**Escopo:** Claude Code, skills da comunidade, MCPs, React/TypeScript/Tailwind e qualidade de interfaces de produto.

## 1. Decisão executiva

Para interfaces de **aplicações** (dashboards, ferramentas, sistemas internos, SaaS, formulários, configurações e telas com dados), a escolha principal desta pesquisa é **[Interface Design, de Dammyjay93](https://github.com/Dammyjay93/interface-design)**. É uma skill comunitária com escopo explicitamente voltado a product UI, decisões de design persistentes e consistência entre sessões. O repositório registra licença MIT, cerca de 6 mil estrelas, 381 forks e 50 commits na consulta desta pesquisa. A popularidade é um sinal de adoção, não uma medida de qualidade.

Para uma camada de revisão, a melhor ferramenta complementar é **[Impeccable, de Paul Bakaus](https://github.com/pbakaus/impeccable)**. Ela oferece comandos especializados de crítica e auditoria, além de um detector determinístico que pode ser executado sobre arquivos ou uma página renderizada. Na consulta, a versão mais recente listada era 4.8.0, publicada em 26/10/2026, sob licença Apache-2.0.

**Minha combinação recomendada:**

1. `interface-design` como skill principal para pensar, construir e manter coerência em telas de produto.
2. Impeccable como revisão separada, acionada depois da implementação. Não deixar duas skills concorrentes dirigirem o mesmo processo de geração automaticamente.
3. Playwright para percorrer a interface real e guardar screenshots; axe-core/Storybook para uma primeira camada automatizada de acessibilidade.
4. O design system existente do repositório como fonte de verdade. Não permitir que a skill substitua os componentes e tokens do projeto por um sistema inventado.

### Instalação da skill principal

```bash
npx skills add https://github.com/dammyjay93/interface-design --skill interface-design --agent claude-code -g
```

Reinicie o Claude Code e confira `/skills`. Para invocá-la diretamente:

```text
/interface-design
```

Ou peça, por exemplo:

```text
Use interface-design para implementar esta tela de produto. Antes de alterar código,
inspecione a arquitetura, os componentes existentes, os tokens, os fluxos e os estados.
Preserve as convenções do projeto. Proponha a hierarquia e a direção visual antes de
codificar. Não crie um novo design system se o repositório já possuir um.
```

A instalação por plugin também é documentada pelo projeto. Ela disponibiliza comandos adicionais de revisão:

```text
/plugin marketplace add Dammyjay93/interface-design
/plugin menu
```

Selecione `interface-design` e reinicie o Claude Code. Nesse fluxo, o repositório documenta `/interface-design:design-review` e `/interface-design:design-deslop` para revisar hierarquia e remover padrões visuais genéricos. Consulte o [README e instruções atuais](https://github.com/Dammyjay93/interface-design).

**Atenção:** a skill não é um substituto de testes nem de validação com usuários. Sua vantagem específica é organizar julgamento e memória de design para interfaces de produto. Para uma tela que já existe e precisa de auditoria, Impeccable pode ser mais forte como primeira ferramenta.

---

## 2. O problema: “AI slop” é mais do que uma estética clichê

O termo costuma apontar para sinais visuais recorrentes: hero centralizado, três cards iguais, ícones em tiles arredondados, gradientes azul/roxo, glassmorphism, sombras decorativas, tipografia sem personalidade e animações de entrada repetidas. Há relatos comunitários que descrevem exatamente essa convergência. Isso é útil como sintoma, mas **não é uma lista universal de elementos proibidos**.

Inter, Roboto, cards, cantos arredondados, gradientes e sombras podem ser escolhas legítimas. O problema aparece quando são adotados sem relação com tarefa, conteúdo, marca, domínio ou sistema visual. Uma interface minimalista pode ser excelente; uma interface “ousada” pode ser ruim. Originalidade não compensa fluxo confuso, texto ilegível ou comportamento incorreto.

É melhor diagnosticar seis falhas diferentes:

| Falha | Como aparece | O que precisa corrigir |
|---|---|---|
| **Estética genérica** | A tela parece intercambiável com dezenas de produtos | Direção visual específica, coerente com domínio e produto |
| **UX/arquitetura genérica** | A tela é bonita, mas não prioriza o trabalho real do usuário | Tarefas, IA, hierarquia, sequência e modelo mental |
| **Conteúdo artificial** | Lorem ipsum, métricas fictícias, rótulos vagos, exemplos irreais | Conteúdo e dados representativos, inclusive extremos |
| **Sistema inconsistente** | Cada tela inventa fonte, cor, botão, radius ou espaçamento | Reuso de tokens, componentes e decisões aceitas |
| **Produto incompleto** | Só existe o estado feliz; erros, vazio, loading e permissões são esquecidos | Estados e feedback de ponta a ponta |
| **Qualidade técnica baixa** | Layout quebra no mobile, foco some, contraste falha ou a tela salta | Testes de browser, acessibilidade, responsividade e performance |

Uma boa estratégia não bloqueia “roxo” ou “cards”. Ela exige que cada decisão importante tenha um motivo verificável. Um dashboard pode usar cards porque compara entidades independentes; não deveria usar três cards idênticos apenas porque o modelo costuma fazê-lo.

### Causas mais prováveis

- **Brief insuficiente:** “faça um dashboard moderno” não define quem usa, o que precisa fazer, quais dados importam ou quais decisões a tela deve facilitar.
- **Prior implícito do modelo:** quando não há evidência específica, o modelo tende a usar padrões reconhecíveis e frequentes.
- **Pouco contexto do repositório:** o agente não descobre componentes, tokens, versões, padrões e limitações já existentes.
- **Memória de decisões fraca:** a sessão seguinte não sabe o que foi aprovado ou rejeitado, e pode reintroduzir soluções descartadas.
- **Ausência de inspeção visual real:** o agente escreve JSX/CSS, mas não olha a tela renderizada em diferentes larguras e estados.
- **Crítica feita pelo mesmo agente sem critérios:** “está bonito” não é um teste. O agente precisa de tarefas, cenários, evidências e critérios de aceitação.

---

## 3. Relatos de pessoas com a mesma frustração

Estes relatos são experiências individuais, não estudos controlados. Servem para entender causas e workflows, não para provar que uma skill funciona universalmente.

### Caso A — skills e prompt extenso não resolveram a falta de “taste”

Em uma discussão no r/ClaudeAI, um desenvolvedor de agência relata ter usado `/frontend-design`, `ui-ux-pro-max`, screenshots de referência, regras de voz da marca e um prompt de cerca de 6 mil tokens. Mesmo assim, recebeu um hero com gradiente mesh, glassmorphism, três feature pills e CTA com glow para uma marca que queria uma direção mais contida. Foram necessárias muitas iterações; uma alteração posterior de espaçamento reintroduziu um elemento que já havia sido rejeitado. Em outros projetos, telas de sessões diferentes divergiram mesmo com o mesmo brand kit.

A conclusão do autor foi que o agente não preservava o histórico de decisões: o que foi aceito, rejeitado e estabelecido como regra não era carregado de forma confiável nas chamadas seguintes. Ele experimentou uma camada própria para guardar variantes rejeitadas, tokens aceitos e exemplos de voz da marca. Isso é uma solução relatada pelo próprio autor, não uma validação independente.

**Lição:** aumentar o prompt não resolve necessariamente falta de memória operacional. Registre decisões aceitas e rejeitadas em um arquivo pequeno e recuperável. [Discussão original](https://www.reddit.com/r/ClaudeAI/comments/1t24gan/few_months_of_frontenddesign_uiuxpromaxskill/), maio de 2026 (data aproximada a partir do marcador “6mo ago” exibido na consulta).

### Caso B — mais regras visuais podem piorar a diversidade

Outro desenvolvedor, com experiência de product design, descreveu que instruções muito prescritivas sobre valores de alpha, bordas e tokens deixavam as saídas visualmente parecidas entre projetos. Ao estudar o `frontend-design` oficial, preferiu instruções mais baseadas em princípios e exploração do domínio antes de escolher a estética. Relatou resultados iniciais mais pensados após essa mudança.

**Lição:** não substituir os padrões genéricos do modelo por um novo conjunto de proibições genéricas. Princípios e fatos do produto devem orientar; restrições absolutas ficam para tokens, acessibilidade, plataforma, marca e requisitos reais. [Discussão original](https://www.reddit.com/r/ClaudeAI/comments/1qj2lwg/i_figured_out_how_to_get_consistently_great_ui/), janeiro de 2026.

### Caso C — designer criou uma skill para dashboards e ferramentas

Em janeiro de 2026, um product designer relatou que as telas geradas eram “okay-ish” e genéricas, com gasto de tokens em várias iterações. Ele transformou anos de experiência em princípios para dashboards, painéis administrativos, ferramentas utilitárias e layouts densos. Afirmou que a primeira saída passou a ficar mais próxima do que esperava e publicou comparações antes/depois.

**Lição:** uma skill especializada em telas de produto pode ser mais apropriada do que uma skill de landing page. A alegação de “80%” é uma estimativa do autor, não um benchmark. [Post original](https://www.reddit.com/r/ClaudeAI/comments/1q4l76k/i_condensed_8_years_of_product_design_experience/), 05/01/2026.

### Caso D — relato positivo sobre Impeccable, mas sem medição

Em uma thread de março de 2026, participantes recomendaram Impeccable para limpar sinais de UI gerada; um usuário relatou que o utiliza bastante e que o comando `/audit` é uma boa porta de entrada. É uma indicação prática, mas não mede a taxa de correções corretas nem a qualidade de UX resultante. [Discussão original](https://www.reddit.com/r/ClaudeCode/comments/1s2cgdo/what_do_you_guys_use_in_promptsskills_to_get_less/), 24/03/2026.

### Caso E — contraponto recente: Impeccable também não resolveu tudo

Em 26/10/2026, um usuário perguntou como melhorar UX/UI em aplicações (inputs, shells, calendários, cards), explicitando que não falava de páginas de marketing. Disse não ter ficado satisfeito com Claude Design nem com Impeccable. A discussão teve pouca participação, mas é importante porque mostra que uma skill conhecida não garante “taste” nem substitui um workflow de avaliação. [Thread original](https://www.reddit.com/r/ClaudeCode/comments/1xfumto/how_are_you_handling_uxui_with_claude/), 26/10/2026.

### Caso F — especialização estética forte pode virar outro tipo de template

Em julho de 2026, um usuário descreveu ter criado o VibeCurb porque ferramentas geravam repetidamente layouts SaaS arredondados e glassmorphism. A resposta foi impor uma estética brutalista, tipografia grande e bastante whitespace. O relato é útil como exemplo de direção deliberada, mas a skill pode trocar o template SaaS por um template brutalista se a direção não for apropriada ao produto. [Post original](https://www.reddit.com/r/ChatGPT/comments/1uzp8xa/i_got_tired_of_ai_generating_flat_boring_ui_so_i/), 18/07/2026.

**Síntese dos relatos:** as soluções mais recorrentes não são “proibir gradientes” ou “adicionar mais prompt”. São (1) contexto de produto, (2) direção visual fundamentada, (3) memória das decisões, (4) inspeção do resultado renderizado e (5) revisão contra critérios definidos. Há evidência comunitária desses padrões, mas não há ensaio comparativo robusto que prove uma skill vencedora em todos os projetos.

---

## 4. Qual skill pronta escolher

### Matriz comparativa

| Skill | Melhor uso | O que oferece | Limites e riscos | Decisão |
|---|---|---|---|---|
| **[Interface Design](https://github.com/Dammyjay93/interface-design)** | Dashboards, SaaS, apps, ferramentas, admin e telas de dados | Princípios de craft, direção visual, memória em `.interface-design/system.md`, consistência; fluxo de revisão e deslop via plugin | Não é detector determinístico; a atividade recente não ficou verificável por data de release no snapshot consultado | **Principal para product UI** |
| **[Impeccable](https://github.com/pbakaus/impeccable)** | Auditar, criticar, refinar e melhorar UI existente; também cria telas | 24 comandos; `critique`, `audit`, `polish`, `bolder`; 62 regras determinísticas de detecção; findings P0–P3 | Heurísticas podem gerar falsos positivos/negativos; hooks executam fora da aprovação normal; busca catálogo remoto e registra telemetria anônima por padrão | **Melhor camada de crítica e gates** |
| **[Taste Skill](https://github.com/Leonxlnx/taste-skill)** | Sites de marca, landing pages, portfólios, páginas públicas | Direção de arte, biblioteca de referências, render/inspeção em browser, checker e finish gate | A skill diz explicitamente que não é para dashboards ou telas de app; postura forte de art direction e motion pode ser excessiva em produto | Só para marketing/web pública |
| **[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)** | Consulta de estilos, paletas, tipos, regras e guidelines por stack | Base pesquisável; recomendações por tipo de produto; gera design system persistível com master e overrides por página; React/Tailwind aparecem entre stacks | Mais uma base de padrões do que um revisor independente; pode levar a combinações previsíveis se o agente apenas aceitar recomendações; exige Python 3 para scripts | Referência auxiliar, não skill principal |
| **[Anthropic `frontend-design`](https://github.com/anthropics/skills/tree/main/skills/frontend-design)** | Direção estética inicial e novas interfaces | Skill curta, baseada em princípios: assunto, público, objetivo e escolhas deliberadas de layout/tipografia/cor | Não traz detector, auditoria técnica nem mecanismo próprio de memória; é orientação, não pipeline de qualidade | Boa base leve, mas não resolve o processo sozinho |
| **[UIZZE `anti-ui-slop`](https://github.com/uizze/uizze/blob/main/plugins/claude-directory/skills/anti-ui-slop/SKILL.md)** | Design guiado por referências reais e contrato visual | Skill Apache-2.0; catálogo público gratuito; referências adicionais via MCP opcional; inclui estados e gate final | “800.000+ telas” é alegação do fornecedor; parte do benefício depende de serviço/MCP externo; referências podem induzir cópia/homogeneização | Testar apenas se referências externas forem necessárias |
| **[Baseline UI](https://github.com/ibelick/ui-skills)** | Limpeza rápida de código UI em Tailwind/React | Regras concretas para tipografia, layout, animação e componentes; revisão com sugestões de código | Pode impor um baseline opinativo que não corresponde a todo produto; não é processo completo de UX | Útil em projetos compatíveis, como lint de estilo |

### Por que `interface-design` vence para telas de produto

O escopo corresponde diretamente ao tipo de interface que normalmente exige lógica de produto: dashboards, apps, ferramentas e painéis administrativos. A skill foca em hierarquia, proporções, densidade, ritmo espacial, estados, tokens e consistência. Ela registra decisões em `.interface-design/system.md` e as reaplica em sessões posteriores. Isso ataca um problema demonstrado nos relatos: sessões novas podem reinterpretar a mesma marca e esquecer decisões visuais rejeitadas.

Não há prova independente de que ela produz uma interface melhor que Impeccable ou outra skill. A escolha é uma **decisão de adequação ao escopo**, não um ranking de qualidade aferido por benchmark.

### Quando escolher outra

- **Tela existente com aparência genérica ou inconsistências:** use `/impeccable critique` ou `/impeccable audit`; depois execute correções específicas.
- **Novo site de marketing ou página pública:** Taste Skill é mais aderente ao escopo. A versão 2.5.1 saiu em 07/11/2026; o autor relata gate com checker, layout e copy lint, checks em larguras 1440/1024/768/390 e dependência de Node 22+ e Chromium. Esses são claims do projeto, não benchmark independente.
- **Pesquisa de referências e fundamentos de estilo:** consulte UI UX Pro Max para opções e critérios, mas não aceite automaticamente sua combinação recomendada.
- **Direção visual livre e leve:** `frontend-design` é uma base concisa, sem impor estrutura de comandos ou detector.

### Instalação alternativa: Impeccable

```bash
npx impeccable install
```

Recarregue Claude Code e inicialize no projeto:

```text
/impeccable init
```

Comandos úteis:

```text
/impeccable critique a tabela de resultados e priorize os problemas por impacto
/impeccable audit
/impeccable polish o formulário de cadastro sem trocar os componentes existentes
```

Detector, de forma independente do agente:

```bash
npx impeccable detect src/
npx impeccable detect http://localhost:5173
npx impeccable detect --json .
npx impeccable detect --github src/
```

A varredura de arquivos JSX/TSX executa regras estáticas; regras que dependem de renderização, como contraste e texto pequeno, precisam da URL da aplicação. Exit code `2` indica achados e `1` indica que o alvo não pôde ser verificado. Uma marca pode justificar uma exceção (por exemplo, fonte corporativa); documente o motivo em vez de desativar a regra indiscriminadamente.

**Cuidados:** leia os hooks instalados antes de rodar em modo não supervisionado. A documentação do projeto alerta que hooks do Claude Code executam fora do fluxo de aprovação normal e que a primeira edição pode baixar o engine. A skill busca direções visuais do catálogo remoto `impeccable.style`; desativar telemetria impede o registro anônimo de escolhas, mas não impede essa consulta. Comando de desligamento: `npx impeccable telemetry off` ou `DO_NOT_TRACK=1`. Consulte [README: hooks e privacidade](https://github.com/pbakaus/impeccable#good-to-know).

---

## 5. Skills, MCPs e verificadores não são a mesma coisa

Uma skill é um conjunto de instruções e recursos para orientar o agente. Um MCP dá acesso a dados ou ações de outra ferramenta. Um browser automatizado permite inspecionar o que foi renderizado. Um verificador determinístico encontra classes específicas de falha. Não se deve tratar uma dessas categorias como substituta das outras.

### Componentes úteis do workflow

| Componente | Quando usar | Benefício | Não resolve |
|---|---|---|---|
| `interface-design` | Criar/refinar telas de aplicação | Processo de design e memória de decisões | Testes funcionais ou prova de usabilidade |
| Impeccable | Criticar e auditar UI pronta | Checklist de crítica, auditoria e detector estático/visual | Julgamento completo de gosto e adequação do produto |
| Playwright (CLI ou MCP) | Abrir a aplicação, operar fluxos, tirar screenshots | Evidência do browser real, interação e comparação | Decide se a hierarquia é a certa para o usuário |
| axe-core / Storybook a11y | Testar DOM e componentes | Encontra várias violações automatizáveis de acessibilidade | Acessibilidade completa; há falhas que exigem teste manual |
| Figma MCP | Quando Figma contém o design system aprovado | Lê componentes, variáveis e dados de layout; pode escrever no canvas | Não cria por si só decisões de UX nem garante fidelidade |
| shadcn MCP | Quando o projeto usa registries shadcn-compatíveis | Busca e instala componentes de registry | Não deve impor shadcn a um projeto VTEX ou design system próprio |
| Context7 | Quando o agente precisa da documentação vigente de uma lib | Evita instruções desatualizadas para APIs | Não é ferramenta de design nem crítica visual |

### Recomendações específicas

**Playwright:** a documentação oficial oferece browser automation por MCP e também screenshots. O servidor MCP oficial da Microsoft funciona com Claude Code e opera por snapshots estruturados de acessibilidade. Entretanto, o próprio projeto Playwright observa que CLI + skills podem ser mais eficientes em coding agents porque carregam menos schemas de ferramentas e árvores grandes no contexto; MCP continua útil em explorações iterativas com sessão persistente. Não instale ambos sem uma necessidade concreta. [Playwright MCP](https://github.com/microsoft/playwright-mcp) · [Visual comparisons](https://playwright.dev/docs/test-snapshots).

**Figma MCP:** escolha quando arquivos Figma forem fonte de verdade. A integração oficial pode ler componentes, variables e layout e também criar/alterar conteúdo nativo no canvas; escrita depende do plano e seat aplicáveis. O servidor remoto é o caminho recomendado pela Figma para clientes suportados, incluindo Claude Code. [Figma MCP docs](https://developers.figma.com/docs/figma-mcp-server/).

**Storybook + axe-core:** para bibliotecas de componentes, o addon oficial de acessibilidade executa verificações baseadas em axe-core. No caso de projetos Vite, a documentação atual direciona para a integração Vitest do Storybook; o antigo Test Runner não tem mais suporte oficial. [Storybook accessibility tests](https://storybook.js.org/docs/writing-tests/accessibility-testing) · [Test Runner notice](https://storybook.js.org/addons/@storybook/test-runner).

**shadcn MCP:** só faz sentido em projeto que realmente consome componentes de registry compatível. O servidor pode pesquisar, navegar e instalar componentes; isso não significa que seja adequado para substituir componentes de uma biblioteca interna ou VTEX. [shadcn MCP](https://ui.shadcn.com/docs/mcp).

**Mobbin e galerias:** use como pesquisa de padrões e fluxos, não como fonte de design para copiar. Uma tela de referência explica um problema parecido; ela não comprova que aquele layout, densidade ou fluxo é correto para seu produto. Nesta pesquisa não foi possível validar suficientemente um MCP oficial Mobbin com contrato, licença, plano e manutenção comparáveis aos conectores oficiais de Figma/Playwright. Portanto, não o recomendo como dependência obrigatória.

### Segurança e privacidade

- Instale skills e MCPs de repositórios oficiais ou autores identificáveis; leia `SKILL.md`, scripts, `package.json`, licença, hooks e permissões antes de executar.
- Não conceda acesso de escrita a produção, dados reais de clientes ou arquivos internos a um serviço MCP externo sem autorização explícita.
- Para MCP remoto, verifique autenticação, escopos, dados enviados, retenção e logs. O protocolo MCP documenta autorização OAuth 2.1 para servidores que acessam dados e operações sensíveis: [MCP Authorization](https://modelcontextprotocol.io/docs/tutorials/security/authorization).
- Em Impeccable, revisar hooks e desativar telemetria se a política do projeto exigir. Em Figma, limitar o acesso ao arquivo e seat necessários.
- Para testes automatizados, usar dados sintéticos/anonimizados e ambiente de desenvolvimento ou homologação.

---

## 6. Quality gates: critérios PASS/FAIL

**Severidade**

- **BLOCKER:** tarefa central impossível, dado crítico errado, fluxo quebrado, barreira grave de acessibilidade, perda de dados, navegação sem saída ou comportamento que impede uso.
- **MAJOR:** hierarquia confusa, estado importante ausente, ruptura responsiva, inconsistência de design system, affordance ambígua ou falha frequente que prejudica a tarefa.
- **MINOR:** refinamento de ritmo, alinhamento, microcopy, animação ou detalhe não essencial.

Um gate pode ser `PASS`, `FAIL` ou `WAIVED`. Exceção exige motivo, risco conhecido, responsável e escopo. “Ficou mais bonito” não é justificativa.

| Gate | PASS | FAIL | Severidade padrão | Evidência / ferramenta |
|---|---|---|---|---|
| **G0. Objetivo e usuário** | Pessoa usuária, tarefa principal, contexto e resultado esperado estão identificados. O sucesso é observável (ex.: completar cadastro sem erro, localizar pedido). | Brief limita-se a “moderno”, “bonito” ou “intuitivo”; não informa o que o usuário precisa realizar. | BLOCKER | Brief curto, tickets/support, entrevista ou hipótese explicitamente marcada como hipótese. |
| **G1. Descoberta do projeto** | Stack, rotas, componentes, tokens, breakpoints, formulários, padrões e restrições foram inspecionados antes da alteração. | Agente troca biblioteca, inventa tokens, recria componentes já existentes ou muda estrutura sem justificativa. | MAJOR | Inventário de repositório; package manifest; search nos tokens e componentes; inspeção de rotas. |
| **G2. Arquitetura da informação** | Conteúdo e ações seguem a tarefa mais frequente/importante; rótulos e grupos refletem o modelo mental do domínio. | Conteúdo organizado por conveniência estética ou seções decorativas; ação principal escondida; navegação incoerente. | BLOCKER para fluxo central; MAJOR nos demais casos | Mapa de fluxo, wireframe textual, revisão com tarefa e cenários. |
| **G3. Hierarquia e densidade** | Em uma olhada rápida, fica claro onde começar, o que mudou e qual ação vem depois; densidade corresponde ao trabalho (p. ex., tabela operacional pode ser densa). | Componentes têm o mesmo peso; tudo vira card; há excesso de espaço ou compressão sem relação com o uso. | MAJOR | Screenshot desktop/mobile, teste de leitura rápida e crítica por tela. |
| **G4. Conteúdo e microcopy** | Texto nomeia ações e entidades reais; exemplos representam valores plausíveis, unidades, datas, nomes longos e limites. | Lorem ipsum, números arbitrários apresentados como reais, “saiba mais” sem contexto ou mensagens genéricas de erro. | MAJOR | Conteúdo de exemplo aprovado, tabela de casos extremos, revisão de linguagem. |
| **G5. Estados e feedback** | Fluxos contemplam loading, empty, error, success, disabled, sem permissão, parcial, sem resultados, validação e repetição quando aplicáveis. Ação tem feedback perceptível. | Só o estado feliz existe; usuário não sabe se salvou, falhou ou está carregando; erro não informa como se recuperar. | BLOCKER em fluxo crítico; MAJOR nos demais | Testes de componente/e2e; matriz estado × componente; inspeção no browser. |
| **G6. Sistema visual e identidade** | Tokens e componentes existentes são reutilizados. Nova exceção tem motivo. Há direção visual ligada ao domínio e às características reais do produto. | Cores, fontes, radius, sombras, grid e componentes são improvisados; a tela poderia pertencer a qualquer produto. | MAJOR | CSS variables/tailwind config, Storybook, tokens, screenshot comparado às telas existentes. |
| **G7. Responsividade** | Conteúdo e controles permanecem utilizáveis em 320, 375/390, 768, 1024 e desktop relevante; não há overflow inesperado nem sobreposição. | Layout quebra, controles ficam inacessíveis, tabela perde dados ou conteúdo se sobrepõe. | BLOCKER se impedir tarefa; MAJOR nos demais | Playwright em breakpoints reais; screenshots e teste de zoom/reflow. |
| **G8. Acessibilidade** | Semântica, labels, nome acessível, teclado, foco visível, ordem lógica, status, contraste, zoom e reduced motion foram verificados. | Controle sem nome, foco invisível, contraste insuficiente, teclado bloqueado ou estado comunicado apenas por cor. | BLOCKER para impedimento; MAJOR para violações relevantes | axe-core/Storybook a11y + navegação manual por teclado + leitor de tela em fluxo crítico. |
| **G9. Funcional e integração** | Botões, links, formulários, paginação, filtros, modais, seleção e persistência funcionam de ponta a ponta. | Ação decorativa sem função, link quebrado, dados não persistem ou comportamento não corresponde ao rótulo. | BLOCKER | Playwright/Cypress, testes unitários e testes de API/integração. |
| **G10. Qualidade visual renderizada** | Screenshot real foi inspecionado em pelo menos desktop e mobile, com conteúdo e estado representativos. Diferenças visuais relevantes foram resolvidas ou justificadas. | Aprovação baseada só em código; sem inspeção do browser; regressões óbvias não avaliadas. | MAJOR | Playwright screenshots / visual regression; revisão humana. |
| **G11. Performance e estabilidade** | Imagens e fontes têm estratégia de carregamento; layout não salta; animação não bloqueia interação; orçamento de bundle respeitado. Em páginas públicas, Core Web Vitals são medidos. | Assets pesados, layout shift evitável, renderizações/efeitos desnecessários ou regressões importantes. | MAJOR; BLOCKER se impedir uso | Lighthouse/Performance panel, bundle analyzer, RUM. Referência para Core Web Vitals: LCP ≤2,5s, INP ≤200ms, CLS ≤0,1 no percentil 75. |
| **G12. Revisão final** | Crítica registra até os problemas mais impactantes, cada correção é validada e exceções estão explícitas. | O próprio agente aprova a tela sem evidência; achados de alta severidade ficam sem resposta. | MAJOR | `/interface-design` review, Impeccable critique/audit, checklist independente. |

### Requisitos de acessibilidade: base mínima WCAG 2.2 AA

Use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) como referência, não uma lista informal de “boas práticas”. Exemplos de critérios relevantes:

- **Contraste de texto:** 4,5:1 para texto normal e 3:1 para texto grande (1.4.3).
- **Contraste de componentes e informação gráfica:** 3:1 para partes visuais necessárias para identificar componentes e estados (1.4.11).
- **Reflow:** a 320 CSS px, a maioria do conteúdo deve ser apresentada sem rolagem bidimensional desnecessária (1.4.10), respeitando exceções da norma, como tabelas que exigem duas dimensões.
- **Teclado:** toda função disponível por teclado, foco visível e ordem que preserve significado e operabilidade (2.1.1, 2.4.7, 2.4.3).
- **Foco não encoberto:** o item focado não pode ficar totalmente escondido por conteúdo criado pelo autor (2.4.11, AA).
- **Tamanho do alvo:** mínimo 24 × 24 CSS px, salvo exceções especificadas (2.5.8, AA). 44 × 44 px é uma meta de conforto útil, mas não confundir com o requisito AA mínimo.
- **Status e erros:** mensagens de status devem ser programaticamente identificáveis quando aplicável (4.1.3); rótulos e instruções devem estar presentes em entradas (3.3.x).
- **Movimento:** respeitar `prefers-reduced-motion` e evitar movimento não essencial que cause desconforto.

A automação encontra apenas uma parte dos problemas. axe-core e Storybook servem como primeira triagem. Ainda é necessário testar teclado, foco, zoom, leitura por tecnologia assistiva, compreensão de mensagens e conclusão de tarefas.

### Critérios de revisão visual humana

Na revisão do screenshot, responda com evidência, não gosto abstrato:

1. Qual é a tarefa primária desta tela? Onde o olho encontra primeiro essa ação ou informação?
2. A hierarquia continua clara em um screenshot reduzido? Elementos secundários estão competindo com o trabalho principal?
3. A densidade é adequada ao tipo de uso? Uma ferramenta operacional pode precisar de tabela e alta densidade; não deve ser transformada em landing page.
4. O que é próprio deste produto? Cite pelo menos três decisões concretas de conteúdo, fluxo, composição, dados ou identidade. Não vale dizer apenas “é moderno”.
5. A tela mantém coerência com o restante da aplicação sem copiar cegamente uma tela anterior?
6. O layout funciona com nomes longos, valores altos/baixos, ausência de dados e mensagens extensas?
7. O movimento ajuda a entender causa/efeito ou é decoração? Pode ser reduzido?
8. O que acontece quando se remove logotipo e cor da marca? Ainda é possível identificar o domínio e a tarefa pela estrutura e conteúdo? Este teste é diagnóstico, não prova formal de marca.

---

## 7. Workflow operacional sem `design.md` monolítico

A ideia é manter contexto específico curto e dividido. Não é preciso documentar cada decisão visual antes de começar.

### Estrutura enxuta sugerida

```text
.claude/
  CLAUDE.md                 # convenções de execução e comandos do projeto
  ux/
    product-context.md      # público, tarefa, domínio, restrições reais (curto)
    design-system-map.md    # onde estão tokens, componentes, Storybook e versões
    visual-decisions.md    # referências, escolhas aprovadas/rejeitadas e motivo
    quality-gates.md        # critérios PASS/FAIL usados no projeto
```

Se `interface-design` for usado, deixe que ele mantenha `.interface-design/system.md` como memória específica da direção e padrões de interface. Não copie todos esses conteúdos para `CLAUDE.md`. O arquivo global deve apontar para os módulos e dizer quando carregá-los.

### Sequência de trabalho

1. **Descobrir:** Claude lê `CLAUDE.md`, inspeciona stack/versões, rotas, tokens, componentes e testes. Não altera código.
2. **Definir a tarefa:** registrar usuário, ação primária, dados necessários, estados e sucesso esperado em `product-context.md` ou no ticket.
3. **Escolher direção:** declarar características e restrições visuais fundamentadas no domínio. Usar referências para explicar composição, densidade e interação, não para reproduzir pixels.
4. **Planejar a tela:** mapear estrutura, hierarquia e estados antes de gerar componentes. Perguntar só quando uma informação ausente muda uma decisão importante; senão, declarar a hipótese.
5. **Implementar:** preservar componentes, arquitetura e convenções. Não trocar biblioteca ou introduzir dependência para resolver só um detalhe estético.
6. **Ver no browser:** abrir em localhost, operar o fluxo, inspecionar console e rede, capturar desktop e mobile. Corrigir o layout observado.
7. **Criticar separadamente:** rodar review/critique/audit com a skill adequada. Resolver primeiro BLOCKER, depois MAJOR e por último MINOR.
8. **Executar gates:** lint, typecheck, testes, axe/Storybook e screenshot comparison conforme o projeto.
9. **Persistir decisões:** registrar no `visual-decisions.md` apenas o que foi aprovado/rejeitado e que deve orientar telas futuras. Não registrar cada iteração descartável.

### Prompt operacional reutilizável

```text
Use /interface-design para esta tarefa de product UI.

Antes de editar:
- inspecione o projeto, a stack e suas versões;
- localize tokens, componentes, padrões de formulário, tabela, navegação e estados;
- identifique o usuário, a tarefa principal e a decisão/ação que a tela deve facilitar;
- liste informações ausentes como hipóteses, sem inventar regra de negócio.

Proponha a arquitetura da informação e a hierarquia da tela antes do código.
Use os tokens e componentes existentes. Não crie outro design system.
Evite padrões genéricos quando não forem justificados pelo produto, mas não trate
fontes, cards, gradientes, radius ou sombras como proibidos em si.

Implemente o fluxo completo: loading, empty, error, success, disabled, no permission,
partial failure e validação, quando aplicáveis. Use conteúdo representativo, não placeholders.

Depois, abra a aplicação no browser, teste o fluxo e inspecione screenshots em desktop
(1440px) e mobile (390px), além dos breakpoints intermediários relevantes.
Execute os quality gates do projeto. Liste evidências PASS/FAIL, riscos e exceções.
Não declare concluído sem verificar o resultado renderizado.
```

---

## 8. O que sabemos, o que é hipótese e o que não foi possível verificar

### Sabemos, com suporte documental

- `interface-design` declara foco em interfaces de produto (apps, dashboards, tools, admin) e não em sites de marketing; declara memória de decisões em `.interface-design/system.md` e documenta instalação Claude Code e comandos de revisão.
- Impeccable documenta 24 comandos, 62 regras determinísticas, auditoria P0–P3 e instalação com Claude Code. A lista de releases consultada mostrava 4.8.0 em 26/10/2026.
- Taste Skill 2.5.1 foi publicada em 07/11/2026 e declara foco em sites públicos; seu `SKILL.md` não recomenda a skill para dashboards ou telas de app.
- Figma mantém MCP oficial que lê dados de design e pode escrever no canvas nos clientes e planos compatíveis.
- Playwright mantém MCP oficial e documenta comparação visual por screenshots. Storybook documenta o addon de acessibilidade baseado em axe-core.
- WCAG 2.2 é a referência vigente usada neste documento; a recomendação W3C data de 12/12/2024.

### Hipóteses razoáveis, que precisam ser validadas no seu repositório

- Uma skill que guarda decisões aceitas/rejeitadas deve reduzir deriva entre sessões em comparação com instruções descartadas ao fim de cada conversa.
- Inspecionar o browser e executar estados reais deve reduzir problemas que uma leitura estática de JSX não encontra.
- Separar geração e crítica em passes distintos tende a tornar os problemas mais explícitos; não há benchmark aqui que prove que isso melhora todos os resultados.

### Não foi possível verificar de forma suficiente

- Não foi localizado um benchmark independente e controlado comparando `interface-design`, Impeccable, Taste Skill, UI UX Pro Max e `frontend-design` na mesma tarefa, mesmo modelo, contexto e stack.
- Os números de estrelas, checks e telas catalogadas são métricas dos projetos, não validações de qualidade ou adoção empresarial.
- O repositório `interface-design` expunha 50 commits e contagens de estrelas/forks, mas a página consultada não forneceu uma data de release estável que permitisse afirmar quando ocorreu sua última atualização efetiva. Por isso, não o descrevo como “o mais ativo”.
- Os relatos comunitários citados são autorrelatos e, em alguns casos, têm baixa participação. Eles não demonstram causalidade.
- Não consegui reunir posts individuais de X/Twitter com conteúdo verificável e diretamente relacionado o bastante para citar com confiança. Não substituí essa ausência por uma página de busca ou alegações sobre o que “o X pensa”.
- Também não validei um MCP de Mobbin com documentação primária suficiente para recomendar sua instalação. Figma e Playwright têm documentação oficial mais clara para o papel necessário.

---

## 9. Referências principais

### Skills e repositórios

1. **Dammyjay93 — Interface Design.** Repositório, scope, instruções de instalação, memória e comandos de revisão. MIT. [GitHub](https://github.com/Dammyjay93/interface-design). Consulta em 10/11/2026.
2. **Paul Bakaus — Impeccable.** README, comandos, detector, licença Apache-2.0, hooks e privacidade. [GitHub](https://github.com/pbakaus/impeccable) · [Releases](https://github.com/pbakaus/impeccable/releases). Release 4.8.0 em 26/10/2026.
3. **Leonxlnx — Taste Skill.** Skill e changelog. [SKILL.md](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) · [Releases](https://github.com/Leonxlnx/taste-skill/releases). Release 2.5.1 em 07/11/2026.
4. **Next Level Builder — UI UX Pro Max.** [README e CLI](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). MIT; scripts exigem Python 3.
5. **Anthropic — frontend-design.** [SKILL.md oficial](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md). Consulta em 10/11/2026.
6. **UIZZE — anti-ui-slop.** [SKILL.md](https://github.com/uizze/uizze/blob/main/plugins/claude-directory/skills/anti-ui-slop/SKILL.md). Apache-2.0; catálogo/MCP opcional.
7. **Ibelick — UI skills / baseline-ui.** [Repositório](https://github.com/ibelick/ui-skills). MIT; regras de revisão direcionadas a Tailwind/React.

### Relatos comunitários

8. **Claude AI — “Few months of /frontend-design + ui-ux-pro-max-skill… still generic”.** [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1t24gan/few_months_of_frontenddesign_uiuxpromaxskill/). Maio de 2026, data aproximada na página consultada.
9. **Claude AI — “I figured out how to get consistently great UI from Claude Code”.** [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1qj2lwg/i_figured_out_how_to_get_consistently_great_ui/). Janeiro de 2026.
10. **Claude AI — designer condensou experiência em skill para dashboard/admin.** [Reddit](https://www.reddit.com/r/ClaudeAI/comments/1q4l76k/i_condensed_8_years_of_product_design_experience/). 05/01/2026.
11. **Claude Code — comunidade recomenda Impeccable para reduzir UI slop.** [Reddit](https://www.reddit.com/r/ClaudeCode/comments/1s2cgdo/what_do_you_guys_use_in_promptsskills_to_get_less/). 24/03/2026.
12. **Claude Code — frustração persistente em interfaces de aplicações, mesmo após Claude Design/Impeccable.** [Reddit](https://www.reddit.com/r/ClaudeCode/comments/1xfumto/how_are_you_handling_uxui_with_claude/). 26/10/2026.
13. **ChatGPT — VibeCurb, tentativa de eliminar layouts genéricos por direção estética.** [Reddit](https://www.reddit.com/r/ChatGPT/comments/1uzp8xa/i_got_tired_of_ai_generating_flat_boring_ui_so_i/). 18/07/2026.

### Padrões, acessibilidade, browser e performance

14. **W3C — WCAG 2.2.** [Recomendação](https://www.w3.org/TR/WCAG22/). 12/12/2024.
15. **W3C — histórico de WCAG 2.2.** [Publication history](https://www.w3.org/standards/history/WCAG22/).
16. **Playwright — visual comparisons.** [Documentação](https://playwright.dev/docs/test-snapshots).
17. **Microsoft — Playwright MCP.** [Repositório e comparação MCP vs CLI](https://github.com/microsoft/playwright-mcp).
18. **Storybook — accessibility testing.** [Documentação](https://storybook.js.org/docs/writing-tests/accessibility-testing).
19. **Storybook — aviso sobre Test Runner legado e migração.** [Página do Test Runner](https://storybook.js.org/addons/@storybook/test-runner).
20. **Figma — Figma MCP Server.** [Documentação de desenvolvedor](https://developers.figma.com/docs/figma-mcp-server/).
21. **shadcn/ui — MCP server.** [Documentação](https://ui.shadcn.com/docs/mcp).
22. **Google — Core Web Vitals.** [Documentação](https://developers.google.com/search/docs/appearance/core-web-vitals?hl=pt-BR).
23. **Model Context Protocol — autorização.** [Documentação de segurança](https://modelcontextprotocol.io/docs/tutorials/security/authorization).

---

## Recomendação final

Comece instalando **`interface-design`** e aplicando-a a uma tela real do seu projeto, não a um exemplo genérico. Dê a ela um ticket ou fluxo concreto, permita que inspecione o design system e faça persistir apenas decisões aprovadas. Depois submeta a implementação a uma crítica separada com Impeccable e verifique-a no browser com Playwright.

O ponto central não é fazer Claude escolher uma estética “anti-IA”. É fazer com que cada tela tenha razões de produto, conteúdo, hierarquia, componentes e estados que não seriam intercambiáveis com os de qualquer outro sistema.
