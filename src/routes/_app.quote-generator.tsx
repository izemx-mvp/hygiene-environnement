import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, CheckCircle2, Copy, FlaskConical, MessageCircle, Pencil, Plus, Save, Trash2, X, AlertTriangle, ListChecks, Target, Check } from "lucide-react";
import { toast } from "sonner";
import { actions, mad, uid, useStore } from "@/lib/store";
import { AiSteps, PageHeader } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { QuoteRule } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/quote-generator")({
  head: () => ({
    meta: [
      { title: "Configuration Générateur de Devis IA — HygiEnv.ai" },
      { name: "description", content: "Paramétrez les règles que l'Agent IA WhatsApp applique pour générer les devis par prestation." },
      { property: "og:title", content: "Configuration Générateur de Devis IA — HygiEnv.ai" },
      { property: "og:description", content: "Règles de génération de devis par prestation, pilotées par l'Agent IA." },
    ],
  }),
  component: Page,
});

const CALC: QuoteRule["calcMode"][] = ["Forfait", "Par unité", "Par site", "Par participant", "Par jour"];

function TagField({ label, values, onChange, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (t && !values.includes(t)) onChange([...values, t]); setV(""); };
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border bg-card p-1.5">
        {values.map((t) => (
          <span key={t} className="flex animate-fade-up items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
            {t}<button onClick={() => onChange(values.filter((x) => x !== t))} className="hover:text-destructive" aria-label={`Retirer ${t}`}><X className="size-3" /></button>
          </span>
        ))}
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} onBlur={add} placeholder="Ajouter + Entrée" className="min-w-28 flex-1 bg-transparent px-1.5 text-sm outline-none" />
      </div>
    </div>
  );
}

const blank = (formId: string): QuoteRule => ({
  id: uid("r"), service: "Nouvelle prestation", formId, requiredFields: [], fromProspect: ["Nom", "Société", "Email"], fromForm: [], askIfMissing: [],
  calcMode: "Forfait", quantity: "1", unit: "forfait", unitPrice: 0, tva: 20, discountAllowed: false, maxDiscount: 0,
  paymentTerms: "50% à la commande.", validity: "30 jours", delay: "15 jours ouvrés", mentions: "", notes: "", template: "Moderne",
  instructions: ["Ne jamais inventer un prix.", "Si une donnée obligatoire manque, ne pas générer le devis."],
});

function Page() {
  const rules = useStore((s) => s.quoteRules);
  const forms = useStore((s) => s.forms);
  const prospects = useStore((s) => s.prospects);
  const [selId, setSelId] = useState(rules[0]?.id ?? "");
  const stored = rules.find((r) => r.id === selId);
  const [r, setR] = useState<QuoteRule | null>(stored ?? null);
  const [dirty, setDirty] = useState(false);
  const [instr, setInstr] = useState<{ i: number; text: string } | null>(null);
  const [del, setDel] = useState(false);
  const [test, setTest] = useState<{ pid: string; running: boolean; done: boolean } | null>(null);

  useEffect(() => { setR(stored ?? null); setDirty(false); }, [selId]); // eslint-disable-line react-hooks/exhaustive-deps

  const up = (p: Partial<QuoteRule>) => { if (r) { setR({ ...r, ...p }); setDirty(true); } };
  const save = () => { if (!r) return; if (!r.service.trim()) return toast.error("Nom de la prestation requis"); actions.upsert("quoteRules", r); setDirty(false); toast.success("Configuration enregistrée", { description: `L'Agent IA appliquera ces règles pour « ${r.service} »` }); };
  const addRule = () => { const n = blank(forms[0]?.id ?? ""); actions.upsert("quoteRules", n); setSelId(n.id); toast.success("Nouvelle configuration créée"); };
  const duplicate = () => { if (!r) return; const n = { ...r, id: uid("r"), service: `${r.service} (copie)`, instructions: [...r.instructions] }; actions.upsert("quoteRules", n); setSelId(n.id); toast.success("Configuration dupliquée"); };
  const saveInstr = () => {
    if (!r || !instr || !instr.text.trim()) return toast.error("La règle ne peut pas être vide");
    const list = [...r.instructions];
    if (instr.i < 0) list.push(instr.text.trim()); else list[instr.i] = instr.text.trim();
    up({ instructions: list }); setInstr(null);
    toast.success(instr.i < 0 ? "Règle ajoutée" : "Règle modifiée");
  };

  // test simulation
  const candidates = r ? prospects.filter((p) => p.service === r.service) : [];
  const tp = prospects.find((p) => p.id === test?.pid);
  const data: Record<string, string> = tp ? { Nom: tp.name, Société: tp.company, Email: tp.email, Ville: tp.city, ...(tp.collected ?? {}), ...(tp.need ? { Besoin: tp.need } : {}) } : {};
  const missing = r ? [...r.requiredFields.filter((f) => !data[f]?.trim()), ...r.askIfMissing.filter((f) => !data[f]?.trim())] : [];
  const blocking = r ? r.requiredFields.filter((f) => !data[f]?.trim()) : [];
  const qtyGuess = r?.calcMode === "Forfait" ? 1 : parseInt(data["Surface / participants"] ?? "") && r?.calcMode === "Par participant" ? parseInt(data["Surface / participants"]) : 1;
  const ht = r ? qtyGuess * r.unitPrice : 0;

  if (!r) return null;
  return (
    <div>
      <PageHeader
        title="Configuration du Générateur de Devis IA"
        subtitle="Définissez les règles que l'Agent IA WhatsApp applique lorsqu'un collaborateur lui demande un devis."
        actions={<>
          <Button variant="outline" onClick={addRule}><Plus /> Ajouter une règle</Button>
          <Button variant="outline" onClick={duplicate}><Copy /> Dupliquer une configuration</Button>
          <Button variant="soft" onClick={() => { setTest({ pid: candidates[0]?.id ?? prospects[0].id, running: false, done: false }); }}><FlaskConical /> Tester la règle</Button>
          <Button variant="premium" onClick={save}><Save /> Enregistrer</Button>
        </>}
      />

      <div className="card-premium mb-6 flex flex-col gap-4 border-primary/20 bg-gradient-to-r from-accent to-card p-5 md:flex-row md:items-center">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy text-primary-glow animate-pulse-ring"><Bot /></div>
        <div className="flex-1">
          <p className="font-semibold">Les devis sont générés uniquement par l'Agent IA, sur WhatsApp</p>
          <p className="text-sm text-muted-foreground">Le collaborateur écrit à l'Agent : <i>« Génère le devis pour Karim Benali. »</i> L'Agent identifie le prospect, récupère la prestation, le formulaire et ces règles, vérifie les champs obligatoires, demande ce qui manque, calcule puis génère le devis.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-xs font-semibold shadow-soft"><MessageCircle className="size-4 text-success" /> Canal WhatsApp actif</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="card-premium h-fit p-3">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Configurations par prestation</p>
          <div className="space-y-1">
            {rules.map((x) => (
              <button key={x.id} onClick={() => { if (dirty && !confirm("Modifications non enregistrées. Continuer ?")) return; setSelId(x.id); }}
                className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition", x.id === selId ? "bg-accent font-semibold text-primary shadow-glow" : "hover:bg-muted")}>
                <ListChecks className="size-4 shrink-0" />
                <span className="flex-1 truncate">{x.service}</span>
                <span className="text-[10px] text-muted-foreground">{x.instructions.length} règles</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={addRule}><Plus /> Ajouter une prestation</Button>
        </div>

        <div className="card-premium p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input value={r.service} onChange={(e) => up({ service: e.target.value })} className="h-11 max-w-sm font-display text-lg font-semibold" />
            <span className={cn("text-xs font-semibold", dirty ? "text-warning-foreground" : "text-success")}>{dirty ? "● Modifications non enregistrées" : "✓ Enregistré"}</span>
            <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => setDel(true)}><Trash2 /> Supprimer</Button>
          </div>

          <Accordion type="multiple" defaultValue={["data", "calc", "instr"]}>
            <AccordionItem value="data">
              <AccordionTrigger>Données nécessaires</AccordionTrigger>
              <AccordionContent className="grid gap-4 p-1 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Formulaire associé</Label>
                  <Select value={r.formId} onValueChange={(v) => up({ formId: v })}><SelectTrigger><SelectValue>{forms.find((f) => f.id === r.formId)?.name ?? "—"}</SelectValue></SelectTrigger><SelectContent>{forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>
                </div>
                <TagField label="Champs obligatoires avant génération" values={r.requiredFields} onChange={(v) => up({ requiredFields: v })} hint="Sans eux, l'Agent ne génère pas le devis." />
                <TagField label="Informations depuis la fiche prospect" values={r.fromProspect} onChange={(v) => up({ fromProspect: v })} />
                <TagField label="Informations depuis le formulaire" values={r.fromForm} onChange={(v) => up({ fromForm: v })} />
                <div className="md:col-span-2"><TagField label="Informations complémentaires à demander si elles manquent" values={r.askIfMissing} onChange={(v) => up({ askIfMissing: v })} /></div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="calc">
              <AccordionTrigger>Calcul & tarification</AccordionTrigger>
              <AccordionContent className="grid gap-4 p-1 md:grid-cols-3">
                <div className="space-y-1.5"><Label>Mode de calcul</Label><Select value={r.calcMode} onValueChange={(v) => up({ calcMode: v as QuoteRule["calcMode"] })}><SelectTrigger><SelectValue>{r.calcMode}</SelectValue></SelectTrigger><SelectContent>{CALC.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Quantité</Label><Input value={r.quantity} onChange={(e) => up({ quantity: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Unité</Label><Input value={r.unit} onChange={(e) => up({ unit: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Prix unitaire HT (MAD)</Label><Input type="number" min={0} value={r.unitPrice} onChange={(e) => up({ unitPrice: Math.max(0, +e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>TVA (%)</Label><Input type="number" min={0} value={r.tva} onChange={(e) => up({ tva: Math.max(0, +e.target.value) })} /></div>
                <div className="space-y-1.5">
                  <Label>Remise</Label>
                  <div className="flex h-9 items-center gap-3 rounded-md border px-3">
                    <Switch checked={r.discountAllowed} onCheckedChange={(v) => up({ discountAllowed: v, maxDiscount: v ? r.maxDiscount || 5 : 0 })} />
                    <span className="text-sm">{r.discountAllowed ? "Autorisée, max" : "Non autorisée"}</span>
                    {r.discountAllowed && <input type="number" min={0} max={100} value={r.maxDiscount} onChange={(e) => up({ maxDiscount: Math.min(100, Math.max(0, +e.target.value)) })} className="w-12 bg-transparent text-sm font-semibold outline-none" />}
                    {r.discountAllowed && <span className="text-sm">%</span>}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="terms">
              <AccordionTrigger>Conditions, mentions & template</AccordionTrigger>
              <AccordionContent className="grid gap-4 p-1 md:grid-cols-3">
                <div className="space-y-1.5 md:col-span-3"><Label>Conditions de paiement</Label><Input value={r.paymentTerms} onChange={(e) => up({ paymentTerms: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Durée de validité</Label><Input value={r.validity} onChange={(e) => up({ validity: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Délais</Label><Input value={r.delay} onChange={(e) => up({ delay: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Template de devis</Label><Select value={r.template} onValueChange={(v) => up({ template: v })}><SelectTrigger><SelectValue>{r.template}</SelectValue></SelectTrigger><SelectContent>{["Moderne", "Classique", "Minimal"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5 md:col-span-3"><Label>Mentions obligatoires</Label><Textarea rows={2} value={r.mentions} onChange={(e) => up({ mentions: e.target.value })} /></div>
                <div className="space-y-1.5 md:col-span-3"><Label>Notes à afficher</Label><Textarea rows={2} value={r.notes} onChange={(e) => up({ notes: e.target.value })} /></div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="instr">
              <AccordionTrigger>Instructions de l'Agent IA</AccordionTrigger>
              <AccordionContent className="space-y-2 p-1">
                <p className="text-xs text-muted-foreground">Règles métier en langage naturel, appliquées dans l'ordre par l'Agent.</p>
                {r.instructions.map((t, i) => (
                  <div key={i + t} className="group flex animate-fade-up items-start gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/40">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                    <p className="flex-1 text-sm">{t}</p>
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => setInstr({ i, text: t })} aria-label="Modifier"><Pencil /></Button>
                    <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => { up({ instructions: r.instructions.filter((_, k) => k !== i) }); toast.success("Règle supprimée"); }} aria-label="Supprimer"><Trash2 /></Button>
                  </div>
                ))}
                <Button variant="soft" size="sm" onClick={() => setInstr({ i: -1, text: "" })}><Plus /> Ajouter une règle</Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Dialog open={!!instr} onOpenChange={(o) => !o && setInstr(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{instr?.i === -1 ? "Ajouter une règle" : "Modifier la règle"}</DialogTitle><DialogDescription>Écrivez la consigne comme vous l'expliqueriez à un collègue.</DialogDescription></DialogHeader>
          <Textarea rows={4} autoFocus value={instr?.text ?? ""} onChange={(e) => instr && setInstr({ ...instr, text: e.target.value })} placeholder="Ex. Pour un audit avec plusieurs sites, créer une ligne par site." />
          <DialogFooter><Button variant="ghost" onClick={() => setInstr(null)}>Annuler</Button><Button variant="premium" onClick={saveInstr}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={del} onOpenChange={setDel}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer « {r.service} » ?</DialogTitle><DialogDescription>L'Agent IA ne pourra plus générer de devis pour cette prestation.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="ghost" onClick={() => setDel(false)}>Annuler</Button><Button variant="destructive" disabled={rules.length <= 1} onClick={() => { actions.remove("quoteRules", r.id); setSelId(rules.find((x) => x.id !== r.id)!.id); setDel(false); toast.success("Configuration supprimée"); }}>Supprimer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!test} onOpenChange={(o) => !o && setTest(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FlaskConical className="size-5 text-primary" /> Tester la règle — {r.service}</DialogTitle><DialogDescription>Simulation sur un dossier existant. Aucun devis n'est créé.</DialogDescription></DialogHeader>
          {test && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={test.pid} onValueChange={(v) => setTest({ pid: v, running: false, done: false })}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{(candidates.length ? candidates : prospects).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.company} ({p.status})</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="premium" disabled={test.running} onClick={() => setTest({ ...test, running: true, done: false })}><FlaskConical /> Lancer</Button>
              </div>
              {test.running && !test.done && (
                <AiSteps steps={["Identification du prospect", "Lecture du formulaire", "Vérification des champs obligatoires", "Application des règles métier", "Calcul du résultat attendu"]} stepMs={450} onDone={() => setTest((t) => t && { ...t, done: true })} />
              )}
              {test.done && tp && (
                <div className="grid animate-fade-up gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><CheckCircle2 className="size-4 text-success" /> Données détectées</p>
                    <div className="space-y-1 text-xs">{[...r.fromProspect, ...r.fromForm, ...r.requiredFields].filter((k, i, a) => a.indexOf(k) === i && data[k]).map((k) => <div key={k} className="flex justify-between gap-2"><span className="text-muted-foreground">{k}</span><span className="truncate text-right font-medium">{data[k]}</span></div>)}</div>
                  </div>
                  <div className={cn("rounded-2xl border p-4", missing.length ? "border-warning/40 bg-warning/5" : "border-success/30 bg-success/5")}>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><AlertTriangle className="size-4 text-warning-foreground" /> Informations manquantes</p>
                    {missing.length ? <ul className="space-y-1 text-xs">{missing.map((m) => <li key={m}>• {m} {blocking.includes(m) ? <b className="text-destructive">(bloquant)</b> : <span className="text-muted-foreground">(à demander)</span>}</li>)}</ul> : <p className="text-xs text-success">Aucune — dossier complet.</p>}
                  </div>
                  <div className="rounded-2xl border p-4 md:col-span-2">
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><ListChecks className="size-4 text-primary" /> Règles appliquées</p>
                    <ul className="space-y-1 text-xs">{r.instructions.map((t, i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-3 shrink-0 text-success" />{t}</li>)}<li className="flex gap-2"><Check className="mt-0.5 size-3 shrink-0 text-success" />Mode {r.calcMode.toLowerCase()} · TVA {r.tva}% · {r.discountAllowed ? `remise max ${r.maxDiscount}%` : "sans remise"} · template {r.template}</li></ul>
                  </div>
                  <div className={cn("rounded-2xl p-4 md:col-span-2", blocking.length ? "bg-destructive/5 ring-1 ring-destructive/20" : "bg-gradient-navy text-navy-foreground")}>
                    <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold"><Target className="size-4" /> Résultat attendu</p>
                    {blocking.length ? (
                      <p className="text-sm">Devis <b>non généré</b>. L'Agent répondra sur WhatsApp : « Il me manque : {blocking.join(", ")}. Pouvez-vous me les communiquer ? »</p>
                    ) : (
                      <p className="text-sm">Devis généré pour <b>{tp.company}</b> : {qtyGuess} × {r.unit} à {mad(r.unitPrice)} → <b>{mad(ht)} HT</b> · <b>{mad(ht * (1 + r.tva / 100))} TTC</b>. Validité {r.validity}, délai {r.delay}.{missing.length ? ` L'Agent demandera aussi : ${missing.join(", ")}.` : ""}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
