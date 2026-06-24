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
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tooltip?: string;
  valueClassName?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-card border p-4",
        emphasis
          ? "border-accent/20 bg-surface-tint"
          : "border-line-faint bg-white/[0.02]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div
        className={cn(
          "mt-1.5 font-semibold leading-tight tabular-nums",
          emphasis ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
          valueClassName,
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}
