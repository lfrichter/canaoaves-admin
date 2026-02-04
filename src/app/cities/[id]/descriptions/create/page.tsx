"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useGetIdentity, useOne } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Save, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useEffect } from "react";
import Link from "next/link";

// Componentes de UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Componente Customizado
// import { AsyncSelect } from "@/components/admin/AsyncSelect";

// Schema de Validação (Reaproveitado do genérico, idealmente deveria ser compartilhado)
const CityDescriptionSchema = z.object({
  city_id: z.string().min(1, "Selecione uma cidade"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function CityDescriptionContextualCreate() {
  const { data: user } = useGetIdentity<{ id: string }>();
  const router = useRouter();
  const params = useParams();
  // Using 'id' because the folder is [id] which corresponds to cityId in this context
  const cityId = params?.id as string;

  // Configuração do Formulário
  const methods = useForm({
    resolver: zodResolver(CityDescriptionSchema),
    refineCoreProps: {
      resource: "city_descriptions",
      action: "create",
      redirect: false,
      onMutationSuccess: () => {
        toast.success("Descrição da cidade criada com sucesso!");
        // Redireciona de volta para a página da cidade (ou lista de descrições daquela cidade)
        router.push(`/cities/${cityId}`);
      },
      onMutationError: (error) => {
        toast.error("Erro ao criar: " + error.message);
      },
    },
  });

  const {
    refineCore: { onFinish, formLoading },
    handleSubmit,
    control,
    setValue,
  } = methods;

  // Busca os dados da cidade para exibição
  const { query: cityQuery } = useOne({
    resource: "cities",
    id: cityId,
    queryOptions: {
      enabled: !!cityId,
    },
  });
  const { data: cityData } = cityQuery;
  const city = cityData?.data;

  // Pré-preenche o city_id vindo da URL
  useEffect(() => {
    if (cityId) {
      setValue("city_id", cityId);
    }
  }, [cityId, setValue]);

  const onSubmit = (data: any) => {
    onFinish({
      ...data,
      approved: true,
      submitted_by_user_id: user?.id,
    });
  };

  return (
    <FormProvider {...methods}>
      <Card className="max-w-5xl mx-auto mt-8">
        <CardHeader>
           <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/cities">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <CardTitle>Nova Descrição para a Cidade</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="max-w-md">
                 <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground items-center">
                      {city ? `${city.name} - ${city.state}` : "Carregando..."}
                    </div>
                    {/* Input hidden para garantir que o valor esteja no form */}
                    <input type="hidden" {...methods.register("city_id")} />
                 </FormItem>
              </div>
            </div>

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={15}
                      className="min-h-[300px] text-base leading-relaxed p-4"
                      placeholder="Escreva a descrição detalhada da cidade aqui..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={formLoading} size="lg">
                <Save className="mr-2 h-5 w-5" />
                {formLoading ? "Salvando..." : "Salvar e Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
