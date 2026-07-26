import { Link } from "@tanstack/react-router";
import { Wallet, LayoutDashboard, Sparkles, Home } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Wallet className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
            </span>
            <span className="font-display text-2xl leading-none">
              Penny<span className="text-primary">Wise</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" icon={<Home className="h-4 w-4" />} label="Home" exact />
            <NavLink
              to="/dashboard"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label="Dashboard"
            />
            <NavLink to="/insights" icon={<Sparkles className="h-4 w-4" />} label="Insights" />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 pb-24">{children}</main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Made for Indian college students · Data stays on this device
      </footer>
    </div>
  );
}

function NavLink({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      activeProps={{
        className:
          "bg-primary text-primary-foreground shadow-soft",
      }}
      inactiveProps={{
        className: "text-muted-foreground hover:text-foreground hover:bg-muted",
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
