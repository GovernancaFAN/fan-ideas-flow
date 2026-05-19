import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Perfil } from "@/data/admin";

interface AuthState {
  ready: boolean;
  userId: string | null;
  nome: string;
  email: string;
  empresa: string;
  matricula?: string;
  perfil: Perfil | string;
  setUser: (u: Partial<AuthState>) => void;
  signOut: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  init: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  ready: false,
  userId: null,
  nome: "",
  email: "",
  empresa: "",
  matricula: undefined,
  perfil: "",
  setUser: (u) => set((s) => ({ ...s, ...u })),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null, nome: "", email: "", empresa: "", matricula: undefined, perfil: "" });
  },
  loadProfile: async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("nome,email,empresa,matricula,perfil,ativo")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      if (data.ativo === false) {
        await supabase.auth.signOut();
        set({ userId: null, nome: "", email: "", empresa: "", matricula: undefined, perfil: "" });
        return;
      }
      set({
        userId,
        nome: data.nome || "",
        email: data.email || "",
        empresa: data.empresa || "",
        matricula: data.matricula || undefined,
        perfil: data.perfil || "Colaborador",
      });
    }
  },
  init: () => {
    // Listener PRIMEIRO
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ userId: session.user.id });
        // defer profile fetch para evitar deadlock
        setTimeout(() => get().loadProfile(session.user.id), 0);
      } else {
        set({ userId: null, nome: "", email: "", empresa: "", matricula: undefined, perfil: "" });
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        set({ userId: data.session.user.id });
        get().loadProfile(data.session.user.id).finally(() => set({ ready: true }));
      } else {
        set({ ready: true });
      }
    });
  },
}));
