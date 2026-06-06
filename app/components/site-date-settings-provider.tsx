"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_SITE_SETTINGS,
  type SiteDateTimeSettings,
} from "@/app/lib/site-settings-types";

const SiteDateSettingsContext = createContext<SiteDateTimeSettings>({
  dateFormat: DEFAULT_SITE_SETTINGS.dateFormat,
  timeFormat: DEFAULT_SITE_SETTINGS.timeFormat,
  dateSeparator: DEFAULT_SITE_SETTINGS.dateSeparator,
});

type SiteDateSettingsProviderProps = {
  settings: SiteDateTimeSettings;
  children: React.ReactNode;
};

export function SiteDateSettingsProvider({
  settings,
  children,
}: SiteDateSettingsProviderProps) {
  return (
    <SiteDateSettingsContext.Provider value={settings}>
      {children}
    </SiteDateSettingsContext.Provider>
  );
}

export function useSiteDateSettings() {
  return useContext(SiteDateSettingsContext);
}
