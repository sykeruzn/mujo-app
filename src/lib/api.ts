import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_URL;

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 30_000; // 30 seconds

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const isGet = !options.method || options.method === "GET";
  const cached = cache.get(path);
  if (isGet && cached && Date.now() - cached.ts < TTL) {
    return cached.data;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }

  const json = await res.json();
  if (isGet) cache.set(path, { data: json, ts: Date.now() });
  if (!isGet) cache.clear();
  return json;
}