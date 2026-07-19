import { supabase } from "./supabase";

const api = import.meta.env.VITE_API_BASE;

export async function apiFetch(path: string, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session) headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(`${api}${path}`, { ...init, headers });
}
