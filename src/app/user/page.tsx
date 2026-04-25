'use client'

import React, { useState, useEffect } from 'react'
import { Row, Col, Typography, Breadcrumb, Card, Tabs, Form, Input, Button, Checkbox, message, Divider, Avatar, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'

const { Title, Text, Paragraph } = Typography

export default function UserPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(userId, 10))
      .single()

    if (data) {
      setUser(data as User)
    }
  }

  const onFinishLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      message.error(error.message || '登录失败')
    } else {
      message.success('登录成功！')
    }
    setLoading(false)
  }

  const onFinishRegister = async (values: { username: string; email: string; password: string }) => {
    setLoading(true)

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          username: values.username,
        },
      },
    })

    if (error) {
      message.error(error.message || '注册失败')
    } else if (data.user) {
      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: parseInt(data.user.id, 10),
          username: values.username,
          user_level: '普通用户',
        })

      if (profileError) {
        console.error('Failed to create user profile:', profileError)
      }

      message.success('注册成功！请查收验证邮件。')
      setActiveTab('login')
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      message.error('退出登录失败')
    } else {
      setUser(null)
      message.success('已退出登录')
    }
  }

  const tabItems = [
    {
      key: 'login',
      label: (
        <span className="flex items-center gap-2">
          <LoginOutlined />
          用户登录
        </span>
      ),
      children: (
        <Form
          form={form}
          name="login"
          onFinish={onFinishLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Checkbox>记住我</Checkbox>
              <Link href="/forgot" className="text-pink-500 hover:text-pink-600">
                忘记密码?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-pink-500 hover:bg-pink-600"
            >
              立即登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'register',
      label: (
        <span className="flex items-center gap-2">
          <UserAddOutlined />
          注册账号
        </span>
      ),
      children: (
        <Form
          name="register"
          onFinish={onFinishRegister}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="确认密码"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意协议')),
              },
            ]}
          >
            <Checkbox>
              我已阅读并同意 <Link href="/agreement" className="text-pink-500">《用户协议》</Link> 和 <Link href="/privacy" className="text-pink-500">《隐私政策》</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-pink-500 hover:bg-pink-600"
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  // If user is logged in, show profile
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Breadcrumb
              className="mb-4"
              items={[
                { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
                { title: <span className="text-white">用户中心</span> },
              ]}
            />
            <Title level={2} className="!mb-2 !text-white">
              <UserOutlined className="mr-2" />
              用户中心
            </Title>
            <Text className="text-white/80">欢迎回来，{user.username}</Text>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Row gutter={24}>
            {/* User Profile Card */}
            <Col xs={24} lg={8}>
              <Card className="text-center">
                <Avatar
                  size={100}
                  src={user.avatar_url}
                  icon={<UserOutlined />}
                  className="mb-4"
                />
                <Title level={4}>{user.username}</Title>
                <Text type="secondary" className="block mb-4">{user.user_level}</Text>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <Text type="secondary">评论数</Text>
                    <Text>{user.comment_count}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">总浏览</Text>
                    <Text>{user.total_views}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">注册时间</Text>
                    <Text>{new Date(user.created_at).toLocaleDateString('zh-CN')}</Text>
                  </div>
                </div>

                <Divider />

                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  block
                >
                  退出登录
                </Button>
              </Card>
            </Col>

            {/* User Actions */}
            <Col xs={24} lg={16}>
              <Card title="我的操作">
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Card size="small" hoverable>
                      <div className="text-center">
                        <Title level={3} className="!mb-1">{user.comment_count}</Title>
                        <Text type="secondary">我的评论</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card size="small" hoverable>
                      <div className="text-center">
                        <Title level={3} className="!mb-1">0</Title>
                        <Text type="secondary">我的收藏</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card size="small" hoverable>
                      <div className="text-center">
                        <Title level={3} className="!mb-1">0</Title>
                        <Text type="secondary">下载记录</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12}>
                    <Card size="small" hoverable>
                      <div className="text-center">
                        <Title level={3} className="!mb-1">-</Title>
                        <Text type="secondary">会员状态</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>

              {/* VIP Benefits */}
              <Card className="mt-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200">
                <Title level={4} className="text-pink-600 dark:text-pink-400 mb-4">
                  会员专享特权
                </Title>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">1</div>
                    <div>
                      <Text strong>全站资源免费下载</Text>
                      <Paragraph className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                        开通VIP后，所有写真、视频资源任意下载
                      </Paragraph>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">2</div>
                    <div>
                      <Text strong>永久会员特权</Text>
                      <Paragraph className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                        一次购买，永久享用，无任何二次收费
                      </Paragraph>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <span className="text-white">用户中心</span> },
            ]}
          />
          <Title level={2} className="!mb-2 !text-white">
            <UserOutlined className="mr-2" />
            用户登录
          </Title>
          <Text className="text-white/80">登录后享受更多会员特权</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={48} justify="center">
          <Col xs={24} lg={12} xl={10}>
            {/* Login/Register Card */}
            <Card className="shadow-lg">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                centered
              />
            </Card>
          </Col>

          <Col xs={24} lg={12} xl={8} className="hidden xl:block">
            {/* Benefits */}
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
              <Title level={4} className="text-pink-600 dark:text-pink-400 mb-4">
                会员专享特权
              </Title>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                    1
                  </div>
                  <div>
                    <Text strong>全站资源免费下载</Text>
                    <Paragraph className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                      开通VIP后，所有写真、视频资源任意下载
                    </Paragraph>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                    2
                  </div>
                  <div>
                    <Text strong>永久会员特权</Text>
                    <Paragraph className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                      一次购买，永久享用，无任何二次收费
                    </Paragraph>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">
                    3
                  </div>
                  <div>
                    <Text strong>海量资源持续更新</Text>
                    <Paragraph className="text-gray-500 dark:text-gray-400 text-sm mb-0">
                      每天更新，错过这波再等一年
                    </Paragraph>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="text-center">
                <Text className="text-gray-500 dark:text-gray-400">
                  还没有账号?
                </Text>
                <Button
                  type="link"
                  onClick={() => setActiveTab('register')}
                  className="text-pink-500"
                >
                  立即注册
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
