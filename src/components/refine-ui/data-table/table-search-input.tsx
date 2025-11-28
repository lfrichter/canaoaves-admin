"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils"; // Importante para mergear classes
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function TableSearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    // Reseta paginação para 1 sempre que busca muda
    if (value !== initialQuery) {
      current.set("currentPage", "1");
    }

    if (debouncedValue) {
      current.set("q", debouncedValue);
    } else {
      current.delete("q");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    if (searchParams.get("q") !== debouncedValue) {
      router.push(`${pathname}${query}`);
    }
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <Input
      placeholder="Buscar..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      // [Ajuste] w-full no mobile, max-w-sm no desktop
      className={cn("w-full md:w-[250px] lg:w-[300px]", className)}
    />
  );
}
