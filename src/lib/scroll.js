let jumping = false
let jumpTimer = 0
let jumpRaf = 0

export function isJumping() {
  return jumping === true
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n))
}

function range(v, a, b) {
  return clamp01((v - a) / (b - a))
}

export function personaViewProgress() {
  const vh = window.innerHeight
  const dir = document.getElementById('directory')
  if (dir) return range(dir.getBoundingClientRect().top, vh * 1.42, vh * 0.9)
  const card = document.querySelector('.persona-glass')
  if (card) return range(card.getBoundingClientRect().top, vh * 0.9, vh * 0.24)
  return 0
}

export function personaAnchorY() {
  const vh = window.innerHeight
  const persona = document.getElementById('persona')
  const card = document.querySelector('.persona-glass')
  if (persona && card) {
    const cardTop = persona.offsetTop + card.offsetTop
    const cardH = card.offsetHeight
    return Math.max(0, Math.round(cardTop - (vh - cardH) / 2))
  }
  const dir = document.getElementById('directory')
  if (dir) {
    return Math.max(0, Math.round(dir.getBoundingClientRect().top + window.scrollY - vh * 0.9))
  }
  const el = document.getElementById('persona')
  if (!el) return window.scrollY
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 10))
}

function endJump() {
  window.cancelAnimationFrame(jumpRaf)
  window.clearTimeout(jumpTimer)
  window.removeEventListener('scrollend', endJump)
  pauseSylva(false)
  jumping = false
  document.documentElement.classList.remove('is-jumping')
  window.dispatchEvent(new Event('yw-jump-end'))
}

function finish(id) {
  window.cancelAnimationFrame(jumpRaf)
  window.clearTimeout(jumpTimer)
  window.removeEventListener('scrollend', endJump)
  pauseSylva(false)
  window.requestAnimationFrame(() => {
    jumping = false
    document.documentElement.classList.remove('is-jumping')
    window.dispatchEvent(new Event('yw-jump-end'))
    if (id === 'persona') {
      window.setTimeout(() => {
        window.dispatchEvent(new Event('yw-persona-sheen'))
      }, 50)
      return
    }
    if (id === 'top') {
      window.dispatchEvent(new Event('yw-hero-resume'))
    }
  })
}

function pausePageMedia() {
  document.querySelectorAll('video').forEach((video) => {
    try {
      video.pause()
    } catch {
      /* ignore */
    }
  })
}

function pauseSylva(on) {
  const frame = document.querySelector('.sylva-iframe')
  if (!frame) return
  try {
    frame.contentWindow?.postMessage({ type: 'yw-sylva-pause', on: Boolean(on) }, '*')
  } catch {
    /* ignore */
  }
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return

  const top =
    id === 'persona'
      ? personaAnchorY()
      : Math.max(0, el.getBoundingClientRect().top + window.scrollY - 10)
  const from = window.scrollY
  const dist = top - from
  if (Math.abs(dist) < 8) {
    history.replaceState(null, '', `#${id}`)
    finish(id)
    return
  }

  endJump()
  jumping = true
  document.documentElement.classList.add('is-jumping')
  pausePageMedia()
  pauseSylva(true)
  history.replaceState(null, '', `#${id}`)

  const duration = Math.min(980, Math.max(420, Math.abs(dist) * 0.48))
  const start = performance.now()
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
  let settled = false
  const settle = () => {
    if (settled) return
    settled = true
    finish(id)
  }

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration)
    window.scrollTo(0, from + dist * ease(t))
    if (t < 1) {
      jumpRaf = window.requestAnimationFrame(step)
      return
    }
    window.scrollTo(0, top)
    settle()
  }

  jumpRaf = window.requestAnimationFrame(step)
  jumpTimer = window.setTimeout(settle, duration + 80)
}
