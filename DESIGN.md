---
name: StackSync
description: Laudo de ajuste arquitetural, com faixa de incerteza, trilha rastreável e o ônus da prova na mudança.
colors:
  mesa: "#EDF1F4"
  folha: "#FCFEFF"
  campo: "#F3F6F9"
  realce: "#E4EBF0"
  nanquim: "#182029"
  nanquim-hover: "#2A343E"
  grafite: "#464E57"
  grafite-claro: "#60676F"
  traco-controle: "#81878D"
  inativo: "#9B9FA3"
  sobra: "#4677AD"
  sobra-veu: "#DEEBFA"
  falta: "#AC7236"
  falta-veu: "#F8E6D7"
  saudavel: "#357A47"
  atencao: "#BE9100"
  critico: "#A92321"
typography:
  titulo-pagina:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
  secao:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  pergunta:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: "27px"
  corpo:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  compacto:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  dado:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
    fontFeature: "'tnum' 1"
  acao:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  rotulo:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "18px"
  legenda:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  reto: "0px"
  controle: "4px"
  folha: "8px"
spacing:
  micro: "4px"
  compacto: "8px"
  curto: "12px"
  base: "16px"
  medio: "24px"
  amplo: "32px"
  secao: "48px"
  maior: "64px"
components:
  botao-primario:
    backgroundColor: "{colors.nanquim}"
    textColor: "{colors.folha}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "36px"
    padding: "0 16px"
  botao-primario-hover:
    backgroundColor: "{colors.nanquim-hover}"
  botao-secundario:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "36px"
    padding: "0 16px"
  botao-discreto:
    backgroundColor: "transparent"
    textColor: "{colors.nanquim}"
    typography: "{typography.acao}"
    rounded: "{rounded.controle}"
    height: "36px"
    padding: "0 8px"
  campo:
    backgroundColor: "{colors.campo}"
    textColor: "{colors.nanquim}"
    typography: "{typography.corpo}"
    rounded: "{rounded.controle}"
    height: "40px"
    padding: "0 12px"
  opcao-resposta:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    typography: "{typography.corpo}"
    rounded: "{rounded.controle}"
    height: "44px"
    padding: "0 16px"
  opcao-resposta-selecionada:
    backgroundColor: "{colors.realce}"
    textColor: "{colors.nanquim}"
  folha-laudo:
    backgroundColor: "{colors.folha}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.folha}"
    padding: "40px 48px"
  anotacao-ia:
    backgroundColor: "{colors.mesa}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.folha}"
    padding: "24px"
  linha-tabela:
    typography: "{typography.compacto}"
    height: "40px"
    padding: "0 12px"
---

<!-- STATUS: v0.2, decidido antes da implementação (7 a 10/11/2026), a partir do PRODUCT.md, das Partes 1 a 4 e da pesquisa ai-ui-slop-research.md. A v0.2 alinhou o arquivo à entrevista de produto (DV-15 a DV-18). Os tokens acima são normativos e já passaram na validação de contraste e de daltonismo (seção "Registro de decisões visuais"). Depois das primeiras telas da F2a, rodar `/impeccable document` em modo de mesclagem para reconciliar com o código real; em conflito, este arquivo vence até que um registro DV o altere. -->

# Design System: StackSync

## Overview

**Creative North Star: "O Laudo Aferido"**

O StackSync mede uma arquitetura contra uma tolerância e devolve um laudo: necessidade contra capacidade, desvio, faixa de incerteza, versão da calibração, assinatura de quem respondeu. A interface pega emprestado o mundo da metrologia e do desenho técnico de tolerâncias (o sistema de ajustes da ISO 286, em que "ajuste com folga" e "ajuste com interferência" são desenhados como zonas em torno de uma linha zero). Desse mundo vêm só quatro coisas: a tipografia de documento técnico, a paleta de papel, grafite e nanquim, a densidade de laudo e uma assinatura, o **diagrama de tolerância**. A navegação, os controles e a organização das telas continuam sendo os de um produto web comum, que o arquiteto já sabe usar.

O tom é calmo, exato e honesto sobre o que não sabe. Nada pisca, nada comemora, nada empurra para a mudança. A tela de "Ajustado" é a mais curta do produto, e isso é o design funcionando: a Parte 3 manda que "não fazer nada" seja um resultado de primeira classe (PR-03), e uma interface que enche a tela de sugestões contradiz o produto que vende.

**O método do produto aplicado ao próprio design.** Uma tela tem uma *necessidade* (a tarefa do arquiteto, os estados, as regras) e uma *capacidade expressiva* (cor, tipo, movimento, ornamento). **Sobreajuste visual** é expressão além da necessidade: gradientes, vidro, contadores animados, métricas-herói, efeitos. É o "design esdrúxulo" que denuncia a geração por IA. **Subajuste visual** é expressão aquém: tela genérica, hierarquia plana, monotonia, fonte padrão, estados faltando. É o "template" que também denuncia a geração por IA. Como na RN-72, os dois **não se compensam**: um efeito vistoso não paga uma hierarquia ausente, e uma tela sóbria não está certa só por ser sóbria. A zona de tolerância é o vocabulário conhecido de produto: controles padrão, estrutura clara, uma assinatura bem colocada.

### Como usar este arquivo

Os títulos das oito seções canônicas (Overview a Do's and Don'ts) seguem o formato DESIGN.md em inglês para que o Impeccable e outras ferramentas o leiam. O restante está em pt-BR. Ninguém precisa ler tudo para toda tarefa:

| Tarefa do agente | Leia |
| --- | --- |
| Construir ou alterar uma tela | Overview, frontmatter, Components (os usados), Telas (a tela), Invariantes, Gates |
| Construir um componente | Colors, Typography, Shapes, Components, Fitness functions de design |
| Revisar ou auditar | Invariantes, Gates de qualidade, Portões de ideias, Testes de identidade e de monotonia |
| Propor algo que este arquivo não prevê | Portões de ideias, Considerado e descartado |
| Mudar um token ou uma regra | Registro de decisões visuais |
| Orquestrar skills | Protocolo da primeira grande iteração, Iterações seguintes |

**Ordem de autoridade.** PRODUCT.md (decisões de produto da entrevista com o responsável, que prevalecem sobre as Partes onde divergem; ver a tabela "Divergências com as Partes 1 a 4" dele) > Partes 1 a 4 (regras do produto) > este DESIGN.md (decisões visuais e gates) > `.interface-design/system.md` (medidas registradas dos componentes, derivadas deste arquivo) > padrões de qualquer skill. Se uma skill sugerir algo que contradiz este arquivo, este arquivo vence. Se este arquivo contradisser o PRODUCT.md ou as Partes, eles vencem e o arquivo é corrigido por um registro DV.

### Quem usa e em que cena

- **Quem opera:** quem está diante de um planejamento ou de uma refatoração (arquiteto de soluções, tech lead, às vezes alguém que nem é arquiteto), na própria mesa, entre outras tarefas, com tela de computador. Usa a cada tarefa, não uma vez por sistema. Ocupado, sem paciência para formulário e desconfiado de pergunta invasiva (PRODUCT.md, Users).
- **Três níveis, três orçamentos de tempo:** Rápido (cerca de 7 minutos), Equilibrado (15 a 20 minutos, selo "Recomendado") e Avançado (35 a 50 minutos). A interface precisa caber no tempo de cada um.
- **Leitores do resultado:** liderança, times e auditoria, que abrem o relatório (T-18) por link, muitas vezes no celular, ou impresso numa reunião. Por isso o relatório é desenhado para 320 px e para papel em tons de cinza tanto quanto para 1440 px.
- **O que eles precisam sentir:** que a conclusão é defensável, que a incerteza foi dita, que discordar é permitido e que ninguém está vendendo nada.

### Exploração do domínio

- **Domínio:** laudo, aferição, tolerância, linha zero, folga e interferência, faixa, cota (linha de dimensão com setas), hachura, carimbo do desenho (bloco de identificação com versão, data e responsável), calibração versionada, certificado, desvio, batente.
- **Mundo de cor:** papel vegetal frio, grafite de lapiseira, nanquim azul-escuro, a hachura cinza de uma seção cortada, o azul-ardósia e o ocre dos lápis de cor usados para separar zonas num desenho, o verde, o âmbar e o vermelho das etiquetas de inspeção.
- **Assinatura:** o diagrama de tolerância (componente C-05). Linha zero, zona de tolerância hachurada e assimétrica quando a calibração é assimétrica (E7), desvio desenhado de um lado ou do outro, faixa de incerteza com terminais de cota, batente de saturação. Aparece no mapa de ajuste (T-09), no detalhe de eixo (T-10), na projeção antes e depois (T-12), no relatório (T-18) e, com a mesma gramática de cota, na escala do índice (C-06) e na linha do tempo de obrigações (C-10).
- **Padrões rejeitados:** painel de cartões de KPI com número grande, substituído pela frase do veredito como foco; medidor radial ou semáforo, substituído por escala linear com faixa; vermelho e verde para subajuste e sobreajuste, substituídos por um par simétrico azul-ardósia e ocre, com posição, hachura e texto; chat de assistente para a IA, substituído por anotações por portão fora da folha oficial; estética de planta azul (fundo ciano, grade), substituída por papel neutro, com o mundo técnico só na assinatura.

**Key Characteristics:**
- Papel, grafite e nanquim na estrutura; cor só onde há significado medido.
- Uma folha por tela; o veredito oficial é a folha, e a IA anota fora dela.
- A frase vem antes do número, e o número nunca aparece sem a faixa.
- Sobra e falta com o mesmo peso visual; nenhum lado parece "pior".
- Certeza tem traço: contínuo para medida, tracejado para estimativa, pontilhado para inferência, vazio para desconhecido.
- Movimento só para mudança de estado; o veredito não tem suspense.
- Família tipográfica única, números tabulares, pt-BR.
- Respostas sugeridas adiantam a leitura, nunca a escolha: nada vem marcado, "Não sei" está sempre lá.

## Colors

Uma paleta de papel e tinta, fria e sóbria, em que a cromia é um recurso escasso reservado para três vocabulários de significado: ajuste, saúde e erro.

### Primary
- **Nanquim** (nanquim): texto principal, botão primário, anel de foco, linha zero do diagrama de tolerância. A ação mais forte da tela tem a cor de assinar um laudo, não uma cor de "vá em frente".
- **Nanquim aceso** (nanquim-hover): estado de hover do botão primário.

### Neutral
- **Mesa** (mesa): fundo da aplicação e superfície da anotação da IA. É a mesa de desenho sobre a qual as folhas ficam.
- **Folha** (folha): superfície de trabalho e do laudo oficial. Branco levemente frio, nunca creme.
- **Campo** (campo): fundo de entradas de dados, um tom abaixo da folha, para que o campo pareça rebaixado e receba conteúdo.
- **Realce** (realce): item selecionado, pergunta em foco, linha em hover, opção de origem marcada.
- **Grafite** (grafite): texto secundário, explicações, "Por que perguntamos isso".
- **Grafite claro** (grafite-claro): metadados, citações, legendas e placeholders. Passa 4,5:1 em todas as superfícies, inclusive realce (4,76:1).
- **Traço de controle** (traco-controle): contorno de campos, caixas de seleção e controles cujo limite precisa ser percebido (3,59:1 sobre folha; WCAG 1.4.11).
- **Inativo** (inativo): texto e ícones desabilitados (isentos de contraste pela WCAG, mas usados só com outro sinal de estado).
- **Traço** (sem token de cor própria: nanquim a 10% de opacidade, `rgba(24,32,41,0.10)`): divisórias decorativas e linhas de tabela. Nunca serve de contorno de controle.

### Semânticas de ajuste
- **Sobra** (sobra) e **véu de sobra** (sobra-veu): capacidade além da necessidade. Azul-ardósia.
- **Falta** (falta) e **véu de falta** (falta-veu): capacidade aquém da necessidade. Ocre.
- O par tem a mesma luminosidade perceptual de origem (OKLCH L 0,56 e 0,60) e croma parecido: nenhum lado domina.

### Semânticas de saúde e erro
- **Saudável** (saudavel), **Atenção** (atencao) e **Crítico** (critico): status dos indicadores H1 a H6 e das obrigações datadas. Crítico também marca erro de entrada, veto e fim de suporte vencido.
- **Desconhecido** não tem cor própria: é um ícone vazio em grafite claro com o texto "Desconhecido".

### Named Rules
**A Regra da Cor que Significa.** A estrutura é papel, grafite e nanquim. Cor aparece só onde codifica um significado medido: sobra, falta, status de saúde, erro. Nenhuma cor decorativa, nenhum gradiente, nenhum destaque "de marca". Se uma cor não responde "o que ela mede?", ela sai.

**A Regra da Simetria.** Sobra e falta têm o mesmo peso visual, o mesmo tamanho de marca e o mesmo tratamento. Pintar o subajuste de vermelho e o sobreajuste de azul faria a falta parecer mais grave e empurraria o arquiteto a acrescentar estrutura, violando a simetria de estilos (PR-06, RN-87) e a separação de sobra e falta (RN-72).

**A Regra das Três Lentes.** Ajuste, saúde e intenção são perguntas diferentes (D-01) e têm vocabulários visuais diferentes. Ajuste usa sobra, falta e hachura. Saúde usa saudável, atenção, crítico e desconhecido. Intenção usa os estados de portão em nanquim. As cores de ajuste nunca aparecem fora dos diagramas e marcas de ajuste, e as cores de status nunca aparecem dentro deles. Assim uma dívida de testes não parece motivo para trocar de arquitetura.

**A Regra do Não é Alarme.** Portão que não passa, "Ganho irrisório", "Contraproducente", "Sem fundamento" e "Não se paga" são resultados que protegem o arquiteto, não erros. São desenhados em nanquim, com ícone e texto, nunca em vermelho. Vermelho fica para crítico de saúde, veto, fim de suporte vencido e erro de entrada.

### Validação da paleta (v0.1)

Calculada por script a partir dos valores OKLCH de origem (registro DV-04):

| Verificação | Resultado |
| --- | --- |
| Texto nanquim, grafite e grafite claro sobre folha, mesa, campo, realce, sobra-veu e falta-veu (WCAG 1.4.3) | Todos passam 4,5:1; pior caso grafite claro sobre falta-veu, 4,72:1 |
| Texto de botão primário (folha sobre nanquim) | 16,25:1 |
| Erro em texto (critico sobre folha) | 7,04:1 |
| Gráficos e contornos sobre folha e mesa (WCAG 1.4.11): traço de controle, sobra, falta, saudável, crítico, nanquim | Todos passam 3:1; pior caso traço de controle sobre mesa, 3,20:1 |
| Atenção (atencao) sobre folha | 2,87:1, **não passa sozinho**: o ícone de atenção sempre leva glifo e contorno em nanquim (nanquim sobre atenção: 5,67:1), e é o glifo que identifica o objeto |
| Sobra × falta, distância perceptual sob visão típica, protanopia, deuteranopia e tritanopia (Machado et al., 2009) | ΔE OKLab ≥ 0,18 em todos: distinguíveis |
| Falta × crítico | Mínimo 0,116 (deuteranopia): distinguíveis, e nunca aparecem no mesmo componente |
| Sobra × saudável | 0,047 em tritanopia: **próximos**. Nunca aparecem no mesmo componente; sobra tem hachura e posição, saudável tem ícone de confirmação e texto |
| Saudável × crítico | 0,051 em deuteranopia: **próximos**, como todo par verde e vermelho. Ícones distintos (confirmação e octógono) e texto obrigatórios |

Consequência normativa: **cor nunca é o único portador de significado** (P3 12.5; WCAG 1.4.1). Todo uso de sobra, falta e status vem com pelo menos mais um sinal entre posição, hachura, ícone e texto, e a impressão em tons de cinza continua legível.

## Typography

**Display Font:** nenhuma; produto em modo Operate usa uma família só.
**Body Font:** IBM Plex Sans (com Segoe UI e system-ui de reserva), auto-hospedada, pesos 400, 500 e 600.
**Label/Mono Font:** nenhuma. Números usam algarismos tabulares da própria Plex.

**Character:** um grotesco de documento de engenharia, preciso sem ser frio, com terminais que o distinguem do sans-serif padrão de qualquer painel. Foi escolhido por função: algarismos tabulares para faixas e índices, boa distinção entre caracteres em códigos como "E1", "H1", "P1" e "RN-01", cobertura completa de pt-BR, licença SIL OFL 1.1 que permite auto-hospedagem (sem CDN de fontes de terceiros, o que mantém a CSP estrita da Parte 4 seção 14.3 e evita enviar o IP do usuário a outro serviço).

### Hierarchy
- **Título de página** (600, 24px, 32px): o título da tela e a frase do veredito. É o maior texto do produto.
- **Seção** (600, 18px, 26px): títulos de seção dentro da folha.
- **Pergunta** (500, 18px, 27px): o texto da pergunta no questionário, o foco do T-05.
- **Corpo** (400, 16px, 24px): explicações, perguntas-ponte, razões, texto corrido. Linha de no máximo 68 caracteres.
- **Compacto** (400, 14px, 20px): tabelas densas (T-01, T-11, T-14), listas de saúde, trilha.
- **Dado** (500, 14px, 20px, `tnum`): todo número que se compara: faixas, níveis, índices, pesos, datas, percentuais.
- **Ação** (500, 14px, 20px): rótulos de botão.
- **Rótulo** (500, 13px, 18px): rótulos de campo, cabeçalhos de tabela, selos.
- **Legenda** (400, 12px, 16px): citação de evidência, marcas de origem, legendas de escala. Nunca menor que 12px.

A escala tem razão de cerca de 1,125 a 1,33 entre degraus, apertada como pede o modo Operate. A hierarquia é feita por peso e cor (nanquim, grafite, grafite claro) antes do tamanho.

### Named Rules
**A Regra da Frase que Vence o Número.** O foco do resultado é a frase do veredito, em título de página. O Índice de Ajuste aparece em corpo ou dado, sempre com a faixa por extenso ("entre 43 e 57"). Nunca há número gigante, contador animado ou métrica-herói: a Parte 3 trata o excesso de confiança no número como risco (seção 15) e a faixa como decisão (D-03).

**A Regra dos Algarismos Tabulares.** Todo número que muda ou se compara usa `font-variant-numeric: tabular-nums`. Decimais com vírgula, faixas por extenso, unidades ditas ("2,5 níveis", "entre 2 dias e 3 semanas"), formatados por mensagens ICU (DT-28), nunca concatenados no componente.

**A Regra da Caixa Normal.** Sem rótulos em caixa-alta, sem espaçamento de letras alterado, sem sobretítulo acima de títulos, sem itálico para ênfase. Frases em caixa de sentença. Ênfase vem de peso.

## Layout

**Grade e ritmo.** Base de 4px. Espaçamentos só dos tokens (micro 4, compacto 8, curto 12, base 16, médio 24, amplo 32, seção 48, maior 64). O ritmo é desigual de propósito: elementos relacionados a 8 ou 12px, grupos a 24 ou 32px, seções da folha a 48px. Mais espaço acima de um título do que abaixo.

**Casca do aplicativo.** Barra superior de 48px na mesa (nome do produto, análise atual com estado, indicador de salvamento, menu da conta). Dentro de uma análise, um trilho à esquerda de 240px na mesma cor da mesa, com as etapas (Enquadramento, Perguntas com o progresso por âmbito, Revisão, Resultado, Lacunas, Relatório; no Avançado e com ideia prévia, também Avaliação da ideia). O conteúdo ocupa uma folha centralizada. O trilho e a barra não têm cor própria: a estrutura é tonal.

**Larguras.** Folha das perguntas com coluna de leitura de 720px, uma pergunta em foco por vez e as respostas anteriores resumidas acima, editáveis. Painel de contexto de 320px à direita em telas de 1280px ou mais. Folha do laudo (T-09, T-12, T-18) com até 880px. Tabelas largas (T-01, T-14) usam a largura disponível até 1200px.

**Pontos de quebra.** 390, 768, 1024, 1280 e 1440px, mais a verificação de refluxo a 320px (WCAG 1.4.10). Abaixo de 1280, o painel de contexto vira uma seção recolhível dentro da pergunta. Abaixo de 1024, o trilho vira um seletor no topo e o painel "não sei" (T-06) vira uma folha modal. Em 390, os diagramas de tolerância ocupam a largura toda, com o rótulo e a leitura acima. Tabelas viram listas empilhadas em vez de rolagem horizontal; a matriz T-14 vira um fator por bloco.

**Densidade, decidida por modo.** Questionário confortável (padding de pergunta 24px, 32px entre perguntas), porque mesmo o nível mais curto é leitura contínua de vários minutos. Laudo de leitura (48px entre seções, 16px dentro delas). Tabelas compactas (linha de 40px, célula com 8 e 12px).

**Impressão.** O relatório (T-18) tem folha de impressão própria: `@page` A4, margens de 18mm, quebras de página controladas antes de cada capítulo, nenhum elemento interativo, `print-color-adjust: exact` nos diagramas, rodapé com sistema, data de referência, versão da calibração e paginação.

### Named Rules
**A Regra da Folha Única.** Cada tela tem uma folha. Seções dentro dela se separam por espaço, título e, quando preciso, um traço. Nada de cartões dentro de cartões nem grade de cartões iguais como estrutura de página.

**A Regra da Folha Curta.** O laudo só cresce quando há o que dizer. "Ajustado" produz a folha mais curta do produto, e nada é acrescentado para preencher espaço (P3 6.3).

**A Regra do Percurso Reversível.** O questionário é adaptativo: a próxima pergunta é escolhida pelo percurso (PRODUCT.md), mas o usuário pode voltar a qualquer resposta dada e alterá-la, e o percurso se recalcula. O progresso mostra o tempo restante estimado do nível e os âmbitos já cobertos, nunca "passo 7 de 30". A numeração de etapas só aparece onde a sequência é real, como no enquadramento e nas etapas da ideia prévia no Avançado.

## Elevation & Depth

A profundidade conta a história de papéis sobre uma mesa: a mesa é o fundo, a folha está um nível acima, sobreposições (menus, popovers, dicas) estão dois níveis acima e diálogos, três. A diferença entre mesa e folha é tonal e leva um anel de sombra mínimo. Não há bordas sólidas em superfícies nem sombras dramáticas.

### Shadow Vocabulary
- **Folha** (`box-shadow: 0 0 0 1px rgba(24,32,41,0.08), 0 1px 2px rgba(24,32,41,0.06)`): a folha de trabalho e a folha do laudo.
- **Sobreposição** (`box-shadow: 0 0 0 1px rgba(24,32,41,0.10), 0 8px 24px -8px rgba(24,32,41,0.18)`): menus, popovers, dicas e o painel "não sei" ancorado.
- **Diálogo** (`box-shadow: 0 0 0 1px rgba(24,32,41,0.10), 0 24px 48px -16px rgba(24,32,41,0.28)`): diálogos de confirmação e folhas modais em telas pequenas.

### Named Rules
**A Regra da Folha Oficial.** Só o que o motor calcula e os modelos de texto oficiais escrevem fica na folha do laudo. Tudo o que a IA do usuário produz (propostas, raciocínio guiado, divergências) fica fora dela, na superfície de anotação sobre a mesa, com rótulo de provedor e modelo. No relatório impresso, a IA é um capítulo próprio, depois do veredito e das incertezas (RF-53; Parte 4 seção 10.8).

**A Regra da Elevação Declarada Uma Vez.** Uma superfície tem anel de sombra ou contorno, nunca os dois. Contorno de 1px com sombra difusa embaixo é o "cartão fantasma" e não entra.

## Shapes

Formas de instrumento de medida: cantos pequenos, retas exatas, nada de pílula. Controles com cantos de 4px (controle). Folhas, popovers e diálogos com 8px (folha). Diagramas, barras de faixa e escalas com cantos retos (reto), porque medem. Raio concêntrico: um elemento dentro de outro arredondado tem raio igual ao externo menos o padding.

Ícones de uma biblioteca só, com traço de 1,5px, em 16 ou 20px, sempre com rótulo ou nome acessível. Emoji e caracteres Unicode nunca substituem ícones. Os glifos de certeza, os ícones de portão e a hachura são SVG próprio, desenhados uma vez e reutilizados.

### Named Rules
**A Regra da Certeza que Tem Traço.** A origem de uma resposta tem uma gramática de linha, igual em toda tela, na impressão e nas marcas de resposta: **contínuo** para medida, **tracejado** para estimativa, **pontilhado** para inferência, **vazio** (contorno sem preenchimento) para desconhecido, **barrado** para "não se aplica". A mesma gramática desenha projeções (tracejadas, porque são estimativas) e marca respostas na trilha. Uma pessoa que aprende o código numa tela lê todas.

**A Regra da Hachura.** Hachura só existe onde há medida: a zona de tolerância (linhas a 45° em nanquim a 28%, espaçadas 5px) e o sentido do desvio (barra para a direita na sobra, para a esquerda na falta). Nunca é textura de fundo nem enfeite de seção.

## Components

Todos os componentes interativos vêm dos primitivos do repositório no estilo shadcn/ui sobre Radix (DT-05), estilizados com os tokens. Nada de `div` clicável, de menu feito à mão nem de valor literal de cor ou espaçamento no componente. Os componentes de visualização são SVG próprio com `d3-scale` só para escalas (DT-06), com título, descrição e texto alternativo com os números.

### Buttons
- **Shape:** cantos de 4px, altura 36px (40px em toque), padding horizontal 16px, rótulo em ação.
- **Primário:** fundo nanquim, texto folha. **No máximo um por tela**, e ele nunca é a ação de mudar a arquitetura: "Gerar veredito", "Começar", "Usar a estimativa", "Exportar relatório". "Avaliar como intenção" é sempre secundário.
- **Hover / Focus / Active:** hover em nanquim aceso, 150ms; foco com anel de 2px em nanquim afastado 2px da borda; ao pressionar, `scale(0.98)`. Desabilitado em inativo, com o motivo dito ao lado quando não for óbvio (por exemplo, "Descreva todas as alternativas antes de escolher uma.").
- **Secundário:** fundo folha, texto nanquim, anel de 1px em traço de controle.
- **Discreto:** sem fundo, texto nanquim, sublinhado no hover. Para ações de linha e de rodapé.
- **Destrutivo:** só para excluir conta ou dados, sempre com diálogo de confirmação (AlertDialog) que nomeia o que será perdido. O botão do diálogo usa crítico.
- Rótulos são verbos que dizem o que acontece. Sem seta "→" anexada, sem ícone decorativo.

### Inputs / Fields
- **Style:** fundo campo, contorno de 1px em traço de controle, cantos de 4px, altura 40px, texto em corpo, rótulo sempre visível acima (nunca só placeholder).
- **Focus:** anel de 2px em nanquim; o contorno não muda de cor.
- **Error:** contorno e mensagem em crítico, com ícone, logo abaixo do campo, dizendo o problema e como corrigir. Erro de formato é erro; validação de regra de negócio (V-01 a V-15) não é erro: usa o aviso de validação.
- **Disabled:** fundo mesa, texto inativo.
- **Entrada de faixa (C-03):** dois campos numéricos, "mínimo" e "máximo", lado a lado, com controle deslizante de dois polegares acessível por teclado (Radix Slider) como atalho opcional. A faixa digitada é a verdade; o deslizante segue.

### Respostas sugeridas e origem (C-02)
O componente que faz o questionário parecer conhecer o usuário (PRODUCT.md, Positioning) sem induzir a resposta.
- **Estrutura:** a pergunta; de 2 a 4 respostas sugeridas pela IA para o perfil provável, como opções de rádio (Radix RadioGroup) em linhas de largura total; abaixo delas, o campo livre "Outra resposta" e a opção "Não sei", sempre presentes.
- **Nenhuma opção vem marcada** e nenhuma ganha destaque de "mais provável": mesmo peso, mesma cor, ordem estável. A sugestão adianta a leitura, não a escolha.
- **"Não sei" tem o mesmo tamanho, peso e cor das sugestões** (RN-78). Não é link, não é cinza, não some quando há sugestões. Abre o fluxo T-06.
- **Enquanto as sugestões chegam:** as linhas reservam o espaço com esqueleto por no máximo o tempo de resposta do provedor. O campo livre e "Não sei" já estão utilizáveis. Com falha do provedor, aparecem as opções padrão da estrutura de decisão, com a nota "Sugestões indisponíveis agora; o resultado não depende delas."
- **Origem, leve:** no Rápido não há escolha de origem; toda resposta conta como estimativa. No Equilibrado e no Avançado, uma caixa "Tenho esse dado medido" abaixo da resposta abre fonte e data. A gramática de certeza continua marcando cada resposta no resultado (contínuo medida, tracejado estimativa, pontilhado inferência, vazio desconhecida).
- Teclado: setas entre as opções, Tab para o campo livre; a resposta salva ao escolher, sem botão "Próxima" obrigatório (o botão existe para quem prefere).

### Diagrama de tolerância (C-05, assinatura)
A barra bipolar da Parte 3, desenhada como um diagrama de tolerâncias.
- **Domínio fixo e compartilhado:** de -3,5 a +3,5 níveis em todos os eixos, para que os oito diagramas do mapa fiquem alinhados pela linha zero e sejam comparáveis. A escala (marcas a cada 0,5 nível, números nos inteiros, "falta" à esquerda, "sobra" à direita) aparece uma vez, no topo do mapa, e não se repete em cada linha.
- **Linha zero:** nanquim, 1,5px, altura total. É o ajuste perfeito (necessidade igual à capacidade).
- **Zona de tolerância:** retângulo de -t⁻ a +t⁺ com a hachura a 45°. Assimétrica quando a calibração é (E7: 0,5 de falta e 1,0 de sobra na v0.1). Desenhar a assimetria é dizer a verdade da calibração.
- **Desvio:** quando fora da tolerância, barra de 10px da linha zero até o ponto central, na cor do lado, com hachura no sentido do lado. Dentro da tolerância, só uma marca de 2px em nanquim no ponto central, sem cor.
- **Faixa de incerteza:** retângulo de 20px do limite inferior ao superior, no véu do lado (ou realce quando atravessa a zona de tolerância), com terminais verticais de 1px em grafite, como uma cota.
- **Batente de saturação:** barra vertical de 2px em grafite onde o desvio atinge a saturação (t mais E_max). Eixo saturado ganha a leitura "no limite ou além". Desvios brutos além do domínio (até ±4 níveis) são cortados na borda do diagrama, com um terminal em seta e a leitura numérica verdadeira ao lado.
- **Leitura ao lado (desktop) ou acima (390px):** rótulo do eixo ("E2 Distribuição") e peso em legenda; desvio em dado ("+2,5 níveis"); faixa em legenda ("de +2,0 a +3,0"); marcas de saturação, contestação e inferência quando existirem.
- **Projeção (T-12):** duas linhas por eixo, "Hoje" contínua e "Projetada" com contorno tracejado (é estimativa).
- **Interação e acessibilidade:** a linha inteira é um link para o detalhe do eixo (T-10), com nome acessível que lê o diagrama ("Distribuição: sobra de 2,5 níveis, entre 2,0 e 3,0, fora da tolerância, no limite de saturação"). O SVG tem `role="img"`, título e descrição. Os padrões de hachura usam IDs únicos por instância (`useId`).
- **Altura:** 40px por linha no mapa; 72px no detalhe.

### Escala do índice (C-06)
- Régua horizontal de 0 a 100, marcas a cada 10, números em 0, 50 e 100. Faixa do índice como retângulo em nanquim a 16% com terminais de cota, ponto central como marca de 2px em nanquim. Ao lado, o texto: "Índice de Ajuste entre 43 e 57".
- **Sobreajuste e subajuste em duas réguas próprias**, uma em sobra e outra em falta, alinhadas e nunca empilhadas numa barra só (RN-72).
- **Sem zonas coloridas, sem verde-amarelo-vermelho, sem ponteiro radial.** A categoria vem de O e U, não de uma faixa do índice, e desenhar zonas no índice ensinaria o contrário.
- **Faixas de aderência (PRODUCT.md):** os limites 30, 50, 70 e 85 aparecem como marcas neutras em grafite claro na régua, e a frase da faixa onde o índice está é o texto principal do veredito. Quando a faixa de incerteza cruza um limite, as duas frases aparecem ("Entre 'atende na maior parte' e 'resolve parte do problema'"), com as perguntas que decidiriam. Uma ideia reprovada por décimos nunca lê o mesmo texto de uma ideia ruim.
- **Contra não mudar:** abaixo da régua da ideia prévia, a diferença para não fazer nada, em dado e por extenso ("Comparada a não mudar: +12 pontos, entre +6 e +18"). Diferença negativa é dita como tal, em nanquim.

### Selo de confiança (C-04)
Texto ("Confiança média") mais um glifo de cota cuja largura cresce com a incerteza: estreito para alta, médio para média, largo para baixa. Ao focar ou passar o cursor, a explicação: "A faixa do índice tem 14 pontos de largura. Parte das respostas são estimativas."

### Status de saúde (C-07)
Ícone, rótulo e critério numa linha: confirmação em saudável ("Saudável"), triângulo âmbar com glifo e contorno em nanquim ("Atenção"), octógono em crítico ("Crítico"), círculo vazio em grafite claro ("Desconhecido"). Em seguida, o critério em grafite ("Perda de 30% do tempo com contornos, autorrelato"). No veredito Ajustado, a lista é compacta e só os críticos se destacam.

### Portão (C-09)
Uma linha por portão: identificador (P1 a P8) e nome, ícone de estado, estado por extenso e motivo em uma linha.
- **Passa:** confirmação em nanquim. **Não passa:** "×" em círculo, em nanquim. **Indeterminado:** círculo tracejado com til. **Não avaliado:** círculo vazio em grafite claro e o motivo ("avaliado só no Avançado").
- O portão que define o veredito leva peso 600 e a marca "Define o veredito". Nenhum portão é verde ou vermelho (Regra do Não é Alarme).
- Todos os portões avaliáveis aparecem, mesmo depois do que definiu o veredito (P3 9.7).

### Linha do tempo de obrigações (C-10)
Eixo de tempo horizontal com a data de referência marcada ("Hoje" ou a data do veredito), obrigações como marcas com data e fonte. Vencida: octógono crítico à esquerda da data de referência. Em menos de 6 meses: atenção. Mais distante: marca em nanquim. O prazo da intenção, quando existe, é uma faixa tracejada (estimativa). Em 390px vira lista cronológica.

### Marca de origem e contestação (C-11)
Glifo da gramática de certeza e uma palavra: "estimado", "inferido", "desconhecido", "não se aplica", "antiga", "contestado", "alterada após o veredito". Aparece em toda resposta e todo número derivado dela, em toda tela, e abre a origem (a conversão da pergunta-ponte, o texto livre original, a justificativa).

### Avisos de validação e de tensão (C-13, C-14)
Nota em linha, logo abaixo do que a provocou: ícone de informação, texto em nanquim, a regra citada em legenda ("RN-01"). Sem faixa amarela, sem caixa de alerta, sem vermelho. O bloqueio condicional diz o que destrava o portão ("Para passar no portão P1, indique o atributo de qualidade afetado."). A tensão cita as duas perguntas com links e oferece "Revisar" e "As duas estão corretas, porque...".

### Lado a lado: padrão e local (C-15)
Duas colunas de largura igual, o mesmo componente nas duas, rótulos "Calibração padrão v0.1" e "Sua calibração" (ou "Nível derivado" e "Seu nível contestado"), com a justificativa abaixo. Nenhum lado destacado como vencedor.

### Plano ideal
Saída do modelo, portanto na folha oficial, logo depois do veredito e dos motivos. Três camadas, reveladas conforme o nível (PRODUCT.md): **Direções** (movimentos em atributos, em corpo), **Forma da arquitetura** (descrição curta e, quando ajuda, um diagrama simples de partes e ligações em SVG, sem ícones de produto) e **Tecnologias** (Equilibrado e Avançado). No Avançado, também a **Sequência de passos**, cada passo com ponto de volta.
- **Tecnologias sempre em comparação:** uma tabela compacta por decisão, com a candidata escolhida e as concorrentes avaliadas, colunas para complexidade, simplicidade, popularidade, ecossistema, licença e fim de suporte, e a fonte e a data de cada fato datado. A linha escolhida leva peso 600 e a marca "Escolhida", sem cor de vencedora. Popularidade nunca aparece como motivo sozinho.
- **Sem logotipos de tecnologia**, sem cartões de produto, sem selo de parceria. Nome em texto.
- **Candidatas a avaliar (P4 RG-14, DT-31):** tecnologias sugeridas pela IA que ainda não estão na base de referência aparecem fora da folha, na anotação da IA, com o rótulo "Candidata a avaliar" e sem nota de critério. Nunca entram na tabela do plano oficial.
- **Variante "não mexa":** quando o modelo conclui que não há mudança que compense, o plano é uma frase ("Não mexa: nenhuma mudança se paga com a necessidade descrita.") e os motivos. Nenhuma camada vazia, nenhuma lista de melhorias opcionais (Regra da Folha Curta).
- **Variante "a solução mais simples basta"** (planejamento): a forma mais simples que atende, com o que a faria deixar de bastar.

### Cabeçalho do laudo
Lista de definições no topo da folha do laudo e do relatório, no espírito do carimbo de um desenho técnico, mas feita com componentes comuns: sistema, data de referência, objetivo, profundidade, versão da calibração (e "calibração local" quando houver) e composição das respostas ("42% medidas, 31% estimadas, 12% inferidas, 15% desconhecidas"), com os glifos de certeza. Nada de moldura imitando prancha.

### Conteúdo da IA do usuário
Um componente único renderiza todo texto vindo da IA do usuário (Parte 4 seção 13.4). Superfície de anotação (mesa) fora da folha oficial, cabeçalho com "Raciocínio guiado", provedor e modelo, e versão do prompt na trilha.
- **Proposta (RG-01 a RG-09):** proposta, explicação, evidências citadas (abrem a trilha) e três ações de mesmo peso: "Confirmar", "Ajustar", "Descartar". Nada é gravado sem uma delas (RN-79).
- **Raciocínio guiado (RG-10):** um bloco por portão ou por eixo, chegando por SSE, com resumo, evidências, resultado do motor, contra-argumento mais forte, o que mudaria a conclusão e a avaliação própria da IA. Blocos se separam por traço, não por cartões.
- **Divergência:** selo "Diverge do motor", os dois lados com as evidências e a regra que vale ("Vale o motor: o ônus da prova é da mudança, RN-73").
- **Itens descartados pelos validadores:** recolhidos, com o motivo.
- **Com falha do provedor:** o lugar diz o que faltou e oferece "Tentar de novo"; o progresso fica salvo e o resultado oficial não espera a IA. A IA é obrigatória nesta fase (PRODUCT.md), então não existe estado "sem IA conectada" dentro de uma análise: a conexão acontece antes, no primeiro acesso.
- **Nunca:** brilhos, ícone de faísca, gradiente roxo, bolha de chat, avatar de robô, efeito de digitação.

### Tabelas
Linhas de 40px, cabeçalho fixo em rótulo, números em dado alinhados à direita, divisórias em traço. Ordenação nos cabeçalhos onde a tela pede (T-01 por atividade recente; nunca por "gravidade", T-01). Linha clicável com hover em realce e foco visível. Em telas estreitas, cada linha vira um bloco empilhado com rótulo e valor.

### Navigation
Trilho em mesa, itens em rótulo 500; item atual em realce com peso 600 e `aria-current`. Sem borda colorida lateral. Blocos do questionário mostram só "12 de 14" e a composição das origens, nunca cor de ajuste nem pista de veredito (RN-81).

### Indicador de salvamento
Texto discreto na barra superior: "Salvo", "Salvando...", "Sem conexão. Tentando de novo." Região viva educada (`aria-live="polite"`), sem toast, sem animação além da troca de texto. Conflito de versão (412) abre as duas versões para escolher.

### Disclosures
"O que mudaria este veredito" e "Considerado e descartado" recolhidos por padrão (P3 6.3), em `details`/Collapsible com o título como gatilho e contagem de itens.

### Estados vazios e carregamento
- Vazio ensina e oferece uma ação: o painel sem análises explica em uma frase o que o StackSync faz e oferece "Nova análise" e "Como o StackSync decide".
- O veredito sai em menos de 0,5s (QA-05): nenhum esqueleto antes de 300ms. Os blocos de raciocínio guiado reservam o espaço com esqueleto do tamanho final ("Aguardando o raciocínio do portão P3"), para não deslocar o laudo.

### Movimento
- Só mudança de estado: hover e pressão (150ms), abertura de disclosure e popover (180ms), painel lateral (200ms), chegada de bloco de raciocínio (opacidade, 150ms). Curva de saída `cubic-bezier(0.23, 1, 0.32, 1)`; nunca `ease-in`, nunca `transition: all`, só `transform` e `opacity`.
- Com `prefers-reduced-motion`, ficam só as mudanças de opacidade.
- **O veredito não tem suspense:** nenhuma revelação animada, contagem crescente de número, confete ou carimbo animado.

## Do's and Don'ts

### Do:
- **Do** usar só os tokens do frontmatter; nenhum hex, rgb, oklch ou valor arbitrário do Tailwind fora de `tokens.css`.
- **Do** abrir toda tela de resultado pela frase do veredito em título de página, com a faixa e a confiança logo abaixo.
- **Do** desenhar sobra e falta com o mesmo peso, sempre com posição, hachura e texto além da cor.
- **Do** mostrar a origem de toda resposta com a gramática de certeza, em toda tela e na impressão.
- **Do** manter o veredito oficial na folha e a IA na superfície de anotação, rotulada.
- **Do** usar dados dos exemplos A a D da Parte 3 e dos casos-âncora em todo protótipo e captura de tela.
- **Do** verificar cada tela renderizada em 1440, 1280, 1024, 768 e 390px, e o relatório também a 320px e na impressão.
- **Do** escrever todo texto de interface como mensagem ICU no pacote de conteúdo, sob o lint de vocabulário (FF-06).

### Don't:
- **Don't** usar gradiente, vidro, desfoque decorativo, brilho, sombra colorida ou sombra dura deslocada.
- **Don't** usar cartões de métrica com número grande, medidor radial, semáforo, gráfico de radar ou minigráficos no lugar de conteúdo.
- **Don't** pintar portão reprovado ou veredito desfavorável à mudança de vermelho.
- **Don't** mostrar índice, categoria, cor de ajuste ou qualquer pista de veredito durante o preenchimento (RN-81).
- **Don't** usar rótulo em caixa-alta, sobretítulo, numeração 01/02/03 sem sequência real, texto com "→" anexado ou metadados separados por ponto médio.
- **Don't** usar fonte monoespaçada como fantasia técnica, nem Inter, Geist ou a fonte do sistema como voz escolhida.
- **Don't** abrir modal para o que cabe na página; o fluxo "não sei" é painel lateral em telas largas.
- **Don't** celebrar o Ajustado nem usar urgência, superlativo, exclamação ou condicional vago ("você poderia considerar").
- **Don't** citar tecnologia fora do plano ideal, nem dentro dele sem as concorrentes avaliadas e os critérios; nada de logotipo de tecnologia.
- **Don't** deixar uma resposta sugerida marcada por padrão ou destacada como "mais provável".
- **Don't** imitar planta azul, papel quadriculado ou prancha de desenho; o mundo técnico vive só na assinatura.

## Invariantes do produto na interface

Regras do PRODUCT.md e das Partes 3 e 4 que viram propriedades visuais verificáveis. Todas são **BLOCKER**: uma tela que viola qualquer uma não está pronta, por mais bonita que esteja.

| ID | Invariante | Origem | Como verificar |
| --- | --- | --- | --- |
| IV-01 | Nenhum veredito parcial durante o preenchimento: T-04 a T-08 sem índice, categoria, cor de ajuste ou indicação de direção | RN-81; PR-11 | Teste de importação (rotas do questionário não importam consultas de veredito) e revisão das capturas |
| IV-02 | "Não sei" com o mesmo destaque das respostas sugeridas, presente em toda pergunta | T-05; RN-78; PRODUCT.md | Teste de componente: mesmas classes e dimensões de uma sugestão |
| IV-03 | Ajustado é estado de sucesso e é curto: frase de fechamento, zero componentes de sugestão, nada de celebração | P3 6.3; RN-75; QA-25 | Teste de DOM sobre o fixture S-03 (FF-14) e captura |
| IV-04 | Número de índice sempre com faixa e confiança, faixa por extenso | D-03; PR-08; P3 10.4 | Teste de componente: C-06 não aceita valor sem faixa |
| IV-05 | Sobra e falta sempre separadas e com peso visual igual; nunca somadas num visual único | RN-72; PR-06 | Revisão do mapa no fixture S-08 (Misto) e no Exemplo B |
| IV-06 | Alternativas em ordem neutra, sem destaque de vencedora; preferência bloqueada até todas descritas | PR-12; RN-14; V-11 | Teste de componente e captura de T-07 e T-13 |
| IV-07 | Todo conteúdo da IA rotulado com provedor e modelo e fora da folha oficial | RF-53; QA-26 | Regra de lint: texto da IA só pelo componente único |
| IV-08 | Nada da IA vale sem "Confirmar", "Ajustar" ou "Descartar" | RN-79 | Teste de API (já previsto) e de componente |
| IV-09 | Cor nunca é o único portador de significado | P3 12.5; WCAG 1.4.1 | Captura em tons de cinza e revisão de cada status, portão e eixo |
| IV-10 | Portão reprovado e veredito desfavorável à mudança não usam vermelho nem linguagem de alerta | PR-03; P3 6.3 | Revisão de T-12 nos fixtures CA-04 (Sem fundamento) e S-07 (Ganho irrisório) |
| IV-11 | Tecnologia só aparece no plano ideal, sempre comparada às concorrentes, com os critérios e a fonte dos fatos datados; nunca na variante "não mexa"; popularidade nunca é motivo sozinho | PRODUCT.md; P3 PR-07, RN-83 e RN-95; RN-01 | Teste de componente do plano ideal e captura |
| IV-12 | Voz sem superlativo, urgência, exclamação ou condicional vago | P3 10.4; FF-06 | Lint FF-06 |
| IV-13 | Versão da calibração no cabeçalho de todo veredito; marcas de inferência, estimativa e contestação em toda tela que mostra o dado | RN-82; PR-09; RN-79 | Teste de componente do cabeçalho e de C-11 |
| IV-14 | O relatório nunca omite incerteza, contestações, calibração local nem alterações após o veredito | T-18; P4 13.6 | Teste de saída do relatório |
| IV-15 | Desconhecido nunca parece erro nem conta como saudável | P3 5.6; RN-78 | Revisão do fixture S-09 |
| IV-16 | Painel sem ordenação ou destaque alarmista por gravidade | T-01 | Captura de T-01 |
| IV-17 | Falha do provedor de IA nunca perde progresso nem bloqueia o resultado oficial; a tela diz o que faltou | PRODUCT.md (IA obrigatória) | Jornadas com o adaptador que falha no meio |
| IV-18 | Contestação sempre mostra os dois resultados lado a lado | RN-86; C-15 | Captura de T-09 e T-10 com contestação |
| IV-19 | Respostas sugeridas nunca vêm marcadas nem destacadas, e são geradas sem acesso à ideia prévia | PRODUCT.md (Personalizar sem induzir) | Teste de componente e teste do contexto enviado à IA |
| IV-20 | O Índice de Ajuste nunca aparece como sim ou não: sempre a frase da faixa, a faixa e, para a ideia prévia, a diferença contra não mudar | PRODUCT.md (Resultado) | Teste de componente de C-06 com valores perto dos limites |

## Gates de qualidade

Os gates da pesquisa, adaptados ao StackSync. Cada um termina em **PASS**, **FAIL** ou **WAIVED**. Uma exceção exige motivo, risco conhecido, responsável e escopo, e é registrada no relatório de evidências. "Ficou mais bonito" não é justificativa. Severidade: **BLOCKER** impede a tarefa, erra um dado crítico, quebra fluxo ou acessibilidade grave; **MAJOR** prejudica a tarefa ou o sistema; **MINOR** é refinamento.

| Gate | PASS | FAIL | Severidade | Evidência |
| --- | --- | --- | --- | --- |
| DG-00 Objetivo e usuário | O agente citou o brief da tela (seção Telas): verbo, foco, ação primária, sucesso observável | Brief reduzido a "moderno", "limpo", "intuitivo" | BLOCKER | Checkpoint da interface-design no início do trabalho |
| DG-01 Descoberta do projeto | Tokens, primitivos de `components/ui`, mensagens ICU e catálogo foram usados; nada recriado | Componente duplicado, valor literal, texto escrito no componente, biblioteca nova sem justificativa (FF-12) | MAJOR | Diff e lint FD-01 |
| DG-02 Arquitetura da informação | Ordem do resultado definida em T-09 (seção Telas) e dos conteúdos de cada tela respeitada | Ordem trocada por estética; ação principal escondida | BLOCKER em J1 a J4 | Captura e brief |
| DG-03 Hierarquia e densidade | Um foco por tela, o do brief, vencendo por tamanho, peso ou espaço; densidade do modo certo; teste de vista desfocada | Tudo com o mesmo peso; número maior que a frase; tudo virou cartão | MAJOR | Captura reduzida e desfocada |
| DG-04 Conteúdo e microcopy | Fixtures reais (exemplos A a D, casos-âncora), extremos testados, vocabulário fixo da P3 10.4 | Lorem ipsum, número inventado, "Saiba mais" sem contexto, erro genérico | MAJOR | Lista de fixtures usados; lint FF-06 |
| DG-05 Estados e feedback | Matriz de estados da tela completa (seção Telas) e de cada componente | Só o caminho feliz; salvamento sem retorno; erro sem recuperação | BLOCKER em J1 a J4 | Mostruário e capturas por estado |
| DG-06 Sistema visual e identidade | Só tokens; assinatura onde o brief manda; testes de troca, de token e de assinatura passam | Valor improvisado; a tela poderia ser de qualquer produto | MAJOR | Testes de identidade |
| DG-07 Responsividade | 390, 768, 1024, 1280 e 1440 sem sobreposição nem rolagem horizontal; relatório também a 320 | Layout quebra, controle inalcançável, tabela perde dados | BLOCKER se impedir a tarefa | Capturas do Playwright |
| DG-08 Acessibilidade | WCAG 2.2 AA: nome acessível, teclado completo, foco visível e não encoberto (2.4.11), alvo de 24×24 no mínimo (40px nas ações principais), mensagens de status anunciadas (4.1.3), refluxo, movimento reduzido, diagramas com texto alternativo | Violação séria ou crítica do axe; questionário que não fecha por teclado; status só por cor | BLOCKER para impedimento | axe nas jornadas (FF-11), teclado manual, leitor de tela por release |
| DG-09 Funcional e integração | Salvamento contínuo com conflito 412, SSE com retomada, percurso adaptativo que se recalcula ao alterar uma resposta, links da trilha, exportações funcionando de ponta a ponta | Ação decorativa, dado que não persiste, rótulo que mente | BLOCKER | Playwright nas jornadas, com IA e com falha do provedor |
| DG-10 Qualidade visual renderizada | Capturas reais inspecionadas por um passe de revisão separado, nas cinco larguras e nos estados | Aprovação lendo só o código | MAJOR | Capturas anexadas ao relatório |
| DG-11 Desempenho e estabilidade | JavaScript inicial de até 200 KB comprimido, LCP até 2,5s em 4G (QA-07), CLS até 0,1 com fonte e blocos SSE, INP até 200ms, até 3 arquivos de fonte | Salto de layout ao carregar fonte ou raciocínio; dependência pesada por efeito | MAJOR; BLOCKER se impedir o uso | FF-10, Lighthouse, painel de desempenho |
| DG-12 Revisão independente | Impeccable `critique` e `audit` numa sessão sem o contexto de quem construiu; achados P0 e P1 resolvidos; exceções registradas | O próprio agente construtor aprova a tela | MAJOR | Saída do Impeccable e do detector |
| DG-13 Impressão e link de leitura | Relatório impresso em A4 legível em tons de cinza, sem elementos interativos, quebras certas; `/r/:token` só leitura | Diagrama sem hachura na impressão; botão impresso; dado cortado | BLOCKER em T-18 | Emulação de mídia de impressão no Playwright |

### Fitness functions de design

O que puder ser automático vira portão de CI, como na Parte 4 seção 16.2.

| FD | Protege | Verificação |
| --- | --- | --- |
| FD-01 | Tokens como fonte única | Lint: nenhum literal de cor (`#`, `rgb(`, `hsl(`, `oklch(`) nem valor arbitrário de Tailwind (`[...]`) fora de `tokens.css` |
| FD-02 | Movimento barato | Lint: proibir `transition-all` e animação de propriedades de layout |
| FD-03 | Acessibilidade | axe sem violações sérias ou críticas em J1 a J4 e no mostruário (estende FF-11) |
| FD-04 | Voz | FF-06 aplicado também às mensagens de interface, não só aos textos do veredito |
| FD-05 | Regressão visual | Capturas do Playwright em 1440, 1280, 1024, 768 e 390, por rota e estado, com fixtures fixos e fonte carregada |
| FD-06 | Goldens visuais protegidos | Capturas de referência só mudam em commit com registro DV ou com relatório de evidências aprovado; qualquer outra mudança falha no CI (mesma lógica da FF-18) |
| FD-07 | Ajustado sem sugestão | Teste de DOM no fixture S-03 (estende FF-14) |
| FD-08 | Visualizações acessíveis | Teste de componente: todo SVG de C-05, C-06 e C-10 tem `role="img"`, título e descrição; status exige ícone e rótulo por tipo |
| FD-09 | Orçamento de fonte | No máximo 3 arquivos woff2 com subconjunto latino, carregados da própria origem; algarismos tabulares conferidos em teste visual |
| FD-10 | Uma ação primária | Teste de DOM: no máximo um botão primário por região principal |
| FD-11 | Detector de padrões | `impeccable detect` na rota renderizada, com versão fixa e telemetria desligada; consultivo na F2a, bloqueante para P0 e P1 a partir da F2b; exceções documentadas, nunca regra desligada em massa |
| FD-12 | Camadas | Escala de `z-index` fixa (base, trilho, sobreposição, diálogo, aviso); nenhum valor arbitrário |

## Portões de ideias

O ônus da prova é da mudança, e no design o ônus da prova é da ideia. Todo elemento visual, efeito, padrão ou interação que **não está previsto neste arquivo** passa pelos oito portões abaixo antes de entrar, venha ele do agente, de uma skill ou de uma referência. É a esteira P1 a P8 da Parte 3 aplicada a sugestões de interface.

| Portão | Pergunta | Passa quando |
| --- | --- | --- |
| PI-1 Gatilho | Qual tarefa, estado, regra (RN, RF, T) ou achado de revisão exige isso? | Há uma origem citável. "Fica moderno" e "o produto X faz assim" não bastam (RN-01) |
| PI-2 Meta observável | O que o arquiteto ou o leitor do relatório faz melhor, mais rápido ou com menos erro? | O efeito é observável numa jornada (J1 a J7) |
| PI-3 Direção | Isso reforça o foco da tela ou compete com ele? Empurra para a mudança ou esconde incerteza? | Reforça o foco, não induz ação, não esconde faixa nem origem |
| PI-4 Materialidade | Alguém sentiria falta disso na tarefa se fosse removido? | Sim, pelo teste de tirar um acessório antes de sair |
| PI-5 Alternativa menos invasiva | Um token, componente, texto ou espaço que já existe alcança ao menos 80% do ganho? | Não existe caminho mais leve |
| PI-6 Custo | Quanto custa em bundle, acessibilidade, impressão, tradução, manutenção, CSP e dependências (FF-12)? | Custo dentro dos orçamentos de DG-11 e sem dependência nova sem justificativa |
| PI-7 Vieses de geração | Outra IA, com um pedido parecido, faria a mesma coisa? Está na lista de padrões de IA (seção Testes)? | Não é um padrão de categoria escolhido por hábito |
| PI-8 Prontidão | Tem tokens, todos os estados, acessibilidade, versão impressa e responsiva? | Tudo coberto e verificado no navegador |

Vereditos, no vocabulário do produto: **Aprovada** (passa nos oito), **Existe caminho melhor** (PI-5), **Irrisória** (PI-4), **Contraproducente** (PI-3), **Sem fundamento** (PI-1), **Inconclusiva** (falta evidência; volta com a evidência ou não entra). Só ideias aprovadas entram, e as que mudam o sistema viram registro DV. As reprovadas vão para "Considerado e descartado" com a condição que as reabriria.

Formulário curto para o relatório do agente:

```text
Ideia: [o que é, em uma frase]
PI-1 Gatilho: [origem]        PI-2 Meta: [efeito observável]
PI-3 Direção: [foco e viés]   PI-4 Materialidade: [quem sentiria falta]
PI-5 Alternativa: [mais leve]  PI-6 Custo: [bytes, a11y, impressão, dependência]
PI-7 Vieses: [teste de troca]  PI-8 Prontidão: [estados e evidência]
Veredito: [Aprovada | Existe caminho melhor | Irrisória | Contraproducente | Sem fundamento | Inconclusiva]
```

## Testes de identidade e de monotonia

Sobreajuste e subajuste visual se verificam com testes diferentes, e os dois são obrigatórios em DG-06 e DG-12.

**Contra o genérico e o monótono (subajuste):**
- **Teste de troca** (interface-design): trocar a Plex pela fonte de sempre e o layout por um template muda a sensação? Onde não mudaria, houve padrão em vez de decisão.
- **Teste do nome removido:** sem o nome StackSync, a tela ainda diz que é um instrumento de decisão com tolerância e incerteza? Os diagramas, o cabeçalho do laudo e as marcas de origem precisam responder isso.
- **Teste da assinatura:** apontar cinco lugares concretos em que a gramática do diagrama de tolerância aparece. "A sensação geral" não conta.
- **Teste de token:** lidos em voz alta, os nomes de token (mesa, folha, nanquim, sobra, falta) são deste produto ou de qualquer projeto?
- **Teste do ritmo:** em três telas seguidas da jornada, a densidade, o foco e a composição mudam conforme a tarefa? Mesma grade de cartões em todas é monotonia.

**Contra o esdrúxulo (sobreajuste):**
- **Teste da vista desfocada** (interface-design): desfocando a vista, a hierarquia continua legível e nada salta de forma agressiva?
- **Teste do acessório** (frontend-design): tirar um elemento decorativo antes de entregar. Se ninguém sentiria falta, ele sai.
- **Lista de padrões que denunciam geração por IA** (frontend-design, Impeccable): fundo creme com serifa de alto contraste e acento terracota; fundo quase preto com um acento verde-ácido; layout de jornal com filetes e zero raio; kit de cartões SaaS iguais com a mesma sombra; sobretítulo em caixa-alta acima de cada título; metadados com ponto médio; monoespaçada em rótulos pequenos; "→" anexado a links; texto em gradiente; vidro decorativo; borda lateral colorida em cartões; sombra dura deslocada; minigráficos e anéis de progresso no lugar de conteúdo; entrada animada igual em todas as seções. Qualquer um desses só entra pelos portões de ideias.

## Telas

Brief de cada tela do MVP, para o checkpoint da interface-design (DG-00). Telas da V2 e da V3 recebem brief completo quando a fase começar.

**Casca (todas as telas autenticadas).** Barra superior e trilho na mesa, folha central. Estados: salvo, salvando, sem conexão, conflito, sessão expirada, nova calibração disponível (aviso discreto na barra, não modal).

**T-01 Painel de análises.**
- **Verbo:** retomar ou começar uma análise. **Foco:** a tabela de análises, por atividade recente.
- **Densidade:** compacta. **Ação primária:** "Nova análise".
- **Colunas:** sistema, objetivo, estado, último veredito (categoria e faixa), confiança, calibração (com "nova calibração disponível"), obrigação mais próxima, data.
- **Estados:** vazio de primeiro uso, com análises, filtrado sem resultado, carregando, erro de carga.
- **Armadilhas:** cartões de análise em grade; contadores de "análises críticas"; ordenação por gravidade (IV-16).

**Conectar a IA (`/configuracoes/ia`), obrigatória no primeiro acesso.**
- **Verbo:** conectar e testar a IA do usuário; depois, trocar ou remover. **Foco:** o formulário de provedor, modelo e chave.
- **Conteúdo:** por que a IA é necessária (ela escolhe as perguntas e sugere respostas; não decide o resultado), o que é enviado em cada etapa (nunca o nome da organização) e que o uso é cobrado na conta do próprio usuário.
- **Ação primária:** "Testar e conectar". Não há "pular" nesta fase.
- **Estados:** não conectada, testando, conectada (últimos 4 caracteres), chave inválida, provedor fora do ar, modelo não avaliado (aviso), "usar só nesta sessão".
- **Armadilhas:** linguagem de marketing de IA; faíscas; a chave visível depois de gravada; tom de cobrança.

**T-02 Enquadramento.**
- **Verbo:** dizer o que quer avaliar, em que nível e com que profundidade. **Foco:** a pergunta da vez.
- **Sequência (real, por isso numerada):** (1) "O que você quer avaliar?": Planejamento ou Refatoração. (2) Nível: na refatoração, sistema inteiro, ferramenta técnica ou módulo específico; no planejamento, sistema novo, módulo ou funcionalidade nova num sistema existente, ou escolha de ferramenta técnica. (3) "Você já tem uma ideia?": texto livre opcional. (4) Profundidade: Rápido (cerca de 7 minutos), Equilibrado (15 a 20 minutos, selo "Recomendado") e Avançado (35 a 50 minutos), cada um com uma linha dizendo para quem é e o que o resultado traz.
- **Densidade:** confortável; uma pergunta por vez, opções em linhas de largura total.
- **Ação primária:** "Começar".
- **Selo "Recomendado":** um rótulo em texto no Equilibrado, sem cor de destaque nem cartão maior. É informação, não pressão.
- **Conteúdo:** o aviso "Não mudar nada é um resultado válido e frequente. O StackSync só propõe mudanças quando o ganho compensa." como texto comum, não como caixa de alerta.
- **Estados:** preenchendo, salvo, voltando a uma escolha anterior.
- **Armadilhas:** cartões de plano com preço imitando página de assinatura; ilustração decorativa; o nível Avançado com cara de "premium".

**T-03 Como o StackSync decide (modo Read).**
- **Verbo:** entender o método antes de confiar. **Foco:** necessidade contra capacidade, mostrado com um diagrama de tolerância de exemplo.
- **Conteúdo:** os oito eixos, tolerância, faixa, ônus da prova, materialidade, os oito portões, o "não sei", calibração vigente e o que o StackSync não faz.
- **Densidade:** leitura, com linha de no máximo 68 caracteres. Gerado do pacote de conteúdo.
- **Armadilhas:** página de marketing com seções de efeito; ícones em caixinhas para cada eixo.

**T-04 e T-05 Perguntas e cartão de pergunta.**
- **Verbo:** responder rápido, em linguagem simples, sem expor o negócio. **Foco:** a pergunta em foco, com as respostas sugeridas (C-02) logo abaixo.
- **Densidade:** confortável. Uma pergunta em foco por vez na folha; as respostas anteriores aparecem resumidas acima, editáveis. Painel "Por que perguntamos isso" à direita (1280px ou mais), dizendo o que a resposta muda no resultado.
- **Progresso:** tempo restante estimado do nível e os âmbitos já cobertos (por exemplo "Times", "Dados", "Custo de mudar"), sem contagem de perguntas e sem pista de veredito.
- **Ação primária:** nenhuma obrigatória, porque escolher uma resposta já salva e avança; "Próxima" existe para quem prefere. "Ir para a revisão" quando o orçamento do nível acaba.
- **Estados por pergunta:** sugestões carregando, sugestões disponíveis, sugestões indisponíveis (opções padrão), respondida por sugestão, respondida em texto livre, desconhecida, marcada como medida, inferida, em tensão, alterada após o veredito, salvando, erro de formato.
- **Fixture:** os percursos dos três níveis para refatoração de sistema inteiro (Exemplo C), escolha de ferramenta técnica e sistema novo; respostas livres longas.
- **Armadilhas:** qualquer pista de veredito (IV-01); "Não sei" menor ou em link (IV-02); sugestão pré-marcada (IV-19); jargão sem explicação no Rápido e no Equilibrado; pergunta sobre regra de negócio ou nome de cliente; cada pergunta num cartão com sombra; "quase lá".

**T-06 Fluxo "não sei".**
- **Verbo:** trocar desconhecimento por estimativa marcada ou por lacuna. **Foco:** as perguntas-ponte.
- **Forma:** painel lateral não modal a partir de 1024px; folha modal abaixo disso.
- **Conteúdo:** frase de acolhimento da P3 12.6; até quatro perguntas-ponte; campo "não sei, mas..."; conversão explicada ("Você disse X, então estimamos entre A e B"); "como descobrir" e "quem pode saber".
- **Ação primária:** "Usar a estimativa". Secundárias: "Ajustar a faixa", "Manter desconhecida", "Adicionar ao plano de descoberta".
- **Estados:** perguntas em aberto, estimativa proposta, proposta da IA (componente de proposta), falha do provedor (escolha manual vendo os textos-âncora), lacuna registrada, aviso de fator de peso 5.
- **Armadilhas:** tom de erro; interrogatório em cascata (um nível só, RN-80); proposta da IA gravada sem confirmação.

**T-07 Ideia prévia em detalhe (só no Avançado).** Nos níveis Rápido e Equilibrado, a ideia prévia é o texto livre do enquadramento e é avaliada pelo Índice de Ajuste. No Avançado, ela é detalhada nas etapas abaixo.
- **Verbo:** descrever a mudança de forma avaliável. **Foco:** a etapa atual.
- **Forma:** seis etapas reais, com indicador de etapa (aqui a sequência é informação).
- **Conteúdo:** validações V-01 a V-03 em linha; projeção por eixo com os textos-âncora visíveis e o diagrama em modo projeção; alternativas na ordem de cadastro, as duas obrigatórias primeiro.
- **Ação primária:** avançar de etapa. "Marcar preferência" só habilitado com todas as alternativas descritas, com o motivo dito.
- **Estados:** etapa vazia, com validação acionada, com proposta da IA, completa, preferência bloqueada.
- **Armadilhas:** destacar uma alternativa; botão primário "Aprovar mudança"; cores de vencedora.

**T-08 Revisão antes do veredito.**
- **Verbo:** conferir a base antes de gerar. **Foco:** a composição das respostas e o que pode mudar o resultado.
- **Conteúdo:** inferências a confirmar, tensões, lacunas separadas em "podem mudar o resultado" e "pode pular", fatores de peso 5 desconhecidos quando há intenção, revisão crítica da IA (RG-02) na superfície de anotação.
- **Ação primária:** "Gerar veredito", sempre habilitado (RN-78).
- **Armadilhas:** bloquear o veredito por respostas faltando; mostrar prévia do resultado.

**T-09 Resultado.**
- **Verbo:** entender o veredito e o porquê, e levar um plano. **Foco:** a frase da faixa do Índice de Ajuste.
- **Ordem:** cabeçalho do laudo; frase da faixa com o Índice de Ajuste em faixa (C-06); avaliação da ideia prévia contra não mudar, quando houver; até três motivos com evidência; plano ideal nas camadas do nível; depois os componentes da P3 10.3 que se aplicam (mapa de ajuste, saúde, obrigações, robustez, perguntas de maior valor, o que mudaria, considerado e descartado). A folha do laudo contém só o oficial; o raciocínio guiado fica abaixo, fora da folha.
- **Por nível:** Rápido mostra frase, faixa, motivos, direções e forma; Equilibrado acrescenta tecnologias comparadas e o mapa de ajuste; Avançado acrescenta a sequência de passos, saúde, robustez e a avaliação da ideia por portões (T-12).
- **Variantes:** Ajustado (curta, fechamento explícito), Sobreajustado, Subajustado, Misto (as duas réguas e as duas cores, com a interdependência dita), Indefinido entre X e Y (categorias possíveis com contorno tracejado, perguntas de maior valor em destaque), Inconclusivo (plano de descoberta como conteúdo principal), com contestação ou calibração local (lado a lado), com intenção (segundo bloco de veredito logo abaixo).
- **Fixtures:** Exemplo A (Ajustado e saudável), B (Sobreajustado e intenção Contraproducente), C (Subajustado e "Existe caminho melhor"), D (Indefinido), S-08 (Misto), S-09 (Indefinido ou Inconclusivo), S-06 (Ajustado com obrigação e H4 crítico).
- **Ações:** abrir eixo, ver trilha, responder perguntas de maior valor, contestar, avaliar direção como intenção (secundário), exportar relatório.
- **Armadilhas:** número grande no topo; gráfico de radar dos oito eixos; lista de "melhorias" no Ajustado (IV-03); vermelho no subajuste.

**T-10 Detalhe de eixo ou indicador.**
- **Verbo:** ver como o eixo foi avaliado e discordar se for o caso. **Foco:** o diagrama de tolerância em 72px, com necessidade e capacidade.
- **Conteúdo:** textos-âncora dos níveis, sinais que formaram cada lado (resposta, origem, efeito), verificação quantitativa (E3 e E4), evidências com tipo, sensibilidade, contestações anteriores.
- **Ação:** "Contestar nível" (secundário), com justificativa obrigatória; resultado lado a lado.

**T-11 Trilha de raciocínio.**
- **Verbo:** auditar o caminho das respostas ao veredito. **Foco:** a sequência de passos com entrada, regra e saída.
- **Densidade:** compacta, tabela com filtros (por eixo, por origem, só inferências, só contestações).
- **Armadilhas:** grafo animado de nós; monoespaçada em tudo.

**T-12 Avaliação da intenção.**
- **Verbo:** entender por que a intenção recebeu o veredito. **Foco:** a frase do veredito da intenção.
- **Conteúdo:** esteira dos oito portões (C-09), projeção antes e depois (C-05 em modo projeção), ganho contra o limiar de materialidade, resumo das alternativas, economia no modo completo, prontidão (S em faixa e vetos) e vieses.
- **Fixtures:** Exemplo B (Contraproducente), C ("Existe caminho melhor"), CA-04 (Sem fundamento), S-07 (Ganho irrisório), S-10 (Justificada e pronta: a tela também precisa saber dizer sim).
- **Armadilhas:** semáforo de portões (IV-10); "Justificada e pronta" comemorado.

**T-14 Matriz de prontidão (só no Avançado).**
- **Verbo:** pontuar os 16 fatores. **Foco:** os fatores em veto e o índice S em faixa.
- **Densidade:** compacta, tabela de 16 linhas com nota sugerida (e de onde veio), nota do arquiteto, justificativa e marca de veto.
- **Estados:** nota aceita, ajustada, sem justificativa, veto.
- **Responsividade:** abaixo de 1024px, um fator por bloco.

**T-15 Checklist go/no-go (só no Avançado).**
- **Verbo:** decidir com critérios fixados antes. **Foco:** os 13 itens com a evidência de cada um.
- **Ações:** "Aprovar" (habilitado só com os itens 1 a 12 e sem veto), "Não aprovar e abrir nova rodada", "Arquivar com motivo". Aprovar não é primário enquanto bloqueado e nunca é verde.

**T-17 Lacunas e plano de descoberta.**
- **Verbo:** transformar o que não se sabe em tarefas. **Foco:** as lacunas que podem mudar o resultado.
- **Conteúdo:** por lacuna, a pergunta, por que importa, como descobrir, quem pode saber (papel, não pessoa) e o estado. "Pode pular" por último.
- **Ação primária:** "Exportar o plano". **Estado vazio:** "Nenhuma lacuna muda o resultado."

**T-18 Relatório para liderança e `/r/:token` (modo Read).**
- **Verbo:** apresentar a conclusão a quem não opera o StackSync. **Foco:** o veredito em uma frase.
- **Conteúdo:** página principal com até três razões, índice com faixa e confiança em linguagem simples, obrigações, veredito da intenção, custo de agir e de não agir, o que mudaria, composição das respostas, contestações, calibração local e alterações após o veredito; apêndice com mapa, saúde, portões e trilha; capítulo do raciocínio guiado, rotulado, depois de tudo.
- **Larguras:** 320 a 1440px e A4 impresso (DG-13). O link de leitura não tem nenhuma ação além de imprimir.
- **Armadilhas:** relatório que esconde incerteza (IV-14); capa com ilustração; gráfico só em cor.

**T-22 Bancada de calibração (interna, relatório HTML da CLI).** Mesmos tokens e componentes de visualização, densidade máxima, sem exigência de assinatura nem de capturas em 390px; continua exigindo contraste, legibilidade e os casos que mudaram de veredito em destaque.

**V2 e V3 (brief resumido).** T-13 Comparador: colunas de largura igual, ordem neutra, marca "dominada" como fato, nunca "vencedora". T-16 ADR: documento editável em modo Read. T-19 Histórico: diferenças entre rodadas com a mesma gramática de certeza. T-20 Execução: fatias e gates, com "Piorou? Reavaliar" como ação secundária. T-21 Evidências: modo Read, citação com tipo de evidência.

## Conteúdo, voz e dados de exemplo

**Voz.** As regras de redação da P3 10.4 valem para todo texto de interface, não só para o veredito: veredito primeiro, faixas por extenso, vocabulário fixo (necessidade, capacidade, ajuste, sobreajuste, subajuste, tolerância, materialidade, faixa, confiança, portão, lacuna, obrigação datada), termos técnicos com explicação ao lado (componente de termo, DT-28), evidência com autor, ano e tipo. Caixa de sentença, voz ativa, verbos nos botões, nenhuma exclamação, nenhum emoji, nenhum "Ops!", nenhum "Parabéns". Erros dizem o que aconteceu e como resolver. Uma ação mantém o nome do botão até a confirmação ("Exportar relatório" gera "Relatório exportado").

**Microcopy de interface (além da P3 12.6):**

| Situação | Texto |
| --- | --- |
| Salvamento | "Salvo" · "Salvando..." · "Sem conexão. Tentando de novo." |
| Conflito de versão | "Esta resposta foi alterada em outra aba. Escolha qual versão manter." |
| Painel vazio | "Nenhuma análise ainda. A análise rápida leva cerca de 7 minutos." |
| Sugestões indisponíveis | "Sugestões indisponíveis agora; o resultado não depende delas. Escolha uma opção ou escreva a sua." |
| Profundidade | "Rápido: cerca de 7 minutos, uma avaliação prática." · "Equilibrado: 15 a 20 minutos, embasamento para defender ou derrubar uma proposta." · "Avançado: 35 a 50 minutos, a análise completa da arquitetura." |
| Plano "não mexa" | "Não mexa: nenhuma mudança se paga com a necessidade descrita." |
| Chave inválida | "O provedor recusou a chave. Confira a chave e teste de novo." |
| Provedor fora do ar | "O provedor de IA não respondeu. O veredito não depende dele; o raciocínio guiado será tentado de novo." |
| Item da IA descartado | "Descartado pela verificação: cita um número que não está nas respostas." |
| Divergência | "A IA vê este portão de outro modo. Vale o resultado do motor, porque o ônus da prova é da mudança (RN-73)." |
| Lacuna vazia | "Nenhuma lacuna muda o resultado." |

**A sigla "IA" (DV-11, aceita).** "IA" significa sempre inteligência artificial. O índice é sempre escrito "Índice de Ajuste", por extenso, em toda tela, texto, relatório, modelo de texto e nome de campo; nunca abreviado em sigla. As Partes 3 e 4 já foram corrigidas assim.

**Dados de exemplo obrigatórios.** Nunca lorem ipsum, nunca números sem origem. Fixtures, com valores ilustrativos rotulados como tal:
- Exemplos da P3 10.5: A Portal de Convênios, B Plataforma de Agendamento, C ERP de Distribuição, D App de Fidelidade.
- Casos-âncora S-01 a S-11 e CA-01 a CA-04 (P3 11.3; P4 6.2).
- Extremos: nome de sistema com mais de 80 caracteres; todas as respostas desconhecidas; todas medidas; 130 respostas; faixa do índice de 0 a 100; índice 100; 18 contestações; calibração local; alterações após o veredito; fim de suporte vencido; IA desconectada, com falha, divergente e com itens descartados; nova calibração disponível.

## Protocolo da primeira grande iteração

Este é o uso principal do arquivo: as fases F2a, F2b e F2c da Parte 4, em que agentes constroem as telas pela primeira vez. Depois disso, as iterações são ajustes pontuais (seção seguinte).

### Papéis e skills

| Skill | Papel nesta iteração | Comandos | Não usar para | Cuidados |
| --- | --- | --- | --- | --- |
| **interface-design** | **Única skill que gera interface.** Disciplina de construção, checkpoint antes de cada componente, testes de troca, vista desfocada, assinatura e token | `/interface-design`; `/interface-design:design-review`; `/interface-design:design-deslop` | Reexplorar o domínio ou propor outra direção: a direção está decidida aqui | Lê `.interface-design/system.md`, não este arquivo; por isso a Fase 0 cria esse arquivo derivado. Sem ele, a skill recomeça a exploração |
| **Impeccable** (4.8.2) | **Revisão separada.** Crítica de UX com pontuação, auditoria técnica, polimento, endurecimento | `critique`, `audit`, `polish`, `harden`, `clarify`, `layout`, `typeset`, `adapt`, `onboard` (T-01 e conexão de IA); `impeccable detect` | `new-work`, `document --seed`, `bolder`, `overdrive`, `delight`, `colorize`, `live`, `generate`: o mundo está decidido e o modo é Operate | Lê PRODUCT.md e este DESIGN.md. Telemetria desligada (`npx impeccable telemetry off` ou `DO_NOT_TRACK=1`). Ganchos (`hooks on`) só depois de ler o que executam, porque rodam fora do fluxo de aprovação. Modo por superfície: Operate no app; Read em T-03, T-18 e T-21 |
| **anti-ui-slop** | Lista de verificação de acabamento e o portão final (renderizar, comparar, relatar o que não foi verificado) | Playbooks `operate`, `polish`, `audit`, `craft` | Gerar telas em paralelo com a interface-design; o MCP pago da UIZZE não é necessário | Nunca enviar conteúdo do produto a serviço externo; referências ilustram padrões, não são copiadas |
| **baseline-ui** | Lint rápido de um arquivo | `/baseline-ui <arquivo>` | Ditar animação, curvas, tokens ou dependências | Regras adotadas e substituídas na tabela abaixo |
| **frontend-design** | Princípios curtos e a lista de padrões que denunciam IA, usada nos testes de identidade | Leitura | Direção estética: já decidida | Nenhum |
| **ui-ux-pro-max** | Consulta pontual de diretrizes de UX e acessibilidade por resultado observável | `search.py "<resultado>" --domain ux` | Gerar sistema de design: a recomendação para este produto foi avaliada e descartada (Considerado e descartado) | Não persistir saída sem verificar |
| **design-taste-frontend** | Fora do app. Só para uma eventual página de apresentação do site público (F4) | `/design-taste-frontend` | Qualquer tela autenticada | Declara um gancho de parada que roda o próprio gate (Node 22 e Chromium) enquanto a skill está carregada; suas regras de casa (cenas, efeitos, momentos encenados) contrariam a voz do produto, e a voz vence |

**Regra de exclusividade:** uma skill gera, outra critica, em passes separados. Nunca duas skills de geração conduzindo a mesma tela (pesquisa, seção 1). A revisão roda numa sessão de agente sem o contexto de quem construiu, como manda a Parte 4 (seção 18.2, item 6).

**baseline-ui, regras adotadas e substituídas:**

| Adotadas | Substituídas por este arquivo |
| --- | --- |
| Primitivos acessíveis (Radix) e os do projeto primeiro; `aria-label` em botão só de ícone; diálogo de confirmação para ação destrutiva; erros junto da ação; não bloquear colar; `h-dvh`; escala de `z-index` fixa; `tabular-nums`; `text-balance` em títulos e `text-pretty` em texto; sem gradiente, sem brilho; um acento por tela; estado vazio com uma ação; animar só `transform` e `opacity` | "Usar o padrão do Tailwind": os tokens daqui são o tema. "Usar motion/react": nenhuma animação em JavaScript no MVP; se um dia for preciso, ADR e justificativa (DT-26). "Nunca curva própria": a curva de saída da seção Movimento está pedida aqui. "Nunca mudar letter-spacing": adotada sem exceção |

### Fase 0: antes da primeira tela

1. **Ler** `AGENTS.md`, a Parte 3 (seções 6, 10 e 12), a Parte 4 (seções 13 e 16) e este arquivo.
2. **PRODUCT.md** já existe na raiz (entrevista de 10/11/2026) e é carregado pelo `impeccable context`. Ler também a tabela de divergências dele: onde ela contradiz as Partes, vale o PRODUCT.md.
3. **`.interface-design/system.md`** derivado deste arquivo, começando com "Autoridade: DESIGN.md": direção e sensação, estratégia de profundidade, base de espaçamento, escala tipográfica, os componentes já especificados com medidas. Nenhuma decisão nova nele.
4. **Impeccable** com telemetria desligada e ganchos desligados até revisão; `impeccable context` uma vez por sessão.
5. **Tokens e base:** `tokens.css` gerado do frontmatter, tema do Tailwind apontando para ele, fontes Plex auto-hospedadas (três pesos, subconjunto latino, `font-display: swap`, pré-carga só do 400 e do 600), lints FD-01, FD-02 e FD-12.
6. **Primitivos e mostruário:** botões, campo, entrada de faixa, respostas sugeridas (C-02), diálogo, folha modal, popover, dica, disclosure e abas sobre Radix; uma rota de mostruário só de desenvolvimento, fora do build de produção, que renderiza cada componente em cada estado com os fixtures.
7. **Assinatura primeiro:** C-05, C-06, C-09, C-10 e C-11, com testes de componente e capturas, porque reaparecem em T-09, T-10, T-12 e T-18. É a fatia de maior juro: errar a assinatura depois custa todas as telas.
8. **Harness de evidência:** Playwright com capturas nas cinco larguras, emulação de impressão, axe e o detector do Impeccable com versão fixa.

### Ciclo por tela

A ordem das telas segue a Parte 4: F2a (T-01, conexão de IA, T-02, T-04 e T-05, T-06, T-08, T-09, T-10, T-11, T-17, T-18, T-03), F2b (T-07, T-12, T-14, T-15) e F2c (raciocínio guiado em T-09, T-12 e T-18).

1. **Brief.** O agente construtor copia o brief da tela (seção Telas) e escreve o checkpoint da interface-design (intenção, hierarquia, paleta, profundidade, superfícies, tipografia, espaçamento), citando tokens deste arquivo em vez de inventar.
2. **Construir** com a interface-design, só com primitivos e componentes existentes, só com mensagens ICU, só com fixtures reais.
3. **Ver.** Abrir no navegador, operar o fluxo, ler console e rede, capturar as cinco larguras e cada estado do brief (e a impressão em T-18). Corrigir o que se vê em lote antes de capturar de novo.
4. **Criticar em separado.** Outra sessão de agente roda `/impeccable critique <rota>`, `/impeccable audit <rota>` e `impeccable detect` na rota renderizada, mais os testes de identidade e as invariantes. Resolve BLOCKER, depois MAJOR, depois MINOR.
5. **Gates.** DG-00 a DG-13 e IV-01 a IV-18 aplicáveis, com o CI verde (lint, tipos, testes, axe, capturas, orçamento).
6. **Relatório de evidências** (modelo abaixo) anexado ao pull request.
7. **Persistir.** Medidas novas de componente vão para `.interface-design/system.md`. Decisões que mudam o sistema viram registro DV aqui. Iterações descartáveis não são registradas.

**Definição de pronto de uma tela:** todos os gates aplicáveis em PASS ou WAIVED com registro, todas as invariantes em PASS, capturas aprovadas viram goldens (FD-06), relatório anexado.

**Limite de ciclos:** no máximo dois ciclos de crítica e correção por tela nesta iteração. Se sobrar BLOCKER, o agente para e relata, em vez de seguir inventando trabalho ou declarar PASS sem evidência.

**Fim da iteração:** rodar `/impeccable document` em modo de mesclagem para comparar este arquivo com o código real e gerar o `.impeccable/design.json`. Divergências viram registro DV ou correção de código, nunca reescrita silenciosa deste arquivo.

### Relatório de evidências (modelo)

```markdown
**Tela:** T-09 Resultado, variante Sobreajustado (fixture: Exemplo B)
Larguras: 1440, 1280, 1024, 768, 390 | Impressão: não se aplica | Com IA e com falha do provedor: sim

| Gate | Resultado | Evidência |
| --- | --- | --- |
| DG-00 | PASS | brief e checkpoint no PR |
| DG-03 | PASS | captura desfocada: frase do veredito é o foco |
| DG-08 | FAIL → PASS | axe: nome acessível faltando no diagrama E4; corrigido |
| IV-05 | PASS | mapa com sobra e falta separados |
| ... | ... | ... |

Achados do Impeccable (P0 a P3): [lista resolvida e pendente]
Ideias avaliadas (portões PI): [formulário de cada ideia nova]
Exceções (WAIVED): [motivo, risco, responsável, escopo]
Não verificado: [o que ficou de fora e por quê]
Decisões a registrar: [DV-nn ou nenhuma]
```

## Iterações seguintes

Depois da primeira grande iteração, o trabalho é de ajuste pontual. A escolha da ferramenta segue o problema:

| Problema | Ferramenta |
| --- | --- |
| Diff de uma correção pequena com aparência genérica | `/interface-design:design-deslop` |
| Tela pronta precisando de acabamento | `/impeccable polish <rota>` |
| Texto confuso, erro vago, rótulo ambíguo | `/impeccable clarify <rota>` |
| Casos-limite, nomes longos, falhas de rede | `/impeccable harden <rota>` |
| Espaçamento e ritmo | `/impeccable layout <rota>` |
| Quebra em alguma largura | `/impeccable adapt <rota>` |
| Lentidão percebida | `/impeccable optimize <rota>` |
| Revisão rápida de um arquivo | `/baseline-ui <arquivo>` |
| Tela "alta" demais | `/impeccable quieter` ou `distill` |
| Ideia nova de interface | Portões de ideias antes de qualquer comando |

Toda iteração mantém os goldens protegidos (FD-06) e o relatório de evidências.

## Considerado e descartado

Como no resultado do StackSync: o que foi avaliado e não passou, com a condição que reabriria.

| Opção | Por que foi descartada | Reabrir quando |
| --- | --- | --- |
| Recomendação do ui-ux-pro-max para este produto (padrão "Hero + Features + CTA", primária navy `#1E3A5F`, acento verde `#059669`, Outfit e Work Sans) | Padrão de página de venda para um aplicativo em modo Operate; acento verde de ação codifica "vá em frente" e alimenta o viés de ação; combinação genérica de SaaS, exatamente a que a pesquisa descreve | Nunca no app; a página de apresentação da F4 decide por conta própria |
| Inter, Geist ou fonte do sistema | Padrão de categoria, reprovaria o teste de troca | A Plex falhar em algarismos tabulares ou em legibilidade nos testes de FD-09 |
| Modo escuro no MVP | A cena de uso é escritório de dia, e o relatório precisa sair igual em papel; dobra a verificação de contraste sem pedido de usuário | Demanda medida no beta (F3); entra com conjunto de tokens e validação próprios |
| Cartões de KPI e métrica-herói para o índice | Falsa precisão (D-03) e excesso de confiança no número (P3 15) | Nunca |
| Medidor radial ou velocímetro | Sugere zonas de bom e ruim e dramatiza; não mostra faixa com honestidade | Nunca |
| Vermelho e verde para subajuste e sobreajuste | Quebra a simetria (RN-72, PR-06) e soma ruído à colisão vermelho e verde de daltonismo | Nunca |
| Semáforo nos portões | Portão reprovado protege; não é erro (PR-03) | Nunca |
| Gráfico de radar dos oito eixos | Distorce por área, não mostra tolerância, faixa nem lado do desvio | Nunca |
| Interface de chat para a IA | A esteira tem etapas fixas e não é agente (P4 seção 10.2 e seção 19); chat sugere que o veredito se negocia | Delegação conversacional virar requisito |
| Ícone de faísca, gradiente roxo e brilho para marcar IA | O clichê mais reconhecível de produto com IA | Nunca |
| Estética de planta azul (fundo ciano, grade, prancha) | Fantasia do mundo; o mundo empresta só tipo, paleta, densidade e assinatura | Nunca |
| Monoespaçada para códigos | Fantasia técnica; algarismos tabulares resolvem | Nunca no app; exportação da trilha em texto pode usar |
| Assistente com passos travados no questionário | A Parte 3 exige navegação livre (T-04) | Nunca; a intenção (T-07) tem passos porque é sequência real |
| Toast para salvamento | Distrai numa leitura longa; o indicador fixo basta e é anunciado | Nunca |
| Storybook no MVP | Mais uma dependência e infraestrutura (AP-07, DT-26); o mostruário de desenvolvimento com Playwright e axe cobre | Biblioteca de componentes compartilhada com outro produto ou equipe maior |
| Taste Skill no app | A própria skill se declara para sites de empresa, não para telas de aplicativo | Página de apresentação na F4, com a voz do produto fixada |
| Biblioteca de gráficos (Recharts, ECharts) | Desenha mal tolerância, faixa e saturação (DT-06) | Gráficos genéricos de séries temporais na V3 |
| Resposta sugerida pré-marcada ou destacada como "mais provável" | Âncora: o usuário aceita o palpite em vez da verdade, e o resultado passa a medir o palpite da IA | Nunca |
| Veredito binário "aprovada" ou "reprovada" para a ideia prévia | Uma ideia reprovada por décimos leria o mesmo texto de uma ideia ruim (PRODUCT.md) | Nunca |
| Logotipos e cartões de tecnologia no plano ideal | Vira vitrine de produto e esconde os critérios | Nunca |
| Seletor de níveis como cartões de plano com o Avançado em destaque | Imita página de assinatura e faz o nível mais longo parecer o "certo" | Nunca |

## Registro de decisões visuais

Mudar um token, uma regra nomeada ou um componente de assinatura segue o mesmo processo da calibração (UC-22, RN-88): proposta com justificativa, captura antes e depois nas cinco larguras, validação de contraste e de daltonismo rodada de novo, gates aplicáveis, registro abaixo com nova versão deste arquivo. **Nenhuma mudança de token é publicada se piorar contraste, distinção de cores ou legibilidade da impressão.** Ajuste local num componente nunca muda token.

| DV | Decisão | Status | Por quê | Reabrir quando |
| --- | --- | --- | --- | --- |
| DV-01 | Mundo "O Laudo Aferido": metrologia e desenho de tolerâncias, emprestando só tipo, paleta, densidade e assinatura | Aceita, v0.1 | Vem do domínio (ajuste, tolerância, faixa) e da necessidade de defender a conclusão | Teste com arquitetos no beta mostrar leitura errada |
| DV-02 | Modo claro único no MVP | Aceita, v0.1 | Cena de uso e paridade com a impressão (DT-19) | Demanda medida na F3 |
| DV-03 | Estrutura em papel, grafite e nanquim; cor só para significado; ação em nanquim | Aceita, v0.1 | Viés de ação (P3 6.1) e transparência | — |
| DV-04 | Paleta derivada em OKLCH, publicada em hex, validada por script: contraste WCAG 2.2 e distância perceptual sob três tipos de daltonismo (Machado et al., 2009) | Aceita, v0.1 | Valores verificados, não escolhidos a olho | Qualquer mudança de cor roda a validação de novo |
| DV-05 | Sobra azul-ardósia e falta ocre, mesmo peso, com posição, hachura e texto | Aceita, v0.1 | Simetria (RN-72, PR-06) e daltonismo | — |
| DV-06 | IBM Plex Sans, família única, pesos 400, 500 e 600, auto-hospedada | Aceita, v0.1, a confirmar em FD-09 | Algarismos tabulares, distinção de códigos, licença OFL, CSP sem CDN | Falha nos testes de algarismos ou de legibilidade |
| DV-07 | A frase vence o número; escala linear com faixa; O e U em réguas separadas | Aceita, v0.1 | D-03, P3 15, RN-72 | — |
| DV-08 | Diagrama de tolerância como assinatura (C-05), com domínio fixo de -3,5 a +3,5 níveis | Aceita, v0.1 | Domínio do produto; comparabilidade entre eixos | Calibração mudar tolerância ou saturação: o domínio acompanha |
| DV-09 | Gramática de certeza por traço | Aceita, v0.1 | Origem visível sem depender de cor (RN-79, PR-08) | — |
| DV-10 | IA do usuário fora da folha oficial, em superfície de anotação rotulada | Aceita, v0.1 | RF-53, QA-26, RN-73 | — |
| DV-11 | "Índice de Ajuste" sempre por extenso, sem sigla; "IA" só para inteligência artificial | Aceita, 10/11/2026 | Colisão de leitura para falantes de português; decisão do responsável pelo produto, já aplicada às Partes 3 e 4 | — |
| DV-12 | Mostruário de componentes só de desenvolvimento em vez de Storybook | Aceita, v0.1 | AP-07, DT-26 | Ver "Considerado e descartado" |
| DV-13 | Goldens visuais protegidos | Aceita, v0.1 | Mesma lógica da FF-18 contra agente que "conserta" o teste | — |
| DV-14 | Taste Skill fora do app | Aceita, v0.1 | Escopo declarado da skill e voz do produto | — |
| DV-15 | Respostas sugeridas (C-02) substituem o seletor de origem em toda pergunta; nada pré-marcado; origem "medida" opcional fora do Rápido | Aceita, v0.2 | PRODUCT.md (Perguntas) | Métrica de aceitação de sugestões próxima de 100% sinalizar ancoragem |
| DV-16 | Plano ideal com tecnologias com nome, sempre em tabela comparativa com critérios e fontes | Aceita, v0.2 | PRODUCT.md; P3 PR-07, RN-83 e RN-95 | — |
| DV-17 | IA obrigatória: conexão no primeiro acesso, sem estado "sem IA" dentro da análise | Aceita, v0.2 | PRODUCT.md (IA) | Versão sem IA entrar no roadmap |
| DV-18 | Frases por faixa de aderência sobre a régua do Índice de Ajuste, limites como marcas neutras | Aceita, v0.2 | PRODUCT.md (Resultado) | Calibração mudar os limites: as marcas acompanham |

## Fontes

- **Produto:** `PRODUCT.md` (entrevista com o responsável, 10/11/2026), que prevalece sobre as Partes onde diverge.
- **StackSync:** Parte 1 (fatores de decisão), Parte 2 (casos de uso UC-01 a UC-19, RN-01 a RN-70), Parte 3 (seções 5, 6, 8, 9, 10, 12 e 15; RN-71 a RN-97) e Parte 4 (seções 4, 8, 10, 13, 16 e 18), na raiz do repositório até a Fase 0 e depois em `docs/produto/`.
- **Pesquisa:** `ai-ui-slop-research.md` (10/11/2026): diagnóstico das seis falhas, relatos dos casos A a F, matriz de skills, gates G0 a G12, requisitos WCAG 2.2 AA e o fluxo sem arquivo monolítico (aqui resolvido com a ordem de autoridade e o mapa de leitura).
- **Skills instaladas, lidas na versão local:** `interface-design/SKILL.md`; `impeccable/SKILL.md` 4.8.2 e as referências `document.md`, `craft-floor.md`, `operate.md` e `mode-operate.md`; `anti-ui-slop/SKILL.md` 1.3.1 e `reference/craft.md`; `baseline-ui/SKILL.md`; `frontend-design/SKILL.md`; `ui-ux-pro-max/SKILL.md` e a consulta `--design-system` feita em 10/11/2026; `design-taste-frontend/SKILL.md` 2.5.1.
- **Normas e métodos:** W3C, WCAG 2.2 (critérios 1.4.1, 1.4.3, 1.4.10, 1.4.11, 2.4.7, 2.4.11, 2.5.8, 4.1.3); ISO 286-1:2010, sistema de tolerâncias e ajustes (metáfora do domínio); Machado, Oliveira e Fernandes (2009), *A Physiologically-based Model for Simulation of Color Vision Deficiency*, IEEE TVCG (simulação de daltonismo da validação da paleta); IBM Plex, licença SIL Open Font License 1.1.
