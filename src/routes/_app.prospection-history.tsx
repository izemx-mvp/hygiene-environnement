import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, RotateCcw, Tags, Wand } from "lucide-react";
import { toast } from "sonner";
import { actions, sleep, useStore } from "@/lib/store";
import { PageHeader, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Detection } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/prospection-history")({
  head: () => ({
    meta: [
      { title: "Historique & Détection IA — HygiEnv.ai" },
      { name: "description", content: "Comment l'IA détecte les intentions des clients et l'historique de prospection." },
      { property: "og:title", content: "Historique & Détection IA — HygiEnv.ai" },
      { property: "og:description", content: "Analyses d'intention, confiance et actions déclenchées." },
    ],
  }),
  component: Page,
});

const INTENTS: Detection["intent"][] = ["Question générale", "Demande de prestation", "Demande de devis", "Information manquante"];
const tone: Record<string, string> = { "Question générale": "bg-muted text-muted-foreground", "Demande de prestation": "bg-primary/10 text-primary", "Demande de devis": "bg-success/12 text-success", "Information manquante": "bg-warning/15 text-warning-foreground" };

function Page() {
  const dets = useStore((s) => s.detections);
  const acts = useStore((s) => s.activities.filter((a) => a.category === "Prospection" || a.category === "IA"));
  const [busy, setBusy] = useState<string | null>(null);
  const replay = async (d: Detection) => {
    setBusy(d.id);
    await sleep(1600);
    actions.patchDetection(d.id, { confidence: Math.min(99, d.confidence + 2) });
    actions.log("IA", "Analyse rejouée", "Agent Service Client", d.contact, `${d.intent} · ${Math.min(99, d.confidence + 2)}%`);
    setBusy(null);
    toast.success("Analyse rejouée", { description: `${d.intent} confirmée` });
  };
  const reclass = (d: Detection, intent: Detection["intent"], label: string) => {
    actions.patchDetection(d.id, { intent, confidence: 100, action: `${label} manuellement par Imane` });
    actions.log("IA", `Intention ${label.toLowerCase()}`, "Imane El Bijri", d.contact, intent);
    toast.success(`Intention ${label.toLowerCase()}`, { description: intent });
  };
  const menu = (d: Detection, label: string, icon: React.ReactNode) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="sm" variant="outline">{icon} {label === "Corrigée" ? "Corriger l'intention" : "Reclasser"}</Button></DropdownMenuTrigger>
      <DropdownMenuContent>{INTENTS.map((i) => <DropdownMenuItem key={i} onClick={() => reclass(d, i, label)}>{i}</DropdownMenuItem>)}</DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <div>
      <PageHeader title="Détection IA & historique" subtitle="Visualisez comment l'Agent comprend chaque message." />
      <div className="grid gap-4 md:grid-cols-2">
        {dets.map((d) => (
          <div key={d.id} className={cn("card-premium relative overflow-hidden p-5", busy === d.id && "shadow-glow")}>
            {busy === d.id && <div className="absolute inset-x-0 top-0 h-1 animate-shimmer bg-gradient-to-r from-transparent via-primary to-transparent" />}
            <div className="flex items-center gap-2"><BrainCircuit className={cn("size-5 text-primary", busy === d.id && "animate-pulse")} /><p className="text-sm font-semibold">{d.contact}</p><span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold", tone[d.intent])}>{d.intent}</span></div>
            <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm italic">« {d.message} »</p>
            <div className="mt-4 space-y-1.5"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Confiance</span><b>{busy === d.id ? "Analyse en cours..." : `${d.confidence}%`}</b></div><Progress value={busy === d.id ? 40 : d.confidence} className="h-1.5" /></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><p className="text-muted-foreground">Action déclenchée</p><p className="font-semibold">{d.action}</p></div><div><p className="text-muted-foreground">Prospect lié</p><p className="font-semibold">{d.prospect}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="soft" disabled={!!busy} onClick={() => replay(d)}><RotateCcw /> Rejouer l'analyse</Button>
              {menu(d, "Corrigée", <Wand />)}{menu(d, "Reclassée", <Tags />)}
            </div>
          </div>
        ))}
      </div>
      <div className="card-premium mt-6 p-5">
        <h3 className="mb-4 font-semibold">Historique prospection</h3>
        <ol className="relative space-y-4 border-l pl-6">
          {acts.slice(0, 15).map((a) => <li key={a.id} className="relative"><span className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-card bg-primary" /><p className="text-sm"><b>{a.type}</b> · {a.prospect}</p><p className="text-xs text-muted-foreground">{a.actor} · {a.result} · {timeAgo(a.at)}</p></li>)}
        </ol>
      </div>
    </div>
  );
}
