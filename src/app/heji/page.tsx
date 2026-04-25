'use client'

import React, { useState } from 'react'
import { Row, Col, Typography, Breadcrumb, Pagination } from 'antd'
import { HomeOutlined, FolderOutlined } from '@ant-design/icons'
import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import RandomRecommend from '@/components/RandomRecommend'
import { CardGridSkeleton } from '@/components/Skeleton'
import { useCollections } from '@/lib/hooks'
import type { PhotoCollection } from '@/lib/types'

const { Title, Text } = Typography

const randomRecommendations = [
  { title: '爱莉希雅女仆', source: '幼愛youmeko', date: '2025-03-28', url: '/5251.html' },
  { title: '微密圈写真&视频合集', source: '九头蛇', date: '2023-09-08', url: '/1140.html' },
  { title: '婚前最后一夜&Eleven', source: '咬一口兔娘', date: '2025-10-24', url: '/56023.html' },
  { title: '女社长', source: '轩萧学姐', date: '2023-05-05', url: '/20222.html' },
  { title: '小兔子乖乖', source: '果团网', date: '2022-11-22', url: '/31427.html' },
]

export default function HejiPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [searchType, setSearchType] = useState<'single' | 'full'>('full')
  const [orgFilter, setOrgFilter] = useState('')

  const { data: collections, loading, count } = useCollections({
    page,
    pageSize,
    type: searchType,
    orderBy: 'views_count',
    orderDir: 'desc',
  })

  const filteredCollections = React.useMemo(() => {
    if (!orgFilter) return collections
    return collections.filter(c =>
      c.title?.includes(orgFilter) ||
      c.subtitle?.includes(orgFilter)
    )
  }, [collections, orgFilter])

  const showSkeleton = loading || collections.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <span className="text-white">合集打包</span> },
            ]}
          />
          <Title level={2} className="!mb-2 !text-white">
            <FolderOutlined className="mr-2" />
            合集打包
          </Title>
          <p className="text-white/80">模特写真图片合集，持续更新中</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          {/* Collection Grid */}
          <Col xs={24} lg={18}>
            {/* Toggle + Info bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm flex items-center gap-3">
              <div className="page-type-toggle">
                <button
                  className={`page-type-btn ${searchType === 'single' ? 'active' : ''}`}
                  onClick={() => { setSearchType('single'); setPage(1); }}
                >
                  单套
                </button>
                <button
                  className={`page-type-btn ${searchType === 'full' ? 'active' : ''}`}
                  onClick={() => { setSearchType('full'); setPage(1); }}
                >
                  全套
                </button>
              </div>
              <Text className="text-gray-500 text-sm">合集打包</Text>
            </div>

            {showSkeleton ? (
              <Row gutter={[16, 16]}>
                <CardGridSkeleton count={12} type="collection" />
              </Row>
            ) : filteredCollections.length > 0 ? (
              <>
                {/* Featured Collections */}
                <div className="mb-8">
                  <Title level={4} className="mb-4 flex items-center">
                    <span className="w-1 h-6 bg-pink-500 mr-2"></span>
                    热门合集
                  </Title>
                  <Row gutter={[16, 16]}>
                    {filteredCollections.slice(0, 4).map((collection: PhotoCollection) => (
                      <Col key={collection.id} xs={12} sm={8} md={6} lg={4}>
                        <CollectionCard
                          id={String(collection.id)}
                          title={collection.title}
                          category={collection.type === 'full' ? '全套合集' : '单套'}
                          thumbnail={collection.thumbnail_url || 'https://picsum.photos/400/400?random=collection'}
                          status={collection.type === 'full' ? '持续更新中' : '已完结'}
                          views={collection.views_count}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* More Collections */}
                {filteredCollections.length > 4 && (
                  <div>
                    <Title level={4} className="mb-4 flex items-center">
                      <span className="w-1 h-6 bg-purple-500 mr-2"></span>
                      更多合集
                    </Title>
                    <Row gutter={[16, 16]}>
                      {filteredCollections.slice(4).map((collection: PhotoCollection) => (
                        <Col key={collection.id} xs={12} sm={8} md={6} lg={4}>
                          <CollectionCard
                            id={String(collection.id)}
                            title={collection.title}
                            category={collection.type === 'full' ? '全套合集' : '单套'}
                            thumbnail={collection.thumbnail_url || 'https://picsum.photos/400/400?random=collection'}
                            status={collection.type === 'full' ? '持续更新中' : '已完结'}
                            views={collection.views_count}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {/* Pagination */}
                {count > pageSize && (
                  <div className="text-center mt-8">
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={count}
                      onChange={setPage}
                      showSizeChanger={false}
                      showTotal={(total) => `共 ${total} 条`}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">暂无数据</div>
            )}
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={6}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Title level={4} className="mb-4">随机推荐</Title>
              <div className="space-y-2">
                {randomRecommendations.map((item, index) => (
                  <RandomRecommend
                    key={index}
                    title={item.title}
                    source={item.source}
                    date={item.date}
                    url={item.url}
                  />
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
