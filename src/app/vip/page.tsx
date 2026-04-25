'use client'

import React from 'react'
import { Row, Col, Typography, Breadcrumb, Card, Button, Tag, List, Spin, message } from 'antd'
import { HomeOutlined, CrownOutlined, CheckOutlined, RocketOutlined, ThunderboltOutlined, SafetyOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { useVipPackages } from '@/lib/hooks'
import type { VipPackage } from '@/lib/types'

const { Title, Text, Paragraph } = Typography

const vipFeatures = [
  { icon: <CheckOutlined />, text: '全站资源免费下载' },
  { icon: <CheckOutlined />, text: '无二次收费，绝无套路' },
  { icon: <CheckOutlined />, text: '优先获取最新资源' },
  { icon: <CheckOutlined />, text: '专属极速下载通道' },
  { icon: <RocketOutlined />, text: '7x24小时客服支持' },
  { icon: <ThunderboltOutlined />, text: '永久会员专属定制服务' },
]

// 默认VIP套餐（当数据库为空时显示）
const defaultPackages: VipPackage[] = [
  {
    id: 1,
    name: '一个月VIP',
    level: 'monthly',
    price: 19.90,
    original_price: 29.90,
    duration_days: 30,
    description: '开通即享全站资源免费下载',
    features: ['全站资源免费下载', '优先客服支持', '专属下载通道'],
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: '三个月VIP',
    level: 'quarterly',
    price: 49.90,
    original_price: 79.90,
    duration_days: 90,
    description: '三个月VIP，特惠打包',
    features: ['全站资源免费下载', '优先客服支持', '专属下载通道', '每月赠送10次极速下载'],
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: '一年VIP',
    level: 'yearly',
    price: 159.90,
    original_price: 299.90,
    duration_days: 365,
    description: '一年VIP，性价比最高',
    features: ['全站资源免费下载', '优先客服支持', '专属下载通道', '无限极速下载', '优先获取新资源'],
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: '永久VIP',
    level: 'permanent',
    price: 298.00,
    original_price: 398.00,
    duration_days: null,
    description: '永久VIP，尊享全站特权',
    features: ['全站资源免费下载', '7x24小时客服支持', '专属极速下载通道', '无限极速下载', '优先获取新资源', '专属会员群', '专属定制服务'],
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function VipPage() {
  const { data: packages, loading } = useVipPackages()

  // 使用数据库套餐，如果没有则使用默认套餐
  const displayPackages = (packages && packages.length > 0) ? packages : defaultPackages

  const handlePurchase = (pkg: VipPackage) => {
    message.info(`您选择了 ${pkg.name}，价格 ¥${pkg.price}。请登录后完成支付。`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <CrownOutlined className="text-5xl mb-4" />
          <Title level={1} className="!text-white !mb-4">
            开通VIP会员
          </Title>
          <Paragraph className="text-xl text-white/80 mb-6">
            一键解锁全站资源，享受尊贵特权
          </Paragraph>
          
          {/* Features Preview */}
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            {vipFeatures.slice(0, 4).map((feature, index) => (
              <span key={index} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                {feature.icon}
                {feature.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* VIP Packages */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Title level={2} className="text-center mb-8">
          选择您的VIP套餐
        </Title>

        {displayPackages.length > 0 ? (
          <Row gutter={[24, 24]} justify="center">
            {displayPackages.map((pkg, index) => (
              <Col key={pkg.id} xs={24} sm={12} lg={6}>
                <Card
                  className={`
                    h-full relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1
                    ${pkg.level === 'yearly' ? 'border-pink-500 shadow-lg' : ''}
                    ${pkg.level === 'permanent' ? 'border-pink-600 shadow-2xl' : ''}
                  `}
                  cover={
                    pkg.level === 'yearly' ? (
                      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-center py-3">
                        <Tag color="gold" className="text-sm">推荐</Tag>
                      </div>
                    ) : pkg.level === 'permanent' ? (
                      <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white text-center py-3">
                        <Tag color="gold" className="text-sm">最佳选择</Tag>
                      </div>
                    ) : null
                  }
                >
                  <div className="text-center mb-4">
                    <Title level={4} className="!mb-2">
                      {pkg.name}
                    </Title>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Text className="text-3xl font-bold text-pink-500">
                        ¥{pkg.price}
                      </Text>
                      {pkg.original_price && (
                        <Text delete className="text-gray-400">
                          ¥{pkg.original_price}
                        </Text>
                      )}
                    </div>
                    {pkg.original_price && (
                      <Tag color="red">
                        省 ¥{(pkg.original_price - pkg.price).toFixed(2)}
                      </Tag>
                    )}
                    {pkg.duration_days && (
                      <Text type="secondary" className="block mt-2">
                        {pkg.duration_days} 天有效期
                      </Text>
                    )}
                    {pkg.level === 'permanent' && (
                      <Text className="block mt-2 text-pink-500 font-semibold">
                        永久有效 · 一次购买 · 终身享用
                      </Text>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    <Text type="secondary" className="text-sm">
                      {pkg.description}
                    </Text>
                    {pkg.features && pkg.features.length > 0 && (
                      <List
                        size="small"
                        className="mt-3"
                        renderItem={(item) => (
                          <List.Item className="!py-1 !px-0">
                            <CheckOutlined className="text-green-500 mr-2" />
                            <span>{item}</span>
                          </List.Item>
                        )}
                        dataSource={pkg.features}
                      />
                    )}
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    className={`
                      ${pkg.level === 'yearly' ? 'bg-gradient-to-r from-pink-500 to-rose-600 border-none' : ''}
                      ${pkg.level === 'permanent' ? 'bg-gradient-to-r from-pink-600 to-rose-700 border-none' : ''}
                    `}
                    onClick={() => handlePurchase(pkg)}
                  >
                    立即开通
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center py-12">
            <Text type="secondary">暂无套餐信息</Text>
          </Card>
        )}
      </div>

      {/* VIP Benefits */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Title level={2} className="text-center mb-8">
            VIP会员特权
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <SafetyOutlined className="text-5xl text-pink-500 mb-4" />
                <Title level={4}>资源保障</Title>
                <Paragraph type="secondary">
                  所有资源经过人工审核，确保高质量、无缺损。永久会员一次购买，终身享用，持续更新。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <ThunderboltOutlined className="text-5xl text-pink-500 mb-4" />
                <Title level={4}>极速体验</Title>
                <Paragraph type="secondary">
                  专属下载通道，绕过普通用户限速。VIP会员独享极速下载特权，节省宝贵时间。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full text-center">
                <CrownOutlined className="text-5xl text-pink-500 mb-4" />
                <Title level={4}>尊贵服务</Title>
                <Paragraph type="secondary">
                  7x24小时专属客服支持，优先获取最新资源。永久会员更享定制化服务。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Title level={2} className="text-center mb-8">
          常见问题
        </Title>
        <Card>
          <List
            split={false}
            renderItem={(item, index) => (
              <List.Item className="!flex !flex-col !items-start">
                <Text strong className="text-base mb-1">Q{index + 1}: {item.q}</Text>
                <Text type="secondary">A: {item.a}</Text>
              </List.Item>
            )}
            dataSource={[
              { q: 'VIP会员有什么特权？', a: 'VIP会员可以免费下载全站所有资源，无二次收费。永久VIP更是终身有效，持续享受更新。' },
              { q: '下载链接失效怎么办？', a: '我们定期检查资源有效性，如遇链接失效可联系客服重新获取。VIP用户享有优先补链服务。' },
              { q: '如何查看已下载的资源？', a: '登录后可在个人中心查看下载记录和购买历史。' },
              { q: '支持哪些支付方式？', a: '支持支付宝、微信支付、银行卡等主流支付方式。支付安全有保障。' },
            ]}
          />
        </Card>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Title level={2} className="!text-white !mb-4">
            立即成为VIP会员
          </Title>
          <Paragraph className="text-white/80 text-lg mb-6">
            全站资源免费下载，无二次收费，早买早享受
          </Paragraph>
          <Link href="/user">
            <Button type="primary" size="large" className="bg-white text-pink-600 border-none hover:bg-gray-100">
              登录 / 注册
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
