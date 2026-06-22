"use client";

import { useState } from "react";

/** Small info icon revealing helper text on hover/focus. */
export function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Plus d'informations"
        className="grid size-4 place-items-center rounded-full border border-line text-[10px] leading-none text-ink-faint transition hover:text-ink"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-xl border border-line bg-surface-raised px-3 py-2 text-xs font-normal text-ink-muted shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
