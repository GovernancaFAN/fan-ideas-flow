import { useMemo, useState } from "react";
import { useIdeas } from "@/store/ideas";
import {
  ArrowUpRight, Lightbulb, CheckCircle2, XCircle, HelpCircle, Clock, TrendingUp,
  Users, Trophy, Zap, AlertTriangle, Filter, Building2, Target, Rocket, Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { empresas, setores, IdeaStatus } from "@/data/ideas";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_OPTIONS: ("Todos" | IdeaStatus)[] = [
  "Todos", "Pendente", "Em análise", "Aprovado", "Reprovado", "Em execução", "Concluído", "Necessário novo entendimento",
];

const PERIODOS = ["Mês", "Trimestre", "Ano"] as const;

function KpiCard({
  icon: Icon, label, value, sub, subTone = "muted", accent,
}: {
  icon: any; label: string; value: string | number; sub?: string;
  subTone?: "muted" | "success" | "danger" | "warning"; accent: string;
}) {
  const toneClass = {
    muted: "text-muted-foreground",
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
  }[subTone];
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-card overflow-hidden">
      <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <div className="mt-2 font-display text-3xl font-bold leading-none">{value}</div>
        {sub && <div className={`text-[11px] font-semibold mt-2 ${toneClass}`}>{sub}</div>}
      </div>
    </div>
  );
}

function PipelineStep({
  label, count, conv, tempo, isLast, color,
}: { label: string; count: number; conv?: number; tempo: string; isLast?: boolean; color: string }) {
  return (
    <div className="flex items-stretch flex-1 min-w-[150px]">
      <div className="flex-1 rounded-xl border border-border bg-card p-4 shadow-card relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-bold mt-1">{count}</p>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" />{tempo}</span>
          {conv !== undefined && (
            <span className="font-bold text-primary-deep">{conv}%</span>
          )}
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center px-1 text-muted-foreground">
          <ArrowUpRight className="h-4 w-4 rotate-45" />
        </div>
      )}
    </div>
  );
}

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--success))"];

export default function Dashboard() {
  const ideas = useIdeas((s) => s.ideas);

  const [empresaF, setEmpresaF] = useState<string>("Todas");
  const [periodoF, setPeriodoF] = useState<(typeof PERIODOS)[number]>("Mês");
  const [statusF, setStatusF] = useState<string>("Todos");
  const [setorF, setSetorF] = useState<string>("Todos");

  const filtered = useMemo(() => {
    return ideas.filter((i) => {
      if (empresaF !== "Todas" && i.empresa !== empresaF) return false;
      if (statusF !== "Todos" && i.status !== statusF) return false;
      if (setorF !== "Todos" && i.setorAplicacao !== setorF) return false;
      return true;
    });
  }, [ideas, empresaF, statusF, setorF]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const aprovadas = filtered.filter((i) => ["Aprovado", "Em execução", "Concluído"].includes(i.status)).length;
    const reprovadas = filtered.filter((i) => i.status === "Reprovado").length;
    const reentender = filtered.filter((i) => i.status === "Necessário novo entendimento").length;
    const concluidas = filtered.filter((i) => i.status === "Concluído").length;
    const ganho = filtered.reduce((acc, i) => acc + (i.realizedGain || 0), 0);
    const taxaAprov = total ? Math.round((aprovadas / total) * 100) : 0;
    const taxaReprov = total ? Math.round((reprovadas / total) * 100) : 0;
    const implPct = aprovadas ? Math.round((concluidas / aprovadas) * 100) : 0;
    return { total, aprovadas, reprovadas, reentender, concluidas, ganho, taxaAprov, taxaReprov, implPct };
  }, [filtered]);

  const pipeline = useMemo(() => {
    const subm = filtered.length;
    const analise = filtered.filter((i) => i.stage !== "Recebimento" || i.status === "Em análise").length;
    const comite = filtered.filter((i) => i.stage === "Comitê" || i.stage === "Implementação" || i.stage === "Concluído").length;
    const aprov = filtered.filter((i) => ["Aprovado", "Em execução", "Concluído"].includes(i.status)).length;
    const impl = filtered.filter((i) => i.stage === "Implementação" || i.stage === "Concluído").length;
    const concl = filtered.filter((i) => i.stage === "Concluído").length;
    const conv = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
    return [
      { label: "Submetidas", count: subm, conv: conv(analise, subm), tempo: "0,5 d", color: "bg-info" },
      { label: "Em análise", count: analise, conv: conv(comite, analise), tempo: "1,2 d", color: "bg-info" },
      { label: "Em comitê", count: comite, conv: conv(aprov, comite), tempo: "3,4 d", color: "bg-warning" },
      { label: "Aprovadas", count: aprov, conv: conv(impl, aprov), tempo: "1,0 d", color: "bg-primary" },
      { label: "Em implementação", count: impl, conv: conv(concl, impl), tempo: "12,8 d", color: "bg-primary" },
      { label: "Concluídas", count: concl, tempo: "—", color: "bg-success", isLast: true },
    ];
  }, [filtered]);

  const ideasPorMes = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((i) => {
      const m = new Date(i.createdAt).getMonth();
      const key = MONTHS_PT[m];
      map[key] = (map[key] || 0) + 1;
    });
    return MONTHS_PT.slice(0, 6).map((m) => ({ mes: m, ideias: map[m] || 0 }));
  }, [filtered]);

  const tipoData = useMemo(() => {
    const camp = filtered.filter((i) => i.campaign).length;
    const fluxo = filtered.length - camp;
    return [
      { name: "Campanha", value: camp },
      { name: "Fluxo normal", value: fluxo },
    ];
  }, [filtered]);

  const engajEmpresa = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((i) => { map[i.empresa] = (map[i.empresa] || 0) + 1; });
    return Object.entries(map).map(([empresa, n]) => ({ empresa: empresa.replace("FAN ", ""), ideias: n }));
  }, [filtered]);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((i) => { map[i.setorAplicacao] = (map[i.setorAplicacao] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filtered]);

  const topColabs = useMemo(() => {
    const map: Record<string, { n: number; empresa: string }> = {};
    filtered.forEach((i) => {
      if (!map[i.colaborador]) map[i.colaborador] = { n: 0, empresa: i.empresa };
      map[i.colaborador].n += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  }, [filtered]);

  const gargalos = useMemo(() => {
    const stages: Record<string, number> = { Recebimento: 0, Comitê: 0, Implementação: 0 };
    filtered.forEach((i) => {
      if (i.status === "Concluído" || i.status === "Reprovado") return;
      if (i.stage in stages) stages[i.stage]++;
    });
    const slaEstourado = filtered.filter((i) => i.sla > 0 && i.sla <= 24 && !["Concluído", "Reprovado"].includes(i.status)).length;
    const totalAtivas = Object.values(stages).reduce((a, b) => a + b, 0);
    return { stages, slaEstourado, totalAtivas };
  }, [filtered]);

  const featured = filtered.find((i) => i.featured) || ideas.find((i) => i.featured);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="relative p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full">
              <Zap className="h-3 w-3" /> Dashboard Gerencial
            </span>
            <h1 className="mt-3 font-display text-3xl lg:text-4xl font-bold leading-tight">
              Gestão das Sugestões de Melhorias
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acompanhe o ciclo de vida das sugestões de melhorias.
            </p>
          </div>
          <Link to="/nova" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:scale-[1.02] transition self-start lg:self-end">
            <Lightbulb className="h-4 w-4" /> Submeter ideia
          </Link>
        </div>

        {/* Filtros globais */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <Select value={empresaF} onValueChange={setEmpresaF}>
              <SelectTrigger className="w-[180px] h-9"><Building2 className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Empresa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas as empresas</SelectItem>
                {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={periodoF} onValueChange={(v: any) => setPeriodoF(v)}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={setorF} onValueChange={setSetorF}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Setor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os setores</SelectItem>
                {setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={Lightbulb} label="Submetidas" value={kpis.total} sub="total no período" accent="bg-primary" />
          <KpiCard icon={CheckCircle2} label="Aprovadas" value={kpis.aprovadas} sub={`Taxa: ${kpis.taxaAprov}%`} subTone="success" accent="bg-success" />
          <KpiCard icon={XCircle} label="Reprovadas" value={kpis.reprovadas} sub={`Taxa: ${kpis.taxaReprov}%`} subTone="danger" accent="bg-destructive" />
          <KpiCard icon={HelpCircle} label="Novo entendimento" value={kpis.reentender} sub="aguardando autor" subTone="warning" accent="bg-warning" />
          <KpiCard icon={Rocket} label="Implementadas" value={`${kpis.implPct}%`} sub={`${kpis.concluidas} de ${kpis.aprovadas} aprovadas`} accent="bg-info" />
          <KpiCard icon={TrendingUp} label="Ganho financeiro" value={`R$ ${(kpis.ganho / 1000).toFixed(0)}k`} sub="realizado" subTone="success" accent="bg-warning" />
        </div>

        {/* Pipeline */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold">Pipeline — Ciclo de vida das ideias</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">% = conversão para próxima etapa</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {pipeline.map((p, idx) => (
              <PipelineStep key={p.label} {...p} isLast={idx === pipeline.length - 1} />
            ))}
          </div>
        </div>

        {/* Análises de desempenho */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold mb-4">Ideias por mês</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ideasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="ideias" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold mb-4">Campanha vs fluxo normal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tipoData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {tipoData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold mb-4">Engajamento por empresa</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engajEmpresa} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="empresa" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="ideias" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold">Top áreas</h3>
            </div>
            <ul className="space-y-3">
              {ranking.map(([area, n], idx) => (
                <li key={area} className="flex items-center gap-3">
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{area}</p>
                    <Progress value={(n / (ranking[0]?.[1] || 1)) * 100} className="h-1 mt-1" />
                  </div>
                  <span className="text-xs font-bold text-primary-deep">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gargalos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h3 className="font-display font-bold">Gargalos do processo</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(gargalos.stages).map(([stage, n]) => {
                const pct = gargalos.totalAtivas ? (n / gargalos.totalAtivas) * 100 : 0;
                const isHot = pct >= 40;
                return (
                  <div key={stage} className={`rounded-xl p-4 border ${isHot ? "border-warning/40 bg-warning/5" : "border-border bg-muted/30"}`}>
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{stage}</p>
                    <p className="font-display text-2xl font-bold mt-1">{n}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{pct.toFixed(0)}% das ativas</p>
                    <Progress value={pct} className="h-1 mt-2" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl bg-destructive/5 border border-destructive/30 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">SLA crítico</p>
                <p className="text-xs text-muted-foreground">{gargalos.slaEstourado} ideia(s) com SLA prestes a estourar (≤ 24h).</p>
              </div>
              <Link to="/kanban" className="text-xs font-semibold text-destructive hover:underline">Tratar →</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold">Top colaboradores</h3>
            </div>
            <ul className="space-y-3">
              {topColabs.map(([nome, info], idx) => (
                <li key={nome} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{nome}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{info.empresa}</p>
                  </div>
                  <span className="text-xs font-bold text-primary-deep">{info.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Destaque */}
        {featured && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
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
                    {featured.colaborador.split(" ").map(n => n[0]).slice(0, 2).join("")}
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
      </div>
    </div>
  );
}
