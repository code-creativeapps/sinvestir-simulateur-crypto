import { describe, it, expect } from "vitest";
import {
  runBacktest,
  contributionDates,
  priceAt,
  type PricePoint,
} from "@/lib/backtest";

/** Helper: build a daily price series between two dates with a price function. */
function dailyPrices(
  from: string,
  to: string,
  priceFn: (date: string, i: number) => number,
): PricePoint[] {
  const out: PricePoint[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  let ms = Date.UTC(fy, fm - 1, fd);
  const end = Date.UTC(ty, tm - 1, td);
  let i = 0;
  while (ms <= end) {
    const date = new Date(ms).toISOString().slice(0, 10);
    out.push({ date, price: priceFn(date, i) });
    ms += 86_400_000;
    i += 1;
  }
  return out;
}

describe("contributionDates", () => {
  it("one-shot returns a single date", () => {
    expect(contributionDates("once", "2020-01-01", "2020-12-31")).toEqual([
      "2020-01-01",
    ]);
  });

  it("weekly steps every 7 days", () => {
    const d = contributionDates("weekly", "2020-01-01", "2020-01-31");
    expect(d).toEqual([
      "2020-01-01",
      "2020-01-08",
      "2020-01-15",
      "2020-01-22",
      "2020-01-29",
    ]);
  });

  it("monthly keeps the day-of-month and clamps short months", () => {
    const d = contributionDates("monthly", "2021-01-31", "2021-04-30");
    expect(d).toEqual([
      "2021-01-31",
      "2021-02-28", // clamped (no Feb 31)
      "2021-03-31",
      "2021-04-30", // clamped
    ]);
  });

  it("returns nothing when the range is inverted", () => {
    expect(contributionDates("daily", "2020-02-01", "2020-01-01")).toEqual([]);
  });
});

describe("priceAt", () => {
  const prices: PricePoint[] = [
    { date: "2020-01-01", price: 100 },
    { date: "2020-01-02", price: 110 },
    { date: "2020-01-04", price: 130 },
  ];

  it("returns the exact price when present", () => {
    expect(priceAt(prices, "2020-01-02")).toBe(110);
  });

  it("falls back to the most recent prior day (missing day)", () => {
    expect(priceAt(prices, "2020-01-03")).toBe(110);
  });

  it("uses the earliest point when the date predates all data", () => {
    expect(priceAt(prices, "2019-12-01")).toBe(100);
  });
});

describe("runBacktest — one-shot", () => {
  it("doubles when the price doubles", () => {
    // Flat 100 then ends at 200 → invest 1000 at 100 = 10 units → 2000 final.
    const prices: PricePoint[] = [
      { date: "2020-01-01", price: 100 },
      { date: "2020-06-01", price: 200 },
    ];
    const r = runBacktest({
      prices,
      amount: 1000,
      frequency: "once",
      from: "2020-01-01",
      to: "2020-06-01",
    });
    expect(r.invested).toBe(1000);
    expect(r.units).toBeCloseTo(10, 6);
    expect(r.finalValue).toBeCloseTo(2000, 6);
    expect(r.gain).toBeCloseTo(1000, 6);
    expect(r.performancePct).toBeCloseTo(100, 6);
    expect(r.avgBuyPrice).toBeCloseTo(100, 6);
    expect(r.contributions).toBe(1);
  });
});

describe("runBacktest — monthly DCA", () => {
  it("accumulates units across contributions on a flat market", () => {
    // Flat price 50 across the year → each 100€ buys 2 units; 12 buys = 24 units.
    const prices = dailyPrices("2021-01-01", "2021-12-31", () => 50);
    const r = runBacktest({
      prices,
      amount: 100,
      frequency: "monthly",
      from: "2021-01-01",
      to: "2021-12-31",
    });
    expect(r.contributions).toBe(12);
    expect(r.invested).toBe(1200);
    expect(r.units).toBeCloseTo(24, 6);
    expect(r.finalValue).toBeCloseTo(1200, 6); // flat market → no gain
    expect(r.performancePct).toBeCloseTo(0, 6);
    // Series ends with the full position.
    expect(r.series.at(-1)?.units).toBeCloseTo(24, 6);
    expect(r.series.at(-1)?.invested).toBe(1200);
  });

  it("lowers the average buy price when buying through a dip (DCA effect)", () => {
    // Price halves mid-year then recovers → DCA avg price < start price.
    const prices = dailyPrices("2021-01-01", "2021-12-31", (date) =>
      date < "2021-07-01" ? 100 : 50,
    );
    const r = runBacktest({
      prices,
      amount: 100,
      frequency: "monthly",
      from: "2021-01-01",
      to: "2021-12-31",
    });
    expect(r.avgBuyPrice).toBeLessThan(100);
    expect(r.units).toBeGreaterThan(r.invested / 100);
  });
});

describe("runBacktest — edge cases", () => {
  it("handles a single-day range", () => {
    const prices: PricePoint[] = [{ date: "2020-01-01", price: 100 }];
    const r = runBacktest({
      prices,
      amount: 500,
      frequency: "once",
      from: "2020-01-01",
      to: "2020-01-01",
    });
    expect(r.units).toBeCloseTo(5, 6);
    expect(r.finalValue).toBeCloseTo(500, 6);
  });

  it("returns an empty result with no prices", () => {
    const r = runBacktest({
      prices: [],
      amount: 100,
      frequency: "monthly",
      from: "2020-01-01",
      to: "2020-12-31",
    });
    expect(r.units).toBe(0);
    expect(r.finalValue).toBe(0);
    expect(r.series).toHaveLength(0);
  });

  it("returns an empty result when amount is zero (units guard)", () => {
    const prices = dailyPrices("2020-01-01", "2020-03-01", () => 100);
    const r = runBacktest({
      prices,
      amount: 0,
      frequency: "monthly",
      from: "2020-01-01",
      to: "2020-03-01",
    });
    expect(r.units).toBe(0);
    expect(r.avgBuyPrice).toBe(0);
    expect(r.performancePct).toBe(0);
  });
});
