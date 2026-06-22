/**
 * Scenario model + URL (de)serialization.
 *
 * The whole scenario lives in the query string so a result is shareable and the
 * /embed route can be driven by params — no backend needed.
 */
import type { Frequency } from "@/lib/backtest";
import type { Currency } from "@/lib/prices";

export interface ScenarioCoin {
  id: string;
  symbol: string;
  name: string;
  currency: Currency;
}

export interface Scenario {
  coin: ScenarioCoin;
  /** Amount per contribution (or the lump sum when `once`). */
  amount: number;
  frequency: Frequency;
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
}

const FREQUENCIES: Frequency[] = ["once", "daily", "weekly", "monthly"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date as yyyy-mm-dd (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultScenario(to = today()): Scenario {
  return {
    coin: { id: "BTCEUR", symbol: "BTC", name: "Bitcoin", currency: "EUR" },
    amount: 25,
    frequency: "weekly",
    from: "2018-01-01",
    to,
  };
}

/** Serialize to a query string (no leading "?"). */
export function encodeScenario(s: Scenario): string {
  const p = new URLSearchParams({
    c: s.coin.id,
    s: s.coin.symbol,
    n: s.coin.name,
    cur: s.coin.currency,
    a: String(s.amount),
    f: s.frequency,
    from: s.from,
    to: s.to,
  });
  return p.toString();
}

/** Parse a scenario from params, falling back to defaults field by field. */
export function decodeScenario(
  params: URLSearchParams,
  fallback: Scenario = defaultScenario(),
): Scenario {
  const id = params.get("c");
  const symbol = params.get("s");
  const coin: ScenarioCoin =
    id && symbol
      ? {
          id,
          symbol,
          name: params.get("n") ?? symbol,
          currency: params.get("cur") === "USD" ? "USD" : "EUR",
        }
      : fallback.coin;

  const amount = Number.parseFloat(params.get("a") ?? "");
  const freq = params.get("f") as Frequency | null;
  const from = params.get("from");
  const to = params.get("to");

  return {
    coin,
    amount: Number.isFinite(amount) && amount > 0 ? amount : fallback.amount,
    frequency: freq && FREQUENCIES.includes(freq) ? freq : fallback.frequency,
    from: from && ISO_DATE.test(from) ? from : fallback.from,
    to: to && ISO_DATE.test(to) ? to : fallback.to,
  };
}
