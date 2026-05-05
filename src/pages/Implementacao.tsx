import { useIdeas } from "@/store/ideas";
import { IdeaCard } from "@/components/IdeaCard";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export default function Implementacao() {
  const ideas = useIdeas((s) => s.ideas).filter((i) => i.stage === "Implementação" || i.stage === "Concluído");
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Gestão da implementação</h1>
      <p className="text-sm text-muted-foreground mb-6">Acompanhe o progresso das ideias aprovadas até o resultado validado.</p>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Código</th><th className="p-3">Ideia</th><th className="p-3">Empresa</th>
              <th className="p-3">Progresso</th><th className="p-3 text-right">Ganho est.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ideas.map((i) => (
              <tr key={i.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs font-bold text-primary-deep">{i.code}</td>
                <td className="p-3"><Link to={`/ideia/${i.id}`} className="font-semibold hover:text-primary-deep">{i.sugestao}</Link></td>
                <td className="p-3 text-xs">{i.empresa}</td>
                <td className="p-3 w-64">
                  <div className="flex items-center gap-2">
                    <Progress value={i.progress || 0} className="h-1.5" />
                    <span className="text-xs font-semibold">{i.progress || 0}%</span>
                  </div>
                </td>
                <td className="p-3 text-right font-semibold">{i.estimatedGain ? `R$ ${i.estimatedGain.toLocaleString("pt-BR")}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
