import { SimulatorClient } from "@/components/SimulatorClient";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <SimulatorClient initialScenario={scenario} />
    </main>
  );
}
