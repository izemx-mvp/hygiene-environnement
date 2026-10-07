import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, ClipboardList, FileText, Mail, MessageCircle, Search, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, fmtTime, timeAgo } from "@/components/app/bits";
import { Input } from "@/components/ui/input";
import type { ActivityCat } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({
    meta: [
      { title: "Activité — HygiEnv.ai" },
      { name: "description", content: "Timeline globale des actions des agents IA et de l'équipe." },
      { property: "og:title", content: "Activité — HygiEnv.ai" },
      { property: "og:description", content: "Conversations, prospection, formulaires, devis et emails." },
    ],
  }),
  component: Page,
});

const CATS: { c: ActivityCat; icon: typeof Bot }[] = [
  { c: "Conversations", icon: MessageCircle }, { c: "Prospection", icon: Users }, { c: "Formulaires", icon: ClipboardList },
  { c: "Devis", icon: FileText }, { c: "IA", icon: Bot }, { c: "Email", icon: Mail },
];

function Page() {
  const acts = useStore((s) => s.activities);
  const [on, setOn] = useState<ActivityCat[]>([]);
  const [q, setQ] = useState("");
  const list = acts.filter((a) => (!on.length || on.includes(a.category)) && `${a.type} ${a.prospect} ${a.actor}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Activité" subtitle={`${list.length} événements`} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {CATS.map(({ c, icon: I }) => { const a = on.includes(c); return <button key={c} onClick={() => setOn(a ? on.filter((x) => x !== c) : [...on, c])} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition", a ? "bg-primary text-primary-foreground shadow-glow" : "bg-card ring-1 ring-border hover:ring-primary/40")}><I className="size-3.5" />{c}</button>; })}
        <div className="relative ml-auto w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." /></div>
      </div>
      <div className="card-premium p-6">
        <ol className="relative space-y-1 border-l border-primary/20 pl-8">
          {list.map((a) => { const I = CATS.find((x) => x.c === a.category)!.icon; return (
            <li key={a.id} className="relative animate-fade-up rounded-xl p-3 transition hover:bg-accent/40">
              <span className="absolute -left-[45px] top-3 grid size-7 place-items-center rounded-full border-4 border-card bg-gradient-primary text-primary-foreground"><I className="size-3" /></span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="w-12 text-xs font-bold text-primary">{fmtTime(a.at)}</span>
                <p className="text-sm font-semibold">{a.type}</p>
                <span className="rounded-full bg-muted px-2 text-[10px] font-semibold text-muted-foreground">{a.category}</span>
                <span className="ml-auto text-xs text-muted-foreground">{timeAgo(a.at)}</span>
              </div>
              <p className="ml-15 mt-0.5 pl-15 text-xs text-muted-foreground" style={{ paddingLeft: 60 }}>{a.actor} · {a.prospect} · <span className="text-foreground">{a.result}</span></p>
            </li>); })}
        </ol>
      </div>
    </div>
  );
}
