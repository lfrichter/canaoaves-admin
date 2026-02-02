"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { supabase } from "@utils/supabase/client";

import { cn } from "@/lib/utils";
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
import { useDebounce } from "@/hooks/use-debounce";

interface AsyncSelectProps {
  name: string;
  label: string;
  resource: string;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  selectColumns?: string;
  renderOption?: (item: any) => React.ReactNode;
}

export function AsyncSelect({
  name,
  label,
  resource,
  optionLabel = "name",
  optionValue = "id",
  placeholder,
  selectColumns = "*", // Tenta buscar colunas extras se o RLS permitir
  renderOption,
}: AsyncSelectProps) {
  const { control } = useFormContext();
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Efeito simplificado para carregar dados ao montar
  React.useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Busca direta segura
        const { data, error } = await supabase
          .from(resource as any)
          .select(selectColumns)
          .order(optionLabel, { ascending: true })
          .limit(100); // Limite seguro

        if (!error && data) {
          setOptions(data);
        } else {
          console.log("AsyncSelect (Silencioso):", error?.message);
        }
      } catch (err) {
        // Ignora erros críticos para não travar a tela
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [resource, selectColumns]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Encontra o item para mostrar no label fechado
        const selectedItem = options.find((item) => item[optionValue] === field.value);

        // Define o texto de exibição
        const displayLabel = selectedItem
            ? (renderOption && typeof renderOption(selectedItem) === 'string'
                ? renderOption(selectedItem)
                : selectedItem[optionLabel])
            : undefined;

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              // Se estiver carregando, desabilita visualmente mas não trava
              disabled={loading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando..." : (placeholder || `Selecione ${label}`)}>
                    {displayLabel}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* Fallback se estiver vazio */}
                {options.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {loading ? "Carregando..." : "Nenhum item disponível"}
                  </div>
                )}

                {/* Lista de Opções */}
                {options.map((item) => (
                  <SelectItem key={item[optionValue]} value={item[optionValue]}>
                    {/* Renderiza com UF se a função for passada, ou só o nome */}
                    {renderOption ? renderOption(item) : item[optionLabel]}
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
}
