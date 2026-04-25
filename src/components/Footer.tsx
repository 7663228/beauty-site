import React from 'react'
import Link from 'next/link'

interface FooterProps {
  showLinks?: boolean
}

export default function Footer({ showLinks = true }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {showLinks && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-pink-400 transition-colors">
                    首页
                  </Link>
                </li>
                <li>
                  <Link href="/dantao" className="hover:text-pink-400 transition-colors">
                    精选单套
                  </Link>
                </li>
                <li>
                  <Link href="/heji" className="hover:text-pink-400 transition-colors">
                    合集打包
                  </Link>
                </li>
                <li>
                  <Link href="/zhinan" className="hover:text-pink-400 transition-colors">
                    新人指南
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">帮助中心</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/zhinan" className="hover:text-pink-400 transition-colors">
                    常见问题
                  </Link>
                </li>
                <li>
                  <Link href="/zhinan" className="hover:text-pink-400 transition-colors">
                    下载解压
                  </Link>
                </li>
                <li>
                  <Link href="/zhinan" className="hover:text-pink-400 transition-colors">
                    VIP说明
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">关于我们</h3>
              <ul className="space-y-2">
                <li>
                  <span className="hover:text-pink-400 transition-colors cursor-pointer">
                    联系客服
                  </span>
                </li>
                <li>
                  <span className="hover:text-pink-400 transition-colors cursor-pointer">
                    商务合作
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">联系方式</h3>
              <ul className="space-y-2 text-sm">
                <li>QQ/微信: 24286070</li>
                <li>客服时间: 9:00-22:00</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© 2024 秀人网. 专业模特写真社区. All rights reserved.</p>
            <p className="mt-2 md:mt-0 text-gray-500">
              本站仅提供图片欣赏及下载服务
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
