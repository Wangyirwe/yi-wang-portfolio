import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

const featured = works.filter((w) => w.featured)
const stageVideos = featured.filter((w) => w.stageVideo)
const stageStills = featured.filter((w) => !w.stageVideo)

export default function Directory() {
  const { t, pick, lang } = useLang()
  const [i, setI] = useState(0)
  const listRef = useRef(null)
  const videoEls = useRef({})
  const videoTimes = useRef({})
  const work = featured[i]
  const href = work.film || `/work/${work.slug}`

  useEffect(() => {
    featured.forEach((item, index) => {
      const img = new Image()
      img.decoding = 'async'
      if (index === 0) img.fetchPriority = 'high'
      img.src = item.cover
    })
  }, [])

  useEffect(() => {
    const seekSaved = (video, slug) => {
      const saved = videoTimes.current[slug]
      if (typeof saved !== 'number' || saved <= 0) return
      const apply = () => {
        const duration = video.duration
        video.currentTime = Number.isFinite(duration) && duration > 0 ? saved % duration : saved
      }
      if (video.readyState >= 1) apply()
      else video.addEventListener('loadedmetadata', apply, { once: true })
    }

    stageVideos.forEach((item) => {
      const video = videoEls.current[item.slug]
      if (!video) return
      if (item.slug === work.slug) return
      videoTimes.current[item.slug] = video.currentTime
      video.pause()
    })

    const active = videoEls.current[work.slug]
    if (!active) return
    seekSaved(active, work.slug)
    active.muted = true
    const play = active.play()
    if (play && typeof play.catch === 'function') play.catch(() => {})

    const onTime = () => {
      videoTimes.current[work.slug] = active.currentTime
    }
    active.addEventListener('timeupdate', onTime)
    return () => {
      videoTimes.current[work.slug] = active.currentTime
      active.removeEventListener('timeupdate', onTime)
      active.pause()
    }
  }, [i, work.slug])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const syncMark = () => {
      const btn = list.querySelector('button.on')
      const mark = list.querySelector('.directory-list-mark')
      if (!btn || !mark) return
      mark.removeAttribute('style')
      const lr = list.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      list.style.setProperty('--mark-y', `${br.top - lr.top}px`)
      list.style.setProperty('--mark-h', `${br.height}px`)
    }

    syncMark()
    const ro = new ResizeObserver(syncMark)
    ro.observe(list)
    list.querySelectorAll('button').forEach((btn) => ro.observe(btn))
    window.addEventListener('resize', syncMark)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncMark)
    }
  }, [i, lang])

  return (
    <section className="directory" id="directory">
      <h2 className="directory-title">{t('directory')}</h2>
      <div className="directory-layout">
        <div className="directory-rail" ref={listRef}>
          <span className="directory-list-mark" aria-hidden="true" />
          <ol className="directory-list">
            {featured.map((w, idx) => (
              <li key={w.slug}>
                <button type="button" className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>
                  <span className="directory-list-name">{pick(w.directoryTitle ?? w.title)}</span>
                  <span className="directory-list-meta">{pick(w.directoryCategory ?? w.category)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <article className="directory-stage">
          {stageVideos.map((item) => (
            <video
              key={item.slug}
              ref={(el) => {
                if (el) videoEls.current[item.slug] = el
                else delete videoEls.current[item.slug]
              }}
              className={`directory-stage-media${item.slug === work.slug ? '' : ' is-off'}`}
              src={item.stageVideo}
              poster={item.cover}
              muted
              loop
              playsInline
              preload="auto"
            />
          ))}
          {stageStills.map((item) => (
            <img
              key={item.slug}
              className={`directory-stage-media${item.stageKenBurns ? ' is-ken' : ''}${item.slug === work.slug ? '' : ' is-off'}`}
              src={item.stageImage || item.cover}
              alt={item.slug === work.slug ? pick(item.title) : ''}
              decoding="async"
            />
          ))}
          <div className="directory-card">
            <h3>{pick(work.title)}</h3>
            <p>{pick(work.summary)}</p>
            <Link to={href} className="directory-more">
              {t('directoryMore')}
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
