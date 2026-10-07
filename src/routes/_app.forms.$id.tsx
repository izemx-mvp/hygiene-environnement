import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Calendar, CheckSquare, ChevronDown, CircleDot, Eye, Hash, List, Mail, Phone, Rocket, Save, Trash2, Type, Upload, AlignLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { actions, uid, useStore } from "@/lib/store";
import { EmptyState } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldInput, FormPreview } from "@/components/app/FormPreview";
import type { FormField, FormTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/forms/$id")({
  head: () => ({
    meta: [
      { title: "Builder de formulaire — HygiEnv.ai" },
      { name: "description", content: "Créez et configurez vos formulaires de qualification." },
      { property: "og:title", content: "Builder de formulaire — HygiEnv.ai" },
      { property: "og:description", content: "Ajoutez, réorganisez et publiez vos champs." },
    ],
  }),
  component: Builder,
});

const TYPES: { t: FormField["type"]; l: string; icon: typeof Type }[] = [
  { t: "text", l: "Texte", icon: Type }, { t: "email", l: "Email", icon: Mail }, { t: "phone", l: "Téléphone", icon: Phone },
  { t: "number", l: "Nombre", icon: Hash }, { t: "select", l: "Select", icon: ChevronDown }, { t: "multiselect", l: "Multi-select", icon: CheckSquare },
  { t: "radio", l: "Radio", icon: CircleDot }, { t: "date", l: "Date", icon: Calendar }, { t: "textarea", l: "Zone de texte", icon: AlignLeft }, { t: "upload", l: "Upload", icon: Upload },
];

function Builder() {
  const { id } = Route.useParams();
  const stored = useStore((s) => s.forms.find((f) => f.id === id));
  const navigate = useNavigate();
  const [form, setForm] = useState<FormTemplate | null>(stored ?? null);
  const [sel, setSel] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (stored && !form) setForm(stored); }, [stored]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!form) return <EmptyState icon={<List />} title="Formulaire introuvable" desc="Retournez à la liste des formulaires." />;

  const upd = (p: Partial<FormTemplate>) => { setForm({ ...form, ...p }); setDirty(true); };
  const fields = form.fields;
  const field = fields.find((f) => f.id === sel);
  const setField = (p: Partial<FormField>) => upd({ fields: fields.map((f) => (f.id === sel ? { ...f, ...p } : f)) });
  const add = (t: FormField["type"]) => {
    const f: FormField = { id: uid("fl"), type: t, label: TYPES.find((x) => x.t === t)!.l, required: false, placeholder: "", options: ["select", "multiselect", "radio"].includes(t) ? ["Option 1", "Option 2"] : undefined };
    upd({ fields: [...fields, f] });
    setSel(f.id);
  };
  const move = (i: number, d: number) => { const a = [...fields]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); upd({ fields: a }); };
  const save = (status?: FormTemplate["status"]) => {
    actions.upsert("forms", { ...form, status: status ?? form.status, updatedAt: new Date().toISOString() });
    if (status) setForm({ ...form, status });
    setDirty(false);
    toast.success(status === "Publié" ? "Formulaire publié" : "Formulaire enregistré", { description: `${fields.length} champs` });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input value={form.name} onChange={(e) => upd({ name: e.target.value })} className="h-11 max-w-sm font-display text-lg font-semibold" />
        <span className={cn("text-xs font-semibold", dirty ? "text-warning-foreground" : "text-success")}>{dirty ? "● Modifications non enregistrées" : "✓ Enregistré"}</span>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={() => navigate({ to: "/forms" })}>Retour</Button>
          <Button variant="outline" onClick={() => setPreview(true)}><Eye /> Prévisualiser</Button>
          <Button variant="outline" onClick={() => save()}><Save /> Enregistrer</Button>
          <Button variant="premium" onClick={() => save("Publié")}><Rocket /> Publier</Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[220px_1fr_300px]">
        <div className="card-premium h-fit p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Types de champs</p>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
            {TYPES.map((t) => <button key={t.t} onClick={() => add(t.t)} className="group flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:border-primary hover:bg-accent"><t.icon className="size-4 text-primary" />{t.l}<Plus className="ml-auto size-3.5 opacity-0 transition group-hover:opacity-100" /></button>)}
          </div>
        </div>
        <div className="card-premium p-6">
          <Textarea value={form.description} onChange={(e) => upd({ description: e.target.value })} className="mb-5 resize-none border-dashed text-sm" rows={2} />
          {!fields.length && <EmptyState icon={<Plus />} title="Ajoutez votre premier champ" desc="Cliquez sur un type de champ à gauche." />}
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} onClick={() => setSel(f.id)} className={cn("group relative cursor-pointer rounded-2xl border p-4 transition", sel === f.id ? "border-primary shadow-glow" : "hover:border-primary/40")}>
                <div className="mb-2 flex items-center gap-2">
                  <Label>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
                  {f.condition && <span className="rounded-full bg-accent px-2 text-[10px] font-semibold text-primary">Conditionnel</span>}
                  <div className="ml-auto flex gap-0.5 opacity-60 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="size-7" disabled={i === 0} onClick={(e) => { e.stopPropagation(); move(i, -1); }}><ArrowUp /></Button>
                    <Button size="icon" variant="ghost" className="size-7" disabled={i === fields.length - 1} onClick={(e) => { e.stopPropagation(); move(i, 1); }}><ArrowDown /></Button>
                    <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={(e) => { e.stopPropagation(); upd({ fields: fields.filter((x) => x.id !== f.id) }); if (sel === f.id) setSel(null); }}><Trash2 /></Button>
                  </div>
                </div>
                {f.description && <p className="mb-2 text-xs text-muted-foreground">{f.description}</p>}
                <div className="pointer-events-none"><FieldInput f={f} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-premium h-fit p-4">
          <p className="mb-3 text-sm font-semibold">Configuration du champ</p>
          {!field ? <p className="text-sm text-muted-foreground">Sélectionnez un champ pour le configurer.</p> : (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Label</Label><Input value={field.label} onChange={(e) => setField({ label: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Placeholder</Label><Input value={field.placeholder ?? ""} onChange={(e) => setField({ placeholder: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={field.description ?? ""} onChange={(e) => setField({ description: e.target.value })} /></div>
              {field.options && <div className="space-y-1.5"><Label>Options (une par ligne)</Label><Textarea rows={3} value={field.options.join("\n")} onChange={(e) => setField({ options: e.target.value.split("\n") })} /></div>}
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">Obligatoire <Switch checked={field.required} onCheckedChange={(v) => setField({ required: v })} /></label>
              <div className="space-y-1.5">
                <Label>Logique conditionnelle</Label>
                <select className="h-9 w-full rounded-md border bg-card px-3 text-sm" value={field.condition ?? ""} onChange={(e) => setField({ condition: e.target.value || undefined })}>
                  <option value="">Toujours afficher</option>
                  {fields.filter((x) => x.id !== field.id).map((x) => <option key={x.id} value={x.id}>Si « {x.label} » est renseigné</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Aperçu — {form.name}</DialogTitle></DialogHeader><FormPreview fields={fields} /></DialogContent>
      </Dialog>
    </div>
  );
}
