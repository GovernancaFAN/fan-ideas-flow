import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/auth";
import { matriculaToEmail } from "@/lib/supabaseShadow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Lightbulb, LogIn, ShieldPlus } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { userId, ready, init } = useAuth();
  const [mode, setMode] = useState<"email" | "matricula">("email");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (ready && userId) navigate("/", { replace: true });
  }, [ready, userId, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalEmail = mode === "email" ? email.trim() : matriculaToEmail(matricula);
    const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: senha });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar. Verifique as credenciais.");
      return;
    }
    toast.success("Bem-vindo(a)!");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black leading-none">Portal de Melhoria Contínua</h1>
            <p className="text-xs text-muted-foreground">Grupo FAN</p>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-elegant space-y-4">
          <h2 className="font-display font-bold text-lg">Acessar sua conta</h2>
          <p className="text-xs text-muted-foreground -mt-2">Use seu e-mail corporativo ou matrícula.</p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="email">E-mail</TabsTrigger>
              <TabsTrigger value="matricula">Matrícula</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-2 mt-3">
              <Label>E-mail</Label>
              <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@empresa.com.br" />
            </TabsContent>
            <TabsContent value="matricula" className="space-y-2 mt-3">
              <Label>Matrícula</Label>
              <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Ex: 12345" />
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
            <LogIn className="h-4 w-4 mr-1" /> {loading ? "Entrando..." : "Entrar"}
          </Button>

          <BootstrapAdmin />

          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Acesso fornecido pelo Administrador do sistema.
          </p>
        </form>
      </div>
    </div>
  );
}

function BootstrapAdmin() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("FAN Indústria");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!nome || !email || senha.length < 6) {
      toast.error("Preencha todos os campos (senha 6+).");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome, empresa, perfil: "Administrador" },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Administrador criado. Faça login.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="w-full text-xs">
          <ShieldPlus className="h-3.5 w-3.5 mr-1" /> Primeiro acesso? Criar administrador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Criar Administrador inicial</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div className="space-y-1"><Label>Empresa</Label><Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} /></div>
          <div className="space-y-1"><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1"><Label>Senha (mín. 6)</Label><Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading} className="bg-gradient-primary text-primary-foreground">Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
