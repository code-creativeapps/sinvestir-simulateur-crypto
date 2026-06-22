import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-hero-glow flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-pill border border-line bg-white/5 px-4 py-1 text-sm text-ink-muted">
        Les simulateurs S&rsquo;investir
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">
        Simulateur Crypto
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Simulez la performance historique d&rsquo;un investissement crypto en
        DCA ou one-shot.
      </p>
      <Link
        href="/les-simulateurs/crypto"
        className="mt-8 rounded-pill bg-accent px-6 py-3 font-medium text-white transition hover:opacity-90"
      >
        Lancer le simulateur
      </Link>
    </main>
  );
}
