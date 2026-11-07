import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Button, Icon, Reveal, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'
import { REPORTING_URL } from '../config.js'
import { GhostCursor, TypedQuery, useGhostScript } from './Fx.jsx'

/* Repite fn cada ms mientras active sea true */
function useAuto(active, ms, fn) {
  useEffect(() => {
    if (!active) return
    const id = setInterval(fn, ms)
    return () => clearInterval(id)
  }, [active, ms]) // eslint-disable-line
}

const ease = [0.16, 1, 0.3, 1]
const spring = { type: 'spring', stiffness: 380, damping: 32 }

export function Soon({ children }) {
  const { t } = useLang()
  return <span className="soon">{children || t.soon}</span>
}

function Checks({ items, cols = 1 }) {
  return (
    <ul className={`tl-checks cols-${cols}`}>
      {items.map((x, i) => (
        <Reveal as="li" key={x} delay={0.04 * i}>
          <Icon name="check" size={15} stroke={2.6} /> <span>{x}</span>
        </Reveal>
      ))}
    </ul>
  )
}


/* =========================================================
   Repositorio: quién accede a qué
   ========================================================= */
export function Repository() {
  const { t } = useLang()
  const c = t.repo
  const [aud, setAud] = useState('you')
  const [touched, setTouched] = useState(false)
  const panel = useRef(null)
  const inView = useInView(panel, { amount: 0.4 })
  const seen = useInView(panel, { once: true, amount: 0.4 })
  const keys = c.audiences.map((x) => x.key)
  useAuto(inView && !touched, 3600, () => setAud((k) => keys[(keys.indexOf(k) + 1) % keys.length]))
  const a = c.audiences.find((x) => x.key === aud)
  return (
    <section className="section repo" id="repositorio">
      <div className="wrap">
        <SectionHead num="01" kicker={c.kicker} title={c.title} sub={c.sub} />
        <div className="repo-grid tool-body">
        <div>
          <p className="repo-who">{c.who}</p>
          <div className="repo-auds" role="radiogroup" aria-label={c.who}>
            {c.audiences.map((x) => {
              const on = x.key === aud
              return (
                <button key={x.key} role="radio" aria-checked={on} className={`repo-aud ${on ? 'is-on' : ''}`} onClick={() => { setTouched(true); setAud(x.key) }}>
                  {on && <motion.span layoutId="repo-aud-bg" className="repo-aud-bg" transition={spring} />}
                  <span className="repo-aud-ico"><Icon name={x.key === 'you' ? 'user' : x.key === 'team' ? 'users' : 'link'} size={17} /></span>
                  <span className="repo-aud-txt">
                    <b>{x.name} {x.soon && <Soon />}</b>
                    <span>{x.text}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Reveal tilt className="panel repo-panel" delay={0.1}>
          <div ref={panel}>
          <TypedQuery start={seen} />
          <div className="repo-head">
            <span className="repo-cat"><Icon name="db" size={15} /> {c.catalog}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={aud} className="chip chip-ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                <Icon name="link" size={12} /> {a.via}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="repo-table">
            <div className="repo-tr repo-th">{c.cols.map((h) => <span key={h}>{h}</span>)}</div>
            {c.tables.map(([name, desc, rows, who], i) => {
              const open = who.includes(aud)
              return (
                <motion.div key={name} className={`repo-tr ${open ? '' : 'is-locked'}`} layout
                  initial={{ opacity: 0, x: -12 }} animate={seen ? { opacity: open ? 1 : 0.42, x: 0 } : {}} transition={{ duration: 0.45, delay: seen ? i * 0.06 : 0 }}>
                  {open && <motion.span key={aud} className="repo-sweep" initial={{ x: '-100%' }} animate={{ x: '120%' }} transition={{ duration: 0.9, delay: i * 0.06, ease }} />}
                  <span className="repo-name">{open ? <Icon name="check" size={13} stroke={2.6} /> : <Icon name="lock" size={13} />} {name}</span>
                  <span className="repo-desc">{desc}</span>
                  <span className="repo-rows">{open ? rows : c.locked}</span>
                </motion.div>
              )
            })}
          </div>
          {a.soon && <p className="repo-soon"><Soon /> {a.via}</p>}
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   Consolidación: árbol del grupo + eliminaciones
   ========================================================= */
export function Consolidation() {
  const { t } = useLang()
  const c = t.conso
  const [sel, setSel] = useState('ibe')
  const [mode, setMode] = useState(0)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState(false)
  const box = useRef(null)
  const inView = useInView(box, { amount: 0.35 })
  const order = ['ibe', 'uk', 'mex', 'ret', 'hold']
  useAuto(inView && !touched && mode === 0, 4200, () => setSel((k) => order[(order.indexOf(k) + 1) % order.length]))
  const pick = (k) => { setTouched(true); setSel(k) }
  const co = c.companies.find((x) => x.key === sel)
  const children = c.companies.slice(1)
  const methodClass = (m) => (/global|full/i.test(m) ? 'm-full' : /propor/i.test(m) ? 'm-prop' : /equiv|equity/i.test(m) ? 'm-eq' : 'm-parent')

  return (
    <section className="section conso" id="consolidacion">
      <div className="wrap">
        <div className="tool-head">
          <SectionHead num="02" big kicker={c.kicker} title={c.title} sub={c.sub} />
          <div className="seg" role="tablist">
            {c.modes.map((m, i) => (
              <button key={m} role="tab" aria-selected={mode === i} className={`seg-btn ${mode === i ? 'is-on' : ''}`} onClick={() => { setMode(i); setStep(0) }}>
                {mode === i && <motion.span layoutId="conso-mode" className="seg-pill" transition={spring} />}
                <span>{m}</span>
              </button>
            ))}
          </div>
        </div>

        <Reveal tilt className="panel conso-panel" delay={0.05}>
          <div ref={box}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === 0 ? (
              <motion.div key="engine" className="conso-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="tree">
                  <button className={`tree-node is-root ${sel === 'hold' ? 'is-on' : ''}`} onClick={() => pick('hold')}>
                    <b>{c.companies[0].name}</b><span className="m-parent">{c.companies[0].method}</span>
                  </button>
                  <svg className="tree-lines" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
                    {children.map((_, i) => {
                      const x = 50 + i * 100
                      const d = `M200,0 C200,30 ${x},30 ${x},60`
                      return (
                        <g key={i}>
                          <path id={`tl-${i}`} d={d} className={`tree-l ${children[i].key === sel || sel === 'hold' ? 'is-on' : ''}`} vectorEffect="non-scaling-stroke" />
                          {[0, 1].map((k) => (
                            <circle key={k} r="2.6" className="tree-p">
                              <animateMotion dur={`${1.8 + i * 0.2}s`} begin={`${k * 0.9 + i * 0.3}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                                <mpath href={`#tl-${i}`} />
                              </animateMotion>
                            </circle>
                          ))}
                        </g>
                      )
                    })}
                  </svg>
                  <div className="tree-kids">
                    {children.map((x) => (
                      <button key={x.key} className={`tree-node ${x.key === sel ? 'is-on' : ''}`} onClick={() => pick(x.key)}>
                        <span className="tree-pct">{x.pct}</span>
                        <b>{x.name}</b>
                        <span className={methodClass(x.method)}>{x.method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="conso-detail">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={sel} initial={{ opacity: 0, x: 18, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -12, filter: 'blur(4px)' }} transition={{ duration: 0.4, ease }}>
                      <p className="cd-k">{co.name} · {co.pct}</p>
                      <h3 className="cd-m">{co.method}</h3>
                      <p className="cd-t">{co.text}</p>
                      {(sel === 'ibe' || sel === 'uk') && (
                        <div className="elim">
                          <p className="elim-t">{c.elim}</p>
                          {c.elimRows.map(([k, v], i) => (
                            <motion.div key={k} className="elim-row" initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0.45] }} transition={{ duration: 1.6, delay: 0.3 + i * 0.1, times: [0, 0.6, 1] }}>
                              <span>{k}</span>
                              <span className="elim-v">{v}<motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 1.1 + i * 0.1 }} /></span>
                            </motion.div>
                          ))}
                          <motion.p className="elim-done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>
                            <Icon name="check" size={14} stroke={2.6} /> {c.elimDone}
                          </motion.p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div key="kons" className="kons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <h3>{c.kons.title}</h3>
                <p>{c.kons.text}</p>
                <ol className="kons-steps">
                  {c.kons.steps.map((x, i) => (
                    <li key={x} className={i <= step ? 'is-on' : ''}>
                      <span className="ks-n">{i < step ? <Icon name="check" size={14} stroke={2.8} /> : i + 1}</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ol>
                <div className="kons-actions">
                  {step < c.kons.steps.length
                    ? <Button variant="lime" arrow onClick={() => setStep((s) => s + 1)}>{c.kons.steps[step]}</Button>
                    : <motion.p className="elim-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}><Icon name="send" size={14} /> Konsolidator · OK</motion.p>}
                  {step > 0 && <button className="kons-reset" onClick={() => setStep(0)}>↺</button>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          {mode === 0 && !touched && <div className="auto-bar" aria-hidden="true"><motion.span key={sel} initial={{ scaleX: 0 }} animate={{ scaleX: inView ? 1 : 0 }} transition={{ duration: 4.2, ease: 'linear' }} /></div>}
        </Reveal>
      </div>
    </section>
  )
}

/* =========================================================
   Planificación: escenarios y driver
   ========================================================= */
const ACT = [4.9, 5.1, 5.6, 5.4, 5.9, 6.2, 5.7, 5.3, 6.1, 6.4, 6.6, 7.4] // M € al mes (2026)
const SCEN = [
  { g: 0, m: 0.26 }, // presupuesto: usa el driver tal cual
  { g: -1.5, m: 0.255, curve: true },
  { g: 4, m: 0.28 },
  { g: -6, m: 0.22 },
]

// Gráfico de planificación con escala fija: la curva sube y baja con el driver sin que el eje salte.
const PW = 640, PH = 230, PADX = 6
const P_MAX = Math.max(...ACT) * 1.24 * 1.02 * 1.06
const P_MIN = Math.min(...ACT) * 0.94 * 0.976 * 0.86
const px = (i) => PADX + (i / 11) * (PW - PADX * 2)
const py = (v) => PH - ((v - P_MIN) / (P_MAX - P_MIN)) * PH
const planOf = (g, cv) => ACT.map((v, i) => v * (1 + g / 100) * (1 + cv * (i - 6) * 0.004))
const pLine = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
const pArea = (arr) => `${pLine(arr)} L${px(11)},${PH} L${px(0)},${PH} Z`
const P_SPRING = { stiffness: 170, damping: 26, mass: 0.6 }

function PlanDot({ i, g, cv }) {
  const cy = useTransform([g, cv], ([a, b]) => py(planOf(a, b)[i]))
  return <motion.circle r="3.5" className="plan-dot" cx={px(i)} cy={cy} />
}

export function Planning() {
  const { t, lang } = useLang()
  const c = t.plan
  const [sc, setSc] = useState(0)
  const [drv, setDrv] = useState(9)
  const [touched, setTouched] = useState(false)
  const reduce = useReducedMotion()
  const box = useRef(null)
  const seen = useInView(box, { once: true, amount: 0.45 })
  const inView = useInView(box, { amount: 0.3 })
  // Al entrar: el driver barre de 0 a 9 % y la curva crece en directo
  useEffect(() => {
    if (!seen || reduce) return
    setDrv(0)
    const ctl = animate(0, 9, { duration: 2, delay: 0.5, ease: [0.33, 1, 0.68, 1], onUpdate: (v) => setDrv(Math.round(v * 2) / 2) })
    return () => ctl.stop()
  }, [seen]) // eslint-disable-line
  useAuto(inView && seen && !touched, 3400, () => setSc((k) => (k + 1) % 4))
  // Valores con muelle: al mover el slider todo (cifras y curva) sigue al dedo sin saltos ni fundidos
  const g = useSpring(drv + SCEN[sc].g, P_SPRING)
  const cv = useSpring(SCEN[sc].curve ? 1 : 0, P_SPRING)
  const m = useSpring(SCEN[sc].m, P_SPRING)
  useEffect(() => { g.set(drv + SCEN[sc].g); cv.set(SCEN[sc].curve ? 1 : 0); m.set(SCEN[sc].m) }, [drv, sc]) // eslint-disable-line
  const nf = (n, d = 1) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
  const money = (n) => (lang === 'es' ? `${nf(n)} M €` : `€${nf(n)}M`)
  const base = ACT.reduce((a, b) => a + b, 0)
  const sum = useTransform([g, cv], ([a, b]) => planOf(a, b).reduce((x, y) => x + y, 0))
  const kpis = [
    useTransform(sum, (v) => money(v)),
    useTransform([sum, m], ([v, k]) => money(v * k)),
    useTransform(sum, (v) => `${v >= base ? '+' : ''}${nf(((v - base) / base) * 100)} %`),
  ]
  const lineD = useTransform([g, cv], ([a, b]) => pLine(planOf(a, b)))
  const areaD = useTransform([g, cv], ([a, b]) => pArea(planOf(a, b)))

  return (
    <section className="section plan" id="planificacion">
      <div className="wrap">
        <SectionHead num="03" big kicker={c.kicker} title={c.title} sub={c.sub} />
        <div className="plan-grid tool-body">
        <div className="tool-aside">
          <Checks items={c.features.slice(0, 3)} />
          <p className="plan-note"><Icon name="sparkles" size={14} /> {c.note}</p>
        </div>
        <Reveal tilt className="panel plan-panel" delay={0.1}>
          <div ref={box}>
          <div className="seg seg-dark plan-seg" role="tablist">
            {c.scenarios.map((s, i) => (
              <button key={s} role="tab" aria-selected={sc === i} className={`seg-btn ${sc === i ? 'is-on' : ''}`} onClick={() => { setTouched(true); setSc(i) }}>
                {sc === i && <motion.span layoutId="plan-sc" className="seg-pill is-after" transition={spring} />}
                <span>{s}</span>
              </button>
            ))}
          </div>
          <div className="plan-kpis">
            {c.kpis.map((k, i) => (
              <div key={k} className="plan-kpi">
                <span>{k}</span>
                <motion.b>{kpis[i]}</motion.b>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${PW} ${PH + 24}`} className="plan-chart" aria-hidden="true">
            <defs><linearGradient id="plan-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6EE7B7" stopOpacity=".32" /><stop offset="1" stopColor="#6EE7B7" stopOpacity="0" /></linearGradient></defs>
            {[0.25, 0.5, 0.75].map((k) => <line key={k} x1="0" x2={PW} y1={PH * k} y2={PH * k} className="pf-gl" />)}
            <motion.path className="plan-area" fill="url(#plan-g)" d={areaD} />
            <path d={pLine(ACT)} className="plan-act" />
            <motion.path className="plan-line" d={lineD} />
            {ACT.map((_, i) => <PlanDot key={i} i={i} g={g} cv={cv} />)}
            {c.months.map((mo, i) => <text key={mo} x={px(i)} y={PH + 18} textAnchor="middle" className="plan-m">{mo}</text>)}
          </svg>
          <div className="plan-legend"><span><i className="l-a" />{c.actual}</span><span><i className="l-f" />{c.scenarios[sc]} 2027</span></div>
          <label className="plan-drv">
            <span>{c.driver}</span>
            <input type="range" min="0" max="20" step="0.5" value={drv} onChange={(e) => { setTouched(true); setDrv(Number(e.target.value)) }} />
            <b>{drv >= 0 ? '+' : ''}{nf(drv)} %</b>
          </label>
          </div>
        </Reveal>
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   Reporting: del KPI al apunte
   ========================================================= */
const R_COMP = [['Norvia Iberia', 25.8], ['Norvia UK', 18.4], ['Norvia México', 11.2], ['Norvia Retail', 7.9], ['Norvia Inc.', 4.6]]
const R_ACC = [['7050000 · Ventas de producto', 0.58], ['7051000 · Servicios', 0.24], ['7052000 · Licencias', 0.12], ['7590000 · Otros ingresos', 0.06]]
const R_ENT = [['14/10', 'FV-26-0184223', 'Grupo Pradera SL', 12500], ['15/10', 'FV-26-0184318', 'Talleres Vega SA', 48230], ['17/10', 'FV-26-0184402', 'Distribuciones Mar', 9870], ['21/10', 'FV-26-0184577', 'Norvia UK (IC)', 124000], ['24/10', 'FV-26-0184610', 'Hotel Alba', 3415]]

export function Reporting() {
  const { t, lang } = useLang()
  const c = t.report
  const [path, setPath] = useState([]) // [companyIdx, accountIdx]
  const [touched, setTouched] = useState(false)
  const panel = useRef(null)
  const inView = useInView(panel, { amount: 0.5 })
  const [ghost, click] = useGhostScript(panel, inView && !touched, [
    ['.rp-bars li:nth-child(1) button', () => setPath([0]), 1700],
    ['.rp-bars li:nth-child(1) button', () => setPath([0, 0]), 2600],
    ['.rp-crumbs button:first-child', () => setPath([]), 1600],
    ['.rp-bars li:nth-child(2) button', () => setPath([1]), 2200],
    ['.rp-crumbs button:first-child', () => setPath([]), 1400],
  ])
  const nf = (n, d = 1) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
  const money = (n) => (lang === 'es' ? `${nf(n)} M €` : `€${nf(n)}M`)
  const level = path.length
  const total = R_COMP.reduce((a, [, v]) => a + v, 0)
  let rows, title, value
  if (level === 0) { rows = R_COMP.map(([n, v]) => [n, v]); title = c.start; value = total }
  else if (level === 1) { const [n, v] = R_COMP[path[0]]; rows = R_ACC.map(([a, s]) => [a, v * s]); title = n; value = v }
  else { const v = R_COMP[path[0]][1] * R_ACC[path[1]][1]; title = R_ACC[path[1]][0]; value = v; rows = null }
  const max = rows ? Math.max(...rows.map((r) => r[1])) : 1
  const crumbs = [c.levels[0], level > 0 && R_COMP[path[0]][0], level > 1 && R_ACC[path[1]][0].split(' · ')[0]].filter(Boolean)

  return (
    <section className="section report" id="reporting">
      <div className="wrap">
        <SectionHead num="04" big kicker={c.kicker} title={c.title} sub={c.sub} />
        <div className="report-grid tool-body">
        <Reveal tilt className="panel report-panel">
          <div className="rp-in" ref={panel} onPointerDown={() => setTouched(true)}>
          <div className="rp-top">
            <div className="rp-crumbs">
              {crumbs.map((x, i) => (
                <button key={x} className={i === crumbs.length - 1 ? 'is-cur' : ''} onClick={() => setPath(path.slice(0, i))} disabled={i === crumbs.length - 1}>{x}</button>
              ))}
            </div>
            <span className="chip">{c.levels[Math.min(level + 1, 3)]}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={path.join('-') || 'root'} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease }}>
              <p className="rp-title">{title}</p>
              <p className="rp-value">{money(value)}</p>
              {rows ? (
                <ul className="rp-bars">
                  {rows.map(([n, v], i) => (
                    <li key={n}>
                      <button onClick={() => setPath([...path, i])}>
                        <span className="rp-n">{n}</span>
                        <span className="rp-track"><motion.span style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: v / max }} transition={{ duration: 0.6, delay: 0.05 * i, ease }} /></span>
                        <span className="rp-v">{money(v)}</span>
                        <Icon name="right" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rp-entries">
                  {R_ENT.map(([d, doc, who, amt], i) => (
                    <motion.div key={doc} className="rp-entry" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                      <span>{d}</span><span className="rp-doc">{doc}</span><span>{who}</span>
                      <b>{new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', { minimumFractionDigits: 2 }).format(amt)}</b>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="rp-hint">{level < 2 ? c.hint : <button onClick={() => setPath(path.slice(0, -1))}>← {c.back}</button>}</p>
          <AnimatePresence>{!touched && <GhostCursor pos={ghost} click={click} />}</AnimatePresence>
          </div>
        </Reveal>
        <div className="tool-aside">
          <Checks items={c.features.slice(0, 3)} />
          <a className="link-arrow rp-link" href={REPORTING_URL} target="_blank" rel="noreferrer">{c.link} <Icon name="arrow" size={15} /></a>
        </div>
        </div>
      </div>
    </section>
  )
}



