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
    const unbinders = []

    const moveTo = (x, y, hover = false) => {
      pos.x = x
      pos.y = y
      el.style.opacity = '1'
      el.classList.toggle('is-hover', hover)
    }

    const isHoverTarget = (node) => {
      if (!node || !node.closest) return false
      if (node.closest('input, textarea')) return false
      return Boolean(node.closest('a, button, label, [data-dock], [data-yw-go]'))
    }

    const move = (e) => {
      moveTo(e.clientX, e.clientY, isHoverTarget(e.target))
    }

    const leave = () => {
      el.style.opacity = '0'
    }

    const bindFrame = (frame) => {
      const attach = () => {
        const win = frame.contentWindow
        const doc = frame.contentDocument
        if (!win || !doc || win.__ywRingBound) return
        win.__ywRingBound = true
        doc.documentElement.classList.add('has-ring-cursor')
        if (!doc.getElementById('yw-ring-cursor')) {
          const style = doc.createElement('style')
          style.id = 'yw-ring-cursor'
          style.textContent = 'html,body,canvas,a,button,svg,*{cursor:none !important;}'
          doc.head.appendChild(style)
        }
        const onMove = (e) => {
          const box = frame.getBoundingClientRect()
          moveTo(box.left + e.clientX, box.top + e.clientY, isHoverTarget(e.target))
        }
        win.addEventListener('pointermove', onMove, { passive: true })
        unbinders.push(() => {
          win.removeEventListener('pointermove', onMove)
          win.__ywRingBound = false
        })
      }
      if (frame.contentDocument?.readyState === 'complete') attach()
      frame.addEventListener('load', attach)
      unbinders.push(() => frame.removeEventListener('load', attach))
    }

    const tick = () => {
      cur.x += (pos.x - cur.x) * 0.22
      cur.y += (pos.y - cur.y) * 0.22
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerleave', leave)
    document.querySelectorAll('iframe').forEach(bindFrame)

    const watch = new MutationObserver(() => {
      document.querySelectorAll('iframe').forEach(bindFrame)
    })
    watch.observe(document.body, { childList: true, subtree: true })

    frame = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('has-ring-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerleave', leave)
      watch.disconnect()
      unbinders.forEach((fn) => fn())
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="ring-cursor" ref={ring} aria-hidden="true" />
}
