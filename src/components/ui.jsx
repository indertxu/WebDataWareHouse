import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/* ---------- Icons (trazos tipo lucide, 24x24) ---------- */
const P = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  alert: <><path d="M12 8v5" /><path d="M12 16.5v.01" /><circle cx="12" cy="12" r="9" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3 21 2M17 6l3 3M14 9l2.5 2.5" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  trace: <><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5" /></>,
  cloud: <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.4 12.6 3.5 3.5 0 0 0 6 19h11.5Z" />,
  sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></>,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  play: <path d="M7 4l13 8-13 8V4Z" />,
  db: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
}

export function Icon({ name, size = 18, stroke = 2, className, style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  )
}

/* ---------- Buttons ---------- */
export function Button({ children, variant = 'primary', arrow, href, onClick, type = 'button', className = '', ...rest }) {
  const cls = `btn btn-${variant} ${className}`
  const inner = (
    <>
      <span className="btn-shine" aria-hidden="true" />
      <span className="btn-label">{children}</span>
      {arrow && <Icon name={arrow === true ? 'arrow' : arrow} size={16} className="btn-arrow" />}
    </>
  )
  if (href) return <a className={cls} href={href} onClick={onClick} {...rest}>{inner}</a>
  return <button type={type} className={cls} onClick={onClick} {...rest}>{inner}</button>
}

/* ---------- Section head: etiqueta → título → entradilla, en orden ---------- */
const ease = [0.16, 1, 0.3, 1]
export function SectionHead({ kicker, title, sub, align = 'left', dark = false }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const v = (i) => ({
    initial: reduce ? false : { opacity: 0, y: 22, filter: 'blur(6px)' },
    animate: inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined,
    transition: { duration: 0.75, ease, delay: i * 0.09 },
  })
  return (
    <div ref={ref} className={`shead shead-${align} ${dark ? 'on-dark' : ''}`}>
      {kicker && <motion.p className="kicker" {...v(0)}>{kicker}</motion.p>}
      <motion.h2 className="h2" {...v(1)}>{title}</motion.h2>
      {sub && <motion.p className="lead" {...v(2)}>{sub}</motion.p>}
    </div>
  )
}

/* ---------- Reveal: para bloques que entran después del título ---------- */
export function Reveal({ children, delay = 0, y = 26, className, as = 'div', ...rest }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M ref={ref} className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease, delay }} {...rest}>
      {children}
    </M>
  )
}

/* ---------- Contador con desaceleración cuártica ---------- */
export function useCountUp(target, { start = false, duration = 1800, delay = 0, decimals = 0 } = {}) {
  const reduce = useReducedMotion()
  const [val, setVal] = useState(reduce ? target : 0)
  useEffect(() => {
    if (!start) return
    if (reduce) { setVal(target); return }
    let raf, t0
    const timer = setTimeout(() => {
      const tick = (t) => {
        if (!t0) t0 = t
        const p = Math.min(1, (t - t0) / duration)
        const e = 1 - Math.pow(1 - p, 4)
        setVal(target * e)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [start, target, duration, delay, reduce])
  return decimals ? Number(val.toFixed(decimals)) : Math.round(val)
}

export function fmt(n, lang, decimals = 0) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: true,
  }).format(n)
}
