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
import { useMemo } from "react"; // <--- Importante
import { Control, useWatch } from "react-hook-form";

interface ProfileCategorySelectProps {
  control: Control<any>;
  disabled?: boolean;
  // Nova prop para garantir que sabemos quem é a categoria atual sem depender do getMany
  initialData?: {
    id: string;
    name: string;
  };
}

export const ProfileCategorySelect = ({ control, disabled, initialData }: ProfileCategorySelectProps) => {
  const profileType = useWatch({
    control,
    name: "profile_type",
  });

  const { options, query } = useSelect({
    resource: "categories",
    optionLabel: "name",
    optionValue: "id",
    pagination: { pageSize: 100 },
    // REMOVIDO: defaultValue (causava o erro getMany)
    filters: [
      {
        field: "type",
        operator: "eq",
        value: profileType || "pessoa",
      },
    ],
    queryOptions: {
      enabled: !!profileType,
    },
  });

  // Mágica para garantir que a opção atual sempre exista na lista
  const finalOptions = useMemo(() => {
    const currentOptions = options || [];

    // Se temos dados iniciais e eles NÃO estão na lista carregada...
    if (initialData?.id && !currentOptions.find(o => String(o.value) === String(initialData.id))) {
      // ...adicionamos manualmente no topo da lista
      return [
        { label: initialData.name, value: initialData.id },
        ...currentOptions
      ];
    }

    return currentOptions;
  }, [options, initialData]);

  const isLoading = query.isLoading;

  return (
    <FormField
      control={control}
      name="category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoria</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value ? String(field.value) : undefined}
            disabled={disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione..."} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {finalOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
