import { useMemo, useState } from "react";
import { useVisibleIdeas } from "@/store/ideas";
import { IdeaStatus } from "@/data/ideas";
import { IdeaCard } from "@/components/IdeaCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const columns: { key: IdeaStatus[]; title: string; tone: string }[] = [
  { key: ["Pendente"], title: "Submetidas", tone: "from-muted to-muted" },
  { key: ["Em análise", "Em entendimento", "Necessário novo entendimento"], title: "Em entendimento", tone: "from-info/20 to-info/5" },
  { key: ["Em comitê"], title: "Em comitê", tone: "from-warning/20 to-warning/5" },
  { key: ["Aprovado", "A iniciar"], title: "Aprovadas", tone: "from-primary/30 to-primary/5" },
  { key: ["Em execução"], title: "Em implementação", tone: "from-primary/40 to-primary/10" },
  { key: ["Concluído"], title: "Concluídas", tone: "from-success/30 to-success/5" },
  { key: ["Reprovado"], title: "Reprovadas", tone: "from-destructive/20 to-destructive/5" },
];

export default function Kanban() {
  const ideas = useVisibleIdeas();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return ideas;
    const t = q.toLowerCase();
    return ideas.filter((i) => [i.code, i.colaborador, i.empresa, i.sugestao, i.problema, i.setorAplicacao].some((s) => s.toLowerCase().includes(t)));
  }, [ideas, q]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Status das Sugestões</h1>
          <p className="text-sm text-muted-foreground">Visualize o ciclo de vida completo das sugestões.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar..." className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
        {columns.map((col) => {
          const items = filtered.filter((i) => col.key.includes(i.status));
          return (
            <div key={col.title} className="rounded-2xl border border-border bg-card/60 backdrop-blur p-3 min-h-[300px]">
              <div className={`rounded-xl bg-gradient-to-br ${col.tone} px-3 py-2 mb-3 flex items-center justify-between`}>
                <h3 className="font-display font-bold text-sm">{col.title}</h3>
                <span className="text-xs font-bold bg-card px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((i) => <IdeaCard key={i.id} idea={i} />)}
                {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Vazio</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
