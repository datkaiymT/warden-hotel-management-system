import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Sparkles, ShieldCheck, MonitorSmartphone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { GlassCard } from "@/components/GlassCard";
import { MagneticButton } from "@/components/MagneticButton";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/guest-mode")({
  head: () => ({ meta: [{ title: "Guest Assistant — WARDEN" }, { name: "description", content: "Hand off this terminal to a guest." }] }),
  component: GuestHandoffPage,
});

function GuestHandoffPage() {
  const { setGuestMode, guestRoom } = useAuth();
  const navigate = useNavigate();

  const enable = () => {
    setGuestMode(true);
    navigate({ to: "/guest" });
  };

  return (
    <>
      <Topbar title="Guest Assistant Handoff" subtitle="Lock this terminal into a secure guest-only kiosk." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center glow-primary shrink-0">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl">Hand off to a guest</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                Activating Guest Mode opens a separate, isolated kiosk interface. Administrative
                controls become unreachable and the browser back button is locked. Exiting back
                to the staff console requires a staff PIN.
              </p>

              <ul className="mt-6 space-y-2 text-sm">
                <FeatureRow icon={<MonitorSmartphone className="h-4 w-4" />} title="Isolated interface" desc="Opens a dedicated /guest route with no staff navigation." />
                <FeatureRow icon={<Lock className="h-4 w-4" />} title="Back button blocked" desc="History is replaced and pop-state is captured." />
                <FeatureRow icon={<ShieldCheck className="h-4 w-4" />} title="PIN to exit" desc="Returning to the admin console requires staff authentication." />
              </ul>

              <div className="mt-8 flex items-center gap-3">
                <MagneticButton onClick={enable} size="lg">
                  <Lock className="h-4 w-4" /> Enable Guest Mode
                </MagneticButton>
                <span className="text-xs text-muted-foreground">Demo guest room: {guestRoom}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h3 className="font-display text-lg">What the guest sees</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>· Concierge chatbot (room directions, attractions, FAQ)</li>
            <li>· Interactive indoor hotel map</li>
            <li>· Animated walking path from the lobby to their room when they ask "Where is my room?"</li>
            <li>· No access to dashboard, alerts, response center, analytics or settings</li>
          </ul>
        </GlassCard>
      </div>
    </>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg glass grid place-items-center text-primary shrink-0">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}
