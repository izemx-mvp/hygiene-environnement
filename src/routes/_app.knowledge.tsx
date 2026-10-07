import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { actions, uid, useStore } from "@/lib/store";
import { PageHeader, StatusBadge, fmtDate } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/knowledge")({
  head: () => ({
    meta: [
      { title: "Base de connaissances — HygiEnv.ai" },
      { name: "description", content: "FAQ, documents et informations utilisés par l'Agent IA." },
      { property: "og:title", content: "Base de connaissances — HygiEnv.ai" },
      { property: "og:description", content: "Gérez ce que l'Agent IA sait de votre entreprise." },
    ],
  }),
  component: Page,
});

type Key = "faqs" | "kbDocs" | "kbInfos";
const SCHEMA: Record<Key, { label: string; fields: { k: string; l: string; long?: boolean; opts?: string[] }[] }> = {
  faqs: { label: "FAQ", fields: [{ k: "question", l: "Question" }, { k: "answer", l: "Réponse", long: true }, { k: "category", l: "Catégorie" }, { k: "status", l: "Statut", opts: ["Actif", "Brouillon"] }] },
  kbDocs: { label: "document", fields: [{ k: "name", l: "Nom du fichier" }, { k: "type", l: "Type", opts: ["PDF", "Word", "Excel"] }, { k: "description", l: "Description", long: true }, { k: "status", l: "Statut", opts: ["Indexé", "En cours", "Archivé"] }] },
  kbInfos: { label: "information", fields: [{ k: "title", l: "Titre" }, { k: "content", l: "Contenu", long: true }, { k: "category", l: "Catégorie" }, { k: "status", l: "Statut", opts: ["Actif", "Brouillon"] }] },
};

function Page() {
  const faqs = useStore((s) => s.faqs);
  const docs = useStore((s) => s.kbDocs);
  const infos = useStore((s) => s.kbInfos);
  const [tab, setTab] = useState<Key>("faqs");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Record<string, string> | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const lists = { faqs, kbDocs: docs, kbInfos: infos } as unknown as Record<Key, Record<string, string>[]>;
  const filt = (l: Record<string, string>[]) => l.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  const openNew = () => setEdit({ id: "", date: new Date().toISOString(), ...Object.fromEntries(SCHEMA[tab].fields.map((f) => [f.k, f.opts?.[0] ?? ""])) });
  const save = () => {
    if (!edit) return;
    const first = SCHEMA[tab].fields[0].k;
    if (!edit[first]?.trim()) return toast.error("Champ requis");
    const isNew = !edit.id;
    actions.upsert(tab, { ...edit, id: edit.id || uid("kb"), date: edit.date } as never);
    toast.success(isNew ? "Élément ajouté" : "Modifications enregistrées");
    setEdit(null);
  };
  const actionsCell = (x: Record<string, string>) => (
    <div className="flex justify-end gap-1">
      <Button size="icon" variant="ghost" onClick={() => setEdit({ ...x })}><Pencil /></Button>
      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDel(x.id)}><Trash2 /></Button>
    </div>
  );

  return (
    <div>
      <PageHeader title="Base de connaissances" subtitle="Les sources utilisées par l'Agent Service Client pour répondre." actions={<Button variant="premium" onClick={openNew}><Plus /> Ajouter {SCHEMA[tab].label}</Button>} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Key)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList><TabsTrigger value="faqs">FAQ ({faqs.length})</TabsTrigger><TabsTrigger value="kbDocs">Documents ({docs.length})</TabsTrigger><TabsTrigger value="kbInfos">Informations générales ({infos.length})</TabsTrigger></TabsList>
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="card-premium mt-4 overflow-hidden">
          <TabsContent value="faqs" className="m-0">
            <Table>
              <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Réponse</TableHead><TableHead>Catégorie</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{filt(lists.faqs).map((x) => <TableRow key={x.id}><TableCell className="max-w-xs font-semibold">{x.question}</TableCell><TableCell className="max-w-sm truncate text-muted-foreground">{x.answer}</TableCell><TableCell>{x.category}</TableCell><TableCell><StatusBadge status={x.status} /></TableCell><TableCell className="text-xs">{fmtDate(x.date)}</TableCell><TableCell>{actionsCell(x)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="kbDocs" className="m-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Date ajout</TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{filt(lists.kbDocs).map((x) => <TableRow key={x.id}><TableCell className="font-semibold"><span className="flex items-center gap-2"><FileText className="size-4 text-primary" />{x.name}</span></TableCell><TableCell>{x.type}</TableCell><TableCell className="text-muted-foreground">{x.description}</TableCell><TableCell className="text-xs">{fmtDate(x.date)}</TableCell><TableCell><StatusBadge status={x.status} /></TableCell><TableCell>{actionsCell(x)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="kbInfos" className="m-0">
            <Table>
              <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Contenu</TableHead><TableHead>Catégorie</TableHead><TableHead>Statut</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{filt(lists.kbInfos).map((x) => <TableRow key={x.id}><TableCell className="font-semibold">{x.title}</TableCell><TableCell className="text-muted-foreground">{x.content}</TableCell><TableCell>{x.category}</TableCell><TableCell><StatusBadge status={x.status} /></TableCell><TableCell>{actionsCell(x)}</TableCell></TableRow>)}</TableBody>
            </Table>
          </TabsContent>
        </div>
      </Tabs>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Modifier" : "Ajouter"} {SCHEMA[tab].label}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {edit && SCHEMA[tab].fields.map((f) => (
              <div key={f.k} className="space-y-1.5">
                <Label>{f.l}</Label>
                {f.opts ? (
                  <div className="flex gap-2">{f.opts.map((o) => <button key={o} onClick={() => setEdit({ ...edit, [f.k]: o })} className={`rounded-full border px-3 py-1 text-xs font-semibold ${edit[f.k] === o ? "border-primary bg-primary text-primary-foreground" : ""}`}>{o}</button>)}</div>
                ) : f.long ? <Textarea value={edit[f.k]} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })} /> : <Input value={edit[f.k]} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })} />}
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setEdit(null)}>Annuler</Button><Button variant="premium" onClick={save}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer cet élément ?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">L'Agent IA n'utilisera plus cette source.</p>
          <DialogFooter><Button variant="ghost" onClick={() => setDel(null)}>Annuler</Button><Button variant="destructive" onClick={() => { actions.remove(tab, del!); toast.success("Élément supprimé"); setDel(null); }}>Supprimer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
