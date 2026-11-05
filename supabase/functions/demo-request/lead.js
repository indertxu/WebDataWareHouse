// Datos comunes del lead: prioridad, empresa y conectores. Lo usan el correo al equipo y el envío al CRM.

export const TOOL_NAMES = {
  es: { dw: 'Data Warehouse', conso: 'Consolidación', plan: 'Planificación', report: 'Reporting' },
  en: { dw: 'Data Warehouse', conso: 'Consolidation', plan: 'Planning', report: 'Reporting' },
}

// Fuentes que hoy conectamos sin desarrollo adicional
export const LIVE_SOURCES = ['Business Central', 'SQL Server', 'Excel']

const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es', 'live.com', 'yahoo.com', 'yahoo.es',
  'icloud.com', 'me.com', 'msn.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'gmx.es',
])

export function emailDomain(email) {
  const d = String(email || '').split('@')[1] || ''
  return { domain: d, personal: FREE_MAIL.has(d) }
}

// Prioridad: cuantas más sociedades y más herramientas, más encaja con lo que vendemos.
export function scoreLead(row) {
  const reasons = []
  let score = 0
  const ent = { '1': 0, '2-5': 2, '6-15': 3, '16-50': 4, '50+': 4 }[row.entities_count] ?? 0
  if (ent) { score += ent; reasons.push(`${row.entities_count} sociedades`) }
  const size = { '1-10': 0, '11-50': 0, '51-200': 1, '201-500': 2, '501-1000': 2, '1000+': 2 }[row.company_size] ?? 0
  if (size) { score += size; reasons.push(`${row.company_size} empleados`) }
  const tools = (row.tools || []).length
  if (tools >= 3) { score += 2; reasons.push(`${tools} herramientas`) }
  else if (tools === 2) { score += 1; reasons.push('2 herramientas') }
  if ((row.tools || []).includes('conso') && ent >= 2) { score += 1; reasons.push('consolida un grupo') }
  const { personal } = emailDomain(row.email)
  if (personal) { score -= 1; reasons.push('email personal') }
  const priority = score >= 6 ? 'alta' : score >= 3 ? 'media' : 'baja'
  return { score, priority, reasons }
}

export function splitErps(erps) {
  const list = erps || []
  return {
    live: list.filter((e) => LIVE_SOURCES.includes(e)),
    pending: list.filter((e) => !LIVE_SOURCES.includes(e)),
  }
}

// Lo que conviene enseñar en la demo, según lo que ha marcado
export function demoPlan(row) {
  const t = row.tools || []
  const steps = []
  const erps = (row.erps || []).join(', ') || 'sus fuentes'
  if (t.includes('dw')) steps.push(`Data Warehouse: ${erps} llegando a gold, con cuadre y firma por sociedad.`)
  if (t.includes('conso')) steps.push(`Consolidación: árbol de ${row.entities_count || 'sus'} sociedades, métodos y eliminación intercompañía.`)
  if (t.includes('plan')) steps.push('Planificación: presupuesto por driver operativo con reales al lado.')
  if (t.includes('report')) steps.push('Reporting: KPIs financieros y operativos con drill-down hasta el apunte.')
  if (!steps.length) steps.push('Visión general de la plataforma y las cuatro herramientas.')
  return steps
}

// Formato neutro para el CRM: contacto, empresa y oportunidad
export function crmPayload(row) {
  const { domain, personal } = emailDomain(row.email)
  const lead = scoreLead(row)
  return {
    contact: {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      language: row.lang || 'es',
    },
    company: {
      name: row.company,
      domain: personal ? null : domain,
      employees: row.company_size,
      entities: row.entities_count,
      erps: row.erps || [],
    },
    deal: {
      title: `Demo Next Data · ${row.company}`,
      product: 'Next Data',
      tools: row.tools || [],
      tool_names: (row.tools || []).map((k) => TOOL_NAMES.es[k] || k),
      priority: lead.priority,
      score: lead.score,
      score_reasons: lead.reasons,
      source: row.source,
      page_url: row.page_url,
      referrer: row.referrer,
      requested_at: row.created_at,
      demo_request_id: row.id,
    },
  }
}
