import { useState, useMemo } from "react";
import { useAdmin, useVisibleIdeas, useEmpresasAtivasNomes } from "@/store/ideas";
import { CampaignType } from "@/data/ideas";
import { Megaphone, Plus, Calendar, Target, Building2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const tipos: CampaignType[] = ["Redução de custo", "5S", "Inovação", "Segurança", "Qualidade", "Sustentabilidade"];
const cores = [
  "from-orange-500 to-amber-500",
  "from-rose-500 to-orange-500",
  "from-amber-500 to-yellow-500",
  "from-emerald-500 to-teal-500",
  "from-sky-500 to-indigo-500",
  "from-fuchsia-500 to-pink-500",
];

export default function Campanhas() {
  const { campanhas, addCampanha, toggleCampanha } = useAdmin();
  const ideas = useVisibleIdeas();
  const empresas = useEmpresasAtivasNomes();
  const [open, setOpen] = useState(false);
  const [filtroEmpresa, setFiltroEmpresa] = useState("Todas");

  const [form, setForm] = useState({
    nome: "", empresa: "Todas", inicio: "", fim: "", objetivo: "", tipo: "Redução de custo" as CampaignType, descricao: "",
  });

  const ativas = useMemo(
    () => campanhas.filter((c) => c.ativa && (filtroEmpresa === "Todas" || c.empresa === filtroEmpresa || c.empresa === "Todas")),
    [campanhas, filtroEmpresa]
  );
  const encerradas = useMemo(() => campanhas.filter((c) => !c.ativa), [campanhas]);

  const submit = () => {
    if (!form.nome || !form.inicio || !form.fim || !form.objetivo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    addCampanha({
      ...form,
      cor: cores[Math.floor(Math.random() * cores.length)],
      ativa: true,
    });
    toast.success("Campanha criada!");
    setOpen(false);
    setForm({ nome: "", empresa: "Todas", inicio: "", fim: "", objetivo: "", tipo: "Redução de custo", descricao: "" });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Campanhas</h1>
          <p className="text-sm text-muted-foreground">Mobilizações temáticas para acelerar a melhoria contínua.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas as empresas</SelectItem>
              {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4 mr-1" />Nova campanha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome *</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Empresa *</Label>
                    <Select value={form.empresa} onValueChange={(v) => setForm({ ...form, empresa: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as CampaignType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Início *</Label><Input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></div>
                  <div><Label>Fim *</Label><Input type="date" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} /></div>
                </div>
                <div><Label>Objetivo *</Label><Input value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })} placeholder="Meta mensurável" /></div>
                <div><Label>Descrição</Label><Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
                <Button onClick={submit} className="w-full bg-gradient-primary text-primary-foreground">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="ativas">
        <TabsList>
          <TabsTrigger value="ativas">Ativas ({ativas.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({encerradas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ativas.map((c) => {
              const count = ideas.filter((i) => i.campaign === c.nome).length;
              return (
                <div key={c.id} className={`relative rounded-2xl bg-gradient-to-br ${c.cor} p-6 text-white shadow-glow overflow-hidden`}>
                  <div className="flex items-start justify-between">
                    <Megaphone className="h-6 w-6 mb-3" />
                    <button onClick={() => toggleCampanha(c.id)} title="Encerrar" className="text-white/70 hover:text-white">
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="font-display font-bold text-xl">{c.nome}</h3>
                  <p className="text-sm opacity-90 mt-1">{c.descricao}</p>
                  <div className="mt-3 space-y-1 text-xs opacity-90">
                    <p className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.empresa}</p>
                    <p className="flex items-center gap-1"><Target className="h-3 w-3" />{c.objetivo}</p>
                    <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.inicio} → {c.fim}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold opacity-90">{count} sugestões</span>
                    <span className="text-[10px] uppercase tracking-wider bg-white/20 rounded-full px-2 py-0.5">{c.tipo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3 text-left">Campanha</th><th className="p-3 text-left">Empresa</th><th className="p-3 text-left">Período</th><th className="p-3 text-left">Tipo</th><th className="p-3 text-right">Sugestões</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {encerradas.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-semibold">{c.nome}</td>
                    <td className="p-3 text-xs">{c.empresa}</td>
                    <td className="p-3 text-xs">{c.inicio} → {c.fim}</td>
                    <td className="p-3 text-xs">{c.tipo}</td>
                    <td className="p-3 text-right">{ideas.filter((i) => i.campaign === c.nome).length}</td>
                  </tr>
                ))}
                {!encerradas.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">Nenhuma campanha encerrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
