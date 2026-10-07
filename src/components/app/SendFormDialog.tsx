import { useEffect, useState } from "react";
import { Copy, Send, Link2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { actions, sleep, useStore } from "@/lib/store";
import { formForService } from "@/lib/mock";
import { AiSteps } from "./bits";
import { useNavigate } from "@tanstack/react-router";

export function SendFormDialog({ prospectId, open, onOpenChange }: { prospectId: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const p = useStore((s) => s.prospects.find((x) => x.id === prospectId));
  const forms = useStore((s) => s.forms);
  const [formId, setFormId] = useState("");
  const [channel, setChannel] = useState("WhatsApp");
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && p) {
      setFormId(p.formId ?? formForService(p.service));
      setChannel("WhatsApp");
      setMsg(`Bonjour ${p.name.split(" ")[0]}, merci pour votre demande. Merci de compléter ce court formulaire afin que nous préparions votre devis ${p.service}.`);
      setCode(`qf-${Math.floor(1000 + Math.random() * 9000)}`);
      setSending(false);
    }
  }, [open, p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return null;
  const link = `form.hygiene.ai/${code}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !sending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer un formulaire</DialogTitle>
          <DialogDescription>
            À {p.name} · {p.company}
          </DialogDescription>
        </DialogHeader>
        {sending ? (
          <AiSteps
            steps={["Sélection du formulaire...", "Génération du lien sécurisé...", `Envoi via ${channel}...`]}
            stepMs={600}
            onDone={() => {
              actions.sendForm(p.id, formId, channel, msg, link);
              toast.success("Formulaire envoyé", { description: `${p.name} a reçu le lien via ${channel}` });
              onOpenChange(false);
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Formulaire</Label>
                <Select value={formId} onValueChange={setFormId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {forms.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Canal</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message d'accompagnement</Label>
              <Textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
            </div>
            <div className="rounded-xl border bg-accent/50 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Link2 className="size-3.5" /> Aperçu du lien</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-card px-3 py-2 text-sm font-semibold text-primary">{link}</code>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(`https://${link}`); toast.success("Lien copié"); }}>
                  <Copy /> Copier
                </Button>
              </div>
              <button className="mt-2 text-xs font-medium text-primary hover:underline" onClick={() => { onOpenChange(false); navigate({ to: "/f/$code", params: { code: p.id } }); }}>
                Ouvrir la page publique (simulation client) →
              </button>
            </div>
          </div>
        )}
        {!sending && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button variant="premium" onClick={async () => { if (!msg.trim()) return toast.error("Message requis"); await sleep(50); setSending(true); }}>
              {channel === "WhatsApp" ? <MessageCircle /> : <Send />} Envoyer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
