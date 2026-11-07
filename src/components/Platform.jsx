import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Icon, SectionHead, useCountUp } from './ui.jsx'
import { Cube } from './Logo.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'
import { useMedia } from './Hero.jsx'

/*
  La plataforma: cuatro herramientas sobre los mismos datos.
  A la izquierda las herramientas (van pasando solas hasta que la persona pulsa una);
  a la derecha una ventana de producto inventada que cambia de pantalla con cada herramienta.
*/
const ease = [0.16, 1, 0.3, 1]
const TOOL_ICON = { dw: 'db', conso: 'layers', plan: 'chart', report: 'eye' }
const TOOL_ANCHOR = { dw: 'data-warehouse', conso: 'consolidacion', plan: 'planificacion', report: 'reporting' }
const ROTATE_MS = 6500

/* ---------- Pantalla: Data Warehouse ---------- */
const CO = ['HOLD', 'IBE', 'UK', 'MEX', 'RET', 'INC']
const M = [
  [0, 1, 1, 2, 1, 0], [1, 0, 2, 1, 0, 1], [1, 2, 0, 0, 1, 1],
  [2, 1, 0, 0, 0, 1], [1, 0, 1, 0, 0, 0], [0, 1, 1, 1, 0, 0],
]

function Ring({ value = 7, total = 8 }) {
  const v = useCountUp(value, { start: true, duration: 1400, delay: 200 })
  const r = 46, c = 2 * Math.PI * r
  return (
    <div className="sc-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <motion.circle cx="60" cy="60" r={r} className="ring-fg" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / total) }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }} transform="rotate(-90 60 60)" />
      </svg>
      <span className="ring-num">{v}<small>/{total}</small></span>
    </div>
  )
}

function DwScreen({ s }) {
  return (
    <div className="sc-grid">
      <div className="sc-card sc-ready">
        <p className="sc-t">{s.ready.title}</p>
        <div className="sc-ready-body"><Ring /><span className="sc-ready-u">{s.ready.unit}</span></div>
        <ul className="sc-list">
          {s.ready.rows.map(([n, st, note], i) => (
            <motion.li key={n} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1, duration: 0.45, ease }}>
              <span className={`dot ${st}`} /><span>{n}</span>
              {note ? <em>{note}</em> : <Icon name="check" size={13} stroke={2.6} />}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="sc-card sc-ic">
        <p className="sc-t">{s.ic.title} <span>{s.ic.sub}</span></p>
        <div className="sc-matrix" style={{ '--n': CO.length }}>
          <span />
          {CO.map((k) => <span key={k} className="mx-h">{k}</span>)}
          {CO.map((row, i) => [
            <span key={`r${i}`} className="mx-h mx-r">{row}</span>,
            ...M[i].map((v, j) => (
              <motion.span key={`${i}-${j}`} className={`mx-c v${v} ${i === j ? 'diag' : ''}`}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i + j) * 0.04, duration: 0.4, ease }} />
            )),
          ])}
        </div>
        <div className="sc-legend"><span><i className="v1" />{s.ic.legend[0]}</span><span><i className="v2" />{s.ic.legend[1]}</span></div>
      </div>
      <div className="sc-card sc-tb">
        <p className="sc-t">{s.tb.title} <span>{s.tb.sub}</span></p>
        <div className="sc-bars">
          {[['IBE', 0.92], ['UK', 0.74], ['MEX', 0.58], ['RET', 0.41], ['INC', 0.33]].map(([k, w], i) => (
            <div className="sc-bar" key={k}>
              <span className="sc-bar-k">{k}</span>
              <span className="sc-bar-track">
                <motion.span className="sc-bar-d" style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: w }} transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease }} />
                <motion.span className="sc-bar-h" style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: w }} transition={{ duration: 0.9, delay: 0.4 + i * 0.07, ease }} />
              </span>
              <motion.span className="sc-bar-ok" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.07, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}>
                {s.tb.diff} 0,00
              </motion.span>
            </div>
          ))}
        </div>
      </div>
      <div className="sc-card sc-loads">
        <p className="sc-t">{s.loads.title} <span>{s.loads.sub}</span></p>
        <span className="sc-big">{s.loads.value}</span>
        <Spark />
      </div>
    </div>
  )
}

function Spark() {
  const pts = [8, 12, 10, 18, 16, 24, 22, 30, 28, 34, 31, 40, 44, 41, 50, 48, 56, 62, 58, 66, 70, 68, 76, 82]
  const W = 480, H = 100, step = W / (pts.length - 1)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(H - (p / 90) * H).toFixed(1)}`).join(' ')
  return (
    <svg className="sc-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="pf-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6EE7B7" stopOpacity=".35" /><stop offset="1" stopColor="#6EE7B7" stopOpacity="0" /></linearGradient></defs>
      <motion.path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#pf-a)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
      <motion.path d={line} fill="none" stroke="#6EE7B7" strokeWidth="2.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, delay: 0.2, ease: 'easeInOut' }} />
    </svg>
  )
}

/* ---------- Pantalla: Consolidación ---------- */
function ConsoScreen({ s }) {
  const c = s.conso
  return (
    <div className="pf-conso">
      <div className="pf-tags">
        {c.tags.map((t, i) => <motion.span key={t} className="chip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>{t}</motion.span>)}
        <span className="chip chip-ok"><Icon name="check" size={12} stroke={2.6} /> {c.signed}</span>
      </div>
      <div className="pf-table">
        <div className="pf-tr pf-th"><span /><span>{c.cols[0]}</span><span>{c.cols[1]}</span><span>{c.cols[2]}</span></div>
        {c.rows.map((r, i) => (
          <motion.div key={r[0]} className={`pf-tr ${i === c.rows.length - 1 ? 'is-total' : ''}`}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.45, ease }}>
            <span>{r[0]}</span>
            <span>{r[1]}</span>
            <motion.span className="pf-elim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.12 }}>{r[2]}</motion.span>
            <motion.b initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + i * 0.12 }}>{r[3]}</motion.b>
          </motion.div>
        ))}
        <p className="pf-unit">{c.unit}</p>
      </div>
    </div>
  )
}

/* ---------- Pantalla: Planificación ---------- */
function PlanScreen({ s }) {
  const p = s.plan
  const W = 520, H = 170
  const actual = [40, 44, 47, 45, 52, 55, 51, 49, 58, 61, 63, 70]
  const budget = actual.map((v, i) => v * 1.09 + i * 0.4)
  const fc = actual.map((v, i) => (i < 9 ? v : v * 1.06 + i * 0.6))
  const x = (i) => (i / 11) * W
  const y = (v) => H - ((v - 30) / 55) * H
  const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <div className="pf-plan">
      <div className="pf-kpis">
        {p.kpi.map(([k, v, d], i) => (
          <motion.div key={k} className="pf-kpi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <span>{k}</span><b>{v}</b><em>{d}</em>
          </motion.div>
        ))}
      </div>
      <div className="sc-card">
        <div className="pf-legend"><span><i className="l-a" />{p.actual}</span><span><i className="l-b" />{p.budget}</span><span><i className="l-f" />{p.forecast}</span></div>
        <svg viewBox={`0 0 ${W} ${H}`} className="pf-chart" preserveAspectRatio="none" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="pf-gl" />)}
          <motion.path d={path(budget)} className="pf-l-b" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
          <motion.path d={path(fc)} className="pf-l-f" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />
          <motion.path d={path(actual.slice(0, 10))} className="pf-l-a" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        </svg>
      </div>
    </div>
  )
}

/* ---------- Pantalla: Reporting ---------- */
function ReportScreen({ s }) {
  const r = s.report
  const bars = [52, 55, 58, 54, 60, 63, 59, 61, 66, 68, 70, 74]
  return (
    <div className="pf-report">
      <div className="pf-kpis">
        {r.kpis.map(([k, v, d], i) => (
          <motion.div key={k} className="pf-kpi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <span>{k}</span><b>{v}</b><em className="up">{d}</em>
          </motion.div>
        ))}
      </div>
      <div className="sc-card">
        <p className="sc-t">{r.chart}</p>
        <div className="pf-bars">
          {bars.map((b, i) => (
            <motion.span key={i} className={i === bars.length - 1 ? 'is-on' : ''} style={{ originY: 1 }}
              initial={{ scaleY: 0 }} animate={{ scaleY: b / 74 }} transition={{ duration: 0.7, delay: 0.15 + i * 0.04, ease }} />
          ))}
        </div>
        <p className="pf-drill"><Icon name="trace" size={13} /> {r.drill}</p>
      </div>
    </div>
  )
}

const SCREENS = { dw: DwScreen, conso: ConsoScreen, plan: PlanScreen, report: ReportScreen }

/* ---------- Núcleo: un solo modelo, cuatro herramientas ---------- */
export default function Platform() {
  const { t } = useLang()
  const c = t.platform
  const s = t.showcase
  const reduce = useReducedMotion()
  // en móvil la ventana entra sin inclinarse: en 3D se ensancha más que la pantalla
  const flat = useMedia('(max-width: 820px)')
  const [active, setActive] = useState('dw')
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)
  const section = useRef(null)
  const stage = useRef(null)
  const inView = useInView(stage, { amount: 0.35 })

  // rotación automática hasta que la persona elige
  useEffect(() => {
    if (touched || !inView || reduce) return
    let raf, last = performance.now(), p = 0
    const tick = (now) => {
      p += (now - last) / ROTATE_MS; last = now
      if (p >= 1) {
        p = 0
        setActive((a) => { const i = c.tools.findIndex((x) => x.key === a); return c.tools[(i + 1) % c.tools.length].key })
      }
      setProgress(p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [touched, inView, reduce, c.tools])

  const pick = (k) => { setTouched(true); setProgress(0); setActive(k) }

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const enter = useTransform(scrollYProgress, [0.05, 0.35], reduce || flat ? [0, 0] : [18, 0])
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 120, damping: 18 })
  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5)
  }

  const Screen = SCREENS[active]
  const tool = c.tools.find((x) => x.key === active)

  return (
    <section className="section platform" id="plataforma" ref={section}>
      <div className="wrap">
        <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
        <div className="pf-grid" ref={stage}>
          <div className="pf-side">
            <ul className="pf-tools" role="tablist" aria-label={c.kicker}>
              {c.tools.map((x) => {
                const on = x.key === active
                return (
                  <li key={x.key}>
                    <button role="tab" aria-selected={on} className={`pf-tool ${on ? 'is-on' : ''}`} onClick={() => pick(x.key)}>
                      {on && <motion.span layoutId="pf-tool-bg" className="pf-tool-bg" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                      <span className="pf-ico"><Icon name={TOOL_ICON[x.key]} size={18} /></span>
                      <span className="pf-txt">
                        <b>{x.name}</b>
                        <span>{x.text}</span>
                      </span>
                      {on && !touched && !reduce && <span className="pf-prog" style={{ transform: `scaleX(${progress})` }} />}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="pf-auto">
              <span className="pf-model"><Icon name="layers" size={14} /> {c.core}</span>
              {!touched && <span>{c.auto}</span>}
            </p>
          </div>

          <div className="pf-stage" onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0) }}>
            <motion.div className="sc-window panel pf-window" style={{ rotateX: enter }}>
              <motion.div className="pf-window-in" style={{ rotateX: rx, rotateY: ry }}>
                <aside className="sc-side" aria-hidden="true">
                  <Cube size={26} />
                  {c.tools.map((x) => (
                    <span key={x.key} className={`sc-side-i ${x.key === active ? 'is-on' : ''}`}><Icon name={TOOL_ICON[x.key]} size={16} /></span>
                  ))}
                </aside>
                <div className="sc-main">
                  <div className="sc-top">
                    <span className="sc-crumb">{s.app.group} <i>/</i> <b>{s.screens[active]}</b></span>
                    <span className="sc-search"><Icon name="eye" size={13} /> {s.app.search}</span>
                    <span className="chip">{s.app.period}</span>
                    <span className="chip chip-live"><i />Gold</span>
                  </div>
                  <div className="pf-screen">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div key={active} initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }} transition={{ duration: 0.4, ease }}>
                        <Screen s={s} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <a className="link-arrow pf-more" href={`#${TOOL_ANCHOR[active]}`} onClick={onAnchor}>
              {c.more}: {tool.name} <Icon name="arrow" size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
