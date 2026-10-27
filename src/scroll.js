// Scroll suave compartido (Lenis). Si no hay Lenis (movimiento reducido), cae al nativo.
let lenis = null
export const setLenis = (l) => { lenis = l }
export const getLenis = () => lenis

export function scrollToId(id) {
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { offset: id === 'top' ? 0 : -72, duration: 1.4 })
  else window.scrollTo({ top: id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
}

// Para <a href="#id">: intercepta y desplaza con Lenis
export function onAnchor(e) {
  const href = e.currentTarget.getAttribute('href') || ''
  if (!href.startsWith('#')) return
  e.preventDefault()
  scrollToId(href.slice(1))
  history.replaceState(null, '', href)
}
