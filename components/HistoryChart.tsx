"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
} from "recharts";
import type { SeriesPoint } from "@/lib/backtest";
import type { Currency } from "@/lib/prices";
import { cn } from "@/lib/cn";
import {
  formatCurrency,
  formatAxisTick,
  formatDate,
  formatQuantity,
} from "@/lib/format";

type Key = "value" | "invested" | "price" | "units";

interface SeriesDef {
  key: Key;
  label: string;
  color: string;
  axis: "left" | "right";
  kind: "currency" | "units";
}

const SERIES: SeriesDef[] = [
  { key: "value", label: "Valeur", color: "#1098f7", axis: "left", kind: "currency" },
  { key: "invested", label: "Investi", color: "#f8d047", axis: "left", kind: "currency" },
  { key: "price", label: "Prix", color: "#a855f7", axis: "left", kind: "currency" },
  { key: "units", label: "Acquis", color: "#22c55e", axis: "right", kind: "units" },
];

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  symbol,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
  currency: Currency;
  symbol: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface-raised px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-ink">{label && formatDate(label)}</p>
      {payload.map((p) => {
        const def = SERIES.find((s) => s.key === p.dataKey);
        if (!def) return null;
        return (
          <p key={p.dataKey} className="flex items-center gap-2 text-ink-muted">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: def.color }}
            />
            {def.label}:{" "}
            <span className="font-medium text-ink">
              {def.kind === "currency"
                ? formatCurrency(p.value, currency)
                : `${formatQuantity(p.value)} ${symbol}`}
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function HistoryChart({
  series,
  currency,
  symbol,
}: {
  series: SeriesPoint[];
  currency: Currency;
  symbol: string;
}) {
  const [visible, setVisible] = useState<Record<Key, boolean>>({
    value: true,
    invested: true,
    price: false,
    units: false,
  });

  const toggle = (k: Key) => setVisible((v) => ({ ...v, [k]: !v[k] }));
  const unitsVisible = visible.units;

  return (
    <div>
      {/* Legend / series switches */}
      <div className="mb-3 flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            aria-pressed={visible[s.key]}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill border px-3 py-1 text-xs font-medium transition",
              visible[s.key]
                ? "border-line bg-white/5 text-ink"
                : "border-line-faint text-ink-faint",
            )}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: visible[s.key] ? s.color : "transparent", outline: `1px solid ${s.color}` }}
            />
            {s.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(0, 4)}
            minTickGap={48}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
            stroke="rgba(255,255,255,0.1)"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => formatAxisTick(v, currency)}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            width={44}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            hide={!unitsVisible}
            tickFormatter={(v: number) => formatQuantity(v)}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            stroke="rgba(255,255,255,0.1)"
            width={44}
          />
          <Tooltip
            content={<ChartTooltip currency={currency} symbol={symbol} />}
            isAnimationActive={false}
          />
          {SERIES.filter((s) => visible[s.key]).map((s) => (
            <Line
              key={s.key}
              yAxisId={s.axis}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          <Brush
            dataKey="date"
            height={26}
            travellerWidth={8}
            stroke="#1098f7"
            fill="rgba(16,152,247,0.08)"
            tickFormatter={(d: string) => d.slice(0, 7)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
