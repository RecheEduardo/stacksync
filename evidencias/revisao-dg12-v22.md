# Revisão independente de design (DG-12) da v2.2 "Concreto Aparente"

DEGRADED: feita numa sessão só, sem subagentes. O detector do Impeccable não rodou: ele baixa um executável na primeira execução, e isso não foi autorizado.

- **Data:** 11/11/2026.
- **Escopo:** a interface inteira na imagem Docker de 11/11/2026, 19:26 (sem mudança de código depois dela): página de entrada, conexão da IA, painel, enquadramento, questionário, "não sei", revisão, resultado (Rápido e Equilibrado), relatório e leitura pública por link. Também os esqueletos de carregamento, o movimento da página de entrada e a rolagem suave (Lenis).
- **Independência:** sessão sem o histórico de quem construiu o redesign. Nenhum código da aplicação foi alterado. As jornadas do Playwright não foram reexecutadas, para não sobrescrever `evidencias/capturas/`; o fluxo foi refeito com scripts próprios fora do repositório.
- **Método:** os doze critérios do DG-14, as invariantes IV-21 e IV-23, as regras de "Camadas de fundo", "Projeção", "Esqueletos de carregamento" e Motion, os registros DV-42 a DV-53, os testes de identidade e de monotonia do DESIGN.md e os critérios de revisão visual de `ai-ui-slop-research.md` (seção 6). Cada achado veio de uma captura e, quando possível, de uma medida no DOM.
- **Ambiente:** `docker compose up` em http://localhost:8080, Edge pelo Playwright, provedor "Simulado". As capturas foram tiradas com e sem "reduzir movimento", nas larguras 1440, 1280, 1024, 768 e 390 (a leitura pública também a 320).
- **Evidência:** as capturas, as medidas em JSON e os scripts estão fora do repositório, na pasta de notas desta sessão (`side-session-notes/local_c1082f31-…/revisao-dg12-v22/`, com as subpastas `capturas/`, `medidas/` e `scripts/`). As capturas do construtor em `evidencias/capturas/` (19:27) também foram lidas.

## Veredito

**FAIL: 1 BLOCKER, 3 MAJOR e 13 MINOR.**

A v2.2 resolve tudo o que a revisão da v0.2 apontou: há página de entrada, identidade própria, telas preenchidas e uma assinatura que aparece. Ela também passa nas regras de produto que pedi para olhar com atenção: o vermelho não codifica o veredito (IV-21), nenhum número do veredito anima (IV-23), o contraste é bom no tema claro e no cartaz invertido, os esqueletos são bons e o Lenis funciona e desliga com "reduzir movimento".

O gate reprova por três motivos:

1. **BLOCKER na página de entrada.** Os blocos figurativos do fundo são fixos. Por isso, todo texto posto direto sobre o concreto passa por cima deles durante a rolagem: preto sobre zebrado, preto sobre o bloco preto. No celular, o zebrado fixo cobre 44% da largura. Esta é a resposta à pergunta "as camadas atrapalham a leitura?": **sim, na página de entrada**. Nas telas internas, não.
2. **MAJOR na energia das telas internas.** O questionário carrega a energia da página de entrada. O painel, o enquadramento e a conexão ficam no meio do caminho. A revisão e o resultado continuam "certinhos": uma folha branca de documento. Painel, enquadramento e conexão ainda têm a mesma composição sobre o mesmo fundo.
3. **MAJOR em controles honestos (critério 8).** Os links de texto da revisão, do resultado e do painel só ganham sublinhado no hover. No celular, onde não há hover, eles parecem texto.

## Resposta direta aos pontos pedidos

| Ponto | Resposta | Achados |
| --- | --- | --- |
| A página de entrada é a referência de energia; as telas internas a carregam? | Só em parte. O questionário carrega (pergunta de 48px, faixa de obra, "Por que perguntamos isso" com projeção, textura do âmbito, rótulo vermelho). Painel, enquadramento e conexão ficam no meio: título de 64px, projeções e blocos espiando, mas tudo alinhado na mesma margem e com a mesma composição. Revisão e resultado são folhas de documento: a revisão não tem a faixa de obra que a T-08 pede, e o dado principal dela está em letra de 14px | M1, M3 |
| As camadas de fundo atrapalham a leitura do texto? | Na entrada, sim, e muito (BLOCKER). No aplicativo, só as cruzes e os eixos atravessam o subtítulo da faixa de página (MINOR) | B1, m2 |
| Cabeçalho: análise à esquerda, logo no centro, botões brancos com projeção zebrada branca | PASS. A análise aparece em Courier e é truncada com reticências a 390px. A assinatura fica no centro (só o símbolo abaixo de 768px). "CONTA" é papel com projeção zebrada branca, e o conjunto ocupa de 10 a 65px numa faixa de 80px, centrado. Ao apertar, o botão desce para dentro da projeção. O que sobra é deriva de documentação: o DESIGN.md ainda descreve o símbolo antigo | m13 |
| Esqueletos de carregamento | PASS. As fôrmas seguem a forma de cada tela: pergunta com a coluna do porquê e da textura, laudo com metadados, frase, régua e seções, trilho, tabela, formulário e cartaz. Aparecem depois de 300ms, com `role="status"` e `aria-busy`. A faixa anda e para com "reduzir movimento", e fica parada na folha do laudo. A exceção é a faixa do esqueleto do trilho, que anda nas rotas de resultado e de relatório (contra a DV-52) | m3 |
| IV-21: o vermelho nunca codifica veredito | PASS. Medi a cor da marca (#D9200F e #FF4433) em cor, fundo, contorno, `fill` e `stroke` de todo elemento visível do conteúdo do resultado, do relatório e da leitura pública, nas cinco larguras: zero ocorrências. A projeção do índice é madeira, e o selo da categoria é tinta. Fora do veredito, o vermelho troca de sentido na régua dos níveis | m8 |
| IV-23/FD-16: o veredito não anima | PASS. Sem "reduzir movimento", a única animação no resultado é a faixa do esqueleto do trilho durante a carga. No relatório há um `surge` de 150ms (opacidade) no bloco da IA, previsto em Motion ("bloco da IA que chega"). Nenhum número anima | m3, m13 |
| Contraste no tema claro e no cartaz invertido | PASS. Medi a razão de contraste de todo texto visível contra o fundo efetivo, em 11 telas e 5 larguras. Nada ficou abaixo de 4,5:1, nem de 3:1 em texto grande, fora os rótulos de botões desabilitados (3,38:1, isentos pela WCAG 1.4.3). O cartaz invertido não teve nenhum texto abaixo do limite. O axe do construtor registra 0 violações em 12 rotas. Nenhuma dessas medidas vê o problema B1: o bloco fixo não é ancestral do texto, então o axe e a minha medida de contraste não o enxergam. Ele só foi encontrado pela medida de cruzamento durante a rolagem | B1 |

## DG-14: os doze critérios

| # | Critério | Entrada (BLOCKER) | Questionário (BLOCKER) | Demais telas (MAJOR) | Evidência |
| --- | --- | --- | --- | --- | --- |
| 1 | Raio zero | PASS | PASS | PASS | Base CSS com `border-radius: 0` em tudo, lint FD-15, conferência de raio nas jornadas, capturas |
| 2 | Estrutura aparente | PASS | PASS | PASS, com uma ressalva: o cabeçalho do laudo não tem as réguas entre colunas que a seção Components pede (m12) | Capturas |
| 3 | Escala grotesca com propósito, um foco | PASS | PASS (pergunta de 48px) | PASS. O foco do resultado é a frase do veredito, mas os títulos de seção em caixa-alta 900 e as sanfonas competem na vista desfocada | Capturas 1440 |
| 4 | Preenchimento | PASS | PASS | PASS | Capturas 1440 |
| 5 | Sombra que aperta | PASS | PASS | PASS. Nenhum bloco estático com sombra dura em 11 telas e 5 larguras, fora painéis flutuantes | Medida no DOM |
| 6 | Paleta contida | PASS, com o vermelho em dois sentidos na régua dos níveis (m8) | PASS | PASS, com a barra vermelha em "O que a IA não faz" (m8) | Capturas e código |
| 7 | Leitura protegida | **FAIL**: texto sobre os blocos fixos (B1). Ressalvas MINOR: "O QUE A IA NÃO FAZ" tem 6 palavras (m1) e há frases em Courier (m7) | PASS, com ressalva MINOR: "ALIMENTA UM FATOR DE PESO 5" é um rótulo de 6 palavras (m1) | PASS, com ressalvas MINOR em caixa-alta (m1) e nas cruzes do fundo (m2) | Medida de cruzamento, capturas |
| 8 | Controles honestos | PASS | PASS ("Ver todas as opções" agora é sublinhado) | **FAIL**: links só sublinhados no hover (M2) | Medida no DOM e código |
| 9 | Conteúdo real | PASS (exemplos rotulados como ilustrativos) | PASS, com o texto de atalho sem ponto (m5) | PASS | Capturas |
| 10 | Movimento útil | PASS, com o momento autoral mais longo que a regra (m9) | PASS | PASS, com a faixa do trilho andando no resultado (m3) | Medida de animações |
| 11 | Foco à vista | PASS no CSS: 3px vermelho afastado 3px; o vermelho tem 3,9:1 sobre o cabeçalho preto e 3,85:1 sobre o concreto | PASS | PASS | CSS. O percurso inteiro por teclado não foi refeito |
| 12 | Textura do domínio | PASS | PASS (textura do âmbito) | PASS, com o zebrado de obra no fundo do resultado e do relatório (m3) | Capturas e medidas |

**Resultado do gate:** DG-14 FAIL na entrada (critério 7, BLOCKER) e nas demais telas (critério 8, MAJOR). No questionário, PASS.

## Achados

Gravidade conforme `ai-ui-slop-research.md` (seção 6) e a coluna "Severidade" do DG-14.

### B1. BLOCKER: os blocos figurativos fixos passam por baixo do texto da página de entrada

- **Tela e largura:** T-00, em todas as larguras. O pior caso é 390 e 768.
- **O que se vê:** os quatro blocos da variante `entrada` de `CamadasFundo` (`components/ui/fundo.tsx`) ficam em `position: fixed`, mas o texto rola. A 1440 eles ocupam estas regiões da janela:

  | Bloco | Largura (px) | Altura (px) |
  | --- | --- | --- |
  | Amarelo | 1224 a 1504 | 126 a 346 |
  | Zebrado | −90 a 170 | 522 a 702 |
  | Madeira | 881 a 1181 | 820 a 970 |
  | Tinta | 432 a 552 | −60 a 60 |

  Medi os textos que ficam direto sobre o concreto e passam por algum desses blocos em algum ponto da rolagem: 25 a 1440, 28 a 1280, 29 a 1024 e 30 a 768 e a 390. Entre eles: "QUATRO ETAPAS", "Do enquadramento a uma conclusão que você consegue defender.", "TRÊS PROFUNDIDADES", "Dá para começar rápido…", "IA CONDUZ, MODELO DECIDE.", "Mesmas respostas, mesmo resultado…", "Fragmentos ilustrativos da interface" e "Você conecta a sua própria chave…".
- **Capturas (pasta de notas):**
  - `entrada-quatro-390.png`: o zebrado cobre de 0 a 170px de 390 e apaga metade de "ETAPAS" e quase todo o subtítulo.
  - `entrada-quatro-1440.png`: "Do en…" desaparece no zebrado.
  - `entrada-ia-1440.png`: o bloco preto do topo engole o "T" de "ANTES DE", preto sobre preto.
  - `entrada-390.png`: a projeção zebrada do texto de apoio encosta no bloco zebrado fixo e forma uma zebra dupla, sem borda entre as duas.
- **Por quê:** a Regra do Bloco Encaixado e a DV-45 dizem "nada sobreposto cobre texto, controle ou dado". O efeito aqui é o mesmo, só que o bloco está atrás em vez de na frente. O critério 7 do DG-14 é BLOCKER na página de entrada, e o contraste cai para perto de 1:1 nas listras pretas (WCAG 1.4.3). O axe não pega o problema porque o bloco não é ancestral do texto.
- **Correção sugerida, em ordem de preferência:**
  1. Na página de entrada, tirar os blocos figurativos da camada fixa. Eles passam a `absolute` dentro de cada seção, rolam com o conteúdo e ficam nas margens ou atrás de blocos de conteúdo, nunca sob texto posto no concreto. Na camada fixa ficam só a textura da forma, os eixos e as cruzes.
  2. Abaixo de 1024px, reduzir esses blocos a fatias de no máximo 48px que espiam na borda, ou escondê-los.
  3. Tirar o bloco de tinta do topo, porque ele atravessa a coluna do título.
  4. Como rede de segurança, todo texto posto direto no concreto (títulos e subtítulos de seção, notas) ganha uma faixa opaca do próprio concreto (`bg-mesa` com `px-compacto`). A cor é a mesma; a diferença é que nada passa por baixo.
  5. Afastar a projeção zebrada do texto de apoio do bloco zebrado, ou trocar a cor de um deles.
- **Guarda contra regressão:** levar a medida de cruzamento usada aqui (`scripts/medir.mjs`, função `medir`, campo `cruzam`) para as jornadas, como uma verificação da "Leitura protegida".

### M1. MAJOR: as telas internas ainda estão "certinhas" e repetem a mesma composição (DG-03, DG-06, teste do ritmo)

- **Telas e largura:** painel, enquadramento, conexão, revisão e resultado, em 1440 e 1280.
- **O que se vê, tela a tela:**

  | Tela | Energia em relação à entrada | Observação |
  | --- | --- | --- |
  | Questionário | Carrega | Pergunta grande, faixa de obra no cartão, bloco do porquê com projeção à direita, textura do âmbito terminando com os botões, rótulo vermelho na base. É a referência interna |
  | Enquadramento | Média | Bom resumo "SEU ENQUADRAMENTO" com faixa de tinta e projeção. O indicador de etapas usa "01" a "04" em Courier de 12px, quando a entrada usa números gigantes em vermelho para a mesma ideia de etapa |
  | Painel | Média | O maior elemento é "ANÁLISES" a 64px. Tabela correta, mas plana. "Começar direto" é bom |
  | Conexão da IA | Média | Mesma composição do enquadramento: título, bloco branco à esquerda, bloco com projeção zebrada à direita |
  | Revisão | Baixa | Folha branca com título e três seções de texto. Sem faixa de obra (ver M3) |
  | Resultado | Baixa, em parte de propósito | A folha do laudo precisa ser calma (IV-23, Regra da Folha Curta), mas hoje é uma coluna de texto com títulos em caixa-alta. A grade do cabeçalho não tem as réguas entre colunas pedidas na seção Components |

  O fundo também se repete: os três blocos da variante `app` (zebrado embaixo à esquerda, madeira à direita a 38% da altura, concreto escuro embaixo) aparecem iguais e no mesmo lugar em todas as telas internas. Viram papel de parede. Painel, enquadramento e conexão reprovam no teste do ritmo: três telas seguidas com a mesma composição sobre o mesmo fundo.
- **Por quê:** o responsável quer a interface viva, "nada certinho demais", com a página de entrada como referência. O próprio DESIGN.md já permite boa parte do que falta: o vermelho em números de etapa (Colors > Primary), números que vazam do bloco (DV-48), projeções chapadas de direção variada nos estados vazios (DV-44) e sobreposições livres (DV-45). Hoje esses recursos só aparecem na entrada.
- **Correção sugerida, tela a tela, sem tocar nas invariantes:**
  - **Enquadramento:** o número da etapa atual em display vermelho ("02"), apoiado no topo do cartão e entrando 12px nele, como os números das etapas da entrada. Os quatro blocos de etapa continuam como índice.
  - **Painel:** "ANÁLISES" em display (uma palavra, cabe), vazando a grade como "MUDAR.". O selo "EM PREENCHIMENTO" com a faixa de obra, porque análise em preenchimento está, literalmente, em obra.
  - **Revisão:** ver M3.
  - **Resultado:** a energia vem da estrutura, nunca de movimento nem de cor de marca. Três passos:
    - o cabeçalho do laudo numa faixa de tinta, como o "SEU ENQUADRAMENTO", com as réguas verticais entre as cinco colunas;
    - régua grossa de 6px entre as seções principais;
    - o mapa de ajuste em escala de cartaz (linhas de 60px, barras de 22px), sobre papel. Este último muda medidas registradas e pede uma DV.
  - **Camadas:** uma composição de blocos figurativos por rota, em vez de uma só variante `app`. As telas em obra (enquadramento, questionário, revisão) podem ter zebrado. O resultado e o relatório ficam só com madeira e concreto escuro (ver m3). Isso também resolve o teste do ritmo.

### M2. MAJOR: links de texto sem sublinhado em repouso (critério 8, "Controles honestos")

- **Telas e larguras:** revisão, resultado e painel, em todas as larguras. No celular é pior, porque não há hover.
- **O que se vê:** "Voltar às perguntas" e "Rever a resposta" na revisão; "Voltar às perguntas" e "Rever a resposta" / "Responder" em "Perguntas que decidiriam" no resultado; o nome de cada análise no painel. Todos são `Link` com `hover:underline`, sem sublinhado, contorno, fundo ou sombra em repouso. Medi os controles visíveis sem nenhum desses sinais: 3 na revisão, 5 no resultado Rápido e 4 no painel.
- **Onde no código:** `features/resultado/resultado.tsx:202`, `features/resultado/veredito.tsx:114`, `features/revisao/revisao.tsx:240, 256, 276, 303`, `features/painel/painel.tsx:107, 143` e `features/metodo/metodo.tsx:174`.
- **Por quê:** o critério 8 diz "links sublinhados" (Copeland), e o botão discreto do DESIGN.md é "sublinhado grosso (2px, afastado 4px)". O componente `Botao` com `variante="discreto"` já faz isso, mas essas telas não o usam.
- **Correção sugerida:** `Botao variante="discreto" comoFilho` nas ações. Nos nomes da tabela, `underline decoration-2 underline-offset-4` permanente.

### M3. MAJOR: a revisão perdeu a faixa de obra e esconde o dado principal (T-08, DG-03)

- **Tela e largura:** revisão (T-08), em todas as larguras.
- **O que se vê:**
  - A T-08 pede "título, faixa de obra, GERAR VEREDITO". A faixa não existe: `features/revisao/revisao.tsx` não usa `zebrado`, e a captura `revisao-1440.png` confirma.
  - A composição das respostas (medidas, estimadas, inferidas, desconhecidas) é o que a pessoa precisa conferir antes de gerar o veredito, e aparece numa legenda de 14px com glifos de 12px. O título "COMPOSIÇÃO DAS RESPOSTAS" é maior que o dado.
- **Por quê:** a revisão é a última tela "em obra" antes do veredito. É o lugar certo para o zebrado e para uma composição forte, e hoje é a tela mais plana do fluxo.
- **Correção sugerida:**
  - a faixa de obra no topo da folha, como no cartão da pergunta;
  - a composição como uma régua de largura total, dividida na proporção de cada tipo de resposta, cada trecho com o traço da gramática de certeza (contínuo, tracejado, pontilhado, vazio) e o percentual em `numero`. É textura do domínio e não antecipa veredito (a composição já aparece no laudo);
  - "Podem mudar o resultado" em blocos com contorno, cada pergunta com o seu botão discreto.

### MINOR

| ID | Tela e largura | O que se vê | Correção sugerida |
| --- | --- | --- | --- |
| m1 | Entrada e conexão: "O QUE A IA NÃO FAZ" (6 palavras). Questionário: "ALIMENTA UM FATOR DE PESO 5" (6). Resultado: "RACIOCÍNIO POR PORTÃO E POR EIXO" (6). Painel abaixo de 1024px: o nome de cada análise em `text-acao` (caixa-alta) | A Regra da Caixa-Alta Curta permite até cinco palavras. O nome da análise é conteúdo do usuário, sem limite de tamanho, e no desktop ele aparece em caixa normal (`text-subtitulo`). São rótulos, não frases; numa leitura literal, o do questionário seria BLOCKER | "A IA NÃO FAZ", "PESO 5" (o selo já diz o que alimenta), "RACIOCÍNIO POR PONTO". No painel do celular, `text-subtitulo`, como no desktop (`painel.tsx:143`) |
| m2 | Painel, enquadramento e conexão, em todas as larguras, pior a 390 | As cruzes das interseções são traços sólidos de 2px em grafite claro (#555), muito mais fortes que os eixos (16%). Ao rolar, elas passam sobre o subtítulo da faixa de página (`enq4-1440.png`: cruzes sobre "Não", "válido" e "propõe"). A 390, as seis colunas põem uma cruz a cada 65px | Cruzes em `--cor-traco`, como os eixos; menos colunas abaixo de 768px (A a C); ou a mesma faixa opaca de concreto de B1 atrás do texto da faixa de página |
| m3 | Resultado e relatório | O bloco figurativo zebrado da variante `app` fica atrás do resultado e do relatório (visível a 768 e 390, onde não há trilho). O esqueleto do trilho anda nessas rotas (animação `obra-andar` registrada na carga do resultado a 1440) | "Faixa de obra: nunca em resultado, relatório nem bloco de IA", e a DV-52 manda a faixa ficar parada no resultado. Usar uma variante de fundo sem zebrado nessas rotas, e `parado` no `EsqueletoTrilho` e na `FaixaCarregando` de `features/casca/analise.tsx` (linhas 169 e 217) quando a rota for de resultado ou de relatório. Estender o lint de esqueletos a `features/casca` |
| m4 | Enquadramento ("CONTINUAR"), questionário ("INTERPRETAR", "PRÓXIMA"), em todas as larguras | Desabilitados sem o motivo ao lado, que a seção Buttons exige. A revisão anterior já tinha apontado o "Interpretar". O texto em inativo tem 3,38:1, isento pela WCAG, mas o motivo falta | Uma legenda ao lado: "Escolha uma opção para continuar", "Escreva a resposta para interpretar" |
| m5 | Questionário, em todas as larguras | "Respostas comuns para o perfil das suas respostas As teclas numéricas escolhem…": falta o ponto, porque `cartao.tsx:246` junta `ui.pergunta.sugeridas` e `ui.pergunta.atalhos` com um espaço. A dica do teclado aparece também no toque (390) | Pôr o ponto no texto do pacote de conteúdo. Mostrar a dica de atalho só com ponteiro fino (`pointer: fine`) |
| m6 | "Não sei", 1440 | Com a página rolada até a pergunta (scrollY 185, o próprio app rola), o painel abre com o topo a −73px. O título e as estimativas ficam atrás do cabeçalho. O painel tem 1034px de altura e não é fixo (`naosei-aberto.png`, `r-naosei-1440.png`) | `fixo-ao-rolar` com altura limitada e rolagem interna, ou rolar até o título do painel e dar foco a ele ao abrir |
| m7 | Entrada | Frases inteiras em Courier: `entrada.tempo` ("A análise rápida leva cerca de 7 minutos…"), `entrada.ia.chave`, `entrada.como.amostra.rotulo` e `entrada.rodape.ilustrativo` | A Regra da Datilografia Honesta proíbe Courier em parágrafo, e a tabela do brutalismo gerado lista a monoespaçada como fantasia. Passar essas frases para `legenda` ou `compacto` e deixar Courier só no número ("7 min") e na citação |
| m8 | Painel, enquadramento e entrada (régua dos níveis); conexão ("O que a IA não faz"), 1440 | Na régua dos níveis, o trecho vermelho quer dizer "recomendado" no painel e na entrada, mas "escolhido" no enquadramento (`destaque={profundidade === p}`). Em "O que a IA não faz" há uma barra vertical vermelha de 4px, e "borda lateral colorida" está na lista de padrões de IA do próprio DESIGN.md | Um sentido só para o vermelho na régua (recomendado, se for o caso); a escolha já é o bloco amarelo. Mesma barra em tinta nos dois rótulos da conexão, ou a régua grossa vermelha entre os blocos, como na entrada |
| m9 | Entrada, sem "reduzir movimento" | As letras de "MUDAR." começam a cair depois de cerca de 400ms e só assentam perto de 1,4s depois da carga (a 1400ms ainda estavam a −1,9px). O critério 10 diz até 900ms; a seção Motion diz até 1200ms. A fita escura andou cerca de 1.980px na horizontal para 500px de rolagem (cerca de 4:1), rápido demais para ler as frases | Encurtar o atraso e o intervalo entre letras para fechar em até 900ms e acertar o número no DESIGN.md. Reduzir o percurso das fitas para cerca de 1:1 (por exemplo, de 0 a −10%) |
| m10 | Painel, 1440 | A coluna "OBRIGAÇÃO MAIS PRÓXIMA" fica vazia em todas as linhas. O gatilho "…" de ações (52×52) é o único controle do app sem contorno | Esconder a coluna quando nenhuma linha tem valor. Gatilho com `borda-fina` e `aperta` |
| m11 | Resultado e relatório, 390 | Os cinco metadados do cabeçalho do laudo empilham em cerca de 380px, e a frase do veredito só começa perto do fim da primeira tela (y≈640 de 844). Isso pesa para a liderança que abre o link no celular | Grade de duas colunas para os metadados abaixo de 768px |
| m12 | Resultado | O selo da categoria ("AJUSTADO") é um bloco preto de 48px (altura de botão), sem ação. Ao lado dele, o botão real de confiança (dica) parece um selo de 2px. Além disso, a grade do cabeçalho do laudo não tem réguas entre colunas (`laudo.tsx:35`), embora a seção Components peça "cinco colunas separadas por réguas" | Selo de categoria na altura de um selo, com `borda-fina`. O gatilho de confiança com sublinhado ou glifo de dica. Réguas de 2px entre as colunas a partir de `xl` |
| m13 | DESIGN.md e código | O DESIGN.md (Shapes) ainda descreve o símbolo como "quadrado preto com duas barras brancas", mas o implementado é a placa amarela com barras pretas e barra vermelha. O critério 10 diz 900ms e a seção Motion diz 1200ms. "Faixa de obra: nunca em resultado" conflita com a DV-52 (faixa parada no laudo). O `surge` do bloco da IA e do detalhe do eixo (CSS em `components/laudo`) não é coberto pelo FD-16, que só olha o `motion`. O comentário de `app.css` ainda fala em "dois temas" (DV-22) | Registrar uma DV de limpeza: símbolo, uma duração só, a exceção do esqueleto parado escrita na regra da faixa e o `surge` de opacidade declarado permitido (ou proibido) na folha |

## Testes de identidade e de monotonia

| Teste | Resultado |
| --- | --- |
| Teste de troca (Archivo 125% → Arial Black; paleta → kit neobrutalista) | PASS. Concreto com forma, eixos de planta, vermelho MASP só em identidade e zebrado com sentido não saem de um kit |
| Teste do nome removido | PASS. O diagrama de tolerância, a gramática de certeza, o zebrado de obra e os eixos A a F dizem "instrumento de ajuste" |
| Teste da assinatura (cinco lugares) | PASS: cartaz do mapa na entrada, mapa no resultado, régua do Índice de Ajuste, gramática de certeza na composição e sombra que aperta nas opções |
| Teste do ritmo | FAIL em painel, enquadramento e conexão (M1) |
| Teste da vista desfocada | PASS na entrada e no questionário. No resultado, a frase do veredito vence, mas por pouco contra os títulos de seção e as sanfonas em caixa-alta 900 |
| Teste do acessório | As cruzes sólidas (m2) e o bloco zebrado fixo da entrada (B1) não fariam falta; os eixos tracejados e a textura da forma, sim |
| Tabela do "brutalismo gerado" | PASS: sem pastel, adesivo, emoji, letreiro automático, sombra em bloco estático nem lorem ipsum. Ressalva m7 (Courier em frase) |
| Lista de padrões de IA do DESIGN.md | PASS, com a ressalva m8 (borda lateral vermelha) |

## Comparação com a revisão anterior (v0.2)

| Achado da v0.2 | Situação na v2.2 |
| --- | --- |
| P1 Nenhuma porta de entrada antes do pedido de chave | Resolvido: T-00 pública, com a conexão depois |
| P1 Identidade ausente | Resolvido (testes de troca e do nome removido passam) |
| P1 Composição vazia | Resolvido. O preenchimento passou do ponto na entrada (B1) |
| P2 Assinatura tímida | Resolvido: mapa em cartaz, régua de 56px, barras com contorno |
| P2 Resultado como parede de texto | Em parte: há "Nesta página" e sanfonas, mas a folha continua plana (M1) |
| Heurística 7 (atalhos) | Resolvido: teclas 1 a 9 com selo |
| Botões desabilitados sem motivo | **Continua** (m4) |
| "Ver todas as opções" parece texto | Resolvido (sublinhado) |
| Teste do ritmo | **Continua reprovando**, agora entre painel, enquadramento e conexão (M1) |

## O que funciona

1. **A página de entrada tem a energia pedida sem cair no kit.** A escala exagerada, "MUDAR." vazando, os números de etapa gigantes e as fitas com frases reais andando só com a rolagem fazem dela um cartaz, e cada peça tem motivo (DV-47, DV-48).
2. **O questionário é a melhor tela do produto.** É o lugar onde a regra "a forma grita, o texto fica calmo" aparece inteira. "Não sei" é idêntico às sugestões (IV-02), e nada vem marcado (IV-19).
3. **A sombra que aperta é disciplinada:** nenhum bloco estático com sombra dura em 55 combinações de tela e largura. A projeção zebrada ou de madeira separa bem o que é estrutura do que é clique.
4. **Os esqueletos são da marca, não de kit:** fôrmas de concreto do tamanho certo, sem brilho deslizante, com a faixa de obra como único movimento.
5. **As invariantes do veredito resistem ao estilo:** sem vermelho, sem animação, e o selo da categoria em tinta.
6. **Movimento e acessibilidade:** com "reduzir movimento", não sobra nenhuma animação, o Lenis desliga (a roda pula direto) e as fitas param. Sem a preferência, o Lenis distribui 600px de roda em cerca de 550ms.
7. **Nada transborda na horizontal** nas cinco larguras, nem a leitura pública a 320px.

## Gates afetados

| Gate | Resultado | Motivo |
| --- | --- | --- |
| DG-14 Brutalismo | **FAIL** (BLOCKER na entrada; MAJOR nas demais) | B1 (critério 7) e M2 (critério 8) |
| DG-03 Hierarquia e densidade | FAIL (MAJOR) | M1 e M3 |
| DG-06 Identidade | PASS nos testes de troca, do nome e da assinatura; FAIL no teste do ritmo (MAJOR) | M1 |
| DG-08 Acessibilidade | PASS automático (axe 0, contraste medido), com B1 como falha de contraste que a automação não vê | B1 |
| DG-07 Responsividade | PASS | Sem rolagem horizontal nas cinco larguras e a 320 |
| DG-05 Estados (carregamento) | PASS | Esqueletos em todas as rotas que esperam resposta; m3 é de forma, não de ausência |
| DG-12 Revisão independente | **FAIL** | B1, M1, M2 e M3 abertos; nova DG-12 depois das correções |

## Notas da execução

- **Contêiner:** caiu durante a revisão (o responsável o derrubou sem querer) e foi religado com `docker compose up -d` a pedido dele. O volume foi mantido: as análises e o link de leitura criados para a revisão continuaram válidos.
- **Dados criados no Docker para a revisão:** três análises ilustrativas no espaço anônimo do navegador de teste ("Portal de Convênios", "Plataforma de Agendamento" e "Sistema de Matrículas", todas "(ilustrativo)") e um link de leitura. O banco de desenvolvimento em `.data/` não foi tocado.
- **Não feito:** percurso completo por teclado, leitor de tela, Lighthouse (DG-11), impressão (DG-13; vale a captura do construtor) e o detector do Impeccable.
- **Medidas automáticas:** um script percorre o DOM e mede quatro coisas. Elas apoiam o julgamento, não o substituem.
  - contraste de todo texto visível contra o fundo efetivo;
  - texto sobre fundo transparente que cruza um bloco fixo em algum ponto da rolagem;
  - sombra dura em elemento não clicável;
  - caixa-alta acima de cinco palavras, cor da marca, animações em curso e controles sem sinal de controle.

  Dois falsos positivos foram descartados: o texto `sr-only` do selo de confiança (contado como caixa-alta longa) e a linha do mapa (um botão de sanfona, que tem chevron).
