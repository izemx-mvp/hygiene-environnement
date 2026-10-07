import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { mad, quoteTotals, useStore } from "@/lib/store";
import { PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { EmailDialog } from "@/components/app/QuoteDialogs";

export const Route = createFileRoute("/_app/email")({
  head: () => ({
    meta: [
      { title: "Envoi email — HygiEnv.ai" },
      { name: "description", content: "Envoyez vos devis par email et suivez les envois." },
      { property: "og:title", content: "Envoi email — HygiEnv.ai" },
      { property: "og:description", content: "Devis à envoyer et historique des emails." },
    ],
  }),
  component: Page,
});

function Page() {
  const quotes = useStore((s) => s.quotes);
  const acts = useStore((s) => s.activities);
  const [mail, setMail] = useState<string | null>(null);
  const toSend = quotes.filter((q) => ["Validé", "À valider", "Modifié", "Brouillon"].includes(q.status));
  const sent = acts.filter((a) => a.category === "Email");
  return (
    <div>
      <PageHeader title="Envoi email" subtitle="Devis prêts à partir et historique des envois." />
      <div className="grid gap-6 lg:grid-cols-2">
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
          <h3 className="mb-3 font-semibold">Emails envoyés</h3>
          <div className="space-y-2">
            {sent.slice(0, 12).map((a) => <div key={a.id} className="flex items-center gap-3 border-b py-2 text-sm"><Mail className="size-4 text-primary" /><span className="flex-1">{a.result} <span className="text-muted-foreground">· {a.prospect}</span></span><span className="text-xs text-muted-foreground">{timeAgo(a.at)}</span></div>)}
          </div>
        </div>
      </div>
      <EmailDialog quoteId={mail} open={!!mail} onOpenChange={(o) => !o && setMail(null)} />
    </div>
  );
}
