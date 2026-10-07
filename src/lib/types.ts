export type ProspectStatus =
  | "Nouveau"
  | "Formulaire envoyé"
  | "Formulaire complété"
  | "Infos manquantes"
  | "Prêt pour devis"
  | "Devis généré"
  | "Devis envoyé";
export type FormStatus = "Non envoyé" | "Envoyé" | "Complété";
export type QuoteStatus =
  | "Brouillon"
  | "À valider"
  | "Validé"
  | "Envoyé"
  | "Modifié"
  | "Accepté"
  | "Refusé";

export interface Prospect {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  service: string;
  source: "WhatsApp" | "Site web" | "Email" | "Téléphone" | "Recommandation";
  formId: string | null;
  formLink: string | null;
  formStatus: FormStatus;
  status: ProspectStatus;
  createdAt: string;
  lastInteraction: string;
  need: string;
  summary: string;
  collected: Record<string, string> | null;
  convId: string | null;
  documents: { name: string; size: string; at: string }[];
}

export interface Message {
  id: string;
  from: "client" | "agent" | "human";
  text: string;
  at: string;
}
export interface Conversation {
  id: string;
  name: string;
  company: string;
  phone: string;
  unread: number;
  status: "IA active" | "Humain" | "Résolu" | "À reprendre";
  intent: string;
  service: string | null;
  prospectId: string | null;
  messages: Message[];
}

export interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "select"
    | "multiselect"
    | "radio"
    | "date"
    | "textarea"
    | "upload";
  label: string;
  placeholder?: string;
  required: boolean;
  description?: string;
  options?: string[];
  condition?: string;
}
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sends: number;
  completion: number;
  updatedAt: string;
  status: "Publié" | "Brouillon";
  fields: FormField[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  formId: string;
  conditions: string;
  active: boolean;
  basePrice: number;
  unit: string;
}

export interface QuoteLine {
  id: string;
  desc: string;
  qty: number;
  price: number;
}
export interface Quote {
  id: string;
  ref: string;
  prospectId: string | null;
  client: string;
  company: string;
  email: string;
  service: string;
  lines: QuoteLine[];
  discount: number;
  tva: number;
  status: QuoteStatus;
  date: string;
  conditions: string;
  delay: string;
  validity: string;
  notes: string;
}

export type NotifType =
  | "Nouveau prospect"
  | "Formulaire envoyé"
  | "Formulaire complété"
  | "Information manquante"
  | "Dossier prêt pour devis"
  | "Devis généré"
  | "Devis envoyé"
  | "Intervention humaine requise";
export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  desc: string;
  at: string;
  read: boolean;
  link: string;
}

export type ActivityCat = "Conversations" | "Prospection" | "Formulaires" | "Devis" | "IA" | "Email";
export interface Activity {
  id: string;
  at: string;
  category: ActivityCat;
  type: string;
  actor: string;
  prospect: string;
  result: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "Actif" | "Brouillon";
  date: string;
}
export interface KbDoc {
  id: string;
  name: string;
  type: string;
  description: string;
  date: string;
  status: "Indexé" | "En cours" | "Archivé";
}
export interface KbInfo {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "Actif" | "Brouillon";
}

export interface AiExchange {
  id: string;
  contact: string;
  convId: string;
  question: string;
  answer: string;
  source: string;
  status: "Répondu" | "Non résolu" | "Escaladé";
  date: string;
}

export interface Detection {
  id: string;
  message: string;
  contact: string;
  intent: "Question générale" | "Demande de prestation" | "Demande de devis" | "Information manquante";
  confidence: number;
  action: string;
  prospect: string;
}
