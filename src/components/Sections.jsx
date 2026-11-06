import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Button, Icon, Reveal, SectionHead } from './ui.jsx'
import Logo from './Logo.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'
import { openCookieSettings } from '../consent.js'
import { APP_LOGIN_URL, REPORTING_URL, DEMO_REQUEST_URL, LEGAL_URL } from '../config.js'

const ease = [0.16, 1, 0.3, 1]

export function Faq() {
  const { t } = useLang()
  const c = t.faq
  const [open, setOpen] = useState(0)
  return (
    <section className="section faq" id="preguntas">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <SectionHead kicker={c.kicker} title={c.title} />
          <Reveal className="faq-contact" delay={0.2}>
            <b>{c.contact.title}</b>
            <span>{c.contact.text}</span>
            <a className="faq-mail" href={`mailto:${c.contact.email}`}><Icon name="send" size={15} /> {c.contact.email}</a>
            <Button href="#demo" onClick={onAnchor} variant="primary" arrow>{c.contact.cta}</Button>
          </Reveal>
        </div>
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
const ENTITIES = ['1', '2-5', '6-15', '16-50', '50+']
const ERPS = ['Business Central', 'SAP', 'Sage', 'a3ERP', 'Odoo', 'Holded', 'NetSuite', 'Excel']
const TOOLS = ['dw', 'conso', 'plan', 'report']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* Icono de cada herramienta en el formulario */
const TOOL_ICON = { dw: 'db', conso: 'layers', plan: 'chart', report: 'eye' }

/* Tarjeta "Tu demo": se va rellenando mientras eliges */
function DemoTicket({ c, v }) {
  const p = c.preview
  const f = c.fields
  const erps = [...v.erps.filter((x) => x !== 'other'), ...(v.erps.includes('other') && v.erp_other.trim() ? [v.erp_other.trim()] : [])]
  const who = [`${v.first_name} ${v.last_name}`.trim(), v.company.trim()].filter(Boolean).join(' · ')
  const rows = [
    { k: 'tools', label: p.tools, empty: p.tools_empty, done: v.tools.length > 0,
      body: <span className="tk-chips">{v.tools.map((k) => <motion.span layout key={k} className="tk-chip" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}><Icon name={TOOL_ICON[k]} size={12} /> {c.tools[k]}</motion.span>)}</span> },
    { k: 'group', label: p.group, empty: p.group_empty, done: !!(v.entities && v.company_size),
      body: [v.entities && `${v.entities} ${f.entity_word}`, v.company_size && `${v.company_size} ${f.employees}`].filter(Boolean).join(' · ') },
    { k: 'sources', label: p.sources, empty: p.sources_empty, done: erps.length > 0, body: erps.join(', ') },
    { k: 'who', label: p.who, empty: p.who_empty, done: !!(v.first_name.trim() && v.company.trim()), body: who },
  ]
  const n = rows.filter((r) => r.done).length
  return (
    <div className="ticket">
      <div className="tk-head">
        <span className="tk-ico"><Icon name="sparkles" size={16} /></span>
        <span><b>{p.title}</b><em>{p.meta}</em></span>
        <span className="tk-ring" aria-label={p.progress.replace('{n}', n)}>
          <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" className="tk-ring-bg" />
            <motion.circle cx="18" cy="18" r="15" className="tk-ring-fg" strokeDasharray="94.25" animate={{ strokeDashoffset: 94.25 * (1 - n / 4) }} transition={{ duration: 0.6, ease }} transform="rotate(-90 18 18)" /></svg>
          <i>{n}/4</i>
        </span>
      </div>
      <ul className="tk-rows">
        {rows.map((r) => {
          const filled = r.done || (typeof r.body === 'string' && r.body)
          return (
            <li key={r.k} className={filled ? 'is-on' : ''}>
              <span className="tk-check">{filled ? <Icon name="check" size={12} stroke={3} /> : null}</span>
              <span className="tk-k">{r.label}</span>
              <span className="tk-v">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={filled ? 'v' : 'e'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    {filled ? r.body : <span className="tk-empty">{r.empty}</span>}
                  </motion.span>
                </AnimatePresence>
              </span>
            </li>
          )
        })}
      </ul>
      <AnimatePresence>
        {n === 4 && (
          <motion.p className="tk-ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Icon name="check" size={14} stroke={3} /> {p.ready}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Cta() {
  const { t, lang } = useLang()
  const c = t.cta
  const f = c.fields
  const empty = { first_name: '', last_name: '', company: '', company_size: '', entities: '', erps: [], erp_other: '', tools: [], email: '' }
  const [v, setV] = useState(empty)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [bad, setBad] = useState({}) // campos con error
  const [trap, setTrap] = useState('') // campo oculto anti-bots
  const [state, setState] = useState('idle') // idle | invalid | sending | sent | error
  const [note, setNote] = useState('')
  const formRef = useRef(null)

  const clear = (k) => {
    if (bad[k]) setBad((b) => ({ ...b, [k]: false }))
    if (state === 'invalid' || state === 'error') setState('idle')
    setNote('')
  }
  const set = (k) => (e) => { setV((x) => ({ ...x, [k]: e.target.value })); clear(k) }
  const pick = (k, val) => { setV((x) => ({ ...x, [k]: val })); clear(k) }
  const toggleIn = (k, val) => {
    setV((x) => ({ ...x, [k]: x[k].includes(val) ? x[k].filter((y) => y !== val) : [...x[k], val] }))
    clear(k)
  }

  // Qué campos van en cada paso, para validar por partes y volver al paso del error
  const STEP_OF = { tools: 0, entities: 1, company_size: 1, first_name: 2, last_name: 2, company: 2, email: 2 }
  const check = (x) => ({
    tools: x.tools.length === 0,
    entities: !ENTITIES.includes(x.entities),
    company_size: !SIZES.includes(x.company_size),
    first_name: !x.first_name.trim(),
    last_name: !x.last_name.trim(),
    company: !x.company.trim(),
    email: !EMAIL_RE.test(x.email.trim()),
  })
  const go = (to) => {
    setDir(to > step ? 1 : -1); setStep(to); setNote('')
    // si el principio del formulario ha quedado fuera de pantalla (móvil), volver a él
    const el = formRef.current
    if (el && el.getBoundingClientRect().top < 70) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
  }

  const next = () => {
    const errs = check(v)
    const here = Object.keys(errs).filter((k) => errs[k] && STEP_OF[k] === step)
    if (here.length) {
      setBad((b) => ({ ...b, ...Object.fromEntries(here.map((k) => [k, true])) }))
      setNote(step === 0 ? c.needTools : step === 1 ? c.needGroup : c.invalid)
      return
    }
    go(step + 1)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (step < 2) { next(); return }
    if (state === 'sending') return
    const errs = check(v)
    if (Object.values(errs).some(Boolean)) {
      setBad(errs); setState('invalid')
      const first = Object.keys(errs).find((k) => errs[k])
      if (STEP_OF[first] !== step) go(STEP_OF[first])
      else document.getElementById(`cta-${first}`)?.focus()
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
          entities_count: v.entities,
          erps: [...v.erps.filter((x) => x !== 'other'), ...(v.erps.includes('other') && v.erp_other.trim() ? [v.erp_other.trim()] : [])],
          tools: v.tools,
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
        ;(data.fields || ['email']).forEach((k) => { errs2[k === 'entities_count' ? 'entities' : k] = true })
        setBad(errs2); setState('invalid')
        const first = Object.keys(errs2)[0]
        if (STEP_OF[first] !== undefined && STEP_OF[first] !== step) go(STEP_OF[first])
      } else setState('error')
    } catch {
      setState('error')
    }
  }

  const msg = note || (state === 'invalid' ? c.invalid : state === 'error' ? c.error : '')
  const busy = state === 'sending'
  const field = (k, props = {}) => (
    <label className={`df ${props.wide ? 'df-wide' : ''}`} htmlFor={`cta-${k}`}>
      <span>{f[k]}</span>
      <input id={`cta-${k}`} value={v[k]} onChange={set(k)} disabled={busy}
        aria-invalid={!!bad[k]} aria-describedby="cta-err" {...props.input} />
    </label>
  )
  const slide = {
    initial: (d) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
    exit: (d) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2 } }),
  }

  return (
    <section className="section cta-sec" id="demo">
      <div className="wrap">
        <Reveal className={`cta-band ${state === 'sent' ? 'is-done' : ''}`}>
          <AnimatePresence mode="wait" initial={false}>
            {state === 'sent' ? (
              <motion.div key="done" className="cta-done" role="status"
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
                <motion.span className="cta-done-ico" initial={{ scale: 0.4, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}>
                  <Icon name="check" size={34} stroke={2.8} />
                </motion.span>
                <p className="cta-done-kicker">{c.sent}</p>
                <h2 className="h2">{c.doneTitle.replace('{name}', v.first_name.trim())}</h2>
                <p className="cta-done-lead">{c.sentText}</p>
                <ol className="cta-done-steps">
                  {c.doneSteps.map((st, i) => (
                    <motion.li key={st.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, ease, delay: 0.35 + i * 0.1 }}>
                      <span className="cd-n">{i + 1}</span>
                      <b>{st.title}</b>
                      <span>{st.text.replace('{email}', v.email.trim())}</span>
                    </motion.li>
                  ))}
                </ol>
                <div className="cta-done-actions">
                  <Button href="#plataforma" onClick={onAnchor} variant="lime" arrow>{c.doneCta}</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="cta-grid demo-grid" exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}>
                <div className="cta-copy">
                  <h2 className="h2">{c.title}</h2>
                  <p>{c.sub}</p>
                  <DemoTicket c={c} v={v} />
                  <ul className="assure">
                    {c.assure.map((x) => <li key={x}><Icon name="check" size={13} stroke={3} /> {x}</li>)}
                  </ul>
                </div>

                <form className="dform" onSubmit={submit} noValidate ref={formRef}>
                  <ol className="ds-steps" aria-label={c.title}>
                    {c.steps.map((s, i) => (
                      <li key={s} className={`${i === step ? 'is-on' : ''} ${i < step ? 'is-done' : ''}`}>
                        <button type="button" onClick={() => i < step && go(i)} disabled={i >= step || busy} aria-current={i === step ? 'step' : undefined}>
                          <span className="ds-n">{i < step ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
                          <span className="ds-l">{s}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  <div className="ds-bar"><motion.span animate={{ scaleX: (step + 1) / 3 }} transition={{ duration: 0.5, ease }} /></div>

                  <div className="ds-body">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit">
                        <h3 className="ds-title">{c.stepTitles[step]}</h3>
                        <p className="ds-hint">{c.stepHints[step]}</p>

                        {step === 0 && (
                          <div className="tool-cards" id="cta-tools" role="group" aria-label={f.tools} aria-invalid={!!bad.tools}>
                            {TOOLS.map((k) => {
                              const on = v.tools.includes(k)
                              return (
                                <motion.button type="button" key={k} className={`tcard ${on ? 'is-on' : ''} ${bad.tools ? 'is-bad' : ''}`}
                                  aria-pressed={on} onClick={() => toggleIn('tools', k)} whileTap={{ scale: 0.97 }}>
                                  <span className="tc-ico"><Icon name={TOOL_ICON[k]} size={20} /></span>
                                  <span className="tc-txt"><b>{c.tools[k]}</b><span>{c.toolText[k]}</span></span>
                                  <span className="tc-check">{on && <Icon name="check" size={13} stroke={3} />}</span>
                                </motion.button>
                              )
                            })}
                          </div>
                        )}

                        {step === 1 && (
                          <div className="ds-group">
                            <div className="df-pills" id="cta-entities" role="radiogroup" aria-label={f.entities} aria-invalid={!!bad.entities}>
                              <span className="df-label">{f.entities}</span>
                              <div className={`pills ${bad.entities ? 'is-bad' : ''}`}>
                                {ENTITIES.map((x) => (
                                  <button type="button" key={x} role="radio" aria-checked={v.entities === x} className={`pill ${v.entities === x ? 'is-on' : ''}`} onClick={() => pick('entities', x)}>{x}</button>
                                ))}
                              </div>
                            </div>
                            <div className="df-pills" id="cta-company_size" role="radiogroup" aria-label={f.company_size} aria-invalid={!!bad.company_size}>
                              <span className="df-label">{f.company_size}</span>
                              <div className={`pills ${bad.company_size ? 'is-bad' : ''}`}>
                                {SIZES.map((x) => (
                                  <button type="button" key={x} role="radio" aria-checked={v.company_size === x} className={`pill ${v.company_size === x ? 'is-on' : ''}`} onClick={() => pick('company_size', x)}>{x}</button>
                                ))}
                              </div>
                            </div>
                            <div className="df-pills" id="cta-erps">
                              <span className="df-label">{f.erps} <em>{f.erps_hint}</em></span>
                              <div className="pills">
                                {[...ERPS, 'other'].map((x) => (
                                  <button type="button" key={x} aria-pressed={v.erps.includes(x)} className={`pill pill-soft ${v.erps.includes(x) ? 'is-on' : ''}`} onClick={() => toggleIn('erps', x)}>
                                    {v.erps.includes(x) && <Icon name="check" size={11} stroke={3} />} {x === 'other' ? f.erp_other : x}
                                  </button>
                                ))}
                              </div>
                              {v.erps.includes('other') && (
                                <input className="df-other" value={v.erp_other} onChange={set('erp_other')} placeholder={f.erp_other_ph} aria-label={f.erp_other} autoFocus />
                              )}
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          <div className="ds-fields">
                            {field('first_name', { input: { type: 'text', autoComplete: 'given-name', placeholder: f.first_name_ph, autoFocus: true } })}
                            {field('last_name', { input: { type: 'text', autoComplete: 'family-name', placeholder: f.last_name_ph } })}
                            {field('company', { wide: true, input: { type: 'text', autoComplete: 'organization', placeholder: f.company_ph } })}
                            {field('email', { wide: true, input: { type: 'email', autoComplete: 'email', placeholder: c.placeholder } })}
                            <input className="hp" type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                              value={trap} onChange={(e) => setTrap(e.target.value)} />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="ds-foot">
                    <span id="cta-err" className="cta-err" role="alert">{msg}</span>
                    <div className="ds-actions">
                      {step > 0 && <button type="button" className="ds-back" onClick={() => go(step - 1)} disabled={busy}>← {c.back}</button>}
                      {step < 2
                        ? <Button type="submit" variant="primary" arrow>{c.next}</Button>
                        : <Button type="submit" variant="primary" arrow={!busy} disabled={busy} aria-busy={busy}>{busy ? c.sending : c.button}</Button>}
                    </div>
                  </div>
                  {step === 2 && <p className="ds-privacy"><Icon name="lock" size={12} /> {c.privacy} <a href={LEGAL_URL} target="_blank" rel="noreferrer">{c.privacyLink}</a></p>}
                </form>
              </motion.div>
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
          {t.nav.links.slice(0, 6).map((l) => <a key={l.id} href={`#${l.id}`} onClick={onAnchor}>{l.label}</a>)}
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
