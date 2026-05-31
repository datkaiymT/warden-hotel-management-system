// Mock real-time data layer. Shapes mirror what a real ROS2/WebSocket bridge would return.
// See src/services/* for the integration-ready API surface.

export type RoomStatus = "safe" | "warning" | "critical";
export type AlertSeverity = "info" | "warning" | "critical";
export type RobotMode = "idle" | "inspecting" | "patrolling" | "guest-assist" | "charging";

export interface Room {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  occupied: boolean;
  lastInspected: string;
  temperature: number;
  humidity: number;
}

export interface Alert {
  id: string;
  ts: number;
  severity: AlertSeverity;
  room: string;
  title: string;
  detail: string;
  acknowledged: boolean;
  resolved: boolean;
  recommendation: string;
}

export interface RobotState {
  battery: number;
  connected: boolean;
  mode: RobotMode;
  uptimeMinutes: number;
  position: { x: number; y: number; room?: string };
  speed: number;
}

export interface Sensors {
  temperature: number;
  humidity: number;
  airQuality: number;
  motion: boolean;
  rfSignal: number;
  noise: number;
}

export const ROOMS: Room[] = [
  { id: "r-101", number: "101", floor: 1, status: "safe", occupied: true, lastInspected: "2m ago", temperature: 22.1, humidity: 44 },
  { id: "r-102", number: "102", floor: 1, status: "safe", occupied: false, lastInspected: "8m ago", temperature: 21.8, humidity: 41 },
  { id: "r-103", number: "103", floor: 1, status: "warning", occupied: true, lastInspected: "1m ago", temperature: 24.5, humidity: 58 },
  { id: "r-104", number: "104", floor: 1, status: "safe", occupied: true, lastInspected: "12m ago", temperature: 22.3, humidity: 45 },
  { id: "r-201", number: "201", floor: 2, status: "safe", occupied: false, lastInspected: "20m ago", temperature: 21.9, humidity: 42 },
  { id: "r-202", number: "202", floor: 2, status: "critical", occupied: true, lastInspected: "just now", temperature: 27.2, humidity: 68 },
  { id: "r-203", number: "203", floor: 2, status: "safe", occupied: true, lastInspected: "6m ago", temperature: 22.0, humidity: 44 },
  { id: "r-204", number: "204", floor: 2, status: "warning", occupied: false, lastInspected: "3m ago", temperature: 23.4, humidity: 52 },
];

export const INITIAL_ALERTS: Alert[] = [
  { id: "a1", ts: Date.now() - 1000 * 60 * 2, severity: "critical", room: "202", title: "Suspicious RF signal detected", detail: "Possible hidden recording device on 2.4GHz band near nightstand.", acknowledged: false, resolved: false, recommendation: "Dispatch security to inspect Room 202 immediately. Do not alert guest." },
  { id: "a2", ts: Date.now() - 1000 * 60 * 8, severity: "warning", room: "103", title: "Blanket missing from set", detail: "Bedding scan flagged 1 missing blanket after housekeeping cycle.", acknowledged: false, resolved: false, recommendation: "Notify housekeeping to restock." },
  { id: "a3", ts: Date.now() - 1000 * 60 * 14, severity: "warning", room: "204", title: "Humidity above threshold", detail: "Humidity reading 52% (limit 50%).", acknowledged: true, resolved: false, recommendation: "Check HVAC dehumidifier." },
  { id: "a4", ts: Date.now() - 1000 * 60 * 32, severity: "info", room: "101", title: "Inspection complete", detail: "All checks passed.", acknowledged: true, resolved: true, recommendation: "No action required." },
  { id: "a5", ts: Date.now() - 1000 * 60 * 55, severity: "critical", room: "302", title: "Smoke particles detected", detail: "Air quality dropped below safe threshold.", acknowledged: true, resolved: true, recommendation: "Fire safety protocol triggered. Resolved by staff." },
];

// Simplified checklist — only the items requested.
export const INSPECTION_CHECKLIST = [
  { key: "pillow",  label: "Pillow",        category: "amenity" },
  { key: "blanket", label: "Blanket",       category: "amenity" },
  { key: "smoke",   label: "Smoke Scan",    category: "safety" },
  { key: "climate", label: "Climate Scan",  category: "environment" },
  { key: "optical", label: "Optical Scan",  category: "security" },
  { key: "rf",      label: "RF Scan",       category: "security" },
] as const;

export const FLOOR_MAP = {
  width: 100,
  height: 60,
  corridor: [
    { x: 10, y: 28, w: 80, h: 6 },
  ],
  rooms: [
    { id: "r-101", number: "101", x: 10, y: 5, w: 16, h: 20 },
    { id: "r-102", number: "102", x: 28, y: 5, w: 16, h: 20 },
    { id: "r-103", number: "103", x: 46, y: 5, w: 16, h: 20 },
    { id: "r-104", number: "104", x: 64, y: 5, w: 16, h: 20 },
    { id: "r-201", number: "201", x: 10, y: 38, w: 16, h: 20 },
    { id: "r-202", number: "202", x: 28, y: 38, w: 16, h: 20 },
    { id: "r-203", number: "203", x: 46, y: 38, w: 16, h: 20 },
    { id: "r-204", number: "204", x: 64, y: 38, w: 16, h: 20 },
  ],
  // Lobby / "You are here" anchor for guest wayfinding
  lobby: { x: 88, y: 31, label: "Lobby" },
  patrolPath: [
    { x: 18, y: 31 }, { x: 36, y: 31 }, { x: 36, y: 15 }, { x: 36, y: 31 },
    { x: 54, y: 31 }, { x: 54, y: 48 }, { x: 54, y: 31 },
    { x: 72, y: 31 }, { x: 72, y: 15 }, { x: 72, y: 31 }, { x: 18, y: 31 },
  ],
};

export const HOTEL_FAQ = [
  { q: "What time is breakfast served?", a: "Breakfast is served daily from 6:30 AM to 10:30 AM in the Atrium restaurant on the ground floor." },
  { q: "Where is the pool?", a: "The rooftop pool is on the 12th floor, open from 7 AM to 10 PM. Towels are provided." },
  { q: "How do I get to the gym?", a: "The gym is on the 3rd floor, west wing. I can guide you there — just say 'route to gym'." },
  { q: "What attractions are nearby?", a: "Within 1km: City Museum, Riverside Park, Old Market. Within 5km: Botanical Gardens and the Science Center." },
  { q: "Is there a shuttle to the airport?", a: "Yes — complimentary shuttles run every 30 minutes from 5 AM to 11 PM. Please book at the reception 1 hour ahead." },
  { q: "What's the Wi-Fi password?", a: "Connect to 'HotelGuest' — password is at the bottom of your keycard sleeve." },
];
