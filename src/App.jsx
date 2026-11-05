import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Problem from './components/Problem.jsx'
import Platform from './components/Platform.jsx'
import Layers from './components/Layers.jsx'
import Connect from './components/Connect.jsx'
import Cloud from './components/Cloud.jsx'
import Backdrop, { ScrollBar } from './components/Backdrop.jsx'
import { DwIntro, Repository, Consolidation, Planning, Reporting, HowItWorks, Implementation, WhoFor, Roadmap } from './components/Tools.jsx'
import { Security, Faq, Cta, Footer, CtaStrip, FloatingCta } from './components/Sections.jsx'
import { setLenis } from './scroll.js'
import Consent from './components/Consent.jsx'
import { AI, Manifesto } from './components/Fx.jsx'
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
      <main id="main">
        <Hero />
        <Problem />
        <Manifesto />
        <Platform />
        <DwIntro />
        <Layers />
        <Connect />
        <CtaStrip />
        <Repository />
        <Consolidation />
        <Planning />
        <Reporting />
        <HowItWorks />
        <AI />
        <Security />
        <Cloud />
        <Implementation />
        <WhoFor />
        <Roadmap />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <Consent />
    </MotionConfig>
  )
}
