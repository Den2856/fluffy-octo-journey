import { api } from "../lib/apiClient";

export type Role = "admin" | "user";
export type AuthUser = { id: string; name: string; email: string; role: Role };

export async function apiMe(): Promise<AuthUser> {
  const r = await api.get("/auth/me");
  return r.data.data.user;
}

export async function apiLogin(email: string, password: string, remember: boolean): Promise<AuthUser> {
  const r = await api.post("/auth/login", { email, password, remember });
  return r.data.data.user;
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthUser> {
  const r = await api.post("/auth/register", { name, email, password });
  return r.data.data.user;
}

export async function apiLogout() {
  await api.post("/auth/logout");
}

export async function apiForgot(email: string) {
  await api.post("/auth/forgot-password", { email });
}

export async function apiReset(token: string, newPassword: string) {
  const r = await api.post("/auth/reset-password", { token, newPassword });
  return r.data.data.user as AuthUser;
}
