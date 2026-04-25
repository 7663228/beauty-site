'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Row, Col, Typography, Breadcrumb, Spin, Pagination } from 'antd'
import { HomeOutlined, PictureOutlined, LoadingOutlined, SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PhotoCard from '@/components/PhotoCard'
import { useCollections } from '@/lib/hooks'
import type { PhotoCollection } from '@/lib/types'

const { Title, Text } = Typography

// 秀人网内购分类数据（与参考网站一致）
const xiurenCategories = [
  { label: 'A - 秀人内购', href: '/xiuren/xiu-ren-nei-gou/' },
  { label: 'A – 秀人内购【合集】', href: '/xiuren/xiu-ren-nei-gou-heji/' },
  { label: 'BoLoLi波萝社', href: '/xiuren/bololi-polo/' },
  { label: 'CANDY糖果画报', href: '/xiuren/candy/' },
  { label: 'CANDY网红馆', href: '/xiuren/candy-net-red/' },
  { label: 'DKGirl御女郎', href: '/xiuren/dkgirl-royal-girl/' },
  { label: 'FEILIN嗲囡囡', href: '/xiuren/feilin-sweet-girl/' },
  { label: 'HUAYANG花漾', href: '/xiuren/huayang/' },
  { label: 'HUAYAN花の颜', href: '/xiuren/huayan/' },
  { label: 'IMISS爱蜜社', href: '/xiuren/imiss-love-honey/' },
  { label: 'LeYuan星乐园', href: '/xiuren/leyuan-star/' },
  { label: 'MFStar模范学院', href: '/xiuren/mfstar-model/' },
  { label: 'MiCat猫萌榜', href: '/xiuren/micat-cat-cute/' },
  { label: 'MiiTao蜜桃社', href: '/xiuren/miitao-peach-club/' },
  { label: 'MintYe薄荷叶', href: '/xiuren/mintye-mint-leaf/' },
  { label: 'MiStar魅妍社', href: '/xiuren/mistar-meiyan/' },
  { label: 'MTMeng模特联盟', href: '/xiuren/mtmeng-model/' },
  { label: 'MyGirl美媛馆', href: '/xiuren/mygirl-meiyuan/' },
  { label: 'RuiSG瑞丝馆', href: '/xiuren/ruisg-ruisi-museum/' },
  { label: 'TASTE顽味生活', href: '/xiuren/taste-life/' },
  { label: 'Tukmo兔几盟', href: '/xiuren/tukmo-rabbit/' },
  { label: 'UXING优星馆', href: '/xiuren/uxing-youxing/' },
  { label: 'WingS影私荟', href: '/xiuren/wings-private/' },
  { label: 'XIAOYU语画界', href: '/xiuren/x-y-h-j/' },
  { label: 'XINGYAN星颜社', href: '/xiuren/xingyan/' },
  { label: 'XIUREN秀人网', href: '/xiuren/xiuren-xiu-ren-wang/' },
  { label: 'YOUMI尤蜜荟', href: '/xiuren/youmi-youmi/' },
  { label: 'YouWu尤物馆', href: '/xiuren/youwu-museum/' },
  { label: '内部套图', href: '/xiuren/nei-bu-tao-tu/' },
]

// 默认显示的分类数量
const DEFAULT_VISIBLE_COUNT = 8

export default function XiurenNeigouHejiPage() {
  const pathname = usePathname()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [showAllCategories, setShowAllCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const { data: collections, loading, count } = useCollections({
    page,
    pageSize,
    type: selectedCategory ? undefined : 'full',
    category: selectedCategory || undefined,
  })

  const visibleCategories = showAllCategories
    ? xiurenCategories
    : xiurenCategories.slice(0, DEFAULT_VISIBLE_COUNT)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <Link href="/xiuren/" className="text-white/80 hover:text-white">秀人摄影</Link> },
              { title: <span className="text-white">秀人内购【合集】</span> },
            ]}
          />
          <Title level={2} className="!mb-2 !text-white">
            <PictureOutlined className="mr-2" />
            秀人内购【合集】
          </Title>
          <Text className="text-white/80">精选模特写真内购合集打包，持续更新中</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          {/* Sidebar */}
          <Col xs={24} lg={5}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden sticky top-24 border border-gray-200 dark:border-gray-700">
              {/* Category Title */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600">
                <h3 className="m-0 text-sm font-semibold text-white">A – 秀人内购【合集】</h3>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded bg-white/20 border-none text-white cursor-pointer transition-all hover:bg-white/30"
                  title="搜索当前分类"
                >
                  <SearchOutlined />
                </button>
              </div>

              {/* Category Links */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                {visibleCategories.map((cat, index) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className={`
                      block px-4 py-2.5 text-[13px] no-underline transition-all
                      border-b border-gray-100 dark:border-gray-700
                      ${pathname === cat.href
                        ? '!bg-pink-100 dark:!bg-pink-900/40 text-pink-600 dark:text-pink-300 font-semibold border-l-[3px] border-l-pink-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400'
                      }
                    `}
                  >
                    {cat.label}
                  </Link>
                ))}

                {/* Show More/Less Button */}
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className={`
                    w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] cursor-pointer transition-all border-b border-gray-200 dark:border-gray-700
                    ${showAllCategories
                      ? 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600'
                    }
                  `}
                >
                  {showAllCategories ? (
                    <>
                      <UpOutlined /> 收起
                    </>
                  ) : (
                    <>
                      <DownOutlined /> 更多
                    </>
                  )}
                </button>

                {/* Expand Hint */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-center">
                  <span className="text-xs text-gray-400">▾</span>
                </div>
              </div>

              {/* Section Title */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  秀人网 (Xiuren) 内购全模特终极合集
                </Text>
              </div>
            </div>
          </Col>

          {/* Photo Grid */}
          <Col xs={24} lg={19}>
            {/* Section Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold rounded">
                  精选
                </span>
                <h2 className="m-0 text-base font-semibold text-gray-800 dark:text-white">
                  秀人网 (Xiuren) 内购全模特终极合集
                </h2>
                <Text className="text-gray-500 text-[13px]">殿堂级资源库</Text>
              </div>
            </div>

            {/* Photo Grid */}
            {loading && page === 1 ? (
              <div className="flex items-center justify-center py-20">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#ec4899' }} spin />} />
              </div>
            ) : collections.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {collections.map((item: PhotoCollection) => (
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
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Text>暂无数据</Text>
              </div>
            )}

            {/* Bottom Section */}
            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  秀人网 (Xiuren) 内购全模特终极合集 [1089套/1120GB] 殿堂级资源库
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}
