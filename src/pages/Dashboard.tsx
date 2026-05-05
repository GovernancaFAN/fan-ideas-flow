import { useMemo } from "react";
import { useIdeas } from "@/store/ideas";
import { ArrowUpRight, Lightbulb, CheckCircle2, Clock, TrendingUp, Users, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";

function Stat({ icon: Icon, label, value, hint, accent }: any) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-card overflow-hidden">
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div className="mt-3 font-display text-3xl font-bold">{value}</div>
        {hint && <div className="text-xs text-success font-semibold mt-1 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />{hint}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const ideas = useIdeas((s) => s.ideas);

  const stats = useMemo(() => {
    const total = ideas.length;
    const aprovadas = ideas.filter((i) => ["Aprovado", "Em execução", "Concluído"].includes(i.status)).length;
    const concluidas = ideas.filter((i) => i.status === "Concluído").length;
    const ganho = ideas.reduce((acc, i) => acc + (i.realizedGain || 0), 0);
    const taxa = total ? Math.round((aprovadas / total) * 100) : 0;
    return { total, aprovadas, concluidas, ganho, taxa };
  }, [ideas]);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};
    ideas.forEach((i) => { map[i.empresa] = (map[i.empresa] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [ideas]);

  const featured = ideas.find((i) => i.featured);
  const recents = ideas.slice(0, 5);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="relative p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Hero */}
        <div className="rounded-3xl bg-gradient-hero p-8 lg:p-10 text-primary-foreground shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white, transparent 40%)" }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest bg-white/15 backdrop-blur px-3 py-1 rounded-full">
              <Zap className="h-3 w-3" /> Portal de Melhoria Contínua
            </span>
            <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold leading-tight">
              Cada ideia vira <span className="italic">resultado</span>.
            </h1>
            <p className="mt-3 text-primary-foreground/90 text-base max-w-xl">
              Submeta, avalie, aprove e acompanhe melhorias em todas as empresas do Grupo FAN — com governança e transparência ponta a ponta.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/nova" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-deep font-semibold text-sm shadow hover:scale-[1.02] transition">
                <Lightbulb className="h-4 w-4" /> Submeter ideia
              </Link>
              <Link to="/kanban" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/30 text-primary-foreground font-semibold text-sm hover:bg-white/20 transition">
                Ver Kanban <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Lightbulb} label="Ideias submetidas" value={stats.total} hint="+12% vs mês anterior" accent="bg-primary" />
          <Stat icon={CheckCircle2} label="Taxa de aprovação" value={`${stats.taxa}%`} hint="meta: 60%" accent="bg-success" />
          <Stat icon={Clock} label="Tempo médio etapa" value="3,2 d" hint="-0,8 d vs mês anterior" accent="bg-info" />
          <Stat icon={TrendingUp} label="Ganho realizado" value={`R$ ${(stats.ganho / 1000).toFixed(0)}k`} hint={`${stats.concluidas} concluídas`} accent="bg-warning" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured */}
          {featured && (
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-card">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-bold">Ideia destaque do mês</h3>
                </div>
                <StatusBadge status={featured.status} />
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary-deep">{featured.code}</span>
                  <h4 className="font-display font-bold text-xl mt-1 mb-3">{featured.sugestao}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{featured.problema}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {featured.colaborador.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                    <div>
                      <p className="font-semibold">{featured.colaborador}</p>
                      <p className="text-muted-foreground">{featured.empresa} · {featured.setorColaborador}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-soft p-5">
                  <p className="text-xs uppercase tracking-wider font-semibold text-primary-deep mb-3">Resultado validado</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Estimado</p>
                      <p className="font-display font-bold text-lg">R$ {featured.estimatedGain?.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Realizado</p>
                      <p className="font-display font-bold text-lg text-success">R$ {featured.realizedGain?.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-muted-foreground mb-1">Nota final</p>
                      <div className="flex items-end gap-2">
                        <span className="font-display font-bold text-3xl text-primary-deep">{featured.score?.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground mb-1">/ 2.65</span>
                      </div>
                      <Progress value={(featured.score || 0) / 2.65 * 100} className="mt-2 h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold">Ranking por unidade</h3>
            </div>
            <ul className="space-y-3">
              {ranking.map(([emp, n], idx) => (
                <li key={emp} className="flex items-center gap-3">
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{emp}</p>
                    <Progress value={(n / stats.total) * 100} className="h-1 mt-1" />
                  </div>
                  <span className="text-xs font-bold text-primary-deep">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-border">
            <h3 className="font-display font-bold">Ideias recentes</h3>
            <Link to="/kanban" className="text-xs font-semibold text-primary-deep hover:underline inline-flex items-center gap-1">
              Ver todas <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recents.map((i) => (
              <Link key={i.id} to={`/ideia/${i.id}`} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-muted/50 transition">
                <span className="col-span-2 md:col-span-1 text-[11px] font-mono font-bold text-primary-deep">{i.code}</span>
                <div className="col-span-10 md:col-span-6">
                  <p className="text-sm font-semibold truncate">{i.sugestao}</p>
                  <p className="text-xs text-muted-foreground truncate">{i.empresa} · {i.setorAplicacao}</p>
                </div>
                <span className="hidden md:block col-span-2 text-xs text-muted-foreground">{i.colaborador}</span>
                <div className="col-span-12 md:col-span-3 flex md:justify-end"><StatusBadge status={i.status} /></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
