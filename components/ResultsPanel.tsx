import type { BacktestResult } from "@/lib/backtest";
import type { Scenario } from "@/lib/scenario-url";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
  formatDate,
} from "@/lib/format";

const FREQ_PHRASE: Record<Scenario["frequency"], string> = {
  once: "en une fois",
  daily: "par jour",
  weekly: "par semaine",
  monthly: "par mois",
};

export function ResultsPanel({
  result,
  scenario,
  loading,
  error,
  firstDataDate,
}: {
  result: BacktestResult | null;
  scenario: Scenario;
  loading: boolean;
  error: string | null;
  firstDataDate: string | null;
}) {
  const cur = scenario.coin.currency;

  if (error) {
    return (
      <Card className="flex min-h-[20rem] flex-col items-center justify-center text-center">
        <p className="font-medium text-[color:var(--color-negative)]">
          Impossible de charger les données
        </p>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">{error}</p>
      </Card>
    );
  }

  if (loading && !result) {
    return (
      <Card className="min-h-[20rem] animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-4 h-10 w-48 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-card bg-white/5" />
          ))}
        </div>
      </Card>
    );
  }

  if (!result || result.contributions === 0) {
    return (
      <Card className="flex min-h-[20rem] items-center justify-center text-center">
        <p className="max-w-xs text-sm text-ink-muted">
          Aucune donnée de prix sur cette période pour {scenario.coin.name}.
          Essayez une autre plage de dates.
        </p>
      </Card>
    );
  }

  const positive = result.gain >= 0;
  const perfColor = positive
    ? "text-[color:var(--color-positive)]"
    : "text-[color:var(--color-negative)]";

  const dataStartLate =
    firstDataDate && firstDataDate > scenario.from ? firstDataDate : null;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vos résultats</h3>
        <span className="rounded-pill bg-white/5 px-3 py-1 text-xs text-ink-muted">
          {scenario.coin.symbol}
        </span>
      </div>

      {/* Headline figure */}
      <div className="rounded-card border border-accent/20 bg-surface-tint p-5">
        <p className="text-sm text-ink-muted">Capital final</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums sm:text-4xl">
          {formatCurrency(result.finalValue, cur)}
        </p>
        <p className={`mt-1 text-sm font-medium ${perfColor}`}>
          {positive ? "▲" : "▼"} {formatCurrency(result.gain, cur)} (
          {formatPercent(result.performancePct)})
        </p>
      </div>

      {/* Key figures */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Investi" value={formatCurrency(result.invested, cur)} />
        <Stat
          label="Acquis"
          value={`${formatQuantity(result.units)} ${scenario.coin.symbol}`}
          tooltip="Quantité de l'actif accumulée."
        />
        <Stat
          label="Prix moyen d'acquisition"
          value={formatCurrency(result.avgBuyPrice, cur)}
        />
        <Stat
          label="Performance"
          value={formatPercent(result.performancePct)}
          valueClassName={perfColor}
        />
      </div>

      {/* Plain-language summary */}
      <p className="text-sm leading-relaxed text-ink-muted">
        Investir <strong className="text-ink">{formatCurrency(scenario.amount, cur)}</strong>{" "}
        {FREQ_PHRASE[scenario.frequency]} sur{" "}
        <strong className="text-ink">{scenario.coin.name}</strong> entre le{" "}
        <strong className="text-ink">{formatDate(scenario.from)}</strong> et le{" "}
        <strong className="text-ink">{formatDate(scenario.to)}</strong> aurait
        représenté{" "}
        <strong className="text-ink">{formatCurrency(result.invested, cur)}</strong>{" "}
        investis ({result.contributions} versement
        {result.contributions > 1 ? "s" : ""}), pour un capital final de{" "}
        <strong className="text-ink">{formatCurrency(result.finalValue, cur)}</strong>{" "}
        (<span className={perfColor}>{formatPercent(result.performancePct)}</span>).
      </p>

      {dataStartLate && (
        <p className="text-xs text-ink-faint">
          Données disponibles à partir du {formatDate(dataStartLate)} pour cet
          actif.
        </p>
      )}
    </Card>
  );
}
