# 📝 Tech Spec: Exibir Detalhes Técnicos no Perfil do Usuário

> **Documento de Especificação Técnica**
> **Status:** `Rascunho`
> **Autor:** `Gemini, Arquiteto de Software`
> **Data:** `2025-12-12`
> **Relacionado a:** `features/exibir-detalhes-tecnicos-no-perfil-do-usuario/prd.md`

## 1. Objetivo

Esta especificação técnica detalha o plano de implementação para a funcionalidade "Exibir Detalhes Técnicos no Perfil do Usuário", conforme descrito no PRD. O objetivo é adicionar uma seção na página de edição de perfil que exibe o `slug` e um link para o perfil público do próprio usuário, visível apenas para ele.

## 2. Background e Contexto

A plataforma de administração carece de uma forma direta para que os usuários (especialmente administradores) visualizem dados técnicos de seus próprios perfis, como o `slug` e a URL pública. Esta funcionalidade visa preencher essa lacuna, melhorando a usabilidade para tarefas de depuração, compartilhamento e verificação.

O projeto utiliza Next.js, TypeScript, Refine, e Shadcn UI para componentes. A implementação seguirá as convenções e padrões existentes nesses frameworks.

## 3. Arquitetura e Design da Solução

A solução será componentizada para garantir reutilização e separação de responsabilidades.

### 3.1. Visão Geral da Arquitetura

1.  **Novo Componente de UI:** Um novo componente, `TechnicalDetailsCard.tsx`, será criado para encapsular a lógica e a apresentação da seção "Detalhes Técnicos". Este será um componente de cliente (`"use client"`) para lidar com a interatividade do botão "Copiar".
2.  **Modificação da Página de Perfil:** O componente `TechnicalDetailsCard` será integrado à página de edição de perfil existente, localizada em `src/app/profiles/[id]/page.tsx`.
3.  **Lógica de Exibição Condicional:** A página de perfil será modificada para obter a identidade do usuário atualmente logado (usando o hook `useGetIdentity` do Refine). O `TechnicalDetailsCard` só será renderizado se o `id` do perfil sendo visualizado corresponder ao `id` do usuário logado.
4.  **Fluxo de Dados:**
    *   A página `src/app/profiles/[id]/page.tsx` já busca os dados do perfil. O campo `slug` desses dados será extraído.
    *   O `slug` será passado como *prop* para o componente `TechnicalDetailsCard`.
    *   Dentro do `TechnicalDetailsCard`, a URL pública completa será construída usando a variável de ambiente `process.env.NEXT_PUBLIC_SITE_URL` e o `slug` recebido.

### 3.2. Manifesto de Arquivos

*   **Arquivo a Criar:**
    1.  `src/components/profile/TechnicalDetailsCard.tsx`: O novo componente de UI para exibir as informações.

*   **Arquivo a Modificar:**
    1.  `src/app/profiles/[id]/page.tsx`: A página de edição de perfil onde o novo componente será renderizado condicionalmente.

## 4. Plano de Implementação Detalhado

### Passo 1: Criar o diretório para o novo componente

Criaremos um novo diretório para organizar os componentes relacionados ao perfil.

### Passo 2: Implementar o Componente `TechnicalDetailsCard.tsx`

Este componente será responsável por toda a UI e lógica da nova seção.

*   **Local:** `src/components/profile/TechnicalDetailsCard.tsx`
*   **Tecnologias:** React, TypeScript, Shadcn UI (`Card`, `Input`, `Button`, `Label`), `lucide-react` para ícones.
*   **Props:** Receberá `{ slug: string }`.
*   **Lógica Interna:**
    *   Declarar como `"use client";`.
    *   Construir a URL pública: `const publicUrl = 
${process.env.NEXT_PUBLIC_SITE_URL}/perfis/${slug}
`;.
    *   Implementar a função `handleCopy` que usa `navigator.clipboard.writeText(publicUrl)` e gerencia um estado local (`useState`) para fornecer feedback visual de "Copiado!".
*   **Estrutura do Componente:** Utilizará os componentes `Card`, `CardHeader`, `CardContent` do Shadcn para estruturar o conteúdo, com `Label` e `Input` (desabilitado) para o `slug` e a URL. O link será um `<a>` envolvendo o `Input` ou um ícone, e o botão "Copiar" terá um ícone (`ClipboardCopy`).

### Passo 3: Integrar o Componente na Página de Perfil

Modificaremos a página de edição de perfil para incluir a lógica de exibição condicional.

*   **Local:** `src/app/profiles/[id]/page.tsx`
*   **Lógica a Adicionar:**
    1.  Obter a identidade do usuário logado. O Refine provê o hook `useGetIdentity` para isso.
    2.  Obter o `id` do perfil da URL (já deve estar disponível na página).
    3.  Comparar os dois IDs.
    4.  Se os IDs forem iguais, renderizar o componente `<TechnicalDetailsCard slug={profile.slug} />`, passando o `slug` do perfil carregado na página.

## 5. Fora do Escopo

Conforme o PRD, os seguintes itens estão fora do escopo:
*   Qualquer funcionalidade para editar o `slug`.
*   Exibição desta seção em perfis de outros usuários.

## 6. Plano de Testes

Os testes serão manuais, seguindo os critérios de aceite do PRD.

*   **Cenário 1: Visualizando o próprio perfil**
    1.  Faça login como administrador.
    2.  Navegue até a página de edição do seu próprio perfil.
    3.  **Verificar:** A seção "Detalhes Técnicos" está visível.
    4.  **Verificar:** O `slug` exibido corresponde ao seu perfil.
    5.  **Verificar:** A URL pública está correta e é clicável.
    6.  Clique na URL e **verifique** se o perfil público abre corretamente em uma nova aba.
    7.  Clique no botão "Copiar". **Verifique** se a URL é copiada para a área de transferência e se uma mensagem de confirmação aparece.

*   **Cenário 2: Visualizando o perfil de outro usuário**
    1.  Faça login como administrador.
    2.  Navegue até a página de edição do perfil de *outro* usuário.
    3.  **Verificar:** A seção "Detalhes Técnicos" **NÃO** está visível.

## 7. Questões em Aberto

1.  **Confirmação do Hook de Identidade:** Confirmar se o `useGetIdentity` do Refine é a forma canônica de obter o ID do usuário logado neste projeto. A documentação do Refine sugere que sim, mas é bom verificar o código existente (`auth-provider`).
2.  **Estrutura da URL Pública:** Confirmar se o padrão `/perfis/[slug]` é o correto para os perfis públicos. Assumimos que sim com base no contexto.
