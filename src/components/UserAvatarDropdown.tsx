'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, Badge, Spin, message } from 'antd'
import {
  UserOutlined,
  BellOutlined,
  CrownOutlined,
  WalletOutlined,
  ShoppingOutlined,
  StarOutlined,
  SettingOutlined,
  LogoutOutlined,
  GiftOutlined,
  DownOutlined
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'
import AuthModal from '@/components/AuthModal'

export default function UserAvatarDropdown() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const init = async () => {
      console.log('[UserAvatarDropdown] init called')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[UserAvatarDropdown] session:', session?.user?.id)
      if (session?.user) {
        // First try to find by auth_id (Supabase Auth UUID)
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()
          if (data) {
            setUser(data as User)
            return
          }
        } catch (e) {
          // Column might not exist
        }

        // Fallback: try to find by email
        if (session.user.email) {
          try {
            const { data: userByEmail } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single()
            if (userByEmail) {
              setUser(userByEmail as User)
              return
            }
          } catch (e) {
            // Email column might not exist
          }
        }

        // Last fallback: use old ID derivation logic
        const derivedId = parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16)
        try {
          const { data: userById } = await supabase
            .from('users')
            .select('*')
            .eq('id', derivedId)
            .single()
          if (userById) {
            setUser(userById as User)
            return
          }
        } catch (e) {
          // User not found by derived ID
        }

        // If no user found in database but we have a valid auth session,
        // create a temporary user object from auth metadata
        const tempUser: User = {
          id: derivedId,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '用户',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          user_level: '普通用户',
          created_at: session.user.created_at,
          last_login_at: new Date().toISOString(),
          comment_count: 0,
          total_views: 0,
        }
        setUser(tempUser)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[UserAvatarDropdown] onAuthStateChange:', _event, session?.user?.id)
      if (session?.user) {
        // First try to find by auth_id (Supabase Auth UUID)
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()
          if (data) {
            setUser(data as User)
            return
          }
        } catch (e) {
          // Column might not exist
        }

        // Fallback: try to find by email
        if (session.user.email) {
          try {
            const { data: userByEmail } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single()
            if (userByEmail) {
              setUser(userByEmail as User)
              return
            }
          } catch (e) {
            // Email column might not exist
          }
        }

        // Last fallback: use old ID derivation logic
        const derivedId = parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16)
        try {
          const { data: userById } = await supabase
            .from('users')
            .select('*')
            .eq('id', derivedId)
            .single()
          if (userById) {
            setUser(userById as User)
            return
          }
        } catch (e) {
          // User not found by derived ID
        }

        // If no user found in database but we have a valid auth session,
        // create a temporary user object from auth metadata
        const tempUser: User = {
          id: derivedId,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '用户',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          user_level: '普通用户',
          created_at: session.user.created_at,
          last_login_at: new Date().toISOString(),
          comment_count: 0,
          total_views: 0,
        }
        setUser(tempUser)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(false)
      setHoveredItem(null)
    }, 200)
  }

  const handleMenuEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setHoveredItem(key)
  }

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredItem(null)
    }, 200)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      message.error('退出失败')
    } else {
      message.success('已退出登录')
      setUser(null)
      setVisible(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="user-avatar-dropdown">
        <Spin size="small" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-auth-buttons">
        <button
          onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true) }}
          className="btn btn-login"
        >
          登录
        </button>
        <button
          onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true) }}
          className="btn btn-reg"
        >
          注册
        </button>
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </div>
    )
  }

  const menuItems = [
    {
      key: 'user-center',
      label: '用户中心',
      icon: <UserOutlined />,
      href: '/user',
      badge: null
    },
    {
      key: 'message',
      label: '我的消息',
      icon: <BellOutlined />,
      href: '/user?tab=message',
      badge: 3
    },
    {
      key: 'vip',
      label: 'VIP中心',
      icon: <CrownOutlined />,
      href: '/user?tab=membership',
      badge: null
    },
    {
      key: 'wealth',
      label: '我的财富',
      icon: <WalletOutlined />,
      href: '/user?tab=credit',
      badge: null
    },
    {
      key: 'orders',
      label: '我的订单',
      icon: <ShoppingOutlined />,
      href: '/user?tab=orders',
      badge: null
    },
    {
      key: 'favorites',
      label: '我的收藏',
      icon: <StarOutlined />,
      href: '/user?tab=collect',
      badge: null
    },
    {
      key: 'promote',
      label: '邀请返利',
      icon: <GiftOutlined />,
      href: '/user?tab=promote',
      badge: null
    }
  ]

  const getSubmenuItems = (key: string) => {
    const submenus: Record<string, Array<{ label: string; href: string }>> = {
      'user-center': [
        { label: '基本资料', href: '/user?tab=profile' },
        { label: '头像设置', href: '/user?tab=profile' },
        { label: '修改密码', href: '/user?tab=profile' }
      ],
      message: [
        { label: '全部消息', href: '/user?tab=message' },
        { label: '系统通知', href: '/user?tab=message' },
        { label: '互动消息', href: '/user?tab=message' },
        { label: '私信对话', href: '/user?tab=message' }
      ],
      vip: [
        { label: 'VIP中心', href: '/user?tab=membership' },
        { label: '我的订单', href: '/user?tab=orders' },
        { label: '充值记录', href: '/user?tab=credit' }
      ],
      wealth: [
        { label: '积分明细', href: '/user?tab=credit' },
        { label: '余额明细', href: '/user?tab=credit' },
        { label: '充值', href: '/user?tab=credit' }
      ],
      orders: [
        { label: '全部订单', href: '/user?tab=orders' },
        { label: '待支付', href: '/user?tab=orders' },
        { label: '已完成', href: '/user?tab=orders' }
      ],
      favorites: [
        { label: '我的收藏', href: '/user?tab=collect' },
        { label: '我的订阅', href: '/user?tab=collect' },
        { label: '浏览历史', href: '/user?tab=collect' }
      ],
      promote: [
        { label: '邀请返利', href: '/user?tab=promote' },
        { label: '推广链接', href: '/user?tab=promote' },
        { label: '佣金明细', href: '/user?tab=promote' }
      ]
    }

    const items = submenus[key]
    if (!items) return null

    return (
      <div
        className="submenu"
        onMouseEnter={() => handleMenuEnter(key)}
        onMouseLeave={handleMenuLeave}
      >
        <div className="submenu-content">
          {items.map((item, index) => (
            <Link key={index} href={item.href} className="submenu-item">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={dropdownRef}
        className="user-avatar-dropdown"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* User Avatar Trigger */}
        <div className="avatar-trigger">
          <Badge count={3} size="small" offset={[-2, 2]}>
            <Avatar
              src={user.avatar_url}
              icon={<UserOutlined />}
              size={36}
              className="user-avatar"
            />
          </Badge>
          <span className="username-text">{user.username}</span>
          <DownOutlined className="dropdown-arrow" />
        </div>

        {/* Dropdown Popup - 仿照 aimoeart.com 用户卡片风格 */}
        {visible && (
          <div className="dropdown-popup">
            {/* User Info Header */}
            <div className="dropdown-user-header">
              <Link href="/user" className="dropdown-user-link" onClick={() => setVisible(false)}>
                <Avatar
                  src={user.avatar_url}
                  icon={<UserOutlined />}
                  size={64}
                  className="dropdown-user-avatar"
                />
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">
                    {user.username}
                    {user.user_level === 'VIP会员' && (
                      <span className="dropdown-vip-badge">VIP</span>
                    )}
                  </div>
                  <div className="dropdown-user-meta">
                    <span>注册于 {new Date(user.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                    {user.last_login_at && (
                      <>
                        <span className="meta-divider">|</span>
                        <span>最后登录 {new Date(user.last_login_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Menu List */}
            <div className="dropdown-menu">
              {menuItems.map((item) => (
                <div key={item.key} className="menu-wrapper">
                  <Link
                    href={item.href}
                    className="menu-item"
                    onClick={() => setVisible(false)}
                    onMouseEnter={() => handleMenuEnter(item.key)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                    {item.badge && (
                      <Badge count={item.badge} size="small" className="menu-badge" />
                    )}
                    <span className="menu-arrow">›</span>
                  </Link>

                  {/* Submenu */}
                  {hoveredItem === item.key && getSubmenuItems(item.key)}
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="dropdown-footer">
              <Link
                href="/user?tab=profile"
                className="footer-item"
                onClick={() => setVisible(false)}
              >
                <SettingOutlined />
                <span>账号设置</span>
              </Link>
              <button
                className="footer-item footer-logout"
                onClick={handleLogout}
              >
                <LogoutOutlined />
                <span>退出</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  )
}
