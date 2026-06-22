# Simulateur Crypto — S'investir

Transposition du **simulateur crypto** de [`sinvestir.fr`](https://sinvestir.fr/simulateur-crypto-monnaie/)
au design et aux standards de la suite [`simulateurs.sinvestir.fr`](https://simulateurs.sinvestir.fr).

On reprend la **logique fonctionnelle** (backtest historique DCA / one-shot) et on
l'habille au thème S'investir, dans un composant **autonome et embarquable**.

> 🔗 **Démo en ligne** : https://sinvestir-one.vercel.app/les-simulateurs/crypto
> 🧩 **Aperçu intégrable (iframe)** : https://sinvestir-one.vercel.app/embed

---

## Ce que fait le simulateur

À partir de données de prix **réelles**, il rejoue une stratégie d'investissement :

- **Entrées** : crypto-actif · montant par versement · fréquence (_une fois_, quotidien,
  hebdomadaire, mensuel) · date de début · date de fin.
- **Chiffres clés** : Investi · Acquis (quantité) · Prix moyen d'acquisition ·
  Capital final · Performance %.
- **Historique** : graphique (séries Valeur / Investi / Prix / Acquis, activables, + brush
  de dates) et vue **Calendrier** (décomposition annuelle).
- **Partage** : tout le scénario est encodé dans l'URL → lien partageable, et la même URL
  pilote la route `/embed`.

---

## Stack & partis pris

| Choix | Pourquoi |
| --- | --- |
| **Next.js 16** (App Router, TS) | Même framework que la suite S'investir → intégrable directement. Route handlers = proxy/cache propre côté serveur. |
| **Tailwind v4** | Tokens de design (couleurs, radius, polices) calibrés sur le thème **sombre** réel des simulateurs in-app. |
| **Recharts** | Graphique léger, déclaratif, SSR-friendly. |
| **Binance API (public, sans clé)** | Source de prix par défaut : fiable depuis Vercel, EUR natif sur les paires majeures. |
| **CoinGecko (optionnel)** | Activé si `COINGECKO_API_KEY` est défini → couverture 7000+ cryptos, EUR natif. |
| **Vercel** | Plateforme cible de la suite. |
| **Pas de base de données** | La démo est autonome ; « Partager » passe par l'URL. Voir ci-dessous le point d'ancrage Supabase. |

### Pourquoi Binance et pas CoinGecko par défaut ?

L'API publique CoinGecko **sans clé** est bloquée (403 Cloudflare) depuis les IP datacenter
(dont Vercel). Pour garantir une **démo qui marche sans secret**, la source par défaut est
l'API publique Binance (klines quotidiens). L'adaptateur CoinGecko reste disponible et prend
le relais automatiquement dès qu'une clé `COINGECKO_API_KEY` est fournie — voir
`lib/prices.ts`. Les deux exposent la même interface `PriceProvider`.

> ℹ️ Les paires EUR de Binance sont parfois plus récentes (ex. `BTCEUR` depuis ~2020). Le
> simulateur démarre alors au premier jour de données disponibles (indiqué sous les résultats).
> Certaines cryptos ne sont cotées qu'en USDT : l'affichage passe alors en `$`.

### Point d'ancrage Supabase (Enregistrer / Partager)

Le bouton **« Enregistrer la simulation »** est présent (fidélité au design) mais désactivé :
dans la suite S'investir, il se brancherait sur **Supabase** (compte utilisateur + table de
scénarios). Le scénario étant déjà entièrement sérialisé (`lib/scenario-url.ts`), le
brancher revient à persister cet objet — sans toucher au reste.

---

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:3000
```

Page principale : `/les-simulateurs/crypto`. Version embarquable : `/embed`.

Optionnel — activer CoinGecko :

```bash
cp .env.example .env.local
# puis renseigner COINGECKO_API_KEY
```

### Tests

```bash
npm test         # Vitest — moteur de backtest (lib/backtest.ts)
```

---

## Intégration (embedding)

Le composant est conçu pour être embarqué proprement (peu de dépendances, chrome minimal,
scénario par URL). Exemple :

```html
<iframe
  src="https://sinvestir-one.vercel.app/embed?c=BTCEUR&s=BTC&n=Bitcoin&cur=EUR&a=25&f=weekly&from=2018-01-01&to=2026-06-22"
  width="100%"
  height="900"
  style="border:0"
  title="Simulateur Crypto S'investir"
></iframe>
```

La page `/embed` envoie sa hauteur au parent (`postMessage`) pour un auto-resize optionnel :

```js
window.addEventListener("message", (e) => {
  if (e.data?.type === "sinvestir:height") iframe.style.height = e.data.height + "px";
});
```

---

## Architecture

```
app/
  les-simulateurs/crypto/page.tsx  # page principale (mime la route de la suite)
  embed/page.tsx                   # version iframe (chrome minimal)
  api/coins/route.ts               # liste / recherche de cryptos
  api/history/route.ts             # historique de prix quotidien
components/                        # SimulatorClient, ScenarioForm, CoinSelect,
                                   # ResultsPanel, HistoryChart, CalendarTable, ui/*
lib/
  backtest.ts                      # moteur pur (testé)
  prices.ts | binance.ts | coingecko.ts   # fournisseurs de prix
  scenario-url.ts                  # (dé)sérialisation du scénario
  useBacktest.ts | format.ts | cn.ts
__tests__/backtest.test.ts
```

Le **moteur de calcul** (`lib/backtest.ts`) est pur et sans I/O → unit-testé, réutilisable
côté serveur comme client.

---

## Suggestions d'amélioration (regard de partenaire)

- **Internaliser** le simulateur crypto (il repose aujourd'hui sur un widget tiers Fritzy en
  iframe) → contrôle de la donnée, SEO, design cohérent, pas de dépendance externe.
- **Backtest net d'inflation / net de frais**, en réutilisant les simulateurs Inflation et
  Frais déjà présents dans la suite.
- **Overlay benchmark** « DCA crypto vs ETF World / S&P 500 » pour relativiser la performance.
- **Cache CoinGecko/prix mutualisé** au niveau infra, réutilisable par tous les simulateurs.
- **Scénarios prédéfinis** + **image OG** dynamique des résultats pour le partage social.
- **Sauvegarde Supabase** + **build web-component** embarquable dans les articles `sinvestir.fr`.

---

## Limites assumées (cadre du test)

- Données quotidiennes (pas intra-day) ; profondeur d'historique selon la paire.
- Pas d'auth/persistance (volontaire) ; « Enregistrer » est un placeholder.
- Outil **pédagogique** : les performances passées ne préjugent pas des performances futures.
