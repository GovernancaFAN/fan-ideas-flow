import { create } from "zustand";
import { Idea, initialIdeas, HistoryEntry, IdeaStatus, Stage, Evaluation, calcScore, Campaign, campanhas as initialCampanhas } from "@/data/ideas";
import { EmpresaCfg, UsuarioPerfil, EtapaSla, PerfilCfg, empresasIniciais, usuariosIniciais, etapasSlaIniciais, perfisIniciais, ModuloKey } from "@/data/admin";
import { useNotifications } from "./notifications";

function notificar(idea: Idea, titulo: string, mensagem: string) {
  try {
    useNotifications.getState().add({
      destinatario: idea.colaborador,
      titulo,
      mensagem,
      ideaCode: idea.code,
    });
  } catch {}
}

interface IdeasState {
  ideas: Idea[];
  add: (i: Omit<Idea, "id" | "code" | "createdAt" | "history" | "status" | "stage" | "sla">) => Idea;
  update: (id: string, patch: Partial<Idea>) => void;
  addHistory: (id: string, h: HistoryEntry) => void;
  evaluate: (id: string, ev: Evaluation, feedback: string, user: string) => void;
  setStatus: (id: string, status: IdeaStatus, stage: Stage, feedback: string, user: string) => void;
  registrarEntendimento: (id: string, dados: { parecer: string; observacoes: string; entendimentoColab: string; user: string }) => void;
  replicarMultiplas: (id: string, empresas: string[], user: string) => Idea[];
  importar: (ideas: Partial<Idea>[]) => number;
  similares: (empresa: string, texto: string) => Idea[];
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
    notificar(idea, "Sugestão recebida", `Recebemos sua sugestão ${code}. Em breve será analisada.`);
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
              status: "A iniciar" as IdeaStatus,
              stage: "Implementação" as Stage,
              history: [...i.history, { date: new Date().toISOString().slice(0, 10), user, action: `Avaliado (nota ${score.toFixed(2)})`, feedback }],
            }
          : i
      ),
    });
    const idea = get().ideas.find((i) => i.id === id);
    if (idea) notificar(idea, "Sugestão aprovada", `Sua sugestão ${idea.code} foi aprovada e está aguardando início de implementação.`);
  },
  setStatus: (id, status, stage, feedback, user) => {
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
    });
    const idea = get().ideas.find((i) => i.id === id);
    if (idea) {
      const map: Record<string, string> = {
        "Em análise": "Sua sugestão está em análise.",
        "Em entendimento": "Estamos detalhando o entendimento da sua sugestão.",
        "Necessário novo entendimento": "O comitê solicitou novo entendimento da sua sugestão.",
        "Em comitê": "Sua sugestão está sendo avaliada pelo comitê.",
        "Aprovado": "Sua sugestão foi aprovada!",
        "Reprovado": "Sua sugestão foi reprovada. Veja o feedback.",
        "A iniciar": "Sua sugestão aguarda início de implementação.",
        "Em execução": "A implementação da sua sugestão começou.",
        "Concluído": "Sua sugestão foi concluída! 🎉",
      };
      if (map[status]) notificar(idea, status, `${idea.code}: ${map[status]}`);
    }
  },
  registrarEntendimento: (id, { parecer, observacoes, entendimentoColab, user }) => {
    set({
      ideas: get().ideas.map((i) =>
        i.id === id
          ? {
              ...i,
              parecerEntendimento: parecer,
              observacoesEntendimento: observacoes,
              entendimentoColaborador: entendimentoColab,
              status: "Em comitê",
              stage: "Comitê",
              history: [
                ...i.history,
                { date: new Date().toISOString().slice(0, 10), user, action: "Entendimento registrado", feedback: parecer },
              ],
            }
          : i
      ),
    });
  },
  replicarMultiplas: (id, empresas, user) => {
    const origem = get().ideas.find((i) => i.id === id);
    if (!origem) return [];
    const novas: Idea[] = empresas.map((emp, idx) => {
      const newId = String(Date.now() + idx);
      const code = `MC-${String(200 + get().ideas.length + idx).padStart(4, "0")}`;
      return {
        ...origem,
        id: newId,
        code,
        empresa: emp,
        status: "Pendente",
        stage: "Recebimento",
        progress: 0,
        actions: [],
        realizedGain: undefined,
        replicadaDe: origem.code,
        replicacoes: undefined,
        featured: false,
        createdAt: new Date().toISOString().slice(0, 10),
        sla: 48,
        history: [
          { date: new Date().toISOString().slice(0, 10), user, action: `Replicada de ${origem.code}`, feedback: `Origem: ${origem.empresa}` },
        ],
      };
    });
    const replicacoes = [
      ...(origem.replicacoes || []),
      ...novas.map((n) => ({ empresa: n.empresa, ideaId: n.id, status: n.status })),
    ];
    set({
      ideas: [
        ...novas,
        ...get().ideas.map((i) => (i.id === id ? { ...i, replicacoes } : i)),
      ],
    });
    return novas;
  },
  importar: (linhas) => {
    const base = get().ideas.length;
    const novas: Idea[] = linhas.map((l, idx) => {
      const id = String(Date.now() + idx);
      const code = l.code || `MC-${String(200 + base + idx).padStart(4, "0")}`;
      return {
        id,
        code,
        empresa: l.empresa || "FAN Indústria",
        colaborador: l.colaborador || "—",
        setorColaborador: l.setorColaborador || "—",
        setorAplicacao: l.setorAplicacao || "—",
        problema: l.problema || "",
        sugestao: l.sugestao || "",
        ganhoEsperado: l.ganhoEsperado,
        status: (l.status as IdeaStatus) || "Concluído",
        stage: (l.stage as Stage) || "Concluído",
        createdAt: l.createdAt || new Date().toISOString().slice(0, 10),
        sla: 0,
        importada: true,
        observacoesImport: l.observacoesImport,
        estimatedGain: l.estimatedGain,
        history: [
          { date: new Date().toISOString().slice(0, 10), user: "Sistema", action: "Importada do histórico", feedback: l.observacoesImport },
        ],
      };
    });
    set({ ideas: [...novas, ...get().ideas] });
    return novas.length;
  },
  similares: (empresa, texto) => {
    const t = texto.trim().toLowerCase();
    if (t.length < 12) return [];
    const tokens = new Set(t.split(/\s+/).filter((x) => x.length > 3));
    return get().ideas.filter((i) => {
      if (i.empresa !== empresa) return false;
      const target = (i.sugestao + " " + i.problema).toLowerCase();
      const tt = new Set(target.split(/\s+/).filter((x) => x.length > 3));
      const inter = [...tokens].filter((x) => tt.has(x)).length;
      const union = new Set([...tokens, ...tt]).size;
      const j = union ? inter / union : 0;
      return j >= 0.18 || target.includes(t.slice(0, 30));
    }).slice(0, 3);
  },
}));

interface AdminState {
  empresas: EmpresaCfg[];
  usuarios: UsuarioPerfil[];
  etapas: EtapaSla[];
  perfis: PerfilCfg[];
  campanhas: Campaign[];
  addEmpresa: (nome: string) => void;
  toggleEmpresa: (id: string) => void;
  addUsuario: (u: Omit<UsuarioPerfil, "id">) => void;
  toggleUsuario: (id: string) => void;
  updateUsuario: (id: string, patch: Partial<UsuarioPerfil>) => void;
  addEtapa: (e: Omit<EtapaSla, "id">) => void;
  updateEtapa: (id: string, patch: Partial<EtapaSla>) => void;
  removeEtapa: (id: string) => void;
  addPerfil: (p: Omit<PerfilCfg, "id">) => void;
  updatePerfil: (id: string, patch: Partial<PerfilCfg>) => void;
  togglePerfil: (id: string) => void;
  permissoesDoPerfil: (nome: string) => ModuloKey[];
  addCampanha: (c: Omit<Campaign, "id">) => void;
  toggleCampanha: (id: string) => void;
}

export const useAdmin = create<AdminState>((set, get) => ({
  empresas: empresasIniciais,
  usuarios: usuariosIniciais,
  etapas: etapasSlaIniciais,
  perfis: perfisIniciais,
  campanhas: initialCampanhas,
  addEmpresa: (nome) =>
    set({ empresas: [...get().empresas, { id: String(Date.now()), nome, ativa: true }] }),
  toggleEmpresa: (id) =>
    set({ empresas: get().empresas.map((e) => (e.id === id ? { ...e, ativa: !e.ativa } : e)) }),
  addUsuario: (u) => set({ usuarios: [...get().usuarios, { ...u, id: String(Date.now()), ativo: u.ativo ?? true }] }),
  toggleUsuario: (id) =>
    set({ usuarios: get().usuarios.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u)) }),
  updateUsuario: (id, patch) =>
    set({ usuarios: get().usuarios.map((u) => (u.id === id ? { ...u, ...patch } : u)) }),
  addEtapa: (e) => set({ etapas: [...get().etapas, { ...e, id: String(Date.now()) }] }),
  updateEtapa: (id, patch) =>
    set({ etapas: get().etapas.map((e) => (e.id === id ? { ...e, ...patch } : e)) }),
  removeEtapa: (id) => set({ etapas: get().etapas.filter((e) => e.id !== id) }),
  addPerfil: (p) => set({ perfis: [...get().perfis, { ...p, id: String(Date.now()) }] }),
  updatePerfil: (id, patch) =>
    set({ perfis: get().perfis.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
  togglePerfil: (id) =>
    set({ perfis: get().perfis.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)) }),
  permissoesDoPerfil: (nome) => {
    const p = get().perfis.find((x) => x.nome === nome && x.ativo);
    return p?.permissoes || [];
  },
  addCampanha: (c) => set({ campanhas: [...get().campanhas, { ...c, id: String(Date.now()) }] }),
  toggleCampanha: (id) =>
    set({ campanhas: get().campanhas.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)) }),
}));

/**
 * Lista de nomes de empresas ATIVAS (para filtrar visualizações).
 * Quando uma empresa é desativada, suas informações somem dos módulos.
 */
export function useEmpresasAtivasNomes(): string[] {
  return useAdmin((s) => s.empresas.filter((e) => e.ativa).map((e) => e.nome));
}

/** Ideias visíveis: apenas das empresas ativas. */
export function useVisibleIdeas() {
  const ideas = useIdeas((s) => s.ideas);
  const ativas = useEmpresasAtivasNomes();
  const set = new Set(ativas);
  return ideas.filter((i) => set.has(i.empresa));
}
