// demo-request: recibe el formulario "Pide tu demo" y lo guarda en public.demo_requests.
// Público a propósito (verify_jwt = false): no necesita sesión, solo inserta.
// Con los secretos RESEND_API_KEY + DEMO_NOTIFY_TO envía:
//   1) un aviso interno al equipo (DEMO_NOTIFY_TO)
//   2) un correo de agradecimiento con estilo Atebiz a la persona que pidió la demo
// Opcionales: DEMO_NOTIFY_FROM (remitente), DEMO_SITE_URL (enlace "Volver a Next Data" si no se puede deducir).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { confirmationEmail } from "./email.js";
import { teamEmail } from "./team-email.js";
import { scoreLead } from "./lead.js";
import { syncToCrm, type CrmResult } from "./crm.ts";

const ALLOWED_ORIGINS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/([a-z0-9-]+\.)*atebiz\.com$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];
const PUBLIC_ORIGINS = ALLOWED_ORIGINS.slice(2);
const LOGO_URL = "https://www.atebiz.com/logo.png";
const LEGAL_URL = "https://www.atebiz.com/legal";
const DASHBOARD_URL = "https://supabase.com/dashboard/project/gmcawsapzkzmgrtiqebv/editor";

function cors(origin: string | null) {
  const ok = origin && ALLOWED_ORIGINS.some((r) => r.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const ENTITIES = ["1", "2-5", "6-15", "16-50", "50+"];
const TOOLS = ["dw", "conso", "plan", "report"];
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);
const text = (v: unknown, max: number) => {
  const s = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
  return s.length >= 1 && s.length <= max ? s : null;
};

type Row = {
  referrer?: string | null;
  id: string; email: string; first_name: string; last_name: string; company: string; company_size: string;
  entities_count: string | null; erps: string[] | null; tools: string[] | null;
  lang: string | null; source: string; page_url: string | null; created_at: string;
};

// Enlace de vuelta a la web: el origen desde el que se envió el formulario, si es público.
function siteUrlFor(row: Row) {
  try {
    const o = new URL(row.page_url ?? "").origin;
    if (PUBLIC_ORIGINS.some((r) => r.test(o))) return o + "/";
  } catch { /* ignorar */ }
  return Deno.env.get("DEMO_SITE_URL") ?? "https://www.atebiz.com/";
}

async function sendEmail(key: string, payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("resend error", res.status, await res.text());
  return res.ok;
}

async function notifyTeam(row: Row, key: string, to: string[], from: string, crm: CrmResult) {
  const crmStatus = crm.status === "sent" ? `enviado${crm.id ? ` (id ${crm.id})` : ""}`
    : crm.status === "error" ? `error al enviar: ${crm.error ?? ""}` : "pendiente de configurar";
  const mail = teamEmail(row, { dashboardUrl: DASHBOARD_URL, crmUrl: crm.url, crmStatus });
  return sendEmail(key, { from, to, reply_to: row.email, subject: mail.subject, html: mail.html, text: mail.text });
}

async function thankVisitor(row: Row, key: string, teamTo: string[], from: string) {
  const mail = confirmationEmail(row, { siteUrl: siteUrlFor(row), logoUrl: LOGO_URL, legalUrl: LEGAL_URL });
  return sendEmail(key, {
    from, to: [row.email], reply_to: teamTo[0],
    subject: mail.subject, html: mail.html, text: mail.text,
  });
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, headers);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400, headers); }

  // Trampa para bots: un campo oculto que una persona nunca rellena.
  if (typeof body.company_website === "string" && body.company_website.trim() !== "") {
    return json({ ok: true }, 200, headers);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const first_name = text(body.first_name, 80);
  const last_name = text(body.last_name, 120);
  const company = text(body.company, 160);
  const company_size = typeof body.company_size === "string" && SIZES.includes(body.company_size) ? body.company_size : null;

  const entities_count = typeof body.entities_count === "string" && ENTITIES.includes(body.entities_count) ? body.entities_count : null;
  const tools = Array.isArray(body.tools) ? [...new Set(body.tools.filter((x): x is string => typeof x === "string" && TOOLS.includes(x)))] : [];
  const erps = Array.isArray(body.erps)
    ? [...new Set(body.erps.map((x) => text(x, 60)).filter((x): x is string => !!x))].slice(0, 12)
    : [];

  const missing: string[] = [];
  if (!first_name) missing.push("first_name");
  if (!last_name) missing.push("last_name");
  if (!company) missing.push("company");
  if (!company_size) missing.push("company_size");
  // entities_count y tools los exige el formulario; aquí solo se validan sus valores,
  // para no romper envíos de versiones anteriores de la web que aún no los mandan.
  if (email.length > 254 || !EMAIL_RE.test(email)) missing.push("email");
  if (missing.length) return json({ error: "invalid_fields", fields: missing }, 400, headers);

  const lang = body.lang === "en" ? "en" : body.lang === "es" ? "es" : null;
  const source = clip(body.source, 40) ?? "next-data-web";

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // Evita duplicados: el mismo email en los últimos 10 minutos se da por recibido sin volver a guardar ni a escribir.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("demo_requests").select("id").eq("email", email).gte("created_at", since).limit(1);
  if (recent && recent.length) return json({ ok: true, duplicate: true }, 200, headers);

  const { data: row, error } = await supabase
    .from("demo_requests")
    .insert({
      email, first_name, last_name, company, company_size, entities_count, erps, tools, lang, source,
      page_url: clip(body.page_url, 500),
      referrer: clip(body.referrer, 500),
      user_agent: clip(req.headers.get("user-agent"), 400),
    })
    .select("id, email, first_name, last_name, company, company_size, entities_count, erps, tools, lang, source, page_url, referrer, created_at")
    .single();

  if (error || !row) {
    console.error("insert failed", error);
    return json({ error: "save_failed" }, 500, headers);
  }

  // Prioridad del lead y envío al CRM antes de los correos, para que el comercial vea el estado
  const lead = scoreLead(row);
  const crm = await syncToCrm(row as Record<string, unknown>);
  if (crm.status === "error") console.error("crm sync failed", crm.error);
  await supabase.from("demo_requests").update({
    lead_score: lead.score, lead_priority: lead.priority,
    crm_status: crm.status, crm_id: crm.id ?? null, crm_error: crm.error ?? null,
    crm_synced_at: crm.status === "sent" ? new Date().toISOString() : null,
  }).eq("id", row.id);

  const key = Deno.env.get("RESEND_API_KEY");
  const teamTo = (Deno.env.get("DEMO_NOTIFY_TO") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get("DEMO_NOTIFY_FROM") ?? "Next Data <onboarding@resend.dev>";
  if (key && teamTo.length) {
    const [team, thanks] = await Promise.allSettled([
      notifyTeam(row as Row, key, teamTo, from, crm),
      thankVisitor(row as Row, key, teamTo, from),
    ]);
    const update: Record<string, string> = {};
    const now = new Date().toISOString();
    if (team.status === "fulfilled" && team.value) update.notified_at = now;
    if (thanks.status === "fulfilled" && thanks.value) update.confirmation_sent_at = now;
    if (team.status === "rejected") console.error("notify failed", team.reason);
    if (thanks.status === "rejected") console.error("thanks failed", thanks.reason);
    if (Object.keys(update).length) await supabase.from("demo_requests").update(update).eq("id", row.id);
  }

  // Si este envío ha llegado al CRM, reintenta los que se quedaron pendientes o fallaron (máx. 5, últimos 30 días).
  // Va en segundo plano: el visitante recibe la respuesta sin esperar a los reintentos.
  const retryBacklog = async () => {
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: backlog } = await supabase.from("demo_requests")
      .select("id, email, first_name, last_name, company, company_size, entities_count, erps, tools, lang, source, page_url, referrer, created_at")
      .neq("id", row.id).or("crm_status.is.null,crm_status.neq.sent").gte("created_at", since30)
      .order("created_at", { ascending: true }).limit(5);
    for (const old of backlog ?? []) {
      const r = await syncToCrm(old as Record<string, unknown>);
      await supabase.from("demo_requests").update({
        crm_status: r.status, crm_id: r.id ?? null, crm_error: r.error ?? null,
        crm_synced_at: r.status === "sent" ? new Date().toISOString() : null,
      }).eq("id", old.id);
    }
  };
  if (crm.status === "sent") EdgeRuntime.waitUntil(retryBacklog().catch((e) => console.error("crm retry failed", e)));

  return json({ ok: true }, 200, headers);
});
