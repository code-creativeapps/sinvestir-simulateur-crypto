import Link from "next/link";

export function TopBar() {
  return (
    <div className="border-b border-line-faint">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-accent text-sm text-white">
            S
          </span>
          <span>
            S&rsquo;investir <span className="text-ink-muted">Simulateurs</span>
          </span>
        </Link>
        <a
          href="https://sinvestir.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-pill border border-line px-4 py-1.5 text-sm text-ink-muted transition hover:text-ink"
        >
          Découvrir S&rsquo;investir
        </a>
      </div>
    </div>
  );
}
