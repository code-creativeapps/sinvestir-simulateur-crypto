export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line-faint">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-xs leading-relaxed text-ink-faint sm:px-6">
        <p>
          Les simulateurs proposés sont mis à disposition gratuitement, à des
          fins exclusivement pédagogiques et informatives. Ils ne constituent en
          aucun cas un conseil en investissement, en fiscalité ou une
          recommandation personnalisée. Investir comporte des risques, y compris
          de perte en capital. Les performances passées ne préjugent en rien des
          performances futures. Les résultats obtenus sont purement indicatifs.
        </p>
        <p>
          Démo réalisée pour un test technique — données de marché via Binance
          (ou CoinGecko si configuré). Non affilié officiellement à S&rsquo;investir.
        </p>
      </div>
    </footer>
  );
}
