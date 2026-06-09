"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminAlertCounts } from "@/app/lib/admin-alerts/admin-alert-types";

type AdminAlertCountsContextValue = {
  counts: AdminAlertCounts;
  adjustSupportCount: (delta: number) => void;
  adjustSuggestionsCount: (delta: number) => void;
};

const AdminAlertCountsContext = createContext<AdminAlertCountsContextValue | null>(
  null,
);

type AdminAlertCountsProviderProps = {
  initialCounts: AdminAlertCounts;
  children: React.ReactNode;
};

export function AdminAlertCountsProvider({
  initialCounts,
  children,
}: AdminAlertCountsProviderProps) {
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts.support, initialCounts.suggestions]);

  const value = useMemo<AdminAlertCountsContextValue>(
    () => ({
      counts,
      adjustSupportCount: (delta) => {
        setCounts((current) => ({
          ...current,
          support: Math.max(0, current.support + delta),
        }));
      },
      adjustSuggestionsCount: (delta) => {
        setCounts((current) => ({
          ...current,
          suggestions: Math.max(0, current.suggestions + delta),
        }));
      },
    }),
    [counts],
  );

  return (
    <AdminAlertCountsContext.Provider value={value}>
      {children}
    </AdminAlertCountsContext.Provider>
  );
}

export function useAdminAlertCounts() {
  const context = useContext(AdminAlertCountsContext);
  if (!context) {
    throw new Error("useAdminAlertCounts must be used within AdminAlertCountsProvider");
  }
  return context;
}
