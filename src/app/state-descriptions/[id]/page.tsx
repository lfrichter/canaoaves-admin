"use client";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
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
import { useNavigation } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
  const { list } = useNavigation();
  const params = useParams<{ id: string }>();

  const {
    refineCore: { onFinish, formLoading, query },
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
        list("state-descriptions");
      },
      onMutationError: (error) => {
        toast.error("Erro ao atualizar: " + error.message);
      },
    },
  });

  const stateCode = query?.data?.data?.state_code;
  const stateName = stateCode ? brStateNames[stateCode] || stateCode : "";
  const isLoading = formLoading || query?.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Editar Descrição: {stateName}</h1>
        <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => list("state-descriptions")}
              type="button"
              className="-ml-3 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista de descrições
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
