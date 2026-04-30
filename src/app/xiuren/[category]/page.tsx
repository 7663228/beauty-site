'use client'

import React, { useState, use } from 'react'
import { Row, Col, Typography, Breadcrumb, Spin, Pagination, Drawer } from 'antd'
import { HomeOutlined, SearchOutlined, PictureOutlined, LoadingOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons'
import Link from 'next/link'
import PhotoCard from '@/components/PhotoCard'
import { CardGridSkeleton, SidebarSkeleton } from '@/components/Skeleton'
import { useCollections } from '@/lib/hooks'
import type { PhotoCollection } from '@/lib/types'

const { Title, Text } = Typography

// 主分类
const MAIN_CATEGORIES = ['xiuren', 'boutique', 'sm', 'cosplay']

// 摄影机构到主分类的映射
const orgToMainCategory: Record<string, { mainCategory: string; mainCategoryName: string }> = {
  'xiu-ren-nei-gou': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'xiu-ren-nei-gou-heji': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'bololi': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'candy': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'dkgirl': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'feilin': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'huayang': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'huayan': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'imiss': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'leyuan': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'mfstar': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'micat': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'miitao': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'mintye': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'mistar': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'mtmeng': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'mygirl': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'ruisg': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'taste': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'tukmo': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'uxing': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'wings': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'xiaoyu': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'xingyan': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'xiuren': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'youmi': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'youwu': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'neibu': { mainCategory: 'xiuren', mainCategoryName: '秀人摄影' },
  'ugirls': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'bimilstory': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'bluecake': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'leehee': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'espacia': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'djawa': { mainCategory: 'boutique', mainCategoryName: '精品摄影' },
  'bobosocks': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'mussgirl': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'beautyleg': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'iess': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'wulian': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'rosi': { mainCategory: 'sm', mainCategoryName: '丝模摄影' },
  'weimiquan': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
  'yiko': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
  'yuuhui': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
  'mozi': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
  'yunxixi': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
  'chongmomo': { mainCategory: 'cosplay', mainCategoryName: '古风·COS' },
}

// 主分类配置
const categoryConfig = {
  xiuren: {
    name: '秀人摄影',
    slug: 'xiuren',
    subcategories: [
      { name: 'A - 秀人内购', slug: 'xiu-ren-nei-gou', href: '/xiuren/xiu-ren-nei-gou' },
      { name: 'A – 秀人内购【合集】', slug: 'xiu-ren-nei-gou-heji', href: '/xiuren/xiu-ren-nei-gou-heji' },
      { name: 'BoLoLi波萝社', slug: 'bololi', href: '/xiuren/bololi' },
      { name: 'CANDY糖果画报', slug: 'candy', href: '/xiuren/candy' },
      { name: 'DKGirl御女郎', slug: 'dkgirl', href: '/xiuren/dkgirl' },
      { name: 'FEILIN嗲囡囡', slug: 'feilin', href: '/xiuren/feilin' },
      { name: 'HUAYANG花漾', slug: 'huayang', href: '/xiuren/huayang' },
      { name: 'HUAYAN花粉颜', slug: 'huayan', href: '/xiuren/huayan' },
      { name: 'IMISS爱蜜社', slug: 'imiss', href: '/xiuren/imiss' },
      { name: 'LeYuan星乐园', slug: 'leyuan', href: '/xiuren/leyuan' },
      { name: 'MFStar模范学院', slug: 'mfstar', href: '/xiuren/mfstar' },
      { name: 'MiCat猫萌榜', slug: 'micat', href: '/xiuren/micat' },
      { name: 'MiiTao蜜桃社', slug: 'miitao', href: '/xiuren/miitao' },
      { name: 'MintYe薄荷叶', slug: 'mintye', href: '/xiuren/mintye' },
      { name: 'MiStar魅妍社', slug: 'mistar', href: '/xiuren/mistar' },
      { name: 'MTMeng模特联盟', slug: 'mtmeng', href: '/xiuren/mtmeng' },
      { name: 'MyGirl美媛馆', slug: 'mygirl', href: '/xiuren/mygirl' },
      { name: 'RuiSG瑞丝馆', slug: 'ruisg', href: '/xiuren/ruisg' },
      { name: 'TASTE顽味生活', slug: 'taste', href: '/xiuren/taste' },
      { name: 'Tukmo兔几盟', slug: 'tukmo', href: '/xiuren/tukmo' },
      { name: 'UXING优星馆', slug: 'uxing', href: '/xiuren/uxing' },
      { name: 'WingS影私荟', slug: 'wings', href: '/xiuren/wings' },
      { name: 'XIAOYU语画界', slug: 'xiaoyu', href: '/xiuren/xiaoyu' },
      { name: 'XINGYAN星颜社', slug: 'xingyan', href: '/xiuren/xingyan' },
      { name: 'XIUREN秀人网', slug: 'xiuren', href: '/xiuren/xiuren' },
      { name: 'YOUMI尤蜜荟', slug: 'youmi', href: '/xiuren/youmi' },
      { name: 'YouWu尤物馆', slug: 'youwu', href: '/xiuren/youwu' },
      { name: '内部套图', slug: 'neibu', href: '/xiuren/neibu' },
    ],
  },
  boutique: {
    name: '精品摄影',
    slug: 'boutique',
    subcategories: [
      { name: 'Ugirls爱尤物', slug: 'ugirls', href: '/xiuren/ugirls' },
      { name: 'Bimilstory', slug: 'bimilstory', href: '/xiuren/bimilstory' },
      { name: 'BLUECAKE', slug: 'bluecake', href: '/xiuren/bluecake' },
      { name: 'LEEHEE EXPRESS', slug: 'leehee', href: '/xiuren/leehee' },
      { name: 'EspaciaKorea', slug: 'espacia', href: '/xiuren/espacia' },
      { name: 'DJAWAPhoto', slug: 'djawa', href: '/xiuren/djawa' },
    ],
  },
  sm: {
    name: '丝模摄影',
    slug: 'sm',
    subcategories: [
      { name: 'BoBoSocks袜啵啵', slug: 'bobosocks', href: '/xiuren/bobosocks' },
      { name: 'MussGirl慕丝女郎', slug: 'mussgirl', href: '/xiuren/mussgirl' },
      { name: 'BeautyLeg美腿', slug: 'beautyleg', href: '/xiuren/beautyleg' },
      { name: 'IESS异思趣向', slug: 'iess', href: '/xiuren/iess' },
      { name: '物恋传媒', slug: 'wulian', href: '/xiuren/wulian' },
      { name: 'ROSI写真', slug: 'rosi', href: '/xiuren/rosi' },
    ],
  },
  cosplay: {
    name: '古风·COS',
    slug: 'cosplay',
    subcategories: [
      { name: '微密圈', slug: 'weimiquan', href: '/xiuren/weimiquan' },
      { name: 'Yiko湿润兔', slug: 'yiko', href: '/xiuren/yiko' },
      { name: 'yuuhui玉汇', slug: 'yuuhui', href: '/xiuren/yuuhui' },
      { name: '抱走莫子aa', slug: 'mozi', href: '/xiuren/mozi' },
      { name: '云溪溪', slug: 'yunxixi', href: '/xiuren/yunxixi' },
      { name: '蠢沫沫', slug: 'chongmomo', href: '/xiuren/chongmomo' },
    ],
  },
}

const PAGE_SIZE = 12

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export default function XiurenCategoryPage({ params }: CategoryPageProps) {
  // Next.js 15: unwrap params with React.use()
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.category

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'single' | 'full'>('single')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  // Get collections - pass type filter to API
  const { data: collections, loading: loadingCollections, count } = useCollections({
    page,
    pageSize: PAGE_SIZE,
    search: searchQuery || undefined,
    type: searchType,
  })

  console.log('[xiuren/xiuren] collections count:', collections.length, 'loading:', loadingCollections, 'sample:', collections[0])

  // Calculate derived state
  const isMainCategory = MAIN_CATEGORIES.includes(categorySlug)
  const orgInfo = isMainCategory ? null : orgToMainCategory[categorySlug]
  const mainCategoryKey = isMainCategory ? categorySlug : (orgInfo?.mainCategory || 'xiuren')
  const mainCategoryData = categoryConfig[mainCategoryKey as keyof typeof categoryConfig] || categoryConfig.xiuren
  
  const currentOrgConfig = mainCategoryData.subcategories.find(c => c.slug === categorySlug)
  const pageTitle = isMainCategory ? mainCategoryData.name : (currentOrgConfig?.name || categorySlug)

  // Breadcrumb items
  const breadcrumbItems = isMainCategory
    ? [
        { key: 'home', title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
        { key: 'category', title: <span className="text-white">{pageTitle}</span> },
      ]
    : [
        { key: 'home', title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
        { key: 'category', title: <Link href={`/xiuren/${orgInfo?.mainCategory}`} className="text-white/80 hover:text-white">{orgInfo?.mainCategoryName}</Link> },
        { key: 'org', title: <span className="text-white">{pageTitle}</span> },
      ]

  const visibleCategories = mainCategoryData.subcategories

  // Filter collections by type (API) and organization (frontend)
  const filteredCollections = React.useMemo(() => {
    let result = collections

    // Organization filter for org pages (not main category pages)
    if (!isMainCategory && currentOrgConfig) {
      const orgName = currentOrgConfig.name
      result = result.filter(c =>
        c.title?.includes(orgName) ||
        c.subtitle?.includes(orgName)
      )
    }

    return result
  }, [collections, isMainCategory, currentOrgConfig])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb className="mb-4" items={breadcrumbItems} />
          <Title level={2} className="!mb-2 !text-white">
            <PictureOutlined className="mr-2" />
            {pageTitle}
          </Title>
          <Text className="text-white/80">精选{pageTitle}模特写真作品，持续更新中</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Fixed Header - Type Toggle + Search */}
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md rounded-lg max-w-6xl w-[calc(100%-2rem)]">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
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
              <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold rounded">
                精选
              </span>
              <h2 className="m-0 text-base font-semibold text-gray-800 dark:text-white">
                {pageTitle} 全模特终极合集
              </h2>
              <Text className="text-gray-500 text-[13px]">殿堂级资源库</Text>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <input
                type="search"
                placeholder={`搜索${pageTitle}...`}
                className="w-full h-8 px-3 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                onChange={(e) => {
                  if (!e.target.value) handleSearch('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value
                    if (value) handleSearch(value)
                  }
                }}
              />
              <SearchOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>
            <button
              className="sm:hidden flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              onClick={() => setFilterDrawerOpen(true)}
              title="筛选机构"
            >
              <FilterOutlined className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <Row gutter={24}>
          {/* Left Sidebar - Hidden on mobile */}
          <Col xs={0} lg={5}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm sticky top-24 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 shrink-0">
                <h3 className="m-0 text-sm font-semibold text-white">{mainCategoryData.name}</h3>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded bg-white/20 border-none text-white cursor-pointer transition-all hover:bg-white/30"
                  title="搜索当前分类"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement
                    if (input) input.focus()
                  }}
                >
                  <SearchOutlined />
                </button>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-0">
                {mainCategoryData.subcategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className={`
                      block px-2 py-2.5 text-[11px] no-underline transition-colors text-center
                      border-b border-r border-gray-100 dark:border-gray-700 last:border-r-0
                      ${categorySlug === cat.slug
                        ? '!bg-pink-100 dark:!bg-pink-900/40 text-pink-600 dark:text-pink-300 font-semibold border-b-pink-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400'
                      }
                    `}
                  >
                    {cat.name}
                  </Link>
                ))}
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {mainCategoryData.name} 全模特终极合集
                </Text>
              </div>
            </div>
          </Col>

          {/* Right Content */}
          <Col xs={24} lg={19}>
            <Row gutter={[16, 16]}>
            {/* Photo Grid */}
            {loadingCollections ? (
              <>
                <CardGridSkeleton count={12} type="photo" />
              </>
            ) : filteredCollections.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <Text className="text-gray-500 dark:text-gray-400 text-lg">
                  暂无数据
                </Text>
                <p className="text-gray-400 mt-2">
                  该分类暂无写真作品
                </p>
              </div>
            )}
            </Row>

            <div className="text-center mt-8">
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={count || filteredCollections.length}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>

            <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  {pageTitle} 全模特终极合集 [1089套/1120GB] 殿堂级资源库
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold">{mainCategoryData.name}</span>
            <CloseOutlined onClick={() => setFilterDrawerOpen(false)} className="cursor-pointer" />
          </div>
        }
        placement="left"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        width={300}
        className="filter-drawer"
        styles={{
          wrapper: {
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          body: {
            padding: '16px',
          },
        }}
        motion={{
          enter: {
            opacity: [0, 1],
            transform: [{ x: [-300, 0] }],
            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          },
          leave: {
            opacity: [1, 0],
            transform: [{ x: [0, -300] }],
            transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
          },
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          {mainCategoryData.subcategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              className={`
                block px-2 py-2.5 text-[11px] no-underline transition-colors text-center rounded
                ${categorySlug === cat.slug
                  ? '!bg-pink-500 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-600'
                }
              `}
              onClick={() => setFilterDrawerOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </Drawer>
    </div>
  )
}
