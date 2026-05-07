# Evolução do Portal de Melhoria Contínua

Mudanças amplas em fluxo, governança, perfis e UI. Como o MVP é frontend com mock (sem login), simulamos perfil ativo via seletor no topo (mock auth) para demonstrar o controle de acesso.

## 1. Modelo de dados (src/data + src/store)

- **Idea**: novo campo `stage` expandido — `Recebimento | Entendimento | Comitê | Implementação | Concluído`. Novo status `A iniciar`. Campo `importada?: boolean`, `parecerEntendimento?: string`, `replicacoes?: { empresa: string; status: IdeaStatus; ideaId: string }[]`. `ganhoEsperado` opcional.
- **EmpresaCfg**: já tem `ativa`. **UsuarioPerfil**: adicionar `ativo: boolean`, `matricula?: string`. Nada de exclusão — só toggle ativo.
- **PerfilCfg** (novo): `{ id, nome, ativo, permissoes: ModuloKey[] }` — perfis dinâmicos com módulos liberados. Seed com os 7 perfis do briefing.
- **EtapaSla** (novo, substitui SlaConfig estático): `{ id, nome, ordem, dias, ativa, exigeAprovacao, responsavelPerfilId, ativa }`. CRUD completo no Admin.
- **Notificação** (novo): lista de notificações por colaborador (mock toast + sino no header) gerada automaticamente em mudanças de status.

## 2. Mock auth / perfil ativo

- Componente `RoleSwitcher` no header do `AppLayout` (select com perfis ativos) — define `currentUser` no `useAuth` store (zustand).
- `AppSidebar` filtra itens por permissões do perfil ativo.
- Rotas protegidas via wrapper `<RequirePerm module="...">` em `App.tsx` (redireciona para `/` se sem acesso).

## 3. Importação histórica (`/admin` aba "Importar")

- Upload `.csv`/`.xlsx` (parse com SheetJS — `xlsx` lib).
- Seleção de empresa de destino + tabela de mapeamento de colunas (origem → campo do sistema).
- Preview das primeiras 10 linhas, botão Importar — cria ideias com `importada: true` e histórico inicial "Importada do histórico".

## 4. Fluxo com etapa "Entendimento da melhoria"

- Nova aba/página de Entendimento (ou seção dentro do Comitê) onde Ponto Focal registra parecer inicial, observações, entendimento com colaborador, complementos. Avança para Comitê.
- Atualização do Kanban e Pipeline do Dashboard com as 8 colunas: Submetidas → Em análise → Em comitê → Novo entendimento → Aprovadas → A iniciar → Em implementação → Concluídas. Reprovadas como bucket lateral.

## 5. Replicação multi-empresa

- Modal no Admin/IdeaDetail com checklist de empresas (multi-select). Ao confirmar, gera N novas ideias linkadas e popula `replicacoes[]` da origem com status acompanhado.

## 6. Alerta de similaridade

- No `NovaIdeia`, ao digitar título/sugestão, busca por similaridade simples (substring + Jaccard de tokens) entre ideias da mesma empresa. Se similar ≥ threshold, exibe `<Alert>` amigável com a mensagem do briefing. Não bloqueia.

## 7. Ajustes UI/forma

- "Ganho esperado" opcional no formulário.
- Renomear menu "Monitoramento de Status das Sugestões" → "Status das Sugestões".
- Dashboard: remover bloco de KPIs acima do pipeline; pipeline com 8 etapas.
- Sino de notificações no header (popover com lista mock por colaborador).

## 8. Admin — abas

`Empresas | Usuários | Perfis | SLA por etapa | Replicações | Importação`

- Usuários: ativar/desativar (sem botão excluir), criar com matrícula (operacional) ou nome+email+empresa+perfil.
- Perfis: CRUD com checklist de módulos.
- SLA: CRUD de etapas dinâmicas.

## Arquivos principais

**Novos**: `src/store/auth.ts`, `src/store/notifications.ts`, `src/data/perfis.ts`, `src/components/RoleSwitcher.tsx`, `src/components/NotificationsBell.tsx`, `src/components/RequirePerm.tsx`, `src/components/SimilarityAlert.tsx`, `src/pages/Entendimento.tsx`, `src/pages/admin/ImportHistorico.tsx` (+ subcomponentes em `src/components/admin/`).

**Editados**: `src/data/ideas.ts`, `src/data/admin.ts`, `src/store/ideas.ts`, `src/App.tsx`, `src/components/AppLayout.tsx`, `src/components/AppSidebar.tsx`, `src/pages/Admin.tsx`, `src/pages/Dashboard.tsx`, `src/pages/Kanban.tsx`, `src/pages/NovaIdeia.tsx`, `src/pages/IdeaDetail.tsx`, `src/pages/Comite.tsx`.

**Dependência nova**: `xlsx` (parse de planilhas).

## Observações

- Tudo continua mock (sem backend). Notificações = lista em memória + toast.
- "Login por matrícula" simulado pelo RoleSwitcher (sem tela de login real).
- Se quiser autenticação real, e-mail e persistência, ative Lovable Cloud em seguida.
