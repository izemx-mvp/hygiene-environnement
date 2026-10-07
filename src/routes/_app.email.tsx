import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Mail, MessageCircle, Plus, Send, StopCircle, Trash2, ArrowDown, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { actions, mad, quoteTotals, uid, useStore } from "@/lib/store";
import { PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailDialog } from "@/components/app/QuoteDialogs";
import type { Reminder } from "@/lib/types";
import { reminderSchedule } from "@/lib/reminders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/email")({
  head: () => ({
    meta: [
      { title: "Envoi email & Relances — HygiEnv.ai" },
      { name: "description", content: "Envoyez vos devis par email et configurez les relances automatiques." },
      { property: "og:title", content: "Envoi email & Relances — HygiEnv.ai" },
      { property: "og:description", content: "Devis à envoyer, relances programmées et configuration des délais." },
    ],
  }),
  component: Page,
});

const ord = (i: number) => (i === 0 ? "l'envoi du devis" : `la relance ${i}`);

function Page() {
  const quotes = useStore((s) => s.quotes);
  const acts = useStore((s) => s.activities);
  const stored = useStore((s) => s.reminders);
  const autoStop = useStore((s) => s.autoStop);
  const stopped = useStore((s) => s.stoppedSequences);
  const [mail, setMail] = useState<string | null>(null);
  const [rem, setRem] = useState<Reminder[]>(stored);
  const [dirty, setDirty] = useState(false);
  const toSend = quotes.filter((q) => ["Validé", "À valider", "Modifié", "Brouillon"].includes(q.status));
  const sentQuotes = quotes.filter((q) => q.status === "Envoyé");
  const sent = acts.filter((a) => a.category === "Email");
  const schedule = reminderSchedule(rem);

  const up = (id: string, p: Partial<Reminder>) => { setRem(rem.map((r) => (r.id === id ? { ...r, ...p } : r))); setDirty(true); };
  const save = () => { actions.setReminders(rem); setDirty(false); toast.success("Relances enregistrées", { description: schedule.filter((s) => s.enabled).map((s) => `J+${s.day}`).join(" · ") || "Aucune relance active" }); };

  return (
    <div>
      <PageHeader title="Envoi email & Relances" subtitle="Envoyez les devis et programmez les relances jusqu'à la réponse du client." />
      <Tabs defaultValue="relances">
        <TabsList><TabsTrigger value="relances">Configuration des relances</TabsTrigger><TabsTrigger value="sequences">Relances programmées ({sentQuotes.length})</TabsTrigger><TabsTrigger value="send">Envois</TabsTrigger></TabsList>

        <TabsContent value="relances" className="mt-4 grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="card-premium flex items-center gap-4 p-5">
              <div className="grid size-10 place-items-center rounded-xl bg-accent text-primary"><StopCircle className="size-5" /></div>
              <div className="flex-1">
                <p className="font-semibold">Arrêter automatiquement les relances lorsque le devis est validé</p>
                <p className="text-xs text-muted-foreground">Les relances s'arrêtent aussi toujours si le devis est accepté, refusé, remplacé par une nouvelle version, ou arrêté manuellement.</p>
              </div>
              <Switch checked={autoStop} onCheckedChange={(v) => { actions.setAutoStop(v); toast.success(v ? "Arrêt automatique activé" : "Arrêt automatique désactivé"); }} />
            </div>

            {rem.map((r, i) => (
              <div key={r.id} className={cn("card-premium animate-fade-up p-5 transition", !r.enabled && "opacity-60")}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">R{i + 1}</span>
                  <p className="font-semibold">Relance {i + 1}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Input type="number" min={1} value={r.days} onChange={(e) => up(r.id, { days: Math.max(1, Math.round(+e.target.value) || 1) })} className="h-9 w-20 text-center font-semibold" aria-label={`Jours relance ${i + 1}`} />
                    <span className="text-muted-foreground">jours après {ord(i)}</span>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">J+{schedule[i].day}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Select value={r.channel} onValueChange={(v) => up(r.id, { channel: v as Reminder["channel"] })}>
                      <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Email">Email</SelectItem><SelectItem value="WhatsApp">WhatsApp</SelectItem></SelectContent>
                    </Select>
                    <Switch checked={r.enabled} onCheckedChange={(v) => up(r.id, { enabled: v })} aria-label="Activer" />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { setRem(rem.filter((x) => x.id !== r.id)); setDirty(true); }} aria-label="Supprimer"><Trash2 /></Button>
                  </div>
                </div>
                <Textarea rows={2} className="mt-3" value={r.message} onChange={(e) => up(r.id, { message: e.target.value })} />
                <p className="mt-1 text-[11px] text-muted-foreground">Variables : {"{prénom}"}, {"{référence}"}, {"{montant}"}</p>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button variant="soft" onClick={() => { setRem([...rem, { id: uid("rm"), days: 7, enabled: true, channel: "Email", message: "Bonjour {prénom}, je me permets de revenir vers vous concernant le devis {référence}." }]); setDirty(true); }}><Plus /> Ajouter une relance</Button>
              <Button variant="premium" onClick={save} disabled={!dirty}><Save /> Enregistrer</Button>
              {dirty && <span className="self-center text-xs font-semibold text-warning-foreground">● Modifications non enregistrées</span>}
            </div>
          </div>

          <div className="card-premium h-fit p-5 xl:sticky xl:top-24">
            <p className="mb-4 flex items-center gap-2 font-semibold"><BellRing className="size-4 text-primary" /> Prévisualisation</p>
            <div className="flex flex-col items-center gap-1">
              <div className="w-full rounded-xl bg-gradient-navy px-4 py-3 text-center text-sm font-semibold text-navy-foreground"><Send className="mr-1.5 inline size-4" />Devis envoyé · J0</div>
              {schedule.map((s, i) => (
                <div key={rem[i].id} className="flex w-full flex-col items-center gap-1">
                  <ArrowDown className="size-4 text-primary/60" />
                  <div key={s.day} className={cn("flex w-full animate-fade-up items-center gap-2 rounded-xl border px-4 py-3 text-sm", s.enabled ? "border-primary/30 bg-accent/50" : "border-dashed text-muted-foreground line-through")}>
                    <b className="text-primary">J+{s.day}</b> — Relance {i + 1}
                    <span className="ml-auto">{rem[i].channel === "Email" ? <Mail className="size-4" /> : <MessageCircle className="size-4" />}</span>
                  </div>
                </div>
              ))}
              <ArrowDown className="size-4 text-primary/60" />
              <div className="w-full rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-center text-xs font-semibold text-success"><CheckCircle2 className="mr-1 inline size-3.5" />Arrêt dès validation / acceptation / refus</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="mt-4">
          <div className="card-premium divide-y">
            {!sentQuotes.length && <p className="p-6 text-center text-sm text-muted-foreground">Aucun devis en attente de réponse.</p>}
            {sentQuotes.map((q) => {
              const isStopped = stopped.includes(q.id);
              const sentAt = new Date(q.date).getTime();
              return (
                <div key={q.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                  <div className="min-w-48"><p className="font-semibold text-primary">{q.ref}</p><p className="text-xs text-muted-foreground">{q.company} · {mad(quoteTotals(q).ttc)}</p></div>
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {reminderSchedule(stored).filter((s) => s.enabled).map((s, i) => {
                      const due = sentAt + s.day * 86400000;
                      const past = due < Date.now();
                      return <span key={i} className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", isStopped ? "bg-muted text-muted-foreground line-through" : past ? "bg-success/12 text-success" : "bg-accent text-primary")}>R{i + 1} · J+{s.day} · {new Date(due).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}{past && !isStopped ? " ✓" : ""}</span>;
                    })}
                  </div>
                  {isStopped ? <StatusBadge status="Archivé" /> : <Button size="sm" variant="outline" onClick={() => { actions.stopSequence(q.id, "arrêt manuel"); toast.success("Séquence de relances arrêtée", { description: q.ref }); }}><StopCircle /> Arrêter la séquence</Button>}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="send" className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="card-premium p-5">
            <h3 className="mb-3 font-semibold">À envoyer ({toSend.length})</h3>
            <div className="space-y-2">
              {toSend.map((q) => (
                <div key={q.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <div className="flex-1"><p className="text-sm font-semibold">{q.ref} · {q.company}</p><p className="text-xs text-muted-foreground">{q.email} · {mad(quoteTotals(q).ttc)}</p></div>
                  <StatusBadge status={q.status} />
                  <Button size="sm" variant="premium" onClick={() => setMail(q.id)}><Send /> Envoyer</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="card-premium p-5">
            <h3 className="mb-3 font-semibold">Historique email & relances</h3>
            <div className="space-y-2">
              {sent.slice(0, 14).map((a) => <div key={a.id} className="flex items-center gap-3 border-b py-2 text-sm"><Mail className="size-4 text-primary" /><span className="flex-1"><b className="font-medium">{a.type}</b> · {a.result} <span className="text-muted-foreground">· {a.prospect}</span></span><span className="text-xs text-muted-foreground">{timeAgo(a.at)}</span></div>)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <EmailDialog quoteId={mail} open={!!mail} onOpenChange={(o) => !o && setMail(null)} />
    </div>
  );
}
