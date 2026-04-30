import type { Metadata, Viewport } from "next";
import Inter from "next/font/local";
import "./globals.css";
import { ConfigProvider } from "antd";
import zhCN from 'antd/locale/zh_CN';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/useAuth";

const inter = Inter({
  src: "../../public/fonts/Inter-Latin.woff2",
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '秀人网 - 专业模特写真社区',
    template: '%s | 秀人网'
  },
  description: '专业模特写真社区，汇聚高清作品、写真合集、打包精选！',
  keywords: ['写真', '模特', '图片', '视频', 'cosplay', '网红', '秀人网'],
  authors: [{ name: '秀人网' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '秀人网',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white dark:bg-gray-900 antialiased">
        <AuthProvider>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                colorPrimary: '#ec4899',
                colorLink: '#ec4899',
                colorLinkHover: '#db2777',
                borderRadius: 8,
              },
            }}
          >
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
