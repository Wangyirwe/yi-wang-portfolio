import { useEffect, useRef } from 'react'

export default function Cursor() {
  const ring = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const el = ring.current
    if (!el) return

    document.documentElement.classList.add('has-ring-cursor')

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const cur = { x: pos.x, y: pos.y }
    let frame = 0

    const move = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      el.style.opacity = '1'
    }

    const over = (e) => {
      const hit = e.target.closest('a, button, label')
      const typing = e.target.closest('input, textarea')
      el.classList.toggle('is-hover', Boolean(hit) && !typing)
    }

    const leave = () => {
      el.style.opacity = '0'
    }

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.22
      cur.y += (pos.y - cur.y) * 0.22
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerleave', leave)
    frame = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('has-ring-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="ring-cursor" ref={ring} aria-hidden="true" />
}
