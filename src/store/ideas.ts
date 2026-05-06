import { create } from "zustand";
import { Idea, initialIdeas, HistoryEntry, IdeaStatus, Stage, Evaluation, calcScore, Campaign, campanhas as initialCampanhas } from "@/data/ideas";
import { EmpresaCfg, UsuarioPerfil, SlaConfig, empresasIniciais, usuariosIniciais, slaPadrao } from "@/data/admin";

interface IdeasState {
  ideas: Idea[];
  add: (i: Omit<Idea, "id" | "code" | "createdAt" | "history" | "status" | "stage" | "sla">) => Idea;
  update: (id: string, patch: Partial<Idea>) => void;
  addHistory: (id: string, h: HistoryEntry) => void;
  evaluate: (id: string, ev: Evaluation, feedback: string, user: string) => void;
  setStatus: (id: string, status: IdeaStatus, stage: Stage, feedback: string, user: string) => void;
  replicar: (id: string, empresaDestino: string, user: string) => Idea | null;
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
  replicar: (id, empresaDestino, user) => {
    const origem = get().ideas.find((i) => i.id === id);
    if (!origem) return null;
    const newId = String(Date.now());
    const code = `MC-${String(200 + get().ideas.length).padStart(4, "0")}`;
    const nova: Idea = {
      ...origem,
      id: newId,
      code,
      empresa: empresaDestino,
      status: "Pendente",
      stage: "Recebimento",
      progress: 0,
      actions: [],
      realizedGain: undefined,
      replicadaDe: origem.code,
      featured: false,
      createdAt: new Date().toISOString().slice(0, 10),
      sla: 48,
      history: [{ date: new Date().toISOString().slice(0, 10), user, action: `Replicada de ${origem.code}`, feedback: `Origem: ${origem.empresa}` }],
    };
    set({ ideas: [nova, ...get().ideas] });
    return nova;
  },
}));

interface AdminState {
  empresas: EmpresaCfg[];
  usuarios: UsuarioPerfil[];
  slas: SlaConfig[];
  campanhas: Campaign[];
  addEmpresa: (nome: string) => void;
  toggleEmpresa: (id: string) => void;
  addUsuario: (u: Omit<UsuarioPerfil, "id">) => void;
  removeUsuario: (id: string) => void;
  updateSla: (etapa: SlaConfig["etapa"], patch: Partial<SlaConfig>) => void;
  addCampanha: (c: Omit<Campaign, "id">) => void;
  toggleCampanha: (id: string) => void;
}

export const useAdmin = create<AdminState>((set, get) => ({
  empresas: empresasIniciais,
  usuarios: usuariosIniciais,
  slas: slaPadrao,
  campanhas: initialCampanhas,
  addEmpresa: (nome) =>
    set({ empresas: [...get().empresas, { id: String(Date.now()), nome, ativa: true }] }),
  toggleEmpresa: (id) =>
    set({ empresas: get().empresas.map((e) => (e.id === id ? { ...e, ativa: !e.ativa } : e)) }),
  addUsuario: (u) => set({ usuarios: [...get().usuarios, { ...u, id: String(Date.now()) }] }),
  removeUsuario: (id) => set({ usuarios: get().usuarios.filter((u) => u.id !== id) }),
  updateSla: (etapa, patch) =>
    set({ slas: get().slas.map((s) => (s.etapa === etapa ? { ...s, ...patch } : s)) }),
  addCampanha: (c) => set({ campanhas: [...get().campanhas, { ...c, id: String(Date.now()) }] }),
  toggleCampanha: (id) =>
    set({ campanhas: get().campanhas.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)) }),
}));
