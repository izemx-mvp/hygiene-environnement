import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity, Bell, BookOpen, ChevronLeft, ClipboardList, FileSpreadsheet, FileText, LayoutDashboard,
  LogOut, Mail, Menu, Plus, Search, Settings, Users, Wand2, Briefcase, User, Droplets,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { actions, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedBg } from "./AnimatedBg";
import { timeAgo } from "./bits";
import { SERVICES } from "@/lib/mock";

type NavItem = { to: string; label: string; icon: typeof Bell };
const NAV: { group?: string; items: NavItem[] }[] = [
  { items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Service Client & Prospection IA", items: [
    { to: "/prospects", label: "Prospects", icon: Users },
    { to: "/forms", label: "Formulaires", icon: ClipboardList },
    { to: "/services", label: "Prestations", icon: Briefcase },
    { to: "/knowledge", label: "Base de connaissances", icon: BookOpen },
  ] },
  { group: "Devis", items: [
    { to: "/quote-generator", label: "Configuration Générateur de Devis IA", icon: Wand2 },
    { to: "/quotes", label: "Devis", icon: FileSpreadsheet },
    { to: "/email", label: "Envoi email & Relances", icon: Mail },
  ] },
  { group: "Système", items: [
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/activity", label: "Activité", icon: Activity },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ] },
];
const ALL = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group ?? "Général" })));

function SidebarBody({ collapsed, onNav }: { collapsed: boolean; onNav?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 items-center gap-3 px-5", collapsed && "justify-center px-0")}>
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-primary shadow-glow"><Droplets className="size-5 text-primary-foreground" /></div>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold text-sidebar-accent-foreground">HygiEnv<span className="text-primary">.ai</span></p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Hygiène & Environnement</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {NAV.map((g, gi) => (
          <div key={gi}>
            {g.group && !collapsed && <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">{g.group}</p>}
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = pathname === it.to || pathname.startsWith(it.to + "/");
                const badge = it.to === "/notifications" ? unread : 0;
                const link = (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={onNav}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active && "bg-sidebar-accent text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-glow" />}
                    <it.icon className={cn("size-[18px] shrink-0 transition-colors", active ? "text-primary" : "text-sidebar-foreground/70 group-hover:text-primary")} />
                    {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
                    {badge > 0 && (
                      <span className={cn("grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground", collapsed && "absolute right-1 top-0.5 min-w-4 px-1")}>{badge}</span>
                    )}
                  </Link>
                );
                return collapsed ? (
                  <Tooltip key={it.to}><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{it.label}</TooltipContent></Tooltip>
                ) : link;
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn("flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-sidebar-accent", collapsed && "justify-center")}>
            <div className="grid size-9 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">IE</div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">Imane El Bijri</p>
                <p className="text-xs text-sidebar-foreground/60">Sales Manager</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>commercial@entreprise.ma</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { onNav?.(); navigate({ to: "/settings" }); }}><User /> Mon profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onNav?.(); navigate({ to: "/settings" }); }}><Settings /> Paramètres</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { actions.logout(); toast("Déconnecté"); navigate({ to: "/" }); }} className="text-destructive"><LogOut /> Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function NotifPopover() {
  const notifs = useStore((s) => s.notifications);
  const navigate = useNavigate();
  const unread = notifs.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell />
          {unread > 0 && <span key={unread} className="absolute right-1 top-1 grid size-4 animate-fade-up place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Notifications</p>
          <button className="text-xs font-medium text-primary hover:underline" onClick={() => actions.markAllNotifs()}>Tout marquer comme lu</button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifs.slice(0, 8).map((n) => (
            <button
              key={n.id}
              onClick={() => { actions.markNotif(n.id); setOpen(false); navigate({ to: n.link }); }}
              className="flex w-full gap-3 border-b px-4 py-3 text-left transition hover:bg-accent/60"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary animate-pulse-ring")} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{n.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{n.desc}</span>
                <span className="text-[11px] text-muted-foreground/80">{timeAgo(n.at)}</span>
              </span>
            </button>
          ))}
        </div>
        <button className="w-full py-2.5 text-center text-sm font-medium text-primary hover:bg-accent/60" onClick={() => { setOpen(false); navigate({ to: "/notifications" }); }}>
          Voir toutes les notifications
        </button>
      </PopoverContent>
    </Popover>
  );
}

function CmdK({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  const navigate = useNavigate();
  const prospects = useStore((s) => s.prospects);
  const quotes = useStore((s) => s.quotes);
  const go = (to: string, params?: Record<string, string>) => { setOpen(false); navigate({ to, params } as never); };
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher un prospect, un devis, une page..." />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Pages">
          {ALL.map((p) => <CommandItem key={p.to} onSelect={() => go(p.to)}><p.icon /> {p.label}</CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Prospects">
          {prospects.map((p) => <CommandItem key={p.id} value={`${p.name} ${p.company}`} onSelect={() => go("/prospects/$id", { id: p.id })}><Users /> {p.name} <span className="text-muted-foreground">· {p.company}</span></CommandItem>)}
        </CommandGroup>
        <CommandGroup heading="Devis">
          {quotes.map((q) => <CommandItem key={q.id} value={`${q.ref} ${q.company}`} onSelect={() => go("/quotes/$id", { id: q.id })}><FileText /> {q.ref} <span className="text-muted-foreground">· {q.company}</span></CommandItem>)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function NewProspectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", company: "", phone: "", email: "", city: "Casablanca", service: SERVICES[0], source: "WhatsApp", need: "" });
  const [err, setErr] = useState<Record<string, boolean>>({});
  const submit = () => {
    const e = { name: !f.name.trim(), company: !f.company.trim(), email: !!f.email && !/\S+@\S+\.\S+/.test(f.email) };
    setErr(e);
    if (Object.values(e).some(Boolean)) return toast.error("Veuillez corriger les champs en rouge");
    const p = actions.addProspect({ ...f, source: f.source as never });
    toast.success("Prospect créé", { description: `${p.name} — ${p.company}` });
    onOpenChange(false);
    setF({ ...f, name: "", company: "", phone: "", email: "", need: "" });
    navigate({ to: "/prospects/$id", params: { id: p.id } });
  };
  const fld = (k: keyof typeof f, label: string, ph = "") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={f[k]} placeholder={ph} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={err[k] ? "border-destructive" : ""} />
    </div>
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Nouveau prospect</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {fld("name", "Nom complet *", "Karim Benali")}
          {fld("company", "Société *", "Atlas Protection")}
          {fld("phone", "Téléphone", "+212 6...")}
          {fld("email", "Email", "contact@societe.ma")}
          {fld("city", "Ville")}
          <div className="space-y-1.5">
            <Label>Prestation</Label>
            <Select value={f.service} onValueChange={(v) => setF({ ...f, service: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5"><Label>Besoin exprimé</Label><Textarea value={f.need} onChange={(e) => setF({ ...f, need: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="premium" onClick={submit}><Plus /> Créer le prospect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LABELS: Record<string, string> = Object.fromEntries(ALL.map((a) => [a.to.slice(1), a.label]));

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [np, setNp] = useState(false);
  const { pathname } = useLocation();
  const prospects = useStore((s) => s.prospects);
  const quotes = useStore((s) => s.quotes);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd((o) => !o); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const segs = pathname.split("/").filter(Boolean);
  const crumbs = segs.map((s, i) => {
    if (i === 1 && segs[0] === "prospects") return prospects.find((p) => p.id === s)?.name ?? s;
    if (i === 1 && segs[0] === "quotes") return quotes.find((q) => q.id === s)?.ref ?? s;
    if (i === 1 && segs[0] === "forms") return "Builder";
    return LABELS[s] ?? s;
  });

  return (
    <TooltipProvider delayDuration={150}>
      <AnimatedBg />
      <div className="flex min-h-screen">
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 transition-[width] duration-300 lg:block", collapsed ? "w-[76px]" : "w-[264px]")}>
          <SidebarBody collapsed={collapsed} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Réduire la sidebar"
            className="absolute -right-3 top-[22px] z-10 grid size-6 place-items-center rounded-full border bg-card text-muted-foreground shadow-soft transition hover:text-primary"
          >
            <ChevronLeft className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </aside>
        <Sheet open={mobile} onOpenChange={setMobile}>
          <SheetContent side="left" className="w-[280px] border-0 p-0"><SidebarBody collapsed={false} onNav={() => setMobile(false)} /></SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 md:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobile(true)} aria-label="Menu"><Menu /></Button>
            <nav className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Accueil</Link>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 truncate">
                  <span className="text-muted-foreground/50">/</span>
                  {i === crumbs.length - 1 ? <span className="truncate font-semibold">{c}</span> : <Link to={`/${segs.slice(0, i + 1).join("/")}` as never} className="text-muted-foreground hover:text-foreground">{c}</Link>}
                </span>
              ))}
            </nav>
            <button onClick={() => setCmd(true)} className="ml-auto flex h-9 w-full max-w-xs items-center gap-2 rounded-xl border bg-card/70 px-3 text-sm text-muted-foreground shadow-soft transition hover:border-primary/40">
              <Search className="size-4" /> <span className="flex-1 text-left">Rechercher...</span>
              <kbd className="rounded-md border bg-muted px-1.5 text-[10px] font-semibold">Ctrl K</kbd>
            </button>
            <div className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success xl:flex">
              <span className="size-1.5 animate-pulse rounded-full bg-success" /> Agents IA en ligne
            </div>
            <Button variant="premium" size="sm" className="hidden sm:inline-flex" onClick={() => setNp(true)}><Plus /> Nouveau prospect</Button>
            <NotifPopover />
            <div className="hidden size-8 place-items-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground md:grid">IE</div>
          </header>
          <main key={pathname} className="min-w-0 flex-1 animate-fade-up p-4 md:p-6 xl:p-8">{children}</main>
        </div>
      </div>
      <CmdK open={cmd} setOpen={setCmd} />
      <NewProspectDialog open={np} onOpenChange={setNp} />
    </TooltipProvider>
  );
}
