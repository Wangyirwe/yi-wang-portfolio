import { useCallback, useEffect, useRef } from 'react'
import { scrollToId } from '../lib/scroll.js'

const TITLE_STYLE = `
  .headline { display: none !important; }
  .dock-wrap { display: none !important; }
`

function goParent(id) {
  if (id === 'film') {
    scrollToId('series')
    return
  }
  scrollToId(id)
}

function targetId(node) {
  if (!node || !node.closest) return ''
  if (node.closest('[data-yw-go]')) return node.closest('[data-yw-go]').getAttribute('data-yw-go')
  if (node.closest('.liquid-stage--explore, .liquid-button--explore')) return 'series'
  if (node.closest('.scroll')) return 'persona'
  if (node.closest('.knob--about')) return 'about'
  if (node.closest('.card--stove .knob, .card--stove')) return 'series'
  return ''
}

export default function SylvaHero() {
  const frameRef = useRef(null)

  useEffect(() => {
    const onMsg = (event) => {
      if (event.data?.type !== 'yw-sylva-nav' || !event.data.id) return
      goParent(event.data.id)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  const onLoad = useCallback(() => {
    const frame = frameRef.current
    const doc = frame?.contentDocument
    const win = frame?.contentWindow
    if (!doc || !win) return

    if (!doc.getElementById('yw-sylva-type')) {
      const style = doc.createElement('style')
      style.id = 'yw-sylva-type'
      style.textContent = TITLE_STYLE
      doc.head.appendChild(style)
    }

    const lede = doc.querySelector('.lede')
    if (lede) {
      lede.textContent = ''
    }
    const explore = doc.querySelector('.liquid-button--explore .lbl')
    if (explore) explore.textContent = '探索作品'
    const aboutLabel = doc.querySelector('.card--about .label')
    const aboutTitle = doc.querySelector('.card--about h2')
    if (aboutLabel) aboutLabel.textContent = '我们的理念'
    if (aboutTitle) aboutTitle.textContent = '让野生引领。'
    const noteLabel = doc.querySelector('.card--stove .label')
    const noteTitle = doc.querySelector('.card--stove h2')
    if (noteLabel) noteLabel.textContent = '田野笔记 07'
    if (noteTitle) noteTitle.textContent = '雨后'
    const stats = doc.querySelectorAll('.stat')
    if (stats[0]) {
      const dt = stats[0].querySelector('dt')
      const dd = stats[0].querySelector('dd')
      if (dt) dt.textContent = '树冠恢复'
      if (dd) dd.textContent = '282公顷'
    }
    if (stats[1]) {
      const dt = stats[1].querySelector('dt')
      const dd = stats[1].querySelector('dd')
      if (dt) dt.textContent = '本土物种'
      if (dd) dd.textContent = '43个已绘制'
    }

    const items = [...doc.querySelectorAll('.dock-item')]
    const dockIds = ['top', 'top', 'directory', 'series', 'contact']
    items.forEach((item, i) => item.setAttribute('data-yw-go', dockIds[i] || 'top'))
    doc.querySelector('.liquid-stage--explore')?.setAttribute('data-yw-go', 'series')
    doc.querySelector('.scroll')?.setAttribute('data-yw-go', 'persona')
    doc.querySelector('.knob--about')?.setAttribute('data-yw-go', 'about')
    doc.querySelector('.card--stove .knob')?.setAttribute('data-yw-go', 'series')

    if (win.__ywSylvaNav) return
    win.__ywSylvaNav = true
    win.addEventListener(
      'click',
      (event) => {
        const id = targetId(event.target)
        if (!id) return
        event.preventDefault()
        win.parent.postMessage({ type: 'yw-sylva-nav', id }, '*')
      },
      true,
    )
  }, [])

  return (
    <iframe
      ref={frameRef}
      className="sylva-iframe"
      title="Sylva — Into the living world"
      src="/landing-pages/inner-green-3d.html"
      sandbox="allow-scripts allow-same-origin allow-popups"
      loading="eager"
      onLoad={onLoad}
    />
  )
}
