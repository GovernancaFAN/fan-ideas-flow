export type Perfil =
  | "Colaborador"
  | "Superintendência"
  | "Diretoria"
  | "Líder de Melhoria Contínua"
  | "Ponto Focal"
  | "Comitê"
  | "BP de RH"
  | "Administrador";

export const perfis: Perfil[] = [
  "Colaborador",
  "Superintendência",
  "Diretoria",
  "Líder de Melhoria Contínua",
  "Ponto Focal",
  "Comitê",
  "BP de RH",
  "Administrador",
];

export type ModuloKey =
  | "dashboard"
  | "nova"
  | "kanban"
  | "campanhas"
  | "ranking"
  | "comite"
  | "entendimento"
  | "implementacao"
  | "admin";

export const MODULOS: { key: ModuloKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "nova", label: "Nova sugestão de melhoria" },
  { key: "kanban", label: "Status das Sugestões" },
  { key: "campanhas", label: "Campanhas" },
  { key: "ranking", label: "Ranking" },
  { key: "entendimento", label: "Entendimento" },
  { key: "comite", label: "Comitê" },
  { key: "implementacao", label: "Implementação" },
  { key: "admin", label: "Administração" },
];

export interface PerfilCfg {
  id: string;
  nome: Perfil | string;
  ativo: boolean;
  permissoes: ModuloKey[];
}

export const perfisIniciais: PerfilCfg[] = [
  { id: "p1", nome: "Colaborador", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking"] },
  { id: "p2", nome: "Superintendência", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking"] },
  { id: "p3", nome: "Diretoria", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking"] },
  { id: "p4", nome: "Ponto Focal", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking","entendimento","comite","implementacao"] },
  { id: "p5", nome: "BP de RH", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking","implementacao"] },
  { id: "p6", nome: "Comitê", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking","comite","implementacao"] },
  { id: "p7", nome: "Líder de Melhoria Contínua", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking","entendimento","comite","implementacao"] },
  { id: "p8", nome: "Administrador", ativo: true, permissoes: ["dashboard","nova","kanban","campanhas","ranking","entendimento","comite","implementacao","admin"] },
];

export interface EmpresaCfg {
  id: string;
  nome: string;
  ativa: boolean;
}

export interface UsuarioPerfil {
  id: string;
  nome: string;
  email: string;
  matricula?: string;
  empresa: string;
  perfil: Perfil | string;
  ativo: boolean;
}

export interface EtapaSla {
  id: string;
  nome: string;
  ordem: number;
  dias: number;
  ativa: boolean;
  exigeAprovacao: boolean;
  responsavelPerfil: Perfil | string;
}

export const empresasIniciais: EmpresaCfg[] = [
  { id: "e1", nome: "FAN Indústria", ativa: true },
  { id: "e2", nome: "FAN Logística", ativa: true },
  { id: "e3", nome: "FAN Agro", ativa: true },
  { id: "e4", nome: "FAN Energia", ativa: true },
  { id: "e5", nome: "FAN Serviços", ativa: true },
];

export const usuariosIniciais: UsuarioPerfil[] = [
  { id: "u1", nome: "Ana Lima", email: "ana@fan.com", empresa: "FAN Indústria", perfil: "Ponto Focal", ativo: true },
  { id: "u2", nome: "Ricardo Souza", email: "ricardo@fan.com", empresa: "FAN Logística", perfil: "Ponto Focal", ativo: true },
  { id: "u3", nome: "Marina Costa", email: "marina@fan.com", empresa: "FAN Agro", perfil: "Líder de Melhoria Contínua", ativo: true },
  { id: "u4", nome: "Paulo Henrique", email: "paulo@fan.com", empresa: "FAN Indústria", perfil: "Comitê", ativo: true },
  { id: "u5", nome: "Beatriz Nunes", email: "bia@fan.com", empresa: "FAN Serviços", perfil: "BP de RH", ativo: true },
  { id: "u6", nome: "Roberto Diniz", email: "roberto@fan.com", empresa: "FAN Indústria", perfil: "Diretoria", ativo: true },
  { id: "u7", nome: "Helena Prado", email: "helena@fan.com", empresa: "FAN Indústria", perfil: "Superintendência", ativo: true },
  { id: "u8", nome: "João Operador", email: "—", matricula: "12345", empresa: "FAN Indústria", perfil: "Colaborador", ativo: true },
  { id: "u9", nome: "Admin Master", email: "admin@fan.com", empresa: "FAN Indústria", perfil: "Administrador", ativo: true },
];

export const etapasSlaIniciais: EtapaSla[] = [
  { id: "s1", nome: "Recebimento", ordem: 1, dias: 2, ativa: true, exigeAprovacao: false, responsavelPerfil: "Ponto Focal" },
  { id: "s2", nome: "Entendimento", ordem: 2, dias: 3, ativa: true, exigeAprovacao: false, responsavelPerfil: "Ponto Focal" },
  { id: "s3", nome: "Comitê", ordem: 3, dias: 5, ativa: true, exigeAprovacao: true, responsavelPerfil: "Comitê" },
  { id: "s4", nome: "Implementação", ordem: 4, dias: 30, ativa: true, exigeAprovacao: false, responsavelPerfil: "Líder de Melhoria Contínua" },
];
