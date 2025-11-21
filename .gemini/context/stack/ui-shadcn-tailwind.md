---
name: ui-shadcn-tailwind
description:
how-to-use: "@{context/stack/ui-shadcn-tailwind.md}"
---
# 💅 Style Guide: Shadcn UI + Tailwind CSS

**Regra de Ouro:** Não use valores arbitrários (magic numbers) ou cores hexadecimais (`#FFF`). Use os Tokens Semânticos.

## 1. Cores Semânticas (Theme Tokens)
Use as classes do Tailwind que mapeiam para as variáveis CSS do tema:

| Token | Uso Correto |
| :--- | :--- |
| `bg-background` | Fundo da página ou cartões. |
| `text-foreground` | Texto principal. |
| `bg-primary` / `text-primary-foreground` | Ação principal (Botões, CTAs). |
| `bg-muted` / `text-muted-foreground` | Elementos secundários, fundos sutis, texto de apoio. |
| `bg-destructive` | Ações de erro ou exclusão. |
| `border-border` | Bordas de inputs e divisores. |

## 2. Espaçamento e Layout
- **Container:** Use `container mx-auto px-4` para envolver conteúdo.
- **Spacing Scale:** Use múltiplos de 4 (`p-4`, `m-8`, `gap-2`).
- **Flexbox/Grid:** Prefira `flex gap-x` ao invés de `margin-right` nos filhos.

## 3. Componentes Primitivos (Shadcn)
Sempre importe de `@/components/ui/...`:
- **Botões:** `<Button variant="default | outline | ghost">`
- **Cartões:** `<Card><CardHeader><CardContent>...</Card>`
- **Inputs:** `<Input>`, `<Select>`, `<Checkbox>`.

## 4. Tipografia
- **H1:** `text-3xl font-bold tracking-tight`
- **H2:** `text-xl font-semibold`
- **Body:** `text-base text-foreground`
- **Small:** `text-sm text-muted-foreground`

## 5. Ícones
- Use biblioteca **Lucide React**.
- Padrão: `<IconName className="h-4 w-4 mr-2" />` (dentro de botões).
