'use client'

import React from 'react'
import { Row, Col, Typography, Breadcrumb, Card, theme } from 'antd'
import { 
  HomeOutlined, 
  QuestionCircleOutlined, 
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  FileProtectOutlined,
  WarningOutlined
} from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text, Paragraph } = Typography

export default function ZhinanPage() {
  const { token } = theme.useToken()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb
            className="mb-4"
            items={[
              { title: <Link href="/" className="text-white/80 hover:text-white"><HomeOutlined /> 首页</Link> },
              { title: <span className="text-white">新人指南</span> },
            ]}
          />
          <Title level={2} className="!mb-2 !text-white">
            <QuestionCircleOutlined className="mr-2" />
            新人指南
          </Title>
          <Text className="text-white/80">了解秀人网，快速上手</Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Why Choose Us */}
        <Card className="mb-8 shadow-sm">
          <Title level={3} className="mb-6 flex items-center">
            <CheckCircleOutlined className="text-green-500 mr-2" />
            为什么选择秀人网?
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="h-full border-t-4 border-t-blue-500">
                <Title level={4}>1. 图片/视频数量多，更新快</Title>
                <Paragraph className="text-gray-600 dark:text-gray-400">
                  本站已稳定运营五年以上，搜罗了全网各种优质写真和美图，上到大家熟悉的各大名站写真，下到各种网红Coser和美女主播福利私照、视频等，图片视频的种类繁多数量巨大(目前估计在50000G以上)，并且保证会持续更新和不断扩充！
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full border-t-4 border-t-purple-500">
                <Title level={4}>2. 图片质量佳，体验好</Title>
                <Paragraph className="text-gray-600 dark:text-gray-400">
                  选图的质量不会太差，网站排版干净，没有乱七八糟的广告、弹窗，封面也经过精心剪裁和排版，页面看上去清爽整洁，体验良好。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="h-full border-t-4 border-t-pink-500">
                <Title level={4}>3. 全网性价比最高</Title>
                <Paragraph className="text-gray-600 dark:text-gray-400">
                  永久会员目前仅需68元一个，注册后永久免费下载本站所有资源，无任何后续费用，此价格为限时特惠，原价298元，成本不断增加，后续随时恢复原价！！！
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* VIP Info */}
        <Card className="mb-8 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200">
          <div className="text-center py-4">
            <Title level={3} className="text-pink-600 dark:text-pink-400">
              <SafetyCertificateOutlined className="mr-2" />
              VIP会员特权
            </Title>
            <Row gutter={[24, 24]} className="mt-6">
              <Col xs={24} md={8}>
                <div className="text-center">
                  <DollarOutlined className="text-4xl text-pink-500 mb-2" />
                  <Title level={4}>永久会员仅需68元</Title>
                  <Text className="text-gray-600 dark:text-gray-400">
                    一次购买，永久享用，无任何二次收费
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <FileProtectOutlined className="text-4xl text-pink-500 mb-2" />
                  <Title level={4}>全站资源免费下载</Title>
                  <Text className="text-gray-600 dark:text-gray-400">
                    开通VIP后，所有资源任意下载
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center">
                  <CheckCircleOutlined className="text-4xl text-pink-500 mb-2" />
                  <Title level={4}>海量资源持续更新</Title>
                  <Text className="text-gray-600 dark:text-gray-400">
                    每天更新，错过这波再等一年
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="mb-8 shadow-sm">
          <Title level={3} className="mb-6">常见问题</Title>

          <div className="space-y-6">
            <div>
              <Title level={4} className="text-blue-600">关于水印</Title>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                除了官方原图自带的水印外，99%的图片都不会有其他乱七八糟的水印影响观感。
              </Paragraph>
            </div>

            <div>
              <Title level={4} className="text-blue-600">关于解压</Title>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                由于本站集合了好几个写真图片站的内容，所以可能会有不同的解压密码。如果是合集，请以最终下载页的解压密码为准。如果是单套，解压密码一般在本站下载页面的下载链接或提取码旁边。
              </Paragraph>
            </div>

            <div>
              <Title level={4} className="text-blue-600">充值问题</Title>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                理论上来说正常付款不会出现问题，但是也会有部分用户因为网络波动等原因，导致在付款的过程中会有一些小插曲，如果出现类似问题，大可不必惊慌。请查看自己的个人中心会员等级或订单管理，若有异常，请第一时间联系客服。
              </Paragraph>
            </div>

            <div>
              <Title level={4} className="text-green-600">开通VIP后资源需要单独购买吗？</Title>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                开通永久VIP会员后资源无需单独购买，整站所有资源都免费下载。
              </Paragraph>
            </div>

            <div>
              <Title level={4} className="text-red-600">是否可以申请退款？</Title>
              <Paragraph className="text-gray-600 dark:text-gray-400">
                VIP会员属于虚拟服务，购买前认真考虑，付款后不能够申请退款。如果你是购买单个资源，而资源无效，请联系站长补链或者退款。
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Rules */}
        <Card className="shadow-sm" bordered={false}>
          <Title level={3} className="mb-6">
            <WarningOutlined className="text-orange-500 mr-2" />
            违规处罚
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card className="h-full border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-900/20">
                <Title level={4} className="text-red-600">永久封账户：</Title>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>会员开通后举报商户进行退款的用户</li>
                  <li>以任何形式发布广告用户</li>
                  <li>通过技术手段导致本站无法正常运行用户(包括采集本站资源)</li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="h-full border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/20">
                <Title level={4} className="text-orange-600">短期封账户（30天或更久）：</Title>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>任何骂人行为，不管骂谁，先封号30天</li>
                  <li>账号疑似被盗用（请联系客服获取解封）</li>
                </ul>
              </Card>
            </Col>
          </Row>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              <strong>免责声明：</strong>本站所有文章，如无特殊说明或标注，均为本站原创发布。任何个人或组织，在未征得本站同意时，禁止复制、盗用、采集、发布本站内容到任何网站、书籍等各类媒体平台。
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}
