import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Icon, Reveal, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'
import { useMedia } from './Hero.jsx'
import { getLenis } from '../scroll.js'

const ease = [0.16, 1, 0.3, 1]
const METAL = {
  bronze: { top: '#E7B48C', side: '#B9784A', dark: '#8E5A35', line: '#9A6240' },
  silver: { top: '#E3ECE8', side: '#AEBDB7', dark: '#86958F', line: '#7E8F88' },
  gold: { top: '#F3D682', side: '#CFA43A', dark: '#A27E25', line: '#9C7A22' },
}

/* Placa isométrica: cara superior + dos laterales, con "filas" dibujadas encima */
function Plate({ cx, cy, a = 150, b = 75, t = 16, kind, active, label, idx }) {
  const m = METAL[kind]
  const T = [cx, cy - b], R = [cx + a, cy], B = [cx, cy + b], Lf = [cx - a, cy]
  const pts = (arr) => arr.map((p) => p.join(',')).join(' ')
  const rows = [0.18, 0.32, 0.46, 0.6, 0.74, 0.88].map((k, i) => {
    const s = [Lf[0] + k * (B[0] - Lf[0]), Lf[1] + k * (B[1] - Lf[1])]
    const e = [T[0] + k * (R[0] - T[0]), T[1] + k * (R[1] - T[1])]
    if (kind === 'bronze') {
      // filas desordenadas: tramos de largo distinto
      const f = [0.55, 0.85, 0.4, 0.7, 0.95, 0.5][i]
      return { s, e: [s[0] + (e[0] - s[0]) * f, s[1] + (e[1] - s[1]) * f], hi: false }
    }
    return { s, e, hi: kind === 'gold' && (i === 1 || i === 4) }
  })
  return (
    <motion.g animate={{ y: active ? -16 : 0, opacity: active ? 1 : 0.38 }} transition={{ duration: 0.6, ease }}>
      {active && <ellipse cx={cx} cy={cy + b + 26} rx={a * 0.9} ry={b * 0.5} fill={m.side} opacity=".18" filter="url(#ly-blur)" />}
      <polygon points={pts([Lf, B, [B[0], B[1] + t], [Lf[0], Lf[1] + t]])} fill={m.side} />
      <polygon points={pts([B, R, [R[0], R[1] + t], [B[0], B[1] + t]])} fill={m.dark} />
      <polygon points={pts([T, R, B, Lf])} fill={m.top} />
      {rows.map((r, i) => (
        <line key={i} x1={r.s[0]} y1={r.s[1]} x2={r.e[0]} y2={r.e[1]}
          stroke={r.hi ? '#047857' : m.line} strokeWidth={r.hi ? 3 : 2} strokeLinecap="round"
          strokeDasharray={kind === 'bronze' ? '7 5' : undefined} opacity={r.hi ? 0.95 : 0.55} />
      ))}
      <text x={cx + a + 18} y={cy + 6} className="ly-label" fill="currentColor">{label}</text>
      <text x={cx + a + 18} y={cy + 24} className="ly-idx">{idx}</text>
    </motion.g>
  )
}

function Stack({ active, steps }) {
  const cys = [270, 180, 90] // bronze abajo, gold arriba
  return (
    <svg className="ly-stack" viewBox="0 0 470 380" aria-hidden="true">
      <defs><filter id="ly-blur"><feGaussianBlur stdDeviation="10" /></filter></defs>
      {[0, 1, 2].map((i) => (
        <Plate key={i} cx={200} cy={cys[i]} kind={steps[i].key} active={active === i}
          label={steps[i].name} idx={`0${i + 1}`} />
      ))}
      {/* datos subiendo de capa en capa */}
      <g className="ly-rise">
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx={140 + (i % 4) * 40} cy={272 - (i % 2) * 6} r="2.6" style={{ animationDelay: `${i * 0.41}s` }} />
        ))}
      </g>
    </svg>
  )
}

function Record({ step, title }) {
  return (
    <div className="panel record">
      <div className="record-head">
        <span className={`metal-dot m-${step.key}`} />
        <span className="record-title">{title}</span>
        <span className="chip">{step.name}</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.dl key={step.key} className="record-rows"
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }} transition={{ duration: 0.45, ease }}>
          {step.record.map(([k, v, hi], i) => (
            <motion.div key={k} className={`rr ${hi ? 'is-hi' : ''}`}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.045, duration: 0.4 }}>
              <dt>{k}</dt><dd>{v}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </AnimatePresence>
      <div className={`record-foot m-${step.key}`}>
        <Icon name="check" size={14} stroke={2.6} /> {step.foot}
      </div>
    </div>
  )
}

export default function Layers() {
  const { t } = useLang()
  const c = t.layers
  const desktop = useMedia('(min-width: 1000px)')
  const reduce = useReducedMotion()
  const outer = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] })
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1])
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.max(0, Math.min(2, Math.floor(v * 3))))
  })

  const goTo = (i) => {
    const el = outer.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    const y = top + span * ((i + 0.5) / 3)
    const l = getLenis()
    if (l) l.scrollTo(y, { duration: 1.1 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (!desktop || reduce) {
    return (
      <section className="section layers layers-flat" id="como-funciona">
        <div className="wrap">
          <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
          <div className="lf-list">
            {c.steps.map((s, i) => (
              <Reveal key={s.key} className="lf-item">
                <div className="lf-text">
                  <span className={`metal-chip m-${s.key}`}>0{i + 1} · {s.name}</span>
                  <h3 className="h3">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <Record step={s} title={c.recordTitle} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="layers" id="como-funciona" ref={outer}>
      <div className="layers-sticky">
        <div className="wrap layers-grid">
          <div className="layers-left">
            <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
            <ol className="ly-steps">
              <span className="ly-track" aria-hidden="true"><motion.span style={{ scaleY: bar }} /></span>
              {c.steps.map((s, i) => (
                <li key={s.key} className={active === i ? 'is-active' : ''}>
                  <button onClick={() => goTo(i)}>
                    <span className={`ly-num m-${s.key}`}>0{i + 1}</span>
                    <span className="ly-body">
                      <span className="ly-name">{s.name} <em>{s.title}</em></span>
                      <span className="ly-text">{s.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="layers-right">
            <Stack active={active} steps={c.steps} />
            <Record step={c.steps[active]} title={c.recordTitle} />
          </div>
        </div>
      </div>
    </section>
  )
}
