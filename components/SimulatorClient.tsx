"use client";

import { useCallback, useEffect, useState } from "react";
import type { Scenario } from "@/lib/scenario-url";
import { encodeScenario } from "@/lib/scenario-url";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ScenarioForm } from "@/components/ScenarioForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HistorySection } from "@/components/HistorySection";
import { FormationCTA } from "@/components/FormationCTA";
import { useBacktest } from "@/lib/useBacktest";

export function SimulatorClient({
  initialScenario,
  showFormationCTA = false,
}: {
  initialScenario: Scenario;
  showFormationCTA?: boolean;
}) {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [shareLabel, setShareLabel] = useState("Partager mes résultats");
  const { result, loading, error, firstDataDate } = useBacktest(scenario);

  const patch = useCallback(
    (p: Partial<Scenario>) => setScenario((s) => ({ ...s, ...p })),
    [],
  );

  // Keep the address bar in sync so the current scenario is always shareable.
  useEffect(() => {
    const url = `${window.location.pathname}?${encodeScenario(scenario)}`;
    window.history.replaceState(null, "", url);
  }, [scenario]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?${encodeScenario(scenario)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Lien copié !");
      setTimeout(() => setShareLabel("Partager mes résultats"), 2000);
    } catch {
      setShareLabel("Copie impossible");
      setTimeout(() => setShareLabel("Partager mes résultats"), 2000);
    }
  }, [scenario]);

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,1fr)_minmax(0,2fr)]">
      <Card>
        <SectionTitle className="mb-5">Simulation</SectionTitle>
        <ScenarioForm
          scenario={scenario}
          onChange={patch}
          onShare={share}
          shareLabel={shareLabel}
        />
      </Card>
      <ResultsPanel
        result={result}
        scenario={scenario}
        loading={loading}
        error={error}
        firstDataDate={firstDataDate}
      />
      </div>
      <HistorySection result={result} scenario={scenario} />
      {showFormationCTA && <FormationCTA />}
    </div>
  );
}
