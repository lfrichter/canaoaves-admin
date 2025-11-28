"use client";

import { useOne, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { ArrowLeft, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category, Profile } from "@/types/app";

type FormValues = Profile & { email?: string };

export default function ProfileEdit({ params }: { params: { id: string } }) {
  const router = useRouter();

  const { query } = useOne<Profile>({
    resource: "profiles",
    id: params.id,
    meta: {
      select: "*, user:users(email)",
    },
  });

  const { data: profileData, isLoading } = query;

  const form = useForm<FormValues>({
    refineCoreProps: {
      resource: "profiles",
      action: "edit",
      id: params.id,
    },
  });

  const {
    refineCore: { formLoading },
    saveButtonProps,
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = form;

  const formData = profileData?.data;

  // Observa TODO o formulário para o debug
  const formValues = watch();

  // Observa o tipo para filtrar categorias
  const watchedProfileType = watch("profile_type");

  // Sincronização Forçada
  useEffect(() => {
    if (formData) {
      reset({
        ...formData,
        // Conversões de segurança
        score: Number(formData.score || 0),
        description: formData.description || "",
        category_id: formData.category_id || "",
        app_role: formData.app_role || "user",
        // Campos Read-Only
        user_id: formData.user_id || "",
        registration_number: formData.registration_number || "",
        // Mapeamento de E-mail
        email: (formData as any).user?.email || "",
      });
    }
  }, [formData, reset]);

  const { options: categoryOptions } = useSelect<Category>({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 100,
    },
    filters: [
      {
        field: "type",
        operator: "eq",
        value: watchedProfileType || "pessoa",
      },
    ],
  });

  const roleOptions = [
    { label: "Admin (Moderador)", value: "admin" },
    { label: "Master (Super Admin)", value: "master" },
    { label: "User (Público)", value: "user" },
  ];

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Auditoria de Perfil
            </h1>
            <p className="text-muted-foreground">
              {formValues.full_name || "Carregando..."}
            </p>
          </div>
        </div>
        <Button {...saveButtonProps} disabled={formLoading}>
          <SaveIcon className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit((data) => {
                return saveButtonProps.onClick?.(data as any);
              })}
              className="space-y-8"
            >
              {/* SEÇÃO 1: DADOS CRÍTICOS (READ-ONLY) */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-md border">
                <h3 className="font-semibold text-sm uppercase tracking-wider border-b pb-2">
                  Identificadores do Sistema (Não Editáveis)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* USER ID */}
                  <FormField
                    control={control}
                    name="user_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Usuário (Auth)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-muted font-mono text-xs"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* --- NOVO CAMPO: EMAIL --- */}
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail de Acesso</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            readOnly
                            className="bg-muted text-muted-foreground"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* REGISTRATION NUMBER */}
                  <FormField
                    control={control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Registro</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            readOnly
                            className="bg-muted"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pontuação (Score)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SEÇÃO 2: PERMISSÕES */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Permissões de Acesso</h3>
                <div className="p-4 border border-red-100 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <FormField
                    control={control}
                    name="app_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                          APP ROLE (Nível de Acesso)
                        </FormLabel>
                        <Select
                          key={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Selecione a permissão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage>{String(errors.app_role?.message || "")}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SEÇÃO 3: DADOS PESSOAIS */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dados Cadastrais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <FormField
                    control={control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="public_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identidade Pública (Apelido)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento (CPF/CNPJ)</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          key={`${field.value}-${categoryOptions?.length}`}
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoryOptions?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição / Biografia</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* BOTÃO INFERIOR DE SALVAR */}
              <div className="flex justify-end pt-4 border-t mt-6">
                <Button type="submit" disabled={formLoading} size="lg">
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>

        </CardContent>
      </Card>
    </div>
  );
}
