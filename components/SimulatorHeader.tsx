export function SimulatorHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        <span className="size-1.5 rounded-full bg-accent" />
        Les simulateurs S&rsquo;investir
      </span>

      <h1 className="mt-4 text-3xl font-semibold uppercase tracking-tight sm:text-4xl">
        Simulateur Crypto
      </h1>

      <h2 className="mt-3 text-lg font-medium text-ink-muted sm:text-xl">
        Calculez la performance historique d&rsquo;un investissement crypto, en
        DCA ou en une fois
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Choisissez une crypto, un montant, une fréquence (one-shot, quotidien,
        hebdomadaire ou mensuel) et une période. Le simulateur rejoue
        l&rsquo;historique réel des prix pour estimer ce que votre stratégie
        aurait donné&nbsp;: capital final, plus-value et performance.
      </p>

      <div className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-card border border-accent/20 bg-surface-tint p-4 text-left">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="mt-0.5 shrink-0 text-accent"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-sm leading-relaxed text-ink-muted">
          Cet outil a une vocation pédagogique et illustrative. Il s&rsquo;appuie
          sur des données historiques&nbsp;: les performances passées ne
          préjugent en rien des performances futures et ne constituent pas un
          conseil en investissement.
        </p>
      </div>
    </header>
  );
}
