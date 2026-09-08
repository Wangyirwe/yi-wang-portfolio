import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

const allFeatured = () => works.filter((w) => w.featured)

export default function Directory() {
  const { t, pick, lang } = useLang()
  const [i, setI] = useState(0)
  const listRef = useRef(null)
  const videoEls = useRef({})
  const videoTimes = useRef({})
  const lastWheelNav = useRef(0)
  const featured = allFeatured()
  const stageVideos = featured.filter((w) => w.stageVideo)
  const stageStills = featured.filter((w) => !w.stageVideo)
  const work = featured[i]
  const href = work.film || `/work/${work.slug}`

  useEffect(() => {
    const first = featured[0]
    if (!first?.cover) return
    const img = new Image()
    img.decoding = 'async'
    img.fetchPriority = 'low'
    img.src = first.cover
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
    active.loop = true
    const rate = work.stagePlaybackRate || 1
    active.playbackRate = rate
    if (active.error || active.readyState < 1) {
      active.load()
      seekSaved(active, work.slug)
    }
    active.playbackRate = rate
    const applyRate = () => {
      active.playbackRate = rate
    }
    active.addEventListener('loadeddata', applyRate)
    active.addEventListener('playing', applyRate)
    const play = active.play()
    if (play && typeof play.catch === 'function') play.catch(() => {})

    const onTime = () => {
      videoTimes.current[work.slug] = active.currentTime
    }
    active.addEventListener('timeupdate', onTime)
    return () => {
      videoTimes.current[work.slug] = active.currentTime
      active.removeEventListener('timeupdate', onTime)
      active.removeEventListener('loadeddata', applyRate)
      active.removeEventListener('playing', applyRate)
      active.pause()
    }
  }, [i, work.slug])

  useEffect(() => {
    const rail = listRef.current
    if (!rail) return
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
      const dir = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0
      if (!dir) return

      event.preventDefault()
      const now = performance.now()
      if (now - lastWheelNav.current < 340) return
      lastWheelNav.current = now
      setI((cur) => {
        const last = works.filter((w) => w.featured).length - 1
        return Math.min(last, Math.max(0, cur + dir))
      })
    }

    if (rail._dirWheel) rail.removeEventListener('wheel', rail._dirWheel)
    rail._dirWheel = onWheel
    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      rail.removeEventListener('wheel', onWheel)
      if (rail._dirWheel === onWheel) delete rail._dirWheel
    }
  }, [featured.length])

  const markCrawl = useRef(0)

  useLayoutEffect(() => {
    const rail = listRef.current
    if (!rail) return

    const measure = () => {
      const btn = rail.querySelector('button.on')
      if (!btn) return null
      const rr = rail.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      return { y: br.top - rr.top, h: br.height }
    }

    const apply = (y, h) => {
      rail.style.setProperty('--mark-y', `${y}px`)
      rail.style.setProperty('--mark-h', `${h}px`)
    }

    const place = (motion) => {
      const mark = rail.querySelector('.directory-list-mark')
      const next = measure()
      if (!mark || !next) return

      window.clearTimeout(markCrawl.current)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const prevY = mark.offsetTop
      const prevH = mark.offsetHeight
      const still = !motion || reduce || !prevH || Math.abs(next.y - prevY) < 1

      if (still) {
        mark.style.transition = 'none'
        apply(next.y, next.h)
        return
      }

      const down = next.y > prevY
      const stretchY = down ? prevY : next.y
      const stretchH = down ? next.y + next.h - prevY : prevY + prevH - next.y
      const ease = 'cubic-bezier(0.22, 0.8, 0.28, 1)'

      mark.style.transition = `top 0.34s ${ease}, height 0.34s ${ease}`
      apply(stretchY, stretchH)

      markCrawl.current = window.setTimeout(() => {
        mark.style.transition = `top 0.42s ${ease}, height 0.42s ${ease}`
        apply(next.y, next.h)
      }, 200)
    }

    place(true)
    const snap = () => place(false)
    window.addEventListener('resize', snap)
    return () => {
      window.clearTimeout(markCrawl.current)
      window.removeEventListener('resize', snap)
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
              <li key={w.slug} className={w.directoryDetached ? 'is-detached' : undefined}>
                <button type="button" className={idx === i ? 'on' : ''} onClick={() => setI(idx)}>
                  <span className="directory-list-name">
                    {w.directoryDetached
                      ? `${pick({ zh: '其他', en: 'Other' })} ${pick(w.directoryTitle ?? w.title)}`
                      : `${idx + 1} ${pick(w.directoryTitle ?? w.title)}`}
                  </span>
                  <span className="directory-list-meta">{pick(w.directoryCategory ?? w.category)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <article className="directory-stage">
          {stageVideos.map((item) => (
            <video
              key={`${item.slug}-${item.stageVideo}`}
              ref={(el) => {
                if (el) {
                  videoEls.current[item.slug] = el
                  el.playbackRate = item.stagePlaybackRate || 1
                } else delete videoEls.current[item.slug]
              }}
              className={`directory-stage-media${item.slug === work.slug ? '' : ' is-off'}`}
              src={item.stageVideo}
              muted
              loop
              playsInline
              preload={item.slug === work.slug ? 'metadata' : 'none'}
              onPlaying={(event) => {
                event.currentTarget.playbackRate = item.stagePlaybackRate || 1
              }}
            />
          ))}
          {stageStills.map((item) =>
            item.stageImage || item.cover ? (
            <img
              key={item.slug}
              className={`directory-stage-media${item.stageKenBurns ? ' is-ken' : ''}${item.slug === work.slug ? '' : ' is-off'}`}
              src={item.stageImage || item.cover}
              alt={item.slug === work.slug ? pick(item.title) : ''}
              decoding="async"
            />
            ) : null,
          )}
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
