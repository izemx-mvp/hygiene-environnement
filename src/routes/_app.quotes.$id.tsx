import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Mail, Plus, RefreshCw, Save, Sparkles as Spark, Trash2, Droplets, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { actions, mad, quoteTotals, sleep, uid, useStore } from "@/lib/store";
import { SERVICES } from "@/lib/mock";
import { EmptyState, StatusBadge, fmtDate } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmailDialog } from "@/components/app/QuoteDialogs";
import { downloadQuotePdf } from "@/lib/pdf";
import type { Quote } from "@/lib/types";

export const Route = createFileRoute("/_app/quotes/$id")({
  head: () => ({
    meta: [
      { title: "Éditeur de devis — HygiEnv.ai" },
      { name: "description", content: "Modifiez, validez, téléchargez et envoyez votre devis." },
      { property: "og:title", content: "Éditeur de devis — HygiEnv.ai" },
      { property: "og:description", content: "Édition avec aperçu live et calculs automatiques." },
    ],
  }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const stored = useStore((s) => s.quotes.find((q) => q.id === id));
  const services = useStore((s) => s.services);
  const company = useStore((s) => s.company);
  const navigate = useNavigate();
  const [q, setQ] = useState<Quote | null>(stored ?? null);
  const [mail, setMail] = useState(false);
  const [ai, setAi] = useState(false);
  const [calc, setCalc] = useState(false);
  useEffect(() => { if (stored) setQ((cur) => (cur && cur.id === stored.id ? { ...cur, status: stored.status } : stored)); }, [stored?.id, stored?.status]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!q) return <EmptyState icon={<Droplets />} title="Devis introuvable" desc="Ce devis n'existe plus." />;

  const t = quoteTotals(q);
  const up = (p: Partial<Quote>) => setQ({ ...q, ...p });
  const line = (lid: string, p: Partial<Quote["lines"][number]>) => up({ lines: q.lines.map((l) => (l.id === lid ? { ...l, ...p } : l)) });
  const genAi = async () => {
    setAi(true);
    await sleep(1600);
    const svc = services.find((s) => s.name === q.service)!;
    up({
      lines: [
        { id: uid("l"), desc: `${svc.name} — ${svc.unit}`, qty: q.service === "Formation HSE" ? 12 : 2, price: svc.basePrice },
        { id: uid("l"), desc: "Préparation & analyse documentaire", qty: 1, price: 1800 },
        { id: uid("l"), desc: "Rapport détaillé & plan d'action", qty: 1, price: 2500 },
        { id: uid("l"), desc: "Restitution aux équipes (visio)", qty: 1, price: 900 },
      ],
      notes: `Proposition optimisée par l'IA selon le dossier de ${q.company}.`,
    });
    setAi(false);
    toast.success("Lignes générées par l'IA");
  };
  const save = (status?: Quote["status"]) => { actions.saveQuote(q, status); toast.success(status === "Validé" ? `${q.ref} validé` : "Devis enregistré"); };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{q.ref}</h1><StatusBadge status={q.status} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/quotes" })}>Retour</Button>
          <Button variant="outline" onClick={genAi} disabled={ai}>{ai ? <Loader2 className="animate-spin" /> : <Spark />} Générer avec IA</Button>
          <Button variant="outline" onClick={async () => { setCalc(true); await sleep(500); setCalc(false); toast.success("Montants recalculés", { description: `${mad(t.ttc)} TTC` }); }}><RefreshCw className={calc ? "animate-spin" : ""} /> Recalculer</Button>
          <Button variant="outline" onClick={() => save()}><Save /> Enregistrer</Button>
          <Button variant="soft" onClick={() => save("Validé")}><CheckCircle2 /> Valider</Button>
          <Button variant="outline" onClick={() => { downloadQuotePdf(q, company); toast.success("PDF prêt", { description: `${q.ref}.pdf` }); }}><Download /> PDF</Button>
          <Button variant="premium" onClick={() => { actions.saveQuote(q, q.status); setMail(true); }}><Mail /> Envoyer par email</Button>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card-premium p-5">
          <Accordion type="multiple" defaultValue={["client", "lines", "terms"]}>
            <AccordionItem value="client">
              <AccordionTrigger>Client & prestation</AccordionTrigger>
              <AccordionContent className="grid grid-cols-2 gap-3 p-1">
                <div className="space-y-1.5"><Label>Client</Label><Input value={q.client} onChange={(e) => up({ client: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Société</Label><Input value={q.company} onChange={(e) => up({ company: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input value={q.email} onChange={(e) => up({ email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Prestation</Label><Select value={q.service} onValueChange={(v) => up({ service: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="lines">
              <AccordionTrigger>Lignes du devis</AccordionTrigger>
              <AccordionContent className="space-y-2 p-1">
                <div className="grid grid-cols-[1fr_70px_110px_32px] gap-2 text-[11px] font-semibold text-muted-foreground"><span>Description</span><span>Qté</span><span>Prix unit.</span><span /></div>
                {q.lines.map((l) => (
                  <div key={l.id} className={`grid grid-cols-[1fr_70px_110px_32px] gap-2 ${ai ? "animate-pulse" : "animate-fade-up"}`}>
                    <Input value={l.desc} onChange={(e) => line(l.id, { desc: e.target.value })} />
                    <Input type="number" min={0} value={l.qty} onChange={(e) => line(l.id, { qty: Math.max(0, +e.target.value) })} />
                    <Input type="number" min={0} value={l.price} onChange={(e) => line(l.id, { price: Math.max(0, +e.target.value) })} />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => up({ lines: q.lines.filter((x) => x.id !== l.id) })}><Trash2 /></Button>
                  </div>
                ))}
                <Button variant="soft" size="sm" onClick={() => up({ lines: [...q.lines, { id: uid("l"), desc: "Nouvelle ligne", qty: 1, price: 0 }] })}><Plus /> Ajouter une ligne</Button>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5"><Label>Remise (%)</Label><Input type="number" min={0} max={100} value={q.discount} onChange={(e) => up({ discount: Math.min(100, Math.max(0, +e.target.value)) })} /></div>
                  <div className="space-y-1.5"><Label>TVA (%)</Label><Input type="number" min={0} value={q.tva} onChange={(e) => up({ tva: Math.max(0, +e.target.value) })} /></div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="terms">
              <AccordionTrigger>Conditions</AccordionTrigger>
              <AccordionContent className="grid grid-cols-2 gap-3 p-1">
                <div className="col-span-2 space-y-1.5"><Label>Conditions de paiement</Label><Input value={q.conditions} onChange={(e) => up({ conditions: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Délai</Label><Input value={q.delay} onChange={(e) => up({ delay: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Validité</Label><Input value={q.validity} onChange={(e) => up({ validity: e.target.value })} /></div>
                <div className="col-span-2 space-y-1.5"><Label>Remarques</Label><Textarea value={q.notes} onChange={(e) => up({ notes: e.target.value })} /></div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* live preview */}
        <div className="xl:sticky xl:top-24 xl:h-fit">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-lift">
            <div className="bg-gradient-navy p-6 text-navy-foreground">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-xl bg-gradient-primary"><Droplets className="size-4" /></div><div><p className="font-display font-semibold">{company.name}</p><p className="text-[11px] opacity-70">{company.address}</p></div></div>
                <div className="text-right"><p className="font-display text-2xl font-semibold text-primary-glow">DEVIS</p><p className="text-xs opacity-80">{q.ref} · {fmtDate(q.date)}</p></div>
              </div>
            </div>
            <div className="p-6 text-sm">
              <div className="flex justify-between"><div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Client</p><p className="font-semibold">{q.client}</p><p>{q.company}</p><p className="text-muted-foreground">{q.email}</p></div><div className="text-right"><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Prestation</p><p className="font-semibold text-primary">{q.service}</p></div></div>
              <table className="mt-5 w-full">
                <thead><tr className="border-b text-left text-[11px] uppercase text-muted-foreground"><th className="py-2">Description</th><th className="text-right">Qté</th><th className="text-right">P.U.</th><th className="text-right">Total</th></tr></thead>
                <tbody>{q.lines.map((l) => <tr key={l.id} className="border-b"><td className="py-2">{l.desc}</td><td className="text-right">{l.qty}</td><td className="whitespace-nowrap text-right">{mad(l.price)}</td><td className="whitespace-nowrap text-right font-medium">{mad(l.qty * l.price)}</td></tr>)}</tbody>
              </table>
              <div className="ml-auto mt-4 w-64 space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{mad(t.sub)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Remise ({q.discount}%)</span><span>-{mad(t.disc)}</span></div>
                <div className="flex justify-between font-medium"><span>Total HT</span><span>{mad(t.ht)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">TVA ({q.tva}%)</span><span>{mad(t.tva)}</span></div>
                <div key={t.ttc} className="flex animate-fade-up justify-between border-t-2 border-primary pt-2 font-display text-lg font-bold text-primary"><span>Total TTC</span><span>{mad(t.ttc)}</span></div>
              </div>
              <div className="mt-6 rounded-xl bg-muted/60 p-3 text-xs leading-relaxed"><p><b>Conditions :</b> {q.conditions}</p><p><b>Délai :</b> {q.delay} · <b>Validité :</b> {q.validity}</p>{q.notes && <p><b>Remarques :</b> {q.notes}</p>}</div>
            </div>
          </div>
        </div>
      </div>
      <EmailDialog quoteId={q.id} open={mail} onOpenChange={setMail} />
    </div>
  );
}
