/**
 * WARDEN service-layer contracts.
 *
 * These interfaces define the boundary between the UI and any backend
 * (mock data today, ROS2 / WebSocket / REST bridge tomorrow). When the
 * sensor team is ready, implement the same interfaces against the real
 * transport and swap the export in `src/services/index.ts` — no UI
 * changes required.
 */

import type { Alert, RobotState, Room, Sensors } from "@/lib/mock-data";

export interface SensorReading extends Sensors {
  ts: number;
  roomId?: string;
}

/** Push-based stream (preferred for ROS2 / WebSocket). */
export type Unsubscribe = () => void;

export interface SensorService {
  /** One-shot current reading. */
  getCurrent(): Promise<SensorReading>;
  /** Subscribe to live readings; returns an unsubscribe function. */
  subscribe(onReading: (r: SensorReading) => void): Unsubscribe;
  /** Historical window (e.g. last N minutes) for charts. */
  getHistory(opts: { rangeMinutes: number; metric?: keyof Sensors }): Promise<SensorReading[]>;
}

export interface RobotService {
  getState(): Promise<RobotState>;
  subscribe(onState: (s: RobotState) => void): Unsubscribe;
  /** Direct commands (admin-only at UI layer). */
  command(cmd: "pause" | "resume" | "return-to-dock" | "next-room"): Promise<void>;
}

export interface RoomService {
  list(): Promise<Room[]>;
  get(id: string): Promise<Room | undefined>;
}

export interface AlertService {
  list(): Promise<Alert[]>;
  subscribe(onAlert: (a: Alert) => void): Unsubscribe;
  acknowledge(id: string): Promise<void>;
  resolve(id: string): Promise<void>;
}

export interface InspectionService {
  /** Start a scan on a room; events stream as checks complete. */
  start(roomId: string): Promise<{ scanId: string }>;
  onProgress(scanId: string, cb: (e: { checkKey: string; status: "pass" | "fail"; progress: number }) => void): Unsubscribe;
  cancel(scanId: string): Promise<void>;
}

export interface GuestService {
  /** Resolve guest → assigned room (from PMS / keycard). */
  getAssignedRoom(guestToken?: string): Promise<{ roomId: string; roomNumber: string; floor: number }>;
  /** Send chat message to concierge LLM / rule engine. */
  ask(message: string): Promise<{ reply: string; suggestRoomId?: string }>;
}

export interface ServiceBundle {
  sensors: SensorService;
  robot: RobotService;
  rooms: RoomService;
  alerts: AlertService;
  inspection: InspectionService;
  guest: GuestService;
}
