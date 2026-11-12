# Revisão independente de design (DG-12)

⚠️ DEGRADED: single-context (sem subagentes, que não foram pedidos nesta sessão; detector do Impeccable não rodou porque o motor seria baixado como executável na primeira execução e isso não foi autorizado).

- **Data:** 11/11/2026
- **Escopo:** interface do MVP como estava antes desta revisão (todas as rotas do `apps/web`), lida pelas capturas de `evidencias/capturas/`, pelo app rodando em `localhost:5173` e pelo código.
- **Independência:** a revisão foi feita numa sessão sem o contexto de quem construiu a interface (exigência do DG-12). Nenhum código da aplicação foi alterado durante a revisão.
- **Método:** roteiro do `impeccable critique` (heurísticas de Nielsen, especificidade do design, carga cognitiva, personas) e do `impeccable audit` (acessibilidade, tema, responsividade, desempenho, antipadrões), mais os testes de identidade e de monotonia do próprio DESIGN.md v0.2.

## Veredito

**FAIL (MAJOR).** A interface cumpre as regras de produto e passa na acessibilidade automática, mas reprova nos testes de identidade e de monotonia que o próprio DESIGN.md exige (DG-06) e na hierarquia e densidade (DG-03). O resultado parece um esboço: um cartão branco centralizado numa tela cinza, a mesma composição em quase toda rota, uma família tipográfica com o maior texto em 24px e nenhuma cor fora dos diagramas.

A causa principal não está na execução: está no DESIGN.md v0.2. Ele combateu tão bem o **sobreajuste visual** (gradiente, vidro, métrica-herói) que produziu o **subajuste visual** que ele mesmo define como falha equivalente: "tela genérica, hierarquia plana, monotonia, fonte padrão". As regras que levaram a isso:

| Regra do v0.2 | Efeito observado |
| --- | --- |
| Regra da Cor que Significa (nenhuma cor de marca) | Toda a estrutura em cinza, grafite e nanquim; a marca não existe na tela |
| Família tipográfica única, escala de 1,125 a 1,33, maior texto 24px | Hierarquia achatada; títulos, pergunta e veredito com quase o mesmo peso visual |
| Regra da Folha Única com larguras de 720 e 880px | Conteúdo estreito centralizado em 1440px, com 40 a 60% da largura vazia |
| Modo escuro descartado no MVP (DV-02) | Um tema só, sem preferência do sistema |
| Caixa normal sem sobretítulo, sem destaque, sem ilustração | Nenhum ponto de entrada visual além do texto |
| Taste Skill e página pública só na F4 | Primeiro acesso cai direto num formulário de chave de API |

Isso confirma dois relatos da pesquisa (`ai-ui-slop-research.md`): o Caso B (regras visuais muito prescritivas homogeneízam a saída) e o Caso F (trocar o template SaaS por outro template, aqui o "documento cinza", não resolve).

## Pontuação de saúde (heurísticas de Nielsen)

| # | Heurística | Nota | Achado principal |
| --- | --- | --- | --- |
| 1 | Visibilidade do estado | 3 | "Salvo" na barra e âmbitos cobertos no trilho funcionam; o estado da análise no painel é só texto |
| 2 | Correspondência com o mundo real | 3 | Vocabulário do domínio consistente; "sobreajuste" e "faixa" bem explicados no laudo |
| 3 | Controle e liberdade | 3 | Voltar às respostas e trocar a profundidade existem; "Trocar a profundidade" é um link de 12px |
| 4 | Consistência e padrões | 3 | Componentes coerentes entre telas; botões desabilitados parecem secundários |
| 5 | Prevenção de erros | 3 | "Escolha até 2 opções" e validações em linha; botão "Interpretar" desabilitado sem dizer por quê |
| 6 | Reconhecer em vez de lembrar | 3 | Respostas anteriores resumidas acima da pergunta |
| 7 | Flexibilidade e eficiência | 2 | Uso recorrente (PRODUCT.md) sem atalhos de teclado para escolher respostas nem começar uma análise |
| 8 | Estética e minimalismo | 2 | Mínimo sem ser estético: hierarquia plana, telas vazias, nada que guie o olho |
| 9 | Recuperação de erros | 3 | Mensagens dizem o que fazer; falha do provedor não perde progresso |
| 10 | Ajuda e documentação | 2 | "Como o StackSync decide" só existe no menu da conta; nenhuma página explica o produto antes de pedir a chave |
| **Total** | | **27/40** | **Sólido na função, fraco na expressão** |

## Especificidade do design

**Avaliação:** intercambiável fora do resultado. Sem o nome StackSync, o painel, o enquadramento e a conexão da IA poderiam ser de qualquer CRUD administrativo: barra cinza de 48px, cartão branco de cantos de 8px, botão preto, opções com contorno de 1px. A especificidade do produto vive em três lugares, todos no resultado e todos pequenos demais para carregar a identidade: o diagrama de tolerância (linhas de 40px, hachura a 28% quase invisível), a régua do Índice de Ajuste (8px de altura) e a gramática de certeza (glifos de 12px).

**Testes do DESIGN.md:**

| Teste | Resultado |
| --- | --- |
| Teste de troca (trocar a Plex por Inter e o layout por um template) | **FAIL.** Nada mudaria na sensação do painel, do enquadramento e da conexão |
| Teste do nome removido | **FAIL** fora do resultado; PASS no resultado |
| Teste da assinatura (cinco lugares concretos) | PASS em quantidade (mapa, detalhe de eixo, relatório, régua, marcas de origem), FAIL em presença: em nenhum deles a assinatura é o que o olho encontra primeiro |
| Teste do ritmo (três telas seguidas mudam de composição?) | **FAIL.** Painel, enquadramento e conexão usam a mesma composição |
| Teste da vista desfocada | PASS no questionário; no resultado, tudo vira texto cinza do mesmo tamanho |
| Detector (`impeccable detect`) | Não rodou (ver Notas da execução) |

## O que funciona

1. **A verdade do produto está na tela.** "Não mudar nada é um resultado válido e frequente", "O resultado é apoio, não decisão" e a explicação do que vai para a IA são texto honesto, específico e sem marketing. Isso fica no redesign.
2. **As invariantes de produto estão cumpridas.** Nenhuma pista de veredito durante o questionário (IV-01), "Não sei" com o mesmo peso das sugestões (IV-02), nada pré-marcado (IV-19), conteúdo da IA rotulado e fora da folha oficial (IV-07). O axe não encontrou nenhuma violação em 11 rotas, e o refluxo em 390px funciona.
3. **A ideia da assinatura é boa.** Diagrama de tolerância com faixa, batente e lado do desvio, e a gramática de certeza (contínuo, tracejado, pontilhado, vazio) são do produto e de nenhum outro. Falta escala e cor, não conceito.

## Problemas prioritários

**[P1] Nenhuma porta de entrada antes do pedido de chave.**
- **Por quê:** o primeiro acesso redireciona para "Conectar a IA" e pede uma chave paga de API sem dizer o que o StackSync é. Para quem chega por recomendação (o sucesso que o PRODUCT.md descreve), é a pior primeira impressão possível: confiança pedida antes de ser ganha.
- **Correção:** página de entrada pública com o mecanismo demonstrado por componentes reais (diagrama, régua, cartão de pergunta), os três níveis, o anti-viés de mudança e o que a IA faz e não faz; a conexão vem depois de "Começar uma análise".
- **Comando sugerido:** `onboard`, depois `bolder` na página nova.

**[P1] Identidade ausente.**
- **Por quê:** reprova nos testes de troca e do nome removido. O produto não é memorável nem reconhecível, e o PRODUCT.md espera que o usuário volte a cada tarefa e recomende.
- **Correção:** fonte de títulos com ponto de vista, cor de marca, paleta viva para sobra e falta, tema claro e escuro, e uma marca gráfica tirada do mecanismo (a linha zero).
- **Comando sugerido:** `typeset`, `colorize`.

**[P1] Composição vazia nas telas de entrada.**
- **Por quê:** o painel vazio ocupa um quarto da altura da tela; o enquadramento e a conexão são cartões de 688px no meio de 1440px. O espaço não organiza nada, só sobra.
- **Correção:** composições em duas colunas a partir de 1280px (tarefa à esquerda, contexto vivo à direita: resumo do enquadramento, o que a IA faz e não faz, como o StackSync decide), faixas de cabeçalho com título grande e menos respiro morto acima e abaixo.
- **Comando sugerido:** `layout`.

**[P2] A assinatura está tímida.**
- **Por quê:** o único elemento que carregaria a identidade aparece como letra miúda. A hachura a 28% some no monitor, a régua tem 8px e as legendas têm 12px.
- **Correção:** régua do Índice de Ajuste com 40px na abertura do resultado, faixa em tamanho de título (nunca maior que a frase), hachura mais forte, sobra e falta mais saturadas.
- **Comando sugerido:** `bolder`.

**[P2] Resultado como parede de texto.**
- **Por quê:** a página do Equilibrado tem cerca de 5.000px a 1440px, com texto de 12 a 16px do mesmo cinza, sem índice da página. O raciocínio guiado repete a mesma estrutura seis vezes.
- **Correção:** títulos de seção fortes, um índice "Nesta página" no trilho, cabeçalho do laudo em faixa própria e blocos do raciocínio guiado recolhidos por padrão.
- **Comando sugerido:** `layout`, `distill`.

## Alertas por persona

- **Jordan, primeiro acesso (às vezes nem é arquiteto, nível Rápido):** chega por link, vê "Conectar a IA" com cinco provedores, um deles "Endpoint compatível com a API da OpenAI", e nenhuma explicação do produto. Tende a desistir na primeira tela.
- **Alex, uso recorrente (a cada tarefa, PRODUCT.md):** nenhum atalho para escolher respostas (1 a 4) ou abrir uma análise nova. O painel não oferece começar direto num nível.
- **Liderança que lê o relatório pelo link no celular:** a frase do veredito tem 24px, o mesmo tamanho dos títulos de seção, e a régua do índice é uma linha fina. Não há um resumo visual que funcione numa olhada.
- **Arquiteta desconfiada (perfil do PRODUCT.md):** bem atendida pelos textos de transparência, mas eles estão em 14px cinza no fim da tela de conexão, onde menos se lê.

## Observações menores

- O rótulo "Indefinido entre ajustado e subajustado" em 12px acima do título do veredito é um sobretítulo, que o próprio v0.2 proíbe.
- Botões desabilitados ("Próxima", "Continuar", "Interpretar") têm o mesmo contorno do secundário, só com texto mais claro.
- A marca é a palavra "StackSync" em 14px; não há símbolo.
- "Ver todas as opções (8)" parece texto, não controle.
- No provedor simulado, o raciocínio guiado repete "O motor avaliou o portão X com as respostas dadas" em todos os portões (artefato do simulador, não da interface).

## Auditoria técnica

| Dimensão | Resultado | Evidência |
| --- | --- | --- |
| Acessibilidade automática | PASS | `axe-*.json`: 0 violações em 11 rotas |
| Teclado e foco | PASS parcial | Foco visível em 2px nanquim; questionário com setas do RadioGroup; teclado manual e leitor de tela não foram refeitos nesta revisão |
| Contraste | PASS | Validação da paleta v0.1 no DESIGN.md; nenhum texto abaixo de 4,5:1 nas capturas |
| Tema | FAIL | Sem tema escuro nem `prefers-color-scheme` |
| Responsividade | PASS | Capturas em 390, 768, 1024, 1280 e 1440 sem rolagem horizontal; relatório em 320 |
| Desempenho | Não medido | Três arquivos de fonte (FD-09); Lighthouse não rodou |
| Antipadrões de geração "chamativa" | PASS | Nenhum gradiente, vidro, brilho ou métrica-herói |
| Antipadrões de geração "apagada" | FAIL | Monotonia, fonte única, ausência de cor, conteúdo estreito em tela larga |

## Gates afetados

| Gate | Resultado | Motivo |
| --- | --- | --- |
| DG-03 Hierarquia e densidade | FAIL (MAJOR) | Hierarquia plana e excesso de espaço sem função |
| DG-06 Sistema visual e identidade | FAIL (MAJOR) | Testes de troca, do nome removido e do ritmo reprovados |
| DG-08 Acessibilidade | PASS (automático) | axe sem violações |
| DG-07 Responsividade | PASS | Capturas nas cinco larguras |
| DG-12 Revisão independente | FAIL | Achados P1 abertos; exige redesign e nova revisão independente depois dele |

## Decisão

O responsável pelo produto avaliou a mesma interface como "extremamente simples, sem personalidade, parecendo um esboço" e pediu uma etapa de ação separada: uma interface moderna, sem os padrões de geração por IA, mas sem monotonia, com página de entrada, tipografia de títulos própria, pesos e tamanhos variados e paleta viva nos temas claro e escuro. Essa etapa reescreve o DESIGN.md (v1.0, registros DV-19 em diante) e é registrada à parte. Depois dela, o DG-12 precisa rodar de novo, numa sessão sem o contexto de quem fez o redesign.

## Etapa de ação (11/11/2026, depois da revisão)

Feita na mesma sessão, a pedido do responsável, e por isso **sem valor de revisão independente**: a v1.0 precisa da sua própria DG-12.

| Achado | O que mudou |
| --- | --- |
| P1 Sem porta de entrada | Página de entrada pública em `/` (T-00): título em display, a primeira pergunta do enquadramento como ação real, o mapa de ajuste do Exemplo B calculado pelo motor em escala de cartaz, as quatro etapas com fragmentos reais, a régua de tempo dos níveis, os dados dos pênaltis (Bar-Eli et al., 2007) e o que a IA faz e não faz. A conexão da IA vem depois e devolve o usuário à análise que ele ia começar |
| P1 Identidade ausente | DESIGN.md v1.0 "A Linha Zero": marca magenta na linha zero, sobra cobalto, falta laranja, faixa de cabeçalho em tinta profunda, símbolo do produto, Archivo variável nos títulos com Plex no texto, temas claro e escuro validados por script e por lint (FD-13, FD-14), raios maiores (DV-28) |
| P1 Composição vazia | Faixa de título em toda tela e duas colunas a partir de 1280px: painel com "Começar direto", enquadramento com resumo vivo e etapas numeradas, conexão da IA com o papel da IA ao lado |
| P2 Assinatura tímida | Linha zero em marca, barras e faixas maiores, zona de tolerância tingida, régua do Índice de Ajuste de 52px com a faixa em número acima |
| P2 Parede de texto | Seções com divisória, índice "Nesta página" no trilho, raciocínio guiado com a síntese primeiro e os blocos recolhidos |
| Heurística 7 | Teclas 1 a 9 escolhem a resposta, com selo igual em toda opção e em "Não sei" (DV-27) |
| Observação: sobretítulo no veredito | Removido; a categoria virou selo ao lado da confiança |

Verificação: `pnpm verificar` (lints, tipos e testes) e as jornadas do Playwright com axe nos dois temas; capturas em `evidencias/capturas/` (sufixo `-escuro` no tema escuro).

## Notas da execução

- **Alvo:** todas as rotas de `apps/web/src/rotas.tsx`; persistência em `.impeccable/critique/` não feita (exige o motor do Impeccable).
- **Lista de ignorados:** não existe `.impeccable/critique/ignore.md`.
- **Independência das avaliações:** degradada, numa só sessão; independente da sessão que construiu a interface.
- **Detector:** não rodou. O lançador `impeccable` baixa e executa um binário verificado por checksum na primeira chamada; a execução precisa de autorização do responsável.
- **Navegador:** app aberto em `localhost:5173` (servidor já em execução); sobreposição do detector não injetada.
