'use client'

import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Avatar, Tabs, Badge, Statistic, Spin, message, Typography, Form, Input, Select, Button, Divider, Modal, InputNumber, Table } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  CrownOutlined,
  WalletOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CommentOutlined,
  StarOutlined,
  UserAddOutlined,
  BellOutlined,
  GiftOutlined,
  SafetyOutlined,
  SettingOutlined,
  LogoutOutlined,
  EditOutlined,
  QrcodeOutlined
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/lib/types'
import AuthModal from '@/components/AuthModal'

const { Title, Text, Paragraph } = Typography

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login')
  const router = useRouter()

  // 直接从 URL 读取 tab 参数
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam || 'profile'

  // User stats from website data
  const [stats, setStats] = useState({
    balance: 0.00,
    points: 102,
    orders: 237,
    posts: 0,
    comments: 0,
    collections: 0,
    following: 0,
    followers: 6
  })

  useEffect(() => {
    const init = async () => {
      console.log('[User Page] init called')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[User Page] session:', session?.user?.id)
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
            setLoading(false)
            return
          }
        } catch (e) {
          // Column might not exist, fallback to old method
        }

        // Fallback to old method
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16))
            .single()
          if (data) {
            setUser(data as User)
            setLoading(false)
            return
          }
        } catch (e) {
          // No user found, use session data
        }

        // Fallback: create user from session data if database record not found
        setUser({
          id: parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16),
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '用户',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          user_level: '普通用户',
          created_at: session.user.created_at,
          last_login_at: new Date().toISOString(),
          auth_id: session.user.id
        } as User)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // First try to find by auth_id
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
          // Column might not exist, fallback
        }

        // Fallback to old method
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16))
            .single()
          if (data) {
            setUser(data as User)
            return
          }
        } catch (e) {
          // No user found, use session data
        }

        // Fallback: create user from session data
        setUser({
          id: parseInt(session.user.id.replace(/-/g, '').substring(0, 8), 16),
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '用户',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          user_level: '普通用户',
          created_at: session.user.created_at,
          last_login_at: new Date().toISOString(),
          auth_id: session.user.id
        } as User)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      message.error('退出失败')
    } else {
      message.success('已退出登录')
      setUser(null)
      router.push('/')
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span className="tab-label">
          <UserOutlined />
          <span>资料</span>
        </span>
      ),
      children: <ProfileTab user={user} />
    },
    {
      key: 'membership',
      label: (
        <span className="tab-label">
          <CrownOutlined />
          <span>VIP</span>
        </span>
      ),
      children: <MembershipTab user={user} />
    },
    {
      key: 'credit',
      label: (
        <span className="tab-label">
          <WalletOutlined />
          <span>财富</span>
        </span>
      ),
      children: <CreditTab stats={stats} user={user} />
    },
    {
      key: 'orders',
      label: (
        <span className="tab-label">
          <ShoppingOutlined />
          <span>订单</span>
        </span>
      ),
      children: <OrdersTab />
    },
    {
      key: 'post',
      label: (
        <span className="tab-label">
          <FileTextOutlined />
          <span>文章</span>
        </span>
      ),
      children: <PostTab />
    },
    {
      key: 'comment',
      label: (
        <span className="tab-label">
          <CommentOutlined />
          <span>评论</span>
        </span>
      ),
      children: <CommentTab />
    },
    {
      key: 'collect',
      label: (
        <span className="tab-label">
          <StarOutlined />
          <span>收藏</span>
        </span>
      ),
      children: <CollectTab />
    },
    {
      key: 'following',
      label: (
        <span className="tab-label">
          <UserAddOutlined />
          <span>关注</span>
        </span>
      ),
      children: <FollowingTab />
    },
    {
      key: 'followers',
      label: (
        <span className="tab-label">
          <UserAddOutlined style={{ transform: 'rotate(180deg)' }} />
          <span>粉丝</span>
        </span>
      ),
      children: <FollowersTab />
    },
    {
      key: 'message',
      label: (
        <span className="tab-label">
          <BellOutlined />
          <span>消息</span>
          {stats.orders > 0 && <Badge count={stats.orders} size="small" />}
        </span>
      ),
      children: <MessageTab />
    },
    {
      key: 'promote',
      label: (
        <span className="tab-label">
          <GiftOutlined />
          <span>优惠码</span>
        </span>
      ),
      children: <PromoteTab user={user} />
    }
  ]

  // If not logged in, show auth prompt
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-white/80 hover:text-white">
                <HomeOutlined /> 首页
              </Link>
              <span className="text-white/50">/</span>
              <span className="text-white">用户中心</span>
            </div>
            <Title level={2} className="!mb-2 !text-white">
              <UserOutlined className="mr-2" />
              用户中心
            </Title>
            <Text className="text-white/80">登录后享受更多会员特权</Text>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">
            <UserOutlined className="text-gray-300" />
          </div>
          <Title level={3} className="!text-gray-700 dark:!text-gray-200">登录后可查看用户中心</Title>
          <Paragraph type="secondary" className="mb-8">
            登录后享受更多会员特权，包括免费下载资源、评论互动等
          </Paragraph>
          <div className="flex gap-3 justify-center">
            <Button
              type="primary"
              size="large"
              onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true) }}
              className="bg-pink-500 hover:bg-pink-600 border-0"
            >
              立即登录
            </Button>
            <Button
              size="large"
              onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true) }}
            >
              注册账号
            </Button>
          </div>
        </div>

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialTab={authModalTab}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-white/80 hover:text-white">
              <HomeOutlined /> 首页
            </Link>
            <span className="text-white/50">/</span>
            <span className="text-white">用户中心</span>
          </div>
          <Title level={2} className="!mb-2 !text-white">
            <UserOutlined className="mr-2" />
            用户中心
          </Title>
          <Text className="text-white/80">欢迎回来，{user?.username}</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={24}>
          {/* User Profile Card */}
          <Col xs={24} lg={6}>
            <Card className="user-profile-card mb-6">
              <div className="text-center">
                <Avatar
                  size={100}
                  src={user?.avatar_url}
                  icon={<UserOutlined />}
                  className="mb-4"
                />
                <Title level={4}>{user?.username}</Title>
                <div className="mb-4">
                  {user?.user_level === '普通用户' ? (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      普通会员
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm">
                      {user?.user_level}
                    </span>
                  )}
                </div>

                <div className="user-stats-grid">
                  <div className="stat-item">
                    <span className="stat-value text-orange-500">{stats.points}</span>
                    <span className="stat-label">积分</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value text-green-500">¥{stats.balance.toFixed(2)}</span>
                    <span className="stat-label">余额</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value text-blue-500">{stats.orders}</span>
                    <span className="stat-label">订单</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value text-pink-500">{stats.followers}</span>
                    <span className="stat-label">粉丝</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link href="/user?tab=message" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <BellOutlined className="text-lg" />
                    <span className="text-gray-700 dark:text-gray-200">我的消息</span>
                  </div>
                  <Badge count={3} size="small" />
                </Link>
                <Link href="/user?tab=orders" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <ShoppingOutlined className="text-lg" />
                    <span className="text-gray-700 dark:text-gray-200">我的订单</span>
                  </div>
                  <span className="text-gray-400">{stats.orders}</span>
                </Link>
                <Link href="/user?tab=collect" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <StarOutlined className="text-lg" />
                    <span className="text-gray-700 dark:text-gray-200">我的收藏</span>
                  </div>
                  <span className="text-gray-400">{stats.collections}</span>
                </Link>
                <Link href="/user?tab=membership" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="flex items-center gap-3">
                    <CrownOutlined className="text-lg" />
                    <span className="text-gray-700 dark:text-gray-200">VIP中心</span>
                  </div>
                  <span className="text-pink-500">查看</span>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                <Link 
                  href="/user?tab=profile" 
                  className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition dark:text-white"
                >
                  <EditOutlined />
                  <span>编辑资料</span>
                </Link>
              </div>
            </Card>

            {/* VIP Card */}
            {user?.user_level !== '普通用户' && (
              <Card className="vip-card bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <CrownOutlined className="text-2xl text-pink-500" />
                  <div>
                    <div className="font-bold text-pink-600 dark:text-pink-400">{user?.user_level}</div>
                    <div className="text-xs text-gray-500">享受全站特权</div>
                  </div>
                </div>
                <Link href="/vip" className="text-sm text-pink-500 hover:text-pink-600">
                  续费会员 →
                </Link>
              </Card>
            )}

            {/* Quick Actions */}
            <Card title="快捷操作" className="mb-6">
              <div className="space-y-2">
                <Link href="/user?tab=credit" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <WalletOutlined className="text-pink-500" />
                  <span>充值积分</span>
                </Link>
                <Link href="/user?tab=promote" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <GiftOutlined className="text-orange-500" />
                  <span>邀请返利</span>
                </Link>
                <Link href="/user?tab=message" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <SafetyOutlined className="text-blue-500" />
                  <span>账号安全</span>
                </Link>
              </div>
            </Card>

            {/* Logout */}
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              size="large"
            >
              退出登录
            </Button>
          </Col>

          {/* Tab Content */}
          <Col xs={24} lg={18}>
            <Card className="tab-content-card">
              <Tabs
                activeKey={activeTab}
                onChange={(key) => router.push(`/user?tab=${key}`)}
                items={tabItems}
                className="user-tabs"
                tabPosition="top"
                size="large"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ user }: { user: User | null }) {
  const [formData, setFormData] = useState({
    nickname: user?.username || '',
    gender: '男',
    site: '',
    bio: '',
    qq: '',
    weibo: '',
    wechat: '',
    email: ''
  })

  const handleSubmit = async () => {
    message.success('资料更新成功')
  }

  return (
    <div className="profile-tab">
      <Title level={4} className="mb-6">基本资料</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item label="用户名">
            <Input value={user?.username} disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="UID">
            <Input value="zy9pq3km4" disabled />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="昵称">
            <Input 
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="性别">
            <Select 
              value={formData.gender}
              onChange={(value) => setFormData({...formData, gender: value})}
              options={[
                { value: '男', label: '男' },
                { value: '女', label: '女' }
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item label="个人说明">
            <Input.TextArea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="这个人很懒，什么都没写"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider>社会化信息</Divider>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Form.Item label="QQ">
            <Input 
              value={formData.qq}
              onChange={(e) => setFormData({...formData, qq: e.target.value})}
              placeholder="请填写QQ号码"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="微信号">
            <Input 
              value={formData.wechat}
              onChange={(e) => setFormData({...formData, wechat: e.target.value})}
              placeholder="请填写微信号"
            />
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" onClick={handleSubmit}>
        保存修改
      </Button>
    </div>
  )
}

// Membership Tab Component
function MembershipTab({ user }: { user: User | null }) {
  const isVip = user?.user_level && user.user_level !== '普通用户'

  return (
    <div className="membership-tab">
      <Title level={4} className="mb-6">VIP中心</Title>
      
      <Card className="mb-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg mb-2">当前会员等级</div>
            <div className="text-3xl font-bold">
              {isVip ? user?.user_level : '普通会员'}
            </div>
            {isVip && (
              <div className="text-white/80 mt-2">永久会员特权</div>
            )}
          </div>
          <CrownOutlined style={{ fontSize: 80, opacity: 0.3 }} />
        </div>
      </Card>

      {!isVip && (
        <Card title="开通VIP会员">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <Title level={3}>年费会员</Title>
                <div className="text-3xl font-bold text-pink-500 mb-4">¥218</div>
                <div className="text-gray-500 mb-4">每天仅需 0.6 元</div>
                <Button type="primary" block>
                  立即开通
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center border-pink-500">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-4 py-1 rounded-full text-sm">
                  推荐
                </div>
                <Title level={3}>永久会员</Title>
                <div className="text-3xl font-bold text-pink-500 mb-4">¥298</div>
                <div className="text-gray-500 mb-4">一次购买，永久享用</div>
                <Button type="primary" className="bg-pink-500 border-pink-500" block>
                  立即开通
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="text-center">
                <Title level={3}>季度会员</Title>
                <div className="text-3xl font-bold text-pink-500 mb-4">¥68</div>
                <div className="text-gray-500 mb-4">90天畅享特权</div>
                <Button type="primary" block>
                  立即开通
                </Button>
              </Card>
            </Col>
          </Row>

          <Divider>VIP特权</Divider>

          <Row gutter={[16, 16]}>
            {[
              { icon: '📥', title: '免费下载', desc: '全站资源免费下载' },
              { icon: '🎁', title: '优先体验', desc: '新资源抢先看' },
              { icon: '💎', title: '专属客服', desc: '24小时在线支持' },
              { icon: '🏆', title: '高清画质', desc: '4K超清原图' },
              { icon: '📱', title: '多端通用', desc: '支持所有设备' },
              { icon: '🔒', title: '隐私保护', desc: '安全加密存储' }
            ].map((item, index) => (
              <Col xs={12} md={8} key={index}>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-bold">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {isVip && (
        <Card title="VIP权益">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>全站资源免费下载</span>
              </div>
              <Badge status="success" text="已开通" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>4K超清原图</span>
              </div>
              <Badge status="success" text="已开通" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>专属客服支持</span>
              </div>
              <Badge status="success" text="已开通" />
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Credit Tab Component
function CreditTab({ stats, user }: { stats: any; user: User | null }) {
  const [activeSubTab, setActiveSubTab] = useState('points')
  const [rechargeAmount, setRechargeAmount] = useState<number | null>(null)
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false)
  const [rechargeLoading, setRechargeLoading] = useState(false)
  const [rechargeSuccess, setRechargeSuccess] = useState(false)
  const [balanceRecords, setBalanceRecords] = useState<any[]>([])
  const [pointsRecords, setPointsRecords] = useState<any[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  // 加载用户余额和积分记录
  useEffect(() => {
    if (user) {
      loadRecords()
    }
  }, [user])

  const loadRecords = async () => {
    if (!user) return
    setLoadingRecords(true)
    try {
      // 加载余额记录
      const { data: balanceData } = await supabase
        .from('balance_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setBalanceRecords(balanceData || [])

      // 加载积分记录
      const { data: pointsData } = await supabase
        .from('points_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setPointsRecords(pointsData || [])
    } catch (e) {
      console.error('加载记录失败:', e)
    } finally {
      setLoadingRecords(false)
    }
  }

  // 计算赠送积分（1元=10积分）
  const getBonusPoints = (amount: number) => {
    return amount * 10
  }

  // 打开充值确认弹窗
  const handleRechargeClick = (amount: number) => {
    setRechargeAmount(amount)
    setRechargeModalOpen(true)
    setRechargeSuccess(false)
  }

  // 确认充值 - 模拟支付
  const handleConfirmRecharge = async () => {
    if (!user || !rechargeAmount) return
    setRechargeLoading(true)

    try {
      // 模拟支付流程（实际需要对接支付宝/微信支付）
      // 这里模拟支付成功后的处理
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 计算赠送积分
      const bonusPoints = getBonusPoints(rechargeAmount)
      const totalPoints = bonusPoints

      // 更新用户余额
      await supabase
        .from('users')
        .update({ balance: (user.balance || 0) + rechargeAmount })
        .eq('id', user.id)

      // 添加余额记录
      await supabase.from('balance_records').insert({
        user_id: user.id,
        type: 'recharge',
        amount: rechargeAmount,
        balance_before: user.balance || 0,
        balance_after: (user.balance || 0) + rechargeAmount,
        description: `充值 ¥${rechargeAmount}${bonusPoints > 0 ? `，赠送 ${bonusPoints} 积分` : ''}`
      })

      // 如果有赠送积分，添加积分记录
      if (bonusPoints > 0) {
        await supabase.from('points_records').insert({
          user_id: user.id,
          type: 'bonus',
          amount: bonusPoints,
          description: `充值 ¥${rechargeAmount} 赠送`
        })

        // 更新用户积分
        await supabase
          .from('users')
          .update({ points: (user.points || 0) + bonusPoints })
          .eq('id', user.id)
      }

      setRechargeSuccess(true)
      message.success(`充值成功！¥${rechargeAmount}${bonusPoints > 0 ? `，获得 ${bonusPoints} 积分` : ''}`)

      // 刷新记录
      loadRecords()
    } catch (e) {
      message.error('充值失败，请重试')
      console.error('充值错误:', e)
    } finally {
      setRechargeLoading(false)
    }
  }

  return (
    <div className="credit-tab">
      {/* 充值确认弹窗 */}
      <Modal
        title="确认充值"
        open={rechargeModalOpen}
        onCancel={() => { setRechargeModalOpen(false); setRechargeSuccess(false) }}
        footer={null}
        centered
      >
        {rechargeSuccess ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">✓</div>
            <Title level={4} className="text-green-500">充值成功！</Title>
            <Paragraph>¥{rechargeAmount} 已到账</Paragraph>
            <Button type="primary" onClick={() => { setRechargeModalOpen(false); setRechargeSuccess(false) }}>
              完成
            </Button>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">充值金额</Text>
                  <div className="text-2xl font-bold text-pink-500">¥{rechargeAmount}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">赠送积分</Text>
                  <div className="text-2xl font-bold text-yellow-500">
                    +{getBonusPoints(rechargeAmount || 0)}
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mb-4">
              <Text type="secondary">支付方式</Text>
              <div className="border rounded-lg p-3 mt-1 flex items-center gap-3">
                <QrcodeOutlined className="text-2xl text-green-500" />
                <div>
                  <div className="font-medium">支付宝</div>
                  <Text type="secondary" className="text-xs">推荐使用，享更多优惠</Text>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-4">
              * 充值金额可用于购买单套图集，非VIP用户每次购买将扣减余额
            </div>

            <Button
              type="primary"
              block
              size="large"
              loading={rechargeLoading}
              onClick={handleConfirmRecharge}
              className="bg-pink-500 hover:bg-pink-600 border-0"
            >
              {rechargeLoading ? '支付中...' : '确认支付 ¥' + rechargeAmount}
            </Button>
          </div>
        )}
      </Modal>

      {/* 统计卡片 */}
      <Row gutter={[16, 5]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="balance-card">
            <Statistic
              title="账户余额"
              value={user?.balance || 0}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="积分"
              value={user?.points || 0}
              prefix="📊"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="优惠券"
              value={0}
              prefix="🎟️"
              valueStyle={{ color: '#ec4899' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 积分获取方法 */}
      <Card className="mb-6">
        <Title level={5} className="mb-4">免费获取积分的方法</Title>
        <Row gutter={[16, 5]}>
          <Col xs={24} md={12}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold">1</div>
              <div>
                <div className="font-medium">注册奖励</div>
                <Text type="secondary" className="text-xs">注册即得 100 积分</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold">2</div>
              <div>
                <div className="font-medium">每日签到</div>
                <Text type="secondary" className="text-xs">每天可得 5 积分</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold">3</div>
              <div>
                <div className="font-medium">评论回复</div>
                <Text type="secondary" className="text-xs">每次可得 10 积分，每天2次</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold">4</div>
              <div>
                <div className="font-medium">访问推广</div>
                <Text type="secondary" className="text-xs">每次可得 20 积分，每天5次</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs
          activeKey={activeSubTab}
          onChange={setActiveSubTab}
          items={[
            {
              key: 'points',
              label: '积分明细',
              children: (
                <div>
                  {loadingRecords ? (
                    <div className="py-8 text-center"><Spin /></div>
                  ) : pointsRecords.length > 0 ? (
                    <Table
                      dataSource={pointsRecords}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                      columns={[
                        { title: '时间', dataIndex: 'created_at', render: (v) => new Date(v).toLocaleString('zh-CN') },
                        { title: '类型', dataIndex: 'type', render: (v) => v === 'bonus' ? '获得' : v === 'spend' ? '消费' : v },
                        { title: '积分', dataIndex: 'amount', render: (v) => <span className={v >= 0 ? 'text-green-500' : 'text-red-500'}>{v >= 0 ? '+' : ''}{v}</span> },
                        { title: '说明', dataIndex: 'description' },
                      ]}
                    />
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      暂无积分记录
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'balance',
              label: '余额明细',
              children: (
                <div>
                  {loadingRecords ? (
                    <div className="py-8 text-center"><Spin /></div>
                  ) : balanceRecords.length > 0 ? (
                    <Table
                      dataSource={balanceRecords}
                      rowKey="id"
                      size="small"
                      pagination={{ pageSize: 10 }}
                      columns={[
                        { title: '时间', dataIndex: 'created_at', render: (v) => new Date(v).toLocaleString('zh-CN') },
                        { title: '类型', dataIndex: 'type', render: (v) => v === 'recharge' ? '充值' : v === 'spend' ? '消费' : v === 'refund' ? '退款' : v },
                        { title: '金额', dataIndex: 'amount', render: (v) => <span className={v >= 0 ? 'text-green-500' : 'text-red-500'}>{v >= 0 ? '+' : ''}¥{v.toFixed(2)}</span> },
                        { title: '余额', dataIndex: 'balance_after', render: (v) => `¥${v?.toFixed(2) || '0.00'}` },
                        { title: '说明', dataIndex: 'description' },
                      ]}
                    />
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      暂无余额记录
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'recharge',
              label: '充值',
              children: (
                <div>
                  <Title level={5}>自定义充值金额</Title>
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-lg mb-6">
                    <div className="flex gap-4 items-center mb-4">
                      <span className="text-lg font-medium">充值金额：</span>
                      <InputNumber
                        min={1}
                        max={10000}
                        value={rechargeAmount || 10}
                        onChange={(v) => setRechargeAmount(v || 10)}
                        addonBefore="¥"
                        className="flex-1"
                        size="large"
                        style={{ width: 200 }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      充值比例：1 元 = 10 积分（充值即送积分）
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleRechargeClick(rechargeAmount || 10)}
                      className="bg-pink-500 hover:bg-pink-600 border-0"
                    >
                      立即充值 ¥{rechargeAmount || 10}
                    </Button>
                  </div>

                  <Card title="积分获取说明">
                    <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                      <li>充值比例：1 元 = 10 积分</li>
                      <li>积分可用于购买单套图集</li>
                      <li>VIP会员可免费解锁全部下载链接</li>
                    </ul>
                  </Card>
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  )
}

// Orders Tab Component
function OrdersTab() {
  const [orders] = useState<any[]>([])
  const [loading] = useState(false)

  return (
    <div className="orders-tab">
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">我的订单</Title>
        <Badge count={237} />
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Spin />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <ShoppingOutlined className="text-4xl text-gray-300 mb-4" />
            <Title level={5} type="secondary">暂无订单</Title>
            <Link href="/">
              <Button type="primary">去逛逛</Button>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

// Post Tab Component
function PostTab() {
  const [posts] = useState<any[]>([])

  return (
    <div className="post-tab">
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">我的文章</Title>
      </div>

      <Card>
        <div className="py-12 text-center">
          <FileTextOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无文章</Title>
        </div>
      </Card>
    </div>
  )
}

// Comment Tab Component
function CommentTab() {
  const [comments] = useState<any[]>([])

  return (
    <div className="comment-tab">
      <Title level={4} className="mb-6">我的评论</Title>

      <Card>
        <div className="py-12 text-center">
          <CommentOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无评论</Title>
        </div>
      </Card>
    </div>
  )
}

// Collect Tab Component
function CollectTab() {
  const [collections] = useState<any[]>([])

  return (
    <div className="collect-tab">
      <Title level={4} className="mb-6">我的收藏</Title>

      <Card>
        <div className="py-12 text-center">
          <StarOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无收藏</Title>
        </div>
      </Card>
    </div>
  )
}

// Following Tab Component
function FollowingTab() {
  return (
    <div className="following-tab">
      <Title level={4} className="mb-6">我的关注</Title>

      <Card>
        <div className="py-12 text-center">
          <UserAddOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无关注</Title>
        </div>
      </Card>
    </div>
  )
}

// Followers Tab Component
function FollowersTab() {
  return (
    <div className="followers-tab">
      <Title level={4} className="mb-6">我的粉丝</Title>

      <Card>
        <div className="py-12 text-center">
          <UserOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无粉丝</Title>
        </div>
      </Card>
    </div>
  )
}

// Message Tab Component
function MessageTab() {
  return (
    <div className="message-tab">
      <Title level={4} className="mb-6">我的消息</Title>

      <Card>
        <div className="py-12 text-center">
          <BellOutlined className="text-4xl text-gray-300 mb-4" />
          <Title level={5} type="secondary">暂无消息</Title>
        </div>
      </Card>
    </div>
  )
}

// Promote Tab Component
function PromoteTab({ user }: { user: User | null }) {
  const [copied, setCopied] = useState(false)
  const promoLink = `https://www.aimoeart.com/?aff=${user?.id || 'user'}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promoLink)
    setCopied(true)
    message.success('推广链接已复制')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="promote-tab">
      <Title level={4} className="mb-6">邀请返利</Title>

      <Card className="mb-6">
        <Title level={5}>我的推广链接</Title>
        <Paragraph type="secondary" className="mb-4">
          分享您的专属链接，好友注册后消费您可获得积分奖励
        </Paragraph>
        
        <div className="flex items-center gap-4">
          <Input value={promoLink} readOnly className="flex-1" />
          <Button type="primary" onClick={handleCopy}>
            {copied ? '已复制' : '复制链接'}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={8}>
              <Statistic title="推广人数" value={6} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="获得积分" value={0} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="获得佣金" value="¥0.00" />
            </Col>
          </Row>
        </div>
      </Card>

      <Card title="推广规则">
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
          <li>每成功邀请1位新用户注册，奖励10积分</li>
          <li>被邀请用户消费金额的5%作为佣金奖励</li>
          <li>佣金满100元可申请提现</li>
          <li>推广数据每日更新</li>
        </ul>
      </Card>
    </div>
  )
}
