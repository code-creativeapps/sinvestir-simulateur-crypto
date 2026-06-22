import { SimulatorClient } from "@/components/SimulatorClient";
import { SimulatorHeader } from "@/components/SimulatorHeader";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
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
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="bg-hero-glow flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <SimulatorHeader />
          <div className="mt-10">
            <SimulatorClient initialScenario={scenario} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
