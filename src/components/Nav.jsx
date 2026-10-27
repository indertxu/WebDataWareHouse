import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import Logo from './Logo.jsx'
import { Button, Icon } from './ui.jsx'
import { useLang } from '../i18n.jsx'
import { onAnchor } from '../scroll.js'
import { APP_LOGIN_URL } from '../config.js'

function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('nd-theme', theme) } catch (e) {}
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids.join()])
  return active
}

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const [theme, toggleTheme] = useTheme()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(null)
  const { scrollY } = useScroll()
  const active = useActiveSection(t.nav.links.map((l) => l.id))

  // Se oculta al bajar y solo vuelve cuando la persona sube (rueda, gesto o teclado),
  // no por saltos de la página (contenido que cambia de alto, animaciones…).
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 12)
    if (y < 140) { setHidden(false); return }
    if (y > prev + 4 && !open) setHidden(true)
  })
  useEffect(() => {
    const show = () => setHidden(false)
    const onWheel = (e) => { if (e.deltaY < -6) show() }
    let ty = 0
    const onTouchStart = (e) => { ty = e.touches[0].clientY }
    const onTouchMove = (e) => { if (e.touches[0].clientY - ty > 24) show() }
    const onKey = (e) => { if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) show() }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  const pill = hover ?? active

  return (
    <>
      <motion.header className={`nav ${scrolled ? 'is-scrolled' : ''}`}
        animate={{ y: hidden ? -110 : 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
        <div className="nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Secciones" onMouseLeave={() => setHover(null)}>
            {t.nav.links.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={onAnchor}
                className={active === l.id ? 'is-active' : ''}
                onMouseEnter={() => setHover(l.id)}>
                {pill === l.id && (
                  <motion.span layoutId="nav-pill" className="nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                )}
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label={t.nav.theme} title={t.nav.theme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
            <button className="icon-btn lang-btn" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} aria-label={t.nav.langLabel} title={t.nav.langLabel}>
              <Icon name="globe" size={14} /> <span>{t.nav.lang}</span>
            </button>
            <a className="nav-login" href={APP_LOGIN_URL}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
              {t.nav.login}
            </a>
            <Button variant="primary" href="#demo" onClick={onAnchor} arrow className="btn-sm nav-demo">{t.nav.demo}</Button>
            <button className="icon-btn nav-burger" onClick={() => setOpen(true)} aria-label={t.nav.menu} aria-expanded={open}>
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} role="dialog" aria-modal="true" aria-label={t.nav.menu}>
            <div className="sheet-top">
              <Logo />
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label={t.nav.close}><Icon name="x" size={18} /></button>
            </div>
            <nav className="sheet-links">
              {t.nav.links.map((l, i) => (
                <motion.a key={l.id} href={`#${l.id}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => { setOpen(false); onAnchor(e) }}>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="sheet-actions">
              <Button href={APP_LOGIN_URL} variant="ghost">{t.nav.login}</Button>
              <Button href="#demo" arrow onClick={(e) => { setOpen(false); onAnchor(e) }}>{t.nav.demo}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
