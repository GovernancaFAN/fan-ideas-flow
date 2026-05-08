import { useMemo, useState } from "react";
import { useIdeas, useVisibleIdeas } from "@/store/ideas";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";

export default function Entendimento() {
  const ideas = useVisibleIdeas();
  const registrar = useIdeas((s) => s.registrarEntendimento);
  const setStatus = useIdeas((s) => s.setStatus);
  const fila = ideas.filter((i) => i.stage === "Recebimento" || i.stage === "Entendimento" || i.status === "Necessário novo entendimento");
  const [sel, setSel] = useState<string | null>(fila[0]?.id || null);
  const [form, setForm] = useState({ parecer: "", observacoes: "", entendimentoColab: "" });
  const idea = ideas.find((i) => i.id === sel);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full">
          <Search className="h-3 w-3" /> Entendimento da melhoria
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold">Análise inicial pelo Ponto Focal</h1>
        <p className="text-sm text-muted-foreground">Registre parecer inicial, observações e o entendimento realizado com o colaborador antes de avançar para o comitê.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-3 space-y-2 max-h-[70vh] overflow-auto">
          <p className="text-xs font-semibold text-muted-foreground px-2">{fila.length} sugestões na fila</p>
          {fila.map((i) => (
            <button key={i.id} onClick={() => { setSel(i.id); setForm({ parecer: i.parecerEntendimento || "", observacoes: i.observacoesEntendimento || "", entendimentoColab: i.entendimentoColaborador || "" }); }} className={`w-full text-left p-3 rounded-lg border ${sel === i.id ? "border-primary bg-primary/5" : "border-border"} hover:border-primary/60`}>
              <p className="font-mono text-[11px] text-primary-deep font-bold">{i.code}</p>
              <p className="text-sm font-semibold line-clamp-2">{i.sugestao}</p>
              <div className="mt-1 flex items-center justify-between"><StatusBadge status={i.status} /><span className="text-[10px] text-muted-foreground">{i.empresa}</span></div>
            </button>
          ))}
          {!fila.length && <p className="text-sm text-muted-foreground p-4 text-center">Nenhuma sugestão na fila.</p>}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {idea ? (
            <>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-primary-deep">{idea.code}</span>
                  <StatusBadge status={idea.status} />
                </div>
                <h2 className="font-display text-xl font-bold mb-3">{idea.sugestao}</h2>
                <p className="text-sm"><strong>Problema:</strong> {idea.problema}</p>
                {idea.ganhoEsperado && <p className="text-sm mt-1"><strong>Ganho esperado:</strong> {idea.ganhoEsperado}</p>}
                <p className="text-xs text-muted-foreground mt-2">Por {idea.colaborador} · {idea.empresa} · {idea.setorAplicacao}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-display font-bold">Registro do entendimento</h3>
                <div>
                  <Label>Parecer inicial</Label>
                  <Textarea rows={2} value={form.parecer} onChange={(e) => setForm({ ...form, parecer: e.target.value })} placeholder="Resumo do entendimento do Ponto Focal..." />
                </div>
                <div>
                  <Label>Observações / complementos</Label>
                  <Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Detalhes técnicos, escopo, restrições..." />
                </div>
                <div>
                  <Label>Entendimento realizado com o colaborador</Label>
                  <Textarea rows={2} value={form.entendimentoColab} onChange={(e) => setForm({ ...form, entendimentoColab: e.target.value })} placeholder="Pontos alinhados em conversa com o autor..." />
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button variant="outline" onClick={() => {
                    setStatus(idea.id, "Em entendimento", "Entendimento", form.parecer || "Em alinhamento com o autor", "Ponto Focal");
                    toast.success("Sugestão movida para entendimento.");
                  }}>Salvar e manter em entendimento</Button>
                  <Button onClick={() => {
                    if (!form.parecer.trim()) { toast.error("Parecer inicial é obrigatório."); return; }
                    registrar(idea.id, { ...form, user: "Ponto Focal" });
                    toast.success("Encaminhado ao Comitê.");
                  }} className="bg-gradient-primary text-primary-foreground">
                    Encaminhar ao Comitê <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Link to={`/ideia/${idea.id}`} className="ml-auto text-xs text-muted-foreground self-center underline">Ver detalhes completos</Link>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Selecione uma sugestão para iniciar o entendimento.</div>
          )}
        </div>
      </div>
    </div>
  );
}
