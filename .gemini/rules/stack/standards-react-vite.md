---
name: standards-react-vite
description: Este é o "livro de leis" para o seu agente `react-coder`.
filename: .gemini/rules/coding-style.md
---
# Coding Style & Architecture Rules

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, React Hook Form + Zod.

## 1. Princípios Gerais
- **Clean Architecture:**
  - **UI (Components):** Burros. Apenas recebem dados e emitem eventos.
  - **Hooks (Use Cases):** Contêm a regra de negócio e estado.
  - **Services/Actions:** Fazem a comunicação com APIs/Banco de dados.
- **DRY (Don't Repeat Yourself):** Extraia lógica repetida para hooks utilitários.
- **KISS (Keep It Simple, Stupid):** Prefira código legível a código "inteligente".

## 2. TypeScript
- **Strict Mode:** Sempre ativo.
- **Sem `any`:** Nunca use `any`. Use `unknown` se necessário, mas prefira tipar corretamente.
- **Interfaces:** Use `interface` para definir props e modelos de dados.
- **Nomes:**
  - Componentes: `PascalCase` (ex: `UserProfile.tsx`)
  - Funções/Hooks: `camelCase` (ex: `useAuth.ts`)
  - Tipos/Interfaces: `PascalCase` (ex: `UserResponse`)

## 3. React & Vite (SPA)
- **Rendering:** Tudo é Client-Side. Cuidado com o tamanho do bundle.
- **Code Splitting:** Use `React.lazy` e `Suspense` para rotas pesadas ou modais.
- **Imagens:** Imagens estáticas ficam em `/public`. Imports de assets via `import img from './assets/...'`.

## 4\. Estilização (Tailwind)

  - **Utilitários Primeiro:** Use classes utilitárias para tudo.
  - **Condicionais:** Use `cn()` (lib `clsx` + `tailwind-merge`) para classes condicionais.
    ```tsx
    // Padrão Shadcn
    <div className={cn("bg-red-500", isActive && "bg-blue-500")} />
    ```
  - **Ordenação:** Agrupe classes por propósito (Layout -\> Box Model -\> Tipografia -\> Visual).

## 5. Gerenciamento de Estado e Forms
- **Forms:** Continue usando `react-hook-form` + `zod`.
- **API Layer:** Centralize chamadas de API em `src/services/api.ts` ou `src/infra/http/`.

## 6\. Estrutura de Diretórios (Feature-based)

```
scripts/               # script úteis (extra)
src/
  assets/              # images, videos
  components/
    ui/                # Shadcn primitivos (Button, Input)
	auth/
        LoginForm.tsx
  hooks/               # Custom hooks globais
  lib/                 # Utilitários (utils.ts)
  pages/
  types/
```

## 7\.  Database & Migrations Rules 💾
1.  **Imutabilidade:** NUNCA altere um arquivo de migração que já foi commitado/rodado.
2.  **Evolução:** Se precisar adicionar uma coluna (`logo_path`, `contact_email`), crie SEMPRE uma nova migração com timestamp atual.
3.  **Integridade:** Use Soft Deletes (`deleted_at`) por padrão para entidades críticas (Users, Orders).
