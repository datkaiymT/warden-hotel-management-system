import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ScanSearch, ShieldAlert, MessageSquare, BarChart3, Settings, LogOut, Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean };
const items: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inspection", label: "Inspection Mode", icon: ScanSearch },
  { to: "/response", label: "Response Center", icon: ShieldAlert },
  { to: "/guest-mode", label: "Guest Assistant", icon: MessageSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function SidebarBody({ onNavigate, layoutId = "nav-active" }: { onNavigate?: () => void; layoutId?: string }) {
  const { user, logout, guestModeActive } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <div className="glass-strong h-full rounded-2xl flex flex-col p-4">
      <Link to="/dashboard" onClick={onNavigate} className="interactive flex items-center gap-2.5 px-2 py-3">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_50%,transparent)]">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display text-lg leading-none tracking-tight">WARDEN</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Hotel Robotics</div>
        </div>
      </Link>

      <nav className="mt-6 flex-1 space-y-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          const disabled = it.adminOnly && user?.role !== "admin";
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={cn(
                "interactive relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                disabled && "opacity-40 pointer-events-none"
              )}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-xl bg-white/5 border border-primary/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{it.label}</span>
              {it.adminOnly && <span className="relative ml-auto text-[9px] uppercase tracking-widest text-primary/70">admin</span>}
            </Link>
          );
        })}
      </nav>

      {guestModeActive && (
        <div className="mb-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          Guest Assistant Mode active
        </div>
      )}

      <div className="rounded-xl glass p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display text-sm">
            {user?.name?.slice(0, 1) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{user?.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{user?.role}</div>
          </div>
          <button onClick={() => { onNavigate?.(); logout(); }} className="interactive p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:block relative z-20 w-64 shrink-0 h-screen sticky top-0 p-4">
      <SidebarBody />
    </aside>
  );
}
