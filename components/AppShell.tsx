"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

/* — Minimal inline icons (stroke = currentColor) — */
type IconProps = { className?: string };
const I = (path: React.ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn("size-5 shrink-0", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {path}
      </svg>
    );
  };

const DashIcon = I(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);
const SimIcon = I(<path d="M4 19V5m0 14h16M8 15l3-4 3 3 4-6" />);
const CompareIcon = I(
  <>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M6 8.5v6A3.5 3.5 0 0 0 9.5 18H15M18 15.5v-6A3.5 3.5 0 0 0 14.5 6H9" />
  </>,
);
const BookmarkIcon = I(<path d="M6 4h12v16l-6-4-6 4V4z" />);
const GiftIcon = I(
  <>
    <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
    <path d="M3.5 13h17M12 9v11M12 9C9 9 7.5 4 12 4s3 5 0 5z" />
  </>,
);
const GearIcon = I(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v2.5M12 19v2.5M4.4 7l2.2 1.3M17.4 15.7l2.2 1.3M19.6 7l-2.2 1.3M6.6 15.7L4.4 17M2.5 12H5M19 12h2.5" />
  </>,
);
const BulbIcon = I(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
  </>,
);
const LogoutIcon = I(
  <>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>,
);
const ChevronIcon = I(<path d="M15 6l-6 6 6 6" />);
const MenuIcon = I(<path d="M3 6h18M3 12h18M3 18h18" />);
const CloseIcon = I(<path d="M6 6l12 12M18 6L6 18" />);

const NAV = [
  { label: "Tableau de bord", icon: DashIcon },
  { label: "Les simulateurs", icon: SimIcon, active: true },
  { label: "Les comparateurs", icon: CompareIcon },
  { label: "Mes simulations", icon: BookmarkIcon },
  { label: "Formation offerte", icon: GiftIcon },
];

const FOOTER = [
  { label: "Gérer mon compte", icon: GearIcon },
  { label: "Faire une suggestion", icon: BulbIcon },
];

/** Profile + nav + account actions — shared by the desktop rail and mobile drawer. */
function SidebarContent({
  collapsed = false,
  onItemClick,
}: {
  collapsed?: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Profile */}
      <div
        className={cn(
          "flex items-center gap-3 px-1 py-1",
          collapsed && "justify-center",
        )}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/5 text-base font-semibold text-ink ring-1 ring-line">
          KM
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">
              Karim M.
            </span>
            <span className="block truncate text-xs text-accent/80">
              karim.mortabit@gmail.com
            </span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-7 flex flex-col gap-1.5">
        {NAV.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            onClick={onItemClick}
            title={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3.5 rounded-xl px-3 py-3 text-[15px] transition",
              collapsed && "justify-center",
              active
                ? "bg-white/[0.06] font-medium text-ink"
                : "text-ink-muted hover:bg-white/5 hover:text-ink",
            )}
          >
            {active && !collapsed && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-accent"
              />
            )}
            <Icon className={active ? "text-accent" : undefined} />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Account actions */}
      <div className="mt-auto flex flex-col gap-1.5 pt-8">
        {FOOTER.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={onItemClick}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-xl px-3 py-3 text-[15px] text-ink-muted transition hover:bg-white/5 hover:text-ink",
              collapsed && "justify-center",
            )}
          >
            <Icon />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
        <button
          type="button"
          onClick={onItemClick}
          title={collapsed ? "Déconnexion" : undefined}
          className="mt-2 flex items-center justify-center gap-3 rounded-pill bg-brand px-3 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          <LogoutIcon />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}

function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 self-start p-4 lg:sticky lg:top-0 lg:block lg:h-screen",
        collapsed ? "w-24" : "w-72",
      )}
    >
      <div className="relative flex h-full flex-col rounded-3xl border border-line-faint bg-surface-raised/50 p-4">
        {/* Collapse handle — straddles the panel's right edge, centred vertically */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
          className="absolute -right-3 top-1/2 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface-raised text-ink-muted shadow-lg transition hover:text-ink"
        >
          <ChevronIcon className={cn("size-4 transition", collapsed && "rotate-180")} />
        </button>

        <SidebarContent collapsed={collapsed} />
      </div>
    </aside>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-0 top-0 flex h-full w-72 max-w-[82%] flex-col bg-surface-raised p-4 shadow-2xl">
        <div className="mb-2 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="grid size-9 place-items-center rounded-full text-ink-muted transition hover:bg-white/5 hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SidebarContent onItemClick={onClose} />
        </div>
      </div>
    </div>
  );
}

/** Top bar inside the main column — logo, desktop link, mobile menu button. */
function MainHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="border-b border-line-faint">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          <a
            href="https://sinvestir.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline"
          >
            Découvrir S&rsquo;investir
          </a>
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
            className="grid size-10 place-items-center rounded-xl text-ink transition hover:bg-white/5 lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The S'investir suite chrome: collapsible left sidebar (desktop) / slide-in
 * drawer (mobile), plus a branded top bar and footer. The simulator page
 * renders as `children`. The /embed route is intentionally chrome-less.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="bg-hero-glow flex min-w-0 flex-1 flex-col">
        <MainHeader onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </main>
    </div>
  );
}
