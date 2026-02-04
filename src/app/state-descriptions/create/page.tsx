"use client";
import { useGetIdentity, useNavigation } from "@refinedev/core";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Save } from "lucide-react";

const brStateOptions = [
    { label: "Acre", value: "AC" }, { label: "Alagoas", value: "AL" },
    { label: "Amapá", value: "AP" }, { label: "Amazonas", value: "AM" },
    { label: "Bahia", value: "BA" }, { label: "Ceará", value: "CE" },
    { label: "Distrito Federal", value: "DF" }, { label: "Espírito Santo", value: "ES" },
    { label: "Goiás", value: "GO" }, { label: "Maranhão", value: "MA" },
    { label: "Mato Grosso", value: "MT" }, { label: "Mato Grosso do Sul", value: "MS" },
    { label: "Minas Gerais", value: "MG" }, { label: "Pará", value: "PA" },
    { label: "Paraíba", value: "PB" }, { label: "Paraná", value: "PR" },
    { label: "Pernambuco", value: "PE" }, { label: "Piauí", value: "PI" },
    { label: "Rio de Janeiro", value: "RJ" }, { label: "Rio Grande do Norte", value: "RN" },
    { label: "Rio Grande do Sul", value: "RS" }, { label: "Rondônia", value: "RO" },
    { label: "Roraima", value: "RR" }, { label: "Santa Catarina", value: "SC" },
    { label: "São Paulo", value: "SP" }, { label: "Sergipe", value: "SE" },
    { label: "Tocantins", value: "TO" },
];

const StateDescriptionSchema = z.object({
  state_code: z.string().min(2, "Selecione um estado"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
});

export default function StateDescriptionCreate() {
  const { data: user } = useGetIdentity<{ id: string }>();
  const { list } = useNavigation();

  const {
    refineCore: { onFinish, formLoading },
    handleSubmit,
    control,
  } = useForm({
    resolver: zodResolver(StateDescriptionSchema),
    refineCoreProps: {
      resource: "state_descriptions",
      action: "create",
      redirect: false, // Redirect manually after success
      onMutationSuccess: () => {
        toast.success("Descrição do estado criada com sucesso!");
        list("state_descriptions");
      },
      onMutationError: (error) => {
        toast.error("Erro ao criar: " + error.message);
      },
    },
  });

  const onSubmit = (data: any) => {
    onFinish({
      ...data,
      approved: true,
      country_code: "BR",
      submitted_by_user_id: user?.id,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Nova Descrição de Estado</CardTitle>
      </CardHeader>
      <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="state_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brStateOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  {formLoading ? "Salvando..." : "Salvar"}
                </Button>
            </div>
          </form>
      </CardContent>
    </Card>
  );
}