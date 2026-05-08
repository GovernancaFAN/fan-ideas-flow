import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Lightbulb, KanbanSquare, ClipboardCheck, Rocket, Megaphone, Trophy, Settings, Search } from "lucide-react";
import logoPrograma from "@/assets/logo-somos-melhoria-continua.png";
import { useAuth } from "@/store/auth";
import { useAdmin } from "@/store/ideas";
import { ModuloKey } from "@/data/admin";

const items: { title: string; url: string; icon: any; mod: ModuloKey }[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, mod: "dashboard" },
  { title: "Nova Sugestão de Melhoria", url: "/nova", icon: Lightbulb, mod: "nova" },
  { title: "Status das Sugestões", url: "/kanban", icon: KanbanSquare, mod: "kanban" },
  { title: "Entendimento", url: "/entendimento", icon: Search, mod: "entendimento" },
  { title: "Comitê", url: "/comite", icon: ClipboardCheck, mod: "comite" },
  { title: "Implementação", url: "/implementacao", icon: Rocket, mod: "implementacao" },
  { title: "Campanhas", url: "/campanhas", icon: Megaphone, mod: "campanhas" },
  { title: "Ranking", url: "/ranking", icon: Trophy, mod: "ranking" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const perfil = useAuth((s) => s.perfil);
  const perms = useAdmin((s) => s.permissoesDoPerfil(String(perfil)));
  const visible = items.filter((i) => perms.includes(i.mod));
  const showAdmin = perms.includes("admin");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-soft flex items-center justify-center overflow-hidden ring-1 ring-border">
            <img src={logoPrograma} alt="Somos Melhoria Contínua" className="h-9 w-9 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-sm">Grupo FAN</span>
              <span className="text-[11px] text-muted-foreground">Melhoria Contínua</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Governança</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                    <NavLink to="/admin" className="flex items-center gap-3">
                      <Settings className="h-4 w-4" />
                      {!collapsed && <span className="font-medium">Administração</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Portal MC v1.0</p>
            <p>Conectando sugestões a resultados.</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
