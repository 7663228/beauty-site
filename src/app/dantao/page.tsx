'use client'

import React, { useState } from 'react'
import { Row, Col, Typography, Breadcrumb, Select, Space, Pagination } from 'antd'
import { HomeOutlined, PictureOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PhotoCard from '@/components/PhotoCard'
import RandomRecommend from '@/components/RandomRecommend'
import { CardGridSkeleton } from '@/components/Skeleton'
import { useCollections } from '@/lib/hooks'
import type { PhotoCollection } from '@/lib/types'

const { Title, Text } = Typography

const randomRecommendations = [
  { title: '刘钰儿', source: 'YouMi尤蜜荟', date: '2023-06-25', url: '/19416.html' },
  { title: '看病', source: '鱼子酱Fish', date: '2024-08-04', url: '/10589.html' },
  { title: '圣女 吊带黑丝', source: '五更百鬼', date: '2023-01-08', url: '/27641.html' },
  { title: 'Ada Wong Nurse', source: 'PingPing', date: '2022-05-06', url: '/35261.html' },
  { title: '绑带胶衣', source: '微密圈小玉吃果冻', date: '2023-10-07', url: '/17514.html' },
]

const orderOptions = [
  { value: 'publish_date', label: '最新发布' },
  { value: 'views_count', label: '最多浏览' },
  { value: 'downloads_count', label: '最多下载' },
]

export default function DantaoPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [orderBy, setOrderBy] = useState('publish_date')
  const [searchType, setSearchType] = useState<'single' | 'full'>('single')
  const [orgFilter, setOrgFilter] = useState('')

  const { data: collections, loading, count } = useCollections({
    page,
    pageSize,
    orderBy,
    orderDir: 'desc',
    type: searchType,
  })

  // Filter by organization name
  const filteredCollections = React.useMemo(() => {
    if (!orgFilter) return collections
    return collections.filter(c =>
      c.title?.includes(orgFilter) ||
      c.subtitle?.includes(orgFilter)
    )
  }, [collections, orgFilter])

  const handleOrderChange = (value: string) => {
    setOrderBy(value)
    setPage(1)
  }

  // Show skeleton on first load and pagination loads
  const showSkeleton = loading || collections.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <span className="text-white">精选单套</span> },
            ]}
          />
          <Title level={2} className="!mb-2 !text-white">
            <PictureOutlined className="mr-2" />
            单套图集
          </Title>
          <Text className="text-white/80">精选优质单套写真作品</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          {/* Photo Grid */}
          <Col xs={24} lg={18}>
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
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
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
                <Space wrap>
                  <Text className="text-gray-600 dark:text-gray-300">排序：</Text>
                  <Select
                    value={orderBy}
                    onChange={handleOrderChange}
                    style={{ width: 120 }}
                    options={orderOptions}
                  />
                </Space>
              </div>
            </div>

            {/* Photo Grid */}
            {showSkeleton ? (
              <Row gutter={[16, 16]}>
                <CardGridSkeleton count={12} type="photo" />
              </Row>
            ) : filteredCollections.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {filteredCollections.map((item: PhotoCollection) => (
                    <Col key={item.id} xs={12} sm={12} md={8} lg={6}>
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
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
