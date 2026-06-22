import { NextResponse } from "next/server";
import { getProvider } from "@/lib/prices";

/**
 * GET /api/coins?q=bitcoin
 * Empty query → popular coins. Otherwise a name/symbol search.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const provider = getProvider();
  try {
    const coins = q ? await provider.search(q) : await provider.topCoins();
    return NextResponse.json({ coins });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status: number }).status
        : 502;
    const message = err instanceof Error ? err.message : "Service indisponible.";
    return NextResponse.json({ error: message }, { status });
  }
}
