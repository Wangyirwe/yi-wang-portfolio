import { createContext, useContext, useMemo, useState } from 'react'

const LangContext = createContext(null)

const dict = {
  nav: { works: { zh: '作品', en: 'Works' }, about: { zh: '关于', en: 'About' }, contact: { zh: '联系', en: 'Contact' } },
  heroKicker: { zh: '（ 视觉方向 ）', en: '( Visual Direction )' },
  role: { zh: '包装设计师', en: 'Packaging Designer' },
  status: {
    zh: '品牌识别载入中 █ 包装结构推演中 █ 插画能量持续输出中 █',
    en: 'IDENTITY_LOADING █ PACK_STRUCTURE █ ILLUSTRATION_FLOW █',
  },
  scroll: { zh: '向下', en: 'DOWN' },
  series: { zh: '精选系列', en: 'SELECTED SERIES' },
  who: { zh: '关于', en: 'WHO I AM' },
  whoTitle: { zh: '（ 把图形落到可生产的点上 ）', en: '( From image to a producible core )' },
  whoBody: {
    zh: '王一，1999 年生于河南。做插画、包装与电商平面，也做印前落地：把叙事图形收成可印刷、可上架、可下滑阅读的视觉系统。',
    en: 'Yi Wang, born 1999 in Henan. Illustration, packaging and e-commerce graphics, with pre-press craft — turning narrative images into systems that print, shelf, and scroll.',
  },
  sectors: { zh: '能力切片', en: 'THE SECTORS' },
  archive: { zh: '作品归档', en: 'ARCHIVE OF SELECTED WORKS' },
  archiveLead: { zh: '重新定义品牌的视觉落点', en: 'Defining the visual landing of a brand' },
  view: { zh: '查看项目', en: 'Open project' },
  contactKicker: { zh: '联系', en: 'CONTACT' },
  contactTitle: { zh: '欢迎来信', en: 'Write a note' },
  contactHint: {
    zh: '表单不会发到服务器。提交后请使用你的邮箱客户端发送。',
    en: 'This form does not hit a server. Submit, then send from your mail client.',
  },
  name: { zh: '姓名', en: 'Name' },
  mail: { zh: '你的邮箱', en: 'Your email' },
  message: { zh: '想合作的内容', en: 'What you want to make' },
  send: { zh: '请发邮件', en: 'Please email' },
  sent: {
    zh: '请发邮件至',
    en: 'Please send email to',
  },
  close: { zh: '关闭', en: 'Close' },
  next: { zh: '下一件作品', en: 'Next work' },
  back: { zh: '返回归档', en: 'Back to archive' },
  process: { zh: '流程', en: 'Process' },
  footer: { zh: '专注本质的视觉实践', en: 'Visual practice, reduced to the core' },
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('yw-lang') || 'zh')

  const value = useMemo(() => {
    const t = (key) => dict[key]?.[lang] ?? key
    const pick = (obj) => obj?.[lang] ?? obj?.en ?? ''
    const toggle = () => {
      const next = lang === 'zh' ? 'en' : 'zh'
      localStorage.setItem('yw-lang', next)
      setLang(next)
    }
    return { lang, setLang, toggle, t, pick }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang')
  return ctx
}
