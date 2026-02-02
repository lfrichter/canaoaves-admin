"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
// Cliente Supabase do Browser
import { supabase } from "@/utils/supabase/client";

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
  selectColumns = "*",
  renderOption,
}: AsyncSelectProps) {
  // 'watch' monitora o valor para garantir que o label sempre apareça
  const { control, watch } = useFormContext();
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Busca simples
  const [inputValue, setInputValue] = React.useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Valor atual do formulário
  const currentValue = watch(name);

  React.useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        // 1. ORDEM ALFABÉTICA (A-Z)
        let query = supabase
          .from(resource as any)
          .select(selectColumns)
          .order(optionLabel, { ascending: true })
          .limit(50); // Traz os primeiros 50

        if (debouncedInputValue) {
          query = query.ilike(optionLabel, `%${debouncedInputValue}%`);
        }

        const { data: listData, error } = await query;
        if (error) throw error;

        let finalOptions = listData || [];

        // 2. LÓGICA DE RESGATE (Salva o Label Vazio)
        // Se temos um valor selecionado...
        if (currentValue) {
          // Verifica se ele está na lista (convertendo tudo para String para evitar bug de tipo)
          const isSelectedInList = finalOptions.some(
            (item) => String(item[optionValue]) === String(currentValue)
          );

          // Se NÃO estiver na lista, buscamos ele individualmente no banco
          if (!isSelectedInList) {
            const { data: singleItem } = await supabase
              .from(resource as any)
              .select(selectColumns)
              .eq(optionValue, currentValue)
              .maybeSingle();

            if (singleItem) {
              // Adiciona ele no topo da lista
              finalOptions = [singleItem, ...finalOptions];
            }
          }
        }

        if (isMounted) {
          // Remove duplicatas (pelo ID) para garantir lista limpa
          const unique = Array.from(
            new Map(finalOptions.map((item) => [item[optionValue], item])).values()
          );
          setOptions(unique);
        }
      } catch (err) {
        console.error("Erro AsyncSelect:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOptions();

    return () => { isMounted = false; };
    // Roda novamente se o valor mudar, garantindo o resgate do label
  }, [debouncedInputValue, resource, selectColumns, optionLabel, currentValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // 3. FIX DE TIPO (String vs Number)
        // Garante que encontramos o item mesmo se o banco devolver número e o form for string
        const selectedItem = options.find(
          (item) => String(item[optionValue]) === String(field.value)
        );

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
              defaultValue={String(field.value || "")} // Garante string
              value={String(field.value || "")} // Controlled component
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
                {/* Campo de busca fixo no topo */}
                <div className="p-2 sticky top-0 bg-popover z-10">
                    <input
                      className="w-full border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring bg-background"
                      placeholder="Buscar..."
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                </div>

                {options.length === 0 && !loading && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhum item encontrado
                  </div>
                )}

                {options.map((item) => (
                  <SelectItem key={item[optionValue]} value={String(item[optionValue])}>
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
