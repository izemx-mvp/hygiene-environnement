import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Mail, Paperclip, RefreshCw, Send, Sparkles as Spark } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { actions, mad, quoteTotals, useStore } from "@/lib/store";
import { AiSteps } from "./bits";

export function QuoteWorkflowDialog({ prospectId, open, onOpenChange }: { prospectId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const p = useStore((s) => s.prospects.find((x) => x.id === prospectId));
  const [doneId, setDoneId] = useState<string | null>(null);
  const quote = useStore((s) => s.quotes.find((q) => q.id === doneId));
  const navigate = useNavigate();
  useEffect(() => { if (open) setDoneId(null); }, [open]);
  if (!p) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Spark className="size-5 text-primary" /> Agent Générateur de Devis</DialogTitle>
          <DialogDescription>{p.company} · {p.service}</DialogDescription>
        </DialogHeader>
        {!doneId ? (
          <div className="space-y-3">
          <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2 text-sm text-navy-foreground"><p className="text-[10px] font-bold uppercase opacity-70">WhatsApp · Imane</p>Génère le devis pour {p.name}.</div></div>
          <AiSteps
            key={String(open)}
            steps={["Identification du prospect", "Récupération de la prestation", "Récupération du formulaire complété", "Chargement des règles configurées", "Vérification des champs obligatoires", "Application des règles métier", "Calculs", "Génération du devis"]}
            stepMs={550}
            onDone={() => {
              const q = actions.generateQuote(p.id);
              setDoneId(q.id);
              toast.success(`Devis ${q.ref} généré`, { description: `${p.company} — ${mad(quoteTotals(q).ttc)} TTC` });
            }}
          />
          </div>
        ) : (
          quote && (
            <div className="animate-fade-up rounded-2xl border border-success/30 bg-success/5 p-5 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-success text-success-foreground"><FileText /></div>
              <p className="font-display text-lg font-semibold">{quote.ref}</p>
              <p className="text-sm text-muted-foreground">Montant TTC</p>
              <p className="font-display text-2xl font-bold text-primary">{mad(quoteTotals(quote).ttc)}</p>
            </div>
          )
        )}
        {doneId && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Fermer</Button>
            <Button variant="premium" onClick={() => { onOpenChange(false); navigate({ to: "/quotes/$id", params: { id: doneId } }); }}>
              Ouvrir l'éditeur
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

const draft = (client: string, ref: string, company: string) =>
  `Bonjour ${client.split(" ")[0]},\n\nSuite à votre demande, veuillez trouver ci-joint notre proposition ${ref} pour ${company}.\n\nNous restons à votre disposition pour tout complément d'information et serions ravis de planifier l'intervention selon vos disponibilités.\n\nBien cordialement,\nImane El Bijri\nSales Manager — HygiEnv Maroc`;

export function EmailDialog({ quoteId, open, onOpenChange }: { quoteId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const q = useStore((s) => s.quotes.find((x) => x.id === quoteId));
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState(true);
  const [sending, setSending] = useState(false);
  const [regen, setRegen] = useState(false);
  useEffect(() => {
    if (open && q) {
      setTo(q.email);
      setSubject(`Votre devis ${q.ref} — ${q.service}`);
      setBody(draft(q.client, q.ref, q.company));
      setEditing(true);
      setSending(false);
    }
  }, [open, q?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!q) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !sending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="size-5 text-primary" /> Envoyer le devis par email</DialogTitle>
          <DialogDescription>{q.ref} · {q.company}</DialogDescription>
        </DialogHeader>
        {sending ? (
          <AiSteps
            steps={["Création du PDF...", "Préparation de l'email...", "Envoi au client..."]}
            stepMs={600}
            onDone={() => {
              actions.sendQuoteEmail(q.id, to);
              toast.success("Email envoyé", { description: `${q.ref} envoyé à ${to}` });
              onOpenChange(false);
            }}
          />
        ) : editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>À</Label><Input value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Objet</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} className={regen ? "animate-pulse" : ""} />
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-accent/50 px-3 py-2 text-sm">
              <Paperclip className="size-4 text-primary" /> <span className="font-medium">{q.ref}.pdf</span>
              <span className="text-muted-foreground">· 184 Ko</span>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-soft">
            <div className="border-b px-5 py-3 text-sm">
              <p><span className="text-muted-foreground">À :</span> {to}</p>
              <p className="font-semibold">{subject}</p>
            </div>
            <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-sm">{body}</pre>
            <div className="mx-5 mb-4 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"><Paperclip className="size-3.5" />{q.ref}.pdf</div>
          </div>
        )}
        {!sending && (
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={regen}
                onClick={() => {
                  setRegen(true);
                  setTimeout(() => {
                    setBody(`Bonjour ${q.client.split(" ")[0]},\n\nComme convenu lors de nos échanges WhatsApp, voici notre offre ${q.ref} (${q.service}) d'un montant de ${mad(quoteTotals(q).ttc)} TTC, valable ${q.validity}.\n\nDélai d'intervention : ${q.delay}.\n\nN'hésitez pas à me contacter pour la valider ou l'ajuster.\n\nCordialement,\nImane El Bijri`);
                    setRegen(false);
                    toast.success("Message régénéré par l'IA");
                  }, 1100);
                }}
              >
                <RefreshCw className={regen ? "animate-spin" : ""} /> Régénérer message
              </Button>
              <Button variant="ghost" onClick={() => setEditing((e) => !e)}>{editing ? "Aperçu email" : "Modifier"}</Button>
            </div>
            <Button variant="premium" onClick={() => (/\S+@\S+\.\S+/.test(to) ? setSending(true) : toast.error("Adresse email invalide"))}>
              <Send /> Envoyer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
