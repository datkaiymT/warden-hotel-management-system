import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "staff";
export interface User { username: string; role: Role; name: string; }

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: { password: "123", user: { username: "admin", role: "admin", name: "Alex Warden" } },
  staff: { password: "123", user: { username: "staff", role: "staff", name: "Jamie Reed" } },
};

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  guestModeActive: boolean;
  guestRoom: string;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  setGuestMode: (v: boolean) => void;
  requireStaffAuth: (password: string) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "warden.auth";
const GKEY = "warden.guest";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestModeActive, setGuestModeActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEY);
    if (raw) try { setUser(JSON.parse(raw)); } catch { /* noop */ }
    setGuestModeActive(localStorage.getItem(GKEY) === "1");
    setHydrated(true);
  }, []);

  const login = async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 450));
    const rec = DEMO_USERS[username.toLowerCase()];
    if (!rec || rec.password !== password) throw new Error("Invalid credentials");
    setUser(rec.user);
    localStorage.setItem(KEY, JSON.stringify(rec.user));
  };
  const logout = () => { setUser(null); localStorage.removeItem(KEY); };
  const setGuestMode = (v: boolean) => {
    setGuestModeActive(v);
    if (typeof window !== "undefined") {
      if (v) localStorage.setItem(GKEY, "1"); else localStorage.removeItem(GKEY);
    }
  };
  const requireStaffAuth = (password: string) => {
    return Object.values(DEMO_USERS).some((u) => u.password === password);
  };

  return (
    <Ctx.Provider value={{
      user, isAuthenticated: !!user, hydrated, guestModeActive,
      guestRoom: "203",
      login, logout, setGuestMode, requireStaffAuth,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
