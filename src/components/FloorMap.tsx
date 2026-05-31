import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FLOOR_MAP, ROOMS, type Room } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  highlightRoom?: string;
  onSelectRoom?: (room: Room) => void;
  compact?: boolean;
  animateRobot?: boolean;
  /** When set, draws a wayfinding path from the lobby to the highlighted room. */
  showPath?: boolean;
}

const statusFill: Record<Room["status"], string> = {
  safe: "fill-safe/15 stroke-safe/40",
  warning: "fill-warning/15 stroke-warning/50",
  critical: "fill-critical/20 stroke-critical/60",
};

export function FloorMap({ highlightRoom, onSelectRoom, compact, animateRobot = true, showPath = false }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!animateRobot) return;
    const id = setInterval(() => setStep((s) => (s + 1) % FLOOR_MAP.patrolPath.length), 2200);
    return () => clearInterval(id);
  }, [animateRobot]);

  const pos = FLOOR_MAP.patrolPath[step];
  const targetRoom = highlightRoom ? FLOOR_MAP.rooms.find((r) => r.id === highlightRoom) : undefined;

  // Build a simple L-shaped path: lobby → corridor at target X → room center.
  const pathPoints = (() => {
    if (!showPath || !targetRoom) return null;
    const lobby = FLOOR_MAP.lobby;
    const corridorY = FLOOR_MAP.corridor[0].y + FLOOR_MAP.corridor[0].h / 2;
    const cx = targetRoom.x + targetRoom.w / 2;
    const cy = targetRoom.y + targetRoom.h / 2;
    return [
      { x: lobby.x, y: lobby.y },
      { x: lobby.x, y: corridorY },
      { x: cx, y: corridorY },
      { x: cx, y: cy },
    ];
  })();

  return (
    <div className={cn("relative h-full w-full", compact ? "min-h-[200px]" : "min-h-[320px]")}>
      <svg viewBox={`0 0 ${FLOOR_MAP.width} ${FLOOR_MAP.height}`} className="h-full w-full">
        <defs>
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="oklch(0.98 0.01 230 / 0.05)" strokeWidth="0.15" />
          </pattern>
          <radialGradient id="robotGlow">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={FLOOR_MAP.width} height={FLOOR_MAP.height} fill="url(#grid)" />

        {FLOOR_MAP.corridor.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h}
            fill="color-mix(in oklab, var(--foreground) 4%, transparent)"
            stroke="color-mix(in oklab, var(--foreground) 10%, transparent)"
            strokeWidth="0.15" rx="0.6" />
        ))}

        {FLOOR_MAP.rooms.map((r) => {
          const room = ROOMS.find((x) => x.id === r.id);
          const active = highlightRoom === r.id;
          return (
            <g key={r.id} onClick={() => room && onSelectRoom?.(room)} className={onSelectRoom ? "cursor-none" : ""}>
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h} rx="1.2"
                className={cn(statusFill[room?.status ?? "safe"], "transition-all duration-300", active && "stroke-primary")}
                strokeWidth={active ? "0.4" : "0.2"}
              />
              <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 1.2} textAnchor="middle"
                className="fill-foreground/80 font-display" style={{ fontSize: 2.4 }}>
                {r.number}
              </text>
            </g>
          );
        })}

        {/* Wayfinding path */}
        {pathPoints && (
          <>
            <motion.polyline
              points={pathPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1.5 1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
            {/* Lobby marker */}
            <g>
              <circle cx={FLOOR_MAP.lobby.x} cy={FLOOR_MAP.lobby.y} r="2.2"
                fill="color-mix(in oklab, var(--safe) 25%, transparent)"
                stroke="var(--safe)" strokeWidth="0.25" />
              <circle cx={FLOOR_MAP.lobby.x} cy={FLOOR_MAP.lobby.y} r="0.9" fill="var(--safe)" />
              <text x={FLOOR_MAP.lobby.x} y={FLOOR_MAP.lobby.y - 3} textAnchor="middle"
                className="fill-foreground/80 font-display" style={{ fontSize: 2 }}>
                You are here
              </text>
            </g>
            {/* Destination pulse */}
            {targetRoom && (
              <g>
                <circle
                  cx={targetRoom.x + targetRoom.w / 2}
                  cy={targetRoom.y + targetRoom.h / 2}
                  r="1.2" fill="var(--primary)"
                />
                <circle
                  cx={targetRoom.x + targetRoom.w / 2}
                  cy={targetRoom.y + targetRoom.h / 2}
                  r="2.4" fill="none" stroke="var(--primary)" strokeWidth="0.2"
                  className="animate-pulse-ring"
                  style={{ transformOrigin: `${targetRoom.x + targetRoom.w / 2}px ${targetRoom.y + targetRoom.h / 2}px` }}
                />
              </g>
            )}
          </>
        )}

        {animateRobot && !showPath && (
          <>
            <motion.circle
              cx={pos.x} cy={pos.y} r="3.5" fill="url(#robotGlow)"
              animate={{ cx: pos.x, cy: pos.y, scale: [1, 1.2, 1] }}
              transition={{ cx: { duration: 2, ease: "easeInOut" }, cy: { duration: 2, ease: "easeInOut" }, scale: { duration: 1.4, repeat: Infinity } }}
            />
            <motion.circle
              cx={pos.x} cy={pos.y} r="0.9" fill="var(--primary)" stroke="var(--foreground)" strokeWidth="0.15"
              animate={{ cx: pos.x, cy: pos.y }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </>
        )}
      </svg>
      <AnimatePresence>
        {animateRobot && !showPath && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-2 left-2 glass rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            Robot · waypoint {step + 1}/{FLOOR_MAP.patrolPath.length}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
