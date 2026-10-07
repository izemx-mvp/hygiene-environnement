import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Wand2, FolderCheck, Bot } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState, Initials, PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuoteWorkflowDialog } from "@/components/app/QuoteDialogs";

export const Route = createFileRoute("/_app/quote-generator")({
  head: () => ({
    meta: [
      { title: "Générateur de devis — HygiEnv.ai" },
      { name: "description", content: "Dossiers prêts pour devis et génération automatique par l'Agent IA." },
      { property: "og:title", content: "Générateur de devis — HygiEnv.ai" },
      { property: "og:description", content: "Générez vos devis en un clic avec l'IA." },
    ],
  }),
  component: Page,
});

function Page() {
  const all = useStore((s) => s.prospects);
  const forms = useStore((s) => s.forms);
  const ready = all.filter((p) => p.status === "Prêt pour devis");
  const [pid, setPid] = useState<string | null>(null);
  return (
    <div>
      <PageHeader title="Générateur de devis" subtitle={`${ready.length} dossiers prêts pour devis`} actions={<Button variant="premium" disabled={!ready.length} onClick={() => setPid(ready[0].id)}><Wand2 /> Générer le prochain</Button>} />
      <div className="card-premium mb-6 flex items-center gap-4 border-primary/20 bg-gradient-to-r from-accent to-card p-5">
        <div className="grid size-12 place-items-center rounded-2xl bg-navy text-primary-glow animate-pulse-ring"><Bot /></div>
        <div className="flex-1"><p className="font-semibold">Agent Générateur de Devis</p><p className="text-sm text-muted-foreground">Récupère le dossier, vérifie les informations et tarifs, calcule et produit le PDF. Vous pouvez aussi lui demander sur WhatsApp : « Génère le devis de Karim Benali ».</p></div>
      </div>
      {!ready.length ? <EmptyState icon={<FolderCheck />} title="Aucun dossier prêt" desc="Les dossiers apparaissent ici lorsque le formulaire est complété." /> : (
        <div className="card-premium overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Prospect</TableHead><TableHead>Société</TableHead><TableHead>Prestation</TableHead><TableHead>Formulaire</TableHead><TableHead>Statut</TableHead><TableHead>Dernière mise à jour</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {ready.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Link to="/prospects/$id" params={{ id: p.id }} className="flex items-center gap-2 font-semibold hover:text-primary"><Initials name={p.name} className="size-8" />{p.name}</Link></TableCell>
                  <TableCell>{p.company}</TableCell><TableCell>{p.service}</TableCell><TableCell className="text-xs">{forms.find((f) => f.id === p.formId)?.name ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell><TableCell className="text-xs text-muted-foreground">{timeAgo(p.lastInteraction)}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="premium" onClick={() => setPid(p.id)}><Wand2 /> Générer devis</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <QuoteWorkflowDialog prospectId={pid} open={!!pid} onOpenChange={(o) => !o && setPid(null)} />
    </div>
  );
}
