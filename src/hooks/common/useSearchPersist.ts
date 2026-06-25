"use client";

import { useState } from "react";

export function useSearchPersist<T extends Record<string, unknown>>(storageKey: string, defaults: T) {
  const [filterValues, setFilterValues] = useState<T>(defaults);

  const persist = (_query: string, next: T) => {
    setFilterValues(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  return { filterValues, persist };
}
