"use client";

import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/Tooltip";

/** Label row (label + optional tooltip) wrapping any control. */
export function Field({
  label,
  tooltip,
  htmlFor,
  children,
  className,
}: {
  label: string;
  tooltip?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm text-ink-muted"
      >
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
    </div>
  );
}

/** Text/number input with an inline unit suffix (EUR, %, …). */
export function UnitInput({
  id,
  value,
  onChange,
  unit,
  inputMode = "decimal",
  ...props
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "id"
>) {
  return (
    <div className="flex items-center gap-2 border-b border-line transition focus-within:border-accent">
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2 text-lg text-ink outline-none placeholder:text-ink-faint"
        {...props}
      />
      {unit && (
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-faint">
          {unit}
        </span>
      )}
    </div>
  );
}
