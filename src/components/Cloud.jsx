import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, Reveal, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'

const ease = [0.16, 1, 0.3, 1]

function CloudMark({ kind }) {
  if (kind === 'gcp') return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 18a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 18.8 9.6 4.2 4.2 0 0 1 18 18H7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
  )
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity=".9" /><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity=".6" /><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".6" /><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity=".35" /></svg>
  )
}

function CloudDiagram({ c, k, setK }) {
  const L = c.labels
  const opt = c.options[k]
  return (
    <>
      <div className="seg seg-dark trust-seg" role="tablist" aria-label={c.title}>
        {c.options.map((o, i) => (
          <button key={o.key} role="tab" aria-selected={k === i} className={`seg-btn ${k === i ? 'is-on' : ''}`} onClick={() => setK(i)}>
            {k === i && <motion.span layoutId="trust-cloud-pill" className="seg-pill is-after" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="seg-in"><CloudMark kind={o.key} />{o.name}</span>
          </button>
        ))}
      </div>
      <div className="cd">
        <div className="cd-node cd-in"><Icon name="db" size={16} /> {L.erp}</div>
        <div className="cd-arrow"><span>{L.readonly}</span><i /></div>
        <div className="cd-project">
          <span className="cd-tag"><CloudMark kind={opt.key} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={opt.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease }}>
                {opt.name}
              </motion.span>
            </AnimatePresence>
            <em>{L.project}</em>
          </span>
          <div className="cd-layers">
            {['bronze', 'silver', 'gold'].map((m, i) => (
              <motion.span key={m} className={`cd-layer m-${m}`} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease }}><i />{m[0].toUpperCase() + m.slice(1)}</motion.span>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={opt.key} className="cd-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <span><Icon name="db" size={14} /> {opt.store}</span>
              <span><Icon name="key" size={14} /> {opt.keys}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="cd-arrow"><span>{L.checked}</span><i /></div>
        <div className="cd-node cd-out"><Icon name="send" size={16} /> {L.out}</div>
      </div>
    </>
  )
}

/* Banda oscura a todo el ancho: seguridad y nube juntas */
export function Trust() {
  const { t } = useLang()
  const sec = t.security
  const c = t.cloud
  const [k, setK] = useState(0)
  return (
    <section className="trust" id="seguridad">
      <div className="trust-bg" aria-hidden="true"><span className="trust-orb" /><span className="trust-grid" /></div>
      <div className="wrap">
        <div className="trust-top">
          <SectionHead kicker={sec.kicker} title={sec.title} sub={sec.sub} dark />
          <Reveal tilt delay={0.1} className="panel trust-cloud" id="nube">
            <div className="trust-cloud-head">
              <b>{c.title}</b>
              <span>{c.sub}</span>
            </div>
            <CloudDiagram c={c} k={k} setK={setK} />
          </Reveal>
        </div>
        <ul className="trust-list">
          {sec.items.map((x, i) => (
            <Reveal as="li" key={x.title} delay={(i % 3) * 0.08 + Math.floor(i / 3) * 0.1}>
              <span className="trust-ico"><Icon name={x.icon} size={19} /></span>
              <b>{x.title}</b>
              <span>{x.text}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
