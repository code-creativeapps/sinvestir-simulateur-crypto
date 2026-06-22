import { SimulatorClient } from "@/components/SimulatorClient";
import { EmbedHeightReporter } from "@/components/EmbedHeightReporter";
import { decodeScenario, defaultScenario, today } from "@/lib/scenario-url";

/**
 * Minimal-chrome version of the simulator, designed to be dropped into an
 * <iframe> on sinvestir.fr. Scenario is read from query params.
 */
export default async function EmbedPage({
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
    <main className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4">
      <SimulatorClient initialScenario={scenario} />
      <p className="mt-4 text-center text-xs text-ink-faint">
        Simulateur{" "}
        <a
          href="https://simulateurs.sinvestir.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          S&rsquo;investir
        </a>
      </p>
      <EmbedHeightReporter />
    </main>
  );
}
