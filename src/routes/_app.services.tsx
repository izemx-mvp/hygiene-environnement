import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Eye, Link2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { actions, mad, useStore } from "@/lib/store";
import { PageHeader, StatusBadge } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Service } from "@/lib/types";

export const Route = createFileRoute("/_app/services")({
  head: () => ({
    meta: [
      { title: "Prestations — HygiEnv.ai" },
      { name: "description", content: "Catalogue des prestations Hygiène & Environnement et formulaires associés." },
      { property: "og:title", content: "Prestations — HygiEnv.ai" },
      { property: "og:description", content: "Audit Hygiène, Environnement, Formation HSE et conformité." },
    ],
  }),
  component: Page,
});

function Page() {
  const services = useStore((s) => s.services);
  const forms = useStore((s) => s.forms);
  const prospects = useStore((s) => s.prospects);
  const [view, setView] = useState<Service | null>(null);
  const [edit, setEdit] = useState<Service | null>(null);
  const [assoc, setAssoc] = useState<Service | null>(null);
  return (
    <div>
      <PageHeader title="Prestations" subtitle="L'Agent IA s'appuie sur ce catalogue pour identifier la demande et envoyer le bon formulaire." />
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className={`card-premium card-hover p-6 ${!s.active ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"><Briefcase className="size-5" /></div>
              <div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-semibold">{s.name}</h3><StatusBadge status={s.active ? "Actif" : "Inactif"} /></div><p className="mt-1 text-sm text-muted-foreground">{s.description}</p></div>
              <Switch checked={s.active} onCheckedChange={(v) => { actions.upsert("services", { ...s, active: v }); toast.success(v ? "Prestation activée" : "Prestation désactivée"); }} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Formulaire</p><p className="truncate font-semibold">{forms.find((f) => f.id === s.formId)?.name}</p></div>
              <div className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Tarif de base</p><p className="font-semibold">{mad(s.basePrice)}</p></div>
              <div className="rounded-xl bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Prospects</p><p className="font-semibold">{prospects.filter((p) => p.service === s.name).length}</p></div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Conditions : {s.conditions}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setView(s)}><Eye /> Voir</Button>
              <Button size="sm" variant="ghost" onClick={() => setEdit({ ...s })}><Pencil /> Modifier</Button>
              <Button size="sm" variant="soft" onClick={() => setAssoc({ ...s })}><Link2 /> Associer formulaire</Button>
            </div>
          </div>
        ))}
      </div>
      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>{view?.name}</SheetTitle></SheetHeader>
          {view && <div className="space-y-4 p-4 text-sm"><p>{view.description}</p><p><b>Conditions :</b> {view.conditions}</p><p><b>Tarif :</b> {mad(view.basePrice)} / {view.unit}</p>
            <div><p className="mb-2 font-semibold">Prospects associés</p>{prospects.filter((p) => p.service === view.name).map((p) => <div key={p.id} className="flex justify-between border-b py-2"><span>{p.name}</span><StatusBadge status={p.status} /></div>)}</div></div>}
        </SheetContent>
      </Sheet>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la prestation</DialogTitle></DialogHeader>
          {edit && <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nom</Label><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Conditions</Label><Input value={edit.conditions} onChange={(e) => setEdit({ ...edit, conditions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Tarif (MAD)</Label><Input type="number" value={edit.basePrice} onChange={(e) => setEdit({ ...edit, basePrice: +e.target.value })} /></div><div className="space-y-1.5"><Label>Unité</Label><Input value={edit.unit} onChange={(e) => setEdit({ ...edit, unit: e.target.value })} /></div></div>
          </div>}
          <DialogFooter><Button variant="ghost" onClick={() => setEdit(null)}>Annuler</Button><Button variant="premium" onClick={() => { actions.upsert("services", edit!); toast.success("Prestation mise à jour"); setEdit(null); }}>Enregistrer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!assoc} onOpenChange={(o) => !o && setAssoc(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Associer un formulaire — {assoc?.name}</DialogTitle></DialogHeader>
          {assoc && <Select value={assoc.formId} onValueChange={(v) => setAssoc({ ...assoc, formId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{forms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select>}
          <DialogFooter><Button variant="ghost" onClick={() => setAssoc(null)}>Annuler</Button><Button variant="premium" onClick={() => { actions.upsert("services", assoc!); toast.success("Formulaire associé"); setAssoc(null); }}>Associer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
