import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Icon, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'

const ease = [0.16, 1, 0.3, 1]

/* Interruptor grande: deja claro que se puede pulsar */
function BigSwitch({ on, onChange, labels, hint, touched }) {
  return (
    <div className="bswitch-wrap">
      <button type="button" role="switch" aria-checked={on} className={`bswitch ${on ? 'is-on' : ''}`}
        onClick={() => onChange(!on)}>
        <span className={`bs-label ${!on ? 'is-cur' : ''}`}>{labels[0]}</span>
        <span className="bs-track">
          {!touched && <span className="bs-ring" aria-hidden="true" />}
          <motion.span className="bs-knob" layout transition={{ type: 'spring', stiffness: 500, damping: 32 }}>
            <Icon name={on ? 'check' : 'alert'} size={14} stroke={2.6} />
          </motion.span>
        </span>
        <span className={`bs-label ${on ? 'is-cur' : ''}`}>{labels[1]}</span>
      </button>
      <AnimatePresence>
        {!touched && (
          <motion.span className="bs-hint" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.4 13.6a1.5 1.5 0 0 1 2.5-1.7L9 15" /></svg>
            {hint}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Problem() {
  const { t } = useLang()
  const c = t.problem
  const s = t.strips.afterProblem
  const [after, setAfter] = useState(false)
  const [touched, setTouched] = useState(false)
  const listRef = useRef(null)
  const inView = useInView(listRef, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()

  // Una sola vez: al entrar en pantalla, enseña el cambio y vuelve, para invitar a pulsar.
  useEffect(() => {
    if (!inView || touched || reduce) return
    const a = setTimeout(() => setAfter(true), 1800)
    const b = setTimeout(() => setAfter(false), 4800)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [inView]) // eslint-disable-line

  const pick = (v) => { setTouched(true); setAfter(v) }
  const n = c.rows.length

  return (
    <section className="section problem" id="problema">
      <div className="wrap">
        <div className="problem-top">
          <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
          <div className="tally" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={after ? 'a' : 'b'} className={`tally-num ${after ? 'is-after' : ''}`}
                initial={{ y: 40, opacity: 0, filter: 'blur(8px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -40, opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.5, ease }}>
                {after ? 0 : n}
              </motion.span>
            </AnimatePresence>
            <span className="tally-label">{after ? c.tallyAfter : c.tallyBefore}</span>
          </div>
        </div>

        <div className={`compare ${after ? 'is-after' : ''}`}>
          <div className="compare-bar">
            <BigSwitch on={after} onChange={pick} labels={[c.before, c.after]} hint={c.hint} touched={touched} />
          </div>
          <ol className="problem-list" ref={listRef} onClick={() => pick(!after)}>
            {c.rows.map((r, i) => (
              <motion.li key={r.topic} className="prow"
                initial={reduce ? false : { opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease, delay: i * 0.07 }}>
                <span className="prow-topic">{r.topic}</span>
                <span className={`prow-ico ${after ? 'ok' : 'warn'}`}>
                  <Icon name={after ? 'check' : 'alert'} size={15} stroke={2.4} />
                </span>
                <span className="prow-text">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={after ? 'a' : 'b'} className="prow-swap"
                      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease, delay: i * 0.05 } }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(5px)', transition: { duration: 0.18, delay: i * 0.025 } }}>
                      {after ? r.after : r.before}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.li>
            ))}
          </ol>
          <div className="compare-foot">
            <span>{s.text}</span>
            <a className="link-arrow" href="#demo" onClick={onAnchor}>{s.link} <Icon name="arrow" size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}
