import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button, Icon } from './ui.jsx'
import { useLang } from '../i18n.jsx'
import { getConsent, saveConsent } from '../consent.js'
import { LEGAL_URL } from '../config.js'

const ease = [0.16, 1, 0.3, 1]

function Toggle({ on, onChange, disabled, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled}
      className={`ck-toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)}>
      <motion.span layout className="ck-knob" transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
    </button>
  )
}

export default function Consent() {
  const { t, lang } = useLang()
  const c = t.cookies
  const [banner, setBanner] = useState(false)
  const [panel, setPanel] = useState(false)
  const [choices, setChoices] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const saved = getConsent()
    if (!saved) {
      const id = setTimeout(() => setBanner(true), 900)
      return () => clearTimeout(id)
    }
    setChoices({ analytics: saved.analytics, marketing: saved.marketing })
  }, [])

  useEffect(() => {
    const open = () => {
      const saved = getConsent()
      if (saved) setChoices({ analytics: saved.analytics, marketing: saved.marketing })
      setPanel(true)
    }
    window.addEventListener('nd:cookie-settings', open)
    return () => window.removeEventListener('nd:cookie-settings', open)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('consent-open', banner || panel)
    if (!panel) return
    const onKey = (e) => { if (e.key === 'Escape') setPanel(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [banner, panel])

  const decide = (action) => {
    const saved = saveConsent(action, choices, lang)
    setChoices({ analytics: saved.analytics, marketing: saved.marketing })
    setBanner(false)
    setPanel(false)
  }

  const cats = [
    { key: 'necessary', locked: true },
    { key: 'analytics' },
    { key: 'marketing' },
  ]

  return (
    <>
      <AnimatePresence>
        {banner && !panel && (
          <motion.div className="ck-banner" role="region" aria-label={c.title}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease }}>
            <div className="ck-head">
              <span className="ck-ico"><Icon name="shield" size={16} /></span>
              <b>{c.title}</b>
            </div>
            <p>{c.text} <a className="ck-more" href={LEGAL_URL} target="_blank" rel="noreferrer">{c.more}</a></p>
            <div className="ck-actions">
              <button type="button" className="ck-link" onClick={() => setPanel(true)}>{c.settings}</button>
              <Button variant="ghost" className="btn-sm" onClick={() => decide('reject_all')}>{c.reject}</Button>
              <Button variant="primary" className="btn-sm" onClick={() => decide('accept_all')}>{c.accept}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {panel && (
          <motion.div className="ck-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setPanel(false) }}>
            <motion.div className="ck-panel" role="dialog" aria-modal="true" aria-labelledby="ck-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.45, ease }}>
              <div className="ck-panel-top">
                <h2 id="ck-title">{c.panelTitle}</h2>
                <button type="button" className="icon-btn" onClick={() => setPanel(false)} aria-label={c.close}><Icon name="x" size={16} /></button>
              </div>
              <p className="ck-intro">{c.panelText} <a className="ck-more" href={LEGAL_URL} target="_blank" rel="noreferrer">{c.policy}</a></p>
              <ul className="ck-cats">
                {cats.map(({ key, locked }) => (
                  <li key={key}>
                    <div>
                      <b>{c.cats[key].title}</b>
                      <span>{c.cats[key].text}</span>
                    </div>
                    {locked
                      ? <span className="ck-always">{c.always}</span>
                      : <Toggle on={choices[key]} label={c.cats[key].title}
                          onChange={(v) => setChoices((x) => ({ ...x, [key]: v }))} />}
                  </li>
                ))}
              </ul>
              <div className="ck-actions ck-actions-panel">
                <Button variant="ghost" className="btn-sm" onClick={() => decide('reject_all')}>{c.reject}</Button>
                <Button variant="ghost" className="btn-sm" onClick={() => decide('custom')}>{c.save}</Button>
                <Button variant="primary" className="btn-sm" onClick={() => decide('accept_all')}>{c.accept}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
