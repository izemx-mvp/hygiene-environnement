import type { Quote } from "./types";
import { quoteTotals } from "./mock";

const m = (n: number) => new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(n) + " MAD";

/** Opens a print-ready quote document (Save as PDF from the print dialog). */
export function downloadQuotePdf(q: Quote, company: Record<string, string>) {
  const t = quoteTotals(q);
  const rows = q.lines.map((l) => `<tr><td>${l.desc}</td><td class=r>${l.qty}</td><td class=r>${m(l.price)}</td><td class=r>${m(l.qty * l.price)}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset=utf-8><title>${q.ref}</title><style>
  body{font-family:Helvetica,Arial,sans-serif;color:#082B3D;padding:48px;font-size:13px}h1{color:#00A3E0;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}
  th{background:#082B3D;color:#fff;text-align:left;padding:8px}td{padding:8px;border-bottom:1px solid #e5edf2}.r{text-align:right}.tot{margin-left:auto;width:280px;margin-top:16px}
  .tot div{display:flex;justify-content:space-between;padding:4px 0}.big{font-size:18px;font-weight:bold;color:#00A3E0;border-top:2px solid #00A3E0;padding-top:8px!important}
  .head{display:flex;justify-content:space-between}small{color:#4B5563}</style></head><body>
  <div class=head><div><h1>DEVIS</h1><b>${q.ref}</b><br><small>${new Date(q.date).toLocaleDateString("fr-FR")}</small></div>
  <div style="text-align:right"><b>${company.name}</b><br><small>${company.address}<br>${company.phone} · ${company.email}<br>ICE ${company.ice}</small></div></div>
  <p style="margin-top:32px"><small>Client</small><br><b>${q.client}</b><br>${q.company}<br>${q.email}</p><p><b>Prestation :</b> ${q.service}</p>
  <table><tr><th>Description</th><th class=r>Qté</th><th class=r>P.U. HT</th><th class=r>Total HT</th></tr>${rows}</table>
  <div class=tot><div><span>Sous-total</span><span>${m(t.sub)}</span></div><div><span>Remise ${q.discount}%</span><span>-${m(t.disc)}</span></div><div><span>Total HT</span><span>${m(t.ht)}</span></div><div><span>TVA ${q.tva}%</span><span>${m(t.tva)}</span></div><div class=big><span>Total TTC</span><span>${m(t.ttc)}</span></div></div>
  <p style="margin-top:32px"><b>Conditions :</b> ${q.conditions}<br><b>Délai :</b> ${q.delay}<br><b>Validité :</b> ${q.validity}</p>${q.notes ? `<p><b>Remarques :</b> ${q.notes}</p>` : ""}
  <script>setTimeout(()=>print(),300)</script></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
  else {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `${q.ref}.html`;
    a.click();
  }
}
