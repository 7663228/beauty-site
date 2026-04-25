'use client'

import React, { useState, useEffect, use } from 'react'
import {
  Row,
  Col,
  Breadcrumb,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Typography,
  Card,
  message,
  Spin,
} from 'antd'
import {
  HomeOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  ExpandOutlined,
  CompressOutlined,
  LoadingOutlined,
  LockOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import RandomRecommend from '@/components/RandomRecommend'
import {
  useCollectionDetail,
  useRelatedCollections,
  useCollectionComments,
  useUserVipStatus,
} from '@/lib/hooks'
import type { CollectionDetail, RelatedCollection, CommentWithUser } from '@/lib/types'
import { useAuth } from '@/lib/auth' // 假设有auth hook

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface PhotoDetailPageProps {
  params: Promise<{ id: string }>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function PhotoDetailPage({ params }: PhotoDetailPageProps) {
  const { id } = use(params)
  const collectionId = parseInt(id, 10)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({})
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [localComments, setLocalComments] = useState<Array<{ name: string; content: string; date: string }>>([])

  const { data: detail, loading: detailLoading, error: detailError } = useCollectionDetail(
    isNaN(collectionId) ? null : collectionId
  )
  const { data: relatedCollections } = useRelatedCollections(
    isNaN(collectionId) ? null : collectionId,
    detail?.celebrity_id ?? null
  )
  const { data: comments } = useCollectionComments({
    collectionId: isNaN(collectionId) ? undefined : collectionId,
    pageSize: 50,
  })

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [lightboxOpen])

  const previewImages = detail?.preview_images || []
  const images = previewImages.length > 0
    ? previewImages.map((img) => img.image_url)
    : detail?.thumbnail_url
      ? [detail.thumbnail_url]
      : []

  const handlePrevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!lightboxOpen) return
    if (e.key === 'Escape') setLightboxOpen(false)
    if (e.key === 'ArrowLeft') handlePrevImage()
    if (e.key === 'ArrowRight') handleNextImage()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const handleSubmitComment = () => {
    if (!commentName.trim()) {
      message.warning('请输入昵称')
      return
    }
    if (!commentContent.trim()) {
      message.warning('请输入评论内容')
      return
    }
    setLocalComments([
      { name: commentName, content: commentContent, date: new Date().toLocaleDateString('zh-CN') },
      ...localComments,
    ])
    setCommentName('')
    setCommentContent('')
    message.success('评论提交成功')
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      message.success('链接已复制到剪贴板')
    }
  }

  const handleFavorite = () => {
    message.info('收藏功能已添加')
  }

  if (detailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#ec4899' }} spin />} />
      </div>
    )
  }

  if (detailError || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Title level={2} className="!mb-4">未找到该图集</Title>
        <Text className="text-gray-500 dark:text-gray-400 mb-6">您访问的图集不存在或已被删除</Text>
        <Link href="/dantao">
          <Button type="primary" size="large">
            返回图集列表
          </Button>
        </Link>
      </div>
    )
  }

  const allComments = [
    ...(comments || []).map((c: CommentWithUser) => ({
      name: c.user?.username || '匿名用户',
      content: c.content,
      date: formatDate(c.created_at),
    })),
    ...localComments,
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${images[0] || detail.thumbnail_url})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-6 w-full">
            <Breadcrumb
              className="mb-4"
              items={[
                { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
                { title: <Link href="/dantao" className="text-white/80 hover:text-white">单套图集</Link> },
                { title: <span className="text-white">{detail.title}</span> },
              ]}
            />
            <Title level={2} className="!mb-2 !text-white !mt-0">
              {detail.title}
            </Title>
            <Space className="text-white/80" size="large">
              <span className="flex items-center gap-1">
                <CalendarOutlined />
                {formatDate(detail.publish_date)}
              </span>
              <span className="flex items-center gap-1">
                <EyeOutlined />
                {detail.views_count} 浏览
              </span>
              <span className="flex items-center gap-1">
                <DownloadOutlined />
                {detail.downloads_count} 下载
              </span>
              {detail.celebrity && (
                <span className="flex items-center gap-1">
                  <UserOutlined />
                  {detail.celebrity.name}
                </span>
              )}
            </Space>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Row gutter={24}>
          {/* Left Content */}
          <Col xs={24} lg={17}>
            {/* Action Buttons */}
            <Card className="mb-6">
              <Space wrap>
                <Button type="primary" icon={<HeartOutlined />} onClick={handleFavorite}>
                  收藏
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  分享链接
                </Button>
                <Button
                  icon={<ExpandOutlined />}
                  onClick={() => {
                    setLightboxIndex(0)
                    setLightboxOpen(true)
                  }}
                >
                  幻灯片模式
                </Button>
              </Space>
            </Card>

            {/* Image Gallery */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>图集预览 ({images.length} 张)</span>
                  <Text type="secondary" className="text-sm">
                    点击图片可放大查看
                  </Text>
                </div>
              }
              className="mb-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((src, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => {
                      setLightboxIndex(index)
                      setLightboxOpen(true)
                    }}
                  >
                    {imageLoading[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <Spin size="small" />
                      </div>
                    )}
                    <img
                      src={src}
                      alt={`${detail.title} - 第${index + 1}张`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onLoad={() => {
                        setImageLoading((prev) => ({ ...prev, [index]: false }))
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://picsum.photos/300/400?random=${id}-${index}`
                        setImageLoading((prev) => ({ ...prev, [index]: false }))
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <ExpandOutlined className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}/{images.length}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Description */}
            <Card title="图集描述" className="mb-6">
              <Paragraph className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {detail.subtitle || detail.celebrity?.description || detail.title}
              </Paragraph>
            </Card>

            {/* Tags */}
            {detail.celebrity && (
              <Card title="标签" className="mb-6">
                <Space wrap size="small">
                  <Link href={`/celebrity/${detail.celebrity.id}`}>
                    <Tag color="pink" className="cursor-pointer hover:bg-pink-100 dark:hover:bg-pink-900">
                      #{detail.celebrity.name}
                    </Tag>
                  </Link>
                  {detail.celebrity.category && (
                    <Link href={`/dantao?category=${encodeURIComponent(detail.celebrity.category)}`}>
                      <Tag color="default" className="cursor-pointer">
                        {detail.celebrity.category}
                      </Tag>
                    </Link>
                  )}
                  <Tag color="default" className="cursor-pointer">
                    <Link href="/dantao">精选单套</Link>
                  </Tag>
                </Space>
              </Card>
            )}

            {/* Related Recommendations */}
            {relatedCollections && relatedCollections.length > 0 && (
              <Card title="相关推荐" className="mb-6">
                <Row gutter={[12, 12]}>
                  {relatedCollections.map((related: RelatedCollection) => (
                    <Col key={related.id} xs={12} sm={8} md={6}>
                      <Link href={`/photo/${related.id}`}>
                        <Card
                          hoverable
                          size="small"
                          cover={
                            <div className="aspect-[3/4] overflow-hidden">
                              <img
                                src={related.thumbnail_url || 'https://picsum.photos/200/300?random=related'}
                                alt={related.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://picsum.photos/200/300?random=${related.id}`
                                }}
                              />
                            </div>
                          }
                        >
                          <div className="text-center">
                            <Text className="text-sm line-clamp-1">{related.title}</Text>
                            <br />
                            <Text type="secondary" className="text-xs">
                              {related.image_count}P / {related.type === 'full' ? '全套' : '单套'}
                            </Text>
                          </div>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Comments */}
            <Card title="发表评论">
              <Space direction="vertical" className="w-full" size="large">
                <TextArea
                  rows={4}
                  placeholder="请输入评论内容..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  maxLength={1000}
                  showCount
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="* 昵称"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      prefix="@"
                      type="email"
                      placeholder="* 邮箱（选填）"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                    />
                  </Col>
                </Row>
                <div className="text-xs text-gray-400">
                  提示：昵称为必填项
                </div>
                <Button type="primary" onClick={handleSubmitComment}>
                  提交评论
                </Button>

                {/* Comments List */}
                {allComments.length > 0 && (
                  <div className="mt-6">
                    <Title level={5} className="!mb-4">评论 ({allComments.length})</Title>
                    {allComments.map((comment, index) => (
                      <Card key={index} size="small" className="mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                            <UserOutlined className="text-pink-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Text strong>{comment.name}</Text>
                              <Text type="secondary" className="text-xs">{comment.date}</Text>
                            </div>
                            <Paragraph className="!mb-0 text-gray-600 dark:text-gray-300">
                              {comment.content}
                            </Paragraph>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Space>
            </Card>
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={7}>
            {/* VIP Download Card */}
            <Card className="mb-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-800">
              <div className="text-center">
                <StarOutlined className="text-pink-500 text-2xl mb-2" />
                <Title level={4} className="!mb-2">VIP资源</Title>
                <Text type="secondary" className="block mb-4">
                  VIP会员专属免费高速下载
                </Text>

                {/* Download Resources */}
                {detail.download_resources && detail.download_resources.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {detail.download_resources.map((resource, idx) => (
                      <DownloadResourceButton
                        key={idx}
                        resource={resource}
                      />
                    ))}
                  </div>
                ) : (
                  <VipDownloadPrompt collectionId={collectionId} />
                )}

                <div className="flex justify-center gap-4 text-sm text-gray-500">
                  <span>下载次数: {detail.downloads_count}</span>
                  <span>|</span>
                  <span>更新: {formatDate(detail.publish_date)}</span>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <Card title="图集信息" className="mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary">图集名称</Text>
                  <Text strong className="truncate ml-2 max-w-[60%]">{detail.title}</Text>
                </div>
                {detail.source_no && (
                  <div className="flex justify-between">
                    <Text type="secondary">图集编号</Text>
                    <Text>{detail.source_no}</Text>
                  </div>
                )}
                {detail.celebrity && (
                  <div className="flex justify-between">
                    <Text type="secondary">模特</Text>
                    <Link href={`/celebrity/${detail.celebrity.id}`}>
                      <Text className="text-pink-500">{detail.celebrity.name}</Text>
                    </Link>
                  </div>
                )}
                {detail.celebrity?.category && (
                  <div className="flex justify-between">
                    <Text type="secondary">来源</Text>
                    <Text>{detail.celebrity.category}</Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text type="secondary">图片数量</Text>
                  <Text>{detail.image_count} 张</Text>
                </div>
                {detail.video_count > 0 && (
                  <div className="flex justify-between">
                    <Text type="secondary">视频数量</Text>
                    <Text>{detail.video_count} 个</Text>
                  </div>
                )}
                {detail.file_size && (
                  <div className="flex justify-between">
                    <Text type="secondary">图集大小</Text>
                    <Text>{detail.file_size}</Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text type="secondary">发布时间</Text>
                  <Text>{formatDate(detail.publish_date)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">浏览次数</Text>
                  <Text>{detail.views_count}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">下载次数</Text>
                  <Text>{detail.downloads_count}</Text>
                </div>
              </div>
            </Card>

            {/* Random Recommendations */}
            <Card title="随机推荐" className="mb-6">
              <Space direction="vertical" className="w-full" size={[0, 8]}>
                {[
                  { title: '蠢沫沫 – NO.349 柜', source: 'Xiuren秀人网', date: '2024-12-01', url: '#' },
                  { title: '蠢沫沫 – NO.357 花丛婚纱', source: 'Xiuren秀人网', date: '2024-11-15', url: '#' },
                  { title: '蠢沫沫 – NO.313 橱窗娃娃', source: 'Xiuren秀人网', date: '2024-10-20', url: '#' },
                  { title: '蠢沫沫 – NO.355 自拍3月', source: 'Xiuren秀人网', date: '2024-09-10', url: '#' },
                  { title: '蠢沫沫 – NO.368 《秋寻上》', source: 'Xiuren秀人网', date: '2024-08-05', url: '#' },
                ].map((item, index) => (
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
      </div>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onCancel={() => setLightboxOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ padding: 0, background: '#000' }}
        closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
        className="photo-lightbox-modal"
      >
        <div
          className="relative flex items-center justify-center"
          style={{ height: '80vh' }}
        >
          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Navigation Buttons */}
          <Button
            type="text"
            icon={<LeftOutlined style={{ color: '#fff', fontSize: 24 }} />}
            onClick={handlePrevImage}
            className="absolute left-4 z-10 hover:bg-white/10"
          />
          <Button
            type="text"
            icon={<RightOutlined style={{ color: '#fff', fontSize: 24 }} />}
            onClick={handleNextImage}
            className="absolute right-4 z-10 hover:bg-white/10"
          />

          {/* Close Button */}
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: '#fff', fontSize: 24 }} />}
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 hover:bg-white/10"
          />

          {/* Fullscreen Toggle */}
          <Button
            type="text"
            icon={isFullscreen ? <CompressOutlined style={{ color: '#fff', fontSize: 24 }} /> : <ExpandOutlined style={{ color: '#fff', fontSize: 24 }} />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-16 z-10 hover:bg-white/10"
          />

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`${detail.title} - ${lightboxIndex + 1}`}
            className="max-h-full max-w-full object-contain"
            style={isFullscreen ? { width: '100vw', height: '100vh', objectFit: 'contain' } : {}}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://picsum.photos/800/1200?random=${id}-${lightboxIndex}`
            }}
          />
        </div>

        {/* Thumbnail Strip */}
        <div className="bg-black p-4 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((src, index) => (
              <div
                key={index}
                className={`relative w-16 h-20 flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all ${
                  index === lightboxIndex ? 'ring-2 ring-pink-500 opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={src}
                  alt={`Thumb ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/64/80?random=${id}-thumb-${index}`
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}

// =============================================
// VIP Download Components
// =============================================

interface DownloadResourceButtonProps {
  resource: {
    id: number
    resource_name: string | null
    baidu_link: string
    extract_code: string
    password: string | null
    file_size: string | null
    downloads_count: number
  }
}

function DownloadResourceButton({ resource }: DownloadResourceButtonProps) {
  const [isVip, setIsVip] = useState(false)
  const [loading, setLoading] = useState(false)

  // 模拟检查VIP状态 - 实际应该从auth context获取
  useEffect(() => {
    // TODO: 从用户上下文获取真实VIP状态
    // 这里临时设为false来测试VIP提示
    const checkVip = async () => {
      // const user = getCurrentUser()
      // const vipStatus = await checkUserVip(user?.id)
      // setIsVip(vipStatus)
      setIsVip(false) // 临时：设为非VIP用户以测试
    }
    checkVip()
  }, [])

  const handleDownload = async () => {
    if (!isVip) {
      message.warning('此资源需要VIP会员才能下载')
      return
    }

    setLoading(true)
    try {
      // 复制下载链接和提取码
      const downloadInfo = `${resource.baidu_link}\n提取码: ${resource.extract_code}${resource.password ? `\n解压密码: ${resource.password}` : ''}`
      await navigator.clipboard.writeText(downloadInfo)
      message.success('下载链接已复制到剪贴板')
    } catch (err) {
      message.error('复制失败，请稍后重试')
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <Button
        type="primary"
        size="large"
        block
        icon={isVip ? <DownloadOutlined /> : <LockOutlined />}
        loading={loading}
        onClick={handleDownload}
        className={isVip ? '' : 'bg-gray-400 border-gray-400'}
      >
        {resource.resource_name || '下载资源'}
      </Button>
      {!isVip && (
        <Link href="/vip" className="block mt-1 text-xs text-pink-500 hover:text-pink-600 text-center">
          开通VIP免费下载
        </Link>
      )}
    </div>
  )
}

interface VipDownloadPromptProps {
  collectionId: number
}

function VipDownloadPrompt({ collectionId }: VipDownloadPromptProps) {
  const [isVip, setIsVip] = useState(false)

  useEffect(() => {
    // TODO: 从用户上下文获取真实VIP状态
    setIsVip(false)
  }, [collectionId])

  return (
    <div>
      <Button
        type="primary"
        size="large"
        block
        icon={isVip ? <DownloadOutlined /> : <LockOutlined />}
        className={`mb-3 ${isVip ? '' : 'bg-gray-400 border-gray-400'}`}
        onClick={() => {
          if (!isVip) {
            message.warning('此资源需要VIP会员才能下载')
          }
        }}
      >
        {isVip ? 'VIP免费下载' : 'VIP会员专享下载'}
      </Button>
      {!isVip && (
        <div className="text-center">
          <Link href="/vip" className="text-sm text-pink-500 hover:text-pink-600">
            开通VIP，解锁全部下载链接
          </Link>
        </div>
      )}
    </div>
  )
}

