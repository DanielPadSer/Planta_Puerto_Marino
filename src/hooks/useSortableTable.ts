import { useMemo, useState } from "react";
export function useSortableTable<T>(rows: readonly T[], initial: keyof T) {
  const [sort, setSort] = useState<{ key: keyof T; asc: boolean }>({ key: initial, asc: true });
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const av = a[sort.key],
          bv = b[sort.key];
        const result =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), "es", { numeric: true });
        return sort.asc ? result : -result;
      }),
    [rows, sort],
  );
  const toggle = (key: keyof T) => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }));
  return { rows: sorted, sort, toggle };
}
