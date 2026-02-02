"use client";
import { useGetIdentity } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import React from "react";
import { AsyncSelect } from "@/components/admin/AsyncSelect";

const CityDescriptionSchema = z.object({
  city_id: z.string().min(1, "Selecione uma cidade"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function CityDescriptionCreate() {
  const { data: user } = useGetIdentity<{ id: string }>();
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(CityDescriptionSchema),
    refineCoreProps: {
      resource: "city_descriptions",
      action: "create",
      redirect: false,
      onMutationSuccess: () => {
        toast.success("Descrição da cidade criada com sucesso!");
        router.push("/city-descriptions");
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
  } = methods;

  const onSubmit = (data: any) => {
    onFinish({
      ...data,
      approved: true,
      submitted_by_user_id: user?.id,
    });
  };

  return (
    <FormProvider {...methods}>
      {/* ALTERAÇÃO: Mudado de max-w-2xl para max-w-5xl para ficar bem largo no desktop */}
      <Card className="max-w-5xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Nova Descrição de Cidade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Coloquei o select num grid para ele não ficar esticado demais na tela larga */}
               <div className="max-w-md">
                 <AsyncSelect
                    name="city_id"
                    label="Cidade"
                    resource="cities"
                    meta={{
                        select: "id, name, state"
                    }}
                    renderOption={(item) => `${item.name} - ${item.state}`}
                    optionLabel="name"
                 />
               </div>
            </div>

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    {/* ALTERAÇÃO: Aumentado rows para 15 e adicionado min-height */}
                    <Textarea
                      {...field}
                      rows={15}
                      className="min-h-[300px] text-base leading-relaxed p-4"
                      placeholder="Escreva a descrição detalhada da cidade aqui. Use parágrafos claros..."
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
