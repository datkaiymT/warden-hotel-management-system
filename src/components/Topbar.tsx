import { useLive } from "@/lib/live-store";
import { StatusPulse } from "./StatusPulse";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { MobileNav } from "./MobileNav";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const robot = useLive((s) => s.robot);
  const health = useLive((s) => s.systemHealth);
  const alerts = useLive((s) => s.alerts.filter((a) => !a.resolved).length);
  const { theme, toggle } = useTheme();

  return (
    <header className="flex items-center justify-between gap-3 md:gap-6 pt-4 md:pt-6 pb-4">
      <div className="flex items-center gap-3 min-w-0">
        <MobileNav />
        <div className="min-w-0">
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-3xl font-display tracking-tight truncate">
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="hidden md:block text-sm text-muted-foreground mt-1">
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden xl:flex items-center gap-3">
          <StatusPulse label="Robot Connected" active={robot.connected} tone="primary" />
          <StatusPulse label="Sensors Active" active={health.sensorsActive} tone="safe" />
          <StatusPulse label="Cloud Sync Online" active={health.cloudSync} tone="primary" />
          <StatusPulse label="Room Scan Running" active={health.roomScan} tone="primary" />
        </div>
        <div className="flex xl:hidden items-center gap-2 glass rounded-xl px-2.5 py-1.5">
          <span className={`relative h-2 w-2 rounded-full ${robot.connected ? "bg-safe" : "bg-critical"}`}>
            {robot.connected && <span className="absolute inset-0 rounded-full bg-safe animate-pulse-ring" />}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{robot.connected ? "Live" : "Offline"}</span>
        </div>

        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="interactive h-10 w-10 rounded-xl glass grid place-items-center hover:bg-white/10 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <div className="interactive h-10 w-10 rounded-xl glass grid place-items-center hover:bg-white/10 transition-colors cursor-none">
            <Bell className="h-4 w-4" />
            {alerts > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-critical text-[10px] font-bold grid place-items-center text-destructive-foreground">
                {alerts}
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:flex h-10 px-3 rounded-xl glass items-center gap-2 text-sm text-muted-foreground min-w-[200px]">
          <Search className="h-4 w-4" />
          <span className="text-xs">Search rooms, alerts…</span>
        </div>
      </div>
    </header>
  );
}
