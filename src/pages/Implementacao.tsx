import { useIdeas } from "@/store/ideas";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Heart, Wallet } from "lucide-react";

export default function Implementacao() {
  const ideas = useIdeas((s) => s.ideas).filter((i) => i.stage === "Implementação" || i.stage === "Concluído");

  const totalGanho = ideas.reduce((s, i) => s + (i.realizedGain || i.estimatedGain || 0), 0);
  const totalCusto = ideas.reduce((s, i) => s + (i.implementationCost || 0), 0);
  const qualitativas = ideas.filter((i) => i.gainType === "Qualitativo").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Gestão da implementação</h1>
      <p className="text-sm text-muted-foreground mb-6">Acompanhe o progresso das ideias aprovadas até o resultado validado.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary-foreground" /></div>
          <div><p className="text-xs text-muted-foreground">Ganho quantitativo</p><p className="font-display font-bold">R$ {totalGanho.toLocaleString("pt-BR")}</p></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Wallet className="h-5 w-5 text-primary-deep" /></div>
          <div><p className="text-xs text-muted-foreground">Custo de implantação</p><p className="font-display font-bold">R$ {totalCusto.toLocaleString("pt-BR")}</p></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><Heart className="h-5 w-5 text-primary-deep" /></div>
          <div><p className="text-xs text-muted-foreground">Ideias qualitativas</p><p className="font-display font-bold">{qualitativas}</p></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Código</th><th className="p-3">Ideia</th><th className="p-3">Empresa</th>
              <th className="p-3">Tipo</th><th className="p-3">Progresso</th>
              <th className="p-3 text-right">Ganho</th><th className="p-3 text-right">Custo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ideas.map((i) => (
              <tr key={i.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono text-xs font-bold text-primary-deep">{i.code}</td>
                <td className="p-3">
                  <Link to={`/ideia/${i.id}`} className="font-semibold hover:text-primary-deep">{i.sugestao}</Link>
                  {i.replicadaDe && <span className="ml-2 text-[10px] uppercase tracking-wider bg-muted px-2 py-0.5 rounded-full">Replicada {i.replicadaDe}</span>}
                </td>
                <td className="p-3 text-xs">{i.empresa}</td>
                <td className="p-3 text-xs">
                  <Badge variant={i.gainType === "Qualitativo" ? "secondary" : "default"}>{i.gainType || "—"}</Badge>
                </td>
                <td className="p-3 w-56">
                  <div className="flex items-center gap-2">
                    <Progress value={i.progress || 0} className="h-1.5" />
                    <span className="text-xs font-semibold">{i.progress || 0}%</span>
                  </div>
                </td>
                <td className="p-3 text-right font-semibold">
                  {i.gainType === "Qualitativo"
                    ? <span className="text-xs text-muted-foreground italic">{i.qualitativeCategory || "Qualitativo"}</span>
                    : (i.realizedGain || i.estimatedGain ? `R$ ${(i.realizedGain || i.estimatedGain)!.toLocaleString("pt-BR")}` : "—")}
                </td>
                <td className="p-3 text-right text-xs">{i.implementationCost ? `R$ ${i.implementationCost.toLocaleString("pt-BR")}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
