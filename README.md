# 秀人网 - 专业模特写真社区

一个使用 Next.js、TypeScript、TailwindCSS 和 Ant Design 构建的现代化写真网站。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **UI组件**: Ant Design
- **后端**: Supabase (可选，可使用mock数据)

## 快速开始

1. 克隆项目
2. 安装依赖:
   ```bash
   npm install
   ```

3. 运行开发服务器:
   ```bash
   npm run dev
   ```

4. 打开 [http://localhost:3000](http://localhost:3000)

## 页面结构

- `/` - 首页
- `/dantao` - 精选单套
- `/heji` - 合集打包
- `/zhinan` - 新人指南
- `/user` - 用户登录/注册

## 环境变量

复制 `.env.local.example` 到 `.env.local` 并配置 Supabase。

## 功能特点

- 响应式设计，适配移动端和桌面端
- SEO 优化
- 深色模式支持
- 搜索功能
- 用户认证界面
- VIP 会员介绍
