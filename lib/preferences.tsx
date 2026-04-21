"use client";

import { createContext, useContext, useState, useCallback, useSyncExternalStore, type ReactNode } from "react";

// ── Supported currencies ─────────────────────────────────────────
export const CURRENCIES = [
  { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "en-DE" },
  { code: "GBP", label: "British Pound", symbol: "£", locale: "en-GB" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ", locale: "ar-AE" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

// ── Preferences shape ────────────────────────────────────────────
export interface Preferences {
  currency: CurrencyCode;
  defaultAccount: string;
  defaultMember: string;
  sheetsId: string;
  hideValues: boolean;
}

const DEFAULT_PREFS: Preferences = {
  currency: "INR",
  defaultAccount: "",
  defaultMember: "",
  sheetsId: "",
  hideValues: false,
};

const STORAGE_KEY = "expense-tracker-preferences";

function loadPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: Preferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// ── Context ──────────────────────────────────────────────────────
interface PreferencesContextValue {
  prefs: Preferences;
  updatePrefs: (partial: Partial<Preferences>) => void;
  formatCurrency: (value: number) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Hydration-safe: use useSyncExternalStore to detect client
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [prefs, setPrefs] = useState<Preferences>(mounted ? loadPrefs() : DEFAULT_PREFS);

  // On first client render, load from localStorage
  if (mounted && prefs === DEFAULT_PREFS && typeof window !== "undefined") {
    const loaded = loadPrefs();
    if (JSON.stringify(loaded) !== JSON.stringify(DEFAULT_PREFS)) {
      setPrefs(loaded);
    }
  }

  const updatePrefs = useCallback((partial: Partial<Preferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  }, []);

  const formatCurrency = useCallback(
    (value: number) => {
      const curr = CURRENCIES.find((c) => c.code === prefs.currency) ?? CURRENCIES[0];
      return new Intl.NumberFormat(curr.locale, {
        style: "currency",
        currency: curr.code,
        maximumFractionDigits: 0,
      }).format(value);
    },
    [prefs.currency]
  );

  return (
    <PreferencesContext.Provider value={{ prefs, updatePrefs, formatCurrency }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
