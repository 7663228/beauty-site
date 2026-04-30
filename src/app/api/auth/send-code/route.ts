import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const codeStore = new Map<string, {
  code: string
  expiresAt: number
  used: boolean
}>()

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

async function sendEmail(to: string, subject: string, html: string) {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  if (provider === 'resend') {
    if (!process.env.RESEND_API_KEY) {
      console.error('[Email] Resend API key not configured')
      throw new Error('Resend API key not configured')
    }
    try {
      // @ts-ignore - runtime module
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@aimoeart.com',
        to,
        subject,
        html,
      })
      console.log('[Email] Sent via Resend:', result)
      return
    } catch (err: any) {
      console.error('[Email] Resend error:', err?.message || err)
      throw new Error(`Failed to send email: ${err?.message || err}`)
    }
  }

  if (provider === 'smtp') {
    if (!process.env.SMTP_HOST) {
      console.error('[Email] SMTP not configured')
      throw new Error('SMTP not configured')
    }
    try {
      // @ts-ignore - runtime module
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@aimoeart.com',
        to,
        subject,
        html,
      })
      console.log('[Email] Sent via SMTP')
      return
    } catch (err: any) {
      console.error('[Email] SMTP error:', err?.message || err)
      throw new Error(`Failed to send email: ${err?.message || err}`)
    }
  }

  // Development fallback - console only
  console.log(`\n========== EMAIL (DEV) ==========`)
  console.log(`To: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body:\n${html}`)
  console.log(`==================================\n`)
}

function buildEmailHtml(code: string, purpose: string, username?: string) {
  const description = purpose === 'register'
    ? '感谢您注册艾萌网，您的注册验证码如下'
    : purpose === 'login'
    ? '您正在进行登录操作，验证码如下'
    : '您正在进行密码重置操作，验证码如下'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ec4899,#f43f5e);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">艾萌网 | 爱萌图库</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">www.aimoeart.com</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="margin:0 0 8px;color:#333;font-size:16px;">${username ? `亲爱的 ${username}：` : '尊敬的用户：'}</p>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">${description}</p>
      <div style="background:#fff5f8;border:1px solid #fecdd3;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#999;font-size:12px;">您的验证码</p>
        <p style="margin:0;font-size:36px;font-weight:700;color:#ec4899;letter-spacing:8px;font-family:'Courier New',monospace;">${code}</p>
      </div>
      <p style="margin:0 0 16px;color:#999;font-size:12px;text-align:center;">验证码有效期为10分钟，请尽快完成验证</p>
      <div style="border-top:1px solid #f0f0f0;padding-top:16px;">
        <p style="margin:0 0 4px;color:#bbb;font-size:11px;text-align:center;">如果没有发起该请求，请忽略此邮件</p>
        <p style="margin:0;color:#bbb;font-size:11px;text-align:center;">艾萌网 · 2026</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const { email, purpose } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: '无效的邮箱地址' }, { status: 400 })
    }

    if (!['login', 'register', 'forgot'].includes(purpose)) {
      return NextResponse.json({ success: false, error: '无效的操作类型' }, { status: 400 })
    }

    // Rate limiting: max 5 codes per email per hour
    const now = Date.now()
    const hourMs = 60 * 60 * 1000
    const rl = rateLimitStore.get(email) || { count: 0, resetAt: now + hourMs }
    if (now > rl.resetAt) {
      rl.count = 0
      rl.resetAt = now + hourMs
    }
    if (rl.count >= 5) {
      return NextResponse.json({
        success: false,
        error: '发送过于频繁，请稍后再试',
      }, { status: 429 })
    }
    rl.count++
    rateLimitStore.set(email, rl)

    // Generate code and token
    const code = generateCode()
    const token = generateToken()
    const expiresAt = now + 10 * 60 * 1000

    codeStore.set(token, { code, expiresAt, used: false })

    const subject = purpose === 'register'
      ? '【艾萌网】注册验证码'
      : purpose === 'login'
      ? '【艾萌网】登录验证码'
      : '【艾萌网】密码重置验证码'

    await sendEmail(email, subject, buildEmailHtml(code, purpose))

    return NextResponse.json({
      success: true,
      token,
      message: '验证码已发送',
    })
  } catch (error: any) {
    console.error('Send code error:', error)
    return NextResponse.json({
      success: false,
      error: '发送失败，请稍后重试',
    }, { status: 500 })
  }
}

export { codeStore }
