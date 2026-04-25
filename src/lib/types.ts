// Types only - use supabase from './supabase' for database operations

// =============================================
// 数据库类型定义 - 与 basedata.sql 一一对应
// =============================================

// 用户表
export interface User {
  id: number
  username: string
  avatar_url: string | null
  user_level: '普通用户' | 'VIP' | 'SVIP' | '管理员' | '版主'
  created_at: string
  last_login_at: string | null
  comment_count: number
  total_views: number
}

// 人物表
export interface Celebrity {
  id: number
  name: string
  alias: string | null
  category: string | null
  avatar_url: string | null
  description: string | null
  is_verified: boolean
  total_collections: number
  total_views: number
  popularity_score: number
  created_at: string
  updated_at: string
}

// 图集表
export interface PhotoCollection {
  id: number
  celebrity_id: number
  title: string
  subtitle: string | null
  type: 'single' | 'full'
  preview_image_count: number
  source_no: string | null
  thumbnail_url: string | null
  image_count: number
  video_count: number
  file_size: string | null
  views_count: number
  downloads_count: number
  publish_date: string | null
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

// 图集预览图片表
export interface CollectionImage {
  id: number
  collection_id: number
  image_url: string
  display_order: number
  thumbnail_url: string | null
  width: number | null
  height: number | null
  created_at: string
}

// 下载资源表
export interface DownloadResource {
  id: number
  collection_id: number
  resource_name: string | null
  baidu_link: string
  extract_code: string
  password: string | null
  file_type: 'image' | 'video' | 'zip'
  file_size: string | null
  downloads_count: number
  is_active: boolean
  expire_date: string | null
  created_at: string
  updated_at: string
}

// 评论表
export interface Comment {
  id: number
  collection_id: number
  user_id: number
  content: string
  rating: number | null
  like_count: number
  reply_count: number
  parent_id: number | null
  root_id: number | null
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// 评论详情（包含用户信息）
export interface CommentWithUser extends Comment {
  user: User
}

// 图集详情（包含人物信息和预览图）
export interface CollectionDetail extends PhotoCollection {
  celebrity: Celebrity
  preview_images: CollectionImage[]
  download_resources: DownloadResource[]
}

// 相关推荐
export interface RelatedCollection {
  id: number
  title: string
  type: 'single' | 'full'
  thumbnail_url: string | null
  image_count: number
  views_count: number
  downloads_count: number
  celebrity_id: number
  celebrity_name: string
}

// =============================================
// API 响应类型
// =============================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface ApiListResponse<T> {
  data: T[]
  error: string | null
  count?: number
  page?: number
  pageSize?: number
}

// =============================================
// VIP 相关类型
// =============================================

export interface VipPackage {
  id: number
  name: string
  level: 'monthly' | 'quarterly' | 'yearly' | 'permanent'
  price: number
  original_price: number | null
  duration_days: number | null
  description: string | null
  features: string[] | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VipOrder {
  id: number
  order_no: string
  user_id: number
  package_id: number
  amount: number
  payment_method: string | null
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  transaction_id: string | null
  created_at: string
  paid_at: string | null
  updated_at: string
}

export interface UserVipStatus {
  id: number
  user_id: number
  vip_level: 'monthly' | 'quarterly' | 'yearly' | 'permanent' | 'svip' | null
  vip_start_date: string | null
  vip_end_date: string | null
  is_permanent: boolean
  created_at: string
  updated_at: string
}

export interface SinglePurchase {
  id: number
  user_id: number
  collection_id: number
  amount: number
  payment_status: string
  created_at: string
}

// 完整用户信息（包含VIP状态）
export interface UserWithVip extends User {
  vip_status: UserVipStatus | null
  is_vip: boolean
  is_permanent_vip: boolean
}

// =============================================
// Supabase 范式查询参数
// =============================================

export interface QueryParams {
  page?: number
  pageSize?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export interface CollectionQueryParams extends QueryParams {
  type?: 'single' | 'full'
  celebrityId?: number
  category?: string
  search?: string
}

export interface CelebrityQueryParams extends QueryParams {
  category?: string
  isVerified?: boolean
  search?: string
}

export interface CommentQueryParams extends QueryParams {
  collectionId?: number
  userId?: number
  parentOnly?: boolean
}
