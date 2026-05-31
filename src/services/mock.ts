/**
 * Mock implementation of the WARDEN service bundle.
 * Powered by the in-memory Zustand store + scripted data in `src/lib/mock-data.ts`.
 *
 * Drop-in target: replace this module's exports with a real transport
 * adapter (e.g. ROS2 bridge over WebSocket) that satisfies the same
 * interfaces in `./types.ts`.
 */

import { useLive } from "@/lib/live-store";
import { HOTEL_FAQ, INITIAL_ALERTS, ROOMS, type Sensors } from "@/lib/mock-data";
import type {
  AlertService, GuestService, InspectionService, RobotService,
  RoomService, SensorReading, SensorService, ServiceBundle, Unsubscribe,
} from "./types";

const sensorService: SensorService = {
  async getCurrent() {
    const s = useLive.getState().sensors;
    return { ...s, ts: Date.now() };
  },
  subscribe(cb) {
    return useLive.subscribe((state, prev) => {
      if (state.sensors !== prev.sensors) cb({ ...state.sensors, ts: Date.now() });
    });
  },
  async getHistory({ rangeMinutes, metric }) {
    const base = useLive.getState().sensors;
    const n = Math.min(120, rangeMinutes);
    const out: SensorReading[] = [];
    for (let i = n; i >= 0; i--) {
      const wob = (v: number, a: number) => v + Math.sin(i / 4) * a;
      out.push({
        ts: Date.now() - i * 60_000,
        temperature: +wob(base.temperature, 0.6).toFixed(1),
        humidity: +wob(base.humidity, 2).toFixed(0),
        airQuality: +wob(base.airQuality, 3).toFixed(0),
        motion: false,
        rfSignal: +wob(base.rfSignal, 4).toFixed(0),
        noise: +wob(base.noise, 5).toFixed(0),
      });
    }
    return metric ? out.map((r) => ({ ...r, [metric]: r[metric as keyof Sensors] } as SensorReading)) : out;
  },
};

const robotService: RobotService = {
  async getState() { return useLive.getState().robot; },
  subscribe(cb) {
    return useLive.subscribe((state, prev) => {
      if (state.robot !== prev.robot) cb(state.robot);
    });
  },
  async command(cmd) {
    // No-op stub; real implementation would publish to /cmd_vel or similar.
    console.info("[mock robot] command:", cmd);
  },
};

const roomService: RoomService = {
  async list() { return ROOMS; },
  async get(id) { return ROOMS.find((r) => r.id === id); },
};

const alertService: AlertService = {
  async list() { return useLive.getState().alerts; },
  subscribe(cb) {
    return useLive.subscribe((state, prev) => {
      const added = state.alerts.find((a) => !prev.alerts.includes(a));
      if (added) cb(added);
    });
  },
  async acknowledge(id) { useLive.getState().ackAlert(id); },
  async resolve(id) { useLive.getState().resolveAlert(id); },
};

const inspectionService: InspectionService = {
  async start(roomId) { return { scanId: `scan-${roomId}-${Date.now()}` }; },
  onProgress() { return () => undefined; },
  async cancel() { /* noop */ },
};

const guestService: GuestService = {
  async getAssignedRoom() { return { roomId: "r-203", roomNumber: "203", floor: 2 }; },
  async ask(message) {
    const m = message.toLowerCase();
    const faq = HOTEL_FAQ.find((f) => f.q.toLowerCase().split(" ").some((w) => m.includes(w)));
    if (/room/.test(m)) return { reply: "Your assigned room is on the 2nd floor. I'll show the route on the map.", suggestRoomId: "r-203" };
    return { reply: faq?.a ?? "I can help with directions and hotel FAQ." };
  },
};

// Reference INITIAL_ALERTS so unused-import lint stays quiet when the store
// is replaced with a transport adapter that no longer needs the seed list.
void INITIAL_ALERTS;
void (null as unknown as Unsubscribe);

export const mockServices: ServiceBundle = {
  sensors: sensorService,
  robot: robotService,
  rooms: roomService,
  alerts: alertService,
  inspection: inspectionService,
  guest: guestService,
};
