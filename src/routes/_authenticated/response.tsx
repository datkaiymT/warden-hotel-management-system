import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, Filter, Lock, ChevronDown } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { MagneticButton } from "@/components/MagneticButton";
import { useLive } from "@/lib/live-store";
import { useAuth } from "@/lib/auth";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/response")({
  head: () => ({ meta: [{ title: "Response Center — WARDEN" }, { name: "description", content: "Real-time alerts, incident logs, and recommended staff actions." }] }),
  component: ResponsePage,
});

function ResponsePage() {
  const alerts = useLive((s) => s.alerts);
  const ackAlert = useLive((s) => s.ackAlert);
  const resolveAlert = useLive((s) => s.resolveAlert);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info" | "open">("open");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "open") return !a.resolved;
    return a.severity === filter;
  });

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && !a.resolved).length,
    warning: alerts.filter((a) => a.severity === "warning" && !a.resolved).length,
    resolved: alerts.filter((a) => a.resolved).length,
  };

  const histogram = [
    { name: "Mon", alerts: 4 }, { name: "Tue", alerts: 7 }, { name: "Wed", alerts: 3 },
    { name: "Thu", alerts: 9 }, { name: "Fri", alerts: 5 }, { name: "Sat", alerts: 2 }, { name: "Sun", alerts: 6 },
  ];

  return (
    <>
      <Topbar title="Response Center" subtitle="Live alerts, incident history, and recommended staff actions." />

      <div className="grid grid-cols-4 gap-4">
        <Stat tone="critical" label="Critical · Open" value={counts.critical} icon={<AlertTriangle className="h-4 w-4" />} />
        <Stat tone="warning" label="Warning · Open" value={counts.warning} icon={<AlertTriangle className="h-4 w-4" />} />
        <Stat tone="safe" label="Resolved · 7d" value={counts.resolved} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat tone="primary" label="Avg Response" value="2.4m" icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <GlassCard className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Incident Log</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {(["open", "critical", "warning", "info", "all"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`interactive px-2.5 py-1 rounded-lg capitalize ${filter === f ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((a) => {
                const open = expanded === a.id;
                const color = a.severity === "critical" ? "var(--critical)" : a.severity === "warning" ? "var(--warning)" : "var(--primary)";
                return (
                  <motion.div key={a.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass rounded-xl overflow-hidden border-l-2" style={{ borderLeftColor: color }}>
                    <button onClick={() => setExpanded(open ? null : a.id)}
                      className="interactive w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                      <AlertTriangle className="h-4 w-4 shrink-0" style={{ color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{a.title}</span>
                          {a.resolved && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-safe/15 text-safe border border-safe/30">resolved</span>}
                          {!a.resolved && a.acknowledged && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">ack</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Room {a.room} · {timeAgo(a.ts)} · {a.severity}</div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4">
                          <div className="text-sm text-foreground/80 mb-3">{a.detail}</div>
                          <div className="glass rounded-lg p-3 mb-3">
                            <div className="text-[10px] uppercase tracking-widest text-primary mb-1">Recommended action</div>
                            <div className="text-sm">{a.recommendation}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!a.acknowledged && (
                              <MagneticButton size="sm" variant="ghost" onClick={() => ackAlert(a.id)}>Acknowledge</MagneticButton>
                            )}
                            {!a.resolved && (
                              <MagneticButton size="sm" variant={isAdmin ? "primary" : "ghost"} onClick={() => isAdmin && resolveAlert(a.id)} disabled={!isAdmin}>
                                {!isAdmin && <Lock className="h-3 w-3" />}
                                {isAdmin ? "Resolve / Dispatch" : "Admin required"}
                              </MagneticButton>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No alerts in this filter.</div>}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="font-display mb-3">Alert Frequency · 7d</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram}>
                  <XAxis dataKey="name" tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "oklch(1 0 0 / 0.04)" }} contentStyle={{ background: "oklch(0.21 0.028 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="alerts" fill="oklch(0.78 0.13 215)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-display mb-3">Notifications</h3>
            <div className="space-y-2 text-sm">
              {["Critical alerts → all devices", "Warnings → desk dashboard", "Daily summary at 08:00", "Sensor faults → admin only"].map((n) => (
                <div key={n} className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-foreground/80">{n}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-safe" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}

function Stat({ tone, label, value, icon }: { tone: "critical" | "warning" | "safe" | "primary"; label: string; value: number | string; icon: React.ReactNode }) {
  const c = { critical: "text-critical", warning: "text-warning", safe: "text-safe", primary: "text-primary" }[tone];
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl glass grid place-items-center ${c}`}>{icon}</div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 font-display text-2xl">{value}</div>
    </GlassCard>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
