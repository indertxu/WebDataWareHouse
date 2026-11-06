// Pasarela al CRM. Recibe el lead ya guardado y lo envía al CRM configurado.
//
// Sin clave configurada no envía nada y deja el lead como "pendiente" para mandarlo después.
//
// Secretos que leerá:
//   CRM_API_KEY    clave de API (nunca sale en correos ni en logs). Con solo esta, se envía a Konsolidator.
//   CRM_PROVIDER   opcional: "konsolidator" (por defecto) o "webhook"
//   CRM_API_URL    opcional: otra URL (obligatoria para "webhook")
import { crmPayload } from "./lead.js";

export type CrmResult = { status: "sent" | "pending_config" | "error"; id?: string; url?: string; error?: string };

type Adapter = (payload: ReturnType<typeof crmPayload>, cfg: { url: string; key: string }) => Promise<CrmResult>;

// fetch con límite de tiempo: si el CRM tarda, el lead se guarda igual y queda como error para reintentar
async function fetchWithTimeout(url: string, init: RequestInit, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctl.signal }); } finally { clearTimeout(t); }
}

// Adaptador genérico: un POST con el lead en JSON. Sirve para Zapier, Make, n8n o un endpoint propio.
const webhook: Adapter = async (payload, { url, key }) => {
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) return { status: "error", error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
  let id: string | undefined;
  try { const j = JSON.parse(body); id = j.id ?? j.data?.id ?? undefined; } catch { /* respuesta sin JSON */ }
  return { status: "sent", id: id ? String(id) : undefined };
};

// Konsolidator CRM: API de importación de leads (Settings › Your company › APIs › Lead keys, tipo "Website form").
// Crea o actualiza la empresa (por nombre o dominio) y el contacto (por email) y los enlaza.
function siteOrigin(page: string | null | undefined) {
  try { const o = new URL(page ?? "").origin; if (/^https:\/\/([a-z0-9-]+\.)*atebiz\.com$/.test(o)) return o; } catch { /* sin página */ }
  return "https://nextdata.atebiz.com";
}

const KONSOLIDATOR_URL = "https://eloadnqjcrvdnvdcoqap.supabase.co/functions/v1/manage-users/api/crm/leads";
const konsolidator: Adapter = async (payload, { url, key }) => {
  const { contact, company, deal } = payload;
  const res = await fetchWithTimeout(url || KONSOLIDATOR_URL, {
    method: "POST",
    // La clave puede limitar desde qué webs se acepta: enviamos el origen de la web del formulario
    headers: { "Content-Type": "application/json", "x-api-key": key, "Origin": siteOrigin(deal.page_url), "Referer": deal.page_url || siteOrigin(deal.page_url) + "/" },
    body: JSON.stringify({
      first_name: contact.first_name,
      last_name: contact.last_name,
      company: company.name,
      employees: company.employees,
      entities: company.entities,
      erps: company.erps,
      interests: deal.tool_names,
      email: contact.email,
      request_type: "Demo request",
      page: deal.page_url,
      _hp: "",
    }),
  });
  const body = await res.text();
  if (!res.ok) return { status: "error", error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
  let id: string | undefined;
  try {
    const j = JSON.parse(body);
    id = j.contact_id ?? j.contact?.id ?? j.data?.contact_id ?? j.data?.contact?.id ?? j.id ?? undefined;
  } catch { /* respuesta sin JSON */ }
  return { status: "sent", id: id ? String(id) : undefined };
};

const ADAPTERS: Record<string, Adapter> = { webhook, konsolidator };

export async function syncToCrm(row: Record<string, unknown>): Promise<CrmResult> {
  const key = Deno.env.get("CRM_API_KEY") ?? "";
  // Con solo la clave basta: por defecto se envía a Konsolidator
  const provider = (Deno.env.get("CRM_PROVIDER") ?? (key ? "konsolidator" : "")).toLowerCase();
  const url = Deno.env.get("CRM_API_URL") ?? "";
  const adapter = ADAPTERS[provider];
  if (!adapter || !key || (provider === "webhook" && !url)) return { status: "pending_config" };
  try {
    return await adapter(crmPayload(row), { url, key });
  } catch (e) {
    return { status: "error", error: String(e instanceof Error ? e.message : e).slice(0, 300) };
  }
}
