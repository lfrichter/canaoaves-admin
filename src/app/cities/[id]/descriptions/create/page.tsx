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
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Schema de Validação
const CityDescriptionSchema = z.object({
  city_id: z.string().min(1, "Selecione uma cidade"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function CityDescriptionContextualCreate() {
  const { data: user } = useGetIdentity<{ id: string }>();
  const router = useRouter();
  const params = useParams();
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
        router.push("/cities");
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
      <div className="w-full max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Nova Descrição para a Cidade</h1>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-3 text-muted-foreground hover:text-foreground"
            >
              <Link href="/cities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para lista de cidades
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="max-w-md">
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground items-center">
                    {city ? `${city.name} - ${city.state}` : "Carregando..."}
                  </div>
                  <input type="hidden" {...methods.register("city_id")} />
                </FormItem>
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
                  {formLoading ? "Salvando..." : "Salvar e Publicar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
