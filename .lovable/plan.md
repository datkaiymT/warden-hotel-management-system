
# WARDEN — Smart Hotel Robotics Dashboard

A polished desktop web app for a TurtleBot3-based hotel monitoring system. All real-time data is simulated; architecture is structured so ROS2 / Supabase / WebSocket endpoints can plug in later without UI rewrites.

## Design language

- Soft-futuristic enterprise. Glassmorphism cards, rounded-2xl, subtle inner highlights, ambient drifting particles, animated status pulses.
- Palette wired as semantic tokens in `src/styles.css` (oklch):
  - `--primary` #0CBFDE, `--accent-soft` #99D9FF, `--accent-light` #C2E8FF
  - `--background` #0F1722, `--surface` #172230, `--foreground` #FFFEF5
  - Derived: `--gradient-primary`, `--glow-primary`, `--shadow-glass`, semantic `safe / warning / critical` states.
- Typography: Space Grotesk (headings) + Inter (body).
- Motion intensity: **maximum** — custom cursor that morphs on interactive elements, magnetic buttons (~8px), cards tilt softly toward cursor, ambient particle field, animated route transitions, pulsing live indicators, scanline overlays on camera feed. All GPU-friendly; respects `prefers-reduced-motion`.

## Tech & architecture

- TanStack Start (existing) + Tailwind v4 + Framer Motion + Recharts + lucide-react.
- Mock auth via React context + localStorage; roles `admin` and `staff` with route guards through a `_authenticated` layout and a `RoleGate` component.
- `src/services/` mock layer with the same shapes a real backend would return:
  - `robotService`, `sensorService`, `alertService`, `inspectionService`, `guestService`.
  - `useLiveData` hook simulates WebSocket via `setInterval` push into a Zustand store — swap to real `ws://` later with no component changes.
- Page-level route files under `src/routes/` (no hash anchors), each with its own `head()` metadata.

## Routes

```
/login                              public, futuristic split-screen
/_authenticated/                    role-aware shell (sidebar + topbar)
  dashboard                        overview, KPIs, live map, status chips
  inspection                       autonomous room inspection control
  response                         alerts + incidents + history
  analytics                        charts, trends, usage
  settings                         admin-only (staff sees read-only)
/_authenticated/guest-mode          kiosk handoff; locks admin controls
/guest                              optional kiosk URL (no auth)
```

## Page contents

**Login** — Glass panel left (form), animated WARDEN mark + ambient particles right. Demo creds shown subtly. `admin/123`, `staff/123`.

**Dashboard** — KPI row (battery, connection, mode, uptime). Status chips: Robot Connected · Sensors Active · Cloud Sync Online · Room Scan Running (animated pulse). Live room cards grid (8 mock rooms). Mini SVG floor map with animated robot dot following scripted path. Active alerts feed. System health sparklines.

**Inspection Mode** — Live sensor cards (temp, humidity, air quality, motion). Suspicious-device detection panel (simulated hidden-camera scan with progress + bounding-box overlays on a placeholder camera feed with scanline shader). Missing-items checklist (towels, slippers, toiletries). Room status badge (Safe/Warning/Critical). Inspection progress bar. Animated robot moving across the floor map. Start/Pause/Next Room controls (admin only).

**Response Center** — Real-time alert stream, filterable by severity. Incident log table with row expand → recommended staff actions. Notification panel. Alert history mini-charts. Acknowledge button (staff allowed); Resolve/Dispatch (admin only).

**Guest Assistant Mode** — Chatbot UI (scripted responses for room directions, attractions, FAQ). Interactive hotel map with animated route guidance from current location to selected room. While active, a banner locks admin nav; protected actions show "Staff Authentication Required" modal with PIN re-entry.

**Analytics** — Recharts: inspections per day (area), alert frequency by type (bar), room safety distribution (donut), sensor activity heatmap, robot usage hours (line).

**Settings** — Sensor thresholds, notification toggles, robot preferences (speed, patrol schedule), user access list. Admin = editable; Staff = read-only with lock icons.

## Component library

`GlassCard`, `StatusPulse`, `MetricKPI`, `LiveChart`, `FloorMap`, `RobotMarker`, `CameraFeed`, `AlertItem`, `MagneticButton`, `CustomCursor`, `ParticleField`, `RoleGate`, `Sidebar`, `Topbar`.

## Role matrix

| Capability                | Admin | Staff |
|---------------------------|:-----:|:-----:|
| View all pages            |  ✓   |  ✓   |
| Acknowledge alerts        |  ✓   |  ✓   |
| Resolve / dispatch        |  ✓   |  ✗   |
| Robot controls (start/stop)|  ✓   |  ✗   |
| Settings (edit)           |  ✓   |  ✗   |
| Enable Guest Mode         |  ✓   |  ✓   |
| Disable Guest Mode        |  ✓   |  ✗   |

## Build order (single pass, all 6 pages)

1. Design tokens + base shell (sidebar, topbar, cursor, particles, auth context, route guards).
2. Login.
3. Dashboard (sets the visual bar — most polished).
4. Inspection Mode (floor map + camera feed components reused later).
5. Response Center.
6. Analytics.
7. Settings.
8. Guest Assistant Mode + kiosk lock behavior.
9. Pass for motion polish, hover states, magnetic buttons, accessibility, reduced-motion fallback.

## Out of scope (now, easy to add later)

- Real ROS2/WebSocket connection (mock layer is a drop-in).
- Real auth / Supabase (mock context is a drop-in).
- Real camera streams (component accepts a stream URL prop).
- Mobile/tablet layouts (desktop-first per brief).

Once you approve, I'll switch to build mode and ship it.
