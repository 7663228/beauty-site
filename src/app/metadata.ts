import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: {
    default: '秀人网 - 专业模特写真社区',
    template: '%s | 秀人网'
  },
  description: '专业模特写真社区，汇聚高清作品、写真合集、打包精选！',
  keywords: ['写真', '模特', '图片', '视频', 'cosplay', '网红', '秀人网'],
  authors: [{ name: '秀人网' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '秀人网',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
