/**
 * Binance public API adapter (keyless).
 *
 * - Coin list/search is derived from `/exchangeInfo` (all trading pairs).
 * - History uses daily klines (`/klines?interval=1d`), paginated past the
 *   1000-candle limit so multi-year ranges work.
 *
 * Prices are quoted in the pair's quote asset: we prefer EUR, then USD
 * stablecoins, so the displayed currency stays meaningful.
 */
import type { PricePoint } from "@/lib/backtest";
import type { Coin, Currency, PriceProvider } from "@/lib/prices";

// Public market-data domain — same endpoints as api.binance.com but without the
// geo-restriction that returns 451 from US regions (e.g. Vercel's default iad1).
const BASE = "https://data-api.binance.vision/api/v3";
const DAY_MS = 86_400_000;

/** Quote assets we accept, in order of preference. */
const PREFERRED_QUOTES = ["EUR", "USDT", "USDC", "FDUSD"];

/** Popular coins shown by default, in display order. */
const TOP_BASES = [
  "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT",
  "LINK", "AVAX", "MATIC", "LTC", "TRX", "ATOM", "XLM", "UNI",
  "ETC", "FIL", "APT", "ARB", "NEAR", "OP", "INJ", "SUI",
];

/** Human names for common tickers (Binance only gives symbols). */
const NAME_MAP: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", BNB: "BNB", SOL: "Solana",
  XRP: "XRP", ADA: "Cardano", DOGE: "Dogecoin", DOT: "Polkadot",
  LINK: "Chainlink", AVAX: "Avalanche", MATIC: "Polygon", LTC: "Litecoin",
  TRX: "TRON", ATOM: "Cosmos", XLM: "Stellar", UNI: "Uniswap",
  ETC: "Ethereum Classic", FIL: "Filecoin", APT: "Aptos", ARB: "Arbitrum",
  NEAR: "NEAR Protocol", OP: "Optimism", INJ: "Injective", SUI: "Sui",
  SHIB: "Shiba Inu", PEPE: "Pepe", AAVE: "Aave", ALGO: "Algorand",
};

class BinanceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BinanceError";
  }
}

type FetchOpts = { revalidate: number; tags: string[] };

async function bFetch<T>(path: string, opts: FetchOpts): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { accept: "application/json" },
    next: { revalidate: opts.revalidate, tags: opts.tags },
  });
  if (!res.ok) {
    const detail =
      res.status === 429
        ? "Limite de requêtes atteinte, réessayez dans un instant."
        : `La source de prix a répondu ${res.status}.`;
    throw new BinanceError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

interface SymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
}

async function tradingSymbols(): Promise<SymbolInfo[]> {
  const data = await bFetch<{ symbols: SymbolInfo[] }>("/exchangeInfo", {
    revalidate: 86_400,
    tags: ["binance:info"],
  });
  return data.symbols.filter(
    (s) => s.status === "TRADING" && PREFERRED_QUOTES.includes(s.quoteAsset),
  );
}

function currencyForQuote(quote: string): Currency {
  return quote === "EUR" ? "EUR" : "USD";
}

/** Pick the best-quoted trading pair for a base asset. */
function bestPair(symbols: SymbolInfo[], base: string): SymbolInfo | null {
  for (const quote of PREFERRED_QUOTES) {
    const found = symbols.find(
      (s) => s.baseAsset === base && s.quoteAsset === quote,
    );
    if (found) return found;
  }
  return null;
}

function toCoin(s: SymbolInfo): Coin {
  return {
    id: s.symbol,
    name: NAME_MAP[s.baseAsset] ?? s.baseAsset,
    symbol: s.baseAsset,
    currency: currencyForQuote(s.quoteAsset),
  };
}

async function topCoins(): Promise<Coin[]> {
  const symbols = await tradingSymbols();
  return TOP_BASES.map((base) => bestPair(symbols, base))
    .filter((s): s is SymbolInfo => s !== null)
    .map(toCoin);
}

async function search(query: string): Promise<Coin[]> {
  const q = query.trim().toUpperCase();
  if (!q) return topCoins();
  const symbols = await tradingSymbols();

  // Unique base assets whose ticker or name matches the query.
  const bases = new Set<string>();
  for (const s of symbols) {
    const name = (NAME_MAP[s.baseAsset] ?? "").toUpperCase();
    if (s.baseAsset.includes(q) || name.includes(q)) bases.add(s.baseAsset);
  }

  const coins = [...bases]
    .map((base) => bestPair(symbols, base))
    .filter((s): s is SymbolInfo => s !== null)
    .map(toCoin);

  // Rank: exact ticker match, then known majors, then EUR pairs, then name.
  const rank = (c: Coin) => {
    let score = 0;
    if (c.symbol === q) score -= 1000;
    const top = TOP_BASES.indexOf(c.symbol);
    if (top !== -1) score -= 500 - top;
    if (c.currency === "EUR") score -= 50;
    return score;
  };
  return coins.sort((a, b) => rank(a) - rank(b)).slice(0, 24);
}

async function history(
  id: string,
  from: string,
  to: string,
): Promise<PricePoint[]> {
  const end = Date.parse(`${to}T23:59:59Z`);
  let start = Date.parse(`${from}T00:00:00Z`);
  const out: PricePoint[] = [];

  // Paginate: Binance caps each klines call at 1000 candles.
  for (let guard = 0; guard < 30; guard += 1) {
    const data = await bFetch<unknown[][]>(
      `/klines?symbol=${encodeURIComponent(id)}&interval=1d&startTime=${start}&endTime=${end}&limit=1000`,
      { revalidate: 21_600, tags: [`binance:hist:${id}`] },
    );
    if (data.length === 0) break;
    for (const k of data) {
      const openTime = k[0] as number;
      const close = parseFloat(k[4] as string);
      out.push({ date: new Date(openTime).toISOString().slice(0, 10), price: close });
    }
    if (data.length < 1000) break;
    start = (data[data.length - 1][0] as number) + DAY_MS;
    if (start > end) break;
  }
  return out;
}

export const binanceProvider: PriceProvider = {
  name: "binance",
  topCoins,
  search,
  history,
};
