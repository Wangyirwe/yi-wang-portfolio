import { useEffect, useRef, useState } from 'react'
import { works } from '../data/works.js'
import { useLang } from '../i18n.jsx'
import { isJumping } from '../lib/scroll.js'

const featured = works.filter((w) => w.featured && !w.directoryDetached)
const HOLD_VH = 0

function mosaicSrcs(work) {
  const list = (work.images?.length ? work.images : work.cover ? [work.cover] : []).filter(Boolean)
  if (!list.length) return ['', '', '']
  return [list[0], list[1] ?? list[0], list[2] ?? list[0]]
}

function lineForDepth(depth, n) {
  const span = Math.max(1, n - 1)
  const u = Math.min(1, Math.max(0, depth) / span)
  return 1 - u
}

function poseCard(pose, k, p, n) {
  const d = k - p
  const abs = Math.abs(d)
  pose.style.zIndex = String(n - k)
  pose.style.opacity = '1'
  pose.style.setProperty('--series-line', lineForDepth(d, n).toFixed(4))
  pose.style.setProperty('--series-inner', d < 1.22 ? '1' : '0')

  if (d < 0) {
    const t = Math.min(1, -d)
    pose.style.transformOrigin = '50% 0%'
    pose.style.transform = `translate3d(${(-t * 110).toFixed(2)}%, 0, 0)`
    pose.style.visibility = t > 0.98 ? 'hidden' : 'visible'
    // Only the card currently sliding out keeps events on its way out
    pose.style.pointerEvents = abs < 1 ? 'auto' : 'none'
    return
  }

  const peek = Math.min(d, n - 1)
  pose.style.transformOrigin = '50% 0%'
  pose.style.transform =
    peek < 0.001
      ? 'none'
      : `translate3d(0, ${(-peek * 22).toFixed(1)}px, 0) scale(${(1 - peek * 0.06).toFixed(4)})`
  pose.style.visibility = 'visible'
  // Only the current front (d < 1) gets events by default.
  // Everything behind (d >= 1) is denied until front card fully slides out.
  pose.style.pointerEvents = d < 1 ? 'auto' : 'none'
}

export default function Featured() {
  const { t, pick } = useLang()
  const rootRef = useRef(null)
  const indexRef = useRef(0)
  const [i, setI] = useState(0)
  const n = featured.length

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cards = root.querySelectorAll('.series-card')

    const spotOn = (card, e) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
      card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
      card.style.setProperty('--spot-on', '1')
    }
    const spotOff = (card) => card.style.setProperty('--spot-on', '0')

    const onEnter = (e) => spotOn(e.currentTarget, e)
    const onMove = (e) => spotOn(e.currentTarget, e)
    const onLeave = (e) => spotOff(e.currentTarget)

    cards.forEach((c) => {
      c.addEventListener('pointerenter', onEnter)
      c.addEventListener('pointermove', onMove)
      c.addEventListener('pointerleave', onLeave)
    })

    return () => {
      cards.forEach((c) => {
        c.removeEventListener('pointerenter', onEnter)
        c.removeEventListener('pointermove', onMove)
        c.removeEventListener('pointerleave', onLeave)
      })
    }
  }, [n])

  useEffect(() => {
    const root = rootRef.current
    if (!root || n < 2) return

    let raf = 0
    const read = () => {
      raf = 0
      const vh = window.innerHeight || 1
      const start = root.getBoundingClientRect().top + window.scrollY
      const y = window.scrollY - start
      const p = Math.min(n - 1, Math.max(0, y / vh - HOLD_VH))
      root.style.setProperty('--series-p', String(p))
      const poses = root.querySelectorAll('.series-pose')
      poses.forEach((el, k) => poseCard(el, k, p, n))
      // When the front card (the one we're scrolling past, index Math.floor(p))
      // has fully slid out (visibility hidden), re-enable the 2nd layer so it glows
      const prevFrontIdx = Math.floor(p)
      const prevFront = poses[prevFrontIdx]
      if (prevFront && prevFront.style.visibility === 'hidden') {
        const frontIdx = Math.round(p)
        poses.forEach((el, k) => {
          const distFromFront = Math.abs(k - frontIdx)
          if (distFromFront === 1 && el.style.visibility !== 'hidden') {
            el.style.pointerEvents = 'auto'
          }
        })
      }
      if (isJumping()) return
      const idx = Math.round(p)
      if (idx !== indexRef.current) {
        indexRef.current = idx
        setI(idx)
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('yw-jump-end', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('yw-jump-end', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [n])

  const go = (idx) => {
    const root = rootRef.current
    if (!root) return
    const next = Math.min(n - 1, Math.max(0, idx))
    const top =
      root.getBoundingClientRect().top + window.scrollY + (HOLD_VH + next) * window.innerHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <section
      className="series"
      id="series"
      ref={rootRef}
      style={{ '--series-n': n, '--series-hold': HOLD_VH, '--series-p': 0 }}
    >
      <div className="series-pin">
        <h2 className="series-overline">作品速览</h2>
        <div className="series-head">
          <p className="kicker">{t('series')}</p>
          <div className="pager">
            <button type="button" onClick={() => go(i - 1)} aria-label="Prev">
              ⟪
            </button>
            <span>
              {String(i + 1).padStart(2, '0')} // {String(n).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => go(i + 1)} aria-label="Next">
              ⟫
            </button>
          </div>
        </div>

        <div className="series-viewport">
          <div className="series-stack">
            {featured.map((work, idx) => {
              const shots = mosaicSrcs(work)
              const name = pick(work.title)
              return (
                <div className="series-pose" key={work.slug}>
                  <div className="series-card">
                    <div className="series-frost">
                      <div className="series-card-head">
                        <span className="series-no">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="series-card-meta">
                          <p>{pick(work.category)}</p>
                          <h2>{name}</h2>
                        </div>
                        {work.year ? <span className="series-pill">{work.year}</span> : null}
                      </div>
                      <div className="series-mosaic">
                        <div className="series-tile series-mosaic-a">
                          <img src={shots[0]} alt="" />
                        </div>
                        <div className="series-tile series-mosaic-b">
                          <img src={shots[1]} alt="" />
                        </div>
                        <div className="series-tile series-mosaic-c">
                          <img src={shots[2]} alt={name} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ol className="series-dots">
          {featured.map((w, idx) => (
            <li key={w.slug}>
              <button type="button" className={idx === i ? 'on' : ''} onClick={() => go(idx)}>
                {pick(w.title)}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
