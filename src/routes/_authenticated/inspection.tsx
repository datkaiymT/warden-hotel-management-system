import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Camera, Pause, Play, SkipForward, ShieldAlert, CheckCircle2, XCircle, Radio, Thermometer, Droplets, Wind, Eye, Lock } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { FloorMap } from "@/components/FloorMap";
import { MagneticButton } from "@/components/MagneticButton";
import { StatusPulse } from "@/components/StatusPulse";
import { useLive } from "@/lib/live-store";
import { useAuth } from "@/lib/auth";
import { INSPECTION_CHECKLIST, ROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/inspection")({
  head: () => ({ meta: [{ title: "Inspection Mode — WARDEN" }, { name: "description", content: "Autonomous room inspection: security, amenity, and safety checks." }] }),
  component: InspectionPage,
});

function InspectionPage() {
  const { user } = useAuth();
  const sensors = useLive((s) => s.sensors);
  const [roomIdx, setRoomIdx] = useState(2); // start with room 103 (warning)
  const room = ROOMS[roomIdx];
  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<Record<string, "pending" | "pass" | "fail">>({});
  const [rfSpike, setRfSpike] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 2)), 200);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const order = INSPECTION_CHECKLIST.map((c) => c.key);
    const per = 100 / order.length;
    const next: Record<string, "pending" | "pass" | "fail"> = {};
    order.forEach((k, i) => {
      if (progress >= per * (i + 1)) {
        const isFail = (room.status !== "safe") && (k === "blanket" || k === "rf");
        next[k] = isFail ? "fail" : "pass";
      } else { next[k] = "pending"; }
    });
    setChecks(next);
    setRfSpike(sensors.rfSignal > 24);
  }, [progress, room.status, sensors.rfSignal]);

  const restart = (idx: number) => { setRoomIdx(idx); setProgress(0); setRunning(true); };
  const next = () => restart((roomIdx + 1) % ROOMS.length);
  const isAdmin = user?.role === "admin";

  return (
    <>
      <Topbar title="Inspection Mode" subtitle={`Currently scanning Room ${room.number} · Floor ${room.floor}`} />

      <div className="grid grid-cols-3 gap-4">
        {/* Camera feed */}
        <GlassCard className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg">Live Camera Feed</h2>
              <StatusPulse label="Recording" tone="critical" className="ml-2" />
            </div>
            <RoomBadge status={room.status} />
          </div>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/10">
            {/* simulated room view */}
            <div className="absolute inset-0" style={{
              background: "radial-gradient(circle at 30% 40%, oklch(0.35 0.04 240), oklch(0.18 0.025 250) 70%)"
            }} />
            <div className="absolute inset-0 scanline opacity-60" />
            <div className="absolute inset-0">
              <div className="absolute h-full w-full overflow-hidden">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
              </div>
            </div>
            {/* room mock furniture as svg */}
            <svg viewBox="0 0 320 180" className="absolute inset-0 h-full w-full">
              <rect x="20" y="100" width="80" height="50" fill="oklch(0.27 0.035 250)" stroke="oklch(0.78 0.13 215 / 0.4)" />
              <rect x="120" y="120" width="60" height="30" fill="oklch(0.27 0.035 250)" stroke="oklch(0.78 0.13 215 / 0.4)" />
              <rect x="220" y="80" width="80" height="70" fill="oklch(0.27 0.035 250)" stroke="oklch(0.78 0.13 215 / 0.4)" />
              <text x="60" y="135" textAnchor="middle" fill="oklch(0.985 0.012 95 / 0.6)" fontSize="9">BED</text>
              <text x="150" y="140" textAnchor="middle" fill="oklch(0.985 0.012 95 / 0.6)" fontSize="9">DESK</text>
              <text x="260" y="120" textAnchor="middle" fill="oklch(0.985 0.012 95 / 0.6)" fontSize="9">WARDROBE</text>
            </svg>
            {/* detection bbox */}
            {rfSpike && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute" style={{ left: "62%", top: "40%", width: "14%", height: "18%" }}
              >
                <div className="absolute inset-0 border-2 border-critical rounded-md" />
                <div className="absolute -top-6 left-0 text-[10px] font-mono uppercase tracking-widest text-critical bg-critical/20 px-1.5 py-0.5 rounded">
                  RF · 2.4GHz · suspicious
                </div>
                <div className="absolute -inset-1 border border-critical/40 rounded-md animate-pulse-ring" />
              </motion.div>
            )}
            {/* HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between text-[10px] font-mono uppercase tracking-widest text-primary-light/80">
              <div>CAM-01 · ROOM {room.number}</div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-critical animate-pulse" />
                REC · {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-[10px] font-mono text-primary-light/70">
              <div>RES 1080p · 30fps</div>
              <div>OBJ DETECT · v2.1 · {Object.values(checks).filter((v) => v === "pass").length} OK / {Object.values(checks).filter((v) => v === "fail").length} FLAG</div>
            </div>
          </div>

          {/* controls */}
          <div className="mt-5 flex items-center gap-3">
            <MagneticButton variant={running ? "ghost" : "primary"} onClick={() => setRunning((r) => !r)} disabled={!isAdmin} >
              {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
            </MagneticButton>
            <MagneticButton variant="outline" onClick={next} disabled={!isAdmin}>
              <SkipForward className="h-4 w-4" /> Next Room
            </MagneticButton>
            {!isAdmin && (
              <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Admin required for controls
              </div>
            )}
            <div className="ml-auto flex-1 max-w-xs">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                <span>Scan Progress</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Sensor cards */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display">Environmental</h3>
              <StatusPulse label="Live" tone="safe" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SensorTile icon={<Thermometer className="h-4 w-4" />} label="Temp" value={`${sensors.temperature}°C`} />
              <SensorTile icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${sensors.humidity}%`} />
              <SensorTile icon={<Wind className="h-4 w-4" />} label="Air Q" value={`${sensors.airQuality}`} />
              <SensorTile icon={<Eye className="h-4 w-4" />} label="Motion" value={sensors.motion ? "Yes" : "No"} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display flex items-center gap-2"><Radio className="h-4 w-4 text-primary" /> Security Scan</h3>
              <StatusPulse label={rfSpike ? "Anomaly" : "Clean"} tone={rfSpike ? "critical" : "safe"} />
            </div>
            <div className="text-xs text-muted-foreground mb-2">RF spectrum analysis · 2.4–5.8 GHz</div>
            <div className="h-16 flex items-end gap-1">
              {Array.from({ length: 32 }).map((_, i) => {
                const h = 20 + Math.abs(Math.sin((i + sensors.rfSignal) / 3)) * (rfSpike && i > 18 && i < 26 ? 80 : 50);
                return <motion.div key={i} className="flex-1 rounded-sm" style={{ background: i > 18 && i < 26 && rfSpike ? "var(--critical)" : "color-mix(in oklab, var(--primary) 60%, transparent)" }} animate={{ height: `${h}%` }} transition={{ duration: 0.4 }} />;
              })}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* checklist + minimap */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <GlassCard className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> Inspection Checklist</h2>
            <span className="text-xs text-muted-foreground">{Object.values(checks).filter((v) => v === "pass").length}/{INSPECTION_CHECKLIST.length} complete</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {INSPECTION_CHECKLIST.map((c) => {
              const st = checks[c.key] ?? "pending";
              return (
                <AnimatePresence key={c.key} mode="wait">
                  <motion.div
                    key={`${c.key}-${st}`}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-xl p-3 flex items-center gap-3"
                  >
                    {st === "pending" && <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/40" />}
                    {st === "pass" && <CheckCircle2 className="h-5 w-5 text-safe" />}
                    {st === "fail" && <XCircle className="h-5 w-5 text-critical" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{c.label}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.category}</div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Floor Position</h2>
            <span className="text-xs text-muted-foreground">tap to select</span>
          </div>
          <div className="aspect-square">
            <FloorMap highlightRoom={room.id} onSelectRoom={(r) => restart(ROOMS.findIndex((x) => x.id === r.id))} />
          </div>
        </GlassCard>
      </div>
    </>
  );
}

function SensorTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-widest">{icon}{label}</div>
      <div className="font-display text-lg mt-1">{value}</div>
    </div>
  );
}

function RoomBadge({ status }: { status: "safe" | "warning" | "critical" }) {
  const map = {
    safe: "bg-safe/15 text-safe border-safe/40",
    warning: "bg-warning/15 text-warning border-warning/40",
    critical: "bg-critical/20 text-critical border-critical/50",
  }[status];
  return <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${map}`}>{status}</span>;
}
