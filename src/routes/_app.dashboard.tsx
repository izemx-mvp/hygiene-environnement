import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, ClipboardCheck, FileText, FolderCheck, MessageCircle, Send, UserPlus, Headphones } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useStore } from "@/lib/store";
import { SERVICES } from "@/lib/mock";
import { PageHeader, Sparkline, timeAgo } from "@/components/app/bits";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HygiEnv.ai" },
      { name: "description", content: "Activité de vos Agents IA : conversations, prospects, formulaires et devis." },
      { property: "og:title", content: "Dashboard — HygiEnv.ai" },
      { property: "og:description", content: "Vue d'ensemble du pipeline commercial piloté par l'IA." },
    ],
  }),
  component: Dashboard,
});

const PERIODS = { today: ["Aujourd'hui", 0.08], "7d": ["7 jours", 0.35], "30d": ["30 jours", 1], "3m": ["3 mois", 2.7] } as const;
type P = keyof typeof PERIODS;
const COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)"];

function Dashboard() {
  const [period, setPeriod] = useState<P>("30d");
  const navigate = useNavigate();
  const prospects = useStore((s) => s.prospects);
  const convs = useStore((s) => s.conversations);
  const quotes = useStore((s) => s.quotes);
  const acts = useStore((s) => s.activities);
  const f = PERIODS[period][1];
  const sc = (n: number, base: number) => Math.max(n, Math.round(base * f));

  const counts = useMemo(() => {
    const st = (arr: string[]) => prospects.filter((p) => arr.includes(p.status)).length;
    return {
      conv: convs.length,
      prospects: prospects.length,
      sent: prospects.filter((p) => p.formStatus !== "Non envoyé").length,
      done: prospects.filter((p) => p.formStatus === "Complété").length,
      ready: st(["Prêt pour devis"]),
      quotes: quotes.length,
      st,
    };
  }, [prospects, convs, quotes]);

  const kpis = [
    { label: "Nouvelles conversations", v: sc(counts.conv, 142), d: "+18%", icon: MessageCircle, to: "/conversations" },
    { label: "Prospects créés", v: sc(counts.prospects, 64), d: "+12%", icon: UserPlus, to: "/prospects" },
    { label: "Formulaires envoyés", v: sc(counts.sent, 51), d: "+9%", icon: Send, to: "/forms" },
    { label: "Formulaires complétés", v: sc(counts.done, 42), d: "+15%", icon: ClipboardCheck, to: "/prospects" },
    { label: "Prêts pour devis", v: counts.ready, d: "+4", icon: FolderCheck, to: "/quote-generator" },
    { label: "Devis générés", v: sc(counts.quotes, 29), d: "+21%", icon: FileText, to: "/quotes" },
  ];
  const pipeline = [
    ["Conversation reçue", sc(counts.conv, 142)],
    ["Demande détectée", sc(counts.prospects + 4, 96)],
    ["Prospect créé", sc(counts.prospects, 64)],
    ["Formulaire envoyé", sc(counts.sent, 51)],
    ["Formulaire complété", sc(counts.done, 42)],
    ["Prêt pour devis", counts.ready + counts.st(["Devis généré", "Devis envoyé"])],
    ["Devis généré", sc(counts.quotes, 29)],
  ] as const;
  const max = pipeline[0][1];
  const pie = SERVICES.map((s) => ({ name: s, value: prospects.filter((p) => p.service === s).length }));
  const trend = Array.from({ length: 12 }, (_, i) => ({ d: `S${i + 1}`, conv: Math.round((20 + i * 3 + ((i * 7) % 9)) * f * 1.4), prospects: Math.round((8 + i * 1.6 + ((i * 5) % 6)) * f * 1.4) }));
  const missing = counts.st(["Infos manquantes"]);
  const toValidate = quotes.filter((q) => q.status === "À valider").length;
  const toTake = convs.filter((c) => c.status === "À reprendre").length;

  return (
    <div>
      <PageHeader
        title="Bonjour Imane, voici l'activité de vos Agents IA."
        subtitle="Mercredi 7 octobre 2026 · Données en temps réel"
        actions={
          <Tabs value={period} onValueChange={(v) => setPeriod(v as P)}>
            <TabsList>{(Object.keys(PERIODS) as P[]).map((k) => <TabsTrigger key={k} value={k}>{PERIODS[k][0]}</TabsTrigger>)}</TabsList>
          </Tabs>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <Link key={k.label} to={k.to} className="card-premium card-hover group animate-fade-up p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center justify-between">
              <div className="grid size-9 place-items-center rounded-xl bg-accent text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground"><k.icon className="size-4" /></div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">{k.d}</span>
            </div>
            <p key={k.v} className="mt-4 animate-fade-up font-display text-3xl font-semibold">{k.v}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
              <Sparkline data={trend.map((t, j) => t.conv * ((i + 2) / 3) + ((j * (i + 3)) % 7))} className="h-6 w-14" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card-premium p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div><h3 className="font-semibold">Pipeline commercial</h3><p className="text-xs text-muted-foreground">De la conversation WhatsApp au devis</p></div>
            <Link to="/prospects" className="flex items-center gap-1 text-xs font-semibold text-primary">Voir prospects <ArrowUpRight className="size-3.5" /></Link>
          </div>
          <div className="space-y-2.5">
            {pipeline.map(([l, v], i) => (
              <div key={l} className="group flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs font-medium text-muted-foreground">{l}</span>
                <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-muted">
                  <div className="h-full rounded-lg bg-gradient-primary transition-all duration-700" style={{ width: `${Math.max(8, (v / max) * 100)}%`, opacity: 1 - i * 0.08 }} />
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-primary-foreground">{v}</span>
                </div>
                <span className="w-12 text-right text-xs font-semibold text-muted-foreground">{Math.round((v / max) * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-40">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="1" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                </defs>
                <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="conv" name="Conversations" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="prospects" name="Prospects" stroke="var(--chart-3)" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="font-semibold">Actions requises</h3>
          <div className="mt-4 space-y-3">
            {[
              { n: missing, t: "dossiers avec informations manquantes", icon: AlertTriangle, to: "/prospects", tone: "text-warning-foreground bg-warning/15" },
              { n: toValidate, t: "devis à valider", icon: FileText, to: "/quotes", tone: "text-primary bg-primary/10" },
              { n: toTake, t: "conversations à reprendre manuellement", icon: Headphones, to: "/conversations", tone: "text-destructive bg-destructive/10" },
            ].map((a) => (
              <button key={a.t} onClick={() => navigate({ to: a.to })} className="card-hover flex w-full items-center gap-3 rounded-xl border p-3 text-left">
                <div className={cn("grid size-10 place-items-center rounded-xl", a.tone)}><a.icon className="size-4" /></div>
                <p className="flex-1 text-sm"><b className="font-display text-lg">{a.n}</b> {a.t}</p>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <h3 className="mt-7 font-semibold">Répartition par prestation</h3>
          <div className="flex items-center gap-4">
            <div className="h-36 w-36">
              <ResponsiveContainer>
                <PieChart><Pie data={pie} dataKey="value" innerRadius={42} outerRadius={64} paddingAngle={3} stroke="none">{pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {pie.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 text-xs"><span className="size-2.5 rounded-full" style={{ background: COLORS[i] }} /><span className="flex-1">{p.name}</span><b>{p.value}</b></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Activité récente</h3>
          <Link to="/activity" className="flex items-center gap-1 text-xs font-semibold text-primary">Tout voir <ArrowUpRight className="size-3.5" /></Link>
        </div>
        <div className="divide-y">
          {acts.slice(0, 7).map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-3 animate-fade-up">
              <span className="size-2 rounded-full bg-primary" />
              <p className="flex-1 text-sm"><b className="font-semibold">{a.type}</b> <span className="text-muted-foreground">· {a.prospect} · {a.actor}</span></p>
              <span className="text-xs text-muted-foreground">{timeAgo(a.at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
