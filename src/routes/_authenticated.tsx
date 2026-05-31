import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ParticleField } from "@/components/ParticleField";
import { useLiveTicker } from "@/lib/live-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { isAuthenticated, hydrated, guestModeActive } = useAuth();
  const navigate = useNavigate();
  useLiveTicker();

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: window.location.pathname } });
    } else if (guestModeActive) {
      navigate({ to: "/guest" });
    }
  }, [hydrated, isAuthenticated, guestModeActive, navigate]);

  if (!hydrated || !isAuthenticated || guestModeActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Initializing console…
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex">
      <div className="fixed inset-0 -z-10 opacity-50">
        <ParticleField count={30} />
      </div>
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 pb-12 max-w-[1600px]">
        <Outlet />
      </main>
    </div>
  );
}
