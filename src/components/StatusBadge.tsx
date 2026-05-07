import { IdeaStatus } from "@/data/ideas";
import { cn } from "@/lib/utils";

const map: Record<IdeaStatus, string> = {
  "Pendente": "bg-muted text-muted-foreground border-border",
  "Em análise": "bg-info/10 text-info border-info/30",
  "Aprovado": "bg-success/10 text-success border-success/30",
  "Reprovado": "bg-destructive/10 text-destructive border-destructive/30",
  "Em execução": "bg-primary/10 text-primary-deep border-primary/30",
  "Concluído": "bg-success text-success-foreground border-transparent",
  "Necessário novo entendimento": "bg-warning/15 text-warning-foreground border-warning/40",
  "Em entendimento": "bg-info/10 text-info border-info/30",
  "Em comitê": "bg-warning/15 text-warning-foreground border-warning/40",
  "A iniciar": "bg-primary/15 text-primary-deep border-primary/40",
};

export function StatusBadge({ status, className }: { status: IdeaStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", map[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
