import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Icon, Reveal, SectionHead } from './ui.jsx'
import { Cube } from './Logo.jsx'
import { useLang } from '../i18n.jsx'

const ease = [0.16, 1, 0.3, 1]
const W = 600, H = 540, CX = 300, CY = 270, RX = 236, RY = 214

/* Mapa de conectores: ERPs alrededor, Next Data en el centro. */
function Hub({ items, liveLabel, nextLabel }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()
  const pos = items.map((_, i) => {
    const a = -Math.PI / 2 + (i / items.length) * Math.PI * 2 + 0.16
    return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) }
  })
  return (
    <div className="hub" ref={ref}>
      <svg className="hub-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <radialGradient id="hub-g"><stop offset="0" stopColor="#34D399" stopOpacity=".35" /><stop offset="1" stopColor="#34D399" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r="150" fill="url(#hub-g)" />
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} className="hub-orbit" />
        <ellipse cx={CX} cy={CY} rx={RX * 0.55} ry={RY * 0.55} className="hub-orbit" />
        {pos.map((p, i) => {
          const d = `M${p.x.toFixed(1)},${p.y.toFixed(1)} L${CX},${CY}`
          const live = items[i].live
          return (
            <g key={i}>
              <motion.path d={d} className={`hub-line ${live ? 'is-live' : ''}`}
                initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: 'easeInOut' }} />
              {live && inView && !reduce && [0, 1].map((k) => (
                <circle key={k} r="3" className="hub-dot" opacity="0">
                  <animateMotion dur="2.2s" begin={`${1.2 + i * 0.3 + k * 1.1}s`} repeatCount="indefinite" path={d} />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="2.2s" begin={`${1.2 + i * 0.3 + k * 1.1}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
          )
        })}
      </svg>
      <motion.div className="hub-core" initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}>
        <Cube size={44} />
        <b>Next Data</b>
        <span className="hub-layers"><i className="m-bronze" /><i className="m-silver" /><i className="m-gold" /></span>
      </motion.div>
      {items.map((it, i) => (
        <motion.span key={it.name} className={`hub-tile ${it.live ? 'is-live' : ''}`}
          style={{ left: `${(pos[i].x / W) * 100}%`, top: `${(pos[i].y / H) * 100}%` }}
          initial={{ opacity: 0, scale: 0.7 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.15 + i * 0.06, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}>
          {it.live && <i className="dot-live" />}{it.name}
        </motion.span>
      ))}
      <div className="hub-legend">
        <span><i className="dot-live" /> {liveLabel}</span>
        <span><i className="hub-dash" /> {nextLabel}</span>
      </div>
    </div>
  )
}

export default function Connect() {
  const { t } = useLang()
  const c = t.connect
  return (
    <section className="section connect" id="conecta">
      <div className="wrap connect-grid">
        <div>
          <SectionHead kicker={c.kicker} title={c.title} sub={c.sub} />
          <ol className="steps3">
            {c.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={0.1 + i * 0.09}>
                <span className="s3-num">{i + 1}</span>
                <span><b>{s.title}</b><span>{s.text}</span></span>
              </Reveal>
            ))}
          </ol>
        </div>
        <Hub items={c.hub} liveLabel={c.liveLabel} nextLabel={c.nextLabel} />
      </div>

      <div className="wrap datatypes">
        <div className="dt-grid">
          {[c.finance, c.ops].map((g, gi) => (
            <Reveal key={g.label} className="dt-col" delay={0.08 * gi}>
              <span className="dt-label"><Icon name={gi ? 'sparkles' : 'db'} size={15} /> {g.label}</span>
              <ul>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
