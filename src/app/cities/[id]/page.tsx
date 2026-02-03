"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation, useList } from "@refinedev/core";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
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

// Schema de Validação
const CityDescriptionEditSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  city_id: z.string(),
});

// --- COMPONENTE INTERNO DO FORMULÁRIO ---
function CityDescriptionEditForm({ descriptionRecord }: { descriptionRecord: any }) {
  const { list } = useNavigation();

  const methods = useForm({
    resolver: zodResolver(CityDescriptionEditSchema),
    values: {
      description: descriptionRecord?.description || "",
      city_id: descriptionRecord?.cities?.id || "",
    },
    refineCoreProps: {
      resource: "city_descriptions",
      action: "edit",
      id: descriptionRecord.id, // ID é garantido aqui pelo Wrapper
      redirect: false,
      onMutationSuccess: () => {
        toast.success("Descrição salva com sucesso!");
      },
      onMutationError: (error) => {
        toast.error(`Erro ao salvar: ${error.message}`);
      },
    },
  });

  const {
    refineCore: { onFinish, formLoading }, // Agora seguro para desestruturar
    handleSubmit,
    control,
  } = methods;

  const onSubmit = (data: any) => {
    onFinish({
      description: data.description,
      approved: true,
    });
  };

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
                  selectColumns="id, name, state"
                  optionLabel="name"
                  optionValue="id"
                  renderOption={(item: any) => `${item.name} - ${item.state}`}
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


// --- COMPONENTE WRAPPER (PÁGINA EXPORTADA) ---
export default function CityDescriptionEditPage() {
    const params = useParams();
    const descriptionId = params?.id as string;

    const { data, isLoading } = useList({
      resource: "city_descriptions",
      filters: [
        { field: "id", operator: "eq", value: "ecb5407b-d949-46e4-ae71-d3fbedc4df6e" }
      ],
      meta: {
        select: `
          *,
          cities (id, name, state)
        `
      },
      pagination: { mode: "off" },
    });

    const descriptionRecord = data?.data?.[0];
  
    // 1. Mostra o spinner enquanto carrega
    if (isLoading) {
      return (
          <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      );
    }

    // 2. Mostra mensagem de erro se não encontrar o registro
    if (!descriptionRecord) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Nenhuma descrição encontrada com este ID.</p>
                <Button variant="outline" asChild>
                    <a href="/cities">Voltar para a lista</a>
                </Button>
            </div>
        )
    }

    // 3. Renderiza o formulário apenas quando `descriptionRecord` é válido
    return <CityDescriptionEditForm descriptionRecord={descriptionRecord} />;
}
