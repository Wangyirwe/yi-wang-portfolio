import { Link } from 'react-router-dom'
import { archiveExtras, works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

function Tile({ cover, title, category, to }) {
  const inner = (
    <>
      <div className="tile-meta">
        <p>{category}</p>
        <h3>{title}</h3>
      </div>
      <div className="tile-shot">
        <img src={cover} alt={title} />
      </div>
    </>
  )
  if (to) {
    return (
      <Link className="tile" to={to}>
        {inner}
      </Link>
    )
  }
  return <article className="tile">{inner}</article>
}

export default function Archive() {
  const { t, pick } = useLang()

  return (
    <section className="archive" id="archive">
      <p className="kicker">{t('archive')}</p>
      <h2 className="display">{t('archiveLead')}</h2>
      <div className="archive-grid">
        {works.filter((w) => w.cover && !w.directoryDetached).map((w) => (
          <Tile
            key={w.slug}
            cover={w.cover}
            title={pick(w.title)}
            category={pick(w.category)}
            to={`/work/${w.slug}`}
          />
        ))}
        {archiveExtras.map((item) => (
          <Tile
            key={item.id}
            cover={item.cover}
            title={pick(item.title)}
            category={pick(item.category)}
          />
        ))}
      </div>
    </section>
  )
}
