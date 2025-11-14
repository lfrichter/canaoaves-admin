"use client";

import { useForm } from "@refinedev/react-hook-form";
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
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
import { Button } from "@/components/ui/button";

export default function ServiceOfferingEdit() {
  const {
    refineCore: { queryResult, onFinish },
    ...form
  } = useForm();

  const record = queryResult?.data?.data;

  return (
    <EditView>
      <EditViewHeader title={`Editando ${record?.name}`} />
      <Card>
        <CardHeader>
          <CardTitle>Editar Oferta de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFinish)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da oferta de serviço" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Salvar</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </EditView>
  );
}
