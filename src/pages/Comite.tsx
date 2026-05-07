import { useIdeas } from "@/store/ideas";
import { IdeaCard } from "@/components/IdeaCard";

export default function Comite() {
  const ideas = useIdeas((s) => s.ideas).filter((i) => i.stage === "Comitê" || i.status === "Em comitê" || i.status === "Necessário novo entendimento");
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Comitê de avaliação</h1>
      <p className="text-sm text-muted-foreground mb-6">Sugestões aguardando análise e pontuação dos critérios.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((i) => <IdeaCard key={i.id} idea={i} />)}
        {!ideas.length && <p className="text-muted-foreground">Nenhuma sugestão aguardando.</p>}
      </div>
    </div>
  );
}
