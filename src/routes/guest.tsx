import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Send, Sparkles, MapPin, Lock, ShieldCheck, X, Bot, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

import { MagneticButton } from "@/components/MagneticButton";
import { FloorMap } from "@/components/FloorMap";
import { ParticleField } from "@/components/ParticleField";
import { useAuth } from "@/lib/auth";
import { HOTEL_FAQ, ROOMS } from "@/lib/mock-data";

export const Route = createFileRoute("/guest")({
  head: () => ({
    meta: [
      { title: "Guest Assistant — WARDEN" },
      { name: "description", content: "Hotel concierge assistant for guests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GuestKioskPage,
});

interface Msg { id: string; from: "guest" | "bot"; text: string; suggestRoute?: string; showAssignedRoom?: boolean }

function GuestKioskPage() {
  const { guestModeActive, setGuestMode, requireStaffAuth, hydrated, guestRoom } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", from: "bot", text: "Welcome! I'm Warden, your hotel assistant. I can guide you to your room, suggest attractions, or answer any question about the hotel." },
  ]);
  const [input, setInput] = useState("");
  const [routeRoom, setRouteRoom] = useState<string | undefined>();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);


  // Activate guest mode on mount (once).
  useEffect(() => {
    if (!hydrated) return;
    if (!guestModeActive) setGuestMode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Block back navigation while on the kiosk page (mount-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.history.pushState({ kiosk: true }, "", "/guest"); } catch { /* noop */ }
    const onPop = () => {
      try { window.history.pushState({ kiosk: true }, "", "/guest"); } catch { /* noop */ }
      setAuthModalOpen(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Auto-scroll to newest message only when already pinned to bottom.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (atBottom) el.scrollTop = el.scrollHeight;
  }, [messages, atBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distance < 40);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };


  const send = (text: string) => {
    if (!text.trim()) return;
    const guestMsg: Msg = { id: `g${Date.now()}`, from: "guest", text };
    setMessages((m) => [...m, guestMsg]);
    setInput("");
    setTimeout(() => {
      const reply = respond(text, guestRoom);
      setMessages((m) => [...m, reply]);
      if (reply.suggestRoute) setRouteRoom(reply.suggestRoute);
    }, 500);
  };

  const handleExit = () => {
    setGuestMode(false);
    setAuthModalOpen(false);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none">
        <ParticleField count={40} />
      </div>

      {/* Kiosk header */}
      <header className="px-4 md:px-8 pt-4 md:pt-6 pb-3 md:pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-primary grid place-items-center glow-primary shrink-0">
            <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-base md:text-xl tracking-tight truncate">WARDEN Concierge</div>
            <div className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground truncate">Guest Mode · Secure Kiosk</div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs">
            <Lock className="h-3.5 w-3.5 text-warning" />
            <span className="text-muted-foreground">Administrative controls locked</span>
          </div>
          <MagneticButton variant="outline" onClick={() => setAuthModalOpen(true)} size="sm">
            <ShieldCheck className="h-4 w-4" /> <span className="hidden sm:inline">Staff exit</span>
          </MagneticButton>
        </div>
      </header>

      <main className="flex-1 px-3 md:px-8 pb-4 md:pb-8 grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4 max-w-[1500px] w-full mx-auto">
        {/* Chat */}
        <GlassCard className="lg:col-span-3 p-0 flex flex-col min-h-[520px] h-full">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display truncate">Ask me anything</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Online · responds in ~1s</div>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
              Room {guestRoom}
            </div>
          </div>

          <div className="relative flex-1 min-h-0 overflow-hidden">
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div key={m.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.from === "guest" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "guest" ? "bg-gradient-primary text-primary-foreground rounded-br-sm" : "glass rounded-bl-sm"}`}>
                      {m.text}
                      {m.suggestRoute && (
                        <button onClick={() => setRouteRoom(m.suggestRoute)} className="interactive mt-2 inline-flex items-center gap-1.5 text-[11px] underline opacity-90">
                          <MapPin className="h-3 w-3" /> Show route on map
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {!atBottom && (
                <motion.button
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  onClick={scrollToBottom}
                  aria-label="Scroll to latest message"
                  className="interactive absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-medium px-3.5 py-2 shadow-lg glow-primary hover:opacity-95"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Jump to latest
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3 md:p-4 border-t border-white/5 shrink-0 bg-background/70 backdrop-blur-sm">
            <div className="flex gap-2 mb-2 md:mb-3 overflow-x-auto pb-1 -mx-1 px-1">
              {["Where is my room?", "Breakfast hours?", "Route to gym", "Nearby attractions", "Wi-Fi password"].map((s) => (
                <button key={s} onClick={() => send(s)} className="interactive whitespace-nowrap text-xs px-3 py-1.5 rounded-full glass hover:bg-white/5">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about the hotel…"
                className="interactive flex-1 h-11 px-4 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              <MagneticButton type="submit"><Send className="h-4 w-4" /></MagneticButton>
            </form>
          </div>
        </GlassCard>

        {/* Map */}
        <GlassCard className="lg:col-span-2 p-4 md:p-6 h-[60vh] lg:h-[calc(100vh-160px)] min-h-[360px] lg:min-h-[520px] flex flex-col">

          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="font-display">Hotel Map</h3>
            {routeRoom && (
              <span className="text-[10px] uppercase tracking-widest text-primary">
                Route to {ROOMS.find((r) => r.id === routeRoom)?.number}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <FloorMap
              highlightRoom={routeRoom}
              animateRobot={false}
              showPath={!!routeRoom}
            />
          </div>
          <div className="mt-4 text-xs text-muted-foreground shrink-0">
            {routeRoom
              ? "Follow the highlighted path from the lobby to your destination."
              : "Tap a quick action or ask 'Where is my room?' to see a route."}
          </div>
        </GlassCard>
      </main>

      <AnimatePresence>
        {authModalOpen && (
          <StaffAuthModal
            onClose={() => setAuthModalOpen(false)}
            onSuccess={handleExit}
            verify={requireStaffAuth}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StaffAuthModal({ onClose, onSuccess, verify }: { onClose: () => void; onSuccess: () => void; verify: (pw: string) => boolean }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-md">
      <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
        className="glass-strong rounded-3xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="interactive absolute top-4 right-4 h-8 w-8 rounded-full glass grid place-items-center"><X className="h-4 w-4" /></button>
        <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center glow-primary mb-4">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-display text-xl">Staff Authentication Required</h3>
        <p className="text-sm text-muted-foreground mt-1">Enter your staff PIN to exit Guest Assistant Mode.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (verify(pw)) onSuccess(); else setErr("Invalid PIN"); }} className="mt-6 space-y-3">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Staff PIN" autoFocus
            className="interactive w-full h-11 px-4 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          {err && <div className="text-xs text-critical">{err}</div>}
          <MagneticButton type="submit" className="w-full">Unlock</MagneticButton>
        </form>
        <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground text-center">demo PIN: 123</p>
      </motion.div>
    </motion.div>
  );
}

function respond(text: string, guestRoom: string): Msg {
  const lower = text.toLowerCase();
  const id = `b${Date.now()}`;
  const myRoom = ROOMS.find((r) => r.number === guestRoom);

  if (/where.*(my )?room|my room|find.*room|directions?.*room/.test(lower)) {
    return {
      id, from: "bot",
      text: `Your assigned room is ${guestRoom} on floor ${myRoom?.floor ?? 2}. I'm showing the walking path from the lobby — follow the highlighted route on the map.`,
      suggestRoute: myRoom?.id ?? "r-203",
    };
  }
  if (/gym|fitness/.test(lower)) return { id, from: "bot", text: "The gym is on the 3rd floor, west wing.", suggestRoute: "r-204" };
  if (/pool/.test(lower)) return { id, from: "bot", text: "The rooftop pool is on the 12th floor, open 7 AM – 10 PM. Take the lobby elevators to floor 12." };
  if (/breakfast/.test(lower)) return { id, from: "bot", text: HOTEL_FAQ[0].a };
  if (/wifi|wi-fi|password/.test(lower)) return { id, from: "bot", text: HOTEL_FAQ[5].a };
  if (/attraction|nearby|museum|park/.test(lower)) return { id, from: "bot", text: HOTEL_FAQ[3].a };
  if (/airport|shuttle/.test(lower)) return { id, from: "bot", text: HOTEL_FAQ[4].a };
  const m = lower.match(/room\s*(\d+)/);
  if (m) {
    const room = ROOMS.find((r) => r.number === m[1]);
    if (room) return { id, from: "bot", text: `Room ${room.number} is on floor ${room.floor}. Route on the map.`, suggestRoute: room.id };
  }
  return { id, from: "bot", text: "I can help with directions, your room, nearby attractions, and hotel FAQ. Try 'Where is my room?', 'route to gym', or 'breakfast hours'." };
}
