"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function TableSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (debouncedValue) {
      current.set("q", debouncedValue);
    } else {
      current.delete("q");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    // Only push if the query has changed
    if (searchParams.get("q") || debouncedValue) {
      router.push(`${pathname}${query}`);
    }
  }, [debouncedValue, pathname, router, searchParams]);

  return (
    <Input
      placeholder="Buscar por nome..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="max-w-sm"
    />
  );
}
