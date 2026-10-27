import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Button, Icon, Reveal, SectionHead } from './ui.jsx'
import Logo from './Logo.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'
import { APP_LOGIN_URL, REPORTING_URL } from '../config.js'

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

export function Cta() {
  const { t } = useLang()
  const c = t.cta
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | invalid | sent
  const submit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setState('invalid'); return }
    // TODO: conectar con el CRM o el formulario de Next Finance.
    setState('sent')
  }
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
                <label className="sr-only" htmlFor="cta-email">Email</label>
                <input id="cta-email" type="email" placeholder={c.placeholder} value={email}
                  onChange={(e) => { setEmail(e.target.value); setState('idle') }}
                  aria-invalid={state === 'invalid'} aria-describedby="cta-err" autoComplete="email" />
                <Button type="submit" variant="lime" arrow>{c.button}</Button>
                <span id="cta-err" className="cta-err" role="alert">{state === 'invalid' ? c.invalid : ''}</span>
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
          <a href="#">{c.links.privacy}</a>
          <a href="#">{c.links.legal}</a>
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
