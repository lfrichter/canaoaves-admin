"use client";
import { useGetIdentity, useOne } from "@refinedev/core";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useParams } from "next/navigation";

const brStateNames: { [key: string]: string } = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

const StateDescriptionSchema = z.object({
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function StateDescriptionEdit() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity<{ id: string }>();

  const {
    refineCore: { onFinish, formLoading, queryResult },
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(StateDescriptionSchema),
    refineCoreProps: {
      resource: "state_descriptions",
      action: "edit",
      id: params.id,
      redirect: false,
      onMutationSuccess: () => {
        toast.success("Descrição do estado atualizada com sucesso!");
        router.push("/state-descriptions");
      },
      onMutationError: (error) => {
        toast.error("Erro ao atualizar: " + error.message);
      },
    },
  });

  const stateCode = queryResult?.data?.data?.state_code;
  const stateName = stateCode ? brStateNames[stateCode] || stateCode : "";

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Editar Descrição: {stateName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...{ control, errors, handleSubmit, onSubmit: onFinish }}>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input value={stateName} disabled />
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
                      placeholder="Escreva a descrição detalhada do estado..."
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
