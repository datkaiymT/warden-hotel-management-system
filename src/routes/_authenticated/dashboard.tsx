import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Battery, Wifi, Bot, Clock, Activity, Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { FloorMap } from "@/components/FloorMap";
import { StatusPulse } from "@/components/StatusPulse";
import { useLive } from "@/lib/live-store";
import { ROOMS } from "@/lib/mock-data";
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useMemo } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — WARDEN" }, { name: "description", content: "Live overview of the WARDEN smart hotel robot." }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const robot = useLive((s) => s.robot);
  const sensors = useLive((s) => s.sensors);
  const alerts = useLive((s) => s.alerts);
  const tick = useLive((s) => s.tick);

  const sparkData = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({ x: i, y: 22 + Math.sin((i + tick) / 3) * 1.5 + Math.random() * 0.3 })),
    [tick]
  );

  return (
    <>
      <Topbar title="Mission Control" subtitle="Real-time overview of all hotel rooms and the WARDEN unit." />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KPI icon={<Battery className="h-5 w-5" />} label="Battery" value={`${robot.battery}%`} tone={robot.battery > 40 ? "primary" : "warning"} trend="+2h runtime" />
        <KPI icon={<Wifi className="h-5 w-5" />} label="Connection" value={robot.connected ? "Online" : "Offline"} tone={robot.connected ? "safe" : "critical"} trend="ROS2 link · 12ms" />
        <KPI icon={<Bot className="h-5 w-5" />} label="Mode" value={robot.mode.replace("-", " ")} tone="primary" trend={`speed ${robot.speed.toFixed(1)} m/s`} />
        <KPI icon={<Clock className="h-5 w-5" />} label="Uptime" value={`${Math.floor(robot.uptimeMinutes / 60)}h ${robot.uptimeMinutes % 60}m`} tone="primary" trend="since last reboot" />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <GlassCard className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display">Live Floor Map</h2>
              <p className="text-xs text-muted-foreground">Robot location tracking · simulated path</p>
            </div>
            <StatusPulse label="Patrolling" tone="primary" />
          </div>
          <div className="aspect-[16/9]">
            <FloorMap animateRobot />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display">Active Alerts</h2>
            <span className="text-xs text-muted-foreground">{alerts.filter((a) => !a.resolved).length} open</span>
          </div>
          <div className="space-y-2 max-h-[340px] overflow-y-auto overflow-x-hidden pr-1">
            {alerts.filter((a) => !a.resolved).slice(0, 6).map((a) => (
              <div key={a.id}
                className="glass rounded-xl p-3 border-l-2"
                style={{ borderLeftColor: a.severity === "critical" ? "var(--critical)" : a.severity === "warning" ? "var(--warning)" : "var(--primary)" }}>
                <div className="flex items-start gap-2 min-w-0">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: a.severity === "critical" ? "var(--critical)" : a.severity === "warning" ? "var(--warning)" : "var(--primary)" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">Room {a.room} · {timeAgo(a.ts)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/response" className="interactive mt-4 inline-block text-xs text-primary hover:underline">View all in Response Center →</Link>
        </GlassCard>
      </div>

      {/* sensors + rooms */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <GlassCard className="p-6">
          <Sensor icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={`${sensors.temperature}°C`} data={sparkData} />
        </GlassCard>
        <GlassCard className="p-6">
          <Sensor icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${sensors.humidity}%`} data={sparkData.map((d) => ({ ...d, y: d.y * 2 }))} />
        </GlassCard>
        <GlassCard className="p-6">
          <Sensor icon={<Wind className="h-4 w-4" />} label="Air Quality" value={`${sensors.airQuality} AQI`} data={sparkData.map((d) => ({ ...d, y: 95 - d.y / 5 }))} />
        </GlassCard>
        <GlassCard className="p-6">
          <Sensor icon={<Activity className="h-4 w-4" />} label="RF Signal" value={`${sensors.rfSignal} dB`} data={sparkData.map((d) => ({ ...d, y: 15 + d.y / 10 }))} />
        </GlassCard>
      </div>

      {/* room cards */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display">Live Room Monitoring</h2>
          <span className="text-xs text-muted-foreground">{ROOMS.length} rooms tracked</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {ROOMS.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <GlassCard className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-xl tracking-tight">{r.number}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Floor {r.floor}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Tile label="Temp" value={`${r.temperature}°`} />
                  <Tile label="Humid" value={`${r.humidity}%`} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{r.occupied ? "Occupied" : "Vacant"}</span>
                  <span>Scanned {r.lastInspected}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

function KPI({ icon, label, value, tone, trend }: { icon: React.ReactNode; label: string; value: string; tone: "primary" | "safe" | "warning" | "critical"; trend?: string }) {
  const toneText = { primary: "text-primary", safe: "text-safe", warning: "text-warning", critical: "text-critical" }[tone];
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl glass grid place-items-center ${toneText}`}>{icon}</div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-display text-2xl tracking-tight capitalize">{value}</div>
      {trend && <div className="text-[11px] text-muted-foreground mt-1">{trend}</div>}
    </GlassCard>
  );
}

function Sensor({ icon, label, value, data }: { icon: React.ReactNode; label: string; value: string; data: { x: number; y: number }[] }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon}<span className="uppercase tracking-widest">{label}</span></div>
      </div>
      <div className="mt-2 font-display text-2xl tracking-tight">{value}</div>
      <div className="h-12 -mx-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 215)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 215)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke="oklch(0.78 0.13 215)" strokeWidth={1.5} fill={`url(#g-${label})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: "safe" | "warning" | "critical" }) {
  const map = {
    safe: { bg: "bg-safe/15 text-safe border-safe/30", label: "Safe" },
    warning: { bg: "bg-warning/15 text-warning border-warning/30", label: "Warning" },
    critical: { bg: "bg-critical/20 text-critical border-critical/40", label: "Critical" },
  }[status];
  return <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${map.bg}`}>{map.label}</span>;
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-lg px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
