import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "../api/auth";
import { apiForgot, apiLogin, apiLogout, apiMe, apiRegister, apiReset } from "../api/auth";

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgot: (email: string) => Promise<void>;
  reset: (token: string, newPassword: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setUser(await apiMe());
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      refresh,
      login: async (email, password, remember) => setUser(await apiLogin(email, password, remember)),
      register: async (name, email, password) => setUser(await apiRegister(name, email, password)),
      logout: async () => {
        await apiLogout();
        setUser(null);
      },
      forgot: async (email) => apiForgot(email),
      reset: async (token, newPassword) => setUser(await apiReset(token, newPassword)),
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
