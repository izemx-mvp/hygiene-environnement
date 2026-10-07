import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, LayoutGrid, List, MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { SERVICES } from "@/lib/mock";
import { EmptyState, Initials, PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewProspectDialog } from "@/components/app/AppShell";
import { SendFormDialog } from "@/components/app/SendFormDialog";
import type { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/prospects/")({
  head: () => ({
    meta: [
      { title: "Prospects — HygiEnv.ai" },
      { name: "description", content: "Tous les prospects détectés par l'IA et créés manuellement." },
      { property: "og:title", content: "Prospects — HygiEnv.ai" },
      { property: "og:description", content: "Recherche, filtres et suivi des prospects." },
    ],
  }),
  component: Page,
});

const ALL = "__all";
const STATUSES = ["Nouveau", "Formulaire envoyé", "Formulaire complété", "Infos manquantes", "Prêt pour devis", "Devis généré", "Devis envoyé"];
const SOURCES = ["WhatsApp", "Site web", "Email", "Téléphone", "Recommandation"];
const PAGE = 8;

function Page() {
  const prospects = useStore((s) => s.prospects);
  const forms = useStore((s) => s.forms);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ status: ALL, service: ALL, source: ALL, form: ALL, date: ALL });
  const [sort, setSort] = useState<{ k: keyof Prospect; dir: 1 | -1 }>({ k: "lastInteraction", dir: -1 });
  const [page, setPage] = useState(0);
  const [view, setView] = useState<"table" | "cards">("table");
  const [np, setNp] = useState(false);
  const [sendFor, setSendFor] = useState<string | null>(null);

  const rows = useMemo(() => {
    const now = Date.now();
    const days = { d7: 7, d30: 30, d90: 90 } as Record<string, number>;
    return prospects
      .filter((p) => `${p.name} ${p.company} ${p.email} ${p.phone}`.toLowerCase().includes(q.toLowerCase()))
      .filter((p) => f.status === ALL || p.status === f.status)
      .filter((p) => f.service === ALL || p.service === f.service)
      .filter((p) => f.source === ALL || p.source === f.source)
      .filter((p) => f.form === ALL || p.formStatus === f.form)
      .filter((p) => f.date === ALL || now - new Date(p.createdAt).getTime() < days[f.date] * 86400000)
      .sort((a, b) => String(a[sort.k]).localeCompare(String(b[sort.k])) * sort.dir);
  }, [prospects, q, f, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const set = (k: keyof typeof f, v: string) => { setF({ ...f, [k]: v }); setPage(0); };
  const active = Object.values(f).some((v) => v !== ALL) || q;
  const SortH = ({ k, children }: { k: keyof Prospect; children: string }) => (
    <button className="flex items-center gap-1 hover:text-foreground" onClick={() => setSort({ k, dir: sort.k === k ? (-sort.dir as 1 | -1) : 1 })}>{children}<ArrowUpDown className={cn("size-3", sort.k === k && "text-primary")} /></button>
  );
  const menu = (p: Prospect) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => navigate({ to: "/prospects/$id", params: { id: p.id } })}>Ouvrir la fiche</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSendFor(p.id)}>Envoyer formulaire</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const sel = (k: keyof typeof f, ph: string, opts: [string, string][]) => (
    <Select value={f[k]} onValueChange={(v) => set(k, v)}>
      <SelectTrigger className={cn("h-9 w-auto min-w-36 bg-card", f[k] !== ALL && "border-primary text-primary")}><SelectValue placeholder={ph} /></SelectTrigger>
      <SelectContent><SelectItem value={ALL}>{ph}</SelectItem>{opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <div>
      <PageHeader title="Prospects" subtitle={`${rows.length} prospects · ${prospects.filter((p) => p.status === "Prêt pour devis").length} prêts pour devis`} actions={<Button variant="premium" onClick={() => setNp(true)}><Plus /> Nouveau prospect</Button>} />
      <div className="card-premium mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Nom, société, email, téléphone..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
        {sel("status", "Statut prospect", STATUSES.map((s) => [s, s]))}
        {sel("service", "Prestation", SERVICES.map((s) => [s, s]))}
        {sel("source", "Source", SOURCES.map((s) => [s, s]))}
        {sel("form", "Formulaire", [["Non envoyé", "Non envoyé"], ["Envoyé", "Envoyé"], ["Complété", "Complété"]])}
        {sel("date", "Date", [["d7", "7 derniers jours"], ["d30", "30 derniers jours"], ["d90", "3 derniers mois"]])}
        <Button size="sm" variant={f.status === "Prêt pour devis" ? "premium" : "outline"} onClick={() => set("status", f.status === "Prêt pour devis" ? ALL : "Prêt pour devis")}>Prêt pour devis</Button>
        {active && <Button size="sm" variant="ghost" onClick={() => { setF({ status: ALL, service: ALL, source: ALL, form: ALL, date: ALL }); setQ(""); }}><X /> Réinitialiser</Button>}
        <div className="ml-auto flex rounded-lg border p-0.5">
          <Button size="icon" variant={view === "table" ? "soft" : "ghost"} className="size-8" onClick={() => setView("table")}><List /></Button>
          <Button size="icon" variant={view === "cards" ? "soft" : "ghost"} className="size-8" onClick={() => setView("cards")}><LayoutGrid /></Button>
        </div>
      </div>

      {!shown.length ? (
        <EmptyState icon={<Search />} title="Aucun prospect" desc="Aucun résultat pour ces filtres." />
      ) : view === "table" ? (
        <>
          <div className="card-premium hidden overflow-x-auto md:block">
            <Table>
              <TableHeader><TableRow>
                <TableHead><SortH k="name">Prospect</SortH></TableHead><TableHead><SortH k="company">Société</SortH></TableHead><TableHead>Téléphone</TableHead><TableHead>Email</TableHead>
                <TableHead><SortH k="service">Prestation</SortH></TableHead><TableHead>Source</TableHead><TableHead>Formulaire</TableHead><TableHead>Statut form.</TableHead>
                <TableHead><SortH k="status">Statut</SortH></TableHead><TableHead><SortH k="lastInteraction">Dernière interaction</SortH></TableHead><TableHead />
              </TableRow></TableHeader>
              <TableBody>
                {shown.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate({ to: "/prospects/$id", params: { id: p.id } })}>
                    <TableCell><div className="flex items-center gap-2.5"><Initials name={p.name} className="size-8" /><span className="font-semibold">{p.name}</span></div></TableCell>
                    <TableCell>{p.company}</TableCell><TableCell className="whitespace-nowrap text-xs">{p.phone}</TableCell><TableCell className="text-xs">{p.email}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.service}</TableCell><TableCell className="text-xs">{p.source}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs">{forms.find((x) => x.id === p.formId)?.name ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={p.formStatus} /></TableCell><TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{timeAgo(p.lastInteraction)}</TableCell>
                    <TableCell>{menu(p)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Cards rows={shown} menu={menu} className="md:hidden" />
        </>
      ) : (
        <Cards rows={shown} menu={menu} />
      )}

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page + 1} / {pages}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</Button>
          <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Suivant</Button>
        </div>
      </div>
      <NewProspectDialog open={np} onOpenChange={setNp} />
      <SendFormDialog prospectId={sendFor} open={!!sendFor} onOpenChange={(o) => !o && setSendFor(null)} />
    </div>
  );
}

function Cards({ rows, menu, className }: { rows: Prospect[]; menu: (p: Prospect) => React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {rows.map((p) => (
        <Link key={p.id} to="/prospects/$id" params={{ id: p.id }} className="card-premium card-hover block p-4">
          <div className="flex items-start gap-3"><Initials name={p.name} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p><p className="truncate text-xs text-primary">{p.company}</p></div>{menu(p)}</div>
          <p className="mt-3 text-sm font-medium">{p.service}</p>
          <p className="text-xs text-muted-foreground">{p.phone} · {p.source}</p>
          <div className="mt-3 flex flex-wrap gap-1.5"><StatusBadge status={p.status} /><StatusBadge status={p.formStatus} /></div>
        </Link>
      ))}
    </div>
  );
}
