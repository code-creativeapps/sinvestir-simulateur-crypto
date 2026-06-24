import { SimulatorClient } from "@/components/SimulatorClient";
import { SimulatorHeader } from "@/components/SimulatorHeader";
import { AppShell } from "@/components/AppShell";
import { decodeScenario, defaultScenario, today } from "@/lib/scenario-url";

export default async function CryptoSimulatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
  }
  const scenario = decodeScenario(params, defaultScenario(today()));

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SimulatorHeader />
        <div className="mt-10">
          <SimulatorClient initialScenario={scenario} showFormationCTA />
        </div>
      </div>
    </AppShell>
  );
}
