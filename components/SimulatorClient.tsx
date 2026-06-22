"use client";

import { useCallback, useEffect, useState } from "react";
import type { Scenario } from "@/lib/scenario-url";
import { encodeScenario } from "@/lib/scenario-url";
import { Card } from "@/components/ui/Card";
import { ScenarioForm } from "@/components/ScenarioForm";

export function SimulatorClient({
  initialScenario,
}: {
  initialScenario: Scenario;
}) {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [shareLabel, setShareLabel] = useState("Partager mes résultats");

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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card>
        <h3 className="mb-5 text-lg font-semibold">Simulation</h3>
        <ScenarioForm
          scenario={scenario}
          onChange={patch}
          onShare={share}
          shareLabel={shareLabel}
        />
      </Card>
      {/* Results panel & chart are added in the next issues. */}
    </div>
  );
}
