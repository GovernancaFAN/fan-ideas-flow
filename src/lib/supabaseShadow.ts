// Client "sombra" para criar usuários sem destruir a sessão do admin logado.
// Usa o mesmo projeto, mas NÃO persiste sessão no localStorage.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabaseShadow = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "sb-shadow",
  },
});

export function matriculaToEmail(matricula: string) {
  return `mat-${matricula.trim().toLowerCase()}@fan.local`;
}
