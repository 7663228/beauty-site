export interface Photo {
  id: string
  title: string
  category?: string
  images: string[]
  thumbnail: string
  date: string
  views: number
  downloads: number
  size: string
  no?: string
  count: number
  source?: string
  description?: string
  tags?: string[]
  prevId?: string
  nextId?: string
}

export const mockPhotos: Photo[] = [
  {
    id: '1',
    title: '金允希Yuki',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 32 }, (_, i) => `https://picsum.photos/800/1200?random=1-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.12',
    views: 1234,
    downloads: 567,
    size: '889.31MB',
    no: '10762',
    count: 66,
    source: 'Xiuren秀人网',
    description: '金允希Yuki最新写真作品，柔美的光线与精致的妆容完美结合，展现出东方女性独特的魅力与气质。每一张照片都如同艺术品般精致，值得细细品味。',
    tags: ['金允希', 'Yuki', 'Xiuren秀人网', '写真', '模特'],
    prevId: undefined,
    nextId: '2',
  },
  {
    id: '2',
    title: '南乔',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 28 }, (_, i) => `https://picsum.photos/800/1200?random=2-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.12',
    views: 2345,
    downloads: 678,
    size: '880.29MB',
    no: '10761',
    count: 74,
    source: 'Xiuren秀人网',
    description: '南乔的全新写真集，融合了现代时尚与传统美学的精华。这组作品以独特的视角捕捉了女性的优雅与自信，无论是室内棚拍还是户外取景，都展现出了极高的专业水准。',
    tags: ['南乔', 'Xiuren秀人网', '写真', '时尚'],
    prevId: '1',
    nextId: '3',
  },
  {
    id: '3',
    title: '妲己_Toxic',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 24 }, (_, i) => `https://picsum.photos/800/1200?random=3-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.12',
    views: 3456,
    downloads: 789,
    size: '637.44MB',
    no: '10760',
    count: 66,
    source: 'Xiuren秀人网',
    description: '妲己_ToxicCosplay系列作品，完美还原了经典角色的魅力。精致的服装道具与专业的摄影技术相结合，为您呈现一场视觉盛宴。',
    tags: ['妲己', 'Toxic', 'Cosplay', 'Xiuren秀人网', '写真'],
    prevId: '2',
    nextId: '4',
  },
  {
    id: '4',
    title: '小肉肉咪',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 30 }, (_, i) => `https://picsum.photos/800/1200?random=4-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.12',
    views: 4567,
    downloads: 890,
    size: '730.50MB',
    no: '10759',
    count: 67,
    source: 'Xiuren秀人网',
    description: '小肉肉咪甜蜜风格写真，清新自然的妆容与可爱的造型相得益彰。这组作品捕捉了最真实的表情与瞬间，展现出少女的青春活力。',
    tags: ['小肉肉咪', 'Xiuren秀人网', '写真', '可爱'],
    prevId: '3',
    nextId: '5',
  },
  {
    id: '5',
    title: '烧烧小桃',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 20 }, (_, i) => `https://picsum.photos/800/1200?random=5-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.12',
    views: 5678,
    downloads: 901,
    size: '582.37MB',
    no: '10758',
    count: 47,
    source: 'Xiuren秀人网',
    description: '烧烧小桃全新力作，独特的个人风格贯穿整个写真集。妩媚与清纯的矛盾美感，被镜头完美定格。',
    tags: ['烧烧小桃', 'Xiuren秀人网', '写真', '妩媚'],
    prevId: '4',
    nextId: '6',
  },
  {
    id: '6',
    title: '陆萱萱',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 26 }, (_, i) => `https://picsum.photos/800/1200?random=6-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.11',
    views: 6789,
    downloads: 1012,
    size: '711.19MB',
    no: '10757',
    count: 74,
    source: 'Xiuren秀人网',
    description: '陆萱萱最新写真作品，精致的画面构图与完美的光线运用，每一帧都是艺术的呈现。高品质的后期制作确保了最佳的观看体验。',
    tags: ['陆萱萱', 'Xiuren秀人网', '写真', '精致'],
    prevId: '5',
    nextId: '7',
  },
  {
    id: '7',
    title: '尹甜甜',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 22 }, (_, i) => `https://picsum.photos/800/1200?random=7-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.11',
    views: 7890,
    downloads: 1123,
    size: '736.54MB',
    no: '10756',
    count: 61,
    source: 'Xiuren秀人网',
    description: '尹甜甜写真合集，展现了多变的造型与风格。从甜美到性感，从清新到成熟，每一面都是独特的美。',
    tags: ['尹甜甜', 'Xiuren秀人网', '写真', '多风格'],
    prevId: '6',
    nextId: '8',
  },
  {
    id: '8',
    title: '汐汐爱吃草莓',
    category: 'Xiuren秀人网',
    images: Array.from({ length: 25 }, (_, i) => `https://picsum.photos/800/1200?random=8-${i + 1}`),
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    date: '2025.09.11',
    views: 8901,
    downloads: 1234,
    size: '549.35MB',
    no: '10755',
    count: 59,
    source: 'Xiuren秀人网',
    description: '汐汐爱吃草莓主题写真，以草莓为灵感创作的一系列精美作品。粉嫩清新的色调与可爱的造型，让人眼前一亮。',
    tags: ['汐汐爱吃草莓', 'Xiuren秀人网', '写真', '可爱', '清新'],
    prevId: '7',
    nextId: undefined,
  },
]

export const mockCollections = [
  {
    id: 'c1',
    title: '蠢沫沫',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 12345,
  },
  {
    id: 'c2',
    title: '雨波_HaneAme',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 23456,
  },
  {
    id: 'c3',
    title: '日本@Byoru',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 34567,
  },
  {
    id: 'c4',
    title: 'rioko凉凉子',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 45678,
  },
  {
    id: 'c5',
    title: 'yuuhui玉汇',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 56789,
  },
  {
    id: 'c6',
    title: '日奈娇',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 67890,
  },
  {
    id: 'c7',
    title: '桜桃喵',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 78901,
  },
  {
    id: 'c8',
    title: '白银81',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 89012,
  },
  {
    id: 'c9',
    title: '小仓千代w',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 90123,
  },
  {
    id: 'c10',
    title: '过期米线线喵',
    category: '写真图片合集',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    status: '持续更新中',
    views: 101234,
  },
]

export const mockSingleSets = [
  {
    id: 's1',
    title: '安然anran',
    subtitle: '安然anran NO.001 &陆萱萱 内购无水印 双人演绎磨豆腐原图+隐藏花絮图 [100P1.1GB]',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=anran',
    count: '100p',
    videos: 10,
    size: '1.1GB',
  },
  {
    id: 's2',
    title: '安然anran',
    subtitle: 'NO.34 莫加多尔护士',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=anran2',
    count: 23,
    videos: 0,
    size: '107MB',
  },
  {
    id: 's3',
    title: '安然anran',
    subtitle: 'NO.170 中华娘',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=anran3',
    count: 22,
    videos: 0,
    size: '239MB',
  },
  {
    id: 's4',
    title: '安然anran',
    subtitle: 'BNO.20 甜心小熊',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=anran4',
    count: 47,
    videos: 2,
    size: '351MB',
  },
  {
    id: 's5',
    title: '奈汐酱nice',
    subtitle: 'BNO.22 探春',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    count: 79,
    videos: 0,
    size: '715MB',
  },
  {
    id: 's6',
    title: '糖果果Candy',
    subtitle: '舰长图 2023.03 户外校服',
    category: 'single',
    thumbnail: 'https://picsum.photos/300/400?random=luxuanxuan',
    count: 142,
    videos: 1,
    size: '1.07G',
  },
]

export function getPhotoById(id: string): Photo | undefined {
  const photo = mockPhotos.find((p) => p.id === id)
  if (photo) return photo

  const singleSet = mockSingleSets.find((s) => s.id === id)
  if (singleSet) {
    return {
      id: singleSet.id,
      title: singleSet.title,
      images: Array.from({ length: singleSet.count as number }, (_, i) =>
        singleSet.thumbnail !== '/placeholder.jpg' && singleSet.thumbnail.startsWith('http')
          ? singleSet.thumbnail
          : `https://picsum.photos/800/1200?random=${id}-${i + 1}`
      ),
      thumbnail: singleSet.thumbnail,
      date: '2025.09.12',
      views: Math.floor(Math.random() * 5000) + 500,
      downloads: Math.floor(Math.random() * 1000) + 100,
      size: singleSet.size,
      count: singleSet.count as number,
      source: 'Xiuren秀人网',
      description: `${singleSet.title}最新写真作品 - ${singleSet.subtitle}`,
      tags: [singleSet.title, 'Xiuren秀人网', '写真'],
    }
  }

  return undefined
}

export function getRelatedPhotos(currentId: string, limit: number = 4): Photo[] {
  const allPhotos = [...mockPhotos]
  const shuffled = allPhotos.sort(() => 0.5 - Math.random())
  return shuffled.filter((p) => p.id !== currentId).slice(0, limit)
}
