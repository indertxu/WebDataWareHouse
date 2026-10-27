import { useRef } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Button, Icon, Reveal, SectionHead, useCountUp } from './ui.jsx'
import { Cube } from './Logo.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'

/*
  Vista de producto "de escaparate": un panel resumido, inventado y animado.
  No es una captura: enseña dos o tres ideas (cierre, intercompañía, rastro) y nada más.
*/
const ease = [0.16, 1, 0.3, 1]
const CO = ['HOLD', 'IBE', 'UK', 'MEX', 'RET', 'INC']
// 0 vacío · 1 cuadra · 2 revisar (simétrico)
const M = [
  [0, 1, 1, 2, 1, 0],
  [1, 0, 2, 1, 0, 1],
  [1, 2, 0, 0, 1, 1],
  [2, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
]

function Ring({ start, value = 6, total = 8 }) {
  const v = useCountUp(value, { start, duration: 1600, delay: 300 })
  const r = 46, c = 2 * Math.PI * r
  return (
    <div className="sc-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className="ring-bg" />
        <motion.circle cx="60" cy="60" r={r} className="ring-fg" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={start ? { strokeDashoffset: c * (1 - value / total) } : {}}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.25, 1, 0.5, 1] }} transform="rotate(-90 60 60)" />
      </svg>
      <span className="ring-num">{v}<small>/{total}</small></span>
    </div>
  )
}

function Bars({ start, diff }) {
  const rows = [['IBE', 0.92], ['UK', 0.74], ['MEX', 0.58], ['RET', 0.41], ['INC', 0.33]]
  return (
    <div className="sc-bars">
      {rows.map(([k, w], i) => (
        <div className="sc-bar" key={k}>
          <span className="sc-bar-k">{k}</span>
          <span className="sc-bar-track">
            <motion.span className="sc-bar-d" style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={start ? { scaleX: w } : {}} transition={{ duration: 1.1, delay: 0.5 + i * 0.08, ease }} />
            <motion.span className="sc-bar-h" style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={start ? { scaleX: w } : {}} transition={{ duration: 1.1, delay: 0.6 + i * 0.08, ease }} />
          </span>
          <motion.span className="sc-bar-ok" initial={{ opacity: 0, scale: 0.6 }} animate={start ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 1.3 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
            {diff} 0,00
          </motion.span>
        </div>
      ))}
    </div>
  )
}

function Area({ start }) {
  const pts = [8, 12, 10, 18, 16, 24, 22, 30, 28, 34, 31, 40, 44, 41, 50, 48, 56, 62, 58, 66, 70, 68, 76, 82]
  const W = 480, H = 110
  const step = W / (pts.length - 1)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(H - (p / 90) * H).toFixed(1)}`).join(' ')
  return (
    <svg className="sc-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sc-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6EE7B7" stopOpacity=".35" /><stop offset="1" stopColor="#6EE7B7" stopOpacity="0" /></linearGradient>
      </defs>
      <motion.path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#sc-a)" initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : {}} transition={{ delay: 1.2, duration: 0.8 }} />
      <motion.path d={line} fill="none" stroke="#6EE7B7" strokeWidth="2.5" vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }} animate={start ? { pathLength: 1 } : {}} transition={{ duration: 1.6, delay: 0.4, ease: 'easeInOut' }} />
    </svg>
  )
}

export default function Showcase() {
  const { t } = useLang()
  const c = t.showcase
  const reduce = useReducedMotion()
  const section = useRef(null)
  const stage = useRef(null)
  const inView = useInView(stage, { once: true, amount: 0.3 })

  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const enter = useTransform(scrollYProgress, [0.08, 0.42], reduce ? [0, 0] : [22, 0])
  const sc = useTransform(scrollYProgress, [0.08, 0.42], reduce ? [1, 1] : [0.9, 1])
  const yA = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [90, -90])
  const yB = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-40, 60])

  // inclinación suave con el ratón
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 })
  const onMove = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <section className="section showcase" id="producto" ref={section}>
      <div className="wrap">
        <div className="sc-head">
          <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} align="center" />
        </div>

        <div className="sc-stage" ref={stage} onMouseMove={onMove} onMouseLeave={onLeave}>
          <motion.div className="sc-tilt" style={{ rotateX: enter, scale: sc }}>
            <motion.div className="sc-window panel" style={{ rotateX: rx, rotateY: ry }}>
              <aside className="sc-side" aria-hidden="true">
                <Cube size={26} />
                {['db', 'layers', 'trace', 'shield', 'send'].map((ic, i) => (
                  <span key={ic} className={`sc-side-i ${i === 0 ? 'is-on' : ''}`}><Icon name={ic === 'layers' ? 'history' : ic} size={16} /></span>
                ))}
              </aside>
              <div className="sc-main">
                <div className="sc-top">
                  <span className="sc-crumb">{c.app.group} <i>/</i> <b>{c.app.screen}</b></span>
                  <span className="sc-search"><Icon name="eye" size={13} /> {c.app.search}</span>
                  <span className="chip">{c.app.period}</span>
                  <span className="chip chip-live"><i />Gold</span>
                </div>
                <div className="sc-grid">
                  <div className="sc-card sc-ready">
                    <p className="sc-t">{c.ready.title}</p>
                    <div className="sc-ready-body">
                      <Ring start={inView} />
                      <span className="sc-ready-u">{c.ready.unit}</span>
                    </div>
                    <ul className="sc-list">
                      {c.ready.rows.map(([n, st, note], i) => (
                        <motion.li key={n} initial={{ opacity: 0, x: -8 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.9 + i * 0.12, duration: 0.5, ease }}>
                          <span className={`dot ${st}`} />
                          <span>{n}</span>
                          {note ? <em>{note}</em> : <Icon name="check" size={13} stroke={2.6} />}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="sc-card sc-ic">
                    <p className="sc-t">{c.ic.title} <span>{c.ic.sub}</span></p>
                    <div className="sc-matrix" style={{ '--n': CO.length }}>
                      <span />
                      {CO.map((k) => <span key={k} className="mx-h">{k}</span>)}
                      {CO.map((row, i) => [
                        <span key={`r${i}`} className="mx-h mx-r">{row}</span>,
                        ...M[i].map((v, j) => (
                          <motion.span key={`${i}-${j}`} className={`mx-c v${v} ${i === j ? 'diag' : ''}`}
                            initial={{ opacity: 0, scale: 0.5 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.4 + (i + j) * 0.05, duration: 0.45, ease }} />
                        )),
                      ])}
                    </div>
                    <div className="sc-legend"><span><i className="v1" />{c.ic.legend[0]}</span><span><i className="v2" />{c.ic.legend[1]}</span></div>
                  </div>

                  <div className="sc-card sc-tb">
                    <p className="sc-t">{c.tb.title} <span>{c.tb.sub}</span></p>
                    <Bars start={inView} diff={c.tb.diff} />
                  </div>

                  <div className="sc-card sc-loads">
                    <p className="sc-t">{c.loads.title} <span>{c.loads.sub}</span></p>
                    <span className="sc-big">{c.loads.value}</span>
                    <Area start={inView} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* tarjetas flotantes */}
          <motion.div className="sc-float sc-trace" style={{ y: yA }}>
            <p className="sc-ft">{c.trace.title}</p>
            <ol>
              {c.trace.steps.map((s, i) => (
                <motion.li key={s} initial={{ opacity: 0.25 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.4 + i * 0.35, duration: 0.4 }}>
                  <span className="tr-dot" />
                  <span className="tr-s">{s}</span>
                  <b>{c.trace.amounts[i]}</b>
                </motion.li>
              ))}
            </ol>
          </motion.div>
          <motion.div className="sc-float sc-toast" style={{ y: yB }}
            initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 2.4, duration: 0.7, ease }}>
            <span className="toast-ico"><Icon name="send" size={15} /></span>
            <span><b>{c.toast.title}</b><small>{c.toast.sub}</small></span>
          </motion.div>
        </div>

        <div className="sc-captions">
          {c.captions.map((x, i) => (
            <Reveal key={x.title} delay={i * 0.08} className="sc-cap">
              <b>{x.title}</b>
              <span>{x.text}</span>
            </Reveal>
          ))}
        </div>
        <Reveal className="sc-cta" delay={0.1}>
          <Button href="#demo" onClick={onAnchor} arrow>{c.cta}</Button>
        </Reveal>
      </div>
    </section>
  )
}
