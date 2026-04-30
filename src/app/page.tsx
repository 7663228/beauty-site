'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Row, Col, Card, Typography, Space } from 'antd'
import { RightOutlined, FireOutlined, ThunderboltOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PhotoCard from '@/components/PhotoCard'
import FeaturedCard from '@/components/FeaturedCard'
import RandomRecommend from '@/components/RandomRecommend'
import { CardGridSkeleton } from '@/components/Skeleton'
import {
  useLatestCollections,
  useHotCollections,
  useHotCelebrities,
  useFullCollections,
} from '@/lib/hooks'
import type { Celebrity, PhotoCollection } from '@/lib/types'

const { Title, Text } = Typography

const heroSlides = [
  {
    title: '秀人网周年庆活动',
    subtitle: '永久会员只要68元，全站资源免费下载',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    title: '海量高清写真资源',
    subtitle: '50000G+ 优质内容持续更新',
    gradient: 'from-purple-400 to-indigo-500',
  },
  {
    title: '精选优质模特',
    subtitle: '每日更新，精彩不断',
    gradient: 'from-orange-400 to-red-500',
  },
]

function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroSlides.length)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [mounted, next])

  const slide = heroSlides[current]

  if (!mounted) {
    return (
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center" style={{ height: '320px' }}>
        <div className="text-center">
          <Title level={2} className="text-white !mb-2">{slide.title}</Title>
          <Text className="text-white/90 text-lg">{slide.subtitle}</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height: '320px' }}>
      <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${slide.gradient}`}>
        <div className="text-center">
          <Title level={2} className="text-white !mb-2">{slide.title}</Title>
          <Text className="text-white/90 text-lg">{slide.subtitle}</Text>
        </div>
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

const randomRecommendations = [
  { title: '平心静气 佳佳', source: 'YALAYI雅拉伊', date: '2023-01-09', url: '/27512.html' },
  { title: '豆瓣酱', source: 'Xiuren秀人网', date: '2023-05-17', url: '/19871.html' },
  { title: '学院兔女郎', source: 'miko酱ww', date: '2025-12-04', url: '/56978.html' },
  { title: '芝芝Booty', source: 'XIUREN秀人网', date: '2022-12-28', url: '/28036.html' },
  { title: '玫瑰的来信 natasha', source: 'Ugirls尤果网', date: '2025-01-17', url: '/5833.html' },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`
  return views.toString()
}

export default function HomePage() {
  const { data: latestCollections, loading: loadingLatest } = useLatestCollections(20)
  const { data: hotCollections, loading: loadingHot } = useHotCollections(10)
  const { data: celebrities, loading: loadingCelebrities } = useHotCelebrities(8)
  const { data: fullCollections, loading: loadingFull } = useFullCollections(1, 6)

  console.log('[DEBUG] latestCollections:', latestCollections?.length, latestCollections?.slice(0,2))
  console.log('[DEBUG] hotCollections:', hotCollections?.length, hotCollections?.slice(0,2))
  console.log('[DEBUG] celebrities:', celebrities?.length)
  console.log('[DEBUG] fullCollections:', fullCollections?.length, fullCollections?.slice(0,2))

  const loading = loadingLatest || loadingHot || loadingCelebrities || loadingFull

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Carousel */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Hero carousel — takes 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <HeroCarousel />
            </div>
            {/* Hot celebrities sidebar — always in DOM to reserve space, content toggled separately */}
            <div className="hidden lg:block">
              <div className="space-y-3">
                <Title level={4} className="text-white !mb-2 flex items-center">
                  <ThunderboltOutlined className="mr-2" />
                  热门模特
                </Title>
                <div
                  className="grid grid-cols-2 gap-2"
                  style={{ minHeight: '320px' }}
                >
                  {loadingCelebrities ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-white/10 border border-white/20">
                        <div className="aspect-square bg-white/20" />
                        <div className="text-center p-2">
                          <div className="h-4 bg-white/20 rounded mx-auto w-2/3" />
                          <div className="h-2 bg-white/20 rounded mx-auto w-1/2 mt-1" />
                        </div>
                      </div>
                    ))
                  ) : celebrities.length > 0 ? (
                    celebrities.slice(0, 4).map((model: Celebrity) => (
                      <Link key={model.id} href={`/celebrity/${model.id}`}>
                        <div className="rounded-lg overflow-hidden bg-white/10 border border-white/20 h-full">
                          <div className="overflow-hidden">
                            <img
                              src={model.avatar_url || 'https://picsum.photos/300/400?random=model'}
                              alt={model.name}
                              className="aspect-square object-cover w-full transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div className="text-center p-2">
                            <span className="text-white text-sm font-semibold block">{model.name}</span>
                            <span className="text-white/70 text-xs">{model.category || '写真合集'}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-white/10 rounded-lg" />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Title level={3} className="!mb-0 flex items-center">
            <FireOutlined className="text-orange-500 mr-2" />
            秀人网最新更新
          </Title>
          <Link href="/dantao" className="text-pink-500 hover:text-pink-600 flex items-center">
            查看更多 <RightOutlined />
          </Link>
        </div>
        {loadingLatest ? (
          <Row gutter={[16, 16]}>
            <CardGridSkeleton count={8} type="photo" />
          </Row>
        ) : latestCollections.length > 0 ? (
          <Row gutter={[16, 16]}>
            {latestCollections.slice(0, 8).map((photo: PhotoCollection) => (
              <Col key={photo.id} xs={12} sm={8} md={6} lg={4}>
                <PhotoCard
                  id={String(photo.id)}
                  title={photo.title}
                  thumbnail={photo.thumbnail_url || 'https://picsum.photos/300/400?random=default'}
                  date={formatDate(photo.publish_date)}
                  views={photo.views_count}
                  downloads={photo.downloads_count}
                  count={photo.image_count}
                  size={photo.file_size || undefined}
                  no={photo.source_no || undefined}
                  showDetails={true}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        )}
      </section>

      {/* Other Sources */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <Title level={3} className="mb-6">热门单套</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              {loadingHot ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Col key={i} xs={12} sm={8} md={6} lg={8}>
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </Col>
                ))
              ) : hotCollections.slice(0, 6).map((item: PhotoCollection) => (
                <Col key={item.id} xs={12} sm={8} md={6} lg={8}>
                  <PhotoCard
                    id={String(item.id)}
                    title={item.title}
                    subtitle={item.subtitle || undefined}
                    thumbnail={item.thumbnail_url || 'https://picsum.photos/300/400?random=hot'}
                    count={item.image_count}
                    videos={item.video_count}
                    size={item.file_size || undefined}
                    showDetails={false}
                  />
                </Col>
              ))}
            </Row>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="随机推荐" className="h-full">
              <Space orientation="vertical" className="w-full" size={[0, 8]}>
                {randomRecommendations.map((item, index) => (
                  <RandomRecommend
                    key={index}
                    title={item.title}
                    source={item.source}
                    date={item.date}
                    url={item.url}
                  />
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Featured Collections */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Title level={3} className="!mb-0">精选合集</Title>
          <Link href="/heji" className="text-pink-500 hover:text-pink-600 flex items-center">
            查看更多 <RightOutlined />
          </Link>
        </div>
        {loadingFull ? (
          <Row gutter={[16, 16]}>
            <CardGridSkeleton count={6} type="featured" />
          </Row>
        ) : fullCollections.length > 0 ? (
          <Row gutter={[16, 16]}>
            {fullCollections.map((collection: PhotoCollection) => (
              <Col key={collection.id} xs={12} sm={8} md={6} lg={4}>
                <FeaturedCard
                  id={String(collection.id)}
                  title={collection.title}
                  thumbnail={collection.thumbnail_url || 'https://picsum.photos/300/400?random=collection'}
                  subtitle={collection.celebrity_id ? `${collection.image_count}P` : undefined}
                  count={collection.image_count}
                  isNew={true}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        )}
      </section>

      {/* VIP Promotion Banner */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Title level={2} className="text-white !mb-4">限时特惠</Title>
          <p className="text-xl mb-6">永久会员仅需 <span className="text-3xl font-bold">68元</span>，随时恢复原价198</p>
          <p className="text-white/80 mb-8">全站资源全部免费下载（无二次收费），早买早享受</p>
          <Link href="/zhinan">
            <span className="inline-block bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              了解详情
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
