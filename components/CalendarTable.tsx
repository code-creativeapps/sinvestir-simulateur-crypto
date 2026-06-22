import type { SeriesPoint } from "@/lib/backtest";
import type { Currency } from "@/lib/prices";
import { formatCurrency, formatPercent } from "@/lib/format";

/** Year-end snapshot rows derived from the backtest series. */
function yearlyRows(series: SeriesPoint[]): SeriesPoint[] {
  const byYear = new Map<string, SeriesPoint>();
  for (const p of series) byYear.set(p.date.slice(0, 4), p); // last point of each year wins
  return [...byYear.values()];
}

export function CalendarTable({
  series,
  currency,
}: {
  series: SeriesPoint[];
  currency: Currency;
}) {
  const rows = yearlyRows(series);
  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted">Aucune donnée à afficher.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-ink-muted">
            <th className="py-2 pr-4 font-medium">Année</th>
            <th className="py-2 pr-4 text-right font-medium">Investi cumulé</th>
            <th className="py-2 pr-4 text-right font-medium">Capital</th>
            <th className="py-2 pr-4 text-right font-medium">Plus/moins-value</th>
            <th className="py-2 text-right font-medium">Perf.</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => {
            const gain = r.value - r.invested;
            const perf = r.invested > 0 ? (gain / r.invested) * 100 : 0;
            const color =
              gain >= 0
                ? "text-[color:var(--color-positive)]"
                : "text-[color:var(--color-negative)]";
            return (
              <tr key={r.date} className="border-t border-line-faint">
                <td className="py-2.5 pr-4">{r.date.slice(0, 4)}</td>
                <td className="py-2.5 pr-4 text-right">
                  {formatCurrency(r.invested, currency)}
                </td>
                <td className="py-2.5 pr-4 text-right">
                  {formatCurrency(r.value, currency)}
                </td>
                <td className={`py-2.5 pr-4 text-right ${color}`}>
                  {formatCurrency(gain, currency)}
                </td>
                <td className={`py-2.5 text-right ${color}`}>
                  {formatPercent(perf)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
