export function SimulatorHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-4">
        <span
          aria-hidden
          className="h-px w-10 bg-gradient-to-r from-transparent to-accent/50 sm:w-24"
        />
        <h1 className="text-3xl font-semibold uppercase tracking-tight sm:text-4xl">
          Simulateur Crypto
        </h1>
        <span
          aria-hidden
          className="h-px w-10 bg-gradient-to-l from-transparent to-accent/50 sm:w-24"
        />
      </div>

      <h2 className="mt-4 text-lg font-medium text-accent sm:text-xl">
        Calculez la performance historique d&rsquo;un investissement crypto, en
        DCA ou en une fois
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
        Choisissez une crypto, un montant, une fréquence (one-shot, quotidien,
        hebdomadaire ou mensuel) et une période. Le simulateur rejoue{" "}
        <strong className="font-medium text-ink">l&rsquo;historique réel des prix</strong>{" "}
        pour estimer ce que votre stratégie aurait donné&nbsp;:{" "}
        <strong className="font-medium text-ink">
          capital final, plus-value et performance
        </strong>
        .
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
        <p className="text-sm leading-relaxed text-white/70">
          <strong className="font-medium text-ink">
            Cet outil a une vocation pédagogique et illustrative.
          </strong>{" "}
          Il s&rsquo;appuie sur des données historiques&nbsp;: les performances
          passées ne préjugent en rien des performances futures et ne
          constituent pas un conseil en investissement.
        </p>
      </div>
    </header>
  );
}
