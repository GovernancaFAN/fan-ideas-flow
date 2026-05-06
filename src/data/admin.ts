export type Perfil =
  | "Superintendência"
  | "Diretoria"
  | "Líder de Melhoria Contínua"
  | "Ponto Focal"
  | "Comitê"
  | "BP de RH";

export const perfis: Perfil[] = [
  "Superintendência",
  "Diretoria",
  "Líder de Melhoria Contínua",
  "Ponto Focal",
  "Comitê",
  "BP de RH",
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
  empresa: string;
  perfil: Perfil;
}

export interface SlaConfig {
  etapa: "Recebimento" | "Comitê" | "Implementação";
  horas: number;
  responsavel: Perfil;
}

export const empresasIniciais: EmpresaCfg[] = [
  { id: "e1", nome: "FAN Indústria", ativa: true },
  { id: "e2", nome: "FAN Logística", ativa: true },
  { id: "e3", nome: "FAN Agro", ativa: true },
  { id: "e4", nome: "FAN Energia", ativa: true },
  { id: "e5", nome: "FAN Serviços", ativa: true },
];

export const usuariosIniciais: UsuarioPerfil[] = [
  { id: "u1", nome: "Ana Lima", email: "ana@fan.com", empresa: "FAN Indústria", perfil: "Ponto Focal" },
  { id: "u2", nome: "Ricardo Souza", email: "ricardo@fan.com", empresa: "FAN Logística", perfil: "Ponto Focal" },
  { id: "u3", nome: "Marina Costa", email: "marina@fan.com", empresa: "FAN Agro", perfil: "Líder de Melhoria Contínua" },
  { id: "u4", nome: "Paulo Henrique", email: "paulo@fan.com", empresa: "FAN Indústria", perfil: "Comitê" },
  { id: "u5", nome: "Beatriz Nunes", email: "bia@fan.com", empresa: "FAN Serviços", perfil: "BP de RH" },
  { id: "u6", nome: "Roberto Diniz", email: "roberto@fan.com", empresa: "FAN Indústria", perfil: "Diretoria" },
  { id: "u7", nome: "Helena Prado", email: "helena@fan.com", empresa: "FAN Indústria", perfil: "Superintendência" },
];

export const slaPadrao: SlaConfig[] = [
  { etapa: "Recebimento", horas: 48, responsavel: "Ponto Focal" },
  { etapa: "Comitê", horas: 120, responsavel: "Comitê" },
  { etapa: "Implementação", horas: 720, responsavel: "Líder de Melhoria Contínua" },
];
