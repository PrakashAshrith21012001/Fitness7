import { accessToken } from "./supabase";

/**
 * Calls to the site's API routes (/api/*) with the member's Supabase JWT.
 * EXPO_PUBLIC_API_URL points at the deployed site (Render) — see mobile/.env.
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
export const apiConfigured = !!API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init: { method?: "GET" | "POST" | "DELETE"; body?: unknown; timeoutMs?: number } = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, "No API URL configured.");
  const token = await accessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(init.timeoutMs ?? 25_000),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new ApiError(res.status, json.error ?? `Request failed (${res.status})`);
  return json;
}
