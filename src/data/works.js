export const EMAIL = '2296688205@qq.com'

export const featuredSlugs = ['time-snack-inn', 'suofei-yu', 'guochao-scroll', 'paper-bowls', 'ecommerce']

export const works = [
  {
    slug: 'time-snack-inn',
    featured: true,
    index: '05',
    year: '2026',
    film: '/film/time-snack-inn',
    category: { zh: '包装 / 产品动画', en: 'Packaging / Product film' },
    title: { zh: '食光小栈 · 坚果礼盒', en: 'Time Snack Inn · Nut Gift' },
    directoryTitle: { zh: '商业插画作品', en: 'Commercial illustration' },
    directoryCategory: { zh: '插画/板绘', en: 'Illustration / Tablet' },
    subtitle: { zh: '8 秒 4K 进场：推进、环绕开抽、升空展示', en: '8s 4K entrance: dolly, orbit drawer, ascension' },
    cover: '/images/time-snack/three-quarter.jpg',
    stageImage: '/images/lighthouse.jpg',
    stageKenBurns: true,
    images: [
      '/images/time-snack/three-quarter.jpg',
      '/images/time-snack/open-drawer.jpg',
      '/images/time-snack/front.jpg',
      '/images/time-snack/topdown.jpg',
    ],
    tags: {
      zh: ['抽屉盒结构', '产品镜头', '4K 进场'],
      en: ['Drawer pack', 'Product camera', '4K entrance'],
    },
    summary: {
      zh: '镜头从低处远景推近，再围绕礼盒旋转 180°；转到一半拉开抽屉，最后镜头与盒子一同升空。片长 8 秒，按 3840×2160 导出。',
      en: 'A low far dolly-in, a 180° orbit, a mid-orbit drawer pull, then camera and box lift together. Eight seconds, exported at 3840×2160.',
    },
    process: {
      zh: [
        '0.0–2.2s 远及近、低至上推进',
        '2.2–5.6s 环绕 180°',
        '3.9s 起抽屉拉开',
        '5.6–8.0s 镜头与盒子升空',
      ],
      en: [
        '0.0–2.2s dolly-in and crane-up',
        '2.2–5.6s 180° orbit',
        'Drawer opens from 3.9s',
        '5.6–8.0s camera and box ascend',
      ],
    },
  },
  {
    slug: 'suofei-yu',
    featured: true,
    index: '01',
    year: '2025',
    category: { zh: '包装设计', en: 'Packaging' },
    title: { zh: '索菲鱼 VI', en: 'Sophie Fish VI' },
    directoryTitle: { zh: '包装设计作品', en: 'Packaging design' },
    directoryCategory: { zh: '产品包装/刀模设计', en: 'Packaging / Die-cut' },
    subtitle: { zh: '猫粮品牌识别与包装系统', en: 'Cat-food identity and packaging system' },
    cover: '/images/sfy.jpg',
    stageVideo: '/images/packaging-pingpong.mp4',
    images: ['/images/sfy.jpg'],
    tags: {
      zh: ['品牌识别', '包装结构', 'IP 角色'],
      en: ['Brand identity', 'Packaging', 'Character IP'],
    },
    summary: {
      zh: '索菲鱼聚焦猫粮与猫咪周边。标志将猫、鱼与品牌字母叠合，视觉语言偏可爱卡通，用高饱和对比色支撑货架识别。',
      en: 'Sophie Fish is a cat-food and pet-care brand. The mark fuses cat, fish and initials; the system stays playful, high-contrast, and shelf-ready.',
    },
    process: {
      zh: ['标志几何推演', '卡通 IP 多姿态', '袋装 / 罐头 / 猫条展开', 'VI 延展至手提袋'],
      en: ['Logo construction', 'Mascot poses', 'Bags, cans, treat sticks', 'Carrier-bag extensions'],
    },
  },
  {
    slug: 'guochao-scroll',
    featured: true,
    index: '02',
    year: '2025',
    category: { zh: '绘画作品', en: 'Illustration' },
    title: { zh: '卷轴中的山河', en: 'Rivers in the Scroll' },
    directoryTitle: { zh: '商业海报作品', en: 'Commercial posters' },
    directoryCategory: { zh: '海报/平面设计', en: 'Poster / Graphic' },
    subtitle: { zh: '新国潮插画', en: 'New Guochao illustration' },
    cover: '/images/guochao.jpg',
    stageVideo: '/images/poster-loop.mp4',
    images: ['/images/guochao.jpg', '/images/snow-lake.jpg'],
    tags: {
      zh: ['新国潮', '插画', '金色纹理'],
      en: ['Guochao', 'Illustration', 'Foil texture'],
    },
    summary: {
      zh: 'S 形构图讲述天宫倾酒入人间：亮线、金箔质感与高饱和配色，鹤迎酒香，湖泊在山间铺开。',
      en: 'An S-curve composition: wine pours from a heavenly palace into mortal lakes. Bright linework, gold-foil texture, and saturated color carry the scent of cranes.',
    },
    process: {
      zh: ['卷轴叙事构图', '金线与云纹', '鹤、亭、壶的符号层'],
      en: ['Scroll narrative', 'Gold line and clouds', 'Crane, gate, vessel symbols'],
    },
  },
  {
    slug: 'paper-bowls',
    featured: true,
    index: '03',
    year: '2025',
    category: { zh: '包装设计', en: 'Packaging' },
    title: { zh: '纸碗系列', en: 'Paper Bowl Series' },
    directoryTitle: { zh: '建模系列作品', en: '3D modeling series' },
    directoryCategory: { zh: '效果图/包装盒', en: 'Renders / Packaging box' },
    subtitle: { zh: '冰淇淋碗与国潮沙拉碗', en: 'Gelato bowl and Guochao salad bowl' },
    cover: '/images/bowls.jpg',
    stageVideo: '/images/box-orbit-push-loop.mp4?v=4s',
    images: ['/images/bowls.jpg', '/images/guochao-bowl.jpg'],
    tags: {
      zh: ['纸碗', '拼版制版', '插画包装'],
      en: ['Paper bowl', 'Prepress', 'Illustrated pack'],
    },
    summary: {
      zh: '从线稿、上色、文案到扇形拼版，完成夏日冰淇淋碗；并以国潮蔬果坛子完成沙拉碗的制版展开。',
      en: 'From line to color, copy, and fan-shaped imposition for a summer gelato bowl; a Guochao vegetable-jar salad bowl follows the same production path.',
    },
    process: {
      zh: ['线稿', '绘图与色板', '文案排版', '拼版与制版'],
      en: ['Line art', 'Color and palette', 'Copy layout', 'Imposition'],
    },
  },
  {
    slug: 'ecommerce',
    featured: true,
    index: '04',
    year: '2025',
    category: { zh: '平面设计', en: 'Graphic' },
    title: { zh: '电商详情页合集', en: 'E-commerce Detail Pages' },
    directoryTitle: { zh: '电商系列作品', en: 'E-commerce series' },
    directoryCategory: { zh: '商品精修/详情页', en: 'Retouching / Detail pages' },
    subtitle: { zh: '主图海报与移动详情长页', en: 'Main images and mobile long-form PDPs' },
    cover: '/images/ecommerce.jpg',
    stageVideo: '/images/ecommerce-pingpong.mp4',
    images: ['/images/ecommerce.jpg', '/images/ecommerce-detail.jpg', '/images/tea.jpg'],
    tags: {
      zh: ['电商主图', '详情页', '商品摄影排版'],
      en: ['Main image', 'PDP', 'Product layout'],
    },
    summary: {
      zh: '覆盖养生茶、快消零食、香氛与服装详情：主图促销层级与移动端细节模块并置，强调货架点击与下滑阅读。',
      en: 'Tea, FMCG, fragrance and apparel: promotional main images paired with mobile detail modules built for scan-and-scroll shopping.',
    },
    process: {
      zh: ['主图促销层级', '详情模块分镜', '面料与卖点切页'],
      en: ['Promo hierarchy', 'Module storyboard', 'Fabric and benefit cuts'],
    },
  },
  {
    slug: 'carving-series',
    featured: true,
    directoryDetached: true,
    index: '06',
    year: '2025',
    category: { zh: '雕刻', en: 'Carving' },
    title: { zh: '雕刻系列作品', en: 'Carving series' },
    directoryTitle: { zh: '雕刻系列作品', en: 'Carving series' },
    directoryCategory: { zh: '玉石珠宝/古玩艺术品/手工', en: 'Jade jewelry / Antiques / Handmade' },
    subtitle: { zh: '玉石珠宝与古玩艺术品', en: 'Jade jewelry and antique works' },
    cover: '',
    images: [],
    tags: {
      zh: ['玉石', '珠宝', '古玩'],
      en: ['Jade', 'Jewelry', 'Antiques'],
    },
    summary: {
      zh: '玉石珠宝与古玩艺术品的雕刻系列，与上方商业设计条目分开陈列。',
      en: 'A carving series of jade jewelry and antiques, shown apart from the commercial design entries above.',
    },
    process: {
      zh: ['题材筛选', '雕刻与打磨', '成品质感呈现'],
      en: ['Subject selection', 'Carve and polish', 'Finish presentation'],
    },
  },
]

export const archiveExtras = [
  {
    id: 'snow',
    cover: '/images/snow-lake.jpg',
    title: { zh: '雪山湖 · 速涂', en: 'Snow Lake · Speed paint' },
    category: { zh: '绘画', en: 'Illustration' },
  },
  {
    id: 'vector',
    cover: '/images/vector.jpg',
    title: { zh: '矢量头像与风景', en: 'Vector portraits & landscape' },
    category: { zh: '绘画', en: 'Illustration' },
  },
  {
    id: 'thick',
    cover: '/images/thick-paint.jpg',
    title: { zh: '伪厚涂人物风景', en: 'Impasto characters' },
    category: { zh: '绘画', en: 'Illustration' },
  },
]

export const chips = [
  { zh: '插画', en: 'Illustration' },
  { zh: '包装', en: 'Packaging' },
  { zh: '平面', en: 'Graphic' },
  { zh: '电商视觉', en: 'E-commerce' },
  { zh: '品牌识别', en: 'Identity' },
  { zh: 'IP 角色', en: 'Character IP' },
]
