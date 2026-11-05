// Correo interno al equipo comercial: una ficha del lead lista para actuar.
import { TOOL_NAMES, demoPlan, emailDomain, scoreLead, splitErps } from './lead.js'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const MONO = "'JetBrains Mono',Menlo,Consolas,monospace"
const PRIO = {
  alta: { label: 'Prioridad alta', bg: '#BEF264', fg: '#1A2E05' },
  media: { label: 'Prioridad media', bg: '#FDE68A', fg: '#422006' },
  baja: { label: 'Prioridad baja', bg: '#E2E8F0', fg: '#1E293B' },
}

const chip = (text, tone = 'green') => {
  const t = { green: ['#E3F4EC', '#065F46'], amber: ['#FEF3C7', '#92400E'], dark: ['#064E3B', '#A7F3D0'] }[tone]
  return `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 10px;border-radius:8px;background:${t[0]};color:${t[1]};font-size:13px;font-weight:700;">${esc(text)}</span>`
}
const label = (t) => `<p style="margin:0 0 10px;font-family:${MONO};font-size:11.5px;letter-spacing:.3px;color:#047857;">${esc(t)}</p>`
const row = (k, v, first) => `<tr>
  <td style="padding:10px 14px;${first ? '' : 'border-top:1px solid #E1ECE6;'}font-size:13px;color:#5A716A;width:130px;vertical-align:top;">${esc(k)}</td>
  <td style="padding:10px 14px;${first ? '' : 'border-top:1px solid #E1ECE6;'}font-size:14px;font-weight:700;color:#062A21;">${v}</td></tr>`

export function teamEmail(r, opts = {}) {
  const lead = scoreLead(r)
  const p = PRIO[lead.priority]
  const name = `${r.first_name} ${r.last_name}`
  const { domain, personal } = emailDomain(r.email)
  const { live, pending } = splitErps(r.erps)
  const tools = (r.tools || []).map((k) => TOOL_NAMES.es[k] || k)
  const plan = demoPlan(r)
  const when = new Date(r.created_at).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' })
  const lang = r.lang === 'en' ? 'Inglés' : 'Español'
  const replySubject = r.lang === 'en' ? `Your Next Data demo · ${r.company}` : `Tu demo de Next Data · ${r.company}`
  const replyBody = r.lang === 'en'
    ? `Hi ${r.first_name},\n\nThanks for requesting a Next Data demo. Would any of these times work for you?\n\n- \n- \n\nBest regards,`
    : `Hola ${r.first_name}:\n\nGracias por pedir una demo de Next Data. ¿Te encaja alguno de estos huecos?\n\n- \n- \n\nUn saludo,`
  const mailto = `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`

  const subject = `Demo [${lead.priority}] ${r.company} · ${r.entities_count || '?'} sociedades · ${name}`

  const erpCell = [
    ...live.map((e) => chip(e, 'green')),
    ...pending.map((e) => chip(`${e} · a confirmar`, 'amber')),
  ].join('') || '<span style="color:#5A716A;font-weight:500;">No lo ha indicado</span>'

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEF4F1;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(`${name} · ${r.company} · ${tools.join(', ')}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4F1;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;">

  <tr><td style="background:#05160F;background-image:radial-gradient(520px 220px at 90% 0%,rgba(52,211,153,.26),rgba(5,22,15,0) 70%);border-radius:20px 20px 0 0;padding:26px 32px 30px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:${MONO};font-size:12px;color:#6EE7B7;">Nueva solicitud de demo · Next Data</td>
      <td align="right"><span style="display:inline-block;padding:5px 11px;border-radius:999px;background:${p.bg};color:${p.fg};font-size:12px;font-weight:800;">${p.label}</span></td>
    </tr></table>
    <h1 style="margin:18px 0 0;font-size:34px;line-height:38px;font-weight:900;letter-spacing:-1.2px;color:#E6F6EE;">${esc(r.company)}</h1>
    <p style="margin:10px 0 0;font-size:15px;line-height:22px;color:#B4D1C6;">${esc(name)} · ${esc(r.company_size)} empleados · ${esc(r.entities_count || '?')} sociedades</p>
    <p style="margin:4px 0 0;font-size:13px;color:#82A69A;">${esc(when)}</p>
  </td></tr>

  <tr><td style="background:#FFFFFF;padding:26px 32px 6px;border-left:1px solid #DCE8E2;border-right:1px solid #DCE8E2;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="border-radius:10px;background:#047857;"><a href="${esc(mailto)}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:800;color:#FFFFFF;text-decoration:none;">Responder a ${esc(r.first_name)} &rarr;</a></td>
      ${opts.dashboardUrl ? `<td style="width:10px;"></td><td style="border-radius:10px;border:1px solid #CFE3D9;"><a href="${esc(opts.dashboardUrl)}" style="display:inline-block;padding:11px 16px;font-size:14px;font-weight:700;color:#047857;text-decoration:none;">Ver en la base de datos</a></td>` : ''}
      ${opts.crmUrl ? `<td style="width:10px;"></td><td style="border-radius:10px;border:1px solid #CFE3D9;"><a href="${esc(opts.crmUrl)}" style="display:inline-block;padding:11px 16px;font-size:14px;font-weight:700;color:#047857;text-decoration:none;">Abrir en el CRM</a></td>` : ''}
    </tr></table>

    <div style="height:24px;"></div>
    ${label('Contacto')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:#F4F8F6;border:1px solid #E1ECE6;">
      ${row('Nombre', esc(name), true)}
      ${row('Email', `<a href="mailto:${esc(r.email)}" style="color:#047857;">${esc(r.email)}</a>`)}
      ${row('Web', personal ? '<span style="color:#92400E;">Email personal: sin dominio de empresa</span>' : `<a href="https://${esc(domain)}" style="color:#047857;">${esc(domain)}</a>`)}
      ${row('Idioma', esc(lang))}
    </table>

    <div style="height:22px;"></div>
    ${label('Empresa')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:#F4F8F6;border:1px solid #E1ECE6;">
      ${row('Empresa', esc(r.company), true)}
      ${row('Tamaño', `${esc(r.company_size)} empleados`)}
      ${row('Sociedades', esc(r.entities_count || 'No lo ha indicado'))}
      ${row('ERPs', `<div style="margin-bottom:-6px;">${erpCell}</div>`)}
      ${row('Le interesa', `<div style="margin-bottom:-6px;">${tools.map((x) => chip(x, 'dark')).join('') || '-'}</div>`)}
    </table>
    ${pending.length ? `<p style="margin:10px 2px 0;font-size:13px;line-height:19px;color:#92400E;">${esc(pending.join(', '))}: sin conector propio hoy. Confirma con producto antes de la demo cómo entrarían (SQL, Excel o Secure file drop).</p>` : ''}

    <div style="height:22px;"></div>
    ${label('Qué enseñar en la demo')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${plan.map((s, i) => `<tr>
        <td style="vertical-align:top;width:34px;padding:0 0 12px;"><div style="width:24px;height:24px;line-height:24px;text-align:center;border-radius:7px;background:#064E3B;color:#6EE7B7;font-family:${MONO};font-size:11px;font-weight:700;">${i + 1}</div></td>
        <td style="vertical-align:top;padding:2px 0 12px;font-size:14px;line-height:21px;color:#2F4B44;">${esc(s)}</td></tr>`).join('')}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 24px;"><tr><td style="border-left:3px solid ${p.bg};background:#F4F8F6;border-radius:0 12px 12px 0;padding:12px 14px;font-size:13.5px;line-height:20px;color:#2F4B44;">
      <b style="color:#062A21;">${esc(p.label)}</b> (${lead.score} puntos): ${esc(lead.reasons.join(' · ') || 'sin señales claras')}.
    </td></tr></table>
  </td></tr>

  <tr><td style="background:#FFFFFF;border:1px solid #DCE8E2;border-top:0;border-radius:0 0 20px 20px;padding:16px 32px 24px;">
    <div style="height:1px;background:#E1ECE6;margin:0 0 14px;"></div>
    <p style="margin:0;font-family:${MONO};font-size:11px;line-height:18px;color:#5A716A;">
      Página: ${esc(r.page_url || '-')}<br>Viene de: ${esc(r.referrer || 'directo')}<br>CRM: ${esc(opts.crmStatus || 'pendiente de configurar')}<br>ID: ${esc(r.id)}
    </p>
  </td></tr>

</table></td></tr></table></body></html>`

  const text = [
    `Nueva solicitud de demo · ${p.label}`,
    '',
    `${r.company} · ${r.company_size} empleados · ${r.entities_count || '?'} sociedades`,
    `${name} <${r.email}>`,
    when,
    '',
    `ERPs: ${(r.erps || []).join(', ') || '-'}${pending.length ? ` (a confirmar: ${pending.join(', ')})` : ''}`,
    `Le interesa: ${tools.join(', ') || '-'}`,
    '',
    'Qué enseñar en la demo:',
    ...plan.map((s, i) => `  ${i + 1}. ${s}`),
    '',
    `Prioridad: ${lead.score} puntos (${lead.reasons.join(' · ')})`,
    `CRM: ${opts.crmStatus || 'pendiente de configurar'}`,
    `ID: ${r.id}`,
  ].join('\n')

  return { subject, html, text }
}
