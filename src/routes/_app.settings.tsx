import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Upload, Wand2, Droplets, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { actions, useStore } from "@/lib/store";
import { PageHeader } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — HygiEnv.ai" },
      { name: "description", content: "Paramètres de l'entreprise, des agents IA, WhatsApp et email." },
      { property: "og:title", content: "Paramètres — HygiEnv.ai" },
      { property: "og:description", content: "Configurez votre plateforme et vos agents IA." },
    ],
  }),
  component: Page,
});

const AGENTS = [
  { id: "a1", name: "Service Client & Prospection", missions: ["Répondre", "Détecter le besoin", "Créer prospect", "Envoyer formulaire", "Préparer dossier"] },
  { id: "a2", name: "Générateur de Devis", missions: ["Retrouver dossier", "Vérifier données", "Calculer", "Générer devis", "Envoyer"] },
];

function AgentCard({ a }: { a: (typeof AGENTS)[number] }) {
  const [c, setC] = useState({ tone: "Professionnel & chaleureux", lang: "Français + Darija", autonomy: [a.id === "a1" ? 80 : 50], human: a.id === "a2", wa: true, mail: a.id === "a2", instr: a.id === "a1" ? "Toujours vouvoyer. Ne jamais donner de prix ferme sans dossier complet." : "Appliquer 5% de remise au-delà de 50 000 MAD HT." });
  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-navy text-primary-glow"><Bot /></div><div><p className="text-xs font-semibold text-primary">Agent {a.id === "a1" ? 1 : 2}</p><p className="font-semibold">{a.name}</p></div><span className="ml-auto flex items-center gap-1 text-xs font-semibold text-success"><span className="size-1.5 animate-pulse rounded-full bg-success" />En ligne</span></div>
      <div className="mt-4 flex flex-wrap gap-1.5">{a.missions.map((m) => <span key={m} className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-primary"><CheckCircle2 className="size-3" />{m}</span>)}</div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Tonalité</Label><Select value={c.tone} onValueChange={(v) => setC({ ...c, tone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Professionnel & chaleureux", "Formel", "Concis"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label>Langue</Label><Select value={c.lang} onValueChange={(v) => setC({ ...c, lang: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Français", "Français + Darija", "Français + Arabe", "Anglais"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="mt-4 space-y-2"><div className="flex justify-between text-sm"><Label>Niveau d'autonomie</Label><b className="text-primary">{c.autonomy[0]}%</b></div><Slider value={c.autonomy} onValueChange={(v) => setC({ ...c, autonomy: v })} max={100} step={10} /></div>
      <div className="mt-4 grid gap-2">
        <label className="flex items-center justify-between rounded-xl border p-3 text-sm">Validation humaine requise <Switch checked={c.human} onCheckedChange={(v) => setC({ ...c, human: v })} /></label>
        <label className="flex items-center justify-between rounded-xl border p-3 text-sm">Canal WhatsApp <Switch checked={c.wa} onCheckedChange={(v) => setC({ ...c, wa: v })} /></label>
        <label className="flex items-center justify-between rounded-xl border p-3 text-sm">Canal Email <Switch checked={c.mail} onCheckedChange={(v) => setC({ ...c, mail: v })} /></label>
      </div>
      <div className="mt-4 space-y-1.5"><Label>Instructions</Label><Textarea rows={3} value={c.instr} onChange={(e) => setC({ ...c, instr: e.target.value })} /></div>
      <Button className="mt-4 w-full" variant="premium" onClick={() => toast.success(`Agent « ${a.name} » mis à jour`)}>Enregistrer la configuration</Button>
    </div>
  );
}

function Page() {
  const company = useStore((s) => s.company);
  const forms = useStore((s) => s.forms);
  const services = useStore((s) => s.services);
  const [co, setCo] = useState(company);
  const [tpl, setTpl] = useState("Moderne");
  const [wa, setWa] = useState({ number: "+212 661 000 111", hours: true, welcome: "Bonjour 👋 Bienvenue chez HygiEnv Maroc. Comment puis-je vous aider ?" });
  const [mail, setMail] = useState({ from: "devis@hygienv.ma", sign: "Imane El Bijri — Sales Manager", cc: true });
  const F = ({ k, l }: { k: string; l: string }) => <div className="space-y-1.5"><Label>{l}</Label><Input value={co[k]} onChange={(e) => setCo({ ...co, [k]: e.target.value })} /></div>;
  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configurez votre entreprise et vos Agents IA." />
      <Tabs defaultValue="company">
        <TabsList className="h-auto flex-wrap">
          {[["company", "Entreprise"], ["agents", "Agents IA"], ["services", "Prestations"], ["forms", "Formulaires"], ["kb", "Base de connaissances"], ["tpl", "Templates devis"], ["wa", "WhatsApp"], ["mail", "Email"]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="company" className="mt-4">
          <div className="card-premium max-w-3xl p-6">
            <div className="mb-5 flex items-center gap-4"><div className="grid size-16 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"><Droplets className="size-7" /></div><Button variant="outline" onClick={() => toast.success("Logo mis à jour")}><Upload /> Changer le logo</Button></div>
            <div className="grid gap-3 md:grid-cols-2">
              {F({ k: "name", l: "Nom" })}{F({ k: "phone", l: "Téléphone" })}<div className="md:col-span-2">{F({ k: "address", l: "Adresse" })}</div>{F({ k: "email", l: "Email" })}{F({ k: "rc", l: "RC" })}{F({ k: "ice", l: "ICE" })}{F({ k: "if", l: "IF" })}
            </div>
            <Button className="mt-5" variant="premium" onClick={() => { actions.setCompany(co); toast.success("Informations enregistrées"); }}>Enregistrer</Button>
          </div>
        </TabsContent>
        <TabsContent value="agents" className="mt-4 grid gap-4 lg:grid-cols-2">{AGENTS.map((a) => <AgentCard key={a.id} a={a} />)}</TabsContent>
        <TabsContent value="services" className="mt-4"><div className="card-premium p-5">{services.map((s) => <div key={s.id} className="flex items-center justify-between border-b py-3 text-sm"><span className="font-medium">{s.name}</span><Switch checked={s.active} onCheckedChange={(v) => { actions.upsert("services", { ...s, active: v }); toast.success("Mis à jour"); }} /></div>)}<Button asChild variant="link" className="mt-2 px-0"><Link to="/services">Gérer les prestations →</Link></Button></div></TabsContent>
        <TabsContent value="forms" className="mt-4"><div className="card-premium p-5">{forms.map((f) => <div key={f.id} className="flex items-center justify-between border-b py-3 text-sm"><span className="font-medium">{f.name}</span><Button asChild size="sm" variant="ghost"><Link to="/forms/$id" params={{ id: f.id }}>Modifier</Link></Button></div>)}</div></TabsContent>
        <TabsContent value="kb" className="mt-4"><div className="card-premium p-6"><p className="text-sm text-muted-foreground">L'Agent consulte la FAQ, les documents indexés et les informations générales.</p><label className="mt-4 flex max-w-md items-center justify-between rounded-xl border p-3 text-sm">Proposer automatiquement des FAQ depuis les questions non résolues <Switch defaultChecked onCheckedChange={() => toast.success("Préférence enregistrée")} /></label><Button asChild variant="premium" className="mt-4"><Link to="/knowledge">Ouvrir la base de connaissances</Link></Button></div></TabsContent>
        <TabsContent value="tpl" className="mt-4 grid gap-4 md:grid-cols-3">
          {["Moderne", "Classique", "Minimal"].map((t) => <button key={t} onClick={() => { setTpl(t); toast.success(`Template « ${t} » sélectionné`); }} className={`card-premium card-hover p-5 text-left ${tpl === t ? "ring-2 ring-primary" : ""}`}><div className={`mb-3 h-24 rounded-xl ${t === "Moderne" ? "bg-gradient-navy" : t === "Classique" ? "bg-muted" : "border"}`} /><p className="font-semibold">{t}</p><p className="text-xs text-muted-foreground">{tpl === t ? "Template actif" : "Cliquer pour activer"}</p></button>)}
        </TabsContent>
        <TabsContent value="wa" className="mt-4"><div className="card-premium max-w-2xl space-y-3 p-6"><div className="space-y-1.5"><Label>Numéro WhatsApp Business</Label><Input value={wa.number} onChange={(e) => setWa({ ...wa, number: e.target.value })} /></div><div className="space-y-1.5"><Label>Message d'accueil</Label><Textarea value={wa.welcome} onChange={(e) => setWa({ ...wa, welcome: e.target.value })} /></div><label className="flex items-center justify-between rounded-xl border p-3 text-sm">Réponse IA hors horaires <Switch checked={wa.hours} onCheckedChange={(v) => setWa({ ...wa, hours: v })} /></label><Button variant="premium" onClick={() => toast.success("WhatsApp configuré", { description: "Connexion vérifiée ✓" })}><Wand2 /> Enregistrer & tester</Button></div></TabsContent>
        <TabsContent value="mail" className="mt-4"><div className="card-premium max-w-2xl space-y-3 p-6"><div className="space-y-1.5"><Label>Adresse d'expédition</Label><Input value={mail.from} onChange={(e) => setMail({ ...mail, from: e.target.value })} /></div><div className="space-y-1.5"><Label>Signature</Label><Input value={mail.sign} onChange={(e) => setMail({ ...mail, sign: e.target.value })} /></div><label className="flex items-center justify-between rounded-xl border p-3 text-sm">Me mettre en copie <Switch checked={mail.cc} onCheckedChange={(v) => setMail({ ...mail, cc: v })} /></label><Button variant="premium" onClick={() => toast.success("Paramètres email enregistrés")}>Enregistrer</Button></div></TabsContent>
      </Tabs>
    </div>
  );
}
