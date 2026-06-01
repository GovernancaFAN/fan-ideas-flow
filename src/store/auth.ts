import { create } from "zustand";
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

// Acesso aberto (sem login). Perfil padrão Administrador para visualizar todos os módulos.
export const useAuth = create<AuthState>((set) => ({
  ready: true,
  userId: "demo",
  nome: "Administrador Demo",
  email: "admin@fan.local",
  empresa: "Usibras - Aquiraz",
  matricula: undefined,
  perfil: "Administrador",
  setUser: (u) => set((s) => ({ ...s, ...u })),
  signOut: async () => {},
  loadProfile: async () => {},
  init: () => {},
}));
