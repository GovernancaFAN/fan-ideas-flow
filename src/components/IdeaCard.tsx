import { Link } from "react-router-dom";
import { Idea } from "@/data/ideas";
import { StatusBadge } from "./StatusBadge";
import { Building2, User, Clock } from "lucide-react";

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      to={`/ideia/${idea.id}`}
      className="block group rounded-xl bg-card border border-border p-4 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold text-primary-deep tracking-wider">{idea.code}</span>
        <StatusBadge status={idea.status} />
      </div>
      <h4 className="font-display font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-deep transition">
        {idea.sugestao}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{idea.problema}</p>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{idea.colaborador.split(" ")[0]}</span>
        <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{idea.empresa.replace("FAN ", "")}</span>
        {idea.sla > 0 && (
          <span className="inline-flex items-center gap-1 ml-auto"><Clock className="h-3 w-3" />{idea.sla}h</span>
        )}
        {idea.score !== undefined && (
          <span className="ml-auto font-bold text-primary-deep">{idea.score.toFixed(2)}</span>
        )}
      </div>
    </Link>
  );
}
