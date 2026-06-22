"use client";

import { useState } from "react";
import type { BacktestResult } from "@/lib/backtest";
import type { Scenario } from "@/lib/scenario-url";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Tabs } from "@/components/ui/Tabs";
import { HistoryChart } from "@/components/HistoryChart";
import { CalendarTable } from "@/components/CalendarTable";
import { formatCurrency, formatPercent } from "@/lib/format";

export function HistorySection({
  result,
  scenario,
}: {
  result: BacktestResult | null;
  scenario: Scenario;
}) {
  const [tab, setTab] = useState("graph");
  if (!result || result.series.length === 0) return null;

  const cur = scenario.coin.currency;
  const perfColor =
    result.gain >= 0
      ? "text-[color:var(--color-positive)]"
      : "text-[color:var(--color-negative)]";

  return (
    <Card className="mt-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Historique</h3>
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "graph", label: "Graphiques" },
            { id: "cal", label: "Calendrier" },
          ]}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Capital final" value={formatCurrency(result.finalValue, cur)} emphasis />
        <Stat label="Investi" value={formatCurrency(result.invested, cur)} />
        <Stat
          label="Performance"
          value={formatPercent(result.performancePct)}
          valueClassName={perfColor}
        />
      </div>

      {tab === "graph" ? (
        <HistoryChart
          series={result.series}
          currency={cur}
          symbol={scenario.coin.symbol}
        />
      ) : (
        <CalendarTable series={result.series} currency={cur} />
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-faint">
        L&rsquo;illustration graphique et les résultats présentés ne constituent
        pas un indicateur fiable des performances futures. Les performances
        passées ne préjugent en rien des performances futures.
      </p>
    </Card>
  );
}
