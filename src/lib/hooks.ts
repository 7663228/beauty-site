'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getCelebrities,
  getCelebrityById,
  getCelebrityCollections,
  getHotCelebrities,
  getCollections,
  getSingleCollections,
  getFullCollections,
  getHotCollections,
  getLatestCollections,
  getCollectionDetail,
  getRelatedCollections,
  getCollectionComments,
  searchAll,
  getStatistics,
  getCategoryStats,
  getVipPackages,
  getUserVipStatus,
  canUserDownload,
} from './api'
import type {
  Celebrity,
  PhotoCollection,
  CollectionDetail,
  RelatedCollection,
  CommentWithUser,
  CelebrityQueryParams,
  CollectionQueryParams,
  CommentQueryParams,
  VipPackage,
  UserVipStatus,
} from './types'

// =============================================
// 人物 (Celebrities) Hooks
// =============================================

export function useCelebrities(params: CelebrityQueryParams = {}) {
  const [data, setData] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      const result = await getCelebrities(params)
      setData(result.data || [])
      setError(result.error)
      setCount(result.count || 0)
      setLoading(false)
    }
    fetch()
  }, [JSON.stringify(params)])

  return { data, loading, error, count }
}

export function useCelebrity(id: number | null) {
  const [data, setData] = useState<Celebrity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await getCelebrityById(id)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [id])

  return { data, loading, error }
}

export function useCelebrityCollections(celebrityId: number | null, params = {}) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!celebrityId) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await getCelebrityCollections(celebrityId, params)
      setData(result.data)
      setError(result.error)
      setCount(result.count)
      setLoading(false)
    }

    fetch()
  }, [celebrityId, JSON.stringify(params)])

  return { data, loading, error, count }
}

export function useHotCelebrities(limit: number = 10) {
  const [data, setData] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getHotCelebrities(limit)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [limit])

  return { data, loading, error }
}

// =============================================
// 图集 (Collections) Hooks
// =============================================

// Module-level cache to avoid duplicate API requests
// Key: JSON stringified params, Value: { data, count }
const collectionsCache = new Map<string, { data: PhotoCollection[]; count: number }>()
// Max cache entries to prevent memory leaks
const MAX_CACHE_SIZE = 50

function getCacheKey(params: CollectionQueryParams): string {
  return JSON.stringify(params, Object.keys(params).sort())
}

export function useCollections(params: CollectionQueryParams = {}) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  // Track the last params we fetched to avoid unnecessary re-renders
  const paramsRef = useRef<string>('')
  const currentKey = getCacheKey(params)

  const fetch = useCallback(async (key: string, p: CollectionQueryParams) => {
    const prevLoading = !collectionsCache.has(key)
    if (prevLoading) setLoading(true)
    setError(null)
    const result = await getCollections(p)
    console.log('[useCollections] getCollections result:', result.data?.length, 'error:', result.error, 'sample:', result.data?.[0])
    const cached = { data: result.data || [], count: result.count || 0 }
    collectionsCache.set(key, cached)
    if (collectionsCache.size > MAX_CACHE_SIZE) {
      const firstKey = collectionsCache.keys().next().value
      if (firstKey) collectionsCache.delete(firstKey)
    }
    setData(cached.data)
    setCount(cached.count)
    setError(result.error || null)
    if (prevLoading) setLoading(false)
  }, [])

  useEffect(() => {
    const cached = collectionsCache.get(currentKey)
    if (cached) {
      setData(cached.data)
      setCount(cached.count)
      setLoading(false)
    } else {
      paramsRef.current = currentKey
      fetch(currentKey, params)
    }
  }, [currentKey, params, fetch])

  return { data, loading, error, count, refetch: () => fetch(currentKey, params) }
}

export function useSingleCollections(page: number = 1, pageSize: number = 20) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getSingleCollections(page, pageSize)
      setData(result.data)
      setError(result.error)
      setCount(result.count)
      setLoading(false)
    }

    fetch()
  }, [page, pageSize])

  return { data, loading, error, count }
}

export function useFullCollections(page: number = 1, pageSize: number = 20) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getFullCollections(page, pageSize)
      setData(result.data)
      setError(result.error)
      setCount(result.count)
      setLoading(false)
    }

    fetch()
  }, [page, pageSize])

  return { data, loading, error, count }
}

export function useHotCollections(limit: number = 10) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getHotCollections(limit)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [limit])

  return { data, loading, error }
}

export function useLatestCollections(limit: number = 20) {
  const [data, setData] = useState<PhotoCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getLatestCollections(limit)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [limit])

  return { data, loading, error }
}

export function useCollectionDetail(id: number | null) {
  const [data, setData] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await getCollectionDetail(id)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [id])

  return { data, loading, error }
}

export function useRelatedCollections(collectionId: number | null, celebrityId: number | null, limit: number = 4) {
  const [data, setData] = useState<RelatedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!collectionId || !celebrityId) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await getRelatedCollections(collectionId, celebrityId, limit)
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [collectionId, celebrityId, limit])

  return { data, loading, error }
}

// =============================================
// 评论 (Comments) Hooks
// =============================================

export function useCollectionComments(params: CommentQueryParams = {}) {
  const [data, setData] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    const result = await getCollectionComments(params)
    setData(result.data)
    setError(result.error)
    setCount(result.count)
    setLoading(false)
  }, [JSON.stringify(params)])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, count, refetch: fetch }
}

// =============================================
// 搜索 (Search) Hooks
// =============================================

export function useSearch(query: string, enabled: boolean = true) {
  const [collections, setCollections] = useState<any[]>([])
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !query || query.length < 2) {
      setCollections([])
      setCelebrities([])
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await searchAll(query)
      setCollections(result.collections)
      setCelebrities(result.celebrities)
      setError(result.error)
      setLoading(false)
    }

    // Debounce
    const timer = setTimeout(fetch, 300)
    return () => clearTimeout(timer)
  }, [query, enabled])

  return { collections, celebrities, loading, error }
}

// =============================================
// 统计 (Statistics) Hooks
// =============================================

export function useStatistics() {
  const [data, setData] = useState({ celebritiesCount: 0, collectionsCount: 0, totalDownloads: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getStatistics()
      setData(result)
      setError(result.celebritiesCount === undefined ? 'Failed to fetch statistics' : null)
      setLoading(false)
    }

    fetch()
  }, [])

  return { data, loading, error }
}

export function useCategoryStats() {
  const [data, setData] = useState<{ category: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getCategoryStats()
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [])

  return { data, loading, error }
}

// =============================================
// VIP 会员 Hooks
// =============================================

export function useVipPackages() {
  const [data, setData] = useState<VipPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await getVipPackages()
      setData(result.data)
      setError(result.error)
      setLoading(false)
    }

    fetch()
  }, [])

  return { data, loading, error }
}

export function useUserVipStatus(userId: number | null) {
  const [data, setData] = useState<UserVipStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVip, setIsVip] = useState(false)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setIsVip(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      const result = await getUserVipStatus(userId)
      setData(result.data)
      setError(result.error)

      // 检查VIP是否有效
      if (result.data) {
        if (result.data.is_permanent) {
          setIsVip(true)
        } else if (result.data.vip_end_date) {
          const endDate = new Date(result.data.vip_end_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          setIsVip(endDate >= today)
        }
      }
      setLoading(false)
    }

    fetch()
  }, [userId])

  return { data, loading, error, isVip }
}

export function useCanDownload(userId: number | null, collectionId: number) {
  const [canDownload, setCanDownload] = useState(false)
  const [reason, setReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const result = await canUserDownload(userId, collectionId)
      setCanDownload(result.canDownload)
      setReason(result.reason || null)
      setLoading(false)
    }

    if (userId && collectionId) {
      fetch()
    } else {
      setCanDownload(false)
      setReason('请先登录')
      setLoading(false)
    }
  }, [userId, collectionId])

  return { canDownload, reason, loading }
}
