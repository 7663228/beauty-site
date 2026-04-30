import { supabase } from './supabase'
import type {
  Celebrity,
  PhotoCollection,
  CollectionImage,
  DownloadResource,
  Comment,
  CommentWithUser,
  CollectionDetail,
  RelatedCollection,
  CollectionQueryParams,
  CelebrityQueryParams,
  CommentQueryParams,
  QueryParams,
  VipPackage,
  UserVipStatus,
  VipOrder,
  SinglePurchase,
} from './types'

// =============================================
// 人物 (Celebrities) API
// =============================================

/**
 * 获取人物列表
 */
export async function getCelebrities(params: CelebrityQueryParams = {}) {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'popularity_score',
    orderDir = 'desc',
    category,
    isVerified,
    search,
  } = params

  let query = supabase
    .from('celebrities')
    .select('*', { count: 'exact' })

  // 搜索过滤
  if (search) {
    query = query.or(`name.ilike.%${search}%,alias.ilike.%${search}%`)
  }

  // 分类过滤
  if (category) {
    query = query.eq('category', category)
  }

  // 认证过滤
  if (isVerified !== undefined) {
    query = query.eq('is_verified', isVerified)
  }

  // 排序
  query = query.order(orderBy, { ascending: orderDir === 'asc' })

  // 分页
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  return {
    data: (data as Celebrity[]) || [],
    error: error?.message || null,
    count: count || 0,
    page,
    pageSize,
  }
}

/**
 * 获取人物详情
 */
export async function getCelebrityById(id: number) {
  const { data, error } = await supabase
    .from('celebrities')
    .select('*')
    .eq('id', id)
    .single()

  return {
    data: data as Celebrity | null,
    error: error?.message || null,
  }
}

/**
 * 获取人物的所有图集
 */
export async function getCelebrityCollections(celebrityId: number, params: QueryParams = {}) {
  const { page = 1, pageSize = 20, orderBy = 'publish_date', orderDir = 'desc' } = params

  const { data, error, count } = await supabase
    .from('photo_collections')
    .select('*', { count: 'exact' })
    .eq('celebrity_id', celebrityId)
    .eq('status', 'published')
    .order(orderBy, { ascending: orderDir === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return {
    data: (data as PhotoCollection[]) || [],
    error: error?.message || null,
    count: count || 0,
  }
}

/**
 * 获取热门人物 - 定义在文件末尾（带 mock fallback）
 */

/**
 * 获取图集详情（包含人物信息、预览图、下载资源）
 */
export async function getCollectionDetail(id: number) {
  // 获取图集基本信息
  const { data: collection, error: collectionError } = await supabase
    .from('photo_collections')
    .select('*')
    .eq('id', id)
    .single()

  if (collectionError || !collection) {
    return {
      data: null,
      error: collectionError?.message || 'Collection not found',
    }
  }

  // 获取人物信息
  const { data: celebrity } = await supabase
    .from('celebrities')
    .select('*')
    .eq('id', collection.celebrity_id)
    .single()

  // 获取预览图片
  const { data: previewImages } = await supabase
    .from('collection_images')
    .select('*')
    .eq('collection_id', id)
    .order('display_order', { ascending: true })

  // 获取下载资源
  const { data: downloadResources } = await supabase
    .from('download_resources')
    .select('*')
    .eq('collection_id', id)
    .eq('is_active', true)

  return {
    data: {
      ...collection,
      celebrity,
      preview_images: previewImages || [],
      download_resources: downloadResources || [],
    } as CollectionDetail,
    error: null,
  }
}

/**
 * 获取图集预览图
 */
export async function getCollectionImages(collectionId: number) {
  const { data, error } = await supabase
    .from('collection_images')
    .select('*')
    .eq('collection_id', collectionId)
    .order('display_order', { ascending: true })

  return {
    data: (data as CollectionImage[]) || [],
    error: error?.message || null,
  }
}

/**
 * 获取图集下载资源
 */
export async function getCollectionResources(collectionId: number) {
  const { data, error } = await supabase
    .from('download_resources')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('is_active', true)

  return {
    data: (data as DownloadResource[]) || [],
    error: error?.message || null,
  }
}

/**
 * 获取相关推荐（同人物的其他图集）
 */
export async function getRelatedCollections(collectionId: number, celebrityId: number, limit: number = 4) {
  const { data, error } = await supabase
    .from('photo_collections')
    .select(`
      id,
      title,
      type,
      thumbnail_url,
      image_count,
      views_count,
      downloads_count,
      celebrity_id,
      celebrities (name)
    `)
    .eq('celebrity_id', celebrityId)
    .eq('status', 'published')
    .neq('id', collectionId)
    .order('views_count', { ascending: false })
    .limit(limit)

  const relatedData: RelatedCollection[] = ((data as unknown[]) || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    thumbnail_url: item.thumbnail_url,
    image_count: item.image_count,
    views_count: item.views_count,
    downloads_count: item.downloads_count,
    celebrity_id: item.celebrity_id,
    celebrity_name: item.celebrities?.name || '',
  }))

  return {
    data: relatedData,
    error: error?.message || null,
  }
}

/**
 * 更新图集观看次数
 */
export async function incrementCollectionViews(collectionId: number) {
  const { data, error } = await supabase.rpc('increment_views', {
    collection_id: collectionId,
  })

  return { data, error: error?.message || null }
}

// =============================================
// 评论 (Comments) API
// =============================================

/**
 * 获取图集评论列表
 */
export async function getCollectionComments(params: CommentQueryParams = {}) {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    orderDir = 'desc',
    collectionId,
    parentOnly = true,
  } = params

  let query = supabase
    .from('comments')
    .select(`
      *,
      users (id, username, avatar_url, user_level)
    `, { count: 'exact' })
    .eq('is_deleted', false)

  // 图集过滤
  if (collectionId) {
    query = query.eq('collection_id', collectionId)
  }

  // 只看一级评论
  if (parentOnly) {
    query = query.is('parent_id', null)
  }

  // 排序（置顶优先）
  query = query.order('is_pinned', { ascending: false })
  query = query.order(orderBy, { ascending: orderDir === 'asc' })

  // 分页
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  // 处理嵌套的用户数据
  const commentsWithUser: CommentWithUser[] = ((data as unknown[]) || []).map((item: any) => ({
    ...item,
    user: item.users,
  }))

  return {
    data: commentsWithUser,
    error: error?.message || null,
    count: count || 0,
    page,
    pageSize,
  }
}

/**
 * 添加评论
 */
export async function addComment(params: {
  collectionId: number
  userId: number
  content: string
  rating?: number
  parentId?: number
  rootId?: number
}) {
  const { collectionId, userId, content, rating, parentId, rootId } = params

  const { data, error } = await supabase
    .from('comments')
    .insert({
      collection_id: collectionId,
      user_id: userId,
      content,
      rating: rating || null,
      parent_id: parentId || null,
      root_id: rootId || null,
    })
    .select()
    .single()

  return {
    data: data as Comment | null,
    error: error?.message || null,
  }
}

/**
 * 删除评论（软删除）
 */
export async function deleteComment(commentId: number) {
  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', commentId)

  return { error: error?.message || null }
}

/**
 * 点赞评论
 */
export async function likeComment(commentId: number) {
  const { error } = await supabase.rpc('increment_comment_likes', {
    comment_id: commentId,
  })

  return { error: error?.message || null }
}

// =============================================
// 用户 (Users) API
// =============================================

/**
 * 获取用户信息
 */
export async function getUserById(id: number) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  return {
    data,
    error: error?.message || null,
  }
}

/**
 * 获取用户评论列表
 */
export async function getUserComments(userId: number, page: number = 1, pageSize: number = 20) {
  const { data, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      photo_collections (id, title, thumbnail_url)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return {
    data: data || [],
    error: error?.message || null,
    count: count || 0,
  }
}

// =============================================
// 搜索 (Search) API
// =============================================

/**
 * 搜索图集和人物
 */
export async function searchAll(query: string) {
  const [collectionsResult, celebritiesResult] = await Promise.all([
    supabase
      .from('photo_collections')
      .select(`
        id, title, subtitle, type, thumbnail_url, image_count, views_count, downloads_count,
        celebrities (id, name)
      `)
      .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`)
      .eq('status', 'published')
      .limit(10),
    supabase
      .from('celebrities')
      .select('*')
      .or(`name.ilike.%${query}%,alias.ilike.%${query}%`)
      .limit(10),
  ])

  return {
    collections: collectionsResult.data || [],
    celebrities: celebritiesResult.data as Celebrity[] || [],
    error: collectionsResult.error?.message || celebritiesResult.error?.message || null,
  }
}

// =============================================
// 统计数据 (Statistics) API
// =============================================

/**
 * 获取统计数据
 */
export async function getStatistics() {
  const [celebritiesCount, collectionsCount, downloadsCount] = await Promise.all([
    supabase.from('celebrities').select('id', { count: 'exact', head: true }),
    supabase.from('photo_collections').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('photo_collections').select('downloads_count').eq('status', 'published'),
  ])

  const totalDownloads = downloadsCount.data?.reduce((sum, item: any) => sum + (item.downloads_count || 0), 0) || 0

  return {
    celebritiesCount: celebritiesCount.count || 0,
    collectionsCount: collectionsCount.count || 0,
    totalDownloads,
  }
}

/**
 * 获取分类统计
 */
export async function getCategoryStats() {
  const { data, error } = await supabase
    .from('celebrities')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    return { data: [], error: error.message }
  }

  const categoryCount: Record<string, number> = {}
  data.forEach((item: any) => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
    }
  })

  const result = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
  }))

  return { data: result, error: null }
}

// =============================================
// VIP 会员 API
// =============================================

/**
 * 获取VIP套餐列表
 */
export async function getVipPackages() {
  const { data, error } = await supabase
    .from('vip_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return {
    data: (data || []) as VipPackage[],
    error: error?.message || null,
  }
}

/**
 * 获取用户VIP状态
 */
export async function getUserVipStatus(userId: number) {
  const { data, error } = await supabase
    .from('user_vip_status')
    .select('*')
    .eq('user_id', userId)
    .single()

  return {
    data: data as UserVipStatus | null,
    error: error?.message || null,
  }
}

/**
 * 检查用户是否是有效VIP
 */
export async function checkUserVip(userId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_vip_status')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  // 永久VIP
  if (data.is_permanent) {
    return true
  }

  // 检查VIP是否在有效期内
  if (data.vip_end_date) {
    const endDate = new Date(data.vip_end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return endDate >= today
  }

  return false
}

/**
 * 创建VIP订单
 */
export async function createVipOrder(userId: number, packageId: number, amount: number) {
  const orderNo = `VIP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  const { data, error } = await supabase
    .from('vip_orders')
    .insert({
      order_no: orderNo,
      user_id: userId,
      package_id: packageId,
      amount,
      payment_status: 'pending',
    })
    .select()
    .single()

  return {
    data: data as VipOrder | null,
    error: error?.message || null,
  }
}

/**
 * 更新VIP订单状态
 */
export async function updateVipOrderStatus(orderId: number, paymentStatus: string, transactionId?: string) {
  const updates: any = {
    payment_status: paymentStatus,
  }

  if (paymentStatus === 'paid') {
    updates.paid_at = new Date().toISOString()
  }

  if (transactionId) {
    updates.transaction_id = transactionId
  }

  const { error } = await supabase
    .from('vip_orders')
    .update(updates)
    .eq('id', orderId)

  return { error: error?.message || null }
}

/**
 * 激活VIP（用户支付成功后调用）
 */
export async function activateVip(userId: number, packageId: number) {
  // 获取套餐信息
  const { data: pkg, error: pkgError } = await supabase
    .from('vip_packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (pkgError || !pkg) {
    return { error: pkgError?.message || 'Package not found' }
  }

  // 获取当前VIP状态
  const { data: currentStatus } = await supabase
    .from('user_vip_status')
    .select('*')
    .eq('user_id', userId)
    .single()

  let vipStartDate = new Date()
  let vipEndDate: Date | null = null
  let isPermanent = false

  if (pkg.level === 'permanent') {
    isPermanent = true
  } else if (pkg.duration_days) {
    vipEndDate = new Date()
    vipEndDate.setDate(vipEndDate.getDate() + pkg.duration_days)

    // 如果已有VIP且未过期，累加时间
    if (currentStatus && currentStatus.vip_end_date && !currentStatus.is_permanent) {
      const existingEnd = new Date(currentStatus.vip_end_date)
      if (existingEnd > new Date()) {
        vipEndDate = existingEnd
        vipEndDate.setDate(vipEndDate.getDate() + pkg.duration_days)
      }
    }
  }

  // 更新或创建VIP状态
  const vipData = {
    user_id: userId,
    vip_level: pkg.level,
    vip_start_date: vipStartDate.toISOString().split('T')[0],
    vip_end_date: vipEndDate ? vipEndDate.toISOString().split('T')[0] : null,
    is_permanent: isPermanent,
  }

  if (currentStatus) {
    // 如果新等级更高或更长，更新
    const levelPriority = { monthly: 1, quarterly: 2, yearly: 3, permanent: 4, svip: 5 }
    const currentPriority = levelPriority[currentStatus.vip_level as keyof typeof levelPriority] || 0
    const newPriority = levelPriority[pkg.level as keyof typeof levelPriority] || 0

    if (newPriority >= currentPriority) {
      await supabase
        .from('user_vip_status')
        .update(vipData)
        .eq('user_id', userId)
    }
  } else {
    await supabase
      .from('user_vip_status')
      .insert(vipData)
  }

  // 更新用户表
  await supabase
    .from('users')
    .update({
      user_level: pkg.level === 'permanent' || pkg.level === 'yearly' || pkg.level === 'quarterly' ? 'VIP' : 'VIP',
      vip_expire_date: vipEndDate ? vipEndDate.toISOString().split('T')[0] : null,
      is_permanent_vip: isPermanent,
    })
    .eq('id', userId)

  return { error: null }
}

/**
 * 检查用户是否已购买某个单套图集
 */
export async function checkSinglePurchase(userId: number, collectionId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('single_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('collection_id', collectionId)
    .single()

  return !error && !!data
}

/**
 * 记录单套购买
 */
export async function recordSinglePurchase(userId: number, collectionId: number, amount: number) {
  const { data, error } = await supabase
    .from('single_purchases')
    .insert({
      user_id: userId,
      collection_id: collectionId,
      amount,
      payment_status: 'paid',
    })
    .select()
    .single()

  return {
    data: data as SinglePurchase | null,
    error: error?.message || null,
  }
}

/**
 * 获取用户已购买的单套图集ID列表
 */
export async function getUserPurchasedCollections(userId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from('single_purchases')
    .select('collection_id')
    .eq('user_id', userId)
    .eq('payment_status', 'paid')

  if (error || !data) {
    return []
  }

  return data.map((item: any) => item.collection_id)
}

/**
 * 检查用户是否可以下载某个图集
 */
export async function canUserDownload(
  userId: number | null,
  collectionId: number
): Promise<{ canDownload: boolean; reason?: string }> {
  // 未登录用户不能下载
  if (!userId) {
    return { canDownload: false, reason: '请先登录' }
  }

  // 检查是否是VIP
  const isVip = await checkUserVip(userId)
  if (isVip) {
    return { canDownload: true }
  }

  // 检查是否已购买单套
  const hasPurchased = await checkSinglePurchase(userId, collectionId)
  if (hasPurchased) {
    return { canDownload: true }
  }

  return {
    canDownload: false,
    reason: '此资源需要VIP会员或单独购买后下载',
  }
}

// =============================================
// 模拟数据 (Mock Data) - Supabase 离线时 fallback
// =============================================

const MOCK_CELEBRITIES: Celebrity[] = [
  { id: 1, name: '小七', alias: '元气少女小七', category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=21', description: 'HUAYANG花漾旗下模特', is_verified: true, total_collections: 12, total_views: 45600, popularity_score: 98, created_at: '2024-01-01', updated_at: '2024-09-01' },
  { id: 2, name: '糯叽叽', alias: '花漾_糯叽叽', category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=20', description: 'HUAYANG花漾旗下模特', is_verified: true, total_collections: 15, total_views: 67800, popularity_score: 95, created_at: '2024-01-01', updated_at: '2024-09-01' },
  { id: 3, name: '蠢沫沫', alias: null, category: 'cosplay', avatar_url: 'https://picsum.photos/200/200?random=1501', description: 'Cosplay模特', is_verified: true, total_collections: 8, total_views: 34500, popularity_score: 88, created_at: '2024-02-01', updated_at: '2024-09-01' },
  { id: 4, name: '白袜小甜', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=601', description: '秀人网模特', is_verified: true, total_collections: 10, total_views: 28900, popularity_score: 82, created_at: '2024-02-01', updated_at: '2024-09-01' },
  { id: 5, name: '陆萱萱', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=511', description: '秀人网模特', is_verified: true, total_collections: 20, total_views: 89000, popularity_score: 92, created_at: '2024-01-01', updated_at: '2024-09-01' },
  { id: 6, name: '南乔', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=212', description: '秀人网模特', is_verified: true, total_collections: 18, total_views: 56700, popularity_score: 86, created_at: '2024-01-01', updated_at: '2024-09-01' },
  { id: 7, name: '金允希Yuki', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=111', description: '秀人网模特', is_verified: true, total_collections: 14, total_views: 43200, popularity_score: 84, created_at: '2024-03-01', updated_at: '2024-09-01' },
  { id: 8, name: 'BoLoLi波萝社', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=bolo1', description: 'BoLoLi波萝社', is_verified: true, total_collections: 6, total_views: 22100, popularity_score: 78, created_at: '2024-04-01', updated_at: '2024-09-01' },
  { id: 9, name: 'CANDY糖果', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=candy1', description: 'CANDY糖果画报', is_verified: true, total_collections: 5, total_views: 19800, popularity_score: 76, created_at: '2024-04-01', updated_at: '2024-09-01' },
  { id: 10, name: '妲己_Toxic', alias: null, category: 'xiuren', avatar_url: 'https://picsum.photos/200/200?random=313', description: '秀人网模特', is_verified: false, total_collections: 9, total_views: 31200, popularity_score: 80, created_at: '2024-05-01', updated_at: '2024-09-01' },
]

const MOCK_SINGLE_COLLECTIONS: PhotoCollection[] = [
  { id: 29, celebrity_id: 4, title: '白袜小甜 NO.001', subtitle: null, type: 'single', preview_image_count: 12, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=601', image_count: 48, video_count: 0, file_size: '512MB', views_count: 4600, downloads_count: 700, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 46, celebrity_id: 8, title: 'BoLoLi波萝社 M1 NO.001', subtitle: null, type: 'single', preview_image_count: 20, source_no: 'M1 NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=bolo1', image_count: 80, video_count: 0, file_size: '856MB', views_count: 4600, downloads_count: 200, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 53, celebrity_id: 2, title: '糯叽叽 NO.001', subtitle: null, type: 'single', preview_image_count: 25, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=huay1', image_count: 95, video_count: 0, file_size: '1.1GB', views_count: 8800, downloads_count: 600, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 58, celebrity_id: 4, title: '白袜小甜 NO.002', subtitle: null, type: 'single', preview_image_count: 18, source_no: 'NO.002', thumbnail_url: 'https://picsum.photos/300/400?random=mi1', image_count: 82, video_count: 0, file_size: '876MB', views_count: 5700, downloads_count: 300, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 32, celebrity_id: 2, title: '糯叽叽 NO.002', subtitle: null, type: 'single', preview_image_count: 15, source_no: 'NO.002', thumbnail_url: 'https://picsum.photos/300/400?random=901', image_count: 55, video_count: 0, file_size: '623MB', views_count: 5700, downloads_count: 900, publish_date: '2025-09-14', status: 'published', created_at: '2025-09-14', updated_at: '2025-09-14' },
  { id: 50, celebrity_id: 9, title: 'CANDY糖果 S1 NO.001', subtitle: null, type: 'single', preview_image_count: 22, source_no: 'S1 NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=candy1', image_count: 85, video_count: 0, file_size: '934MB', views_count: 6800, downloads_count: 500, publish_date: '2025-09-14', status: 'published', created_at: '2025-09-14', updated_at: '2025-09-14' },
  { id: 56, celebrity_id: 1, title: '小七 NO.001', subtitle: 'HUAYANG花漾', type: 'single', preview_image_count: 25, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=huay4', image_count: 100, video_count: 2, file_size: '1.5GB', views_count: 9900, downloads_count: 700, publish_date: '2025-09-14', status: 'published', created_at: '2025-09-14', updated_at: '2025-09-14' },
  { id: 35, celebrity_id: 3, title: '蠢沫沫 NO.001', subtitle: null, type: 'single', preview_image_count: 18, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=1501', image_count: 68, video_count: 0, file_size: '756MB', views_count: 8800, downloads_count: 1200, publish_date: '2025-09-13', status: 'published', created_at: '2025-09-13', updated_at: '2025-09-13' },
  { id: 61, celebrity_id: 5, title: '陆萱萱 NO.001', subtitle: null, type: 'single', preview_image_count: 20, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=6012', image_count: 72, video_count: 0, file_size: '789MB', views_count: 7200, downloads_count: 450, publish_date: '2025-09-12', status: 'published', created_at: '2025-09-12', updated_at: '2025-09-12' },
  { id: 62, celebrity_id: 6, title: '南乔 NO.001', subtitle: null, type: 'single', preview_image_count: 16, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=6013', image_count: 60, video_count: 0, file_size: '654MB', views_count: 6100, downloads_count: 380, publish_date: '2025-09-11', status: 'published', created_at: '2025-09-11', updated_at: '2025-09-11' },
  { id: 63, celebrity_id: 7, title: '金允希Yuki NO.001', subtitle: null, type: 'single', preview_image_count: 14, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=6014', image_count: 58, video_count: 0, file_size: '612MB', views_count: 5500, downloads_count: 290, publish_date: '2025-09-10', status: 'published', created_at: '2025-09-10', updated_at: '2025-09-10' },
  { id: 64, celebrity_id: 10, title: '妲己_Toxic NO.001', subtitle: null, type: 'single', preview_image_count: 18, source_no: 'NO.001', thumbnail_url: 'https://picsum.photos/300/400?random=6015', image_count: 70, video_count: 0, file_size: '745MB', views_count: 6500, downloads_count: 420, publish_date: '2025-09-09', status: 'published', created_at: '2025-09-09', updated_at: '2025-09-09' },
]

const MOCK_FULL_COLLECTIONS: PhotoCollection[] = [
  { id: 38, celebrity_id: 3, title: '蠢沫沫 全套合集', subtitle: '蠢沫沫全部Cosplay作品', type: 'full', preview_image_count: 40, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=1511', image_count: 800, video_count: 50, file_size: null, views_count: 88000, downloads_count: 12000, publish_date: '2025-09-13', status: 'published', created_at: '2025-09-13', updated_at: '2025-09-13' },
  { id: 34, celebrity_id: 2, title: '糯叽叽 全套合集', subtitle: '糯叽叽全部作品整合包', type: 'full', preview_image_count: 35, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=911', image_count: 550, video_count: 35, file_size: null, views_count: 75600, downloads_count: 8900, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 55, celebrity_id: 2, title: '糯叽叽 全套合集', subtitle: 'HUAYANG花漾 糯叽叽全部作品', type: 'full', preview_image_count: 38, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=huay3', image_count: 550, video_count: 35, file_size: null, views_count: 123000, downloads_count: 15600, publish_date: '2025-09-15', status: 'published', created_at: '2025-09-15', updated_at: '2025-09-15' },
  { id: 14, celebrity_id: 5, title: '陆萱萱 全套合集', subtitle: '陆萱萱全部作品整合包', type: 'full', preview_image_count: 45, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=luxuanxuan-full', image_count: 600, video_count: 40, file_size: null, views_count: 99000, downloads_count: 14200, publish_date: '2025-09-10', status: 'published', created_at: '2025-09-10', updated_at: '2025-09-10' },
  { id: 28, celebrity_id: 5, title: '陆萱萱 全套合集', subtitle: '陆萱萱全部作品整合包', type: 'full', preview_image_count: 44, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=511', image_count: 600, video_count: 38, file_size: null, views_count: 99000, downloads_count: 13900, publish_date: '2025-09-12', status: 'published', created_at: '2025-09-12', updated_at: '2025-09-12' },
  { id: 11, celebrity_id: 7, title: '金允希Yuki 全套合集', subtitle: null, type: 'full', preview_image_count: 30, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=jinyunxi-full', image_count: 500, video_count: 20, file_size: null, views_count: 88000, downloads_count: 9800, publish_date: '2025-09-05', status: 'published', created_at: '2025-09-05', updated_at: '2025-09-05' },
  { id: 12, celebrity_id: 6, title: '南乔 全套合集', subtitle: null, type: 'full', preview_image_count: 28, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=nanqiao-full', image_count: 450, video_count: 18, file_size: null, views_count: 77000, downloads_count: 8700, publish_date: '2025-09-03', status: 'published', created_at: '2025-09-03', updated_at: '2025-09-03' },
  { id: 19, celebrity_id: 7, title: '金允希Yuki 全套合集', subtitle: null, type: 'full', preview_image_count: 32, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=111', image_count: 500, video_count: 22, file_size: null, views_count: 88000, downloads_count: 10200, publish_date: '2025-09-08', status: 'published', created_at: '2025-09-08', updated_at: '2025-09-08' },
  { id: 22, celebrity_id: 6, title: '南乔 全套合集', subtitle: null, type: 'full', preview_image_count: 26, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=212', image_count: 450, video_count: 15, file_size: null, views_count: 77000, downloads_count: 8500, publish_date: '2025-09-07', status: 'published', created_at: '2025-09-07', updated_at: '2025-09-07' },
  { id: 31, celebrity_id: 4, title: '白袜小甜 全套合集', subtitle: null, type: 'full', preview_image_count: 35, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=611', image_count: 580, video_count: 25, file_size: null, views_count: 88000, downloads_count: 11000, publish_date: '2025-09-06', status: 'published', created_at: '2025-09-06', updated_at: '2025-09-06' },
  { id: 25, celebrity_id: 10, title: '妲己_Toxic 全套合集', subtitle: null, type: 'full', preview_image_count: 30, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=313', image_count: 480, video_count: 20, file_size: null, views_count: 65000, downloads_count: 7200, publish_date: '2025-09-04', status: 'published', created_at: '2025-09-04', updated_at: '2025-09-04' },
  { id: 13, celebrity_id: 10, title: '妲己_Toxic 全套合集', subtitle: null, type: 'full', preview_image_count: 28, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=daji-full', image_count: 460, video_count: 18, file_size: null, views_count: 65000, downloads_count: 6800, publish_date: '2025-09-02', status: 'published', created_at: '2025-09-02', updated_at: '2025-09-02' },
  { id: 15, celebrity_id: 5, title: '尹甜甜 全套合集', subtitle: null, type: 'full', preview_image_count: 25, source_no: null, thumbnail_url: 'https://picsum.photos/300/400?random=yintt-full', image_count: 400, video_count: 15, file_size: null, views_count: 54000, downloads_count: 5200, publish_date: '2025-09-01', status: 'published', created_at: '2025-09-01', updated_at: '2025-09-01' },
]

/**
 * 获取热门人物 - 带模拟数据 fallback
 */
export async function getHotCelebrities(limit: number = 10) {
  const { data, error } = await supabase
    .from('celebrities')
    .select('*')
    .order('popularity_score', { ascending: false })
    .limit(limit)

  console.log('[API getHotCelebrities] data:', data?.length, 'error:', error?.message)
  if (error || !data || data.length === 0) {
    console.log('[API getHotCelebrities] Using MOCK fallback')
    return { data: MOCK_CELEBRITIES.slice(0, limit), error: null }
  }
  return { data: data as Celebrity[], error: null }
}

/**
 * 获取最新图集 - 带模拟数据 fallback
 */
export async function getLatestCollections(limit: number = 20) {
  const { data, error } = await supabase
    .from('photo_collections')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false })
    .limit(limit)

  console.log('[API getLatestCollections] data:', data?.length, 'error:', error?.message)
  if (error || !data || data.length === 0) {
    console.log('[API getLatestCollections] Using MOCK fallback')
    const mixed = [...MOCK_SINGLE_COLLECTIONS, ...MOCK_FULL_COLLECTIONS]
      .sort((a, b) => new Date(b.publish_date!).getTime() - new Date(a.publish_date!).getTime())
      .slice(0, limit)
    return { data: mixed, error: null }
  }
  return { data: data as PhotoCollection[], error: null }
}

/**
 * 获取热门图集 - 带模拟数据 fallback
 */
export async function getHotCollections(limit: number = 10) {
  const { data, error } = await supabase
    .from('photo_collections')
    .select('*')
    .eq('status', 'published')
    .order('views_count', { ascending: false })
    .limit(limit)

  if (error || !data || data.length === 0) {
    const mixed = [...MOCK_SINGLE_COLLECTIONS, ...MOCK_FULL_COLLECTIONS]
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, limit)
    return { data: mixed, error: null }
  }
  return { data: data as PhotoCollection[], error: null }
}

/**
 * 获取单套图集 - 带模拟数据 fallback
 */
export async function getSingleCollections(page: number = 1, pageSize: number = 20) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from('photo_collections')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('type', 'single')
    .order('publish_date', { ascending: false })
    .range(from, to)

  if (error || !data || data.length === 0) {
    const paginated = MOCK_SINGLE_COLLECTIONS.slice(from, to + 1)
    return { data: paginated as PhotoCollection[], error: null, count: MOCK_SINGLE_COLLECTIONS.length }
  }
  return { data: data as PhotoCollection[], error: null, count: count || 0 }
}

/**
 * 获取全套图集 - 带模拟数据 fallback
 */
export async function getFullCollections(page: number = 1, pageSize: number = 20) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from('photo_collections')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('type', 'full')
    .order('publish_date', { ascending: false })
    .range(from, to)

  if (error || !data || data.length === 0) {
    const paginated = MOCK_FULL_COLLECTIONS.slice(from, to + 1)
    return { data: paginated as PhotoCollection[], error: null, count: MOCK_FULL_COLLECTIONS.length }
  }
  return { data: data as PhotoCollection[], error: null, count: count || 0 }
}

/**
 * 获取图集列表 - 带模拟数据 fallback
 */
export async function getCollections(params: CollectionQueryParams = {}) {
  const {
    page = 1,
    pageSize = 12,
    orderBy = 'publish_date',
    orderDir = 'desc',
    type,
    celebrityId,
    search,
  } = params

  console.log('[getCollections] called with:', JSON.stringify({ page, pageSize, type, search, celebrityId }))

  let query = supabase
    .from('photo_collections')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (type) { query = query.eq('type', type) }
  if (celebrityId) { query = query.eq('celebrity_id', celebrityId) }
  if (search) {
    query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`)
  }

  query = query.order(orderBy, { ascending: orderDir === 'asc' })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  console.log('[getCollections] raw result - data length:', data?.length, 'count:', count, 'error:', error?.message || null)

  if (error || !data || data.length === 0) {
    console.log('[getCollections] Entering mock fallback')
    let mockData = type === 'single' ? MOCK_SINGLE_COLLECTIONS
                : type === 'full' ? MOCK_FULL_COLLECTIONS
                : [...MOCK_SINGLE_COLLECTIONS, ...MOCK_FULL_COLLECTIONS]

    if (celebrityId) {
      mockData = mockData.filter(c => c.celebrity_id === celebrityId)
    }
    if (search) {
      const q = search.toLowerCase()
      mockData = mockData.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
      )
    }

    const totalCount = mockData.length
    const paged = mockData.slice(from, to + 1)
    console.log('[getCollections] mock fallback - returning:', paged.length, 'items')
    return { data: paged as PhotoCollection[], error: null, count: totalCount, page, pageSize }
  }

  console.log('[getCollections] returning real data:', data.length)
  return {
    data: data as PhotoCollection[],
    error: null,
    count: count || 0,
    page,
    pageSize,
  }
}

