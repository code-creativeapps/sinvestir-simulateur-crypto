"use client";

import { useEffect, useMemo, useState } from "react";
import { runBacktest, type PricePoint, type BacktestResult } from "@/lib/backtest";
import type { Scenario } from "@/lib/scenario-url";

interface State {
  prices: PricePoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches the coin's price history (only when coin/dates change) and recomputes
 * the backtest in memory on every scenario change.
 */
export function useBacktest(scenario: Scenario): {
  result: BacktestResult | null;
  loading: boolean;
  error: string | null;
  firstDataDate: string | null;
} {
  const { coin, from, to, amount, frequency } = scenario;
  const [state, setState] = useState<State>({
    prices: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(
          `/api/history?id=${encodeURIComponent(coin.id)}&from=${from}&to=${to}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement.");
        setState({ prices: data.prices ?? [], loading: false, error: null });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setState({ prices: [], loading: false, error: (err as Error).message });
        }
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [coin.id, from, to]);

  const result = useMemo(() => {
    if (state.prices.length === 0) return null;
    return runBacktest({ prices: state.prices, amount, frequency, from, to });
  }, [state.prices, amount, frequency, from, to]);

  return {
    result,
    loading: state.loading,
    error: state.error,
    firstDataDate: state.prices[0]?.date ?? null,
  };
}
