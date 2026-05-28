import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  GitBranch,
  Map,
  Percent,
  Shield,
  Table2,
  BookOpen,
  Layers,
  Menu,
  X,
  FileText,
  Activity,
} from "lucide-react";
import { YearProvider } from "../context/YearContext";

type NavItem = { to: string; label: string; icon: typeof FileText; testId: string };

const mainNav: NavItem[] = [
  { to: "/", label: "Editorial brief", icon: FileText, testId: "nav-show-plan" },
  { to: "/margins", label: "Margins", icon: Percent, testId: "nav-margins" },
  { to: "/flows", label: "Seat flows", icon: GitBranch, testId: "nav-seat-flows" },
  { to: "/overview", label: "Statewide", icon: BarChart3, testId: "nav-overview" },
];

const toolsNav: NavItem[] = [
  { to: "/explorer", label: "Explorer", icon: Table2, testId: "nav-explorer" },
];

const moreNav: NavItem[] = [
  { to: "/geography", label: "Geography", icon: Map, testId: "nav-geography" },
  { to: "/reserved", label: "Reserved seats", icon: Shield, testId: "nav-reserved" },
  { to: "/depth", label: "Ballots & turnout", icon: Layers, testId: "nav-depth" },
  { to: "/deep", label: "Deep insights", icon: Activity, testId: "nav-deep" },
];

const footerNav: NavItem[] = [
  { to: "/methods", label: "Sources", icon: BookOpen, testId: "nav-methods" },
];

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <div className="px-3 pt-2">
      <p className="px-3 text-[10px] uppercase tracking-wider text-[var(--color-muted)]/80 mb-1">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onNavigate}
            data-testid={testId}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-panel-hover)] hover:text-white"
              }`
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <header className="p-4 sm:p-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] font-medium">
          AtliQ Media
        </p>
        <h1 className="font-display text-xl sm:text-2xl mt-1 leading-tight text-[var(--color-accent)]">
          TN Assembly 2026
        </h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">Election results briefing</p>
      </header>
      <nav className="flex-1 py-2 overflow-y-auto">
        <NavSection title="Briefing" items={mainNav} onNavigate={onNavigate} />
        <NavSection title="Tools" items={toolsNav} onNavigate={onNavigate} />
        <NavSection title="More" items={moreNav} onNavigate={onNavigate} />
        <NavSection title="" items={footerNav} onNavigate={onNavigate} />
      </nav>
      <footer className="p-4 text-[10px] text-[var(--color-muted)] border-t border-[var(--color-border)] leading-relaxed shrink-0">
        ECI public data · Descriptive analysis only
      </footer>
    </>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <YearProvider>
      <div className="flex min-h-[100dvh]">
        <aside className="hidden md:flex w-52 lg:w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-panel)]/80 backdrop-blur-md flex-col">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <button
              type="button"
              className="flex-1 bg-black/60"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="w-[min(280px,85vw)] shrink-0 bg-[var(--color-panel)] border-r border-[var(--color-border)] flex flex-col shadow-xl">
              <div className="flex justify-end p-2 border-b border-[var(--color-border)]">
                <button
                  type="button"
                  className="p-2 text-[var(--color-muted)] hover:text-white"
                  aria-label="Close navigation"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="md:hidden shrink-0 flex items-center gap-3 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-panel)]/90">
            <button
              type="button"
              className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white"
              aria-label="Open navigation"
              data-testid="mobile-nav-toggle"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-display text-lg text-[var(--color-accent)]">TN Assembly 2026</span>
          </div>

          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="flex flex-1 flex-col min-h-0 h-full w-full max-w-[1600px] mx-auto px-3 py-3 sm:px-4 lg:px-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </YearProvider>
  );
}
