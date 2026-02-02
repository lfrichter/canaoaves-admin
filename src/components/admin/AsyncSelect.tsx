"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
// Ajuste o import conforme seu projeto (src/utils... ou @/utils...)
import { supabase } from "@/utils/supabase/client";

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
// Certifique-se que o hook existe
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
  selectColumns = "*",
  renderOption,
}: AsyncSelectProps) {
  const { control, watch } = useFormContext();
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // --- 1. ESTADO DA BUSCA (Correção do erro TS) ---
  const [inputValue, setInputValue] = React.useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Monitora o valor atual para o "Rescue"
  const currentValue = watch(name);

  React.useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        // --- 2. ORDEM ALFABÉTICA ---
        let query = supabase
          .from(resource as any)
          .select(selectColumns)
          .order(optionLabel, { ascending: true })
          .limit(50);

        // Filtro de busca
        if (debouncedInputValue) {
          query = query.ilike(optionLabel, `%${debouncedInputValue}%`);
        }

        const { data: listData, error } = await query;
        if (error) throw error;

        let finalOptions = listData || [];

        // --- 3. FIX DO BUG DE SELEÇÃO (Lógica de Resgate) ---
        if (currentValue && finalOptions.length > 0) {
          const isSelectedInList = finalOptions.some(
            (item) => item[optionValue] === currentValue
          );

          if (!isSelectedInList) {
            // Se o item selecionado não está na lista (ex: está na pag 2), busca ele
            const { data: singleItem } = await supabase
              .from(resource as any)
              .select(selectColumns)
              .eq(optionValue, currentValue)
              .maybeSingle();

            if (singleItem) {
              finalOptions = [singleItem, ...finalOptions];
            }
          }
        }

        if (isMounted) {
            // Remove duplicatas
            const unique = Array.from(new Map(finalOptions.map(item => [item[optionValue], item])).values());
            setOptions(unique);
        }

      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOptions();

    return () => { isMounted = false; };
  }, [debouncedInputValue, resource, selectColumns, optionLabel, currentValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedItem = options.find((item) => item[optionValue] === field.value);

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
              disabled={loading}
              value={field.value} // Controlled component
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando..." : (placeholder || `Selecione ${label}`)}>
                    {displayLabel}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* --- 4. CAMPO DE BUSCA DENTRO DO SELECT --- */}
                <div className="p-2 sticky top-0 bg-popover z-10">
                    <input
                      className="w-full border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring bg-background"
                      placeholder="Digitar para buscar..."
                      onChange={(e) => setInputValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>

                {options.length === 0 && !loading && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum item encontrado
                  </div>
                )}

                {options.map((item) => (
                  <SelectItem key={item[optionValue]} value={item[optionValue]}>
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
