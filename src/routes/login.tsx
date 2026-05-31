import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Bot, Lock, User, Loader2, ShieldCheck, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { ParticleField } from "@/components/ParticleField";
import { MagneticButton } from "@/components/MagneticButton";
import { useEffect } from "react";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/dashboard",
  }),
  head: () => ({ meta: [{ title: "Sign in — WARDEN Console" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, hydrated } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && isAuthenticated) navigate({ to: (search.redirect as "/dashboard") || "/dashboard" });
  }, [hydrated, isAuthenticated, navigate, search.redirect]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(username, password);
      navigate({ to: (search.redirect as "/dashboard") || "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  const fillDemo = (u: "admin" | "staff") => { setUsername(u); setPassword("123"); };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      <button
        onClick={toggle}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="interactive fixed top-5 right-5 z-20 h-10 w-10 rounded-xl glass grid place-items-center hover:bg-white/10 transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {/* Left: form */}
      <div className="relative z-10 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md glass-strong rounded-3xl p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center glow-primary">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-2xl tracking-tight">WARDEN</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Hotel Robotics Console</div>
            </div>
          </div>

          <h1 className="text-2xl font-display tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Authenticate to access the control console.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field icon={<User className="h-4 w-4" />} label="Username" value={username} onChange={setUsername} placeholder="admin" autoFocus />
            <Field icon={<Lock className="h-4 w-4" />} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••" />

            {error && (
              <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                className="text-sm text-critical bg-critical/10 border border-critical/30 rounded-xl px-3 py-2">
                {error}
              </motion.div>
            )}

            <MagneticButton type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? "Authenticating…" : "Sign in"}
            </MagneticButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Demo credentials</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => fillDemo("admin")}
                className="interactive flex-1 glass rounded-xl px-3 py-2 text-left hover:bg-white/5">
                <div className="text-xs font-medium">admin / 123</div>
                <div className="text-[10px] text-muted-foreground">full access</div>
              </button>
              <button type="button" onClick={() => fillDemo("staff")}
                className="interactive flex-1 glass rounded-xl px-3 py-2 text-left hover:bg-white/5">
                <div className="text-xs font-medium">staff / 123</div>
                <div className="text-[10px] text-muted-foreground">monitor + ack</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right: ambient hero */}
      <div className="relative hidden lg:block overflow-hidden">
        <ParticleField count={60} />
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-80 w-80 rounded-full bg-gradient-primary opacity-25 blur-3xl" />
            <div className="absolute inset-0 grid place-items-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="relative h-72 w-72 rounded-full border border-primary/30">
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div key={deg} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary glow-primary" />
                  </div>
                ))}
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute h-52 w-52 rounded-full border border-primary-soft/20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary-soft" />
              </motion.div>
              <div className="absolute h-28 w-28 rounded-2xl bg-gradient-primary grid place-items-center glow-primary">
                <Bot className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">TurtleBot3 · ROS2 · Smart Hotel</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, value, onChange, type = "text", placeholder, autoFocus }: {
  label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5 relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">{icon}</div>
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
          className="interactive w-full h-11 pl-10 pr-3 rounded-xl glass border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 text-sm transition-all"
        />
      </div>
    </label>
  );
}
