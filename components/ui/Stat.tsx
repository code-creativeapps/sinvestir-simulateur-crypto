import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";

/** A single key-figure cell ("Chiffres clés"). */
export function Stat({
  label,
  value,
  hint,
  tooltip,
  valueClassName,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tooltip?: string;
  valueClassName?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card border p-4",
        emphasis
          ? "border-accent/20 bg-surface-tint"
          : "border-line-faint bg-white/[0.02]",
      )}
    >
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div
        className={cn(
          "mt-1.5 font-semibold tabular-nums",
          emphasis ? "text-2xl" : "text-xl",
          valueClassName,
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}
