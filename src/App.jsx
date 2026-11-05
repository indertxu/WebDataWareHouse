import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Problem from './components/Problem.jsx'
import Platform from './components/Platform.jsx'
import Layers from './components/Layers.jsx'
import { Trust } from './components/Security.jsx'
import Backdrop, { ScrollBar } from './components/Backdrop.jsx'
import { Repository, Consolidation, Planning, Reporting } from './components/Tools.jsx'
import { Faq, Cta, Footer, FloatingCta } from './components/Sections.jsx'
import { setLenis } from './scroll.js'
import Consent from './components/Consent.jsx'
import { ChapterRail, Manifesto } from './components/Fx.jsx'
import { usePanelGlow } from './components/ui.jsx'

export default function App() {
  usePanelGlow()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    setLenis(lenis)
    let raf
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null) }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">Saltar al contenido</a>
      <Backdrop />
      <ScrollBar />
      <Nav />
      <FloatingCta />
      <ChapterRail />
      <main id="main">
        <Hero />
        <Problem />
        <Manifesto />
        <Platform />
        {/* Capítulo 01 · Data Warehouse: las tres capas y el repositorio */}
        <Layers />
        <Repository />
        {/* Capítulos 02-04 */}
        <Consolidation />
        <Planning />
        <Reporting />
        <Trust />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <Consent />
    </MotionConfig>
  )
}
