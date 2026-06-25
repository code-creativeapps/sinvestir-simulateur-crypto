"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Coin } from "@/lib/prices";
import type { ScenarioCoin } from "@/lib/scenario-url";
import { CoinBadge } from "@/components/CoinBadge";

export function CoinSelect({
  value,
  onChange,
}: {
  value: ScenarioCoin;
  onChange: (coin: ScenarioCoin) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Cache results per query so reopening the picker is instant (no refetch flash).
  const cacheRef = useRef<Map<string, Coin[]>>(new Map());

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Prefetch the default list on mount so the first open is instant (the
  // request runs during page load, before the user clicks the picker).
  useEffect(() => {
    if (cacheRef.current.has("")) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/coins?q=", { signal: ctrl.signal });
        const data = await res.json();
        if (!res.ok) return;
        const coins: Coin[] = data.coins ?? [];
        cacheRef.current.set("", coins);
        setResults((prev) => (prev.length === 0 ? coins : prev));
      } catch {
        // Ignore prefetch failures; opening the picker will retry/report.
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Debounced search whenever the dropdown is open.
  useEffect(() => {
    if (!open) return;
    const key = query.trim();

    // Cache hit → show instantly, no fetch, no loading flash.
    const cached = cacheRef.current.get(key);
    if (cached) {
      setResults(cached);
      setError(null);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      // The prefetch (or a prior search) may have filled the cache during the
      // debounce window — use it instead of firing a duplicate request.
      const fresh = cacheRef.current.get(key);
      if (fresh) {
        setResults(fresh);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/coins?q=${encodeURIComponent(key)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement.");
        const coins: Coin[] = data.coins ?? [];
        cacheRef.current.set(key, coins);
        setResults(coins);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open]);

  function select(coin: Coin) {
    onChange({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      currency: coin.currency,
    });
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 border-b border-line bg-transparent py-2 text-left transition hover:border-accent"
      >
        <CoinBadge symbol={value.symbol} />
        <span className="flex-1">
          <span className="font-medium">{value.name}</span>{" "}
          <span className="text-ink-faint">{value.symbol}</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-ink-faint">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface-raised shadow-2xl">
          <div className="border-b border-line-faint p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une crypto (BTC, Ethereum…)"
              className="w-full rounded-lg bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-ink-faint"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
            {results.map((coin) => (
              <li key={coin.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={coin.id === value.id}
                  onClick={() => select(coin)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white/5",
                    coin.id === value.id && "bg-white/5",
                  )}
                >
                  <CoinBadge symbol={coin.symbol} image={coin.image} size={24} />
                  <span className="flex-1 truncate">{coin.name}</span>
                  <span className="text-ink-faint">{coin.symbol}</span>
                  {coin.currency === "USD" && (
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-ink-faint">
                      USD
                    </span>
                  )}
                </button>
              </li>
            ))}
            {/* Only surface these states when there's nothing to show, so a
                background refetch never replaces the visible list. */}
            {loading && results.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink-muted">Chargement…</li>
            )}
            {error && results.length === 0 && (
              <li className="px-3 py-3 text-sm text-[color:var(--color-negative)]">
                {error}
              </li>
            )}
            {!loading && !error && results.length === 0 && (
              <li className="px-3 py-3 text-sm text-ink-muted">
                Aucun résultat.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
