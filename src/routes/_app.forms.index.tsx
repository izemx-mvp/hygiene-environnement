import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, Pencil, Plus, Send, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { actions, uid, useStore } from "@/lib/store";
import { PageHeader, StatusBadge, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormPreview } from "@/components/app/FormPreview";
import { SendFormDialog } from "@/components/app/SendFormDialog";
import type { FormTemplate } from "@/lib/types";

export const Route = createFileRoute("/_app/forms/")({
  head: () => ({
    meta: [
      { title: "Formulaires — HygiEnv.ai" },
      { name: "description", content: "Modèles de formulaires envoyés aux prospects par l'Agent IA." },
      { property: "og:title", content: "Formulaires — HygiEnv.ai" },
      { property: "og:description", content: "Créez, dupliquez et envoyez vos formulaires de qualification." },
    ],
  }),
  component: Page,
});

function Page() {
  const forms = useStore((s) => s.forms);
  const prospects = useStore((s) => s.prospects);
  const navigate = useNavigate();
  const [preview, setPreview] = useState<FormTemplate | null>(null);
  const [pick, setPick] = useState<FormTemplate | null>(null);
  const [target, setTarget] = useState("");
  const [sendFor, setSendFor] = useState<string | null>(null);

  const create = () => {
    const f: FormTemplate = { id: uid("f"), name: "Nouveau formulaire", description: "Formulaire en cours de création", sends: 0, completion: 0, updatedAt: new Date().toISOString(), status: "Brouillon", fields: [] };
    actions.upsert("forms", f);
    navigate({ to: "/forms/$id", params: { id: f.id } });
  };
  return (
    <div>
      <PageHeader title="Formulaires" subtitle="Les formulaires envoyés automatiquement selon la prestation détectée." actions={<Button variant="premium" onClick={create}><Plus /> Créer un formulaire</Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {forms.map((f, i) => (
          <div key={f.id} className="card-premium card-hover flex animate-fade-up flex-col p-5" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow"><ClipboardList className="size-5" /></div><StatusBadge status={f.status} /></div>
            <h3 className="mt-4 font-semibold">{f.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{f.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[11px] text-muted-foreground">Envois</p><p className="font-display text-xl font-semibold">{f.sends}</p></div>
              <div><p className="text-[11px] text-muted-foreground">Complétion</p><p className="font-display text-xl font-semibold">{f.completion}%</p></div>
            </div>
            <Progress value={f.completion} className="mt-2 h-1.5" />
            <p className="mt-2 text-[11px] text-muted-foreground">Modifié {timeAgo(f.updatedAt)} · {f.fields.length} champs</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => setPreview(f)}><Eye /> Voir</Button>
              <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/forms/$id", params: { id: f.id } })}><Pencil /> Modifier</Button>
              <Button size="sm" variant="ghost" onClick={() => { actions.upsert("forms", { ...f, id: uid("f"), name: `${f.name} (copie)`, sends: 0, completion: 0, status: "Brouillon", updatedAt: new Date().toISOString() }); toast.success("Formulaire dupliqué"); }}><Copy /> Dupliquer</Button>
              <Button size="sm" variant="ghost" onClick={() => setPreview(f)}>Prévisualiser</Button>
              <Button size="sm" variant="soft" onClick={() => { setPick(f); setTarget(""); }}><Send /> Envoyer</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{preview?.name}</DialogTitle></DialogHeader>
          {preview && <FormPreview fields={preview.fields} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!pick} onOpenChange={(o) => !o && setPick(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Envoyer « {pick?.name} » à...</DialogTitle></DialogHeader>
          <Select value={target} onValueChange={setTarget}><SelectTrigger><SelectValue placeholder="Choisir un prospect" /></SelectTrigger><SelectContent>{prospects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.company}</SelectItem>)}</SelectContent></Select>
          <DialogFooter><Button variant="ghost" onClick={() => setPick(null)}>Annuler</Button><Button variant="premium" disabled={!target} onClick={() => { actions.updateProspect(target, { formId: pick!.id }); setPick(null); setSendFor(target); }}>Continuer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <SendFormDialog prospectId={sendFor} open={!!sendFor} onOpenChange={(o) => !o && setSendFor(null)} />
    </div>
  );
}
