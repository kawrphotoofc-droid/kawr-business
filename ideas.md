# Direção de Design — Kawr Business

## Explorações iniciais

### Abordagem 1

**Theme Name:** Cofre Editorial

**Very Brief Intro:** Uma experiência de alta confiança que combina a precisão visual de um terminal financeiro com a elegância de uma revista executiva. Superfícies claras, painéis negros e detalhes dourados transformam dados complexos em decisões legíveis.

**Probability:** 0.037

### Abordagem 2

**Theme Name:** Ouro Cinético

**Very Brief Intro:** Uma interface escura e imersiva, com linhas luminosas e movimento contínuo inspirado em mercados e fluxos de capital. A estética comunica tecnologia avançada, velocidade e exclusividade.

**Probability:** 0.081

### Abordagem 3

**Theme Name:** Balanço Modernista

**Very Brief Intro:** Um sistema suíço contemporâneo, rigoroso e quase arquitetônico, com tipografia dominante, módulos assimétricos e pouquíssima ornamentação. A clareza analítica é o principal elemento de marca.

**Probability:** 0.024

## Abordagem escolhida: Cofre Editorial

### Design Movement

A direção combina **International Typographic Style**, editorial financeiro contemporâneo e interfaces de produto inspiradas em salas executivas. O visual parte da disciplina modernista, mas ganha calor por meio de dourado mineral, papel marfim e superfícies escuras com profundidade.

### Core Principles

1. **Confiança antes de espetáculo:** cada elemento deve reduzir incerteza, mostrar contexto e tornar cálculos auditáveis.
2. **Contraste com propósito:** áreas institucionais claras comunicam transparência; áreas analíticas escuras concentram atenção nos números.
3. **Assimetria controlada:** blocos deslocados, recortes editoriais e alinhamentos laterais evitam a aparência de template genérico.
4. **Densidade progressiva:** a landing page começa arejada e conduz o usuário para uma área de produto mais densa, sem perder legibilidade.

### Color Philosophy

O **preto ônix** representa rigor e estabilidade; o **branco marfim** transmite clareza e espaço de decisão; o **dourado mineral** sinaliza valor, mas aparece apenas em ações, números-chave e detalhes de orientação. Tons de ardósia e névoa evitam contraste excessivamente duro. Verde e vermelho são reservados estritamente para semântica financeira.

Paleta operacional: `#0F0F10`, `#171715`, `#F7F5EF`, `#FFFFFF`, `#D4AF37`, `#9A7C19`, `#73736C`, `#E8E4D8`, `#1F8A62`, `#C74A4A`.

### Layout Paradigm

A estrutura utiliza uma **espinha editorial assimétrica**: grandes títulos alinhados à esquerda, uma linha vertical dourada como eixo e módulos que atravessam colunas em diferentes larguras. Na área do produto, o layout evolui para uma bancada executiva com navegação lateral estreita, faixa superior de contexto e painéis modulares. O conteúdo não será centralizado em excesso; o ritmo é orientado por bordas, recuos e diagonais sutis.

### Signature Elements

- **Linha de auditoria:** traços dourados finos conectando métricas, fórmulas e explicações.
- **Recorte de cofre:** cantos assimétricos e molduras internas que lembram portas de cofre e documentos confidenciais.
- **Selo K:** símbolo abstrato formado por duas lâminas angulares, usado como marca, favicon e indicador de carregamento.

### Interaction Philosophy

As interações devem parecer precisas e deliberadas. Hover revela contexto, nunca decoração gratuita. Botões respondem com compressão sutil; cartões elevam apenas quando acionáveis; resultados numéricos atualizam com transições curtas. Modais de cálculo abrem como uma folha de auditoria sobre o painel, reforçando transparência.

### Animation

Entradas usam opacidade e deslocamento vertical de 12–18 px, com duração entre 220 e 480 ms e pequenos atrasos progressivos. Métricas podem contar suavemente quando entram na área visível. Gráficos desenham seus traços uma única vez e depois respondem instantaneamente às alterações. Elementos de navegação usam transições de 160–220 ms. Nenhuma animação deve impedir leitura ou exceder 500 ms; `prefers-reduced-motion` desativa todo movimento não essencial.

### Typography System

- **Display:** Cormorant Garamond, pesos 500–700, para grandes mensagens institucionais e números de destaque editorial.
- **Interface e corpo:** Manrope, pesos 400–700, para controles, tabelas, textos e microcopy.
- **Numeração:** Manrope com algarismos tabulares e espaçamento compacto.
- Hierarquia: títulos hero entre 64–86 px no desktop; títulos de seção entre 40–56 px; títulos de painel entre 20–28 px; corpo entre 15–18 px; microcopy entre 11–13 px com tracking moderado.

### Brand Essence

**Kawr Business transforma informações financeiras e tributárias em decisões compreensíveis para empresários e contadores, com transparência de cálculo como diferencial.** Personalidade: **criteriosa, sofisticada, colaborativa**.

### Brand Voice

Headlines são diretas e aspiracionais, sem promessas absolutas. CTAs usam verbos concretos. Microcopy explica consequências e reforça o papel consultivo do contador.

Exemplos:

> “Decida com números que você consegue explicar.”

> “Abra o cálculo. Entenda cada etapa.”

### Wordmark & Logo

O wordmark combina “KAWR” em caixa alta com desenho customizado e incisões diagonais, acompanhado de “BUSINESS” em espaçamento amplo. O símbolo é um **K formado por duas lâminas metálicas angulares**, com um vazio central que sugere seta ascendente e abertura de cofre. A marca nunca dependerá de um nome em fonte padrão.

### Signature Brand Color

**Dourado de Auditoria — `#D4AF37`**. Seu uso é limitado a decisões, estados ativos, linhas de explicação e números essenciais, tornando-o imediatamente reconhecível como sinal de clareza e valor.

## Arquitetura do Produto

A experiência será dividida em duas camadas integradas. A primeira é uma landing page pública com hero, proposta de valor, recursos, transparência, planos, FAQ e rodapé. A segunda é um workspace demonstrativo acessado pela mesma página, contendo visão geral, entradas financeiras, calculadoras, simulador tributário, alertas, score e relatório.

O estado da demonstração ficará no navegador e será recalculado em tempo real. A arquitetura de componentes separará domínio financeiro, apresentação e regras de cálculo, permitindo futura migração para autenticação, persistência e APIs sem reconstrução visual.

## Regras Funcionais

Todos os resultados financeiros terão ação “Ver cálculos”, abrindo uma trilha com fórmula, entradas, etapas intermediárias e conclusão. As simulações tributárias serão explicitamente apresentadas como estimativas educacionais e terão aviso para validação com profissional contábil. Nenhum recurso deverá afirmar que substitui contador, consultoria ou apuração fiscal oficial.

O relatório será gerado pela impressão formatada do navegador, com layout executivo específico para PDF. Os botões de cadastro, pagamento e conta serão tratados como demonstração e informarão que a funcionalidade chegará em uma versão futura.

## Decisões de estilo

Nas telas do produto, a Kawr utiliza uma **bancada executiva** composta por trilho de navegação estreito e identificado, faixa contextual superior e painéis modulares de auditoria. A estrutura deve permanecer visível e dominante, fazendo com que cada módulo pareça parte do mesmo ambiente proprietário.

A **linha de auditoria** é obrigatória ao redor de resultados financeiros relevantes. Métricas, fórmulas e explicações são conectadas por filetes finos, numeração sequencial, enquadramentos internos e cortes angulares inspirados na lâmina do símbolo K.

O **Audit Gold `#D4AF37`** é reservado a ações primárias, estados ativos, resultados financeiros principais e indicadores da trilha de auditoria. Ônix, ardósia, marfim e branco sustentam gráficos neutros e a arquitetura geral.
