export const FILM_DURATION = 8
export const FILM_FPS = 30

const T_APPROACH_END = 2.15
const T_ORBIT_END = 5.55
const T_ORBIT_HALF = T_APPROACH_END + (T_ORBIT_END - T_APPROACH_END) * 0.5
const T_DRAWER_END = T_ORBIT_HALF + 1.2
const ANGLE0 = 0.62

function clamp01(x) {
  return Math.min(Math.max(x, 0), 1)
}

export function easeInOutCubic(t) {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

function remap(t, a, b) {
  if (b === a) return t >= b ? 1 : 0
  return easeInOutCubic((t - a) / (b - a))
}

export function formatTimecode(seconds) {
  const ms = Math.max(0, seconds) * 1000
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const f = Math.floor((ms % 1000) / (1000 / FILM_FPS))
  return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`
}

export function evaluateFilm(tRaw) {
  const t = clamp01(tRaw / FILM_DURATION) * FILM_DURATION
  const lift = remap(t, T_ORBIT_END, FILM_DURATION)
  const boxY = lift * 3.55
  const orbitLinear = clamp01((t - T_APPROACH_END) / (T_ORBIT_END - T_APPROACH_END))

  let radius
  let height
  let angle

  if (t <= T_APPROACH_END) {
    const p = remap(t, 0, T_APPROACH_END)
    radius = 11.2 - p * 7.45
    height = 0.16 + p * 1.42
    angle = ANGLE0
  } else if (t <= T_ORBIT_END) {
    radius = 3.75 - orbitLinear * 0.38
    height = 1.58 + remap(t, T_APPROACH_END, T_ORBIT_END) * 0.3
    angle = ANGLE0 + Math.PI * orbitLinear
  } else {
    const p = remap(t, T_ORBIT_END, FILM_DURATION)
    radius = 3.37 - p * 0.45
    height = 1.88 + p * 4.35
    angle = ANGLE0 + Math.PI
  }

  const camX = Math.cos(angle) * radius
  const camZ = Math.sin(angle) * radius
  const camY = height + boxY * 0.9

  let shot = 'DOLLY IN · CRANE UP'
  let shotZh = '远及近 · 低至上推进'
  if (t >= T_ORBIT_END) {
    shot = 'ASCENSION'
    shotZh = '镜头与盒子升空'
  } else if (t >= T_ORBIT_HALF) {
    shot = 'ORBIT 180° · DRAWER'
    shotZh = '环绕 180° · 抽屉拉开'
  } else if (t >= T_APPROACH_END) {
    shot = 'ORBIT 180°'
    shotZh = '围绕盒子旋转 180°'
  }

  return {
    cam: [camX, camY, camZ],
    look: [0.04, 0.34 + boxY, 0],
    fov: 33 - remap(t, 0, T_APPROACH_END) * 5 + lift * 7,
    drawer: remap(t, T_ORBIT_HALF, T_DRAWER_END),
    boxY,
    tableOpacity: 1 - lift * 0.88,
    roll: t > T_APPROACH_END && t < T_ORBIT_END ? Math.sin(orbitLinear * Math.PI) * 0.035 : 0,
    shot,
    shotZh,
  }
}
