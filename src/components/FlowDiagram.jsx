import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useCountUp, fmt } from './ui.jsx'

/*
  El diagrama vivo del hero: ERPs → Bronze → Silver → Gold → destinos.
  Dos composiciones con las mismas piezas: horizontal (escritorio) y vertical (móvil).
  Secuencia de entrada (s): fuentes 0.2 → enlaces 0.7 → bronze 1.1 → silver 2.3 → gold 3.6 → destinos 4.9 → partículas 5.4
*/

const ease = [0.16, 1, 0.3, 1]
const METAL = { bronze: '#D89A6A', silver: '#C9D6D1', gold: '#E9C25A' }

const LAYOUTS = {
  h: {
    w: 1400, h: 520,
    sources: [0, 1, 2, 3].map((i) => ({ x: 24, y: 78 + i * 80, w: 224, h: 64 })),
    layers: [326, 616, 906].map((x) => ({ x, y: 40, w: 236, h: 380 })),
    outputs: [0, 1, 2].map((i) => ({ x: 1200, y: 88 + i * 100, w: 176, h: 84 })),
    tray: { x: 644, y: 456, w: 180, h: 44 },
    card: 'tall',
  },
  v: {
    w: 400, h: 1060,
    sources: [[16, 16], [208, 16], [16, 88], [208, 88]].map(([x, y]) => ({ x, y, w: 176, h: 60 })),
    layers: [196, 452, 708].map((y) => ({ x: 24, y, w: 352, h: 196 })),
    outputs: [16, 143, 270].map((x) => ({ x, y: 964, w: 114, h: 80 })),
    tray: null,
    card: 'wide',
  },
}

function srcPath(L, i, s) {
  const b = L.layers[0]
  if (L.card === 'tall') {
    const x1 = s.x + s.w, y1 = s.y + s.h / 2
    const x2 = b.x, y2 = b.y + 130 + i * 40
    const mx = (x1 + x2) / 2
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
  }
  const x1 = s.x + s.w / 2, y1 = s.y + s.h
  const x2 = b.x + b.w / 2 - 60 + i * 40, y2 = b.y
  const my = (y1 + y2) / 2 + 10
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
}

function linkPath(L, i) {
  const a = L.layers[i], b = L.layers[i + 1]
  if (L.card === 'tall') return `M${a.x + a.w},${a.y + a.h / 2} L${b.x},${b.y + b.h / 2}`
  return `M${a.x + a.w / 2},${a.y + a.h} L${b.x + b.w / 2},${b.y}`
}

function outPath(L, i, o) {
  const g = L.layers[2]
  if (L.card === 'tall') {
    const x1 = g.x + g.w, y1 = g.y + g.h / 2
    const x2 = o.x, y2 = o.y + o.h / 2
    const mx = (x1 + x2) / 2
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
  }
  const x1 = g.x + g.w / 2, y1 = g.y + g.h
  const x2 = o.x + o.w / 2, y2 = o.y
  const my = (y1 + y2) / 2
  return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
}

function Cylinder({ x, y, color, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0,5 v16 a12,4.5 0 0 0 24,0 v-16" fill={color} opacity=".55" />
      <path d="M0,13 a12,4.5 0 0 0 24,0" fill="none" stroke={color} strokeWidth="1.4" />
      <ellipse cx="12" cy="5" rx="12" ry="4.5" fill={color} />
    </g>
  )
}

function Check({ x, y, on, delay }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="9" className="fd-check-bg" />
      <motion.circle r="9" fill="#34D399" initial={{ scale: 0, opacity: 0 }}
        animate={on ? { scale: 1, opacity: 1 } : {}} transition={{ delay, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }} />
      <motion.path d="M-4,0.5 L-1.2,3.2 L4.2,-2.6" fill="none" stroke="#03140D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={on ? { pathLength: 1 } : {}} transition={{ delay: delay + 0.15, duration: 0.35 }} />
    </g>
  )
}

function LayerCard({ box, layer, mode, start, delay, lang }) {
  const color = METAL[layer.key]
  const count = useCountUp(layer.count, { start, delay: (delay + 0.15) * 1000, duration: 1500 })
  const tall = mode === 'tall'
  const { x, y, w, h } = box
  return (
    <motion.g initial={{ opacity: 0, y: 14 }} animate={start ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease }}>
      <g transform={`translate(${x},${y})`}>
        <rect width={w} height={h} rx="16" className="fd-card" />
        <rect width={w} height="4" rx="2" fill={color} opacity=".85" />
        <Cylinder x={20} y={20} color={color} />
        <text x="56" y="31" className="fd-layer" fill={color}>{layer.name.toUpperCase()}</text>
        <text x="56" y="49" className="fd-sub">{layer.sub}</text>
        {tall ? (
          <>
            <text x="20" y="114" className="fd-count">{fmt(count, lang)}</text>
            <text x="20" y="136" className="fd-unit">{layer.unit}</text>
            <line x1="20" x2={w - 20} y1="160" y2="160" className="fd-div" />
            {layer.checks.map((c, i) => (
              <g key={c}>
                <Check x={30} y={192 + i * 38} on={start} delay={delay + 0.5 + i * 0.22} />
                <text x="48" y={196 + i * 38} className="fd-check">{c}</text>
              </g>
            ))}
            {layer.aside && (
              <motion.g initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : {}} transition={{ delay: delay + 1.2 }}>
                <circle cx="24" cy="320" r="3.5" fill="#FBBF24" />
                <text x="34" y="324" className="fd-aside">{layer.aside}</text>
              </motion.g>
            )}
            <rect x="20" y={h - 26} width={w - 40} height="5" rx="2.5" className="fd-bar-bg" />
            <motion.rect x="20" y={h - 26} width={w - 40} height="5" rx="2.5" fill={color}
              style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={start ? { scaleX: 1 } : {}}
              transition={{ delay: delay + 0.15, duration: 1.5, ease: [0.25, 1, 0.5, 1] }} />
          </>
        ) : (
          <>
            <text x={w - 20} y="40" textAnchor="end" className="fd-count fd-count-sm">{fmt(count, lang)}</text>
            <text x={w - 20} y="58" textAnchor="end" className="fd-unit">{layer.unit}</text>
            <line x1="20" x2={w - 20} y1="76" y2="76" className="fd-div" />
            {layer.checks.map((c, i) => (
              <g key={c}>
                <Check x={30} y={100 + i * 28} on={start} delay={delay + 0.5 + i * 0.22} />
                <text x="48" y={104 + i * 28} className="fd-check">{c}</text>
              </g>
            ))}
            {layer.aside && (
              <motion.text x={w - 20} y="184" textAnchor="end" className="fd-aside"
                initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : {}} transition={{ delay: delay + 1.2 }}>
                {layer.aside}
              </motion.text>
            )}
          </>
        )}
      </g>
    </motion.g>
  )
}

function Particles({ d, n = 3, dur = 2.6, color = '#6EE7B7', r = 2.6, offset = 0 }) {
  return Array.from({ length: n }).map((_, i) => (
    <circle key={i} r={r} fill={color} className="fd-particle" opacity="0">
      <animateMotion dur={`${dur}s`} begin={`${offset + (i * dur) / n}s`} repeatCount="indefinite" path={d} />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur={`${dur}s`} begin={`${offset + (i * dur) / n}s`} repeatCount="indefinite" />
    </circle>
  ))
}

export default function FlowDiagram({ start, mode = 'h', p, lang }) {
  const L = LAYOUTS[mode]
  const reduce = useReducedMotion()
  const [live, setLive] = useState(false)
  useEffect(() => {
    if (!start || reduce) return
    const id = setTimeout(() => setLive(true), 5400)
    return () => clearTimeout(id)
  }, [start, reduce])

  const srcD = L.sources.map((s, i) => srcPath(L, i, s))
  const linkD = [0, 1].map((i) => linkPath(L, i))
  const outD = L.outputs.map((o, i) => outPath(L, i, o))
  const tray = L.tray
  const trayD = tray ? `M${L.layers[1].x + L.layers[1].w / 2},${L.layers[1].y + L.layers[1].h} L${tray.x + tray.w / 2},${tray.y}` : null
  const draw = (delay, dur = 0.8) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: start ? { pathLength: 1, opacity: 1 } : {},
    transition: { delay, duration: dur, ease: 'easeInOut' },
  })

  return (
    <svg className={`fd fd-${mode}`} viewBox={`0 0 ${L.w} ${L.h}`} role="img"
      aria-label={`${p.sources.map((s) => s.name).join(', ')} → Bronze → Silver → Gold → ${p.outputs.map((o) => o.name).join(', ')}`}>
      <defs>
        <filter id="fd-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* enlaces */}
      {srcD.map((d, i) => (
        <motion.path key={d} d={d} className={`fd-link ${p.sources[i].ghost ? 'is-ghost' : ''}`} {...draw(0.6 + i * 0.1)} />
      ))}
      {linkD.map((d, i) => <motion.path key={d} d={d} className="fd-link fd-link-strong" {...draw(i === 0 ? 2.1 : 3.4, 0.5)} />)}
      {outD.map((d, i) => <motion.path key={d} d={d} className="fd-link" {...draw(4.7 + i * 0.1)} />)}
      {trayD && <motion.path d={trayD} className="fd-link fd-link-warn" {...draw(3.2, 0.4)} />}

      {/* partículas: los apuntes viajando */}
      {live && (
        <g filter="url(#fd-glow)">
          {srcD.slice(0, 3).map((d, i) => <Particles key={d} d={d} n={3} dur={2.4 + i * 0.3} color={METAL.bronze} offset={i * 0.4} />)}
          {linkD.map((d, i) => <Particles key={d} d={d} n={2} dur={1.2} color={i === 0 ? METAL.silver : METAL.gold} offset={i * 0.3} />)}
          {outD.map((d, i) => <Particles key={d} d={d} n={2} dur={2.2} color="#6EE7B7" offset={i * 0.5} />)}
          {trayD && <Particles d={trayD} n={1} dur={3.2} color="#FBBF24" r={2.2} offset={1} />}
        </g>
      )}

      {/* fuentes */}
      {L.sources.map((s, i) => {
        const src = p.sources[i]
        return (
          <motion.g key={i} initial={{ opacity: 0, x: -12 }} animate={start ? { opacity: src.ghost ? 0.62 : 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.09, duration: 0.6, ease }}>
            <g transform={`translate(${s.x},${s.y})`}>
              <rect width={s.w} height={s.h} rx="12" className={`fd-node ${src.ghost ? 'is-ghost' : ''}`} />
              <g transform={`translate(14,${s.h / 2 - 9}) scale(.75)`} className="fd-ico">
                <ellipse cx="12" cy="5" rx="8" ry="3" fill="none" />
                <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" fill="none" />
              </g>
              <text x="40" y={s.h / 2 - 2} className="fd-name">{src.name}</text>
              <text x="40" y={s.h / 2 + 14} className="fd-mono">{src.sub}</text>
              {!src.ghost && (
                <circle cx={s.w - 14} cy={s.h / 2} r="3.5" fill="#34D399" className={live ? 'fd-pulse' : ''} />
              )}
            </g>
          </motion.g>
        )
      })}

      {/* capas */}
      {L.layers.map((box, i) => (
        <LayerCard key={i} box={box} layer={p.layers[i]} mode={L.card} start={start} delay={[1.1, 2.3, 3.6][i]} lang={lang} />
      ))}

      {/* bandeja de apartadas */}
      {tray && (
        <motion.g initial={{ opacity: 0 }} animate={start ? { opacity: 1 } : {}} transition={{ delay: 3.4, duration: 0.6 }}>
          <g transform={`translate(${tray.x},${tray.y})`}>
            <rect width={tray.w} height={tray.h} rx="10" className="fd-tray" />
            <text x={tray.w / 2} y={tray.h / 2 + 4} textAnchor="middle" className="fd-tray-t">{p.tray}</text>
          </g>
        </motion.g>
      )}

      {/* destinos */}
      {L.outputs.map((o, i) => {
        const out = p.outputs[i]
        const small = L.card === 'wide'
        return (
          <motion.g key={i} initial={{ opacity: 0, x: 12 }} animate={start ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 4.9 + i * 0.12, duration: 0.6, ease }}>
            <g transform={`translate(${o.x},${o.y})`}>
              <rect width={o.w} height={o.h} rx="14" className={`fd-node fd-out ${i === 0 ? 'is-main' : ''}`} />
              <text x={small ? 12 : 16} y={small ? 32 : 36} className={`fd-name ${small ? 'fd-name-sm' : ''}`}>{out.name}</text>
              <text x={small ? 12 : 16} y={small ? 52 : 58} className="fd-mono">{out.sub}</text>
              <Check x={o.w - (small ? 14 : 18)} y={small ? 14 : 18} on={start} delay={5.2 + i * 0.12} />
            </g>
          </motion.g>
        )
      })}
    </svg>
  )
}
