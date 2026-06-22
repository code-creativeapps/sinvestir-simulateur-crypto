/**
 * CoinGecko adapter (opt-in via COINGECKO_API_KEY).
 *
 * Kept server-only so the key is never exposed; responses go through Next's
 * data cache. Enabled only when a key is set — the keyless public API is
 * Cloudflare-blocked from datacenter IPs (incl. Vercel), so Binance is the
 * default. With a key, CoinGecko gives EUR-native prices across 7000+ coins.
 */
import type { PricePoint } from "@/lib/backtest";
import type { Coin, PriceProvider } from "@/lib/prices";

const BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;
const VS = "eur";

export class CoinGeckoError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CoinGeckoError";
  }
}

type FetchOpts = { revalidate: number; tags: string[] };

async function cgFetch<T>(path: string, opts: FetchOpts): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    next: { revalidate: opts.revalidate, tags: opts.tags },
  });
  if (!res.ok) {
    const detail =
      res.status === 429
        ? "Limite de requêtes CoinGecko atteinte, réessayez dans un instant."
        : `CoinGecko a répondu ${res.status}.`;
    throw new CoinGeckoError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

async function topCoins(): Promise<Coin[]> {
  const data = await cgFetch<
    {
      id: string;
      name: string;
      symbol: string;
      image: string;
      market_cap_rank: number | null;
    }[]
  >(
    `/coins/markets?vs_currency=${VS}&order=market_cap_desc&per_page=24&page=1&sparkline=false`,
    { revalidate: 3600, tags: ["coins:top"] },
  );
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    image: c.image,
    rank: c.market_cap_rank,
    currency: "EUR",
  }));
}

async function search(query: string): Promise<Coin[]> {
  if (!query.trim()) return topCoins();
  const data = await cgFetch<{
    coins: {
      id: string;
      name: string;
      symbol: string;
      large?: string;
      thumb?: string;
      market_cap_rank: number | null;
    }[];
  }>(`/search?query=${encodeURIComponent(query)}`, {
    revalidate: 3600,
    tags: ["coins:search"],
  });
  return data.coins.slice(0, 24).map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    image: c.large ?? c.thumb,
    rank: c.market_cap_rank,
    currency: "EUR",
  }));
}

/** Daily prices in EUR; sub-daily granularity is downsampled to last-per-day. */
async function history(
  id: string,
  from: string,
  to: string,
): Promise<PricePoint[]> {
  const fromTs = Math.floor(Date.parse(`${from}T00:00:00Z`) / 1000);
  const toTs = Math.floor(Date.parse(`${to}T23:59:59Z`) / 1000);

  const data = await cgFetch<{ prices: [number, number][] }>(
    `/coins/${encodeURIComponent(id)}/market_chart/range?vs_currency=${VS}&from=${fromTs}&to=${toTs}`,
    { revalidate: 21_600, tags: [`history:${id}`] },
  );

  const byDay = new Map<string, number>();
  for (const [ms, price] of data.prices) {
    byDay.set(new Date(ms).toISOString().slice(0, 10), price);
  }
  return [...byDay.entries()]
    .map(([date, price]) => ({ date, price }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export const coingeckoProvider: PriceProvider = {
  name: "coingecko",
  topCoins,
  search,
  history,
};
