/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

// Deterministic accent color per ticker so coins are visually distinguishable.
const COLORS = [
  "#1098f7", "#f8d047", "#22c55e", "#a855f7", "#f97316",
  "#ec4899", "#14b8a6", "#ef4444", "#6366f1", "#84cc16",
];

function colorFor(symbol: string): string {
  let h = 0;
  for (let i = 0; i < symbol.length; i += 1) h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

/**
 * Public, symbol-keyed icon CDN (loads in the user's browser, so it's not
 * affected by the server-side geo-blocks that shape our price source choice).
 * Covers the popular coins; misses fall back to the generated initials badge.
 */
function iconUrl(symbol: string): string {
  return `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`;
}

export function CoinBadge({
  symbol,
  image,
  size = 28,
  className,
}: {
  symbol: string;
  image?: string;
  size?: number;
  className?: string;
}) {
  // Prefer a provider-supplied image (e.g. CoinGecko); otherwise the CDN icon.
  const src = image ?? iconUrl(symbol);
  // Track the src that failed so changing coins re-attempts the new icon.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-full", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-surface",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: colorFor(symbol),
        fontSize: size * 0.4,
      }}
    >
      {symbol.slice(0, 3)}
    </span>
  );
}
