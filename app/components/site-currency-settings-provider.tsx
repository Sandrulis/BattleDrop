"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  type CurrencyCode,
} from "@/app/lib/site-settings-types";

const SiteCurrencySettingsContext = createContext<CurrencyCode>(
  DEFAULT_SITE_SETTINGS.defaultCurrency,
);

type SiteCurrencySettingsProviderProps = {
  currency: CurrencyCode;
  children: React.ReactNode;
};

export function SiteCurrencySettingsProvider({
  currency,
  children,
}: SiteCurrencySettingsProviderProps) {
  return (
    <SiteCurrencySettingsContext.Provider value={currency}>
      {children}
    </SiteCurrencySettingsContext.Provider>
  );
}

export function useSiteCurrency() {
  return useContext(SiteCurrencySettingsContext);
}
