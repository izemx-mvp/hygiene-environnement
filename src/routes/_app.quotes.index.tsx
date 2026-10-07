import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, Download, Mail, MoreHorizontal, Pencil, Plus, Search, Trash2, CheckCircle2, XCircle, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { actions, mad, quoteTotals, useStore } from "@/lib/store";
import { EmptyState, PageHeader, StatusBadge, fmtDate } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmailDialog } from "@/components/app/QuoteDialogs";
import { downloadQuotePdf } from "@/lib/pdf";
import type { Quote } from "@/lib/types";
import { SERVICES } from "@/lib/mock";

export const Route = createFileRoute("/_app/quotes/")({
  head: () => ({
    meta: [
      { title: "Devis — HygiEnv.ai" },
      { name: "description", content: "Liste des devis générés, validés et envoyés." },
      { property: "og:title", content: "Devis — HygiEnv.ai" },
      { property: "og:description", content: "Suivi des devis Hygiène & Environnement." },
    ],
  }),
  component: Page,
});

const STATUSES = ["Brouillon", "À valider", "Validé", "Envoyé", "Modifié", "Accepté", "Refusé"];
const ALL = "__all";
const PAGE = 8;

function Page() {
  const quotes = useStore((s) => s.quotes);
  const company = useStore((s) => s.company);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [st, setSt] = useState(ALL);
  const [svc, setSvc] = useState(ALL);
  const [sort, setSort] = useState<{ k: "ref" | "ttc" | "date"; dir: 1 | -1 }>({ k: "date", dir: -1 });
  const [page, setPage] = useState(0);
  const [mail, setMail] = useState<string | null>(null);

  const rows = useMemo(() => quotes
    .filter((x) => `${x.ref} ${x.client} ${x.company}`.toLowerCase().includes(q.toLowerCase()))
    .filter((x) => st === ALL || x.status === st)
    .filter((x) => svc === ALL || x.service === svc)
    .sort((a, b) => (sort.k === "ttc" ? quoteTotals(a).ttc - quoteTotals(b).ttc : String(a[sort.k]).localeCompare(String(b[sort.k]))) * sort.dir), [quotes, q, st, svc, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const total = rows.reduce((a, x) => a + quoteTotals(x).ttc, 0);
  const H = ({ k, c }: { k: typeof sort.k; c: string }) => <button className="flex items-center gap-1" onClick={() => setSort({ k, dir: sort.k === k ? (-sort.dir as 1 | -1) : 1 })}>{c}<ArrowUpDown className="size-3" /></button>;
  const newQuote = () => {
    const nq = actions.addQuote({ prospectId: null, client: "Nouveau client", company: "Société", email: "", service: SERVICES[0], lines: [{ id: "l1", desc: "Prestation", qty: 1, price: 0 }], discount: 0, tva: 20, status: "Brouillon", date: new Date().toISOString(), conditions: "50% à la commande, solde à la livraison.", delay: "15 jours ouvrés", validity: "30 jours", notes: "" });
    navigate({ to: "/quotes/$id", params: { id: nq.id } });
  };
  const menu = (x: Quote) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => navigate({ to: "/quotes/$id", params: { id: x.id } })}><Pencil /> Ouvrir / modifier</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { actions.setQuoteStatus(x.id, "Validé"); toast.success(`${x.ref} validé`); }}><CheckCircle2 /> Valider</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMail(x.id)}><Mail /> Envoyer par email</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { downloadQuotePdf(x, company); toast.success("PDF téléchargé"); }}><Download /> Télécharger PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { actions.setQuoteStatus(x.id, "Accepté"); toast.success("Devis accepté 🎉"); }}><ThumbsUp /> Marquer accepté</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { actions.setQuoteStatus(x.id, "Refusé"); toast("Devis marqué refusé"); }}><XCircle /> Marquer refusé</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => { actions.deleteQuote(x.id); toast.success("Devis supprimé"); }}><Trash2 /> Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <div>
      <PageHeader title="Devis" subtitle={`${rows.length} devis · ${mad(total)} TTC`} />
      <div className="card-premium mb-4 flex flex-wrap gap-2 p-3">
        <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Référence, client, société..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
        <Select value={st} onValueChange={(v) => { setSt(v); setPage(0); }}><SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Tous statuts</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        <Select value={svc} onValueChange={(v) => { setSvc(v); setPage(0); }}><SelectTrigger className="w-52 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Toutes prestations</SelectItem>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
      </div>
      {!shown.length ? <EmptyState icon={<Search />} title="Aucun devis" desc="Aucun résultat pour ces filtres." /> : (
        <>
          <div className="card-premium hidden overflow-x-auto md:block">
            <Table>
              <TableHeader><TableRow><TableHead><H k="ref" c="Référence" /></TableHead><TableHead>Client</TableHead><TableHead>Société</TableHead><TableHead>Prestation</TableHead><TableHead className="text-right">Montant HT</TableHead><TableHead className="text-right">TVA</TableHead><TableHead className="text-right"><H k="ttc" c="Montant TTC" /></TableHead><TableHead><H k="date" c="Date" /></TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {shown.map((x) => { const t = quoteTotals(x); return (
                  <TableRow key={x.id} className="cursor-pointer" onClick={() => navigate({ to: "/quotes/$id", params: { id: x.id } })}>
                    <TableCell className="font-semibold text-primary">{x.ref}</TableCell><TableCell>{x.client}</TableCell><TableCell>{x.company}</TableCell><TableCell className="whitespace-nowrap">{x.service}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">{mad(t.ht)}</TableCell><TableCell className="whitespace-nowrap text-right text-muted-foreground">{mad(t.tva)}</TableCell><TableCell className="whitespace-nowrap text-right font-semibold">{mad(t.ttc)}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{fmtDate(x.date)}</TableCell><TableCell><StatusBadge status={x.status} /></TableCell><TableCell>{menu(x)}</TableCell>
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {shown.map((x) => <div key={x.id} onClick={() => navigate({ to: "/quotes/$id", params: { id: x.id } })} className="card-premium p-4"><div className="flex items-center justify-between"><p className="font-semibold text-primary">{x.ref}</p>{menu(x)}</div><p className="text-sm">{x.company} · {x.service}</p><div className="mt-2 flex items-center justify-between"><StatusBadge status={x.status} /><b>{mad(quoteTotals(x).ttc)}</b></div></div>)}
          </div>
        </>
      )}
      <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Page {page + 1} / {pages}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={!page} onClick={() => setPage(page - 1)}>Précédent</Button><Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Suivant</Button></div></div>
      <EmailDialog quoteId={mail} open={!!mail} onOpenChange={(o) => !o && setMail(null)} />
    </div>
  );
}
