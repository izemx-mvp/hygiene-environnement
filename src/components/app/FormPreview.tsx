import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormField } from "@/lib/types";

export function FieldInput({ f, value, onChange }: { f: FormField; value?: string; onChange?: (v: string) => void }) {
  const v = value ?? "";
  const ch = (x: string) => onChange?.(x);
  switch (f.type) {
    case "textarea": return <Textarea placeholder={f.placeholder} value={v} onChange={(e) => ch(e.target.value)} />;
    case "select":
      return (
        <select className="h-9 w-full rounded-md border bg-card px-3 text-sm" value={v} onChange={(e) => ch(e.target.value)}>
          <option value="">Sélectionner...</option>
          {(f.options ?? []).map((o) => <option key={o}>{o}</option>)}
        </select>
      );
    case "radio":
    case "multiselect": {
      const sel = v ? v.split(", ") : [];
      return (
        <div className="flex flex-wrap gap-2">
          {(f.options ?? ["Option 1", "Option 2"]).map((o) => {
            const on = sel.includes(o);
            return (
              <button type="button" key={o} onClick={() => ch(f.type === "radio" ? o : (on ? sel.filter((x) => x !== o) : [...sel, o]).join(", "))}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${on ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40"}`}>
                {f.type === "multiselect" ? <Checkbox checked={on} className="pointer-events-none" /> : <span className={`size-3.5 rounded-full border-2 ${on ? "border-primary bg-primary" : ""}`} />}{o}
              </button>
            );
          })}
        </div>
      );
    }
    case "upload":
      return <button type="button" onClick={() => ch("Document_joint.pdf")} className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed p-5 text-sm text-muted-foreground hover:border-primary"><Upload className="size-5 text-primary" />{v || "Cliquez pour joindre un fichier"}</button>;
    default:
      return <Input type={f.type === "phone" ? "tel" : f.type} placeholder={f.placeholder} value={v} onChange={(e) => ch(e.target.value)} />;
  }
}

export function FormPreview({ fields }: { fields: FormField[] }) {
  if (!fields.length) return <p className="py-8 text-center text-sm text-muted-foreground">Aucun champ pour le moment.</p>;
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <Label>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
          {f.description && <p className="text-xs text-muted-foreground">{f.description}</p>}
          <FieldInput f={f} />
        </div>
      ))}
    </div>
  );
}
