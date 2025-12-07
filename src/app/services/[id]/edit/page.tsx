"use client";

import { DeleteButton } from "@/components/refine-ui/buttons"; // Reutilizando seu botão existente
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importando componentes do Select
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@refinedev/react-hook-form";

export default function ServiceEdit() {
  const {
    refineCore: { query, onFinish, id }, // Extraímos o 'id' aqui para usar no botão de delete
    ...form
  } = useForm();

  const record = query?.data?.data;

  return (
    <EditView>
      <EditViewHeader title={`Editando ${record?.name || "Serviço"}`} />
      <Card>
        <CardHeader>
          <CardTitle>Dados do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFinish)}
              className="grid gap-4"
            >
              {/* STATUS */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho (Draft)</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NOME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do serviço" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIÇÃO */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do serviço"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AÇÕES (DELETE E SALVAR) */}
              <div className="flex justify-between items-center pt-4 border-t mt-2">

                {/* Botão de Exclusão (Lado Esquerdo - Perigo) */}
                <DeleteButton
                  recordItemId={id}
                  resource="services"
                  confirmTitle="Excluir Serviço?"
                  confirmOkText="Sim, excluir"
                  confirmCancelText="Cancelar"
                // O redirect é automático para a lista se o 'resource' estiver configurado
                />

                {/* Botão Salvar (Lado Direito - Ação Primária) */}
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </EditView>
  );
}
