import { useState } from 'react'
import { chips, EMAIL } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function About() {
  const { t, pick } = useLang()
  const [open, setOpen] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') || '')
    const from = String(data.get('from') || '')
    const message = String(data.get('message') || '')
    const subject = encodeURIComponent(`Portfolio / ${name}`)
    const body = encodeURIComponent(`${message}\n\n— ${name} <${from}>`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
    setOpen(true)
  }

  return (
    <section className="about" id="contact">
      <p className="kicker">{t('contactKicker')}</p>
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
      <div className="contact-grid">
        <div>
          <h3 className="contact-head">{t('contactTitle')}</h3>
          <p className="lead">{t('contactHint')}</p>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            {t('name')}
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            {t('mail')}
            <input name="from" type="email" required autoComplete="email" />
          </label>
          <label>
            {t('message')}
            <textarea name="message" required />
          </label>
          <button type="submit">{t('send')}</button>
          {open && (
            <p className="toast" role="status">
              {t('sent')}{' '}
              <a className="mail" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
