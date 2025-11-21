---
name: ui-refine-shadcn
description:
how-to-use: "@{context/stack/ui-refine-shadcn.md}"
---
# 💅 Style Guide: Refine + Shadcn UI (Headless Implementation)

**Contexto:** Utilizamos a lógica de negócio do **Refine** (Headless) renderizada através de componentes **Shadcn UI** (baseados em Radix + Tailwind).

**Princípio Fundamental:** O Refine gerencia o *Estado* (Loading, Data, Auth), o Shadcn gerencia a *Apresentação*.

## 1. Formulários (React Hook Form Adapter)
O Refine integra nativamente com `react-hook-form`. O Shadcn UI constrói formulários sobre essa mesma lib.

- **Hook:** Use `useForm` de `@refinedev/react-hook-form`.
- **Componentes:** Use o padrão composto do Shadcn: `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`.

### Exemplo de Integração:
```tsx
import { useForm } from "@refinedev/react-hook-form";
import { Form, FormField, ... } from "@/components/ui/form";

export const PostCreate = () => {
  const form = useForm({ /* refine configs */ });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(form.onFinish)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};
````

## 2\. Tabelas (TanStack Table Adapter)

Para listagens, usamos o adaptador do Refine para TanStack Table, renderizando com os componentes de Tabela do Shadcn.

  - **Hook:** Use `useTable` de `@refinedev/react-table`.
  - **Componentes:** `<Table>`, `<TableHeader>`, `<TableRow>`, `<TableCell>` de `@/components/ui/table`.
  - **Paginação:** Use os componentes de `<Button variant="outline">` para Próximo/Anterior, controlados pelo estado `table.getState().pagination`.

## 3\. Notificações e Feedback

O Refine precisa de um `notificationProvider` configurado no `<Refine>`.

  - **Lib:** Use **Sonner** (`sonner`) ou **Toaster** (`lucide-react`).
  - **Integração:** Crie um provider que mapeia os métodos `open`, `close` do Refine para o `toast.success()` ou `toast.error()` do Shadcn.

## 4\. Modais e Dialogs

Para ações como "Delete" ou "Edit" em modal.

  - **Hook:** Use `useModal` (do pacote `@refinedev/core`) para controlar `open/close`.
  - **Componente:** Use `<Dialog>` ou `<Sheet>` (Sheet é ótimo para filtros ou edições laterais no Admin).

## 5\. Botões de Ação Refine

Como não temos os botões prontos do pacote `@refinedev/antd`, criamos nossos próprios wrappers visuais:

  - **Delete Button:**

      - Use `<AlertDialog>` do Shadcn.
      - Trigger: `<Button variant="destructive" size="icon"><Trash2 /></Button>`.
      - Action: Chama a mutation `delete` do hook `useDelete` do Refine.

  - **Edit Button:**

      - Use `<Button variant="ghost" size="icon"><Edit /></Button>` envelopado no componente `<Link>` (ou `go` do hook de navegação) para a rota de edição.

## 6\. Layout e Estrutura Admin

Como o Shadcn não fornece um "AdminLayout" pronto:

  - **Sidebar:** Crie um componente fixo à esquerda usando `h-screen`, `w-64`, `border-r`.
  - **Menu:** Itere sobre `useMenu()` do Refine para renderizar os links da sidebar.
  - **Active State:** Use a prop `selectedKey` do `useMenu` para aplicar a classe `bg-secondary/50` no item ativo da sidebar.

## 7\. Cores e Tokens (Admin Specific)

Admin panels exigem densidade e clareza.

  - **Headers de Tabela:** Use `text-muted-foreground` e `text-xs uppercase`.
  - **Bordas:** Use `border-border` para separar linhas da tabela.
  - **Zebra Striping:** Opcional, mas pode usar `even:bg-muted/50` nas `TableRow` para facilitar leitura de dados densos.

<!-- end list -->
