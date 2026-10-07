import { useEffect, useState, type ReactNode } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 60000;
  if (d < 1) return "à l'instant";
  if (d < 60) return `il y a ${Math.round(d)} min`;
  if (d < 1440) return `il y a ${Math.round(d / 60)} h`;
  return `il y a ${Math.round(d / 1440)} j`;
}
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const tone: Record<string, string> = {
  // prospect
  Nouveau: "bg-accent text-accent-foreground ring-primary/20",
  "Formulaire envoyé": "bg-primary/10 text-primary ring-primary/25",
  "Formulaire complété": "bg-chart-3/10 text-chart-3 ring-chart-3/20",
  "Infos manquantes": "bg-warning/15 text-warning-foreground ring-warning/30",
  "Prêt pour devis": "bg-success/12 text-success ring-success/25",
  "Devis généré": "bg-navy/10 text-navy ring-navy/20",
  "Devis envoyé": "bg-primary/15 text-primary ring-primary/30",
  // forms
  "Non envoyé": "bg-muted text-muted-foreground ring-border",
  Envoyé: "bg-primary/10 text-primary ring-primary/25",
  Complété: "bg-success/12 text-success ring-success/25",
  // quotes
  Brouillon: "bg-muted text-muted-foreground ring-border",
  "À valider": "bg-warning/15 text-warning-foreground ring-warning/30",
  Validé: "bg-success/12 text-success ring-success/25",
  Modifié: "bg-chart-3/10 text-chart-3 ring-chart-3/20",
  Accepté: "bg-success text-success-foreground ring-success",
  Refusé: "bg-destructive/10 text-destructive ring-destructive/20",
  // conv
  "IA active": "bg-primary/10 text-primary ring-primary/25",
  Humain: "bg-navy/10 text-navy ring-navy/20",
  Résolu: "bg-success/12 text-success ring-success/25",
  "À reprendre": "bg-warning/15 text-warning-foreground ring-warning/30",
  Répondu: "bg-success/12 text-success ring-success/25",
  "Non résolu": "bg-warning/15 text-warning-foreground ring-warning/30",
  Escaladé: "bg-destructive/10 text-destructive ring-destructive/20",
  Actif: "bg-success/12 text-success ring-success/25",
  Indexé: "bg-success/12 text-success ring-success/25",
  "En cours": "bg-primary/10 text-primary ring-primary/25",
  Archivé: "bg-muted text-muted-foreground ring-border",
  Publié: "bg-success/12 text-success ring-success/25",
  Inactif: "bg-muted text-muted-foreground ring-border",
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      key={status}
      className={cn(
        "inline-flex animate-fade-up items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        tone[status] ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const ini = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground shadow-glow",
        className,
      )}
    >
      {ini}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold text-foreground md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-accent text-primary">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

/** Animated AI processing stepper. Calls onDone when finished. */
export function AiSteps({ steps, onDone, stepMs = 750 }: { steps: string[]; onDone?: () => void; stepMs?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), stepMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  return (
    <div className="space-y-2.5">
      {steps.map((s, k) => (
        <div
          key={s}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-500",
            k < i && "border-success/30 bg-success/5",
            k === i && "border-primary/40 bg-primary/5 shadow-glow",
            k > i && "opacity-40",
          )}
        >
          <span
            className={cn(
              "grid size-6 place-items-center rounded-full text-[10px] font-bold",
              k < i ? "bg-success text-success-foreground" : k === i ? "bg-primary text-primary-foreground animate-pulse-ring" : "bg-muted text-muted-foreground",
            )}
          >
            {k < i ? <Check className="size-3.5" /> : k === i ? <Loader2 className="size-3.5 animate-spin" /> : k + 1}
          </span>
          <span className={cn("font-medium", k === i && "text-primary")}>{s}</span>
          {k === i && <span className="ml-auto h-1.5 w-16 rounded-full bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10 animate-shimmer" />}
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className={cn("h-8 w-24", className)} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
