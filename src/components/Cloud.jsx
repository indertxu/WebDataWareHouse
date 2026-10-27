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

export default function Cloud() {
  const { t } = useLang()
  const c = t.cloud
  const L = c.labels
  const [k, setK] = useState(0)
  const opt = c.options[k]

  return (
    <section className="section cloud" id="nube">
      <div className="wrap">
        <div className="panel cloud-panel">
          <div className="cloud-grid-bg" aria-hidden="true" />
          <div className="cloud-left">
            <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} dark />
            <div className="seg seg-dark" role="tablist">
              {c.options.map((o, i) => (
                <button key={o.key} role="tab" aria-selected={k === i} className={`seg-btn ${k === i ? 'is-on' : ''}`} onClick={() => setK(i)}>
                  {k === i && <motion.span layoutId="cloud-pill" className="seg-pill is-after" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className="seg-in"><CloudMark kind={o.key} />{o.name}</span>
                </button>
              ))}
            </div>
          </div>

          <Reveal className="cloud-right" delay={0.15}>
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
                  {['bronze', 'silver', 'gold'].map((m) => (
                    <span key={m} className={`cd-layer m-${m}`}><i />{m[0].toUpperCase() + m.slice(1)}</span>
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
          </Reveal>
        </div>
      </div>
    </section>
  )
}
