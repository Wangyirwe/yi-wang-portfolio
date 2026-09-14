import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'

const allFeatured = () => works.filter((w) => w.featured)

export default function Directory() {
  const { t, pick, lang } = useLang()
  const [i, setI] = useState(0)
  const listRef = useRef(null)
  const lastWheelNav = useRef(0)
  const indexRef = useRef(0)
  const featured = allFeatured()
  indexRef.current = i

  useEffect(() => {
    const rail = listRef.current
    if (!rail) return
    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
      const dir = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0
      if (!dir) return
      const last = featured.length - 1
      const cur = indexRef.current
      if ((dir > 0 && cur >= last) || (dir < 0 && cur <= 0)) return
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheelNav.current < 340) return
      lastWheelNav.current = now
      setI(Math.min(last, Math.max(0, cur + dir)))
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
      return { y: btn.offsetTop, h: btn.offsetHeight }
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
    const btn = rail.querySelector('button.on')
    if (btn) {
      const target = btn.offsetTop - (rail.clientHeight - btn.offsetHeight) / 2
      rail.scrollTo({ top: Math.max(0, target), behavior: 'auto' })
    }
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
          <ol className="directory-list">
            <span className="directory-list-mark" aria-hidden="true" />
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
          {featured.map((w, idx) => {
            const depth = i - idx // 0 = active, 1 = first behind, 2 = second...
            const isBehind = depth > 0
            const isAhead = idx > i

            // Fan deck: offset + slight rotation + shrink + darken
            const fanX = isBehind ? -16 * depth : 0
            const fanY = isBehind ? 8 * depth : 0
            const rot = isBehind ? -4 * depth : 0 // slight fan tilt
            const scale = isBehind ? Math.max(0.55, 1 - 0.08 * depth) : 1
            // Bright-to-dark per layer
            const opacity = isBehind ? Math.max(0.18, 1 - 0.2 * depth) : isAhead ? 0 : 1
            const z = isBehind ? 100 - depth : idx === i ? 200 : 0

            const style = {
              transform: `translate3d(${fanX}px, ${fanY}px, 0) rotate(${rot}deg) scale(${scale.toFixed(3)})`,
              opacity: opacity.toFixed(2),
              zIndex: z,
              pointerEvents: depth === 0 ? 'auto' : 'none',
              transformOrigin: 'left center',
            }

            return (
              <div
                key={w.slug}
                className={`directory-shot${depth === 0 ? ' is-active' : ''}`}
                data-idx={idx}
                style={style}
              >
                {w.cover ? <img src={w.cover} alt={pick(w.title)} /> : null}
              </div>
            )
          })}
        </article>
      </div>
    </section>
  )
}
