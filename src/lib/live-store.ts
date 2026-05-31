// Simulated live data store. Replace the interval inside useLiveData with a
// WebSocket subscription (ws://robot/...) when the real bridge is available.
import { create } from "zustand";
import { useEffect } from "react";
import { INITIAL_ALERTS, type Alert, type RobotState, type Sensors } from "./mock-data";

interface LiveState {
  robot: RobotState;
  sensors: Sensors;
  alerts: Alert[];
  systemHealth: { cloudSync: boolean; sensorsActive: boolean; roomScan: boolean };
  tick: number;
  update: (patch: Partial<LiveState>) => void;
  pushAlert: (a: Alert) => void;
  ackAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

export const useLive = create<LiveState>((set) => ({
  robot: { battery: 82, connected: true, mode: "patrolling", uptimeMinutes: 412, position: { x: 18, y: 31 }, speed: 0.4 },
  sensors: { temperature: 22.3, humidity: 45, airQuality: 96, motion: false, rfSignal: 12, noise: 34 },
  alerts: INITIAL_ALERTS,
  systemHealth: { cloudSync: true, sensorsActive: true, roomScan: true },
  tick: 0,
  update: (patch) => set((s) => ({ ...s, ...patch })),
  pushAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts] })),
  ackAlert: (id) => set((s) => ({ alerts: s.alerts.map((x) => x.id === id ? { ...x, acknowledged: true } : x) })),
  resolveAlert: (id) => set((s) => ({ alerts: s.alerts.map((x) => x.id === id ? { ...x, resolved: true, acknowledged: true } : x) })),
}));

// Drives all "live" updates from a single interval. Mount once at app root.
export function useLiveTicker() {
  const update = useLive((s) => s.update);
  useEffect(() => {
    const id = setInterval(() => {
      const s = useLive.getState();
      const t = s.tick + 1;
      const battery = Math.max(20, s.robot.battery - (t % 60 === 0 ? 1 : 0));
      const wob = (n: number, amp: number) => n + (Math.sin(t / 5) * amp + (Math.random() - 0.5) * amp * 0.6);
      update({
        tick: t,
        robot: { ...s.robot, battery, uptimeMinutes: s.robot.uptimeMinutes + (t % 60 === 0 ? 1 : 0) },
        sensors: {
          temperature: +wob(22.4, 0.4).toFixed(1),
          humidity: +wob(45, 1.5).toFixed(0),
          airQuality: Math.min(100, Math.max(70, +wob(95, 2).toFixed(0))),
          motion: Math.random() > 0.85,
          rfSignal: Math.max(5, +wob(15, 4).toFixed(0)),
          noise: Math.max(20, +wob(34, 5).toFixed(0)),
        },
      });
    }, 1500);
    return () => clearInterval(id);
  }, [update]);
}
