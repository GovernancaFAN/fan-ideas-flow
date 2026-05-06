import { useState } from "react";
import { useIdeas, useAdmin } from "@/store/ideas";
import { perfis, Perfil } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, Shield, Database, Building2, Users, Clock, Copy, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const ideas = useIdeas((s) => s.ideas);
  const replicar = useIdeas((s) => s.replicar);
  const { empresas, usuarios, slas, addEmpresa, toggleEmpresa, addUsuario, removeUsuario, updateSla } = useAdmin();

  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", empresa: empresas[0]?.nome || "", perfil: "Ponto Focal" as Perfil });
  const [replicaEmpresa, setReplicaEmpresa] = useState<Record<string, string>>({});

  const replicaveis = ideas.filter((i) => i.replicavel && i.status !== "Reprovado");
  const replicadas = ideas.filter((i) => i.replicadaDe);

  const exportCSV = () => {
    const headers = ["Código", "Empresa", "Colaborador", "Setor", "Status", "Tipo ganho", "Nota", "Ganho est.", "Ganho real.", "Custo"];
    const rows = ideas.map((i) => [i.code, i.empresa, i.colaborador, i.setorAplicacao, i.status, i.gainType || "", i.score?.toFixed(2) || "", i.estimatedGain || "", i.realizedGain || "", i.implementationCost || ""]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ideias-mc.csv"; a.click();
    toast.success("Relatório exportado.");
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Settings className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Administração</h1>
          <p className="text-sm text-muted-foreground">Governança do processo, empresas, perfis e replicação.</p>
        </div>
      </div>

      <Tabs defaultValue="empresas">
        <TabsList>
          <TabsTrigger value="empresas"><Building2 className="h-3.5 w-3.5 mr-1" />Empresas</TabsTrigger>
          <TabsTrigger value="perfis"><Users className="h-3.5 w-3.5 mr-1" />Perfis</TabsTrigger>
          <TabsTrigger value="governanca"><Shield className="h-3.5 w-3.5 mr-1" />Governança</TabsTrigger>
          <TabsTrigger value="replicacao"><Copy className="h-3.5 w-3.5 mr-1" />Replicação</TabsTrigger>
          <TabsTrigger value="relatorios"><Download className="h-3.5 w-3.5 mr-1" />Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="empresas" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-3">Cadastro de empresas</h3>
            <div className="flex gap-2 mb-4">
              <Input value={novaEmpresa} onChange={(e) => setNovaEmpresa(e.target.value)} placeholder="Nome da nova empresa" />
              <Button onClick={() => { if (!novaEmpresa) return; addEmpresa(novaEmpresa); setNovaEmpresa(""); toast.success("Empresa cadastrada."); }}>
                <Plus className="h-4 w-4 mr-1" />Adicionar
              </Button>
            </div>
            <div className="divide-y divide-border">
              {empresas.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{e.nome}</p>
                    <p className="text-xs text-muted-foreground">{usuarios.filter((u) => u.empresa === e.nome).length} usuários · {ideas.filter((i) => i.empresa === e.nome).length} ideias</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={e.ativa ? "default" : "secondary"}>{e.ativa ? "Ativa" : "Inativa"}</Badge>
                    <Switch checked={e.ativa} onCheckedChange={() => toggleEmpresa(e.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="perfis" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-3">Novo usuário</h3>
            <div className="grid sm:grid-cols-5 gap-2">
              <Input placeholder="Nome" value={novoUsuario.nome} onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} />
              <Input placeholder="E-mail" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} />
              <Select value={novoUsuario.empresa} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, empresa: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.nome}>{e.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={novoUsuario.perfil} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, perfil: v as Perfil })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{perfis.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={() => {
                if (!novoUsuario.nome || !novoUsuario.email) { toast.error("Preencha nome e e-mail."); return; }
                addUsuario(novoUsuario);
                setNovoUsuario({ ...novoUsuario, nome: "", email: "" });
                toast.success("Usuário adicionado.");
              }}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Empresa</th><th className="p-3">Perfil</th><th className="p-3"></th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-semibold">{u.nome}</td>
                    <td className="p-3 text-xs text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-xs">{u.empresa}</td>
                    <td className="p-3"><Badge variant="outline">{u.perfil}</Badge></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeUsuario(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="governanca" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1 flex items-center gap-2"><Clock className="h-4 w-4 text-primary-deep" />SLA por etapa</h3>
            <p className="text-xs text-muted-foreground mb-4">Defina prazo (em horas) e responsável de cada etapa do fluxo.</p>
            <div className="space-y-3">
              {slas.map((s) => (
                <div key={s.etapa} className="grid sm:grid-cols-3 gap-3 items-end p-3 rounded-xl border border-border">
                  <div>
                    <Label className="text-xs">Etapa</Label>
                    <p className="font-semibold">{s.etapa}</p>
                  </div>
                  <div>
                    <Label className="text-xs">SLA (horas)</Label>
                    <Input type="number" value={s.horas} onChange={(e) => updateSla(s.etapa, { horas: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Responsável</Label>
                    <Select value={s.responsavel} onValueChange={(v) => updateSla(s.etapa, { responsavel: v as Perfil })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{perfis.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-2">Regras de aprovação</h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Toda ideia exige feedback registrado para avançar.</li>
              <li>• Ideias com nota ≥ 1.5 são aprovadas automaticamente para implementação.</li>
              <li>• Comitê pode solicitar “novo entendimento” quando faltar informação.</li>
              <li>• Ganho realizado deve ser validado pelo Líder de Melhoria Contínua.</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="replicacao" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1">Ideias replicáveis</h3>
            <p className="text-xs text-muted-foreground mb-4">Selecione a empresa de destino para replicar a ideia aprovada.</p>
            <div className="divide-y divide-border">
              {replicaveis.map((i) => (
                <div key={i.id} className="py-3 grid sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6">
                    <p className="font-mono text-xs font-bold text-primary-deep">{i.code}</p>
                    <p className="font-semibold text-sm">{i.sugestao}</p>
                    <p className="text-xs text-muted-foreground">Origem: {i.empresa}</p>
                  </div>
                  <div className="sm:col-span-4">
                    <Select value={replicaEmpresa[i.id] || ""} onValueChange={(v) => setReplicaEmpresa({ ...replicaEmpresa, [i.id]: v })}>
                      <SelectTrigger><SelectValue placeholder="Empresa de destino..." /></SelectTrigger>
                      <SelectContent>
                        {empresas.filter((e) => e.ativa && e.nome !== i.empresa).map((e) => <SelectItem key={e.id} value={e.nome}>{e.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Button className="w-full" onClick={() => {
                      const dest = replicaEmpresa[i.id];
                      if (!dest) { toast.error("Selecione a empresa."); return; }
                      const nova = replicar(i.id, dest, "Admin");
                      if (nova) { toast.success(`Ideia replicada como ${nova.code}.`); }
                    }}><Copy className="h-4 w-4 mr-1" />Replicar</Button>
                  </div>
                </div>
              ))}
              {replicaveis.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma ideia marcada como replicável ainda.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-3">Histórico de replicações</h3>
            {replicadas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma replicação ainda.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {replicadas.map((r) => (
                  <li key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">{r.code} — {r.sugestao}</p>
                      <p className="text-xs text-muted-foreground">Origem: {r.replicadaDe} → {r.empresa}</p>
                    </div>
                    <Badge variant="secondary">{r.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold flex items-center gap-2"><Database className="h-4 w-4 text-primary-deep" />Exportar relatório</h3>
              <p className="text-xs text-muted-foreground">CSV completo com todas as ideias, ganhos e custos.</p>
            </div>
            <Button onClick={exportCSV} className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Download className="h-4 w-4 mr-1" />Exportar CSV
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
