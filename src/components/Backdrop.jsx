import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/*
  Fondo de toda la página (fijo):
  - rejilla fina de 56 px
  - una segunda rejilla más intensa que solo se ve alrededor del cursor
  - tres halos que flotan despacio
  - haces de luz que recorren las líneas de la rejilla (vertical y horizontal)
  Con movimiento reducido solo queda la rejilla.
*/
const BEAMS_V = [
  { x: 3, dur: 7, delay: 0 }, { x: 9, dur: 9.5, delay: 1.3 }, { x: 16, dur: 12, delay: 2.6 },
  { x: 21, dur: 8.5, delay: 4.1 }, { x: 27, dur: 10.5, delay: 0.8 },
]
const BEAMS_H = [{ y: 4, dur: 11, delay: 2 }, { y: 9, dur: 14, delay: 6 }, { y: 13, dur: 12.5, delay: 9 }]

export default function Backdrop() {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const el = ref.current
    let raf = 0, x = -999, y = -999
    const move = (e) => {
      x = e.clientX; y = e.clientY
      if (!raf) raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
        raf = 0
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduce])

  return (
    <div className="bd" ref={ref} aria-hidden="true">
      <div className="bd-grid" />
      {!reduce && <div className="bd-spot" />}
      {!reduce && (
        <>
          <span className="bd-halo h1" />
          <span className="bd-halo h2" />
          <span className="bd-halo h3" />
          {BEAMS_V.map((b, i) => (
            <span key={`v${i}`} className="bd-beam v" style={{ left: `calc(${b.x} * 56px)`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
          ))}
          {BEAMS_H.map((b, i) => (
            <span key={`h${i}`} className="bd-beam h" style={{ top: `calc(${b.y} * 56px)`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
          ))}
        </>
      )}
    </div>
  )
}

/* Barra fina de progreso de lectura, arriba del todo */
export function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return <motion.div className="scrollbar" style={{ scaleX }} aria-hidden="true" />
}
