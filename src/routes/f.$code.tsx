import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Droplets, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { actions, sleep, useStore } from "@/lib/store";
import { AnimatedBg } from "@/components/app/AnimatedBg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/f/$code")({
  head: () => ({
    meta: [
      { title: "Votre demande — HygiEnv Maroc" },
      { name: "description", content: "Formulaire sécurisé pour préparer votre devis Hygiène & Environnement." },
      { property: "og:title", content: "Votre demande — HygiEnv Maroc" },
      { property: "og:description", content: "Complétez votre demande en 2 minutes." },
    ],
  }),
  component: PublicForm,
});

const STEPS = ["Informations entreprise", "Besoin", "Détails prestation", "Coordonnées", "Validation"];

function PublicForm() {
  const { code } = Route.useParams();
  const p = useStore((s) => s.prospects.find((x) => x.id === code));
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string[]>([]);
  const [d, setD] = useState<Record<string, string>>({
    "Raison sociale": p?.company ?? "", Ville: p?.city ?? "", Secteur: "", Effectif: "",
    Besoin: p?.need ?? "", Urgence: "", "Surface / participants": "", "Date souhaitée": "",
    Contact: p?.name ?? "", Téléphone: p?.phone ?? "", Email: p?.email ?? "",
  });
  const fieldsByStep: string[][] = [["Raison sociale", "Ville", "Secteur", "Effectif"], ["Besoin", "Urgence"], ["Surface / participants", "Date souhaitée"], ["Contact", "Téléphone", "Email"], []];
  const required = ["Raison sociale", "Ville", "Secteur", "Besoin", "Contact", "Téléphone", "Email"];

  if (!p) return <div className="grid min-h-screen place-items-center p-6 text-center"><div><p className="font-semibold">Lien invalide ou expiré.</p><Link to="/dashboard" className="text-primary">Retour</Link></div></div>;

  const next = () => {
    const miss = fieldsByStep[step].filter((k) => required.includes(k) && !d[k]?.trim());
    if (step === 3 && d.Email && !/\S+@\S+\.\S+/.test(d.Email)) miss.push("Email");
    setErr(miss);
    if (miss.length) return toast.error("Merci de compléter les champs requis");
    setStep(step + 1);
  };
  const submit = async () => {
    setBusy(true);
    await sleep(1400);
    const { Contact: _c, Téléphone: _t, Email: _e, ...collected } = d;
    actions.completeForm(p.id, collected);
    setBusy(false);
    setDone(true);
  };
  const inp = (k: string, opts?: { type?: string; long?: boolean; choices?: string[]; ph?: string }) => (
    <div className="space-y-1.5">
      <Label>{k}{required.includes(k) && <span className="text-destructive"> *</span>}</Label>
      {opts?.choices ? (
        <div className="flex flex-wrap gap-2">{opts.choices.map((c) => <button key={c} type="button" onClick={() => setD({ ...d, [k]: c })} className={cn("rounded-xl border px-3.5 py-2 text-sm transition", d[k] === c ? "border-primary bg-primary/10 font-semibold text-primary" : "hover:border-primary/40", err.includes(k) && "border-destructive")}>{c}</button>)}</div>
      ) : opts?.long ? <Textarea rows={4} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} className={err.includes(k) ? "border-destructive" : ""} />
        : <Input type={opts?.type} placeholder={opts?.ph} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} className={cn("h-11", err.includes(k) && "border-destructive")} />}
    </div>
  );

  return (
    <div className="relative min-h-screen px-4 py-10">
      <AnimatedBg />
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2"><div className="grid size-9 place-items-center rounded-xl bg-gradient-primary shadow-glow"><Droplets className="size-4 text-primary-foreground" /></div><p className="font-display font-semibold">HygiEnv Maroc</p></div>
        <div className="card-premium p-7 md:p-9">
          {done ? (
            <div className="animate-fade-up py-8 text-center">
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-success text-success-foreground shadow-lift animate-pulse-ring"><Check className="size-10" /></div>
              <h1 className="mt-6 text-2xl font-semibold">Merci {p.name.split(" ")[0]} !</h1>
              <p className="mt-2 text-muted-foreground">Votre demande {p.service} a bien été reçue. Notre équipe prépare votre devis et revient vers vous sous 24h.</p>
              <Button asChild variant="outline" className="mt-6"><Link to="/prospects/$id" params={{ id: p.id }}>← Retour à la fiche (vue commerciale)</Link></Button>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{p.service}</p>
              <h1 className="mt-1 text-2xl font-semibold">{STEPS[step]}</h1>
              <div className="mt-4 flex items-center gap-3"><Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" /><span className="text-xs font-semibold text-muted-foreground">{step + 1}/{STEPS.length}</span></div>
              <div key={step} className="mt-7 animate-fade-up space-y-4">
                {step === 0 && <>{inp("Raison sociale")}{inp("Ville")}{inp("Secteur", { choices: ["Agroalimentaire", "Restauration", "Santé", "Industrie", "Hôtellerie"] })}{inp("Effectif", { ph: "Ex. 120 salariés" })}</>}
                {step === 1 && <>{inp("Besoin", { long: true })}{inp("Urgence", { choices: ["Sous 1 semaine", "Sous 1 mois", "Flexible"] })}</>}
                {step === 2 && <>{inp("Surface / participants", { ph: p.service === "Formation HSE" ? "Ex. 12 participants" : "Ex. 800 m²" })}{inp("Date souhaitée", { type: "date" })}</>}
                {step === 3 && <>{inp("Contact")}{inp("Téléphone", { type: "tel" })}{inp("Email", { type: "email" })}</>}
                {step === 4 && (
                  <div className="space-y-2 rounded-2xl bg-muted/50 p-4 text-sm">
                    {Object.entries(d).map(([k, v]) => <div key={k} className="flex justify-between gap-4"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v || <i className="text-warning-foreground">Non renseigné</i>}</span></div>)}
                  </div>
                )}
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" disabled={!step || busy} onClick={() => { setErr([]); setStep(step - 1); }}><ArrowLeft /> Précédent</Button>
                {step < 4 ? <Button variant="premium" onClick={next}>Suivant <ArrowRight /></Button> : <Button variant="premium" disabled={busy} onClick={submit}>{busy ? <><Loader2 className="animate-spin" /> Envoi...</> : <>Envoyer ma demande <Check /></>}</Button>}
              </div>
            </>
          )}
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Lien sécurisé form.hygiene.ai · Vos données restent confidentielles</p>
      </div>
    </div>
  );
}
