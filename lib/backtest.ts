/**
 * Pure historical backtest engine — the functional heart of the simulator.
 *
 * Reproduces the logic of the original crypto simulator: given a real daily
 * price history (EUR) and an investment scenario (one-shot or DCA), it computes
 * how that scenario would have performed and the time series for the chart.
 *
 * No I/O, no framework imports → fully unit-testable.
 */

export type Frequency = "once" | "daily" | "weekly" | "monthly";

/** One daily price point, in the chosen fiat currency (EUR by default). */
export interface PricePoint {
  /** ISO date, `yyyy-mm-dd`. */
  date: string;
  price: number;
}

export interface BacktestInput {
  /** Daily prices, ascending by date. */
  prices: PricePoint[];
  /** Amount invested per contribution (or the lump sum when `once`). */
  amount: number;
  frequency: Frequency;
  /** Inclusive ISO start date, `yyyy-mm-dd`. */
  from: string;
  /** Inclusive ISO end date, `yyyy-mm-dd`. */
  to: string;
}

/** One point of the chart time series. */
export interface SeriesPoint {
  date: string;
  /** Cumulative amount invested so far (€) — "Investi". */
  invested: number;
  /** Cumulative quantity of the asset held — "Acquis". */
  units: number;
  /** Portfolio value at this date = units × price — "Valeur". */
  value: number;
  /** Asset price at this date — "Prix". */
  price: number;
}

export interface BacktestResult {
  /** Total invested (€) — "Investi". */
  invested: number;
  /** Quantity of the asset accumulated — "Acquis". */
  units: number;
  /** Average acquisition price (€/unit) — "Prix moyen d'acquisition". */
  avgBuyPrice: number;
  /** Final portfolio value (€) — "Capital final". */
  finalValue: number;
  /** Absolute gain/loss (€). */
  gain: number;
  /** Performance as a percentage — "Performance". */
  performancePct: number;
  /** Number of contributions made. */
  contributions: number;
  /** Time series for the chart. */
  series: SeriesPoint[];
}

/* ----------------------------------------------------------------------------
 * Date helpers (UTC, to avoid timezone drift). Dates are `yyyy-mm-dd` strings.
 * ------------------------------------------------------------------------- */

function toUTC(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;

/** Generate the list of contribution dates (ISO strings) for the scenario. */
export function contributionDates(
  frequency: Frequency,
  from: string,
  to: string,
): string[] {
  const start = toUTC(from);
  const end = toUTC(to);
  if (end < start) return [];
  if (frequency === "once") return [from];

  const dates: string[] = [];

  if (frequency === "monthly") {
    const [y, m, d] = from.split("-").map(Number);
    let year = y;
    let month = m - 1; // 0-based
    // Walk month by month, clamping the day to the month's length.
    for (;;) {
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const day = Math.min(d, daysInMonth);
      const ms = Date.UTC(year, month, day);
      if (ms > end) break;
      if (ms >= start) dates.push(fromUTC(ms));
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
    return dates;
  }

  const step = frequency === "daily" ? DAY_MS : 7 * DAY_MS;
  for (let ms = start; ms <= end; ms += step) {
    dates.push(fromUTC(ms));
  }
  return dates;
}

/* ----------------------------------------------------------------------------
 * Price lookup
 * ------------------------------------------------------------------------- */

/**
 * Returns the price effective at `date`: the most recent point at or before it,
 * falling back to the earliest point when the date predates all data.
 * Assumes `prices` is sorted ascending. Binary search → O(log n).
 */
export function priceAt(prices: PricePoint[], date: string): number | null {
  if (prices.length === 0) return null;
  const target = toUTC(date);
  let lo = 0;
  let hi = prices.length - 1;
  let idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (toUTC(prices[mid].date) <= target) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  if (idx === -1) return prices[0].price; // date before first point
  return prices[idx].price;
}

/* ----------------------------------------------------------------------------
 * Backtest
 * ------------------------------------------------------------------------- */

export function runBacktest(input: BacktestInput): BacktestResult {
  const { amount, frequency, from, to } = input;

  // Window the price series to [from, to], keeping ascending order.
  const fromMs = toUTC(from);
  const toMs = toUTC(to);
  const prices = input.prices
    .filter((p) => {
      const ms = toUTC(p.date);
      return ms >= fromMs && ms <= toMs;
    })
    .sort((a, b) => toUTC(a.date) - toUTC(b.date));

  const empty: BacktestResult = {
    invested: 0,
    units: 0,
    avgBuyPrice: 0,
    finalValue: 0,
    gain: 0,
    performancePct: 0,
    contributions: 0,
    series: [],
  };

  if (prices.length === 0 || amount <= 0) return empty;

  // Resolve each contribution to a (date, price), accumulating units/invested.
  const dates = contributionDates(frequency, from, to);
  const buys = dates
    .map((date) => {
      const price = priceAt(prices, date);
      return price && price > 0 ? { ms: toUTC(date), price } : null;
    })
    .filter((b): b is { ms: number; price: number } => b !== null)
    .sort((a, b) => a.ms - b.ms);

  if (buys.length === 0) return empty;

  // Build the series by walking price points and folding in buys as we pass them.
  const series: SeriesPoint[] = [];
  let units = 0;
  let invested = 0;
  let contributions = 0;
  let bi = 0;

  for (const point of prices) {
    const ms = toUTC(point.date);
    while (bi < buys.length && buys[bi].ms <= ms) {
      units += amount / buys[bi].price;
      invested += amount;
      contributions += 1;
      bi += 1;
    }
    series.push({
      date: point.date,
      invested,
      units,
      value: units * point.price,
      price: point.price,
    });
  }

  // Any buys after the last price point (shouldn't happen given windowing,
  // but stay safe): fold them in at the final price.
  const lastPrice = prices[prices.length - 1].price;
  while (bi < buys.length) {
    units += amount / buys[bi].price;
    invested += amount;
    contributions += 1;
    bi += 1;
  }

  const finalValue = units * lastPrice;
  const gain = finalValue - invested;

  return {
    invested,
    units,
    avgBuyPrice: units > 0 ? invested / units : 0,
    finalValue,
    gain,
    performancePct: invested > 0 ? (gain / invested) * 100 : 0,
    contributions,
    series,
  };
}
