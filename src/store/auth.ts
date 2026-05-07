import { create } from "zustand";
import { Perfil } from "@/data/admin";

interface AuthState {
  nome: string;
  empresa: string;
  perfil: Perfil | string;
  setUser: (u: Partial<AuthState>) => void;
}

export const useAuth = create<AuthState>((set) => ({
  nome: "Admin Master",
  empresa: "FAN Indústria",
  perfil: "Administrador",
  setUser: (u) => set((s) => ({ ...s, ...u })),
}));
