import { useState } from 'react'
import { Link } from 'react-router-dom'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

const featured = works.filter((w) => w.featured)

export default function Directory() {
  const { t, pick } = useLang()
  const [i, setI] = useState(0)
  const work = featured[i]
  const href = work.film || `/work/${work.slug}`

  return (
    <section className="directory" id="directory">
      <h2 className="directory-title">{t('directory')}</h2>
      <div className="directory-layout">
        <ol className="directory-list">
          {featured.map((w, idx) => (
            <li key={w.slug}>
              <button type="button" className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>
                <span className="directory-list-name">{pick(w.title)}</span>
                <span className="directory-list-meta">{pick(w.category)}</span>
              </button>
            </li>
          ))}
        </ol>

        <article className="directory-stage">
          <img src={work.cover} alt={pick(work.title)} />
          <div className="directory-card">
            <h3>{pick(work.title)}</h3>
            <p>{pick(work.summary)}</p>
            <Link to={href} className="directory-more">
              {t('directoryMore')}
            </Link>
          </div>
          <ul className="directory-stats">
            <li>
              <span>{t('directoryYear')}</span>
              <strong>{work.year}</strong>
            </li>
            <li>
              <span>{t('directoryCat')}</span>
              <strong>{pick(work.category)}</strong>
            </li>
            <li>
              <span>{t('directoryNo')}</span>
              <strong>{work.index}</strong>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}
