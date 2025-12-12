# ✨ PRD: Exibir Detalhes Técnicos no Perfil do Usuário

> **Documento de Requisitos do Produto**
> **Status:** `Proposto`
> **Autor:** `Gemini, Product Manager`
> **Data:** `2025-12-12`

## 1. Visão Geral e Problema

### O Problema
Atualmente, administradores e usuários da plataforma de gestão não conseguem visualizar ou acessar facilmente informações técnicas de seus próprios perfis, como o `slug` (identificador único na URL) ou o link direto para o perfil público, forçando-os a adivinhar a URL ou a consultar o banco de dados, o que é ineficiente e propenso a erros.

### Por que isso é Importante?
Resolver este problema simplifica tarefas comuns de administração, depuração e compartilhamento de perfis. Ao tornar a informação diretamente acessível, melhoramos a usabilidade da plataforma, economizamos tempo e reduzimos a fricção para os usuários que gerenciam o conteúdo.

## 2. Proposta da Solução

### Hipótese Central
Acreditamos que, ao adicionar uma seção dedicada a "Detalhes Técnicos" na página de edição de perfil do próprio usuário, aumentaremos a eficiência e a satisfação dos administradores, fornecendo acesso rápido e direto a dados relevantes do perfil.

### Descrição da Solução
Propomos a criação de uma nova seção visual na interface de edição de perfil. Esta seção será somente leitura e conterá campos que exibem o `slug` do perfil e o link completo e clicável para a versão pública daquele perfil.

## 3. Requisitos Detalhados

### Público-Alvo
*   **Usuários Primários:** Administradores do Sistema, Gerentes de Conteúdo.
*   **Usuários Secundários:** Qualquer usuário com acesso à edição do seu próprio perfil.

### Requisitos Funcionais (RF)
*   **RF-01:** Na página de edição de perfil do usuário logado, uma nova seção intitulada "Detalhes Técnicos" (ou similar) deve ser exibida.
*   **RF-02:** Dentro desta seção, o `slug` associado ao perfil deve ser exibido em um campo de texto somente leitura.
*   **RF-03:** A URL completa para o perfil público deve ser exibida como um link funcional.
*   **RF-04:** Ao clicar no link do perfil público, a página correspondente deve ser aberta em uma nova aba do navegador (`target="_blank"`).
*   **RF-05:** Um botão "Copiar Link" deve ser adicionado ao lado da URL para permitir que o usuário a copie facilmente para a área de transferência.

### Requisitos Não-Funcionais (RNF)
*   **RNF-01:** A construção da URL do perfil público deve ser dinâmica, utilizando uma variável de ambiente para a URL base do site público (ex: `NEXT_PUBLIC_SITE_URL`), para garantir que funcione corretamente em diferentes ambientes (desenvolvimento, staging, produção).
*   **RNF-02:** A seção e seus dados devem ser carregados de forma performática, sem introduzir latência perceptível na página de edição de perfil.

### Fora do Escopo
*   **Edição do `slug`:** A funcionalidade de alterar o `slug` do perfil não faz parte deste escopo e deve ser tratada como uma feature separada devido às suas implicações (e.g., quebra de links, SEO).
*   **Visualização em Perfis de Terceiros:** Esta seção de "Detalhes Técnicos" não será exibida ao visualizar ou editar o perfil de outros usuários, apenas no perfil do próprio usuário logado.

## 5. Critérios de Aceite e Sucesso

### Critérios de Aceite
*   **Dado que** estou na minha página de edição de perfil, **então** devo ver uma seção chamada "Detalhes Técnicos".
*   **Dado que** a seção "Detalhes Técnicos" está visível, **então** devo ver meu `slug` de perfil em um campo não editável.
*   **Dado que** a seção "Detalhes Técnicos" está visível, **então** devo ver um link clicável para meu perfil público.
*   **Quando** eu clico no link do perfil público, **então** meu perfil é aberto corretamente em uma nova aba do navegador.
*   **Quando** eu clico no botão "Copiar Link", **então** a URL do meu perfil público é copiada para a área de transferência e uma notificação de sucesso (ex: "Link copiado!") é exibida brevemente.

### KPIs para Medir o Sucesso
*   **Primário:** Redução qualitativa do tempo e esforço para administradores encontrarem e compartilharem URLs de perfis (medido através de feedback).
*   **Secundário:** Adoção da funcionalidade (se possível, rastrear cliques no botão "Copiar" e no link).

## 6. Questões em Aberto
*   Nenhuma questão em aberto no momento. O escopo é considerado claro e bem definido.