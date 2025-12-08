"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { CircleXIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function TableSearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Lógica de Loading:
  // Verdadeiro se o valor digitado difere do processado (debounce)
  // OU se o valor processado difere da URL (navegação ocorrendo)
  const isLoading =
    inputValue !== debouncedInputValue ||
    (debouncedInputValue !== urlQuery && inputValue !== "");

  // Sincroniza URL com o valor debounced
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedInputValue !== urlQuery) {
      params.set("currentPage", "1");
    }

    if (debouncedInputValue) {
      params.set("q", debouncedInputValue);
    } else {
      params.delete("q");
    }

    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedInputValue, urlQuery, searchParams, pathname, router]);

  // Sincroniza o input se a URL mudar externamente
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  // Função para limpar o input
  const handleClearInput = () => {
    setInputValue(""); // O useEffect do debounce cuidará de limpar a URL
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative w-full md:w-[250px] lg:w-[300px]", className)}>
      {/* Ícone de Busca (Esquerda) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground">
        <SearchIcon className="size-4" />
      </div>

      <Input
        ref={inputRef}
        placeholder="Buscar..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        // Adicionamos pr-9 para dar espaço para o ícone da direita
        className="peer pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
      />

      {/* Área da Direita: Loader OU Botão Limpar */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center pr-2">
            <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : inputValue ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={handleClearInput}
          >
            <CircleXIcon className="size-4" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
