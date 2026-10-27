import { createContext, useContext, useEffect, useState } from 'react'
import es from './content/es.js'
import en from './content/en.js'

const dict = { es, en }
const Ctx = createContext({ lang: 'es', t: es, setLang: () => {} })

function initialLang() {
  try {
    const saved = localStorage.getItem('nd-lang')
    if (saved && dict[saved]) return saved
  } catch (e) {}
  return 'es'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dict[lang].meta.title
    try { localStorage.setItem('nd-lang', lang) } catch (e) {}
  }, [lang])
  return <Ctx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
