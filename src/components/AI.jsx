import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Icon, Reveal, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'

const ease = [0.16, 1, 0.3, 1]

function useTyped(text, start, speed = 16, delay = 0) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? text.length : 0)
  useEffect(() => {
    if (!start) return
    if (reduce) { setN(text.length); return }
    setN(0)
    let id
    const t0 = setTimeout(() => {
      id = setInterval(() => setN((x) => { if (x >= text.length) { clearInterval(id); return x } return x + 2 }), speed)
    }, delay)
    return () => { clearTimeout(t0); clearInterval(id) }
  }, [start, text, speed, delay, reduce])
  return [text.slice(0, n), n >= text.length]
}

export default function AI() {
  const { t } = useLang()
  const c = t.ai
  const ch = c.chat
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const [q, qDone] = useTyped(ch.q, inView, 22, 300)
  const [thinking, setThinking] = useState(false)
  const [startA, setStartA] = useState(false)
  useEffect(() => {
    if (!qDone || !inView) return
    setThinking(true)
    const id = setTimeout(() => { setThinking(false); setStartA(true) }, 1100)
    return () => clearTimeout(id)
  }, [qDone, inView])
  const [a, aDone] = useTyped(ch.a, startA, 14)

  return (
    <section className="section ai" id="ia">
      <div className="wrap ai-grid">
        <div>
          <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
          <ul className="ai-points">
            {c.points.map((p, i) => (
              <Reveal as="li" key={p.title} delay={0.1 + i * 0.08}>
                <Icon name={i === 3 ? 'shield' : 'sparkles'} size={18} />
                <span><b>{p.title}</b> {p.text}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="panel chat" ref={ref}>
          <div className="chat-head">
            <span className="chat-avatar"><Icon name="sparkles" size={16} /></span>
            <span>{ch.title}</span>
            <span className="chip chip-live"><i />Gold · oct 2026</span>
          </div>
          <div className="chat-body" aria-live="polite">
            {q && <div className="msg msg-q">{q}{!qDone && <span className="caret" />}</div>}
            {thinking && <div className="msg msg-a typing" aria-label="…"><i /><i /><i /></div>}
            {startA && (
              <div className="msg msg-a">
                <p>{a}{!aDone && <span className="caret" />}</p>
                {aDone && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
                    <dl className="chat-rows">
                      {ch.rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                    </dl>
                    <div className="chat-actions">
                      <span className="chip chip-link"><Icon name="trace" size={13} /> {ch.link}</span>
                      <span className="chip chip-cta">{ch.action}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
          <div className="chat-input">
            <span>{ch.placeholder}</span>
            <span className="chat-send"><Icon name="send" size={14} /></span>
          </div>
        </div>
      </div>
    </section>
  )
}
