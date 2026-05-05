import { useIdeas } from "@/store/ideas";
import { Button } from "@/components/ui/button";
import { Download, Settings, Shield, Database } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const ideas = useIdeas((s) => s.ideas);

  const exportCSV = () => {
    const headers = ["Código", "Empresa", "Colaborador", "Setor", "Status", "Nota", "Ganho estimado", "Ganho realizado"];
    const rows = ideas.map((i) => [i.code, i.empresa, i.colaborador, i.setorAplicacao, i.status, i.score?.toFixed(2) || "", i.estimatedGain || "", i.realizedGain || ""]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ideias-mc.csv"; a.click();
    toast.success("Relatório exportado.");
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Settings className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Administração</h1>
          <p className="text-sm text-muted-foreground">Governança do processo, perfis e indicadores.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Perfis", desc: "Colaborador, Ponto Focal, Comitê e Administrador." },
          { icon: Settings, title: "Regras de SLA", desc: "Recebimento 48h · Comitê 5 dias · Implementação 30 dias." },
          { icon: Database, title: "Replicação", desc: "Ideias aprovadas podem ser replicadas em outras unidades." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
            <c.icon className="h-5 w-5 text-primary-deep mb-2" />
            <h3 className="font-display font-bold">{c.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold">Exportar relatório</h3>
          <p className="text-xs text-muted-foreground">CSV completo com todas as ideias e indicadores.</p>
        </div>
        <Button onClick={exportCSV} className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Download className="h-4 w-4 mr-1" />Exportar CSV
        </Button>
      </div>
    </div>
  );
}
