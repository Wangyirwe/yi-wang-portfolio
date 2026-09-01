import { useState } from 'react'
import { EMAIL } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function Contact() {
  const { t } = useLang()
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
    <section className="contact" id="contact">
      <p className="kicker">{t('contactKicker')}</p>
      <h2 className="display">{t('contactTitle')}</h2>
      <div className="contact-grid">
        <p className="lead">{t('contactHint')}</p>
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
