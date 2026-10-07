import { useSyncExternalStore } from "react";
import * as M from "./mock";
import type {
  Activity,
  ActivityCat,
  Conversation,
  Faq,
  FormTemplate,
  KbDoc,
  KbInfo,
  Notification,
  NotifType,
  Prospect,
  Quote,
  QuoteStatus,
  Service,
} from "./types";

export interface State {
  authed: boolean;
  prospects: Prospect[];
  conversations: Conversation[];
  forms: FormTemplate[];
  services: Service[];
  quotes: Quote[];
  notifications: Notification[];
  activities: Activity[];
  faqs: Faq[];
  kbDocs: KbDoc[];
  kbInfos: KbInfo[];
  aiExchanges: typeof M.aiExchanges;
  detections: typeof M.detections;
  company: Record<string, string>;
}

let state: State = {
  authed: false,
  prospects: M.prospects,
  conversations: M.conversations,
  forms: M.forms,
  services: M.services,
  quotes: M.quotes,
  notifications: M.notifications,
  activities: M.activities,
  faqs: M.faqs,
  kbDocs: M.kbDocs,
  kbInfos: M.kbInfos,
  aiExchanges: M.aiExchanges,
  detections: M.detections,
  company: {
    name: "HygiEnv Maroc SARL",
    address: "45 Boulevard d'Anfa, 20250 Casablanca",
    phone: "+212 522 47 89 10",
    email: "contact@hygienv.ma",
    rc: "RC 412789",
    ice: "002345678000091",
    if: "IF 45127890",
  },
};
const listeners = new Set<() => void>();
const set = (fn: (s: State) => Partial<State>) => {
  state = { ...state, ...fn(state) };
  listeners.forEach((l) => l());
};
export const getState = () => state;
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
    () => sel(state),
  );
}

let seq = 1000;
export const uid = (p: string) => `${p}-${++seq}`;
const now = () => new Date().toISOString();

const notify = (type: NotifType, title: string, desc: string, link: string) =>
  set((s) => ({ notifications: [{ id: uid("n"), type, title, desc, link, at: now(), read: false }, ...s.notifications] }));
const log = (category: ActivityCat, type: string, actor: string, prospect: string, result: string) =>
  set((s) => ({ activities: [{ id: uid("a"), at: now(), category, type, actor, prospect, result }, ...s.activities] }));

const patchProspect = (id: string, p: Partial<Prospect>) =>
  set((s) => ({ prospects: s.prospects.map((x) => (x.id === id ? { ...x, ...p, lastInteraction: now() } : x)) }));
const patchConv = (id: string, p: Partial<Conversation>) =>
  set((s) => ({ conversations: s.conversations.map((x) => (x.id === id ? { ...x, ...p } : x)) }));

export const actions = {
  login: () => set(() => ({ authed: true })),
  logout: () => set(() => ({ authed: false })),
  setCompany: (c: Record<string, string>) => set(() => ({ company: c })),

  addProspect(data: Partial<Prospect> & { name: string; company: string; service: string }) {
    const p: Prospect = {
      id: uid("p"),
      phone: "",
      email: "",
      city: "Casablanca",
      source: "WhatsApp",
      formId: null,
      formLink: null,
      formStatus: "Non envoyé",
      status: "Nouveau",
      createdAt: now(),
      lastInteraction: now(),
      need: "",
      summary: "Prospect créé manuellement.",
      collected: null,
      convId: null,
      documents: [],
      ...data,
    };
    set((s) => ({ prospects: [p, ...s.prospects] }));
    notify("Nouveau prospect", "Nouveau prospect", `${p.name} — ${p.company}`, `/prospects/${p.id}`);
    log("Prospection", "Prospect créé", p.source === "WhatsApp" && p.convId ? "Agent Service Client" : "Imane El Bijri", p.name, "Ajouté à la liste");
    return p;
  },
  updateProspect(id: string, p: Partial<Prospect>) {
    patchProspect(id, p);
  },

  createProspectFromConv(convId: string) {
    const c = state.conversations.find((x) => x.id === convId)!;
    if (c.prospectId) return state.prospects.find((p) => p.id === c.prospectId)!;
    const service = c.service ?? "Audit Hygiène";
    const p = actions.addProspect({
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: `contact@${c.company.toLowerCase().replace(/[^a-z]/g, "")}.ma`,
      service,
      source: "WhatsApp",
      convId,
      need: c.messages.filter((m) => m.from === "client").map((m) => m.text).join(" "),
      summary: `Demande détectée automatiquement par l'Agent IA depuis WhatsApp : ${service}.`,
    });
    patchConv(convId, { prospectId: p.id, intent: "Demande de prestation", service });
    log("IA", "Demande de prestation détectée", "Agent Service Client", c.name, `${service} · confiance 94%`);
    return p;
  },

  sendForm(prospectId: string, formId: string, channel: string, message: string, link: string) {
    const p = state.prospects.find((x) => x.id === prospectId)!;
    const f = state.forms.find((x) => x.id === formId)!;
    patchProspect(prospectId, { formId, formLink: link, formStatus: "Envoyé", status: "Formulaire envoyé" });
    set((s) => ({ forms: s.forms.map((x) => (x.id === formId ? { ...x, sends: x.sends + 1 } : x)) }));
    if (p.convId && channel === "WhatsApp") {
      actions.pushMessage(p.convId, "agent", `${message}\n🔗 https://${link}`);
    }
    notify("Formulaire envoyé", "Formulaire envoyé", `${f.name} envoyé à ${p.name} via ${channel}`, `/prospects/${p.id}`);
    log("Formulaires", "Formulaire envoyé", "Agent Service Client", p.name, `${f.name} · ${channel}`);
  },

  completeForm(prospectId: string, data: Record<string, string>) {
    const p = state.prospects.find((x) => x.id === prospectId)!;
    const complete = Object.values(data).every((v) => v.trim() !== "");
    patchProspect(prospectId, {
      formStatus: "Complété",
      status: complete ? "Prêt pour devis" : "Infos manquantes",
      collected: { ...(p.collected ?? {}), ...data },
    });
    set((s) => ({ forms: s.forms.map((x) => (x.id === p.formId ? { ...x, completion: Math.min(99, x.completion + 1) } : x)) }));
    notify("Formulaire complété", "Formulaire complété", `${p.company} a complété le formulaire`, `/prospects/${p.id}`);
    log("Formulaires", "Formulaire complété", "Client", p.name, "Fiche enrichie");
    if (complete) {
      notify("Dossier prêt pour devis", "Dossier prêt pour devis", `${p.company} — ${p.service}`, "/quote-generator");
      log("Prospection", "Dossier prêt pour devis", "Agent Service Client", p.name, "Toutes les informations reçues");
    }
  },

  markReady(prospectId: string) {
    const p = state.prospects.find((x) => x.id === prospectId)!;
    patchProspect(prospectId, { status: "Prêt pour devis" });
    notify("Dossier prêt pour devis", "Dossier prêt pour devis", `${p.company} — ${p.service}`, "/quote-generator");
    log("Prospection", "Dossier marqué prêt pour devis", "Imane El Bijri", p.name, "Statut mis à jour");
  },

  generateQuote(prospectId: string) {
    const p = state.prospects.find((x) => x.id === prospectId)!;
    const svc = state.services.find((s) => s.name === p.service)!;
    const n = 41 + state.quotes.length - 9 + 1;
    const qty = p.service === "Formation HSE" ? parseInt(p.collected?.["Surface / participants"] ?? "10") || 10 : 2;
    const q: Quote = {
      id: uid("q"),
      ref: `DEV-2026-${String(n).padStart(4, "0")}`,
      prospectId,
      client: p.name,
      company: p.company,
      email: p.email,
      service: p.service,
      lines: [
        { id: uid("l"), desc: `${svc.name} — ${svc.unit}`, qty, price: svc.basePrice },
        { id: uid("l"), desc: "Rapport détaillé & plan d'action", qty: 1, price: 2500 },
        { id: uid("l"), desc: `Frais de déplacement — ${p.city}`, qty: 1, price: p.city === "Casablanca" ? 0 : 1200 },
      ],
      discount: 0,
      tva: 20,
      status: "À valider",
      date: now(),
      conditions: "50% à la commande, solde à la livraison du rapport.",
      delay: "15 jours ouvrés",
      validity: "30 jours",
      notes: "",
    };
    set((s) => ({ quotes: [q, ...s.quotes] }));
    patchProspect(prospectId, { status: "Devis généré" });
    notify("Devis généré", `Devis ${q.ref} généré`, `${p.company} — ${p.service}`, `/quotes/${q.id}`);
    log("Devis", `Devis ${q.ref} généré`, "Agent Générateur de Devis", p.name, "PDF créé");
    return q;
  },
  addQuote(q: Omit<Quote, "id" | "ref">) {
    const nq = { ...q, id: uid("q"), ref: `DEV-2026-${String(41 + state.quotes.length).padStart(4, "0")}` };
    set((s) => ({ quotes: [nq, ...s.quotes] }));
    log("Devis", `Devis ${nq.ref} créé`, "Imane El Bijri", nq.client, "Brouillon");
    return nq;
  },
  saveQuote(q: Quote, status?: QuoteStatus) {
    const nq = { ...q, status: status ?? (q.status === "Brouillon" ? "Brouillon" : "Modifié") };
    set((s) => ({ quotes: s.quotes.map((x) => (x.id === q.id ? nq : x)) }));
    log("Devis", status === "Validé" ? `Devis ${q.ref} validé` : `Devis ${q.ref} modifié`, "Imane El Bijri", q.client, nq.status);
  },
  setQuoteStatus(id: string, status: QuoteStatus) {
    const q = state.quotes.find((x) => x.id === id)!;
    set((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, status } : x)) }));
    log("Devis", `Devis ${q.ref} → ${status}`, "Imane El Bijri", q.client, status);
  },
  deleteQuote(id: string) {
    set((s) => ({ quotes: s.quotes.filter((x) => x.id !== id) }));
  },
  sendQuoteEmail(id: string, to: string) {
    const q = state.quotes.find((x) => x.id === id)!;
    set((s) => ({ quotes: s.quotes.map((x) => (x.id === id ? { ...x, status: "Envoyé" } : x)) }));
    if (q.prospectId) patchProspect(q.prospectId, { status: "Devis envoyé" });
    notify("Devis envoyé", "Devis envoyé par email", `${q.ref} envoyé à ${to}`, `/quotes/${q.id}`);
    log("Email", "Email envoyé au client", "Imane El Bijri", q.client, `${q.ref} → ${to}`);
  },

  pushMessage(convId: string, from: "client" | "agent" | "human", text: string) {
    const c = state.conversations.find((x) => x.id === convId)!;
    patchConv(convId, { messages: [...c.messages, { id: uid("m"), from, text, at: now() }] });
  },
  readConv: (id: string) => patchConv(id, { unread: 0 }),
  takeover(convId: string) {
    const c = state.conversations.find((x) => x.id === convId)!;
    patchConv(convId, { status: "Humain" });
    notify("Intervention humaine requise", "Prise de relais humain", `Vous avez repris la conversation avec ${c.name}`, "/notifications");
    log("Conversations", "Prise de relais humain", "Imane El Bijri", c.name, "IA en pause");
  },
  resumeAi: (convId: string) => patchConv(convId, { status: "IA active" }),
  newConversation(name: string, company: string, phone: string, text: string) {
    const c: Conversation = {
      id: uid("c"),
      name,
      company,
      phone,
      unread: 0,
      status: "Humain",
      intent: "Question générale",
      service: null,
      prospectId: null,
      messages: [{ id: uid("m"), from: "human", text, at: now() }],
    };
    set((s) => ({ conversations: [c, ...s.conversations] }));
    log("Conversations", "Nouvelle conversation", "Imane El Bijri", name, "Message envoyé");
    return c;
  },
  setConvIntent: (id: string, intent: string, service: string | null) => patchConv(id, { intent, service }),

  markNotif: (id: string) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotifs: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  deleteNotif: (id: string) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  upsert<K extends "faqs" | "kbDocs" | "kbInfos" | "forms" | "services">(key: K, item: State[K][number]) {
    set((s) => {
      const list = s[key] as { id: string }[];
      const exists = list.some((x) => x.id === item.id);
      return { [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list] } as Partial<State>;
    });
  },
  remove<K extends "faqs" | "kbDocs" | "kbInfos" | "forms" | "services">(key: K, id: string) {
    set((s) => ({ [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<State>);
  },
  patchDetection: (id: string, p: Partial<State["detections"][number]>) =>
    set((s) => ({ detections: s.detections.map((d) => (d.id === id ? { ...d, ...p } : d)) })),
  patchExchange: (id: string, p: Partial<State["aiExchanges"][number]>) =>
    set((s) => ({ aiExchanges: s.aiExchanges.map((d) => (d.id === id ? { ...d, ...p } : d)) })),
  log,
  notify,
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const mad = (n: number) =>
  new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " MAD";
export const quoteTotals = M.quoteTotals;
