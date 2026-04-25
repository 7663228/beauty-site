'use client'

import React from 'react'
import { Card } from 'antd'
import Link from 'next/link'

interface CollectionCardProps {
  id: string
  title: string
  category: string
  thumbnail: string
  status?: string
  views?: number
}

export default function CollectionCard({
  id,
  title,
  category,
  thumbnail,
  status = '持续更新中',
  views = 0,
}: CollectionCardProps) {
  return (
    <Link href={`/collection/${id}`}>
      <Card
        hoverable
        className="overflow-hidden hover-card"
        cover={
          <div className="hover-card-img relative aspect-square overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/400/400?random=${id}`
              }}
            />
            {/* Status badge */}
            <div className="absolute top-2 left-2">
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                {status}
              </span>
            </div>
            {/* Overlay on hover */}
            <div className="hover-card-overlay" />
          </div>
        }
      >
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate text-center">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {category}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {views > 1000 ? `${(views / 1000).toFixed(1)}k` : views} 浏览
          </p>
        </div>
      </Card>
    </Link>
  )
}
