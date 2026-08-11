"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type Currency = "USD" | "XLM";

interface CurrencyContextValue {
  currency: Currency;
  xlmPrice: number;
  toggleCurrency: () => void;
  /** Convert a USD value to the current display currency */
  convert: (usdValue: number) => number;
  /** Format a USD value in the current display currency */
  format: (usdValue: number) => string;
  /** Format a USD value as a short compact string (e.g. 1.2M, 5.4K) */
  formatCompact: (usdValue: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "soroban-currency-preference";

export function CurrencyProvider({
  children,
  xlmPrice,
}: {
  children: ReactNode;
  xlmPrice: number;
}) {
  const [currency, setCurrency] = useState<Currency>("USD");

  // Restore preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "USD" || stored === "XLM") {
        setCurrency(stored);
      }
    } catch {
      // localStorage may be unavailable (SSR / private browsing)
    }
  }, []);

  // Persist to localStorage when currency changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // silently ignore
    }
  }, [currency]);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === "USD" ? "XLM" : "USD"));
  }, []);

  const convert = useCallback(
    (usdValue: number): number => {
      if (currency === "USD") return usdValue;
      return xlmPrice > 0 ? usdValue / xlmPrice : 0;
    },
    [currency, xlmPrice]
  );

  const format = useCallback(
    (usdValue: number): string => {
      if (currency === "USD") {
        return formatUSD(usdValue);
      }
      const xlmValue = xlmPrice > 0 ? usdValue / xlmPrice : 0;
      return formatXLM(xlmValue);
    },
    [currency, xlmPrice]
  );

  const formatCompact = useCallback(
    (usdValue: number): string => {
      if (currency === "USD") {
        return formatUSDCompact(usdValue);
      }
      const xlmValue = xlmPrice > 0 ? usdValue / xlmPrice : 0;
      return formatXLMCompact(xlmValue);
    },
    [currency, xlmPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, xlmPrice, toggleCurrency, convert, format, formatCompact }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}

// ─── Formatting helpers (exported for direct use in client components) ────

export function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatUSDCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatXLM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M XLM`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K XLM`;
  return `${n.toFixed(0)} XLM`;
}

function formatXLMCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M XLM`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K XLM`;
  return `${n.toFixed(0)} XLM`;
}