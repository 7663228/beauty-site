'use client'

import React from 'react'
import Link from 'next/link'

interface PhotoCardProps {
  id: string
  title: string
  subtitle?: string
  thumbnail: string
  date?: string
  views?: number
  downloads?: number
  count?: number
  videos?: number
  size?: string
  category?: string
  no?: string
  showDetails?: boolean
}

export default function PhotoCard({
  id,
  title,
  subtitle,
  thumbnail,
  date,
  views = 0,
  downloads = 0,
  count,
  videos = 0,
  size,
  category,
  no,
  showDetails = true,
}: PhotoCardProps) {
  return (
    <Link href={`/photo/${id}`} className="hover-card block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="hover-card-img relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/300/400?random=${id}`
          }}
        />
        <div className="hover-card-overlay" />
        {videos > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>▶</span> 含视频
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        {category && no && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            [{category}] {no}
          </div>
        )}
        <h3 className="font-semibold text-gray-800 dark:text-white truncate w-full" style={{ maxWidth: '100%' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}

        {showDetails && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1.5 border-t dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span>👁 {(views / 1000).toFixed(1)}k</span>
              <span>⬇ {(downloads / 1000).toFixed(1)}k</span>
            </div>
            {date && <span>{date}</span>}
          </div>
        )}

        {showDetails && (count || size) && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {count && <span>{count}P</span>}
            {videos > 0 && <span>{videos}V</span>}
            {size && <span>{size}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
