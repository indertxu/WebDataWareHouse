import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Problem from './components/Problem.jsx'
import Layers from './components/Layers.jsx'
import Connect from './components/Connect.jsx'
import Showcase from './components/Showcase.jsx'
import Backdrop, { ScrollBar } from './components/Backdrop.jsx'
import AI from './components/AI.jsx'
import Cloud from './components/Cloud.jsx'
import { Security, Pricing, Faq, Cta, Footer, CtaStrip, FloatingCta } from './components/Sections.jsx'
import { setLenis } from './scroll.js'
import Consent from './components/Consent.jsx'

export default function App() {
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
        <Layers />
        <CtaStrip />
        <Showcase />
        <Connect />
        <AI />
        <Cloud />
        <Security />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <Consent />
    </MotionConfig>
  )
}
