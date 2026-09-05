import { Link } from 'react-router-dom'
import { archiveExtras, works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function Archive() {
  const { t, pick } = useLang()

  return (
    <section className="archive" id="archive">
      <p className="kicker">{t('archive')}</p>
      <h2 className="display">{t('archiveLead')}</h2>
      <div className="archive-grid">
        {works.filter((w) => w.cover).map((w) => (
          <Link className="tile" key={w.slug} to={`/work/${w.slug}`}>
            <img src={w.cover} alt={pick(w.title)} />
            <div className="tile-meta">
              <p>{pick(w.category)}</p>
              <h3>{pick(w.title)}</h3>
            </div>
          </Link>
        ))}
        {archiveExtras.map((item) => (
          <article className="tile" key={item.id}>
            <img src={item.cover} alt={pick(item.title)} />
            <div className="tile-meta">
              <p>{pick(item.category)}</p>
              <h3>{pick(item.title)}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
