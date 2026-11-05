import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Icon, Reveal, SectionHead, useTyped } from './ui.jsx'
import { useLang } from '../i18n.jsx'

const ease = [0.16, 1, 0.3, 1]

/* =========================================================
   Manifiesto: una frase grande que se enciende al bajar
   ========================================================= */
function Word({ children, progress, range, mark }) {
  const o = useTransform(progress, range, [0.14, 1])
  const y = useTransform(progress, range, [8, 0])
  return <motion.span className={`mf-w ${mark ? 'is-mark' : ''}`} style={{ opacity: o, y }}>{children} </motion.span>
}

export function Manifesto() {
  const { t } = useLang()
  const c = t.manifesto
  const ref = useRef(null)
  const textRef = useRef(null)
  const reduce = useReducedMotion()
  // Empieza cuando el texto asoma y termina cuando su última línea pasa por el 62 % de la pantalla:
  // al llegar al centro ya está entera.
  const { scrollYProgress } = useScroll({ target: textRef, offset: ['start 92%', 'end 62%'] })
  const words = c.text.split(' ')
  // Palabras destacadas: las que forman parte de alguna de las frases marcadas
  const marked = new Set()
  c.marks.forEach((m) => {
    const mw = m.split(' ')
    for (let i = 0; i + mw.length <= words.length; i++) {
      if (mw.every((w, k) => words[i + k] === w)) mw.forEach((_, k) => marked.add(i + k))
    }
  })
  return (
    <section className="section manifesto" ref={ref} aria-label={c.text}>
      <div className="wrap">
        <p className="mf-text" aria-hidden="true" ref={textRef}>
          {words.map((w, i) => {
            const a = i / words.length
            return reduce
              ? <span key={i} className={`mf-w ${marked.has(i) ? 'is-mark' : ''}`}>{w} </span>
              : <Word key={i} progress={scrollYProgress} range={[a * 0.85, a * 0.85 + 0.15]} mark={marked.has(i)}>{w}</Word>
          })}
        </p>
      </div>
    </section>
  )
}

/* =========================================================
   Consola de cargas: el pipeline trabajando en directo
   ========================================================= */
const TAG = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', check: 'Check', sign: 'Firma' }

export function PipelineConsole() {
  const { t, lang } = useLang()
  const c = t.console
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35 })
  const reduce = useReducedMotion()
  const total = c.lines.length
  const [n, setN] = useState(reduce ? total : 0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    if (n < total) {
      const id = setTimeout(() => setN((x) => x + 1), n === 0 ? 500 : 780)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => { setN(0); setCycle((x) => x + 1) }, 4200)
    return () => clearTimeout(id)
  }, [inView, n, total, reduce])

  const now = new Date(2026, 9, 31, 6, 0, 0)
  const ts = (i) => {
    const d = new Date(now.getTime() + i * 47000)
    return d.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  const tagLabel = (k) => (k === 'sign' && lang === 'en' ? 'Sign-off' : TAG[k])

  return (
    <div className="panel console" ref={ref}>
      <div className="cs-head">
        <span className="cs-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="cs-title">{c.title}</span>
        <span className="chip chip-live"><i />{c.live}</span>
      </div>
      <div className="cs-body" aria-live="off">
        <AnimatePresence initial={false}>
          {c.lines.slice(0, n).map(([k, txt, val], i) => (
            <motion.div key={`${cycle}-${i}`} className="cs-line"
              initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.45, ease }}>
              <span className="cs-ts">{ts(i)}</span>
              <span className={`cs-tag t-${k}`}>{tagLabel(k)}</span>
              <span className="cs-txt">{txt}</span>
              <span className="cs-val">{val}</span>
              <motion.span className="cs-ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 500, damping: 20 }}>
                <Icon name="check" size={12} stroke={3} />
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
        {n < total && <span className="cs-cursor" aria-hidden="true">▍</span>}
      </div>
      <div className="cs-foot">
        <span>{c.progress}</span>
        <span className="cs-track"><motion.span animate={{ scaleX: n / total }} transition={{ duration: 0.6, ease }} /></span>
        <b>{Math.round((n / total) * 100)} %</b>
      </div>
    </div>
  )
}

/* =========================================================
   Consulta SQL que se escribe sola (repositorio)
   ========================================================= */
export function TypedQuery({ start }) {
  const { t } = useLang()
  const q = t.query
  const [typed, done] = useTyped(q.sql, start, { speed: 22, step: 2, delay: 400 })
  // Resalta palabras clave sin perder el texto parcial
  const parts = typed.split(/(\s+)/).map((w, i) => (/^(select|from|where|and)$/i.test(w) ? <b key={i}>{w}</b> : /^'.*'?$/.test(w) ? <em key={i}>{w}</em> : <span key={i}>{w}</span>))
  return (
    <div className="tq">
      <span className="tq-prompt">sql&gt;</span>
      <code className="tq-code">{parts}{!done && <span className="caret" />}</code>
      <AnimatePresence>
        {done && (
          <motion.span className="tq-meta" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease }}>
            <Icon name="check" size={12} stroke={3} /> {q.meta}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =========================================================
   Cursor fantasma: hace la demo hasta que el visitante toca
   ========================================================= */
export function GhostCursor({ pos, click }) {
  if (!pos) return null
  return (
    <motion.span className="ghost" aria-hidden="true" initial={{ opacity: 0, x: pos.x, y: pos.y }}
      animate={{ opacity: 1, x: pos.x, y: pos.y }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20 }}>
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.5L10 19 5 3Z" fill="#F0FDF7" stroke="#03140D" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      <AnimatePresence>{click && <motion.i key={click} initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.6 }} />}</AnimatePresence>
    </motion.span>
  )
}

/* Guion para el cursor: lista de pasos [selector | fn, acción] que se repite */
export function useGhostScript(panelRef, active, steps, loopPause = 2200) {
  const [pos, setPos] = useState(null)
  const [click, setClick] = useState(0)
  useEffect(() => {
    if (!active) { setPos(null); return }
    let alive = true
    const wait = (ms) => new Promise((r) => setTimeout(r, ms))
    const at = (sel) => {
      const p = panelRef.current
      const el = p && p.querySelector(sel)
      if (!p || !el) return null
      const a = p.getBoundingClientRect(), b = el.getBoundingClientRect()
      return { x: b.left - a.left + Math.min(b.width * 0.35, 120), y: b.top - a.top + b.height * 0.55 }
    }
    ;(async () => {
      await wait(900)
      while (alive) {
        for (const [sel, act, pause = 1500] of steps) {
          if (!alive) return
          const p = at(sel)
          if (p) setPos(p)
          await wait(750)
          if (!alive) return
          setClick((x) => x + 1)
          act()
          await wait(pause)
        }
        await wait(loopPause)
      }
    })()
    return () => { alive = false }
  }, [active]) // eslint-disable-line
  return [pos, click]
}

/* =========================================================
   Con IA: el asistente que explica un descuadre
   ========================================================= */
export function AI() {
  const { t } = useLang()
  const c = t.ai
  const ch = c.chat
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.45 })
  const [q, qDone] = useTyped(ch.q, inView, { speed: 26, step: 1, delay: 300 })
  const [thinking, setThinking] = useState(false)
  const [startA, setStartA] = useState(false)
  useEffect(() => {
    if (!qDone || !inView) return
    setThinking(true)
    const id = setTimeout(() => { setThinking(false); setStartA(true) }, 1200)
    return () => clearTimeout(id)
  }, [qDone, inView])
  const [a, aDone] = useTyped(ch.a, startA, { speed: 14, step: 2 })

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

        <Reveal tilt className="panel chat" delay={0.1}>
          <div ref={ref}>
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
                        {ch.rows.map(([k, v], i) => (
                          <motion.div key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }}>
                            <dt>{k}</dt><dd>{v}</dd>
                          </motion.div>
                        ))}
                      </dl>
                      <div className="chat-actions">
                        <span className="chip chip-link"><Icon name="trace" size={13} /> {ch.link}</span>
                        <motion.span className="chip chip-cta" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 18 }}>{ch.action}</motion.span>
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
        </Reveal>
      </div>
    </section>
  )
}

/* =========================================================
   Raíl de capítulos: en qué herramienta estás (pantallas anchas)
   ========================================================= */
export function ChapterRail() {
  const { t } = useLang()
  const c = t.chapters
  const [state, setState] = useState({ show: false, active: -1, prog: [0, 0, 0, 0] })
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      const prog = c.items.map(({ from, to }) => {
        const a = document.getElementById(from), b = document.getElementById(to)
        if (!a || !b) return 0
        const top = a.getBoundingClientRect().top, bottom = b.getBoundingClientRect().bottom
        return Math.min(1, Math.max(0, (mid - top) / (bottom - top)))
      })
      const first = document.getElementById(c.items[0].from), last = document.getElementById(c.items[c.items.length - 1].to)
      const show = !!first && !!last && first.getBoundingClientRect().top < mid && last.getBoundingClientRect().bottom > mid
      let active = -1
      prog.forEach((p, i) => { if (p > 0 && p < 1) active = i })
      setState({ show, active, prog })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [c])
  const go = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' })
  }
  return (
    <AnimatePresence>
      {state.show && (
        <motion.nav className="rail" aria-label={c.title}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.4, ease }}>
          <p className="rail-t">{c.title}</p>
          <ol>
            {c.items.map((x, i) => (
              <li key={x.n} className={`${i === state.active ? 'is-on' : ''} ${state.prog[i] >= 1 ? 'is-done' : ''}`}>
                <a href={`#${x.from}`} onClick={go(x.from)}>
                  <span className="rail-n">{x.n}</span>
                  <span className="rail-l">{x.label}</span>
                </a>
                <span className="rail-bar"><span style={{ transform: `scaleY(${state.prog[i]})` }} /></span>
              </li>
            ))}
          </ol>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
