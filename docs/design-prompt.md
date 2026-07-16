# Prompt para gerar o layout no claude.ai

> Rascunho usado pra gerar a direção visual do produto. Cole em uma conversa separada
> no claude.ai (não faz parte do código, é só um artefato de referência).

Estou construindo o frontend de um SaaS de portfólio chamado **Pricing Optimizer**. Preciso que você projete o layout visual completo das telas principais, em HTML/CSS ou React com Tailwind (o que for mais prático pra você iterar comigo), pensando em componentes reais que eu vou implementar depois em Next.js 15.

## O produto

O usuário cola a URL de um produto/SaaS. O backend faz scraping da página, classifica o público-alvo via LLM, e gera **3 variações de página de preços em paralelo**, cada uma aplicando uma estratégia psicológica de precificação diferente:
- **Anchor pricing** — âncora um plano caro pra fazer o do meio parecer razoável
- **Freemium ladder** — degraus claros do grátis até o enterprise
- **Value-based** — preço ancorado no valor entregue, não em features

As 3 variações chegam **transmitidas ao vivo via SSE** (Server-Sent Events) — ou seja, a UI precisa mostrar cada uma progredindo independentemente: pendente → gerando texto incrementalmente → completa. Não é um loading spinner único, são três estados progredindo em paralelo e de forma assíncrona entre si.

Depois de geradas, o usuário compara as 3 lado a lado, pode editar inline (preço, copy), e exporta a que escolher como JSX, HTML puro, ou config JSON pra Stripe Pricing Table.

## Público-alvo

Recrutadores técnicos internacionais e engenheiros seniores avaliando isso como peça de portfólio. Precisa parecer produto real, não projeto de bootcamp — é o critério mais importante.

## Stack técnico (pra você propor um design que eu realmente consiga construir)

- Next.js 15 (App Router), TypeScript
- **Tailwind CSS v4**
- **Astryx** (design system open-source recém-lançado pela Meta, construído sobre React + StyleX) como base de componentes — pense em algo no espírito de um design system corporativo polido (tokens de cor, espaçamento, tipografia consistentes), não uma UI genérica de biblioteca de componentes
- Suporte a **tema claro e escuro** obrigatório, respeitando preferência do sistema, com um toggle manual visível
- Motion (ex-Framer Motion) disponível pra transições

## Telas que preciso

1. **Landing page** — hero explicando a proposta de valor em uma frase, um CTA claro pra ir pro "studio", talvez uma prévia visual do resultado (screenshot/mockup de uma variação gerada) pra comunicar o produto sem precisar usar.

2. **Studio (tela principal)** — um campo de input de URL no topo (validação inline), e abaixo, quando o usuário submete, as 3 variações aparecem lado a lado (desktop) ou empilhadas (mobile) e vão se populando ao vivo conforme o stream chega. Cada card de variação precisa comunicar visualmente: qual estratégia está aplicando (label/badge), estado de progresso (esqueleto/skeleton enquanto gera, texto aparecendo incrementalmente tipo "digitando", checkmark quando completo), e depois de completo, os tiers de preço dela (nome do plano, preço, features, CTA, badge tipo "mais popular" quando aplicável).

3. **Comparação/hover** — ao passar o mouse sobre um elemento em uma variação (ex: o preço do plano do meio), as variações vizinhas devem destacar visualmente o elemento equivalente nelas, pra evidenciar a diferença estratégica entre as três abordagens.

4. **Modal de exportação** — abre a partir de um botão "Exportar" em cada card, com abas/tabs pra escolher o formato (JSX / HTML / Stripe Pricing Table JSON), mostra um preview do código/config gerado com syntax highlighting, botão de copiar.

5. **Estados de erro/vazio/carregando** — URL inválida, backend fora do ar, geração lenta (>10s em uma das três) — cada um precisa de um estado visual específico, não um genérico "algo deu errado".

## O que eu preciso de você

Para cada uma das 5 telas acima: um layout detalhado (wireframe visual real, não descrição em texto) com hierarquia de componentes clara, espaçamento, e como o tema escuro se aplica a cada elemento. Se puder, gere como HTML/CSS completo e navegável (ou um artifact React) que eu possa abrir no navegador e avaliar, não só descrever em prosa. Pode propor uma paleta de cores e tipografia do zero — não preciso que siga nenhum design existente meu, quero ver sua melhor proposta editorial/profissional pra esse produto.
