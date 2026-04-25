'use client'

import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Breadcrumb, Spin, Card, Avatar, Badge, Tabs, message } from 'antd'
import { HomeOutlined, PictureOutlined, DownloadOutlined, LockOutlined, CrownOutlined, LoadingOutlined, EyeOutlined, DownCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PhotoCard from '@/components/PhotoCard'
import FeaturedCard from '@/components/FeaturedCard'
import { useCelebrity, useCelebrityCollections } from '@/lib/hooks'
import type { Celebrity, PhotoCollection } from '@/lib/types'

const { Title, Text, Paragraph } = Typography

interface ModelPageProps {
  params: Promise<{ id: string }>
}

export default function ModelDetailPage({ params }: ModelPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [activeTab, setActiveTab] = useState('works')

  // 解析params
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  const modelId = resolvedParams?.id ? parseInt(resolvedParams.id) : null

  const { data: celebrity, loading: loadingCelebrity } = useCelebrity(modelId)
  const { data: collections, loading: loadingCollections, count } = useCelebrityCollections(modelId, { pageSize: 100 })

  // 分离单套和全套
  const singleCollections = collections.filter((c) => c.type === 'single')
  const fullCollections = collections.filter((c) => c.type === 'full')

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#ec4899' }} spin />} />
      </div>
    )
  }

  if (loadingCelebrity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Text className="text-xl">模特不存在</Text>
          <br />
          <Link href="/" className="text-pink-500 hover:text-pink-600">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Model Info */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <Link href={`/xiuren/${celebrity.category?.toLowerCase().replace(/\s+/g, '-')}`} className="text-white/80 hover:text-white">{celebrity.category}</Link> },
              { title: <span className="text-white">{celebrity.name}</span> },
            ]}
          />
          <Row gutter={32} align="middle">
            <Col>
              <Avatar
                src={celebrity.avatar_url || `https://picsum.photos/200/200?random=${celebrity.id}`}
                size={120}
                className="border-4 border-white/30"
              />
            </Col>
            <Col flex={1}>
              <div className="flex items-center gap-3 mb-2">
                <Title level={2} className="!mb-0 !text-white">
                  {celebrity.name}
                </Title>
                {celebrity.is_verified && (
                  <Badge
                    count={
                      <span className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                        <CrownOutlined /> 认证
                      </span>
                    }
                  />
                )}
              </div>
              {celebrity.alias && (
                <Text className="text-white/70 block mb-2">{celebrity.alias}</Text>
              )}
              <div className="flex items-center gap-6 text-white/80">
                <span><EyeOutlined /> {celebrity.total_views?.toLocaleString() || 0} 浏览</span>
                <span><PictureOutlined /> {celebrity.total_collections || collections.length} 套作品</span>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="bg-white dark:bg-gray-800 rounded-lg p-4"
              items={[
                {
                  key: 'works',
                  label: `全部作品 (${collections.length})`,
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        {collections.map((item: PhotoCollection) => (
                          <Col key={item.id} xs={12} sm={12} md={8} lg={8}>
                            <PhotoCard
                              id={String(item.id)}
                              title={item.title}
                              subtitle={item.subtitle || undefined}
                              thumbnail={item.thumbnail_url || 'https://picsum.photos/300/400?random=default'}
                              count={item.image_count}
                              videos={item.video_count}
                              size={item.file_size || undefined}
                              showDetails={true}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ),
                },
                {
                  key: 'single',
                  label: `单套写真 (${singleCollections.length})`,
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        {singleCollections.map((item: PhotoCollection) => (
                          <Col key={item.id} xs={12} sm={12} md={8} lg={8}>
                            <PhotoCard
                              id={String(item.id)}
                              title={item.title}
                              subtitle={item.subtitle || undefined}
                              thumbnail={item.thumbnail_url || 'https://picsum.photos/300/400?random=default'}
                              count={item.image_count}
                              videos={item.video_count}
                              size={item.file_size || undefined}
                              showDetails={true}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ),
                },
                {
                  key: 'full',
                  label: `全套合集 (${fullCollections.length})`,
                  children: (
                    <div>
                      <Row gutter={[16, 16]}>
                        {fullCollections.map((item: PhotoCollection) => (
                          <Col key={item.id} xs={12} sm={12} md={8} lg={8}>
                            <FeaturedCard
                              id={String(item.id)}
                              title={item.title}
                              thumbnail={item.thumbnail_url || 'https://picsum.photos/300/400?random=default'}
                              subtitle={item.subtitle || undefined}
                              count={item.image_count}
                              isNew={true}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ),
                },
              ]}
            />
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            {/* Model Info Card */}
            <Card className="mb-4">
              <Title level={5}>模特简介</Title>
              <Paragraph className="text-gray-600 dark:text-gray-300">
                {celebrity.description || '暂无简介'}
              </Paragraph>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">来源</Text>
                    <br />
                    <Text strong>{celebrity.category || '未知'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">人气指数</Text>
                    <br />
                    <Text strong>{celebrity.popularity_score?.toLocaleString() || 0}</Text>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* VIP Download Section */}
            <Card className="border-pink-200 dark:border-pink-800">
              <div className="text-center mb-4">
                <LockOutlined className="text-4xl text-pink-500 mb-2" />
                <Title level={4} className="!mb-2">VIP专属下载</Title>
                <Text type="secondary" className="block">
                  成为VIP会员，解锁全部下载链接
                </Text>
              </div>

              {/* Full Collection Download */}
              {fullCollections.length > 0 && (
                <div className="mb-4">
                  <Title level={5} className="flex items-center gap-2">
                    <CrownOutlined className="text-yellow-500" />
                    全套合集下载
                  </Title>
                  <div className="space-y-2">
                    {fullCollections.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Text strong className="truncate flex-1">{item.title}</Text>
                          <Badge count={`${item.image_count}P+${item.video_count}V`} style={{ fontSize: 10 }} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{item.file_size}</span>
                          <span><DownCircleOutlined /> {item.downloads_count}</span>
                        </div>
                        <DownloadButton collectionId={item.id} title={item.title} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Collection Downloads */}
              {singleCollections.length > 0 && (
                <div className="mb-4">
                  <Title level={5} className="flex items-center gap-2">
                    <DownloadOutlined className="text-pink-500" />
                    单套作品下载
                  </Title>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {singleCollections.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <Text className="text-sm truncate flex-1">{item.title}</Text>
                          <Text type="secondary" className="text-xs ml-2">{item.image_count}P</Text>
                        </div>
                        <DownloadButton collectionId={item.id} title={item.title} small />
                      </div>
                    ))}
                  </div>
                  {singleCollections.length > 10 && (
                    <Text type="secondary" className="block text-center mt-2">
                      还有 {singleCollections.length - 10} 套作品...
                    </Text>
                  )}
                </div>
              )}

              {/* VIP Promotion */}
              <div className="mt-4 p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg text-white text-center">
                <Title level={5} className="!text-white !mb-2">
                  开通VIP会员
                </Title>
                <Text className="text-white/80 block mb-3">
                  全站资源免费下载，无二次收费
                </Text>
                <Link
                  href="/vip"
                  className="inline-block px-6 py-2 bg-white text-pink-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  立即开通
                </Link>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

// Download Button Component
function DownloadButton({ collectionId, title, small = false }: { collectionId: number; title: string; small?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [showTip, setShowTip] = useState(false)

  const handleDownload = async () => {
    // 这里应该检查用户VIP状态
    // 暂时显示提示
    setShowTip(true)
    setTimeout(() => setShowTip(false), 3000)
  }

  if (showTip) {
    return (
      <div className="text-xs text-center py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded">
        请先开通VIP会员
      </div>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white rounded transition-colors
        ${small ? 'py-1 text-xs' : 'py-2 text-sm'}
      `}
    >
      {loading ? (
        <Spin size="small" />
      ) : (
        <>
          <LockOutlined />
          {small ? 'VIP下载' : 'VIP会员专享下载'}
        </>
      )}
    </button>
  )
}
