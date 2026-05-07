import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdeas } from "@/store/ideas";
import { empresas } from "@/data/ideas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { SimilarityAlert } from "@/components/SimilarityAlert";

const examples = {
  problema: 'Ex: "A linha 3 sofre 4 paradas/semana por desalinhamento da esteira."',
  sugestao: 'Ex: "Instalar guias laterais ajustáveis com sensor de desvio integrado ao CLP."',
  ganho: 'Ex: "Redução estimada de 80% das paradas." (opcional)',
};

export default function NovaIdeia() {
  const add = useIdeas((s) => s.add);
  const similares = useIdeas((s) => s.similares);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    empresa: "", colaborador: "", setorColaborador: "", setorAplicacao: "",
    problema: "", sugestao: "", ganhoEsperado: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const checks = {
    descritivo: form.problema.length > 30 && form.sugestao.length > 30,
    naoReclamacao: !/^(ruim|odeio|horr[íi]vel|p[ée]ssimo)/i.test(form.problema.trim()),
  };

  const sims = useMemo(() => {
    if (!form.empresa || form.sugestao.length < 12) return [];
    return similares(form.empresa, form.sugestao + " " + form.problema);
  }, [form.empresa, form.sugestao, form.problema, similares]);

  const submit = () => {
    const obrigatorios = ["empresa", "colaborador", "setorColaborador", "setorAplicacao", "problema", "sugestao"] as const;
    if (obrigatorios.some((k) => !form[k])) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const idea = add(form as any);
    toast.success(`Sugestão ${idea.code} enviada!`);
    navigate(`/ideia/${idea.id}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Lightbulb className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Submeter nova ideia</h1>
          <p className="text-sm text-muted-foreground">Conte sua ideia em poucos minutos.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Empresa *</Label>
              <Select value={form.empresa} onValueChange={(v) => update("empresa", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{empresas.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nome do colaborador *</Label>
              <Input value={form.colaborador} onChange={(e) => update("colaborador", e.target.value)} placeholder="Seu nome completo" />
            </div>
            <div>
              <Label>Setor do colaborador *</Label>
              <Input value={form.setorColaborador} onChange={(e) => update("setorColaborador", e.target.value)} placeholder="Ex: Manutenção, PCP, etc." />
            </div>
            <div>
              <Label>Setor de aplicação da melhoria *</Label>
              <Input value={form.setorAplicacao} onChange={(e) => update("setorAplicacao", e.target.value)} placeholder="Ex: Produção Linha 3" />
            </div>
          </div>

          <div>
            <Label>Problema identificado *</Label>
            <Textarea rows={3} value={form.problema} onChange={(e) => update("problema", e.target.value)} placeholder={examples.problema} />
            {!checks.descritivo && form.problema && <p className="text-[11px] text-warning-foreground mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Descreva com mais detalhes (mín. 30 caracteres).</p>}
          </div>

          <div>
            <Label>Sugestão de melhoria *</Label>
            <Textarea rows={3} value={form.sugestao} onChange={(e) => update("sugestao", e.target.value)} placeholder={examples.sugestao} />
          </div>

          {sims.length > 0 && <SimilarityAlert similares={sims} />}

          <div>
            <Label>Ganho esperado <span className="text-xs text-muted-foreground">(opcional)</span></Label>
            <Textarea rows={2} value={form.ganhoEsperado} onChange={(e) => update("ganhoEsperado", e.target.value)} placeholder={examples.ganho} />
            <p className="text-[11px] text-muted-foreground mt-1">Caso ainda não tenha mensuração, deixe em branco — o Ponto Focal apoiará nessa etapa.</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">Você poderá acompanhar o status em tempo real.</p>
            <Button onClick={submit} className="bg-gradient-primary text-primary-foreground shadow-glow">
              Enviar ideia
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-soft p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary-deep" />
              <h3 className="font-display font-bold text-sm">Boa prática</h3>
            </div>
            <ul className="space-y-2 text-xs">
              {[
                ["Apresenta solução clara", checks.descritivo],
                ["Não é apenas uma reclamação", checks.naoReclamacao],
              ].map(([label, ok]) => (
                <li key={label as string} className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${ok ? "text-success" : "text-muted-foreground/50"}`} />
                  <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label as string}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-sm mb-2">Dica do FAN</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ideias com <strong className="text-foreground">problema e solução</strong> bem descritos avançam até <strong className="text-primary-deep">3x mais rápido</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
