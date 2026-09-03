let jumping = false
let jumpTimer = 0
let jumpRaf = 0

export function isJumping() {
  return jumping
}

function endJump() {
  jumping = false
  document.documentElement.classList.remove('is-jumping')
  window.cancelAnimationFrame(jumpRaf)
  window.clearTimeout(jumpTimer)
  window.removeEventListener('scrollend', endJump)
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

function finish(id) {
  endJump()
  if (id === 'persona') {
    window.setTimeout(() => {
      window.dispatchEvent(new Event('yw-persona-sheen'))
    }, 50)
    return
  }
  if (id === 'top') {
    window.dispatchEvent(new Event('yw-hero-resume'))
  }
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return

  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 10)
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
  history.replaceState(null, '', `#${id}`)

  const duration = Math.min(520, Math.max(240, Math.abs(dist) * 0.28))
  const start = performance.now()
  const ease = (t) => 1 - (1 - t) * (1 - t) * (1 - t)
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
