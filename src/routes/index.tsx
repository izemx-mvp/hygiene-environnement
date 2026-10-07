import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bot, ClipboardList, Droplets, FileText, FolderCheck, Loader2, MessageCircle, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AnimatedBg } from "@/components/app/AnimatedBg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { actions, sleep } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connexion — HygiEnv.ai" },
      { name: "description", content: "Votre cycle commercial Hygiène & Environnement piloté par l'IA : WhatsApp, prospects, formulaires et devis." },
      { property: "og:title", content: "Connexion — HygiEnv.ai" },
      { property: "og:description", content: "Répondez à vos clients, détectez les opportunités et générez vos devis depuis une seule plateforme." },
    ],
  }),
  component: Login,
});

const FLOW = [
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: Bot, label: "Service Client IA" },
  { icon: UserPlus, label: "Prospect" },
  { icon: ClipboardList, label: "Formulaire" },
  { icon: FolderCheck, label: "Dossier" },
  { icon: FileText, label: "Devis" },
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("commercial@entreprise.ma");
  const [pwd, setPwd] = useState("demo123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<{ email?: string; pwd?: string }>({});
  const [phase, setPhase] = useState<"idle" | "loading" | "entering">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (!/\S+@\S+\.\S+/.test(email)) er.email = "Adresse email invalide";
    if (pwd.length < 4) er.pwd = "Mot de passe trop court";
    setErr(er);
    if (Object.keys(er).length) return;
    setPhase("loading");
    await sleep(900);
    if (email !== "commercial@entreprise.ma" || pwd !== "demo123") {
      setPhase("idle");
      setErr({ pwd: "Identifiants incorrects" });
      return toast.error("Identifiants incorrects", { description: "Utilisez commercial@entreprise.ma / demo123" });
    }
    setPhase("entering");
    actions.login();
    await sleep(700);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className={cn("relative grid min-h-screen transition-all duration-700 lg:grid-cols-[1.15fr_1fr]", phase === "entering" && "scale-[1.02] opacity-0 blur-sm")}>
      <AnimatedBg intense />
      <section className="relative flex flex-col justify-between p-8 text-navy-foreground md:p-14">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-primary shadow-glow"><Droplets className="size-5 text-primary-foreground" /></div>
          <p className="font-display text-lg font-semibold">HygiEnv<span className="text-primary-glow">.ai</span></p>
        </div>
        <div className="my-14 max-w-xl animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-glow">
            <span className="size-1.5 animate-pulse rounded-full bg-primary-glow" /> 2 Agents IA actifs 24/7
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] md:text-6xl">
            Votre cycle commercial <span className="text-gradient">piloté par l'IA</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-navy-foreground/70 md:text-lg">
            Répondez à vos clients, détectez les opportunités, envoyez les bons formulaires et générez vos devis depuis une seule plateforme.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 md:grid-cols-6">
            {FLOW.map((f, i) => (
              <div key={f.label} className="relative flex flex-col items-center gap-2 text-center animate-fade-up" style={{ animationDelay: `${150 + i * 110}ms` }}>
                <div className="glass-dark grid size-12 place-items-center rounded-2xl shadow-glow"><f.icon className="size-5 text-primary-glow" /></div>
                <span className="text-[11px] font-medium text-navy-foreground/80">{f.label}</span>
                {i < FLOW.length - 1 && (
                  <svg className="absolute left-[calc(50%+28px)] top-6 hidden h-1 w-[calc(100%-56px)] md:block" preserveAspectRatio="none" viewBox="0 0 100 2">
                    <line x1="0" y1="1" x2="100" y2="1" stroke="var(--primary-glow)" strokeWidth="2" className="animate-flow" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-navy-foreground/50">© 2026 HygiEnv Maroc · Hygiène & Environnement</p>
      </section>

      <section className="relative flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-md animate-fade-up rounded-3xl border bg-card/95 p-8 shadow-lift backdrop-blur-xl md:p-10" style={{ animationDelay: "200ms" }}>
          <h2 className="text-2xl font-semibold">Connexion</h2>
          <p className="mt-1 text-sm text-muted-foreground">Accédez à votre espace commercial.</p>
          <div className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn("h-11", err.email && "border-destructive")} />
              {err.email && <p className="text-xs text-destructive">{err.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Mot de passe</Label>
              <div className="relative">
                <Input id="pwd" type={show ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} className={cn("h-11 pr-10", err.pwd && "border-destructive")} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Afficher">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {err.pwd && <p className="text-xs text-destructive">{err.pwd}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2"><Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Se souvenir de moi</label>
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => toast.success("Lien de réinitialisation envoyé", { description: email })}>Mot de passe oublié ?</button>
            </div>
            <Button type="submit" variant="premium" className="h-11 w-full text-sm" disabled={phase !== "idle"}>
              {phase === "idle" ? <>Se connecter <ArrowRight /></> : <><Loader2 className="animate-spin" /> {phase === "loading" ? "Vérification..." : "Ouverture de votre espace..."}</>}
            </Button>
          </div>
          <div className="mt-6 rounded-xl border border-dashed bg-accent/40 p-3 text-xs text-muted-foreground">
            Compte démo : <b className="text-foreground">commercial@entreprise.ma</b> / <b className="text-foreground">demo123</b>
          </div>
        </form>
      </section>
    </div>
  );
}
