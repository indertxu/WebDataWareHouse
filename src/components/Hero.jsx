import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Button, Icon } from './ui.jsx'
import FlowDiagram from './FlowDiagram.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'

const ease = [0.16, 1, 0.3, 1]

export function useMedia(q) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/* Titular que se escribe: la primera línea una vez, la segunda va rotando frases. */
function useTypewriter(line1, phrases, reduce) {
  const [a, setA] = useState(reduce ? line1 : '')
  const [b, setB] = useState(reduce ? phrases[0] : '')
  const [phase, setPhase] = useState(reduce ? 'done' : 'l1')
  useEffect(() => {
    if (reduce) { setA(line1); setB(phrases[0]); return }
    setA(''); setB(''); setPhase('l1')
    let timer, i = 0, k = 0, j = 0, deleting = false
    const typeA = () => {
      i++
      setA(line1.slice(0, i))
      if (i < line1.length) timer = setTimeout(typeA, line1[i - 1] === '.' ? 260 : 46)
      else { setPhase('l2'); timer = setTimeout(loopB, 380) }
    }
    const loopB = () => {
      const ph = phrases[k % phrases.length]
      if (!deleting) {
        j++
        setB(ph.slice(0, j))
        if (j < ph.length) timer = setTimeout(loopB, 52)
        else { deleting = true; timer = setTimeout(loopB, 2600) }
      } else {
        j--
        setB(ph.slice(0, j))
        if (j > 0) timer = setTimeout(loopB, 24)
        else { deleting = false; k++; timer = setTimeout(loopB, 320) }
      }
    }
    timer = setTimeout(typeA, 450)
    return () => clearTimeout(timer)
  }, [line1, phrases.join('|'), reduce])
  return { a, b, phase }
}

export default function Hero() {
  const { t, lang } = useLang()
  const h = t.hero
  const p = h.panel
  const reduce = useReducedMotion()
  const mobile = useMedia('(max-width: 820px)')
  const tw = useTypewriter(h.title1, h.rotate, reduce)
  const longest = h.rotate.reduce((x, y) => (y.length > x.length ? y : x), '')
  const wrap = useRef(null)
  const panelRef = useRef(null)
  const inView = useInView(panelRef, { once: true, amount: 0.12 })
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end start'] })
  const rotateX = useTransform(scrollYProgress, [0, 0.35], reduce || mobile ? [0, 0] : [16, 0])
  const scale = useTransform(scrollYProgress, [0, 0.35], reduce || mobile ? [1, 1] : [0.92, 1])
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const fade = (d) => ({
    initial: reduce ? false : { opacity: 0, y: 18, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, ease, delay: d },
  })

  return (
    <section className="hero" id="top" ref={wrap}>
      <motion.div className="hero-glow" style={{ y: glowY }} aria-hidden="true" />
      <div className="wrap hero-copy">
        <motion.div className="hero-tags" {...fade(0)}>
          <span className="tag tag-strong">Next Data</span>
          {h.tags.map((x) => <span className="tag" key={x}>{x}</span>)}
        </motion.div>
        <h1 className="h1" aria-label={`${h.title1} ${h.rotate[0]}`}>
          <span className="tw-line" aria-hidden="true">
            <span className="tw-ghost">{h.title1}</span>
            <span className="tw-text">{tw.a}{tw.phase === 'l1' && <i className="tw-caret" />}</span>
          </span>
          <span className="tw-line hl-2" aria-hidden="true">
            <span className="tw-ghost">{longest}</span>
            <span className="tw-text"><span className="tw-grad">{tw.b}</span>{tw.phase !== 'l1' && <i className="tw-caret" />}</span>
          </span>
        </h1>
        <div className="hero-row">
          <motion.p className="hero-sub" {...fade(0.7)}>{h.sub}</motion.p>
          <motion.div className="hero-cta" {...fade(0.85)}>
            <div className="hero-buttons">
              <Button href="#demo" onClick={onAnchor} arrow>{h.primary}</Button>
              <Button href="#como-funciona" onClick={onAnchor} variant="ghost" arrow="down">{h.secondary}</Button>
            </div>
            <p className="hero-note">{h.note}</p>
          </motion.div>
        </div>
      </div>

      <div className="wrap hero-stage">
        <motion.div className="hero-panel-tilt" style={{ rotateX, scale }}>
          <motion.div ref={panelRef} className="panel hero-panel"
            initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.5 }}>
            <div className="hp-top">
              <div className="hp-crumb">
                <span>{p.crumb[0]}</span><span className="sep">/</span><span>{p.crumb[1]}</span>
                <span className="hp-title">{p.title}</span>
              </div>
              <div className="hp-chips">
                <span className="chip">{p.period}</span>
                <span className="chip hide-sm">{p.companies}</span>
                <span className="chip chip-live"><i />{p.live}</span>
              </div>
            </div>
            <div className="hp-body">
              <FlowDiagram start={inView} mode={mobile ? 'v' : 'h'} p={p} lang={lang} key={mobile ? 'v' : 'h'} />
            </div>
            <div className="hp-foot">
              {p.checks.map((c, i) => (
                <motion.span className="chip chip-ok" key={c}
                  initial={reduce ? false : { opacity: 0, y: 8 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 5.4 + i * 0.15, duration: 0.5, ease }}>
                  <Icon name="check" size={13} stroke={2.6} /> {c}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
