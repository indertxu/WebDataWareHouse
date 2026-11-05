// Plantilla del correo de agradecimiento al visitante que pide una demo (estilo Atebiz / Next).
// HTML de email: tablas y estilos en línea para que se vea bien en Gmail, Outlook y Apple Mail.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const T = {
  es: {
    subject: (n) => `Gracias, ${n}: tu demo de Next Data está en camino`,
    preheader: 'Hemos recibido tu solicitud. Te escribimos en menos de 24 horas para cerrar el día.',
    tag: 'Next Data · Datos financieros y operativos',
    hello: (n) => `Gracias, ${n}.`,
    lead: 'Hemos recibido tu solicitud de demo de Next Data. Vas a ver cómo los datos financieros y operativos de todas tus sociedades llegan a un solo modelo, cuadrados y firmados, y cómo trabajan sobre él el Data Warehouse, la Consolidación, la Planificación y el Reporting.',
    summary: 'Lo que nos has contado',
    rows: { name: 'Nombre', company: 'Empresa', size: 'Tamaño', entities: 'Sociedades', erps: 'ERPs', tools: 'Le interesa', email: 'Email' },
    tools: { dw: 'Data Warehouse', conso: 'Consolidación', plan: 'Planificación', report: 'Reporting' },
    employees: 'empleados',
    seeTitle: 'Lo que verás en tu demo',
    see: {
      dw: ['Data Warehouse', (r) => `${r.erps && r.erps.length ? r.erps.join(', ') : 'Tus sistemas'} llegando a un modelo común, de bronze a gold, con cuadre y firma por sociedad y mes.`],
      conso: ['Consolidación', (r) => `${r.entities_count ? `Tu grupo (${r.entities_count} sociedades)` : 'Tu grupo'} consolidado conforme a NOFCAC o NIIF, con la eliminación intercompañía automática.`],
      plan: ['Planificación', () => 'Presupuesto y forecast por cuenta y por driver operativo, con los reales al lado.'],
      report: ['Reporting', () => 'KPIs financieros y operativos con drill-down hasta el apunte.'],
    },
    nextTitle: 'Qué pasa ahora',
    steps: [
      ['Te escribimos en menos de 24 horas', 'Para cerrar día y hora contigo. Sin formularios eternos.'],
      ['Preparamos la demo para tu grupo', 'Con tus ERPs y tu número de sociedades en mente, no una demo genérica.'],
      ['30 minutos, sin compromiso', 'Ves tu cierre de principio a fin y decides con calma.'],
    ],
    tip: '¿Quieres que la demo vaya al grano? Responde a este correo con cualquier otro detalle de tu cierre: monedas, plazos, lo que más os cuesta hoy.',
    cta: 'Volver a Next Data',
    ctaSecondary: 'Mientras tanto, mira cómo funciona',
    sign: 'Un saludo,',
    team: 'El equipo de Next Data',
    company: 'Atebiz · Familia Next',
    footer: (site) => `Recibes este correo porque has pedido una demo en ${site}. Si no has sido tú, puedes ignorarlo: no te escribiremos más.`,
    legal: 'Aviso legal y privacidad',
  },
  en: {
    subject: (n) => `Thanks, ${n}: your Next Data demo is on its way`,
    preheader: "We've received your request. We'll write within 24 hours to set the date.",
    tag: 'Next Data · Financial and operational data',
    hello: (n) => `Thank you, ${n}.`,
    lead: "We've received your Next Data demo request. You'll see how financial and operational data from every company in your group lands in one model, balanced and signed off, and how the Data Warehouse, Consolidation, Planning and Reporting all work on top of it.",
    summary: 'What you told us',
    rows: { name: 'Name', company: 'Company', size: 'Size', entities: 'Companies', erps: 'ERPs', tools: 'Interested in', email: 'Email' },
    tools: { dw: 'Data Warehouse', conso: 'Consolidation', plan: 'Planning', report: 'Reporting' },
    employees: 'employees',
    seeTitle: "What you'll see in your demo",
    see: {
      dw: ['Data Warehouse', (r) => `${r.erps && r.erps.length ? r.erps.join(', ') : 'Your systems'} flowing into one common model, from bronze to gold, reconciled and signed off per company and month.`],
      conso: ['Consolidation', (r) => `${r.entities_count ? `Your group (${r.entities_count} companies)` : 'Your group'} consolidated under Spanish GAAP or IFRS, with automatic intercompany elimination.`],
      plan: ['Planning', () => 'Budget and forecast per account and per operational driver, with actuals alongside.'],
      report: ['Reporting', () => 'Financial and operational KPIs with drill-down to the entry.'],
    },
    nextTitle: 'What happens next',
    steps: [
      ["We'll write within 24 hours", 'To agree a date and time with you. No endless forms.'],
      ['We prepare the demo for your group', 'With your ERPs and number of companies in mind, not a generic demo.'],
      ['30 minutes, no commitment', 'You see your close end to end and decide in your own time.'],
    ],
    tip: 'Want the demo to get straight to the point? Reply to this email with anything else about your close: currencies, deadlines, what hurts most today.',
    cta: 'Back to Next Data',
    ctaSecondary: 'In the meantime, see how it works',
    sign: 'Best regards,',
    team: 'The Next Data team',
    company: 'Atebiz · Next family',
    footer: (site) => `You're receiving this email because you asked for a demo on ${site}. If it wasn't you, just ignore it: we won't write again.`,
    legal: 'Legal notice and privacy',
  },
}

export function confirmationEmail(row, opts) {
  const t = T[row.lang === 'en' ? 'en' : 'es']
  const first = row.first_name
  const site = opts.siteUrl
  const siteHost = site.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const logo = opts.logoUrl
  const legal = opts.legalUrl

  const order = ['dw', 'conso', 'plan', 'report']
  const see = order.filter((k) => (row.tools || []).includes(k)).map((k) => [t.see[k][0], t.see[k][1](row)])

  const detail = [
    [t.rows.name, `${row.first_name} ${row.last_name}`],
    [t.rows.company, row.company],
    [t.rows.size, `${row.company_size} ${t.employees}`],
    row.entities_count ? [t.rows.entities, row.entities_count] : null,
    row.erps && row.erps.length ? [t.rows.erps, row.erps.join(', ')] : null,
    row.tools && row.tools.length ? [t.rows.tools, row.tools.map((k) => t.tools[k] ?? k).join(', ')] : null,
    [t.rows.email, row.email],
  ].filter(Boolean)

  const html = `<!doctype html>
<html lang="${row.lang === 'en' ? 'en' : 'es'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(t.subject(first))}</title></head>
<body style="margin:0;padding:0;background:#EEF4F1;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(t.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4F1;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Cabecera oscura -->
  <tr><td style="background:#05160F;background-image:radial-gradient(600px 260px at 85% 0%,rgba(52,211,153,.28),rgba(5,22,15,0) 70%);border-radius:22px 22px 0 0;padding:28px 36px 36px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
      <td style="vertical-align:middle;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;padding-right:10px;"><img src="${esc(logo)}" width="34" height="34" alt="Atebiz" style="display:block;border:0;"></td>
          <td style="vertical-align:middle;font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#E6F6EE;">atebiz</td>
        </tr></table>
      </td>
      <td align="right" style="vertical-align:middle;">
        <span style="display:inline-block;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:11px;color:#6EE7B7;border:1px solid rgba(110,231,183,.35);border-radius:7px;padding:4px 9px;">Next Data</span>
      </td>
    </tr></table>
    <p style="margin:34px 0 0;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;color:#82A69A;">${esc(t.tag)}</p>
    <h1 style="margin:10px 0 0;font-size:40px;line-height:44px;font-weight:900;letter-spacing:-1.6px;color:#E6F6EE;">${esc(t.hello(first))}</h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:25px;color:#B4D1C6;">${esc(t.lead)}</p>
  </td></tr>

  <!-- Cuerpo -->
  <tr><td style="background:#FFFFFF;padding:32px 36px 8px;border-left:1px solid #DCE8E2;border-right:1px solid #DCE8E2;">
    <p style="margin:0 0 12px;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;color:#047857;">${esc(t.summary)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-radius:14px;background:#F4F8F6;border:1px solid #E1ECE6;">
      ${detail.map(([k, v], i) => `<tr>
        <td style="padding:12px 16px;${i ? 'border-top:1px solid #E1ECE6;' : ''}font-size:13px;color:#5A716A;width:120px;">${esc(k)}</td>
        <td style="padding:12px 16px;${i ? 'border-top:1px solid #E1ECE6;' : ''}font-size:14px;font-weight:700;color:#062A21;">${esc(v)}</td>
      </tr>`).join('')}
    </table>

    ${see.length ? `<p style="margin:30px 0 12px;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;color:#047857;">${esc(t.seeTitle)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${see.map(([name, text], i) => `<tr><td style="padding:0 0 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-radius:14px;background:#05160F;background-image:linear-gradient(135deg,#062A21,#05160F);"><tr>
          <td style="padding:14px 16px;">
            <div style="font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:11px;color:#6EE7B7;">0${i + 1} · ${esc(name)}</div>
            <div style="margin-top:4px;font-size:14px;line-height:21px;color:#D7EFE4;">${esc(text)}</div>
          </td></tr></table>
      </td></tr>`).join('')}
    </table>` : ''}

    <p style="margin:30px 0 14px;font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;color:#047857;">${esc(t.nextTitle)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${t.steps.map(([title, text], i) => `<tr>
        <td style="vertical-align:top;width:40px;padding:0 0 16px;">
          <div style="width:30px;height:30px;line-height:30px;text-align:center;border-radius:9px;background:${i === 0 ? '#064E3B' : '#E3F4EC'};color:${i === 0 ? '#6EE7B7' : '#047857'};font-family:'JetBrains Mono',Menlo,Consolas,monospace;font-size:12px;font-weight:700;">${i + 1}</div>
        </td>
        <td style="vertical-align:top;padding:4px 0 16px;">
          <div style="font-size:15px;font-weight:800;color:#062A21;letter-spacing:-0.2px;">${esc(title)}</div>
          <div style="font-size:14px;line-height:21px;color:#2F4B44;margin-top:2px;">${esc(text)}</div>
        </td>
      </tr>`).join('')}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:6px 0 0;"><tr><td style="border-left:3px solid #34D399;background:#F4F8F6;border-radius:0 12px 12px 0;padding:14px 16px;font-size:14px;line-height:21px;color:#2F4B44;">${esc(t.tip)}</td></tr></table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr>
      <td style="border-radius:11px;background:#047857;background-image:linear-gradient(135deg,#065F46,#047857 55%,#059669);">
        <a href="${esc(site)}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:11px;">${esc(t.cta)} &rarr;</a>
      </td>
    </tr></table>
    <p style="margin:0 0 28px;"><a href="${esc(site.replace(/\/$/, ''))}/#plataforma" style="font-size:14px;font-weight:700;color:#047857;text-decoration:underline;">${esc(t.ctaSecondary)}</a></p>

    <p style="margin:0;font-size:15px;line-height:23px;color:#2F4B44;">${esc(t.sign)}<br><b style="color:#062A21;">${esc(t.team)}</b><br><span style="font-size:13px;color:#5A716A;">${esc(t.company)}</span></p>
  </td></tr>

  <!-- Pie -->
  <tr><td style="background:#FFFFFF;border:1px solid #DCE8E2;border-top:0;border-radius:0 0 22px 22px;padding:20px 36px 28px;">
    <div style="height:1px;background:#E1ECE6;margin:0 0 18px;"></div>
    <p style="margin:0;font-size:12px;line-height:18px;color:#5A716A;">${esc(t.footer(siteHost))}</p>
    <p style="margin:8px 0 0;font-size:12px;"><a href="${esc(legal)}" style="color:#047857;text-decoration:underline;">${esc(t.legal)}</a></p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`

  const text = [
    t.hello(first), '', t.lead, '',
    `${t.summary}:`, ...detail.map(([k, v]) => `  ${k}: ${v}`), '',
    ...(see.length ? [`${t.seeTitle}:`, ...see.map(([a, b]) => `  · ${a}: ${b}`), ''] : []),
    `${t.nextTitle}:`, ...t.steps.map(([a, b], i) => `  ${i + 1}. ${a}. ${b}`), '',
    t.tip, '', `${t.cta}: ${site}`, '', t.sign, t.team, t.company, '', t.footer(siteHost), `${t.legal}: ${legal}`,
  ].join('\n')

  return { subject: t.subject(first), html, text }
}
