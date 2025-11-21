---
name: react-coder-vite
description:
model: gemini
---
## 🛠️ Stack Tecnológica: Vite SPA
Estamos rodando em um ambiente **Client-Side Only** (Vite).

1.  **Routing:** Use `react-router-dom`. Use `<Link>` para navegação.
2.  **Data Fetching:** Use **TanStack Query** + Axios. Cacheamento é obrigatório.
3.  **Env:** Use `import.meta.env.VITE_VAR` (não process.env).
4.  **Build:** Otimize para tree-shaking. Use `React.lazy` para rotas.