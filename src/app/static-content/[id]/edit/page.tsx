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
import { Button } from "@/components/ui/button";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function StaticContentEdit() {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill'), { ssr: false }), []);

  const {
    refineCore: { queryResult, onFinish },
    ...form
  } = useForm();

  const record = queryResult?.data?.data;

  return (
    <EditView>
      <EditViewHeader title={`Editando ${record?.id}`} />
      <Card>
        <CardHeader>
          <CardTitle>Editar Conteúdo Estático</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFinish)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="content_html"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <ReactQuill theme="snow" {...field} />
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
