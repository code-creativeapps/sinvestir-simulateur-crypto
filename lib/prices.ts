/**
 * Price provider abstraction.
 *
 * Default source is Binance's public API (keyless, works on Vercel). If a
 * CoinGecko demo key is configured, CoinGecko is used instead for its much
 * wider coin coverage. Both expose the same shape so the rest of the app and
 * the route handlers don't care which is active.
 */
import type { PricePoint } from "@/lib/backtest";

/** Fiat the prices are quoted in (drives formatting). */
export type Currency = "EUR" | "USD";

/** A coin as surfaced to the picker. */
export interface Coin {
  /** Provider-specific id used to fetch history (a Binance pair, or a CoinGecko id). */
  id: string;
  name: string;
  symbol: string;
  image?: string;
  rank?: number | null;
  currency: Currency;
}

export interface PriceProvider {
  name: string;
  /** Default list shown before any search (popular coins). */
  topCoins(): Promise<Coin[]>;
  /** Search across coins by name/symbol. */
  search(query: string): Promise<Coin[]>;
  /** Daily prices for a coin in [from, to] (ISO `yyyy-mm-dd`). */
  history(id: string, from: string, to: string): Promise<PricePoint[]>;
}

// Imported after the types above so the adapters can reference them.
import { binanceProvider } from "@/lib/binance";
import { coingeckoProvider } from "@/lib/coingecko";

export function getProvider(): PriceProvider {
  return process.env.COINGECKO_API_KEY ? coingeckoProvider : binanceProvider;
}
