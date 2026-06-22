import { NextResponse } from "next/server";
import { getProvider } from "@/lib/prices";

// Run in EU regions: closer to the price sources and avoids US geo-blocks.
export const preferredRegion = ["fra1", "cdg1"];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/history?id=BTCEUR&from=2018-01-01&to=2026-06-22
 * Returns daily prices: { prices: [{ date, price }] }.
 * `id` is provider-specific (a Binance pair, or a CoinGecko id).
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id")?.trim();
  const from = params.get("from")?.trim();
  const to = params.get("to")?.trim();

  if (!id || !from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    return NextResponse.json(
      { error: "Paramètres requis : id, from (yyyy-mm-dd), to (yyyy-mm-dd)." },
      { status: 400 },
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "La date de début doit précéder la date de fin." },
      { status: 400 },
    );
  }

  try {
    const prices = await getProvider().history(id, from, to);
    return NextResponse.json({ prices });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status: number }).status
        : 502;
    const message = err instanceof Error ? err.message : "Service indisponible.";
    return NextResponse.json({ error: message }, { status });
  }
}
