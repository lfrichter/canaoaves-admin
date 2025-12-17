"use client";

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
import { useSelect } from "@refinedev/core";
import { keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { Control, useWatch } from "react-hook-form";

interface ProfileCategorySelectProps {
  control: Control<any>;
  disabled?: boolean;
  initialData?: {
    id: string;
    name: string;
  };
  defaultProfileType?: string;
}

export const ProfileCategorySelect = ({
  control,
  disabled,
  initialData,
  defaultProfileType
}: ProfileCategorySelectProps) => {

  const watchedType = useWatch({
    control,
    name: "profile_type",
  });

  // 1. Define o tipo ativo
  const activeType = watchedType || defaultProfileType || "pessoa";

  const { options, query } = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
    // Ela dispara o 'getMany' que não existe no seu Data Provider.
    defaultValue: initialData?.id,
    filters: [
      {
        field: "type",
        operator: "eq",
        value: activeType,
      },
    ],
    queryOptions: {
      enabled: !!activeType,
      placeholderData: keepPreviousData,
    },
  });

  // 2. Construção da lista final com Fallback de Segurança
  const finalOptions = useMemo(() => {
    const currentOptions = options || [];

    // Se temos initialData, garantimos que ele esteja na lista na força bruta.
    // Isso resolve o problema visual se a API demorar.
    if (initialData?.id && initialData.name) {
      const exists = currentOptions.some(o => String(o.value) === String(initialData.id));
      if (!exists) {
        return [
          { label: initialData.name, value: String(initialData.id) },
          ...currentOptions
        ];
      }
    }
    return currentOptions;
  }, [options, initialData]);

  const isLoading = query.isLoading && finalOptions.length === 0;

  return (
    <FormField
      control={control}
      name="category_id"
      render={({ field }) => {
        // [TRUQUE DO RADIX UI]:
        // Criamos uma key que muda quando as opções são carregadas.
        // Isso força o componente Select a "piscar" (remontar) quando os dados chegam,
        // garantindo que ele recalcule qual Label exibir para o Value selecionado.
        // Se initialData existe, usamos ele como base para a key inicial.
        const reRenderKey = `select-${activeType}-${finalOptions.length}-${field.value}`;

        return (
          <FormItem>
            <FormLabel>Categoria ({activeType})</FormLabel>
            <Select
              // Key dinâmica para forçar atualização visual quando os dados chegam
              key={reRenderKey}

              onValueChange={field.onChange}
              value={field.value ? String(field.value) : undefined}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {finalOptions.map((opt) => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
