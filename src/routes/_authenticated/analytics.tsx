import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — WARDEN" }, { name: "description", content: "Inspection statistics, alert frequency, and robot usage analytics." }] }),
  component: AnalyticsPage,
});

const days = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  inspections: 30 + Math.round(Math.sin(i / 2) * 8 + Math.random() * 5),
  alerts: Math.round(Math.abs(Math.sin(i / 3)) * 10 + Math.random() * 4),
}));
const alertTypes = [
  { type: "RF anomaly", count: 12 },
  { type: "Missing amenity", count: 23 },
  { type: "Humidity", count: 9 },
  { type: "Smoke", count: 2 },
  { type: "Motion", count: 7 },
];
const safety = [
  { name: "Safe", value: 64, color: "oklch(0.78 0.16 165)" },
  { name: "Warning", value: 22, color: "oklch(0.82 0.16 85)" },
  { name: "Critical", value: 4, color: "oklch(0.68 0.22 22)" },
];
const usage = Array.from({ length: 24 }, (_, h) => ({ h: `${h}h`, value: Math.round(20 + Math.sin((h - 6) / 4) * 30 + Math.random() * 6) }));

function AnalyticsPage() {
  return (
    <>
      <Topbar title="Analytics" subtitle="Inspection performance, alert trends, and robot utilization." />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Inspections · 14d" value="487" delta="+12% vs prior" />
        <Kpi label="Alerts triggered" value="63" delta="−8% vs prior" />
        <Kpi label="Avg scan time" value="4m 12s" delta="−0:18 vs prior" />
        <Kpi label="Robot uptime" value="98.4%" delta="target 97%" />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <GlassCard className="col-span-2 p-6">
          <h3 className="font-display mb-1">Inspections vs Alerts · 14 days</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily inspection volume and alerts surfaced.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={days}>
                <defs>
                  <linearGradient id="ins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 215)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 215)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="al" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 22)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.68 0.22 22)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.028 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="inspections" stroke="oklch(0.78 0.13 215)" fill="url(#ins)" strokeWidth={2} />
                <Area type="monotone" dataKey="alerts" stroke="oklch(0.68 0.22 22)" fill="url(#al)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-display mb-1">Room Safety Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Current snapshot across 90 rooms.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={safety} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} stroke="oklch(0.21 0.028 250)" strokeWidth={3}>
                  {safety.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: "oklch(0.72 0.025 240)" }} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.028 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <GlassCard className="p-6">
          <h3 className="font-display mb-4">Alert Frequency by Type</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertTypes} layout="vertical">
                <XAxis type="number" tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="type" tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.028 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                <Bar dataKey="count" fill="oklch(0.86 0.08 230)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-2 p-6">
          <h3 className="font-display mb-1">Robot Usage · 24h</h3>
          <p className="text-xs text-muted-foreground mb-4">Active minutes per hour of day.</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usage}>
                <XAxis dataKey="h" tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "oklch(0.72 0.025 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.028 250)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="value" stroke="oklch(0.78 0.13 215)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <GlassCard className="p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl">{value}</div>
      <div className="text-[11px] text-primary mt-1">{delta}</div>
    </GlassCard>
  );
}
