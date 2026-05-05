import { campanhas } from "@/data/ideas";
import { Megaphone, ArrowRight } from "lucide-react";
import { useIdeas } from "@/store/ideas";
import { Link } from "react-router-dom";

export default function Campanhas() {
  const ideas = useIdeas((s) => s.ideas);
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Campanhas ativas</h1>
      <p className="text-sm text-muted-foreground mb-6">Mobilizações temáticas para acelerar a melhoria contínua.</p>

      <div className="grid md:grid-cols-3 gap-4">
        {campanhas.map((c) => {
          const count = ideas.filter((i) => i.campaign === c.nome).length;
          return (
            <div key={c.id} className={`relative rounded-2xl bg-gradient-to-br ${c.cor} p-6 text-white shadow-glow overflow-hidden`}>
              <Megaphone className="h-6 w-6 mb-3" />
              <h3 className="font-display font-bold text-xl">{c.nome}</h3>
              <p className="text-sm opacity-90 mt-1">{c.descricao}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold opacity-80">{count} ideias</span>
                <Link to="/kanban" className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur px-3 py-1.5 rounded-full hover:bg-white/30">
                  Participar <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
