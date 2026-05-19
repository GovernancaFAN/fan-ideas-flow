import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useIdeas, useAdmin } from "@/store/ideas";
import { useAuth } from "@/store/auth";
import { perfis as perfisListaBase, MODULOS, ModuloKey, Perfil } from "@/data/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Download, Settings, Shield, Database, Building2, Users, Clock, Copy, Plus, Upload, Power, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabaseShadow, matriculaToEmail } from "@/lib/supabaseShadow";

const FIELDS = [
  { key: "sugestao", label: "Título / sugestão" },
  { key: "colaborador", label: "Colaborador" },
  { key: "empresa", label: "Empresa" },
  { key: "setorAplicacao", label: "Setor" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Data" },
  { key: "estimatedGain", label: "Ganho" },
  { key: "observacoesImport", label: "Observações" },
  { key: "problema", label: "Histórico" },
];

export default function Admin() {
  const ideas = useIdeas((s) => s.ideas);
  const replicarMultiplas = useIdeas((s) => s.replicarMultiplas);
  const importar = useIdeas((s) => s.importar);
  const { empresas, usuarios, etapas, perfis, addEmpresa, toggleEmpresa, addUsuario, toggleUsuario, addEtapa, updateEtapa, removeEtapa, addPerfil, updatePerfil, togglePerfil } = useAdmin();
  const auth = useAuth();

  const [novaEmpresa, setNovaEmpresa] = useState("");
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", matricula: "", empresa: empresas[0]?.nome || "", perfil: "Ponto Focal" as string, ativo: true, senha: "" });
  const [replicaSel, setReplicaSel] = useState<Record<string, string[]>>({});
  const [novaEtapa, setNovaEtapa] = useState({ nome: "", dias: 3, exigeAprovacao: false, responsavelPerfil: "Ponto Focal" as string });
  const [novoPerfil, setNovoPerfil] = useState({ nome: "", permissoes: [] as ModuloKey[] });

  // Importação
  const fileRef = useRef<HTMLInputElement>(null);
  const [imp, setImp] = useState<{ rows: any[]; cols: string[]; empresa: string; map: Record<string, string> } | null>(null);

  const replicaveis = ideas.filter((i) => i.replicavel && !i.replicadaDe);
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

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const cols = Object.keys(rows[0] || {});
      const map: Record<string, string> = {};
      FIELDS.forEach((fld) => {
        const found = cols.find((c) => c.toLowerCase().includes(fld.key.toLowerCase()) || c.toLowerCase().includes(fld.label.toLowerCase().split(" ")[0]));
        if (found) map[fld.key] = found;
      });
      setImp({ rows, cols, empresa: empresas[0]?.nome || "", map });
    };
    reader.readAsArrayBuffer(f);
  };

  const confirmarImport = () => {
    if (!imp) return;
    const linhas = imp.rows.map((r) => {
      const out: any = { empresa: r[imp.map.empresa] || imp.empresa };
      FIELDS.forEach((f) => { if (imp.map[f.key]) out[f.key] = r[imp.map[f.key]]; });
      if (out.estimatedGain) out.estimatedGain = Number(String(out.estimatedGain).replace(/\D/g, "")) || undefined;
      return out;
    });
    const n = importar(linhas);
    toast.success(`${n} sugestões importadas do histórico.`);
    setImp(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const togglePerm = (id: string, mod: ModuloKey) => {
    const p = perfis.find((x) => x.id === id);
    if (!p) return;
    const has = p.permissoes.includes(mod);
    updatePerfil(id, { permissoes: has ? p.permissoes.filter((x) => x !== mod) : [...p.permissoes, mod] });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Settings className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Administração</h1>
          <p className="text-sm text-muted-foreground">Governança, perfis dinâmicos, SLA, replicação e importação histórica.</p>
        </div>
      </div>

      <Tabs defaultValue="empresas">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="empresas"><Building2 className="h-3.5 w-3.5 mr-1" />Empresas</TabsTrigger>
          <TabsTrigger value="usuarios"><Users className="h-3.5 w-3.5 mr-1" />Usuários</TabsTrigger>
          <TabsTrigger value="perfis"><Shield className="h-3.5 w-3.5 mr-1" />Perfis</TabsTrigger>
          <TabsTrigger value="sla"><Clock className="h-3.5 w-3.5 mr-1" />SLA por etapa</TabsTrigger>
          <TabsTrigger value="replicacao"><Copy className="h-3.5 w-3.5 mr-1" />Replicação</TabsTrigger>
          <TabsTrigger value="import"><Upload className="h-3.5 w-3.5 mr-1" />Importação histórica</TabsTrigger>
          <TabsTrigger value="relatorios"><Download className="h-3.5 w-3.5 mr-1" />Relatórios</TabsTrigger>
        </TabsList>

        {/* EMPRESAS */}
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
                    <p className="text-xs text-muted-foreground">{usuarios.filter((u) => u.empresa === e.nome).length} usuários · {ideas.filter((i) => i.empresa === e.nome).length} sugestões</p>
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

        {/* USUÁRIOS */}
        <TabsContent value="usuarios" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1">Novo usuário</h3>
            <p className="text-xs text-muted-foreground mb-3">Para colaborador operacional, basta a matrícula. Demais perfis exigem nome e e-mail.</p>
            <div className="grid sm:grid-cols-7 gap-2">
              <Input placeholder="Matrícula" value={novoUsuario.matricula} onChange={(e) => setNovoUsuario({ ...novoUsuario, matricula: e.target.value })} />
              <Input placeholder="Nome" value={novoUsuario.nome} onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} />
              <Input placeholder="E-mail" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} />
              <Input placeholder="Senha (mín. 6)" type="password" value={novoUsuario.senha} onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })} />
              <Select value={novoUsuario.empresa} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, empresa: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.nome}>{e.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={novoUsuario.perfil} onValueChange={(v) => setNovoUsuario({ ...novoUsuario, perfil: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{perfis.filter(p=>p.ativo).map((p) => <SelectItem key={p.id} value={String(p.nome)}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={async () => {
                const isOp = novoUsuario.perfil === "Colaborador";
                if (isOp && !novoUsuario.matricula) { toast.error("Informe a matrícula."); return; }
                if (!isOp && (!novoUsuario.nome || !novoUsuario.email)) { toast.error("Nome e e-mail obrigatórios."); return; }
                if (novoUsuario.senha.length < 6) { toast.error("Defina uma senha de 6+ caracteres."); return; }
                const finalEmail = isOp ? matriculaToEmail(novoUsuario.matricula) : novoUsuario.email.trim();
                const nomeFinal = novoUsuario.nome || `Colab. ${novoUsuario.matricula}`;
                const { error } = await supabaseShadow.auth.signUp({
                  email: finalEmail,
                  password: novoUsuario.senha,
                  options: { data: { nome: nomeFinal, empresa: novoUsuario.empresa, perfil: novoUsuario.perfil, matricula: novoUsuario.matricula || null } },
                });
                if (error) { toast.error("Falha ao criar acesso: " + error.message); return; }
                addUsuario({ ...novoUsuario, nome: nomeFinal });
                setNovoUsuario({ ...novoUsuario, nome: "", email: "", matricula: "", senha: "" });
                toast.success("Usuário cadastrado com acesso ao sistema.");
              }}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Nome</th><th className="p-3">Identificação</th><th className="p-3">Empresa</th><th className="p-3">Perfil</th><th className="p-3">Status</th><th className="p-3 text-right">Ação</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usuarios.map((u) => (
                  <tr key={u.id} className={u.ativo ? "" : "opacity-50"}>
                    <td className="p-3 font-semibold">{u.nome}</td>
                    <td className="p-3 text-xs text-muted-foreground">{u.matricula ? `Mat. ${u.matricula}` : u.email}</td>
                    <td className="p-3 text-xs">{u.empresa}</td>
                    <td className="p-3"><Badge variant="outline">{u.perfil}</Badge></td>
                    <td className="p-3"><Badge variant={u.ativo ? "default" : "secondary"}>{u.ativo ? "Ativo" : "Inativo"}</Badge></td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleUsuario(u.id)} title={u.ativo ? "Desativar" : "Ativar"}>
                        <Power className={`h-4 w-4 ${u.ativo ? "text-success" : "text-muted-foreground"}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Para preservar histórico e rastreabilidade, usuários não podem ser excluídos — apenas ativados ou desativados.</p>
        </TabsContent>

        {/* PERFIS */}
        <TabsContent value="perfis" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-3">Novo perfil</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Input className="w-64" placeholder="Nome do perfil" value={novoPerfil.nome} onChange={(e) => setNovoPerfil({ ...novoPerfil, nome: e.target.value })} />
              <Button onClick={() => {
                if (!novoPerfil.nome) return;
                addPerfil({ nome: novoPerfil.nome, ativo: true, permissoes: novoPerfil.permissoes });
                setNovoPerfil({ nome: "", permissoes: [] });
                toast.success("Perfil criado.");
              }}><Plus className="h-4 w-4 mr-1" />Criar</Button>
            </div>
          </div>
          <div className="space-y-3">
            {perfis.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-bold">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">{p.permissoes.length} módulos liberados</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
                    <Switch checked={p.ativo} onCheckedChange={() => togglePerfil(p.id)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {MODULOS.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 p-2 rounded-lg border border-border text-xs cursor-pointer hover:bg-muted/40">
                      <Checkbox checked={p.permissoes.includes(m.key)} onCheckedChange={() => togglePerm(p.id, m.key)} />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* SLA */}
        <TabsContent value="sla" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1">Etapas e SLA</h3>
            <p className="text-xs text-muted-foreground mb-4">Crie etapas dinâmicas, defina prazo em dias, responsável e se exige aprovação.</p>
            <div className="space-y-2 mb-4">
              {etapas.sort((a,b)=>a.ordem-b.ordem).map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl border border-border">
                  <div className="col-span-3">
                    <Label className="text-xs">Etapa</Label>
                    <Input value={s.nome} onChange={(e) => updateEtapa(s.id, { nome: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">SLA (dias)</Label>
                    <Input type="number" value={s.dias} onChange={(e) => updateEtapa(s.id, { dias: Number(e.target.value) })} />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Responsável</Label>
                    <Select value={String(s.responsavelPerfil)} onValueChange={(v) => updateEtapa(s.id, { responsavelPerfil: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{perfis.map((p) => <SelectItem key={p.id} value={String(p.nome)}>{p.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 pb-2">
                    <Switch checked={s.exigeAprovacao} onCheckedChange={(v) => updateEtapa(s.id, { exigeAprovacao: v })} />
                    <Label className="text-xs">Exige aprovação</Label>
                  </div>
                  <div className="col-span-1 flex items-center gap-2 pb-2">
                    <Switch checked={s.ativa} onCheckedChange={(v) => updateEtapa(s.id, { ativa: v })} />
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    <Button variant="ghost" size="sm" onClick={() => removeEtapa(s.id)}>×</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl border border-dashed border-border">
              <div className="col-span-4">
                <Label className="text-xs">Nova etapa</Label>
                <Input value={novaEtapa.nome} onChange={(e) => setNovaEtapa({ ...novaEtapa, nome: e.target.value })} placeholder="Ex: Validação técnica" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Dias</Label>
                <Input type="number" value={novaEtapa.dias} onChange={(e) => setNovaEtapa({ ...novaEtapa, dias: Number(e.target.value) })} />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Responsável</Label>
                <Select value={novaEtapa.responsavelPerfil} onValueChange={(v) => setNovaEtapa({ ...novaEtapa, responsavelPerfil: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{perfis.map((p) => <SelectItem key={p.id} value={String(p.nome)}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Button className="w-full" onClick={() => {
                  if (!novaEtapa.nome) return;
                  addEtapa({ ...novaEtapa, ordem: etapas.length + 1, ativa: true });
                  setNovaEtapa({ nome: "", dias: 3, exigeAprovacao: false, responsavelPerfil: "Ponto Focal" });
                  toast.success("Etapa adicionada.");
                }}><Plus className="h-4 w-4 mr-1" />Adicionar etapa</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* REPLICAÇÃO */}
        <TabsContent value="replicacao" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1">Replicação multi-empresa</h3>
            <p className="text-xs text-muted-foreground mb-4">Selecione as empresas de destino. A mesma melhoria é replicada simultaneamente.</p>
            <div className="divide-y divide-border">
              {replicaveis.map((i) => {
                const sel = replicaSel[i.id] || [];
                return (
                  <div key={i.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-mono text-xs font-bold text-primary-deep">{i.code}</p>
                        <p className="font-semibold text-sm">{i.sugestao}</p>
                        <p className="text-xs text-muted-foreground">Origem: {i.empresa}</p>
                      </div>
                      <Button onClick={() => {
                        if (!sel.length) { toast.error("Selecione ao menos uma empresa."); return; }
                        const novas = replicarMultiplas(i.id, sel, "Admin");
                        toast.success(`Replicada para ${novas.length} empresa(s).`);
                        setReplicaSel({ ...replicaSel, [i.id]: [] });
                      }}><Copy className="h-4 w-4 mr-1" />Replicar para {sel.length || "..."}</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {empresas.filter((e) => e.ativa && e.nome !== i.empresa).map((e) => {
                        const checked = sel.includes(e.nome);
                        return (
                          <label key={e.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${checked ? "border-primary bg-primary/10" : "border-border"}`}>
                            <Checkbox checked={checked} onCheckedChange={(v) => {
                              const next = v ? [...sel, e.nome] : sel.filter((x) => x !== e.nome);
                              setReplicaSel({ ...replicaSel, [i.id]: next });
                            }} />
                            {e.nome}
                          </label>
                        );
                      })}
                    </div>
                    {i.replicacoes && i.replicacoes.length > 0 && (
                      <div className="mt-3 text-xs">
                        <p className="font-semibold text-muted-foreground mb-1">Já replicada:</p>
                        <div className="flex flex-wrap gap-2">
                          {i.replicacoes.map((r, idx) => {
                            const child = ideas.find((x) => x.id === r.ideaId);
                            return <Badge key={idx} variant="outline">{r.empresa} → {child?.status || r.status}</Badge>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {replicaveis.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma sugestão marcada como replicável ainda.</p>}
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

        {/* IMPORTAÇÃO HISTÓRICA */}
        <TabsContent value="import" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold mb-1 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary-deep" />Importar base histórica</h3>
            <p className="text-xs text-muted-foreground mb-4">Faça upload de planilha (.xlsx ou .csv) com sugestões anteriores. Você poderá mapear as colunas antes de importar.</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} className="block text-sm" />
          </div>

          {imp && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Empresa de destino (padrão)</Label>
                  <Select value={imp.empresa} onValueChange={(v) => setImp({ ...imp, empresa: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{empresas.map((e) => <SelectItem key={e.id} value={e.nome}>{e.nome}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground mt-1">Se a coluna "empresa" estiver mapeada, ela tem prioridade.</p>
                </div>
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40">
                  {imp.rows.length} linhas detectadas · {imp.cols.length} colunas
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Mapeamento de colunas</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {FIELDS.map((f) => (
                    <div key={f.key} className="flex items-center gap-2">
                      <Label className="w-40 text-xs">{f.label}</Label>
                      <Select value={imp.map[f.key] || "__none__"} onValueChange={(v) => setImp({ ...imp, map: { ...imp.map, [f.key]: v === "__none__" ? "" : v } })}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— ignorar —</SelectItem>
                          {imp.cols.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Pré-visualização (primeiras 5 linhas)</h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>{imp.cols.map((c) => <th key={c} className="p-2 text-left">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {imp.rows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          {imp.cols.map((c) => <td key={c} className="p-2">{String(r[c] ?? "").slice(0, 60)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setImp(null); if (fileRef.current) fileRef.current.value = ""; }}>Cancelar</Button>
                <Button onClick={confirmarImport}><Upload className="h-4 w-4 mr-1" />Importar {imp.rows.length} sugestões</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* RELATÓRIOS */}
        <TabsContent value="relatorios" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold flex items-center gap-2"><Database className="h-4 w-4 text-primary-deep" />Exportar relatório</h3>
              <p className="text-xs text-muted-foreground">CSV completo com todas as sugestões de melhoria, ganhos e custos.</p>
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
