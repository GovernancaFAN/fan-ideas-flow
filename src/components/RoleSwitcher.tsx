import { useAuth } from "@/store/auth";
import { useAdmin } from "@/store/ideas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog } from "lucide-react";

export function RoleSwitcher() {
  const { perfil, setUser } = useAuth();
  const perfis = useAdmin((s) => s.perfis).filter((p) => p.ativo);
  return (
    <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-muted/40">
      <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Perfil ativo</span>
      <Select value={String(perfil)} onValueChange={(v) => setUser({ perfil: v as any, nome: v === "Colaborador" ? "Colaborador (Mat. 12345)" : v + " Demo" })}>
        <SelectTrigger className="h-7 border-0 bg-transparent text-xs font-semibold w-[180px] focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {perfis.map((p) => (
            <SelectItem key={p.id} value={String(p.nome)}>{p.nome}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
