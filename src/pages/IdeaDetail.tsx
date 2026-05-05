import { useParams, Link } from "react-router-dom";
import { useIdeas } from "@/store/ideas";
import { useState } from "react";
import { criterios, calcScore, Evaluation } from "@/data/ideas";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, User, Calendar, Clock, MessageSquare, CheckCircle2, XCircle, AlertCircle, FileText, Target, Plus } from "lucide-react";
import { toast } from "sonner";

const stages = ["Recebimento", "Comitê", "Implementação", "Concluído"];

export default function IdeaDetail() {
  const { id } = useParams();
  const { ideas, evaluate, setStatus, update, addHistory } = useIdeas();
  const idea = ideas.find((i) => i.id === id);
  const [feedback, setFeedback] = useState("");
  const [ev, setEv] = useState<Evaluation>({ abrangencia: 0.5, reducaoImpacto: 1.5, retornoFinanceiro: 0.5, criatividade: 1.5, investimento: 0.5 });
  const [taskTitle, setTaskTitle] = useState("");
  const [taskResp, setTaskResp] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [realized, setRealized] = useState("");

  if (!idea) return <div className="p-8">Ideia não encontrada. <Link to="/" className="text-primary-deep underline">Voltar</Link></div>;

  const stageIdx = stages.indexOf(idea.stage);
  const score = ev ? calcScore(ev) : 0;

  const requireFeedback = (fn: () => void) => {
    if (!feedback.trim()) { toast.error("Feedback é obrigatório."); return; }
    fn();
    setFeedback("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link to="/kanban" className="text-xs text-muted-foreground hover:text-primary-deep inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3 w-3" /> Voltar ao Kanban
      </Link>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-soft border border-primary/20 p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono font-bold text-primary-deep">{idea.code}</span>
              <StatusBadge status={idea.status} />
              {idea.campaign && <span className="text-[10px] uppercase tracking-wider font-bold text-primary-deep bg-primary/10 px-2 py-0.5 rounded-full">{idea.campaign}</span>}
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight max-w-3xl">{idea.sugestao}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />{idea.colaborador}</span>
              <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{idea.empresa}</span>
              <span className="inline-flex items-center gap-1"><Target className="h-3.5 w-3.5" />Aplicação: {idea.setorAplicacao}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{idea.createdAt}</span>
              {idea.sla > 0 && <span className="inline-flex items-center gap-1 text-warning-foreground"><Clock className="h-3.5 w-3.5" />SLA: {idea.sla}h</span>}
            </div>
          </div>
          {idea.score !== undefined && (
            <div className="rounded-xl bg-card px-4 py-3 border border-border text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Nota final</p>
              <p className="font-display text-3xl font-bold text-primary-deep">{idea.score.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-1">
          {stages.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={`flex-1 h-2 rounded-full ${i <= stageIdx ? "bg-gradient-primary" : "bg-muted"}`} />
              {i < stages.length - 1 && <div className={`h-2 w-2 rounded-full ${i < stageIdx ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-semibold">
          {stages.map((s, i) => (
            <span key={s} className={i <= stageIdx ? "text-primary-deep" : "text-muted-foreground"}>{s}</span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Conteúdo */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-primary-deep" />Detalhes</h3>
            <dl className="space-y-4 text-sm">
              <div><dt className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Problema identificado</dt><dd>{idea.problema}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Sugestão</dt><dd>{idea.sugestao}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Ganho esperado</dt><dd>{idea.ganhoEsperado}</dd></div>
            </dl>
          </div>

          {/* Avaliação do comitê */}
          {idea.stage !== "Concluído" && idea.status !== "Reprovado" && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display font-bold mb-1">Avaliação do Comitê</h3>
              <p className="text-xs text-muted-foreground mb-4">Pontuação ponderada por critério.</p>
              <div className="space-y-3">
                {(Object.keys(criterios) as (keyof typeof criterios)[]).map((k) => {
                  const labels: Record<string, [string, string]> = {
                    abrangencia: ["Abrangência da melhoria", "10%"],
                    reducaoImpacto: ["Redução/eliminação do impacto", "20%"],
                    retornoFinanceiro: ["Retorno financeiro anual", "40%"],
                    criatividade: ["Soluções criativas/pioneiras", "20%"],
                    investimento: ["Investimento necessário", "10%"],
                  };
                  return (
                    <div key={k} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 sm:col-span-5">
                        <p className="text-sm font-semibold">{labels[k][0]}</p>
                        <p className="text-[11px] text-muted-foreground">Peso {labels[k][1]}</p>
                      </div>
                      <div className="col-span-12 sm:col-span-7">
                        <Select value={String(ev[k])} onValueChange={(v) => setEv({ ...ev, [k]: Number(v) })}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {criterios[k].map((c) => <SelectItem key={c.v} value={String(c.v)}>{c.label} ({c.v})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-gradient-soft flex items-center justify-between">
                <span className="text-sm font-semibold">Nota calculada</span>
                <span className="font-display text-2xl font-bold text-primary-deep">{score.toFixed(2)}</span>
              </div>

              <div className="mt-4">
                <Label>Feedback (obrigatório)</Label>
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Justifique a decisão ou peça novo entendimento..." />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => requireFeedback(() => evaluate(idea.id, ev, feedback, "Comitê"))} className="bg-gradient-primary text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4 mr-1" />Aprovar com nota
                </Button>
                <Button variant="outline" onClick={() => requireFeedback(() => setStatus(idea.id, "Necessário novo entendimento", "Comitê", feedback, "Comitê"))}>
                  <AlertCircle className="h-4 w-4 mr-1" />Pedir novo entendimento
                </Button>
                <Button variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => requireFeedback(() => setStatus(idea.id, "Reprovado", "Recebimento", feedback, "Comitê"))}>
                  <XCircle className="h-4 w-4 mr-1" />Reprovar
                </Button>
              </div>
            </div>
          )}

          {/* Plano de ação */}
          {(idea.status === "Aprovado" || idea.status === "Em execução" || idea.status === "Concluído") && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold">Plano de ação</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold text-primary-deep">{idea.progress || 0}%</span>
                </div>
              </div>
              <Progress value={idea.progress || 0} className="h-2 mb-4" />

              <ul className="space-y-2 mb-4">
                {(idea.actions || []).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <input
                      type="checkbox" checked={a.done}
                      onChange={() => {
                        const acts = (idea.actions || []).map((x) => x.id === a.id ? { ...x, done: !x.done } : x);
                        const prog = Math.round((acts.filter(x => x.done).length / acts.length) * 100);
                        update(idea.id, { actions: acts, progress: prog, status: prog === 100 ? "Concluído" : "Em execução", stage: prog === 100 ? "Concluído" : "Implementação" });
                      }}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${a.done ? "line-through text-muted-foreground" : ""}`}>{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">{a.responsible} · até {a.due}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="grid sm:grid-cols-12 gap-2">
                <Input className="sm:col-span-5" placeholder="Nova tarefa" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <Input className="sm:col-span-3" placeholder="Responsável" value={taskResp} onChange={(e) => setTaskResp(e.target.value)} />
                <Input className="sm:col-span-3" type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                <Button className="sm:col-span-1" onClick={() => {
                  if (!taskTitle || !taskResp || !taskDue) { toast.error("Preencha todos os campos da tarefa."); return; }
                  const acts = [...(idea.actions || []), { id: String(Date.now()), title: taskTitle, responsible: taskResp, due: taskDue, done: false }];
                  update(idea.id, { actions: acts });
                  setTaskTitle(""); setTaskResp(""); setTaskDue("");
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 pt-5 border-t border-border">
                <Label>Validar ganho realizado (R$)</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="number" value={realized} onChange={(e) => setRealized(e.target.value)} placeholder="Ex: 92000" />
                  <Button variant="outline" onClick={() => {
                    if (!realized) return;
                    update(idea.id, { realizedGain: Number(realized) });
                    addHistory(idea.id, { date: new Date().toISOString().slice(0, 10), user: "Implementação", action: "Ganho validado", feedback: `R$ ${Number(realized).toLocaleString("pt-BR")}` });
                    toast.success("Ganho validado!");
                    setRealized("");
                  }}>Registrar</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar histórico */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary-deep" />Histórico rastreável</h3>
            <ol className="space-y-4 relative">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
              {idea.history.map((h, idx) => (
                <li key={idx} className="relative pl-6">
                  <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-gradient-primary ring-4 ring-card" />
                  <p className="text-xs text-muted-foreground">{h.date} · {h.user}</p>
                  <p className="text-sm font-semibold">{h.action}</p>
                  {h.feedback && <p className="text-xs text-muted-foreground mt-1 italic">"{h.feedback}"</p>}
                </li>
              ))}
            </ol>
          </div>

          {idea.estimatedGain && (
            <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-5 shadow-glow">
              <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">Impacto financeiro</p>
              <p className="font-display text-3xl font-bold mt-2">R$ {idea.estimatedGain.toLocaleString("pt-BR")}</p>
              <p className="text-xs opacity-90">Estimado anual</p>
              {idea.realizedGain && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-[11px] opacity-80">Realizado</p>
                  <p className="font-display text-xl font-bold">R$ {idea.realizedGain.toLocaleString("pt-BR")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
