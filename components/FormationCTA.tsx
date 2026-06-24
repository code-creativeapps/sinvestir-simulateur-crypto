/** "Formation offerte" call-to-action, mirroring the suite's footer CTA. */
export function FormationCTA() {
  return (
    <div className="mt-6 overflow-hidden rounded-card border border-line-faint bg-surface-raised">
      <div className="flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
        <div className="max-w-xl">
          <h3 className="text-xl font-semibold sm:text-2xl">
            Accédez à notre Formation Offerte
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Comment investir pour protéger votre avenir financier et vous
            générer des revenus passifs (même en partant de zéro et sans
            connaissance).
          </p>
          <a
            href="https://sinvestir.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-pill bg-brand px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Accéder à la formation
          </a>
        </div>

        {/* Badge — evokes the suite's gold "FORMATION OFFERTE" emblem */}
        <div className="grid size-28 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gradient-to-b from-brand/40 to-surface text-center shadow-inner">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold/80">
              Formation
            </div>
            <div className="font-heading text-lg font-extrabold uppercase tracking-wide text-gold">
              Offerte
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
