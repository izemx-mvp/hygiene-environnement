import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bot, Headphones, Paperclip, Search, Send, Sparkles as Spark, UserPlus, ClipboardList, Play, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { actions, sleep, useStore } from "@/lib/store";
import { Initials, StatusBadge, fmtTime } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendFormDialog } from "@/components/app/SendFormDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/conversations")({
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : undefined }),
  head: () => ({
    meta: [
      { title: "Conversations WhatsApp — HygiEnv.ai" },
      { name: "description", content: "Conversations WhatsApp traitées par l'Agent Service Client IA." },
      { property: "og:title", content: "Conversations WhatsApp — HygiEnv.ai" },
      { property: "og:description", content: "Suivez et reprenez les échanges clients en temps réel." },
    ],
  }),
  component: Conversations,
});

const QUICK = ["Merci, je vous envoie le formulaire.", "Un conseiller vous rappelle aujourd'hui.", "Pouvez-vous préciser la surface ?"];
const SERVICE_KW: [RegExp, string][] = [
  [/form|hse|incendie|secours/i, "Formation HSE"],
  [/environ|déchet|rejet|iso 14001/i, "Audit Environnement"],
  [/conform|iso 45001|réglement/i, "Accompagnement conformité"],
  [/hygi|haccp|onssa|nettoy|cuisine|audit/i, "Audit Hygiène"],
];

function Conversations() {
  const { c: sel } = Route.useSearch();
  const navigate = useNavigate({ from: "/conversations" });
  const convs = useStore((s) => s.conversations);
  const prospects = useStore((s) => s.prospects);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("Toutes");
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const active = convs.find((c) => c.id === sel) ?? convs[0];
  const prospect = prospects.find((p) => p.id === active?.prospectId);

  useEffect(() => { if (active?.unread) actions.readConv(active.id); }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length, typing]);

  const list = convs.filter((c) => (filter === "Toutes" || c.status === filter) && `${c.name} ${c.company}`.toLowerCase().includes(q.toLowerCase()));

  const send = async (msg: string, asClient = false) => {
    if (!msg.trim() || !active) return;
    setText("");
    actions.pushMessage(active.id, asClient ? "client" : active.status === "IA active" ? "agent" : "human", msg);
    if (!asClient) return;
    // simulate AI handling of a client message
    const svc = SERVICE_KW.find(([r]) => r.test(msg))?.[1];
    if (active.status !== "IA active") return;
    setTyping(true);
    await sleep(1300);
    setTyping(false);
    if (svc) {
      actions.setConvIntent(active.id, "Demande de prestation", svc);
      actions.pushMessage(active.id, "agent", `Merci ! J'ai bien identifié un besoin en ${svc}. Je prépare votre dossier et vous envoie un formulaire adapté.`);
      if (!active.prospectId) {
        setAiBusy("Création du prospect...");
        await sleep(1000);
        const p = actions.createProspectFromConv(active.id);
        setAiBusy(null);
        toast.success("Prospect créé automatiquement", { description: `${p.name} — ${svc}` });
      }
    } else {
      actions.pushMessage(active.id, "agent", "Bonne question ! D'après notre base de connaissances : nous intervenons dans tout le Maroc, du lundi au vendredi de 8h30 à 18h. Avez-vous un besoin particulier ?");
    }
  };

  const createProspect = async () => {
    setAiBusy("Analyse en cours...");
    await sleep(700);
    setAiBusy("Détection du besoin...");
    await sleep(700);
    setAiBusy("Création du prospect...");
    await sleep(700);
    const p = actions.createProspectFromConv(active.id);
    setAiBusy(null);
    toast.success("Prospect créé", { description: `${p.name} ajouté à la liste des prospects` });
  };

  if (!active) return null;
  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_320px]">
      {/* list */}
      <div className={cn("card-premium flex min-h-0 flex-col overflow-hidden", sel && "hidden lg:flex")}>
        <div className="space-y-3 border-b p-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="pl-9" /></div>
          <div className="flex gap-1 overflow-x-auto">
            {["Toutes", "IA active", "Humain", "À reprendre", "Résolu"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <button key={c.id} onClick={() => navigate({ search: { c: c.id } })} className={cn("flex w-full gap-3 border-b px-3 py-3 text-left transition hover:bg-accent/50", c.id === active.id && "bg-accent/70")}>
                <Initials name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold">{c.name}</p><span className="text-[10px] text-muted-foreground">{fmtTime(last.at)}</span></div>
                  <p className="truncate text-[11px] font-medium text-primary">{c.company}</p>
                  <div className="mt-0.5 flex items-center gap-2"><p className="flex-1 truncate text-xs text-muted-foreground">{last.text}</p>{c.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.unread}</span>}</div>
                  <StatusBadge status={c.status} className="mt-1.5" />
                </div>
              </button>
            );
          })}
          {!list.length && <p className="p-6 text-center text-sm text-muted-foreground">Aucune conversation</p>}
        </div>
      </div>

      {/* chat */}
      <div className={cn("card-premium flex min-h-0 flex-col overflow-hidden", !sel && "hidden lg:flex")}>
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <button className="text-sm text-primary lg:hidden" onClick={() => navigate({ search: { c: undefined } })}>←</button>
          <Initials name={active.name} />
          <div className="flex-1"><p className="font-semibold">{active.name}</p><p className="text-xs text-muted-foreground">{active.company} · {active.phone}</p></div>
          <StatusBadge status={active.status} />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/40 p-4">
          {active.messages.map((m) => (
            <div key={m.id} className={cn("flex animate-fade-up", m.from === "client" ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-soft", m.from === "client" ? "rounded-bl-md bg-card" : m.from === "agent" ? "rounded-br-md bg-gradient-primary text-primary-foreground" : "rounded-br-md bg-navy text-navy-foreground")}>
                {m.from !== "client" && <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-80">{m.from === "agent" ? <><Bot className="size-3" /> Agent IA</> : <><Headphones className="size-3" /> Imane</>}</p>}
                <p className="whitespace-pre-wrap">{m.text}</p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">{fmtTime(m.at)} {m.from !== "client" && <CheckCheck className="size-3" />}</p>
              </div>
            </div>
          ))}
          {typing && <div className="flex"><div className="flex gap-1 rounded-2xl bg-card px-4 py-3 shadow-soft">{[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />)}</div></div>}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3">
          <div className="mb-2 flex gap-1.5 overflow-x-auto">
            {QUICK.map((qk) => <button key={qk} onClick={() => send(qk)} className="whitespace-nowrap rounded-full border bg-card px-3 py-1 text-xs font-medium transition hover:border-primary hover:text-primary">{qk}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => toast("Pièce jointe", { description: "Sélection de fichier simulée" })}><Paperclip /></Button>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={active.status === "IA active" ? "Répondre en tant qu'Agent IA..." : "Répondre en tant qu'Imane..."} />
            <Button type="button" variant="outline" title="Simuler un message client" onClick={() => send(text || "Bonjour, j'aurais besoin d'une formation incendie pour 12 personnes.", true)}><Play /> <span className="hidden xl:inline">Client</span></Button>
            <Button type="submit" variant="premium" size="icon"><Send /></Button>
          </form>
        </div>
      </div>

      {/* AI context */}
      <div className="card-premium hidden min-h-0 flex-col overflow-y-auto p-4 xl:flex">
        <p className="flex items-center gap-2 text-sm font-semibold"><Spark className="size-4 text-primary" /> Contexte IA</p>
        {aiBusy && <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary animate-shimmer bg-gradient-to-r from-primary/5 via-primary/15 to-primary/5">{aiBusy}</div>}
        <dl className="mt-4 space-y-3 text-sm">
          {[
            ["Intention détectée", active.intent],
            ["Type de demande", active.service ? "Prestation" : "Information"],
            ["Prestation détectée", active.service ?? "—"],
            ["Formulaire associé", prospect?.formId ? "Envoyé" : "—"],
          ].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Prospect lié</dt><dd>{prospect ? <Link to="/prospects/$id" params={{ id: prospect.id }} className="font-semibold text-primary hover:underline">{prospect.name}</Link> : "—"}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Statut dossier</dt><dd>{prospect ? <StatusBadge status={prospect.status} /> : "—"}</dd></div>
        </dl>
        <div className="mt-4 rounded-xl bg-accent/60 p-3 text-xs leading-relaxed">
          <p className="mb-1 font-semibold text-primary">Résumé</p>
          {active.name} ({active.company}) — {active.messages.length} messages. {active.service ? `Besoin identifié : ${active.service}.` : "Questions générales, aucun besoin identifié."}
        </div>
        <div className="mt-auto space-y-2 pt-4">
          <Button className="w-full" variant="premium" disabled={!!active.prospectId || !!aiBusy} onClick={createProspect}><UserPlus /> {active.prospectId ? "Prospect existant" : "Créer prospect"}</Button>
          <Button className="w-full" variant="outline" disabled={!prospect} onClick={() => setFormOpen(true)}><ClipboardList /> Envoyer formulaire</Button>
          {active.status === "Humain" ? (
            <Button className="w-full" variant="soft" onClick={() => { actions.resumeAi(active.id); toast.success("Agent IA réactivé"); }}><Bot /> Rendre la main à l'IA</Button>
          ) : (
            <Button className="w-full" variant="navy" onClick={() => { actions.takeover(active.id); toast.success("Vous avez repris la conversation"); }}><Headphones /> Prise de relais humain</Button>
          )}
        </div>
      </div>
      <SendFormDialog prospectId={prospect?.id ?? null} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
