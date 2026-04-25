'use client'

import React from 'react'
import { Card } from 'antd'
import { FireOutlined } from '@ant-design/icons'
import Link from 'next/link'

interface RandomRecommendProps {
  title: string
  source: string
  date: string
  url: string
}

export default function RandomRecommend({
  title,
  source,
  date,
  url,
}: RandomRecommendProps) {
  return (
    <Link href={url}>
      <Card 
        size="small" 
        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <FireOutlined className="text-orange-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              [{source}] {title}
            </span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
            {date}
          </span>
        </div>
      </Card>
    </Link>
  )
}
