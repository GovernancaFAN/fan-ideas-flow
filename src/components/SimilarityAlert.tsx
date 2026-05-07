import { Idea } from "@/data/ideas";
import { AlertTriangle } from "lucide-react";

export function SimilarityAlert({ similares }: { similares: Idea[] }) {
  if (!similares.length) return null;
  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3">
      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold mb-1">Encontramos sugestões parecidas para esta empresa</p>
        <p className="text-muted-foreground">
          Já existe uma sugestão semelhante cadastrada para esta empresa. O ponto focal realizará a análise
          detalhada para verificar possível replicação ou complementaridade da melhoria.
        </p>
        <ul className="mt-2 space-y-1">
          {similares.map((s) => (
            <li key={s.id} className="text-xs">
              <span className="font-mono font-bold text-primary-deep">{s.code}</span> — {s.sugestao}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
