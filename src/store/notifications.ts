import { create } from "zustand";

export interface Notificacao {
  id: string;
  destinatario: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  ideaCode?: string;
}

interface NotState {
  itens: Notificacao[];
  add: (n: Omit<Notificacao, "id" | "data" | "lida">) => void;
  marcarLidas: () => void;
}

export const useNotifications = create<NotState>((set, get) => ({
  itens: [
    { id: "n1", destinatario: "Carlos Mendes", titulo: "Sugestão concluída", mensagem: "Sua sugestão MC-0142 foi concluída com ganho validado.", data: "2026-04-22", lida: false, ideaCode: "MC-0142" },
    { id: "n2", destinatario: "Patrícia Souza", titulo: "Em implementação", mensagem: "Sua sugestão MC-0156 entrou em implementação.", data: "2026-04-09", lida: false, ideaCode: "MC-0156" },
  ],
  add: (n) =>
    set({
      itens: [
        { ...n, id: String(Date.now() + Math.random()), data: new Date().toISOString().slice(0, 10), lida: false },
        ...get().itens,
      ],
    }),
  marcarLidas: () => set({ itens: get().itens.map((i) => ({ ...i, lida: true })) }),
}));
