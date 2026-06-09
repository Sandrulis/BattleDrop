"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CookieConsentFab } from "@/app/components/cookie-consent-fab";
import { CookieConsentPopup } from "@/app/components/cookie-consent-popup";
import { applyCookiePreferences } from "@/app/lib/cookie-consent/apply-cookie-preferences";
import { DEFAULT_COOKIE_PREFERENCES } from "@/app/lib/cookie-consent/cookie-consent-types";
import {
  getCookiePreferences,
  hasCookieConsentBeenSeen,
  setCookiePreferences,
} from "@/app/lib/cookie-consent/cookie-consent-storage";
import type { CookiePreferences } from "@/app/lib/cookie-consent/cookie-consent-types";

type CookieConsentContextValue = {
  openCookiePopup: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

type CookieConsentProviderProps = {
  cookieContent: string | null;
  showPrivacyLink: boolean;
  children: React.ReactNode;
};

export function CookieConsentProvider({
  cookieContent,
  showPrivacyLink,
  children,
}: CookieConsentProviderProps) {
  const [open, setOpen] = useState(false);
  const [requireChoice, setRequireChoice] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(
    DEFAULT_COOKIE_PREFERENCES,
  );
  const consentCheckedRef = useRef(false);

  useEffect(() => {
    const stored = getCookiePreferences();
    if (stored) {
      applyCookiePreferences(stored);
    }
  }, []);

  useEffect(() => {
    if (!cookieContent || consentCheckedRef.current) return;

    consentCheckedRef.current = true;

    if (!hasCookieConsentBeenSeen()) {
      queueMicrotask(() => {
        setRequireChoice(true);
        setOpen(true);
      });
    }
  }, [cookieContent]);

  const openCookiePopup = useCallback(() => {
    if (!cookieContent) return;

    const stored = getCookiePreferences();
    setPreferences(stored ?? DEFAULT_COOKIE_PREFERENCES);
    setRequireChoice(!hasCookieConsentBeenSeen());
    setOpen(true);
  }, [cookieContent]);

  const closeCookiePopup = useCallback(() => {
    setOpen(false);
    setRequireChoice(false);
  }, []);

  const handleSave = useCallback(
    (nextPreferences: CookiePreferences) => {
      setCookiePreferences(nextPreferences);
      applyCookiePreferences(nextPreferences);
      setPreferences(nextPreferences);
      closeCookiePopup();
    },
    [closeCookiePopup],
  );

  const value = useMemo(
    () => ({
      openCookiePopup,
    }),
    [openCookiePopup],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      <div className="flex min-h-dvh flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
      {cookieContent ? <CookieConsentFab onClick={openCookiePopup} /> : null}
      {cookieContent && open ? (
        <CookieConsentPopup
          key={`${preferences.functional}-${preferences.analytics}-${preferences.marketing}`}
          initialPreferences={preferences}
          showPrivacyLink={showPrivacyLink}
          requireChoice={requireChoice}
          onSave={handleSave}
          onClose={closeCookiePopup}
        />
      ) : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider.");
  }

  return context;
}
