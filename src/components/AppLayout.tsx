import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AppLayout() {
  const navigate = useNavigate();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 max-w-md w-full px-3 py-1.5 rounded-lg bg-muted/60 border border-transparent focus-within:border-primary/40 focus-within:bg-background transition">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar ideias, colaboradores, setores..." className="border-0 bg-transparent h-7 px-0 focus-visible:ring-0" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <Button onClick={() => navigate("/nova")} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <Plus className="h-4 w-4 mr-1" /> Nova ideia
              </Button>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border ml-2">
                <div className="h-9 w-9 rounded-full bg-gradient-soft flex items-center justify-center font-display font-bold text-primary-deep">
                  AC
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold">Ana Costa</p>
                  <p className="text-[11px] text-muted-foreground">Ponto Focal · FAN Indústria</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
