import { Link, Navigate, useParams } from 'react-router-dom'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

export default function Work() {
  const { slug } = useParams()
  const { t, pick, lang } = useLang()
  const index = works.findIndex((w) => w.slug === slug)
  const work = works[index]
  if (!work) return <Navigate to="/" replace />
  const next = works[(index + 1) % works.length]

  return (
    <article className="work">
      <div className="work-head">
        <p className="kicker">
          {pick(work.category)} / {work.year}
        </p>
        <Link to="/#archive">{t('back')}</Link>
      </div>
      <h1>{pick(work.title)}</h1>
      <p className="lead">{pick(work.subtitle)}</p>
      {work.cover ? (
      <figure className="work-cover">
        <img src={work.cover} alt={pick(work.title)} />
        {work.film && (
          <Link className="film-launch" to={work.film}>
            {lang === 'zh' ? '播放 8s 4K 进场' : 'Play 8s 4K entrance'}
          </Link>
        )}
      </figure>
      ) : null}
      <p className="lead">{pick(work.summary)}</p>
      <p className="kicker">{t('process')}</p>
      <ul className="process">
        {pick(work.process).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      {work.images?.length ? (
      <div className="gallery">
        {work.images.map((src) => (
          <img key={src} src={src} alt="" />
        ))}
      </div>
      ) : null}
      <div className="work-nav">
        <Link to="/#archive">{t('back')}</Link>
        <Link to={`/work/${next.slug}`}>
          {t('next')} → {pick(next.title)}
        </Link>
      </div>
    </article>
  )
}
