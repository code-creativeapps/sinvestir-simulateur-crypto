"use client";

import { useState } from "react";
import type { Frequency } from "@/lib/backtest";
import type { Scenario, ScenarioCoin } from "@/lib/scenario-url";
import { parseNumberInput } from "@/lib/format";
import { Field, UnitInput } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { CoinSelect } from "@/components/CoinSelect";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "once", label: "Une fois" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdo" },
  { value: "monthly", label: "Mensuel" },
];

function DateInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-line bg-transparent py-2 text-lg text-ink outline-none transition focus:border-accent [color-scheme:dark]"
    />
  );
}

export function ScenarioForm({
  scenario,
  onChange,
  onShare,
  shareLabel,
}: {
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onShare: () => void;
  shareLabel: string;
}) {
  const { coin, amount, frequency, from, to } = scenario;
  const isDca = frequency !== "once";
  const todayStr = new Date().toISOString().slice(0, 10);

  // Local text state for the amount so typing isn't fought by reformatting.
  // Sync at render time (not in an effect) when the amount changes externally
  // — the React-recommended pattern for deriving state from props.
  const [amountText, setAmountText] = useState(String(amount));
  const [prevAmount, setPrevAmount] = useState(amount);
  if (amount !== prevAmount) {
    setPrevAmount(amount);
    setAmountText(String(amount));
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="Crypto-actif" tooltip="L'actif sur lequel porte la simulation.">
        <CoinSelect
          value={coin}
          onChange={(c: ScenarioCoin) => onChange({ coin: c })}
        />
      </Field>

      <Field
        label={isDca ? "Montant par versement" : "Montant investi"}
        tooltip="Somme investie à chaque versement (ou en une fois)."
      >
        <UnitInput
          value={amountText}
          unit={coin.currency}
          onChange={(v) => {
            setAmountText(v);
            onChange({ amount: parseNumberInput(v) });
          }}
        />
      </Field>

      <Field label="Fréquence" tooltip="« Une fois » = investissement one-shot. Sinon, DCA récurrent.">
        <Segmented
          ariaLabel="Fréquence"
          options={FREQUENCIES}
          value={frequency}
          onChange={(f) => onChange({ frequency: f })}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Depuis" htmlFor="from">
          <DateInput
            id="from"
            value={from}
            max={to}
            onChange={(v) => onChange({ from: v })}
          />
        </Field>
        <Field label="Jusqu'au" htmlFor="to">
          <DateInput
            id="to"
            value={to}
            min={from}
            max={todayStr}
            onChange={(v) => onChange({ to: v })}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <Button
          variant="primary"
          className="w-full"
          disabled
          title="Disponible avec un compte S'investir (Supabase)"
        >
          Enregistrer la simulation
        </Button>
        <Button variant="white" className="w-full" onClick={onShare}>
          {shareLabel}
        </Button>
      </div>
    </div>
  );
}
