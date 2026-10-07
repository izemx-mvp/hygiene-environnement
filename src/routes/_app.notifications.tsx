import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bell, CheckCheck, ClipboardCheck, FileText, FolderCheck, Headphones, Send, Trash2, UserPlus, MailCheck } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { EmptyState, PageHeader, timeAgo } from "@/components/app/bits";
import { Button } from "@/components/ui/button";
import type { NotifType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — HygiEnv.ai" },
      { name: "description", content: "Centre de notifications : prospects, formulaires, devis et interventions." },
      { property: "og:title", content: "Notifications — HygiEnv.ai" },
      { property: "og:description", content: "Toutes les alertes de vos Agents IA." },
    ],
  }),
  component: Page,
});

const ICON: Record<NotifType, typeof Bell> = {
  "Nouveau prospect": UserPlus, "Formulaire envoyé": Send, "Formulaire complété": ClipboardCheck, "Information manquante": AlertTriangle,
  "Dossier prêt pour devis": FolderCheck, "Devis généré": FileText, "Devis envoyé": MailCheck, "Intervention humaine requise": Headphones,
};

function Page() {
  const notifs = useStore((s) => s.notifications);
  const navigate = useNavigate();
  const [type, setType] = useState<string>("Toutes");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const list = notifs.filter((n) => (type === "Toutes" || n.type === type) && (!unreadOnly || !n.read));
  return (
    <div>
      <PageHeader title="Notifications" subtitle={`${notifs.filter((n) => !n.read).length} non lues`} actions={<><Button variant={unreadOnly ? "soft" : "outline"} onClick={() => setUnreadOnly(!unreadOnly)}>Non lues uniquement</Button><Button variant="premium" onClick={() => actions.markAllNotifs()}><CheckCheck /> Tout marquer lu</Button></>} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {["Toutes", ...Object.keys(ICON)].map((t) => <button key={t} onClick={() => setType(t)} className={cn("rounded-full px-3 py-1 text-xs font-semibold transition", type === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground")}>{t}</button>)}
      </div>
      {!list.length ? <EmptyState icon={<Bell />} title="Rien à signaler" desc="Aucune notification pour ce filtre." /> : (
        <div className="card-premium divide-y overflow-hidden">
          {list.map((n) => { const I = ICON[n.type]; return (
            <div key={n.id} className={cn("group flex items-center gap-4 px-5 py-4 transition hover:bg-accent/40", !n.read && "bg-primary/[0.03]")}>
              <button className="flex flex-1 items-center gap-4 text-left" onClick={() => { actions.markNotif(n.id); navigate({ to: n.link }); }}>
                <div className={cn("grid size-10 place-items-center rounded-xl", n.read ? "bg-muted text-muted-foreground" : "bg-gradient-primary text-primary-foreground shadow-glow")}><I className="size-4" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                <span className="text-xs text-muted-foreground">{timeAgo(n.at)}</span>
                {!n.read && <span className="size-2 rounded-full bg-primary" />}
              </button>
              <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={() => actions.deleteNotif(n.id)}><Trash2 /></Button>
            </div>); })}
        </div>
      )}
    </div>
  );
}
