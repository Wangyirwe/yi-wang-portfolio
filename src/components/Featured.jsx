import { useState } from 'react'
import { Link } from 'react-router-dom'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

const featured = works.filter((w) => w.featured)

export default function Featured() {
  const { t, pick } = useLang()
  const [i, setI] = useState(0)
  const work = featured[i]

  return (
    <section className="series" id="series">
      <div className="series-head">
        <p className="kicker">{t('series')}</p>
        <div className="pager">
          <button type="button" onClick={() => setI((n) => (n + featured.length - 1) % featured.length)} aria-label="Prev">
            ⟪
          </button>
          <span>
            {String(i + 1).padStart(2, '0')} // {String(featured.length).padStart(2, '0')}
          </span>
          <button type="button" onClick={() => setI((n) => (n + 1) % featured.length)} aria-label="Next">
            ⟫
          </button>
        </div>
      </div>

      <Link to={`/work/${work.slug}`} className="series-card">
        <div className="series-copy">
          <p className="idx">{work.index} / {pick(work.category)}</p>
          <h2>{pick(work.title)}</h2>
          <p>{pick(work.subtitle)}</p>
          <span className="text-link">{t('view')} →</span>
        </div>
        <div className="series-visual">
          <img src={work.cover} alt={pick(work.title)} />
        </div>
      </Link>

      <ol className="series-dots">
        {featured.map((w, idx) => (
          <li key={w.slug}>
            <button type="button" className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>
              {pick(w.title)}
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
