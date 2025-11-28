"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function TableSearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The source of truth for the query is the URL
  const urlQuery = searchParams.get("q") || "";

  // The input field has its own state
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedInputValue = useDebounce(inputValue, 500);

  // This effect syncs the URL with the debounced input value
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // If the search query has changed, reset to page 1
    if (debouncedInputValue !== urlQuery) {
      params.set("currentPage", "1");
    }

    // Set or remove the 'q' parameter
    if (debouncedInputValue) {
      params.set("q", debouncedInputValue);
    } else {
      params.delete("q");
    }

    // Only push to router if the params have actually changed
    if (params.toString() !== searchParams.toString()) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedInputValue, urlQuery, searchParams, pathname, router]);


  // This effect syncs the input value with the URL
  // (e.g., when the user clicks the back/forward buttons)
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);


  return (
    <Input
      placeholder="Buscar..."
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className={cn("w-full md:w-[250px] lg:w-[300px]", className)}
    />
  );
}