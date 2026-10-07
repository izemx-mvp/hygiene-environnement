import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookPlus, Eye, Headphones, MessageSquare, CheckCircle2, HelpCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { actions, useStore, uid } from "@/lib/store";
import { PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/service-client")({
  head: () => ({
    meta: [
      { title: "Service Client IA — HygiEnv.ai" },
      { name: "description", content: "Suivi de l'activité de l'Agent Service Client : questions, réponses, escalades." },
      { property: "og:title", content: "Service Client IA — HygiEnv.ai" },
      { property: "og:description", content: "Questions récentes, réponses générées et escalades vers humain." },
    ],
  }),
  component: Page,
});

function Page() {
  const ex = useStore((s) => s.aiExchanges);
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [enrich, setEnrich] = useState<(typeof ex)[number] | null>(null);
  const [ans, setAns] = useState("");
  const list = ex.filter((e) => tab === "all" || (tab === "ok" && e.status === "Répondu") || (tab === "ko" && e.status === "Non résolu") || (tab === "esc" && e.status === "Escaladé"));
  const stats = [
    { l: "Questions récentes", v: ex.length, icon: MessageSquare },
    { l: "Réponses générées", v: ex.filter((e) => e.status === "Répondu").length, icon: CheckCircle2 },
    { l: "Non résolues", v: ex.filter((e) => e.status === "Non résolu").length, icon: HelpCircle },
    { l: "Escalades humain", v: ex.filter((e) => e.status === "Escaladé").length, icon: ArrowUpRight },
  ];
  return (
    <div>
      <PageHeader title="Service Client IA" subtitle="Ce que l'Agent répond à vos clients, et où il a besoin de vous." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card-premium card-hover p-4">
            <s.icon className="size-5 text-primary" />
            <p className="mt-3 font-display text-2xl font-semibold">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">Questions récentes</TabsTrigger>
          <TabsTrigger value="ok">Réponses générées</TabsTrigger>
          <TabsTrigger value="ko">Non résolues</TabsTrigger>
          <TabsTrigger value="esc">Escalades</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4 grid gap-3">
        {list.map((e) => (
          <div key={e.id} className="card-premium card-hover grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <div className="flex items-center gap-2"><p className="font-semibold">{e.contact}</p><StatusBadge status={e.status} /><span className="text-xs text-muted-foreground">{timeAgo(e.date)}</span></div>
              <p className="mt-2 text-sm">« {e.question} »</p>
            </div>
            <div className="rounded-xl bg-accent/50 p-3 text-sm">
              <p>{e.answer}</p>
              <p className="mt-1 text-[11px] font-semibold text-primary">Source : {e.source}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:flex-col">
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/conversations", search: { c: e.convId } })}><Eye /> Voir conversation</Button>
              <Button size="sm" variant="navy" onClick={() => { actions.takeover(e.convId); actions.patchExchange(e.id, { status: "Escaladé" }); toast.success("Vous avez repris la main"); }}><Headphones /> Reprendre la main</Button>
              <Button size="sm" variant="soft" onClick={() => { setEnrich(e); setAns(e.answer); }}><BookPlus /> Enrichir la base</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!enrich} onOpenChange={(o) => !o && setEnrich(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enrichir la base de connaissances</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Question</Label><Input value={enrich?.question ?? ""} readOnly /></div>
            <div className="space-y-1.5"><Label>Réponse validée</Label><Textarea rows={4} value={ans} onChange={(e) => setAns(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEnrich(null)}>Annuler</Button>
            <Button variant="premium" onClick={() => {
              if (!enrich) return;
              actions.upsert("faqs", { id: uid("fq"), question: enrich.question, answer: ans, category: "Général", status: "Actif", date: new Date().toISOString() });
              actions.patchExchange(enrich.id, { status: "Répondu", answer: ans, source: "FAQ · Ajout manuel" });
              toast.success("FAQ ajoutée", { description: "L'Agent utilisera cette réponse." });
              setEnrich(null);
            }}>Ajouter à la FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
