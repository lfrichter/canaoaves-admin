"use client";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useOne } from "@refinedev/core";

const CityDescriptionSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function CityDescriptionEdit() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const {
    refineCore: { onFinish, formLoading, queryResult },
    handleSubmit,
    control,
  } = useForm({
    resolver: zodResolver(CityDescriptionSchema),
    refineCoreProps: {
      resource: "city_descriptions",
      action: "edit",
      id: params.id,
      redirect: false,
      onMutationSuccess: () => {
        toast.success("Descrição da cidade atualizada com sucesso!");
        router.push("/city-descriptions");
      },
      onMutationError: (error) => {
        toast.error("Erro ao atualizar: " + error.message);
      },
    },
  });

  const cityId = queryResult?.data?.data?.city_id;

  const { data: cityData } = useOne<{ name: string }>({
    resource: "cities",
    id: cityId,
    queryOptions: {
      enabled: !!cityId,
    },
  });

  const cityName = cityData?.data?.name;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Editar Descrição: {cityName || "Carregando..."}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...{ control, handleSubmit, onFinish }}>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input value={cityName || ""} disabled />
              </FormControl>
            </FormItem>
            
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      placeholder="Escreva a descrição detalhada da cidade..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={formLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {formLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}