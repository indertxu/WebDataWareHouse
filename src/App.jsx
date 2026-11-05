import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Problem from './components/Problem.jsx'
import Platform from './components/Platform.jsx'
import Layers from './components/Layers.jsx'
import Connect from './components/Connect.jsx'
import { Trust } from './components/Cloud.jsx'
import Backdrop, { ScrollBar } from './components/Backdrop.jsx'
import { DwIntro, Repository, Consolidation, Planning, Reporting, Implementation, WhoStrip, Roadmap } from './components/Tools.jsx'
import { Faq, Cta, Footer, CtaStrip, FloatingCta } from './components/Sections.jsx'
import { setLenis } from './scroll.js'
import Consent from './components/Consent.jsx'
import { AI, ChapterRail, Manifesto } from './components/Fx.jsx'
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
        <WhoStrip />
        <Problem />
        <Manifesto />
        <Platform />
        {/* Capítulo 01 · Data Warehouse (con capas, conectores y repositorio) */}
        <DwIntro />
        <Layers />
        <Connect />
        <Repository />
        <CtaStrip />
        {/* Capítulos 02-04 */}
        <Consolidation />
        <Planning />
        <Reporting />
        <AI />
        <Trust />
        <Implementation />
        <Roadmap />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <Consent />
    </MotionConfig>
  )
}
