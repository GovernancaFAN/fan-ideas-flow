import { create } from "zustand";
import { Idea, initialIdeas, HistoryEntry, IdeaStatus, Stage, Evaluation, calcScore } from "@/data/ideas";

interface IdeasState {
  ideas: Idea[];
  add: (i: Omit<Idea, "id" | "code" | "createdAt" | "history" | "status" | "stage" | "sla">) => Idea;
  update: (id: string, patch: Partial<Idea>) => void;
  addHistory: (id: string, h: HistoryEntry) => void;
  evaluate: (id: string, ev: Evaluation, feedback: string, user: string) => void;
  setStatus: (id: string, status: IdeaStatus, stage: Stage, feedback: string, user: string) => void;
}

export const useIdeas = create<IdeasState>((set, get) => ({
  ideas: initialIdeas,
  add: (data) => {
    const id = String(Date.now());
    const code = `MC-${String(200 + get().ideas.length).padStart(4, "0")}`;
    const idea: Idea = {
      ...data,
      id,
      code,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "Pendente",
      stage: "Recebimento",
      sla: 48,
      history: [{ date: new Date().toISOString().slice(0, 10), user: data.colaborador, action: "Submissão" }],
    };
    set({ ideas: [idea, ...get().ideas] });
    return idea;
  },
  update: (id, patch) => set({ ideas: get().ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
  addHistory: (id, h) =>
    set({ ideas: get().ideas.map((i) => (i.id === id ? { ...i, history: [...i.history, h] } : i)) }),
  evaluate: (id, ev, feedback, user) => {
    const score = calcScore(ev);
    set({
      ideas: get().ideas.map((i) =>
        i.id === id
          ? {
              ...i,
              evaluation: ev,
              score,
              status: "Aprovado",
              stage: "Implementação",
              history: [...i.history, { date: new Date().toISOString().slice(0, 10), user, action: `Avaliado (nota ${score.toFixed(2)})`, feedback }],
            }
          : i
      ),
    });
  },
  setStatus: (id, status, stage, feedback, user) =>
    set({
      ideas: get().ideas.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              stage,
              history: [...i.history, { date: new Date().toISOString().slice(0, 10), user, action: status, feedback }],
            }
          : i
      ),
    }),
}));
