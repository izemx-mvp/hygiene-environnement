import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList, FileText, History, MessageCircle, Pencil, Wand2, Sparkles as Spark, Upload, Phone, Mail, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { actions, useStore } from "@/lib/store";
import { SERVICES } from "@/lib/mock";
import { EmptyState, Initials, StatusBadge, fmtDate, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { SendFormDialog } from "@/components/app/SendFormDialog";
import { QuoteWorkflowDialog } from "@/components/app/QuoteDialogs";
import type { Prospect } from "@/lib/types";

export const Route = createFileRoute("/_app/prospects/$id")({
  head: () => ({
    meta: [
      { title: "Fiche prospect — HygiEnv.ai" },
      { name: "description", content: "Fiche prospect complète : résumé IA, formulaire, documents et historique." },
      { property: "og:title", content: "Fiche prospect — HygiEnv.ai" },
      { property: "og:description", content: "Toutes les informations d'un prospect en un coup d'œil." },
    ],
  }),
  component: Page,
});

const STEPS = ["Nouveau", "Formulaire envoyé", "Formulaire complété", "Prêt pour devis", "Devis généré", "Devis envoyé"];

function Page() {
  const { id } = Route.useParams();
  const p = useStore((s) => s.prospects.find((x) => x.id === id));
  const forms = useStore((s) => s.forms);
  const acts = useStore((s) => s.activities);
  const allQuotes = useStore((s) => s.quotes);
  const quotes = allQuotes.filter((q) => q.prospectId === id);
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [sendOpen, setSendOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [edit, setEdit] = useState<Prospect | null>(null);

  if (!p) return <EmptyState icon={<FileText />} title="Prospect introuvable" desc="Ce prospect n'existe pas ou a été supprimé." />;
  const form = forms.find((f) => f.id === p.formId);
  const stepIdx = Math.max(0, STEPS.indexOf(p.status === "Infos manquantes" ? "Formulaire complété" : p.status));
  const history = acts.filter((a) => a.prospect === p.name);
  const next =
    p.status === "Nouveau" ? "Envoyer le formulaire " + p.service :
    p.status === "Formulaire envoyé" ? "Relancer le client pour compléter le formulaire" :
    p.status === "Infos manquantes" ? "Compléter les informations manquantes puis marquer prêt" :
    p.status === "Formulaire complété" ? "Vérifier le dossier et le marquer prêt pour devis" :
    p.status === "Prêt pour devis" ? "Demander le devis à l'Agent IA via WhatsApp" : "Suivre la réponse du client";

  return (
    <div>
      <div className="card-premium relative overflow-hidden p-6">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
          <Initials name={p.name} className="size-16 text-lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold">{p.name}</h1><StatusBadge status={p.status} /><span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-primary">{p.service}</span></div>
            <p className="font-medium text-primary">{p.company} · {p.city}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{p.phone || "—"}</span>
              <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{p.email || "—"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />Créé le {fmtDate(p.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
            <Button variant="outline" size="sm" onClick={() => setSendOpen(true)}><ClipboardList /> Envoyer formulaire</Button>
            <Button variant="outline" size="sm" onClick={() => setEdit({ ...p })}><Pencil /> Modifier</Button>
            <Button variant="outline" size="sm" disabled={["Prêt pour devis", "Devis généré", "Devis envoyé"].includes(p.status)} onClick={() => { actions.markReady(p.id); toast.success("Dossier prêt pour devis"); }}><CheckCircle2 /> Prêt pour devis</Button>
            <Button variant="ghost" size="sm" onClick={() => setTab("history")}><History /> Historique</Button>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-6 gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s}>
              <div className={`h-1.5 rounded-full transition-all duration-700 ${i <= stepIdx ? "bg-gradient-primary" : "bg-muted"}`} />
              <p className={`mt-1.5 hidden text-[10px] font-semibold md:block ${i <= stepIdx ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger><TabsTrigger value="form">Formulaire</TabsTrigger>
          <TabsTrigger value="info">Informations collectées</TabsTrigger><TabsTrigger value="docs">Documents</TabsTrigger><TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="card-premium p-5 lg:col-span-2">
            <p className="flex items-center gap-2 font-semibold"><Spark className="size-4 text-primary" /> Résumé IA</p>
            <p className="mt-2 text-sm leading-relaxed">{p.summary}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Besoin exprimé</p>
            <p className="mt-1 text-sm">{p.need || "—"}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              {[["Source", p.source], ["Prestation détectée", p.service], ["Formulaire", form?.name ?? "—"], ["Devis", quotes.length ? quotes.map((q) => q.ref).join(", ") : "—"]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
          </div>
          <div className="card-premium border-primary/30 bg-gradient-to-br from-accent to-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Prochaine action recommandée</p>
            <p className="mt-2 font-display text-lg font-semibold">{next}</p>
            {p.status === "Prêt pour devis" && (
              <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-card/70 p-3 text-xs">
                <p className="flex items-center gap-1.5 font-semibold text-primary"><MessageCircle className="size-3.5" /> Instruction WhatsApp attendue</p>
                <p className="mt-1 italic">« Génère le devis pour {p.name}. »</p>
              </div>
            )}
            <Button className="mt-4 w-full" variant="premium" onClick={() => {
              if (p.status === "Nouveau" || p.status === "Formulaire envoyé") setSendOpen(true);
              else if (p.status === "Prêt pour devis") setQuoteOpen(true);
              else if (p.status === "Formulaire complété" || p.status === "Infos manquantes") { actions.markReady(p.id); toast.success("Dossier prêt pour devis"); }
              else if (quotes[0]) navigate({ to: "/quotes/$id", params: { id: quotes[0].id } });
            }}>{p.status === "Prêt pour devis" ? "Simuler l'instruction WhatsApp (démo)" : "Exécuter"}</Button>
          </div>
        </TabsContent>
        <TabsContent value="form" className="mt-4">
          <div className="card-premium p-5">
            {form ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1"><p className="font-semibold">{form.name}</p><p className="text-sm text-muted-foreground">Lien : {p.formLink}</p><div className="mt-3 flex items-center gap-3"><Progress value={p.formStatus === "Complété" ? 100 : 35} className="h-2 w-48" /><StatusBadge status={p.formStatus} /></div></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSendOpen(true)}>Renvoyer</Button>
                  {p.formStatus !== "Complété" && <Button variant="premium" onClick={() => navigate({ to: "/f/$code", params: { code: p.id } })}>Simuler la réponse client</Button>}
                </div>
              </div>
            ) : <EmptyState icon={<ClipboardList />} title="Aucun formulaire envoyé" desc="Envoyez le formulaire adapté à la prestation." />}
          </div>
        </TabsContent>
        <TabsContent value="info" className="mt-4">
          {p.collected ? (
            <div className="card-premium grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(p.collected).map(([k, v]) => <div key={k} className="rounded-xl border p-3"><p className="text-[11px] text-muted-foreground">{k}</p><p className="font-semibold">{v || <span className="text-warning-foreground">Manquant</span>}</p></div>)}
            </div>
          ) : <EmptyState icon={<FileText />} title="Pas encore d'informations" desc="Les réponses au formulaire apparaîtront ici." />}
        </TabsContent>
        <TabsContent value="docs" className="mt-4">
          <div className="card-premium p-5">
            <div className="space-y-2">
              {p.documents.map((d) => <div key={d.name + d.at} className="flex items-center gap-3 rounded-xl border p-3 text-sm"><FileText className="size-4 text-primary" /><span className="flex-1 font-medium">{d.name}</span><span className="text-xs text-muted-foreground">{d.size} · {timeAgo(d.at)}</span></div>)}
              {quotes.map((q) => <Link key={q.id} to="/quotes/$id" params={{ id: q.id }} className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:border-primary"><FileText className="size-4 text-primary" /><span className="flex-1 font-medium">{q.ref}.pdf</span><StatusBadge status={q.status} /></Link>)}
              {!p.documents.length && !quotes.length && <p className="text-sm text-muted-foreground">Aucun document.</p>}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => { actions.updateProspect(p.id, { documents: [...p.documents, { name: `Document_${p.documents.length + 1}.pdf`, size: "640 Ko", at: new Date().toISOString() }] }); toast.success("Document ajouté"); }}><Upload /> Ajouter un document</Button>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <div className="card-premium p-5">
            <ol className="relative space-y-5 border-l pl-6">
              {history.map((a) => <li key={a.id} className="relative"><span className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-card bg-primary" /><p className="text-sm font-semibold">{a.type}</p><p className="text-xs text-muted-foreground">{a.actor} · {a.result} · {timeAgo(a.at)}</p></li>)}
              {!history.length && <p className="text-sm text-muted-foreground">Aucun événement.</p>}
            </ol>
          </div>
        </TabsContent>
      </Tabs>

      <SendFormDialog prospectId={p.id} open={sendOpen} onOpenChange={setSendOpen} />
      <QuoteWorkflowDialog prospectId={p.id} open={quoteOpen} onOpenChange={setQuoteOpen} />
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Modifier le prospect</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid grid-cols-2 gap-3">
              {(["name", "company", "phone", "email", "city"] as const).map((k) => <div key={k} className="space-y-1.5"><Label className="capitalize">{({ name: "Nom", company: "Société", phone: "Téléphone", email: "Email", city: "Ville" })[k]}</Label><Input value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>)}
              <div className="space-y-1.5"><Label>Prestation</Label><Select value={edit.service} onValueChange={(v) => setEdit({ ...edit, service: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="col-span-2 space-y-1.5"><Label>Besoin</Label><Textarea value={edit.need} onChange={(e) => setEdit({ ...edit, need: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setEdit(null)}>Annuler</Button><Button variant="premium" onClick={() => { actions.updateProspect(edit!.id, edit!); actions.log("Prospection", "Fiche prospect modifiée", "Imane El Bijri", edit!.name, "Enregistré"); toast.success("Prospect mis à jour"); setEdit(null); }}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
