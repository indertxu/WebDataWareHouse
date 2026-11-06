import { useEffect } from 'react'

/*
  Cada sección cabe en la pantalla.
  Si, tras escalar tipografía y espacios con el alto de pantalla, una sección sigue siendo
  más alta que la ventana, se reduce entera con `zoom` (mínimo 80 %) para que título y panel
  se vean juntos. En móvil no se aplica: ahí el contenido va apilado y se lee bajando.
*/
const MIN = 0.8
const MARGIN = 36 // aire que queda libre arriba y abajo
const SKIP = '.hero, .layers, .manifesto'

export function zoomOf(el) {
  // factor de zoom efectivo de un elemento (1 si no hay zoom)
  return el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
}

export function useFitSections() {
  useEffect(() => {
    const sections = [...document.querySelectorAll('main > section')].filter((s) => !s.matches(SKIP))
    let raf = 0
    const fit = () => {
      raf = 0
      const wide = window.innerWidth >= 900
      const H = window.innerHeight
      for (const s of sections) {
        const wraps = [...s.children].filter((c) => c.classList.contains('wrap'))
        if (!wraps.length) continue
        const cur = parseFloat(wraps[0].style.zoom || '1')
        if (!wide) { if (cur !== 1) wraps.forEach((w) => { w.style.zoom = '' }); continue }
        // alto natural del contenido (sin zoom) = alto actual / zoom actual
        const natural = wraps.reduce((h, w) => h + w.getBoundingClientRect().height, 0) / cur
        const cs = getComputedStyle(s)
        const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
        const room = H - MARGIN - Math.min(pad, 2 * MARGIN)
        const next = Math.max(MIN, Math.min(1, room / natural))
        if (Math.abs(next - cur) > 0.01) wraps.forEach((w) => { w.style.zoom = next >= 0.995 ? '' : String(next.toFixed(3)) })
      }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(fit) }
    // al cambiar el contenido (pestañas, drill-down, modos) se vuelve a medir
    const ro = new ResizeObserver(schedule)
    sections.forEach((s) => [...s.children].forEach((c) => c.classList.contains('wrap') && ro.observe(c)))
    window.addEventListener('resize', schedule)
    document.fonts?.ready.then(schedule)
    schedule()
    return () => { ro.disconnect(); window.removeEventListener('resize', schedule); cancelAnimationFrame(raf) }
  }, [])
}
