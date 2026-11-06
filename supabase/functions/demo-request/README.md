# demo-request

Recibe el formulario de demo de la web, lo guarda en `public.demo_requests` (proyecto FinancialReportinDB) y:

1. Calcula la prioridad del lead (`lead.js`) y la guarda en `lead_score` / `lead_priority`.
2. Lo envía al CRM de Konsolidator (`crm.ts`, API de importación de leads). Sin clave queda como `crm_status = 'pending_config'`; si falla, se reintenta con el siguiente envío correcto.
3. Manda la ficha al equipo comercial (`team-email.js`) y el correo de confirmación al cliente (`email.js`) con Resend.

Secretos en Supabase: `RESEND_API_KEY`, `DEMO_NOTIFY_TO`, `DEMO_NOTIFY_FROM` y `CRM_API_KEY` (clave "Website form" de Konsolidator › Settings › APIs › Lead keys).

Se despliega con verify_jwt desactivado (formulario público, valida él mismo los campos y el origen).
