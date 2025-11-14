"use client";

import { useForm } from "@refinedev/react-hook-form";
import { CreateView, CreateViewHeader } from "@/components/refine-ui/views/create-view";
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

export default function AmenityCreate() {
  const {
    refineCore: { onFinish },
    ...form
  } = useForm();

  return (
    <CreateView>
      <CreateViewHeader title="Criar Nova Comodidade" />
      <Card>
        <CardHeader>
          <CardTitle>Nova Comodidade</CardTitle>
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
                      <Input placeholder="Nome da comodidade" {...field} />
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
    </CreateView>
  );
}
