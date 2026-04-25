'use client'

import React from 'react'
import Link from 'next/link'

interface FeaturedCardProps {
  id: string
  title: string
  thumbnail: string
  subtitle?: string
  count?: number
  isNew?: boolean
}

export default function FeaturedCard({
  id,
  title,
  thumbnail,
  subtitle,
  count,
  isNew = false,
}: FeaturedCardProps) {
  return (
    <Link href={`/photo/${id}`} className="hover-card block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="hover-card-img relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={thumbnail}
          alt={title}
          width={300}
          height={400}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/300/400?random=${id}`
          }}
        />
        <div className="hover-card-overlay" />
        <div className="absolute top-2 left-2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5">
            ★ 精选
          </span>
        </div>
        {isNew && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              NEW
            </span>
          </div>
        )}
      </div>
      <div className="p-2 space-y-0.5 text-center">
        <h3 className="font-semibold text-gray-800 dark:text-white truncate text-xs leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
        {count && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {count}P
          </p>
        )}
      </div>
    </Link>
  )
}
