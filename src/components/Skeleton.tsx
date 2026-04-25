// Skeleton loading components for CLS prevention
// These provide consistent layout before data loads

import { Col } from 'antd'

export function PhotoCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 skeleton-shimmer" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 skeleton-shimmer" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full skeleton-shimmer" />
      </div>
    </div>
  )
}

export function FeaturedCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 skeleton-shimmer" />
      <div className="p-2 space-y-1 text-center">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto skeleton-shimmer" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto skeleton-shimmer" />
      </div>
    </div>
  )
}

export function CollectionCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 skeleton-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto skeleton-shimmer" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto skeleton-shimmer" />
      </div>
    </div>
  )
}

export function CardGridSkeleton({
  count = 8,
  type = 'photo',
  cols,
}: {
  count?: number
  type?: 'photo' | 'featured' | 'collection'
  cols?: { xs?: number; sm?: number; md?: number; lg?: number }
}) {
  const breakpoints = cols ?? (type === 'collection'
    ? { xs: 12, sm: 8, md: 6, lg: 4 }
    : type === 'featured'
    ? { xs: 12, sm: 12, md: 8, lg: 6 }
    : { xs: 12, sm: 12, md: 8, lg: 6 })

  const SkeletonComponent =
    type === 'featured' ? FeaturedCardSkeleton
    : type === 'collection' ? CollectionCardSkeleton
    : PhotoCardSkeleton

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Col key={i} {...breakpoints}>
          <SkeletonComponent />
        </Col>
      ))}
    </>
  )
}

export function CelebrityCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 skeleton-shimmer" />
      <div className="p-3 text-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2 skeleton-shimmer" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto skeleton-shimmer" />
      </div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden sticky top-24 border border-gray-200 dark:border-gray-700">
      <div className="h-10 skeleton-shimmer" />
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 skeleton-shimmer" />
        ))}
      </div>
    </div>
  )
}
