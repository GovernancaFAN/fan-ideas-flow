import { useIdeas } from "@/store/ideas";
import { Trophy, Medal } from "lucide-react";
import { useMemo } from "react";

export default function Ranking() {
  const ideas = useIdeas((s) => s.ideas);
  const data = useMemo(() => {
    const map: Record<string, { count: number; gain: number; concluded: number }> = {};
    ideas.forEach((i) => {
      const k = i.colaborador;
      if (!map[k]) map[k] = { count: 0, gain: 0, concluded: 0 };
      map[k].count++;
      map[k].gain += i.realizedGain || 0;
      if (i.status === "Concluído") map[k].concluded++;
    });
    return Object.entries(map).sort((a, b) => b[1].gain - a[1].gain || b[1].count - a[1].count);
  }, [ideas]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Trophy className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Ranking de colaboradores</h1>
          <p className="text-sm text-muted-foreground">Reconhecendo quem transforma o Grupo FAN.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        {data.map(([nome, d], idx) => (
          <div key={nome} className={`flex items-center gap-4 p-4 ${idx < data.length - 1 ? "border-b border-border" : ""}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-display font-bold ${
              idx === 0 ? "bg-gradient-primary text-primary-foreground shadow-glow" :
              idx === 1 ? "bg-amber-200 text-amber-900" :
              idx === 2 ? "bg-orange-200 text-orange-900" : "bg-muted text-muted-foreground"
            }`}>
              {idx < 3 ? <Medal className="h-5 w-5" /> : idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold">{nome}</p>
              <p className="text-xs text-muted-foreground">{d.count} ideias · {d.concluded} concluídas</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-primary-deep">R$ {d.gain.toLocaleString("pt-BR")}</p>
              <p className="text-[11px] text-muted-foreground">ganho gerado</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
