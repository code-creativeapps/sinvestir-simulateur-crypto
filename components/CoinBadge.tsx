/* eslint-disable @next/next/no-img-element */
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
  if (image) {
    return (
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        className={cn("rounded-full", className)}
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
