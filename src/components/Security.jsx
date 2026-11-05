import { Icon, Reveal, SectionHead } from './ui.jsx'
import { useLang } from '../i18n.jsx'

/* Banda oscura a todo el ancho: seguridad y nube juntas */
export function Trust() {
  const { t } = useLang()
  const sec = t.security
  return (
    <section className="trust" id="seguridad">
      <div className="trust-bg" aria-hidden="true"><span className="trust-orb" /><span className="trust-grid" /></div>
      <div className="wrap">
        <SectionHead kicker={sec.kicker} title={sec.title} sub={sec.sub} dark />
        <ul className="trust-list">
          {sec.items.map((x, i) => (
            <Reveal as="li" key={x.title} delay={(i % 3) * 0.08 + Math.floor(i / 3) * 0.1}>
              <span className="trust-ico"><Icon name={x.icon} size={19} /></span>
              <b>{x.title}</b>
              <span>{x.text}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
