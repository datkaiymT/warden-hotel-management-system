import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Save, Sliders, Bell, Bot as BotIcon, Users } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { MagneticButton } from "@/components/MagneticButton";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — WARDEN" }, { name: "description", content: "Configure sensors, notifications, robot preferences, and user access." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <Topbar title="Settings" subtitle={isAdmin ? "Configure the WARDEN ecosystem." : "Read-only — admin required to edit."} />

      {!isAdmin && (
        <div className="mb-4 glass rounded-2xl p-4 flex items-center gap-3 border border-warning/30">
          <Lock className="h-4 w-4 text-warning" />
          <span className="text-sm">You are signed in as <strong>staff</strong>. Configuration is read-only.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Section title="Sensor Thresholds" icon={<Sliders className="h-4 w-4 text-primary" />}>
          <Slider label="Max temperature (°C)" min={18} max={32} initial={26} disabled={!isAdmin} />
          <Slider label="Max humidity (%)" min={30} max={80} initial={55} disabled={!isAdmin} />
          <Slider label="RF threshold (dB)" min={5} max={40} initial={22} disabled={!isAdmin} />
          <Slider label="Min air quality (AQI)" min={50} max={100} initial={80} disabled={!isAdmin} />
        </Section>

        <Section title="Notifications" icon={<Bell className="h-4 w-4 text-primary" />}>
          <Toggle label="Critical alerts on all devices" initial disabled={!isAdmin} />
          <Toggle label="Warning alerts on desk dashboard" initial disabled={!isAdmin} />
          <Toggle label="Daily summary email (08:00)" initial disabled={!isAdmin} />
          <Toggle label="Push to mobile (PWA)" initial={false} disabled={!isAdmin} />
        </Section>

        <Section title="Robot Preferences" icon={<BotIcon className="h-4 w-4 text-primary" />}>
          <Select label="Patrol speed" options={["Slow (0.2 m/s)", "Normal (0.4 m/s)", "Fast (0.6 m/s)"]} initial="Normal (0.4 m/s)" disabled={!isAdmin} />
          <Select label="Patrol schedule" options={["Continuous", "Hourly", "On demand"]} initial="Continuous" disabled={!isAdmin} />
          <Toggle label="Return to dock when battery < 25%" initial disabled={!isAdmin} />
          <Toggle label="Voice greeting in Guest Mode" initial disabled={!isAdmin} />
        </Section>

        <Section title="User Access" icon={<Users className="h-4 w-4 text-primary" />}>
          <UserRow name="Alex Warden" role="admin" />
          <UserRow name="Jamie Reed" role="staff" />
          <UserRow name="Morgan Lee" role="staff" />
          {isAdmin && <MagneticButton size="sm" variant="ghost" className="mt-2">+ Invite team member</MagneticButton>}
        </Section>
      </div>

      {isAdmin && (
        <div className="mt-6 flex justify-end">
          <MagneticButton><Save className="h-4 w-4" /> Save changes</MagneticButton>
        </div>
      )}
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </GlassCard>
  );
}

function Slider({ label, min, max, initial, disabled }: { label: string; min: number; max: number; initial: number; disabled?: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-foreground/80">{label}</span>
        <span className="text-primary font-medium">{v}</span>
      </div>
      <input type="range" min={min} max={max} value={v} onChange={(e) => setV(+e.target.value)} disabled={disabled}
        className="interactive w-full accent-primary disabled:opacity-50" />
    </div>
  );
}

function Toggle({ label, initial, disabled }: { label: string; initial?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(!!initial);
  return (
    <button onClick={() => !disabled && setOn(!on)} disabled={disabled}
      className="interactive w-full flex items-center justify-between text-sm py-1 disabled:opacity-60">
      <span>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-primary" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-all ${on ? "left-4" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Select({ label, options, initial, disabled }: { label: string; options: string[]; initial: string; disabled?: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <label className="block text-sm">
      <span className="text-foreground/80">{label}</span>
      <select value={v} onChange={(e) => setV(e.target.value)} disabled={disabled}
        className="interactive mt-1.5 w-full h-10 px-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none text-sm disabled:opacity-60">
        {options.map((o) => <option key={o} value={o} className="bg-surface">{o}</option>)}
      </select>
    </label>
  );
}

function UserRow({ name, role }: { name: string; role: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-xs font-display">{name[0]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{name}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}
