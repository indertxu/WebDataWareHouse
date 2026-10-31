import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Button, Icon, Reveal, SectionHead } from './ui.jsx'
import Logo from './Logo.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'
import { openCookieSettings } from '../consent.js'
import { APP_LOGIN_URL, REPORTING_URL, DEMO_REQUEST_URL, LEGAL_URL } from '../config.js'

const ease = [0.16, 1, 0.3, 1]

export function Security() {
  const { t } = useLang()
  const c = t.security
  return (
    <section className="section security" id="seguridad">
      <div className="wrap">
        <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
        <ul className="sec-list">
          {c.items.map((x, i) => (
            <Reveal as="li" key={x.title} delay={(i % 2) * 0.08 + Math.floor(i / 2) * 0.06}>
              <span className="sec-ico"><Icon name={x.icon} size={20} /></span>
              <span>
                <b>{x.title}</b>
                <span>{x.text}</span>
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Pricing() {
  const { t } = useLang()
  const c = t.pricing
  return (
    <section className="section pricing" id="precio">
      <div className="wrap">
        <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
        <div className="equation">
          {c.parts.map((p, i) => (
            <Reveal key={p.name} className="eq-part-wrap" delay={i * 0.1}>
              {i > 0 && <span className="eq-plus" aria-hidden="true">+</span>}
              <div className={`eq-part ${i === 1 ? 'is-focus' : ''}`}>
                <span className="eq-when">{p.when}</span>
                <h3 className="eq-name">{p.name}</h3>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="pricing-foot" delay={0.2}>
          <blockquote>{c.quote}</blockquote>
          <Button href="#demo" onClick={onAnchor} variant="ghost" arrow>{c.cta}</Button>
        </Reveal>
        <Reveal className="xsell" delay={0.1}>
          <div className="xsell-mark" aria-hidden="true">
            <span className="xs-a">Next Data</span>
            <Icon name="arrow" size={16} />
            <span className="xs-b">Next Reporting</span>
          </div>
          <div>
            <b>{c.reporting.title}</b>
            <p>{c.reporting.text}</p>
          </div>
          <a className="link-arrow" href={REPORTING_URL} target="_blank" rel="noreferrer">
            {c.reporting.link} <Icon name="arrow" size={15} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

export function Faq() {
  const { t } = useLang()
  const c = t.faq
  const [open, setOpen] = useState(0)
  return (
    <section className="section faq" id="preguntas">
      <div className="wrap faq-grid">
        <SectionHead kicker={c.kicker} title={c.title} />
        <div className="faq-list">
          {c.items.map((x, i) => {
            const on = open === i
            return (
              <div key={x.q} className={`faq-item ${on ? 'is-open' : ''}`}>
                <button aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
                  <span>{x.q}</span>
                  <Icon name="chevron" size={18} className="faq-chev" />
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div className="faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }}>
                      <p>{x.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Cta() {
  const { t, lang } = useLang()
  const c = t.cta
  const f = c.fields
  const empty = { first_name: '', last_name: '', company: '', company_size: '', email: '' }
  const [v, setV] = useState(empty)
  const [bad, setBad] = useState({}) // campos con error
  const [trap, setTrap] = useState('') // campo oculto anti-bots
  const [state, setState] = useState('idle') // idle | invalid | sending | sent | error

  const set = (k) => (e) => {
    setV((x) => ({ ...x, [k]: e.target.value }))
    if (bad[k]) setBad((b) => ({ ...b, [k]: false }))
    if (state === 'invalid' || state === 'error') setState('idle')
  }

  const check = (x) => ({
    first_name: !x.first_name.trim(),
    last_name: !x.last_name.trim(),
    company: !x.company.trim(),
    company_size: !SIZES.includes(x.company_size),
    email: !EMAIL_RE.test(x.email.trim()),
  })

  const submit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    const errs = check(v)
    if (Object.values(errs).some(Boolean)) {
      setBad(errs); setState('invalid')
      const first = Object.keys(errs).find((k) => errs[k])
      document.getElementById(`cta-${first}`)?.focus()
      return
    }
    setState('sending')
    try {
      const res = await fetch(DEMO_REQUEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: v.first_name.trim(),
          last_name: v.last_name.trim(),
          company: v.company.trim(),
          company_size: v.company_size,
          email: v.email.trim(),
          lang,
          source: 'next-data-web',
          page_url: window.location.href,
          referrer: document.referrer || null,
          company_website: trap,
        }),
      })
      if (res.ok) { setState('sent'); return }
      if (res.status === 400) {
        const data = await res.json().catch(() => ({}))
        const errs2 = {}
        ;(data.fields || ['email']).forEach((k) => { errs2[k] = true })
        setBad(errs2); setState('invalid')
      } else setState('error')
    } catch {
      setState('error')
    }
  }

  const msg = state === 'invalid' ? c.invalid : state === 'error' ? c.error : ''
  const busy = state === 'sending'
  const field = (k, props = {}) => (
    <label className={`cf ${props.wide ? 'cf-wide' : ''}`} htmlFor={`cta-${k}`}>
      <span>{f[k]}</span>
      <input id={`cta-${k}`} value={v[k]} onChange={set(k)} disabled={busy}
        aria-invalid={!!bad[k]} aria-describedby="cta-err" {...props.input} />
    </label>
  )

  return (
    <section className="section cta-sec" id="demo">
      <div className="wrap">
        <Reveal className="cta-band">
          <div className="cta-copy">
            <h2 className="h2">{c.title}</h2>
            <p>{c.sub}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {state === 'sent' ? (
              <motion.p key="ok" className="cta-sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <Icon name="check" size={18} stroke={2.6} /> {c.sent}
              </motion.p>
            ) : (
              <motion.form key="f" className="cta-form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
                {field('first_name', { input: { type: 'text', autoComplete: 'given-name', placeholder: f.first_name_ph } })}
                {field('last_name', { input: { type: 'text', autoComplete: 'family-name', placeholder: f.last_name_ph } })}
                {field('company', { wide: true, input: { type: 'text', autoComplete: 'organization', placeholder: f.company_ph } })}
                <label className="cf cf-wide" htmlFor="cta-company_size">
                  <span>{f.company_size}</span>
                  <select id="cta-company_size" value={v.company_size} onChange={set('company_size')} disabled={busy}
                    aria-invalid={!!bad.company_size} aria-describedby="cta-err" className={v.company_size ? '' : 'is-empty'}>
                    <option value="" disabled>{f.company_size_ph}</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s} {f.employees}</option>)}
                  </select>
                </label>
                {field('email', { wide: true, input: { type: 'email', autoComplete: 'email', placeholder: c.placeholder } })}
                <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={trap} onChange={(e) => setTrap(e.target.value)} />
                <Button type="submit" variant="lime" arrow={!busy} disabled={busy} aria-busy={busy} className="cf-wide">
                  {busy ? c.sending : c.button}
                </Button>
                <span id="cta-err" className="cta-err" role="alert">{msg}</span>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useLang()
  const c = t.footer
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Logo />
          <p>{c.line}</p>
        </div>
        <nav aria-label={c.product}>
          <span className="f-label">{c.product}</span>
          {t.nav.links.slice(0, 4).map((l) => <a key={l.id} href={`#${l.id}`} onClick={onAnchor}>{l.label}</a>)}
        </nav>
        <nav aria-label={c.company}>
          <span className="f-label">{c.company}</span>
          <a href={REPORTING_URL} target="_blank" rel="noreferrer">{c.links.reporting}</a>
          <a href={APP_LOGIN_URL}>{c.links.login}</a>
          <a href="#demo" onClick={onAnchor}>{c.links.contact}</a>
          <a href={LEGAL_URL} target="_blank" rel="noreferrer">{c.links.privacy}</a>
          <button type="button" className="f-btn" onClick={openCookieSettings}>{c.links.cookies}</button>
          <a href={LEGAL_URL} target="_blank" rel="noreferrer">{c.links.legal}</a>
        </nav>
      </div>
      <div className="wrap footer-base">
        <span>© 2026 Next Finance</span>
        <span>{c.demo}</span>
      </div>
    </footer>
  )
}

/* Banda corta de llamada a la acción entre secciones */
export function CtaStrip() {
  const { t } = useLang()
  const c = t.strips.afterLayers
  return (
    <section className="strip-sec">
      <div className="wrap">
        <Reveal className="strip">
          <span className="strip-glow" aria-hidden="true" />
          <div>
            <b>{c.title}</b>
            <span>{c.text}</span>
          </div>
          <div className="strip-actions">
            <Button href="#producto" onClick={onAnchor} variant="ghost-dark">{c.secondary}</Button>
            <Button href="#demo" onClick={onAnchor} variant="lime" arrow>{c.primary}</Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* Botón flotante: aparece tras el hero y se esconde al llegar al formulario */
export function FloatingCta() {
  const { t } = useLang()
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const demo = document.getElementById('demo')
    const nearEnd = demo && demo.getBoundingClientRect().top < window.innerHeight * 0.9
    setShow(y > window.innerHeight * 0.9 && !nearEnd)
  })
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#demo" onClick={onAnchor} className="fcta"
          initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.45, ease }}>
          <span className="fcta-pulse" aria-hidden="true" />
          <Icon name="sparkles" size={16} />
          {t.floating}
          <Icon name="arrow" size={15} className="btn-arrow" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
