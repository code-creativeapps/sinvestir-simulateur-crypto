/** fr-FR formatting helpers shared across the UI. */
import type { Currency } from "@/lib/prices";

const LOCALE = "fr-FR";

export function formatCurrency(value: number, currency: Currency = "EUR"): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Compact currency for axes/badges, e.g. "12,3 k €". */
export function formatCurrencyCompact(
  value: number,
  currency: Currency = "EUR",
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

/** Asset quantity — more decimals for sub-unit holdings (e.g. 0,01234567 BTC). */
export function formatQuantity(value: number): string {
  const digits = value !== 0 && Math.abs(value) < 1 ? 8 : 4;
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(
    value,
  );
}

/** A percentage already expressed in percent units (e.g. 56.6 → "+56,60 %"). */
export function formatPercent(value: number, withSign = true): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} %`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** Parse a fr-FR-ish numeric input ("1 234,56" or "1234.56") to a number. */
export function parseNumberInput(raw: string): number {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/ /g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
