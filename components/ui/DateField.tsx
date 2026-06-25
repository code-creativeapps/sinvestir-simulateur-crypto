"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { formatDate } from "@/lib/format";

/** Parse an ISO date-only string ("YYYY-MM-DD") into a local Date (no TZ shift). */
function parseISO(iso: string): Date | undefined {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Format a Date back to an ISO date-only string in local time. */
function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-faint">
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Branded calendar date picker (replaces the basic native <input type="date">).
 * French locale + formatting, month/year dropdowns for fast multi-year jumps.
 */
export function DateField({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id?: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = parseISO(value);
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;

  const disabled: Matcher[] = [];
  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 border-b border-line bg-transparent py-2 text-left text-lg text-ink transition hover:border-accent"
      >
        <span>{selected ? formatDate(value) : "—"}</span>
        <CalendarIcon />
      </button>

      {open && (
        <div className="calendar absolute left-0 z-30 mt-2 rounded-xl border border-line bg-surface-raised p-2 shadow-2xl">
          <DayPicker
            mode="single"
            locale={fr}
            selected={selected}
            defaultMonth={selected ?? maxDate}
            startMonth={new Date(2010, 0)}
            endMonth={maxDate ?? new Date()}
            captionLayout="dropdown"
            disabled={disabled}
            onSelect={(d) => {
              if (!d) return;
              onChange(toISO(d));
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
