import { useVisibleIdeas } from "@/store/ideas";
import { Trophy, Medal, Building2, User, Layers, Globe } from "lucide-react";
import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Row = { key: string; count: number; gain: number; concluded: number };

function rank(map: Record<string, Row>) {
  return Object.values(map).sort((a, b) => b.gain - a.gain || b.count - a.count);
}

function List({ data, unit }: { data: Row[]; unit: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
      {data.length === 0 && <div className="p-6 text-sm text-center text-muted-foreground">Sem dados.</div>}
      {data.map((d, idx) => (
        <div key={d.key} className={`flex items-center gap-4 p-4 ${idx < data.length - 1 ? "border-b border-border" : ""}`}>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-display font-bold ${
            idx === 0 ? "bg-gradient-primary text-primary-foreground shadow-glow" :
            idx === 1 ? "bg-amber-200 text-amber-900" :
            idx === 2 ? "bg-orange-200 text-orange-900" : "bg-muted text-muted-foreground"
          }`}>
            {idx < 3 ? <Medal className="h-5 w-5" /> : idx + 1}
          </div>
          <div className="flex-1">
            <p className="font-display font-bold">{d.key}</p>
            <p className="text-xs text-muted-foreground">{d.count} {unit} · {d.concluded} concluídas</p>
          </div>
          <div className="text-right">
            <p className="font-display font-bold text-primary-deep">R$ {d.gain.toLocaleString("pt-BR")}</p>
            <p className="text-[11px] text-muted-foreground">ganho gerado</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Ranking() {
  const ideas = useVisibleIdeas();

  const groups = useMemo(() => {
    const make = (keyFn: (i: any) => string) => {
      const m: Record<string, Row> = {};
      ideas.forEach((i) => {
        const k = keyFn(i);
        if (!k) return;
        if (!m[k]) m[k] = { key: k, count: 0, gain: 0, concluded: 0 };
        m[k].count++;
        m[k].gain += i.realizedGain || 0;
        if (i.status === "Concluído") m[k].concluded++;
      });
      return rank(m);
    };
    return {
      colaborador: make((i) => i.colaborador),
      empresa: make((i) => i.empresa),
      area: make((i) => i.setorAplicacao),
      geral: [{
        key: "Grupo FAN",
        count: ideas.length,
        gain: ideas.reduce((s, i) => s + (i.realizedGain || 0), 0),
        concluded: ideas.filter((i) => i.status === "Concluído").length,
      }],
    };
  }, [ideas]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Trophy className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Ranking de melhoria contínua</h1>
          <p className="text-sm text-muted-foreground">Visão corporativa e segmentada por empresa, área e colaborador.</p>
        </div>
      </div>

      <Tabs defaultValue="colaborador">
        <TabsList>
          <TabsTrigger value="geral"><Globe className="h-3.5 w-3.5 mr-1" />Geral</TabsTrigger>
          <TabsTrigger value="empresa"><Building2 className="h-3.5 w-3.5 mr-1" />Empresa</TabsTrigger>
          <TabsTrigger value="colaborador"><User className="h-3.5 w-3.5 mr-1" />Colaborador</TabsTrigger>
          <TabsTrigger value="area"><Layers className="h-3.5 w-3.5 mr-1" />Área</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="mt-4"><List data={groups.geral} unit="sugestões totais" /></TabsContent>
        <TabsContent value="empresa" className="mt-4"><List data={groups.empresa} unit="sugestões" /></TabsContent>
        <TabsContent value="colaborador" className="mt-4"><List data={groups.colaborador} unit="sugestões" /></TabsContent>
        <TabsContent value="area" className="mt-4"><List data={groups.area} unit="sugestões" /></TabsContent>
      </Tabs>
    </div>
  );
}
