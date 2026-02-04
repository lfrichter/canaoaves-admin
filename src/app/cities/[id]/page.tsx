"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { z } from "zod";

// Componentes de UI
import { AsyncSelect } from "@/components/admin/AsyncSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect } from "react";

// Schema de Validação
const CityDescriptionEditSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  city_id: z.string(),
});

export default function CityDescriptionEditPage() {
  const { list } = useNavigation();
  const params = useParams();
  const descriptionId = params?.id as string;

  const methods = useForm({
    resolver: zodResolver(CityDescriptionEditSchema),
    refineCoreProps: {
      resource: "city_descriptions",
      action: "edit",
      id: descriptionId,
      redirect: false,
    },
  });

  const {
    refineCore: { query, onFinish, formLoading },
    handleSubmit,
    control,
    saveButtonProps,
    reset,
    setValue, // <--- Importante: Precisamos do setValue para o "reforço"
  } = methods;

  useEffect(() => {
    const record = query?.data?.data;

    if (record) {
      // 1. Reset Inicial (Preenche o formulário assim que os dados chegam)
      reset({
        description: record.description,
        city_id: record.city_id,
      });

      // 2. Reforço com Delay (Correção do Dropdown)
      // Às vezes o AsyncSelect não detecta o reset inicial se estiver renderizando.
      // Forçamos o valor novamente após 500ms para garantir que a busca do Label dispare.
      const timer = setTimeout(() => {
        setValue("city_id", record.city_id, {
            shouldValidate: true,
            shouldDirty: false // Não marca como "modificado" pelo usuário
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [query?.data?.data, reset, setValue]);


  const onSubmit = (data: any) => {
    onFinish({
      description: data.description,
      approved: true,
    } as any);
  };

  const isLoading = formLoading || query?.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Se o carregamento terminou mas não temos dados (erro ou ID inválido)
  if (!query?.data?.data) {
     return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <p className="text-muted-foreground">Nenhuma descrição encontrada com este ID.</p>
            <Button variant="outline" asChild>
                <Link href="/cities">Voltar para a lista</Link>
            </Button>
        </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Editar Descrição da Cidade</h1>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => list("cities")}
              type="button"
              className="-ml-3 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de cidades
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="max-w-md">
                <AsyncSelect
                  name="city_id"
                  label="Cidade"
                  resource="cities"
                  optionLabel="name"
                  optionValue="id"
                  selectColumns="id, name, state"
                  renderOption={(item: any) => `${item.name} - ${item.state}`}
                  // Desabilitado pois estamos editando a descrição de uma cidade específica
                  disabled={true}
                />
              </div>

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[250px] text-base leading-relaxed resize-y"
                        placeholder="Escreva a descrição detalhada da cidade aqui..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={formLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {formLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
