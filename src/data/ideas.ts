export type IdeaStatus =
  | "Pendente"
  | "Em análise"
  | "Aprovado"
  | "Reprovado"
  | "Em execução"
  | "Concluído"
  | "Necessário novo entendimento";

export type Stage = "Recebimento" | "Comitê" | "Implementação" | "Concluído";

export interface Evaluation {
  abrangencia: number;
  reducaoImpacto: number;
  retornoFinanceiro: number;
  criatividade: number;
  investimento: number;
}

export interface HistoryEntry {
  date: string;
  user: string;
  action: string;
  feedback?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  responsible: string;
  due: string;
  done: boolean;
}

export type GainType = "Quantitativo" | "Qualitativo";
export type QualitativeCategory = "Segurança" | "Qualidade" | "Ergonomia" | "Processo" | "Ambiental" | "Pessoas";

export interface Idea {
  id: string;
  code: string;
  empresa: string;
  colaborador: string;
  setorColaborador: string;
  setorAplicacao: string;
  problema: string;
  sugestao: string;
  ganhoEsperado: string;
  status: IdeaStatus;
  stage: Stage;
  createdAt: string;
  sla: number; // hours remaining
  evaluation?: Evaluation;
  score?: number;
  gainType?: GainType;
  estimatedGain?: number;
  realizedGain?: number;
  qualitativeBenefit?: string;
  qualitativeCategory?: QualitativeCategory;
  implementationCost?: number;
  progress?: number;
  actions?: ActionItem[];
  history: HistoryEntry[];
  campaign?: string;
  featured?: boolean;
  replicavel?: boolean;
  replicadaDe?: string; // id da ideia origem
}

export const empresas = [
  "FAN Indústria",
  "FAN Logística",
  "FAN Agro",
  "FAN Energia",
  "FAN Serviços",
];

export const setores = [
  "Produção",
  "Manutenção",
  "Qualidade",
  "Logística",
  "Administrativo",
  "Comercial",
  "TI",
  "RH",
  "Financeiro",
  "SST",
];

export type CampaignType = "Redução de custo" | "5S" | "Inovação" | "Segurança" | "Qualidade" | "Sustentabilidade";

export interface Campaign {
  id: string;
  nome: string;
  empresa: string; // "Todas" ou nome
  inicio: string;
  fim: string;
  objetivo: string;
  tipo: CampaignType;
  cor: string;
  descricao: string;
  ativa: boolean;
}

export const campanhas: Campaign[] = [
  { id: "c1", nome: "Redução de Custos 2026", empresa: "Todas", inicio: "2026-01-01", fim: "2026-12-31", objetivo: "Reduzir 5% do OPEX", tipo: "Redução de custo", cor: "from-orange-500 to-amber-500", descricao: "Ideias que reduzam custos operacionais.", ativa: true },
  { id: "c2", nome: "5S nas Áreas", empresa: "FAN Indústria", inicio: "2026-03-01", fim: "2026-08-31", objetivo: "Implantar 5S em 100% das áreas produtivas", tipo: "5S", cor: "from-amber-500 to-yellow-500", descricao: "Organização, limpeza e disciplina.", ativa: true },
  { id: "c3", nome: "Inovação Aberta", empresa: "Todas", inicio: "2026-02-01", fim: "2026-12-31", objetivo: "Capturar soluções pioneiras e escaláveis", tipo: "Inovação", cor: "from-rose-500 to-orange-500", descricao: "Soluções pioneiras e replicáveis.", ativa: true },
  { id: "c4", nome: "Zero Acidente 2025", empresa: "Todas", inicio: "2025-01-01", fim: "2025-12-31", objetivo: "Reduzir TFCA em 30%", tipo: "Segurança", cor: "from-red-500 to-orange-500", descricao: "Encerrada em 2025.", ativa: false },
];

export function calcScore(e: Evaluation) {
  // pesos: abrangência 10, redução 20, financeiro 40, criatividade 20, investimento 10
  return (
    e.abrangencia * 0.1 +
    e.reducaoImpacto * 0.2 +
    e.retornoFinanceiro * 0.4 +
    e.criatividade * 0.2 +
    e.investimento * 0.1
  );
}

export const criterios = {
  abrangencia: [
    { v: 0.5, label: "No setor" },
    { v: 1, label: "Em até 3 setores" },
    { v: 1.5, label: "Na empresa como um todo" },
    { v: 2, label: "Replicável para outras empresas do grupo" },
  ],
  reducaoImpacto: [
    { v: 1.5, label: "Reduziu o impacto" },
    { v: 3.5, label: "Eliminação do impacto" },
  ],
  retornoFinanceiro: [
    { v: 0.5, label: "Ganho intangível" },
    { v: 1, label: "Sem mensuração financeira definida" },
    { v: 1.5, label: "Ganho financeiro estimado" },
    { v: 2, label: "Ganho financeiro comprovado" },
  ],
  criatividade: [
    { v: 1.5, label: "Decorrente de outras ideias" },
    { v: 3.5, label: "Ideia pioneira" },
  ],
  investimento: [
    { v: 0.5, label: "Acima ou igual a R$ 3.000" },
    { v: 1, label: "Entre R$ 500 e R$ 3.000" },
    { v: 1.5, label: "Abaixo ou igual a R$ 500" },
    { v: 2, label: "Sem investimento" },
  ],
};

export const initialIdeas: Idea[] = [
  {
    id: "1", code: "MC-0142", empresa: "FAN Indústria", colaborador: "Carlos Mendes",
    setorColaborador: "Manutenção", setorAplicacao: "Produção",
    problema: "Paradas frequentes da linha 3 por desalinhamento de esteira causando perda de 4h/semana.",
    sugestao: "Instalar guias laterais ajustáveis com sensor de desvio integrado ao CLP.",
    ganhoEsperado: "Redução de 80% das paradas e ganho de produtividade.",
    status: "Concluído", stage: "Concluído", createdAt: "2026-03-12", sla: 0,
    evaluation: { abrangencia: 1, reducaoImpacto: 3.5, retornoFinanceiro: 2, criatividade: 1.5, investimento: 1 },
    score: 2.1, estimatedGain: 84000, realizedGain: 92000, progress: 100, featured: true,
    actions: [
      { id: "a1", title: "Especificar sensores", responsible: "João P.", due: "2026-04-01", done: true },
      { id: "a2", title: "Compra e instalação", responsible: "Manutenção", due: "2026-04-15", done: true },
    ],
    history: [
      { date: "2026-03-12", user: "Carlos Mendes", action: "Submissão" },
      { date: "2026-03-13", user: "Ana (Ponto Focal)", action: "Aprovação inicial", feedback: "Ideia clara e viável." },
      { date: "2026-03-18", user: "Comitê", action: "Aprovado", feedback: "Alto retorno e replicável." },
      { date: "2026-04-22", user: "Manutenção", action: "Concluído", feedback: "Resultados validados." },
    ],
    campaign: "Redução de Custos 2026",
  },
  {
    id: "2", code: "MC-0156", empresa: "FAN Logística", colaborador: "Patrícia Souza",
    setorColaborador: "Logística", setorAplicacao: "Logística",
    problema: "Reentregas por endereços incompletos no sistema de roteirização.",
    sugestao: "Validação automática de CEP + geocoding antes de fechar o pedido.",
    ganhoEsperado: "Reduzir reentregas em 35%.",
    status: "Em execução", stage: "Implementação", createdAt: "2026-04-02", sla: 48,
    evaluation: { abrangencia: 1.5, reducaoImpacto: 1.5, retornoFinanceiro: 1.5, criatividade: 1.5, investimento: 1.5 },
    score: 1.5, estimatedGain: 56000, progress: 60,
    actions: [
      { id: "a1", title: "Integração API CEP", responsible: "TI", due: "2026-05-10", done: true },
      { id: "a2", title: "Treinar atendentes", responsible: "Op. Log.", due: "2026-05-20", done: false },
    ],
    history: [
      { date: "2026-04-02", user: "Patrícia Souza", action: "Submissão" },
      { date: "2026-04-03", user: "Ricardo (PF)", action: "Em análise", feedback: "Encaminhado ao comitê." },
      { date: "2026-04-09", user: "Comitê", action: "Aprovado", feedback: "Ganho operacional consistente." },
    ],
    campaign: "Redução de Custos 2026",
  },
  {
    id: "3", code: "MC-0173", empresa: "FAN Agro", colaborador: "Eduardo Lima",
    setorColaborador: "Qualidade", setorAplicacao: "Produção",
    problema: "Amostras de matéria-prima demoram para chegar ao laboratório.",
    sugestao: "Tubo pneumático entre recepção e laboratório.",
    ganhoEsperado: "Reduzir tempo de análise em 60%.",
    status: "Em análise", stage: "Comitê", createdAt: "2026-04-20", sla: 72,
    history: [
      { date: "2026-04-20", user: "Eduardo Lima", action: "Submissão" },
      { date: "2026-04-21", user: "Marina (PF)", action: "Encaminhado ao comitê", feedback: "Boa ideia, avaliar custo." },
    ],
    campaign: "Inovação Aberta",
  },
  {
    id: "4", code: "MC-0181", empresa: "FAN Energia", colaborador: "Juliana Reis",
    setorColaborador: "Administrativo", setorAplicacao: "Administrativo",
    problema: "Impressão excessiva de relatórios mensais.",
    sugestao: "Migrar relatórios para dashboard digital com assinatura eletrônica.",
    ganhoEsperado: "Economia de papel e tempo.",
    status: "Pendente", stage: "Recebimento", createdAt: "2026-05-01", sla: 24,
    history: [{ date: "2026-05-01", user: "Juliana Reis", action: "Submissão" }],
    campaign: "5S nas Áreas",
  },
  {
    id: "5", code: "MC-0188", empresa: "FAN Indústria", colaborador: "Marcos Oliveira",
    setorColaborador: "Produção", setorAplicacao: "Produção",
    problema: "Setup demorado nas trocas de molde.",
    sugestao: "Aplicar SMED com kit ferramentas dedicado por máquina.",
    ganhoEsperado: "Reduzir setup em 50%.",
    status: "Aprovado", stage: "Implementação", createdAt: "2026-04-25", sla: 60,
    evaluation: { abrangencia: 1, reducaoImpacto: 3.5, retornoFinanceiro: 1.5, criatividade: 1.5, investimento: 2 },
    score: 1.95, estimatedGain: 120000, progress: 15,
    actions: [
      { id: "a1", title: "Mapear setups", responsible: "Eng. Proc.", due: "2026-05-15", done: false },
    ],
    history: [
      { date: "2026-04-25", user: "Marcos Oliveira", action: "Submissão" },
      { date: "2026-04-26", user: "Ana (PF)", action: "Aprovação inicial", feedback: "Excelente." },
      { date: "2026-04-30", user: "Comitê", action: "Aprovado", feedback: "Replicar para outras linhas." },
    ],
  },
  {
    id: "6", code: "MC-0190", empresa: "FAN Serviços", colaborador: "Roberta Alves",
    setorColaborador: "RH", setorAplicacao: "RH",
    problema: "Falta um café melhor na copa.",
    sugestao: "Trocar marca do café.",
    ganhoEsperado: "Mais felicidade.",
    status: "Reprovado", stage: "Recebimento", createdAt: "2026-04-28", sla: 0,
    history: [
      { date: "2026-04-28", user: "Roberta Alves", action: "Submissão" },
      { date: "2026-04-29", user: "Sistema", action: "Reprovado", feedback: "Fora do escopo: solicitação sem ganho operacional/financeiro mensurável." },
    ],
  },
  {
    id: "7", code: "MC-0192", empresa: "FAN Logística", colaborador: "Felipe Santana",
    setorColaborador: "TI", setorAplicacao: "Logística",
    problema: "Muitos e-mails para conferir notas.",
    sugestao: "Automatizar conferência via OCR + RPA.",
    ganhoEsperado: "Liberar 2 FTEs para análise.",
    status: "Necessário novo entendimento", stage: "Comitê", createdAt: "2026-04-15", sla: 24,
    history: [
      { date: "2026-04-15", user: "Felipe Santana", action: "Submissão" },
      { date: "2026-04-16", user: "Ricardo (PF)", action: "Encaminhado", feedback: "Ok." },
      { date: "2026-04-22", user: "Comitê", action: "Necessário novo entendimento", feedback: "Detalhar volume de notas e sistemas envolvidos." },
    ],
  },
];
