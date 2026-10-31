// Consentimiento de cookies: guarda la elección en el navegador y la registra (anónima) en Supabase.
// Para cargar una herramienta solo con permiso:  onConsent((c) => { if (c.analytics) cargarAnalitica() })
import { COOKIE_CONSENT_URL } from './config.js'

export const POLICY_VERSION = '2026-10'
const KEY = 'nd-consent'
const MAX_AGE_DAYS = 365 // se vuelve a preguntar pasado un año
const listeners = new Set()

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function getConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!c || c.version !== POLICY_VERSION) return null
    if (Date.now() - new Date(c.at).getTime() > MAX_AGE_DAYS * 864e5) return null
    return c
  } catch { return null }
}

function visitorId() {
  try {
    const old = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (old?.visitor_id) return old.visitor_id
  } catch {}
  return uuid()
}

export function saveConsent(action, choices, lang) {
  const c = {
    version: POLICY_VERSION,
    visitor_id: visitorId(),
    action,
    analytics: action === 'accept_all' ? true : action === 'reject_all' ? false : !!choices.analytics,
    marketing: action === 'accept_all' ? true : action === 'reject_all' ? false : !!choices.marketing,
    at: new Date().toISOString(),
  }
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
  listeners.forEach((fn) => fn(c))
  // registro en Supabase; si falla, la elección del visitante se respeta igualmente
  fetch(COOKIE_CONSENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      visitor_id: c.visitor_id, action, analytics: c.analytics, marketing: c.marketing,
      policy_version: POLICY_VERSION, source: 'next-data-web', lang, page_url: window.location.href,
    }),
  }).catch(() => {})
  return c
}

export function onConsent(fn) {
  listeners.add(fn)
  const c = getConsent()
  if (c) fn(c)
  return () => listeners.delete(fn)
}

// Abre el panel de configuración desde cualquier sitio (p. ej. el enlace del pie)
export const openCookieSettings = () => window.dispatchEvent(new Event('nd:cookie-settings'))
