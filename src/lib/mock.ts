import type {
  Activity,
  AiExchange,
  Conversation,
  Detection,
  Faq,
  FormTemplate,
  KbDoc,
  KbInfo,
  Notification,
  Prospect,
  ProspectStatus,
  Quote,
  Service,
} from "./types";

export const NOW = new Date("2026-10-07T10:30:00Z").getTime();
export const ago = (min: number) => new Date(NOW - min * 60000).toISOString();

export const SERVICES = ["Audit Hygiène", "Audit Environnement", "Formation HSE", "Accompagnement conformité"];

export const forms: FormTemplate[] = [
  {
    id: "f-hyg",
    name: "Audit Hygiène",
    description: "Évaluation complète des pratiques d'hygiène, HACCP et nettoyage des locaux.",
    sends: 48,
    completion: 82,
    updatedAt: ago(60 * 26),
    status: "Publié",
    fields: [
      { id: "a1", type: "text", label: "Raison sociale", required: true, placeholder: "Ex. Atlas Protection" },
      { id: "a2", type: "select", label: "Secteur d'activité", required: true, options: ["Agroalimentaire", "Restauration", "Santé", "Industrie", "Hôtellerie"] },
      { id: "a3", type: "number", label: "Surface des locaux (m²)", required: true, placeholder: "1200" },
      { id: "a4", type: "multiselect", label: "Zones à auditer", required: false, options: ["Cuisine", "Stockage", "Sanitaires", "Production"] },
      { id: "a5", type: "date", label: "Date souhaitée", required: false },
    ],
  },
  {
    id: "f-env",
    name: "Audit Environnement",
    description: "Diagnostic des impacts environnementaux, gestion des déchets et rejets.",
    sends: 31,
    completion: 74,
    updatedAt: ago(60 * 72),
    status: "Publié",
    fields: [
      { id: "b1", type: "text", label: "Site concerné", required: true },
      { id: "b2", type: "radio", label: "Certification visée", required: true, options: ["ISO 14001", "Aucune", "Autre"] },
      { id: "b3", type: "textarea", label: "Types de déchets produits", required: false },
    ],
  },
  {
    id: "f-hse",
    name: "Formation HSE",
    description: "Recueil des besoins de formation santé, sécurité et environnement.",
    sends: 57,
    completion: 88,
    updatedAt: ago(60 * 5),
    status: "Publié",
    fields: [
      { id: "c1", type: "number", label: "Nombre de participants", required: true },
      { id: "c2", type: "select", label: "Module", required: true, options: ["Sécurité incendie", "Premiers secours", "Risques chimiques", "Gestes & postures"] },
      { id: "c3", type: "radio", label: "Format", required: true, options: ["Sur site", "Dans nos locaux", "Distanciel"] },
    ],
  },
  {
    id: "f-conf",
    name: "Accompagnement conformité",
    description: "Analyse réglementaire et plan d'action de mise en conformité.",
    sends: 22,
    completion: 69,
    updatedAt: ago(60 * 120),
    status: "Publié",
    fields: [
      { id: "d1", type: "multiselect", label: "Référentiels", required: true, options: ["Loi 28-07", "ONSSA", "ISO 45001", "ISO 22000"] },
      { id: "d2", type: "textarea", label: "Non-conformités connues", required: false },
      { id: "d3", type: "upload", label: "Rapport d'audit précédent", required: false },
    ],
  },
  {
    id: "f-custom",
    name: "Formulaire personnalisé",
    description: "Modèle libre pour les demandes spécifiques hors catalogue.",
    sends: 9,
    completion: 55,
    updatedAt: ago(60 * 300),
    status: "Brouillon",
    fields: [{ id: "e1", type: "textarea", label: "Décrivez votre besoin", required: true }],
  },
];

export const formForService = (s: string) => forms.find((f) => f.name === s)?.id ?? "f-custom";

export const services: Service[] = [
  { id: "s1", name: "Audit Hygiène", description: "Audit terrain HACCP, contrôle des procédures de nettoyage et désinfection, rapport détaillé.", formId: "f-hyg", conditions: "Site > 100 m² · délai 10 jours", active: true, basePrice: 8500, unit: "jour d'audit" },
  { id: "s2", name: "Audit Environnement", description: "Diagnostic environnemental, cartographie des déchets, conformité aux rejets.", formId: "f-env", conditions: "Site industriel · visite obligatoire", active: true, basePrice: 12000, unit: "jour d'audit" },
  { id: "s3", name: "Formation HSE", description: "Sessions certifiantes pour vos équipes, sur site ou dans nos centres.", formId: "f-hse", conditions: "6 à 15 participants par session", active: true, basePrice: 650, unit: "participant" },
  { id: "s4", name: "Accompagnement conformité", description: "Mise en conformité réglementaire, plan d'action et suivi mensuel.", formId: "f-conf", conditions: "Engagement 3 mois minimum", active: true, basePrice: 15000, unit: "mois" },
];

const people: [string, string, string][] = [
  ["Karim Benali", "Atlas Protection", "Casablanca"],
  ["Sara Amrani", "Clean Solutions", "Rabat"],
  ["Youssef Alaoui", "Maroc Industries", "Tanger"],
  ["Nadia Fassi", "Eco Services", "Fès"],
  ["Mehdi El Idrissi", "Nova Hygiene", "Marrakech"],
  ["Salma Tazi", "Green Control", "Casablanca"],
  ["Omar Berrada", "Sahara Foods", "Agadir"],
  ["Leila Chraibi", "Riad Hotels Group", "Marrakech"],
  ["Hamza Ouazzani", "Oriental Pack", "Oujda"],
  ["Imane Kettani", "BioMed Clinic", "Rabat"],
  ["Anas Bennani", "Dar Lahlou Traiteur", "Casablanca"],
  ["Ghita Lahlou", "Atlantic Logistics", "Kénitra"],
  ["Rachid Mansouri", "Cimar Béton", "Settat"],
  ["Zineb Sqalli", "Pharma Nord", "Tétouan"],
  ["Adil Naciri", "Souss Agrumes", "Agadir"],
  ["Houda Benjelloun", "Medina Textiles", "Fès"],
  ["Khalid Rami", "Port Services Med", "Tanger"],
  ["Meryem Idrissi", "Cosmo Beauty", "Casablanca"],
  ["Tarik Sefrioui", "Ifrane Lodge", "Ifrane"],
  ["Soukaina Alami", "AgriPlus Doukkala", "El Jadida"],
  ["Yassine Hakimi", "Automotive Kenitra", "Kénitra"],
  ["Fatima Zahra Rhazi", "Ecole Al Manar", "Meknès"],
];

const statuses: ProspectStatus[] = [
  "Formulaire envoyé", "Formulaire complété", "Prêt pour devis", "Nouveau", "Devis généré",
  "Prêt pour devis", "Formulaire complété", "Formulaire envoyé", "Infos manquantes", "Prêt pour devis",
  "Devis envoyé", "Formulaire complété", "Nouveau", "Prêt pour devis", "Formulaire envoyé",
  "Formulaire complété", "Prêt pour devis", "Devis généré", "Formulaire envoyé", "Prêt pour devis",
  "Formulaire complété", "Prêt pour devis",
];
const sources: Prospect["source"][] = ["WhatsApp", "WhatsApp", "Site web", "WhatsApp", "Email", "Recommandation", "WhatsApp", "Téléphone"];

const needs: Record<string, string> = {
  "Audit Hygiène": "Audit HACCP de la cuisine centrale et des zones de stockage avant inspection ONSSA.",
  "Audit Environnement": "Diagnostic des rejets et plan de gestion des déchets industriels.",
  "Formation HSE": "Former les équipes de production à la sécurité incendie et aux premiers secours.",
  "Accompagnement conformité": "Mise en conformité ISO 45001 et accompagnement sur 6 mois.",
};

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");

export const prospects: Prospect[] = people.map(([name, company, city], i) => {
  const service = SERVICES[i % 4];
  const status = statuses[i];
  const formSent = status !== "Nouveau";
  const completed = !["Nouveau", "Formulaire envoyé"].includes(status);
  const formId = formForService(service);
  return {
    id: `p-${i + 1}`,
    name,
    company,
    city,
    phone: `+212 6${(61 + i * 7) % 90 + 10} ${String(100 + i * 37).slice(-3)} ${String(4000 + i * 913).slice(-3)}`,
    email: `${slug(name.split(" ")[0])}@${slug(company).replace(/\./g, "")}.ma`,
    service,
    source: sources[i % sources.length],
    formId: formSent ? formId : null,
    formLink: formSent ? `form.hygiene.ai/qf-${8400 + i * 13}` : null,
    formStatus: completed ? "Complété" : formSent ? "Envoyé" : "Non envoyé",
    status,
    createdAt: ago(60 * (8 + i * 19)),
    lastInteraction: ago(15 + i * 47),
    need: needs[service],
    summary: `${name.split(" ")[0]} (${company}, ${city}) a contacté l'entreprise pour un besoin en ${service.toLowerCase()}. Interlocuteur réactif, décisionnaire, budget à confirmer.`,
    collected: completed
      ? {
          "Raison sociale": company,
          Ville: city,
          Secteur: ["Agroalimentaire", "Industrie", "Santé", "Hôtellerie"][i % 4],
          Effectif: `${40 + i * 12} salariés`,
          ...(status === "Infos manquantes" ? {} : { "Surface / participants": i % 4 === 2 ? `${8 + (i % 5)} participants` : `${600 + i * 80} m²` }),
          "Date souhaitée": `${10 + (i % 18)}/11/2026`,
        }
      : null,
    convId: i < 15 ? `c-${i + 1}` : null,
    documents: completed ? [{ name: `Plan_locaux_${slug(company)}.pdf`, size: "1.2 Mo", at: ago(60 * (4 + i)) }] : [],
  };
});

const convScripts = (name: string, service: string): [Conversation["messages"][number]["from"], string][] => [
  ["client", `Bonjour, je suis ${name.split(" ")[0]}. Vous faites des prestations en ${service.toLowerCase()} ?`],
  ["agent", `Bonjour ${name.split(" ")[0]} 👋 Oui, nous accompagnons les entreprises sur l'${service.toLowerCase()}. Pouvez-vous me décrire votre site et votre besoin ?`],
  ["client", `Nous avons un contrôle prévu le mois prochain, on voudrait un ${service.toLowerCase()} complet. C'est possible d'avoir un devis ?`],
  ["agent", "Parfait. J'ai bien noté votre demande. Je vous envoie un court formulaire pour préciser votre besoin et préparer votre devis."],
];

export const conversations: Conversation[] = prospects.slice(0, 15).map((p, i) => {
  const script = convScripts(p.name, p.service);
  const n = p.status === "Nouveau" ? 3 : 4;
  return {
    id: `c-${i + 1}`,
    name: p.name,
    company: p.company,
    phone: p.phone,
    unread: i % 3 === 0 ? (i % 4) + 1 : 0,
    status: i === 3 || i === 8 ? "À reprendre" : i % 5 === 4 ? "Résolu" : i === 6 ? "Humain" : "IA active",
    intent: p.status === "Nouveau" ? "Demande de prestation" : "Demande de devis",
    service: p.service,
    prospectId: p.status === "Nouveau" && i === 3 ? null : p.id,
    messages: script.slice(0, n).map(([from, text], k) => ({ id: `m-${i}-${k}`, from, text, at: ago(20 + i * 47 + (n - k) * 4) })),
  };
});
// Two fresh conversations without prospect yet
conversations.unshift(
  {
    id: "c-new-1",
    name: "Hicham Zemmouri",
    company: "Boulangerie Le Fournil",
    phone: "+212 661 220 418",
    unread: 2,
    status: "IA active",
    intent: "Demande de prestation",
    service: "Audit Hygiène",
    prospectId: null,
    messages: [
      { id: "mn1", from: "client", text: "Salam, on ouvre un 2e point de vente à Casablanca et on doit passer l'agrément ONSSA.", at: ago(9) },
      { id: "mn2", from: "agent", text: "Bonjour Hicham ! Félicitations pour l'ouverture. Nous réalisons des audits hygiène pré-agrément ONSSA. Quelle est la surface du laboratoire ?", at: ago(8) },
      { id: "mn3", from: "client", text: "Environ 180 m². Vous pouvez venir la semaine prochaine ?", at: ago(4) },
    ],
  },
  {
    id: "c-new-2",
    name: "Asmae Bouzidi",
    company: "Clinique Les Orangers",
    phone: "+212 662 908 117",
    unread: 1,
    status: "IA active",
    intent: "Question générale",
    service: null,
    prospectId: null,
    messages: [
      { id: "mo1", from: "client", text: "Bonjour, quels sont vos horaires et est-ce que vous intervenez à Rabat ?", at: ago(14) },
      { id: "mo2", from: "agent", text: "Bonjour Asmae, nous sommes ouverts du lundi au vendredi de 8h30 à 18h et intervenons dans tout le Maroc, Rabat inclus.", at: ago(13) },
    ],
  },
);
prospects.forEach((p) => {
  if (p.convId && !conversations.find((c) => c.id === p.convId && c.prospectId === p.id)) p.convId = conversations.find((c) => c.id === p.convId) ? p.convId : null;
});

const line = (id: string, desc: string, qty: number, price: number) => ({ id, desc, qty, price });
const quoteFor = (p: Prospect, n: number, status: Quote["status"], days: number): Quote => {
  const svc = services.find((s) => s.name === p.service)!;
  return {
    id: `q-${n}`,
    ref: `DEV-2026-00${34 + n}`,
    prospectId: p.id,
    client: p.name,
    company: p.company,
    email: p.email,
    service: p.service,
    lines: [
      line("l1", `${svc.name} — ${svc.unit}`, p.service === "Formation HSE" ? 10 + n : 2 + (n % 3), svc.basePrice),
      line("l2", "Rapport détaillé & plan d'action", 1, 2500),
      line("l3", "Frais de déplacement", 1, 900 + n * 100),
    ],
    discount: n % 3 === 0 ? 5 : 0,
    tva: 20,
    status,
    date: ago(60 * 24 * days),
    conditions: "50% à la commande, solde à la livraison du rapport.",
    delay: "15 jours ouvrés",
    validity: "30 jours",
    notes: "",
  };
};
const qp = prospects.filter((p) => ["Devis généré", "Devis envoyé", "Prêt pour devis", "Formulaire complété"].includes(p.status));
const qStatuses: Quote["status"][] = ["Envoyé", "À valider", "Validé", "Accepté", "Brouillon", "Modifié", "Refusé", "Envoyé", "À valider"];
export const quotes: Quote[] = qStatuses.map((s, i) => quoteFor(qp[i % qp.length], i + 1, s, i * 2 + 1));
// keep prospect list coherent: only "Devis généré/envoyé" have quotes for first ones
export const quoteTotals = (q: Pick<Quote, "lines" | "discount" | "tva">) => {
  const sub = q.lines.reduce((a, l) => a + l.qty * l.price, 0);
  const disc = (sub * q.discount) / 100;
  const ht = sub - disc;
  const tva = (ht * q.tva) / 100;
  return { sub, disc, ht, tva, ttc: ht + tva };
};

const nt: [Notification["type"], string, string, string][] = [
  ["Nouveau prospect", "Nouveau prospect détecté", "Hicham Zemmouri — Boulangerie Le Fournil via WhatsApp", "/prospects"],
  ["Formulaire complété", "Formulaire complété", "Atlas Protection a complété l'Audit Hygiène", "/prospects/p-1"],
  ["Dossier prêt pour devis", "Dossier prêt pour devis", "Nova Hygiene — Audit Hygiène", "/quote-generator"],
  ["Devis généré", "Devis DEV-2026-0041 généré", "Par l'Agent Générateur de Devis", "/quotes"],
  ["Intervention humaine requise", "Reprise manuelle demandée", "Nadia Fassi souhaite parler à un conseiller", "/prospects"],
  ["Formulaire envoyé", "Formulaire envoyé", "Formation HSE envoyé à Youssef Alaoui", "/prospects/p-3"],
  ["Information manquante", "Information manquante", "Surface des locaux non renseignée — Oriental Pack", "/prospects/p-9"],
  ["Devis envoyé", "Devis envoyé par email", "DEV-2026-0035 envoyé à Karim Benali", "/quotes"],
];
export const notifications: Notification[] = Array.from({ length: 20 }, (_, i) => {
  const [type, title, desc, link] = nt[i % nt.length];
  return { id: `n-${i}`, type, title, desc, link, at: ago(6 + i * 53), read: i > 5 };
});

const acts: [Activity["category"], string, string, string][] = [
  ["Conversations", "Conversation reçue", "Agent Service Client", "Message entrant traité"],
  ["IA", "Demande de prestation détectée", "Agent Service Client", "Confiance 94%"],
  ["Prospection", "Prospect créé automatiquement", "Agent Service Client", "Ajouté à la liste"],
  ["Formulaires", "Formulaire envoyé", "Agent Service Client", "Lien WhatsApp délivré"],
  ["Formulaires", "Formulaire complété", "Client", "Fiche enrichie"],
  ["Prospection", "Dossier prêt pour devis", "Imane El Bijri", "Statut mis à jour"],
  ["Devis", "Devis généré", "Agent Générateur de Devis", "PDF créé"],
  ["Email", "Email envoyé au client", "Imane El Bijri", "Délivré"],
];
export const activities: Activity[] = Array.from({ length: 42 }, (_, i) => {
  const [category, type, actor, result] = acts[i % acts.length];
  const p = prospects[Math.floor(i / 2) % prospects.length];
  return {
    id: `a-${i}`,
    at: ago(4 + i * 37),
    category,
    type: type === "Devis généré" ? `Devis DEV-2026-00${41 - (i % 7)} généré` : type,
    actor,
    prospect: p.name,
    result,
  };
});

export const faqs: Faq[] = [
  { id: "fq1", question: "Intervenez-vous dans tout le Maroc ?", answer: "Oui, nos équipes couvrent l'ensemble du territoire avec des bases à Casablanca, Tanger et Agadir.", category: "Général", status: "Actif", date: ago(60 * 24 * 20) },
  { id: "fq2", question: "Quel est le délai pour un audit hygiène ?", answer: "Intervention sous 7 à 10 jours ouvrés, rapport livré 5 jours après la visite.", category: "Audit", status: "Actif", date: ago(60 * 24 * 12) },
  { id: "fq3", question: "Vos formations sont-elles certifiantes ?", answer: "Oui, chaque participant reçoit une attestation reconnue par l'OFPPT.", category: "Formation", status: "Actif", date: ago(60 * 24 * 8) },
  { id: "fq4", question: "Accompagnez-vous l'agrément ONSSA ?", answer: "Nous préparons le dossier, réalisons un audit à blanc et accompagnons la visite officielle.", category: "Conformité", status: "Actif", date: ago(60 * 24 * 5) },
  { id: "fq5", question: "Quels moyens de paiement acceptez-vous ?", answer: "Virement bancaire, chèque et paiement en deux fois pour les contrats annuels.", category: "Facturation", status: "Brouillon", date: ago(60 * 24 * 2) },
];
export const kbDocs: KbDoc[] = [
  { id: "d1", name: "Catalogue_prestations_2026.pdf", type: "PDF", description: "Catalogue complet avec tarifs indicatifs", date: ago(60 * 24 * 30), status: "Indexé" },
  { id: "d2", name: "Grille_tarifaire_HSE.xlsx", type: "Excel", description: "Tarifs formation par participant", date: ago(60 * 24 * 14), status: "Indexé" },
  { id: "d3", name: "Procedure_audit_HACCP.docx", type: "Word", description: "Méthodologie d'audit hygiène", date: ago(60 * 24 * 9), status: "Indexé" },
  { id: "d4", name: "Referentiel_ISO14001.pdf", type: "PDF", description: "Synthèse des exigences ISO 14001", date: ago(60 * 24 * 1), status: "En cours" },
];
export const kbInfos: KbInfo[] = [
  { id: "i1", title: "Horaires d'ouverture", content: "Lundi au vendredi, 8h30 – 18h00. Samedi matin sur rendez-vous.", category: "Entreprise", status: "Actif" },
  { id: "i2", title: "Adresse du siège", content: "45 Boulevard d'Anfa, 20250 Casablanca.", category: "Entreprise", status: "Actif" },
  { id: "i3", title: "Zone d'intervention", content: "Tout le Maroc. Frais de déplacement au-delà de 100 km.", category: "Opérations", status: "Actif" },
];

export const aiExchanges: AiExchange[] = [
  { id: "x1", contact: "Asmae Bouzidi", convId: "c-new-2", question: "Est-ce que vous intervenez à Rabat ?", answer: "Oui, nous intervenons dans tout le Maroc, Rabat inclus.", source: "Info · Zone d'intervention", status: "Répondu", date: ago(13) },
  { id: "x2", contact: "Hicham Zemmouri", convId: "c-new-1", question: "Vous pouvez venir la semaine prochaine ?", answer: "Je vérifie le planning avec un conseiller.", source: "—", status: "Non résolu", date: ago(4) },
  { id: "x3", contact: "Karim Benali", convId: "c-1", question: "Quel est le délai pour l'audit ?", answer: "Intervention sous 7 à 10 jours ouvrés.", source: "FAQ · Délai audit", status: "Répondu", date: ago(60) },
  { id: "x4", contact: "Nadia Fassi", convId: "c-4", question: "Je veux négocier le tarif directement avec quelqu'un.", answer: "Je transfère votre demande à Imane, notre Sales Manager.", source: "Règle · Escalade tarif", status: "Escaladé", date: ago(150) },
  { id: "x5", contact: "Sara Amrani", convId: "c-2", question: "Les formations sont certifiantes ?", answer: "Oui, attestation reconnue par l'OFPPT.", source: "FAQ · Formations", status: "Répondu", date: ago(210) },
  { id: "x6", contact: "Omar Berrada", convId: "c-7", question: "Vous gérez aussi la dératisation ?", answer: "Cette prestation n'est pas dans notre catalogue actuel.", source: "—", status: "Non résolu", date: ago(320) },
  { id: "x7", contact: "Hamza Ouazzani", convId: "c-9", question: "Je préfère qu'on m'appelle.", answer: "Un conseiller va vous contacter.", source: "Règle · Rappel", status: "Escaladé", date: ago(400) },
];

export const detections: Detection[] = [
  { id: "dt1", message: "Quels sont vos horaires d'ouverture ?", contact: "Asmae Bouzidi", intent: "Question générale", confidence: 97, action: "Réponse depuis la base de connaissances", prospect: "—" },
  { id: "dt2", message: "On doit passer l'agrément ONSSA pour notre labo de 180 m².", contact: "Hicham Zemmouri", intent: "Demande de prestation", confidence: 94, action: "Création prospect + envoi formulaire Audit Hygiène", prospect: "Hicham Zemmouri" },
  { id: "dt3", message: "Pouvez-vous m'envoyer un devis pour former 12 personnes ?", contact: "Youssef Alaoui", intent: "Demande de devis", confidence: 91, action: "Formulaire Formation HSE envoyé", prospect: "Youssef Alaoui" },
  { id: "dt4", message: "Je ne connais pas encore la surface exacte.", contact: "Hamza Ouazzani", intent: "Information manquante", confidence: 86, action: "Relance programmée sous 48h", prospect: "Hamza Ouazzani" },
];
