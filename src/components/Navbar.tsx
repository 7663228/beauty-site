'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SubMenuItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  badge?: string
  submenu?: SubMenuItem[]
}

const navItems: NavItem[] = [
  {
    label: '首页',
    href: '/',
  },
  {
    label: '秀人摄影',
    href: '/xiuren/xiuren',
  },
  {
    label: '精品摄影',
    href: '/xiuren/boutique',
  },
  {
    label: '丝模摄影',
    href: '/xiuren/sm',
  },
  {
    label: '古风·COS',
    href: '/xiuren/cosplay',
  },
  {
    label: '美图壁纸',
    href: '/mei-tu-xin-shang/',
  },
  {
    label: '加入会员',
    href: '/vip/',
    badge: '限时',
    submenu: [
      { label: 'VIP购买', href: '/vip/' },
      { label: '臻享资源', href: '/sssvip/' },
    ],
  },
  {
    label: '解压说明',
    href: '/5840270.html/',
    badge: '必看',
    submenu: [
      { label: '支付宝【补单链接】', href: '/zhi-fu-bao-bu-dan/' },
      { label: '艾萌攻略', href: '/station/introduction/' },
      { label: '艾萌优势', href: '/superiority/' },
      { label: '免责声明', href: '/disclaimers/' },
    ],
  },
]

interface NavbarProps {
  onSearch?: (query: string) => void
  onTypeChange?: (type: 'single' | 'full') => void
}

export default function Navbar({ onSearch, onTypeChange }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<'single' | 'full'>('single')

  const handleSearch = () => {
    if (searchValue.trim()) {
      window.open(`/?s=${encodeURIComponent(searchValue)}&type=${searchType}`, '_blank')
    }
  }

  const handleTypeChange = (type: 'single' | 'full') => {
    setSearchType(type)
    onTypeChange?.(type)
  }

  const isActive = (item: NavItem) => {
    if (item.href === '/') return pathname === '/'
    return pathname.startsWith(item.href)
  }

  return (
    <header className="site-header">
      <div className="nav-container">
        <div className="logo-wrap">
          <Link href="/" className="logo-link" aria-label="艾萌网|爱萌图库">
            <span className="logo-text">艾萌网</span>
            <span className="logo-sub">爱萌图库</span>
          </Link>
        </div>

        <nav className="main-nav" role="navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li
                key={item.label}
                className={`nav-item ${item.submenu ? 'has-submenu' : ''} ${isActive(item) ? 'active' : ''} ${hoveredItem === item.label ? 'is-hovered' : ''}`}
                onMouseEnter={() => item.submenu && setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.submenu ? item.href : item.href}
                  className="nav-link"
                >
                  {item.label}
                  {item.badge && (
                    <span className="nav-badge">
                      {item.badge}
                    </span>
                  )}
                  {item.submenu && <span className="submenu-arrow">&#9660;</span>}
                </Link>

                {item.submenu && (
                  <ul className="submenu">
                    {item.submenu.map((sub) => (
                      <li key={sub.label}>
                        <Link href={sub.href} className="submenu-link">
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div id="login-reg" className="auth-buttons">
          <Link href="/user" className="btn btn-login">登录</Link>
          <Link href="/user" className="btn btn-reg">注册</Link>
        </div>

        <button
          className="search-trigger"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="搜索"
        >
          <i className="fa fa-search" />
        </button>

        <button className="follow-btn" aria-label="关注">
          关注
        </button>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="菜单"
        >
          <i className="fa fa-bars" />
        </button>
      </div>

      <div className="clearfix" />

      <div className={`search-slide ${searchOpen ? 'open' : ''}`}>
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          role="search"
        >
          <div className="search-type-toggle">
            <button
              type="button"
              className={`type-btn ${searchType === 'single' ? 'active' : ''}`}
              onClick={() => handleTypeChange('single')}
            >
              单套
            </button>
            <button
              type="button"
              className={`type-btn ${searchType === 'full' ? 'active' : ''}`}
              onClick={() => handleTypeChange('full')}
            >
              全套
            </button>
          </div>
          <input
            type="search"
            className="search-input"
            name="s"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="请输入关键词并回车"
            required
          />
          <button type="submit" className="search-submit">
            <span className="search-icon">&#9906;</span>
          </button>
        </form>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav>
            <ul className="mobile-nav-list">
              {navItems.map((item) => (
                <li key={item.label} className={`mobile-nav-item ${isActive(item) ? 'active' : ''}`}>
                  <Link
                    href={item.href}
                    className={`mobile-nav-link ${isActive(item) ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="mobile-badge">{item.badge}</span>
                    )}
                  </Link>
                  {item.submenu && (
                    <ul className="mobile-submenu">
                      {item.submenu.map((sub) => (
                        <li key={sub.label}>
                          <Link
                            href={sub.href}
                            className="mobile-submenu-link"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
