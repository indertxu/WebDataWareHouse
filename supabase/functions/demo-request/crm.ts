// Pasarela al CRM. Recibe el lead ya guardado y lo envía al CRM configurado.
//
// Hoy: si no hay CRM configurado, no envía nada y deja el lead como "pendiente" para mandarlo después.
// Cuando sepamos qué CRM es, se añade aquí su adaptador (contacto + empresa + oportunidad) sin tocar lo demás.
//
// Secretos que leerá:
//   CRM_PROVIDER   nombre del adaptador (p. ej. "webhook"; los demás se añaden al conocer el CRM)
//   CRM_API_URL    URL base o de webhook
//   CRM_API_KEY    clave de API (nunca sale en correos ni en logs)
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

const ADAPTERS: Record<string, Adapter> = { webhook };

export async function syncToCrm(row: Record<string, unknown>): Promise<CrmResult> {
  const provider = (Deno.env.get("CRM_PROVIDER") ?? "").toLowerCase();
  const url = Deno.env.get("CRM_API_URL") ?? "";
  const key = Deno.env.get("CRM_API_KEY") ?? "";
  const adapter = ADAPTERS[provider];
  if (!adapter || !url) return { status: "pending_config" };
  try {
    return await adapter(crmPayload(row), { url, key });
  } catch (e) {
    return { status: "error", error: String(e instanceof Error ? e.message : e).slice(0, 300) };
  }
}
