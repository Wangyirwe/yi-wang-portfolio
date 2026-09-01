import { chips } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function About() {
  const { t, pick } = useLang()

  return (
    <section className="about" id="about">
      <p className="kicker">{t('who')}</p>
      <h2 className="display">{t('whoTitle')}</h2>
      <p className="lead">{t('whoBody')}</p>
      <p className="sectors-label">{t('sectors')}</p>
      <ul className="sectors">
        {chips.map((c) => (
          <li key={c.en}>
            <span>{pick(c)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
