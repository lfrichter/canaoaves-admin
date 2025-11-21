---
name: refine-best-practices
description: Best practices for Refine - Hooks do Refine (useTable, useForm, List, Edit
---
# Refine Framework: Best Practices & Guidelines

**Contexto:** Estamos construindo uma aplicação Admin robusta utilizando **Refine (refinedev)**.

**👑 Regra de Ouro:** Não reinvente a roda. Se o Refine tem um hook ou componente para isso, USE-O. Jamais escreva `fetch` ou `axios` manualmente dentro de componentes para operações CRUD padrão.

## 1. Core Hooks (Data & State)
O Refine gerencia o estado do servidor (via TanStack Query internamente) automaticamente.

### 🟢 Listagens (`List`)
- **NUNCA** use `useEffect` para buscar dados de tabela.
- **USE** `useTable` (se estiver usando AntD/MUI) ou `useList` (headless).
- **Por quê?** Gerencia paginação, filtros, ordenação, loading state e sincronização com a URL automaticamente.

### 🟡 Formulários (`Create` / `Edit`)
- **USE** `useForm` (do pacote `@refinedev/react-hook-form` ou adapters de UI).
- **Por quê?** Conecta automaticamente com o `dataProvider` para fazer o `create` ou `update`, popula os campos na edição, gerencia validação (Zod/Yup) e notificações de sucesso/erro.
- **Rich Text (Tiptap/Quill):** Integre usando o componente `Controller` do React Hook Form.

### 🔵 Detalhes (`Show`)
- **USE** `useShow`.
- **Por quê?** Recupera o registro pelo ID da URL (`resource/:id`) automaticamente e fornece a prop `queryResult`.

## 2. Componentes de Ação (Buttons)
Evite criar botões genéricos com `onClick` manual. Use os botões do Refine que já tratam permissões (`AccessControl`) e navegação.

- `<EditButton />`: Navega para a rota de edição do registro.
- `<ShowButton />`: Navega para a rota de detalhes.
- `<DeleteButton />`:
  - Já inclui diálogo de confirmação (Popconfirm/Dialog).
  - Suporta `mutationMode="undoable"` (Recomendado: mostra notificação com "Desfazer" antes de efetivar a ação).
- `<SaveButton />`: Gerencia estado de loading (`isSubmitting`) no submit de formulários.

## 3. Relacionamentos e Selects
Para preencher Inputs do tipo Select, Autocomplete ou RadioGroup com dados de outro resource (ex: selecionar `Category` no form de `Service`):
- **USE** `useSelect`.
- **Funcionalidade:** Ele busca os dados, gerencia a pesquisa (debounce) e a paginação infinita do dropdown automaticamente.

## 4. Padrões Específicos do Projeto (Canaoaves)

### 🗑️ Soft Delete vs Hard Delete
Nossa aplicação prioriza **Soft Delete** para integridade histórica.
1.  **Preferência:** Configure o `DeleteButton` normalmente. O nosso `dataProvider` deve saber lidar com o verbo DELETE transformando-o em *Soft Delete* se a API assim exigir.
2.  **Exceção:** Se precisar de lógica de UI específica (ex: botão "Arquivar"), use o hook `useUpdate` para enviar explicitamente `{ deleted_at: new Date() }`.

### 📸 Uploads de Mídia
- No `useForm`, trate o upload como um efeito colateral ou use o modo Base64 se o payload for pequeno.
- **Padrão:** O componente de Upload deve retornar o path/URL da imagem.
- **Performance:** Em listagens (`List`), renderize sempre a versão `thumbnail` da imagem, nunca o arquivo original.

### ⚖️ Moderação & Logs
- **Bulk Actions:** Para moderação em massa, utilize a prop `rowSelection` na Tabela combinada com um botão customizado que dispara `useUpdateMany` (para rejeitar vários) ou `useDeleteMany`.
- **Audit:** Se a operação for crítica (censura/banimento), use o callback `onSuccess` da mutação para disparar um log secundário se o backend não o fizer automaticamente.