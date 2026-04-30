'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import UserAvatarDropdown from '@/components/UserAvatarDropdown'
import { useAuth } from '@/lib/useAuth'

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
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login')
  const { user } = useAuth()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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
          {user ? (
            <UserAvatarDropdown />
          ) : (
            <>
              <button
                onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true) }}
                className="btn btn-login"
              >
                登录
              </button>
              <button
                onClick={() => { console.log('[Navbar] Register button clicked'); setAuthModalTab('register'); setAuthModalOpen(true) }}
                className="btn btn-reg"
              >
                注册
              </button>
            </>
          )}
        </div>

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />

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
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
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
        <>
          {/* Backdrop overlay */}
          <div
            className="mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Left drawer menu */}
          <div className="mobile-drawer">
            {/* Drawer header */}
            <div className="drawer-header">
              <div className="drawer-user">
                {user ? (
                  <Link href="/user" className="drawer-user-link" onClick={() => setMobileMenuOpen(false)}>
                    <img
                      src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                      alt={user.username || '用户'}
                      className="drawer-avatar"
                    />
                    <div className="drawer-user-info">
                      <span className="drawer-username">{user.username || '用户'}</span>
                      <span className="drawer-userlevel">个人中心</span>
                    </div>
                  </Link>
                ) : (
                  <div className="drawer-auth-btns">
                    <button
                      onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true) }}
                      className="drawer-auth-btn drawer-auth-login"
                    >
                      登录
                    </button>
                    <button
                      onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true) }}
                      className="drawer-auth-btn drawer-auth-reg"
                    >
                      注册
                    </button>
                  </div>
                )}
              </div>
              <button
                className="drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="关闭菜单"
              >
                <i className="fa fa-times" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="drawer-nav">
              <ul className="drawer-nav-list">
                {navItems.map((item) => (
                  <li key={item.label} className={`drawer-nav-item ${isActive(item) ? 'active' : ''}`}>
                    <Link
                      href={item.href}
                      className={`drawer-nav-link ${isActive(item) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="drawer-nav-text">{item.label}</span>
                      {item.badge && (
                        <span className="drawer-badge">{item.badge}</span>
                      )}
                    </Link>
                    {item.submenu && (
                      <ul className="drawer-submenu">
                        {item.submenu.map((sub) => (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              className="drawer-submenu-link"
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

            {/* Drawer footer */}
            <div className="drawer-footer">
              <div className="drawer-footer-contact">
                <span className="drawer-footer-label">客服微信</span>
                <span className="drawer-footer-value">i-king88</span>
              </div>
              <div className="drawer-footer-links">
                <Link href="/vip/" className="drawer-footer-link" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa fa-diamond" /> VIP会员
                </Link>
                <Link href="/5840270.html/" className="drawer-footer-link" onClick={() => setMobileMenuOpen(false)}>
                  <i className="fa fa-question-circle" /> 解压说明
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
