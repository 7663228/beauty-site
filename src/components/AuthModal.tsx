'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Modal,
  Tabs,
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Divider,
  Typography,
  Tooltip,
  Spin,
  Space,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  WechatOutlined,
  QqOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CloseCircleFilled,
  ScanOutlined,
} from '@ant-design/icons'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

const { Text, Paragraph } = Typography

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

type LoginMethod = 'password' | 'sms' | 'wechat'

export default function AuthModal({ open, onClose, initialTab = 'login' }: AuthModalProps) {
  console.log('[AuthModal] Rendered, open:', open, 'initialTab:', initialTab)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)
  const [loading, setLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password')
  const [form] = Form.useForm()
  const [regForm] = Form.useForm()

  // SMS verification code state for login
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsCountdown, setSmsCountdown] = useState(0)
  const [smsToken, setSmsToken] = useState('')
  const smsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // SMS verification code state for register
  const [regSmsLoading, setRegSmsLoading] = useState(false)
  const [regSmsCountdown, setRegSmsCountdown] = useState(0)
  const [regSmsToken, setRegSmsToken] = useState('')
  const regSmsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // WeChat QR Code state
  const [wechatQrLoading, setWechatQrLoading] = useState(false)
  const [wechatQrUrl, setWechatQrUrl] = useState('')
  const wechatPollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    return () => {
      if (smsTimerRef.current) clearInterval(smsTimerRef.current)
      if (regSmsTimerRef.current) clearInterval(regSmsTimerRef.current)
    }
  }, [])

  const startCountdown = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>, setLoadingFn?: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setLoadingFn?.(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const sendSmsCode = useCallback(async (
    email: string,
    purpose: 'login' | 'register' | 'forgot',
    setter: React.Dispatch<React.SetStateAction<string>>,
    loadingSetter: React.Dispatch<React.SetStateAction<boolean>>,
    timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
    countdownSetter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!email) {
      message.warning('请先输入邮箱地址')
      return
    }
    loadingSetter(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      })
      const data = await res.json()
      if (data.success) {
        setter(data.token)
        startCountdown(countdownSetter, timerRef, loadingSetter)
        message.success(`验证码已发送至 ${email}，请查收`)
      } else {
        message.error(data.error || '发送失败，请稍后重试')
      }
    } catch {
      message.error('网络错误，请稍后重试')
    } finally {
      loadingSetter(false)
    }
  }, [startCountdown])

  // ============ LOGIN ============
  const handleLogin = async (values: Record<string, string>) => {
    setLoading(true)
    try {
      // Always use password login
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        console.error('Login error:', error)
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('邮箱或密码错误，请检查后重试')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('请先验证您的邮箱')
        } else {
          throw error
        }
      }
      message.success('登录成功！')
      onClose()
    } catch (err: any) {
      console.error('Login catch error:', err)
      message.error(err?.message || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  // ============ REGISTER ============
  const handleRegister = async (values: Record<string, string>) => {
    if (!values.smsToken && !regSmsToken) {
      message.warning('请先获取并填写验证码')
      return
    }
    setLoading(true)
    try {
      // Verify SMS code first
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          code: values.smsCode,
          token: values.smsToken || regSmsToken,
          purpose: 'register',
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        message.error(verifyData.error || '验证码错误')
        setLoading(false)
        return
      }

      // Register with Supabase using password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { username: values.username },
        },
      })

      if (signUpError) throw signUpError

      // Create user in users table using client-side supabase
      // Get the current max id from users table
      const { data: maxIdData } = await supabase
        .from('users')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      const newId = maxIdData ? maxIdData.id + 1 : 1

      // Insert user record
      const { error: insertError } = await supabase.from('users').insert({
        id: newId,
        username: values.username,
        email: values.email,
        user_level: '普通用户',
      })

      if (insertError) {
        console.error('Insert user error:', insertError)
        // Continue anyway, user is registered in auth
      }

      // Auto login after successful registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (loginError) {
        // If auto login fails, show success message and switch to login tab
        message.success('注册成功！请登录')
        setActiveTab('login')
        regForm.resetFields()
        setRegSmsToken('')
      } else {
        // Auto login successful
        message.success('注册成功！欢迎加入艾萌网')
        onClose()
      }
    } catch (err: any) {
      message.error(err?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // ============ FORGOT PASSWORD ============
  const [showForgotForm, setShowForgotForm] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSmsLoading, setForgotSmsLoading] = useState(false)
  const [forgotSmsCountdown, setForgotSmsCountdown] = useState(0)
  const [forgotSmsToken, setForgotSmsToken] = useState('')
  const forgotSmsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [forgotForm] = Form.useForm()

  const handleForgotPassword = async (values: Record<string, string>) => {
    if (!values.smsToken && !forgotSmsToken) {
      message.warning('请先获取并填写验证码')
      return
    }
    setForgotLoading(true)
    try {
      // Verify SMS code
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          code: values.smsCode,
          token: values.smsToken || forgotSmsToken,
          purpose: 'forgot',
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        message.error(verifyData.error || '验证码错误')
        setForgotLoading(false)
        return
      }

      // Reset password
      const { error } = await supabase.auth.updateUser({ password: values.newPassword })
      if (error) throw error

      message.success('密码重置成功，请使用新密码登录')
      setShowForgotForm(false)
      setActiveTab('login')
    } catch (err: any) {
      message.error(err?.message || '重置失败，请稍后重试')
    } finally {
      setForgotLoading(false)
    }
  }

  // ============ QQ LOGIN ============
  const handleQqLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_QQ_APP_ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/qq/callback`)
    const qqAuthUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=qq_login`
    window.location.href = qqAuthUrl
  }

  // ============ WECHAT LOGIN ============
  const generateWechatQr = useCallback(async () => {
    if (wechatPollingRef.current) clearInterval(wechatPollingRef.current)
    setWechatQrLoading(true)
    setWechatQrUrl('')

    const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID

    if (!appId || appId === 'your_actual_wechat_app_id' || appId === 'your_wechat_app_id') {
      message.error('请先配置微信 AppID')
      setWechatQrLoading(false)
      return
    }

    try {
      const state = `wechat_${activeTab}_${Date.now()}`
      // Store state in sessionStorage for callback verification
      sessionStorage.setItem('wechat_oauth_state', state)
      sessionStorage.setItem('wechat_oauth_purpose', activeTab)

      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/wechat/callback`)
      const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`

      const qrDataUrl = await QRCode.toDataURL(wechatAuthUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      setWechatQrUrl(qrDataUrl)
    } catch (err) {
      message.error('生成二维码失败')
    } finally {
      setWechatQrLoading(false)
    }
  }, [activeTab])

  const handleWechatLogin = () => {
    setLoginMethod('wechat')
    generateWechatQr()
  }

  const handleSwitchToPasswordLogin = () => {
    setLoginMethod('password')
    if (wechatPollingRef.current) clearInterval(wechatPollingRef.current)
  }

  // ============ SEND SMS HANDLERS ============
  const handleSendLoginSms = () => {
    const email = form.getFieldValue('email')
    sendSmsCode(email, 'login', setSmsToken, setSmsLoading, smsTimerRef, setSmsCountdown)
  }

  const handleSendRegSms = () => {
    const email = regForm.getFieldValue('email')
    sendSmsCode(email, 'register', setRegSmsToken, setRegSmsLoading, regSmsTimerRef, setRegSmsCountdown)
  }

  const handleSendForgotSms = () => {
    const email = forgotForm.getFieldValue('email')
    sendSmsCode(email, 'forgot', setForgotSmsToken, setForgotSmsLoading, forgotSmsTimerRef, setForgotSmsCountdown)
  }

  // ============ RENDER FORMS ============
  const renderLoginForm = () => (
    <Form
      form={form}
      onFinish={handleLogin}
      layout="vertical"
      requiredMark={false}
      className="space-y-4"
    >
      {/* Email */}
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input
          size="large"
          prefix={<UserOutlined className="text-gray-400" />}
          placeholder="邮箱地址"
          className="rounded-lg h-12"
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="请输入密码"
          className="rounded-lg h-12"
          iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        />
      </Form.Item>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between -mt-2">
        <Checkbox defaultChecked className="text-sm text-gray-500">记住我</Checkbox>
        <button
          type="button"
          onClick={() => setShowForgotForm(true)}
          className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
        >
          忘记密码？
        </button>
      </div>

      {/* Login Button */}
      <Form.Item className="mb-0">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="rounded-lg bg-pink-500 hover:bg-pink-600 border-0 h-12 text-base font-medium"
        >
          登 录
        </Button>
      </Form.Item>

      {/* Hints */}
      <div className="bg-gray-50 rounded-lg p-3 mt-2">
        <Text type="secondary" className="text-xs leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5">💡</span>
            <div>
              <p className="m-0">推荐使用QQ邮箱注册登录，未注册可点击下方注册按钮进行注册。</p>
              <p className="m-0 mt-1">收件箱没有收到验证码，请查看垃圾箱！如果还是收不到请联系客服：i-king@foxmail.com</p>
            </div>
          </div>
        </Text>
      </div>
    </Form>
  )

  const renderSmsLoginForm = () => (
    <Form
      form={form}
      onFinish={handleLogin}
      layout="vertical"
      requiredMark={false}
      className="space-y-4"
    >
      {/* Email */}
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input
          size="large"
          prefix={<UserOutlined className="text-gray-400" />}
          placeholder="邮箱地址"
          className="rounded-lg h-12"
        />
      </Form.Item>

      {/* SMS Code */}
      <Form.Item
        name="smsCode"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          size="large"
          prefix={<SafetyOutlined className="text-gray-400" />}
          placeholder="短信验证码"
          maxLength={6}
          className="rounded-lg h-12 flex-1"
        />
      </Form.Item>

      {/* Hidden smsToken field */}
      <Form.Item name="smsToken" hidden>
        <Input />
      </Form.Item>

      {/* SMS Button & Login */}
      <div className="flex gap-2">
        <Button
          size="large"
          onClick={handleSendLoginSms}
          loading={smsLoading}
          disabled={smsCountdown > 0}
          className="rounded-lg h-12 px-4 shrink-0"
        >
          {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="rounded-lg bg-pink-500 hover:bg-pink-600 border-0 h-12 text-base font-medium"
        >
          免密登录
        </Button>
      </div>

      <div className="flex items-center justify-end -mt-2">
        <button
          type="button"
          onClick={() => setShowForgotForm(true)}
          className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
        >
          忘记密码？
        </button>
      </div>
    </Form>
  )

  const renderRegisterForm = () => (
    <Form
      form={regForm}
      onFinish={handleRegister}
      layout="vertical"
      requiredMark={false}
      className="space-y-4"
    >
      {/* Username */}
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { min: 2, message: '用户名至少2个字符' },
          { max: 20, message: '用户名最多20个字符' },
        ]}
      >
        <Input
          size="large"
          prefix={<UserOutlined className="text-gray-400" />}
          placeholder="设置用户名（2-20字符）"
          className="rounded-lg h-12"
        />
      </Form.Item>

      {/* Email */}
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input
          size="large"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="邮箱地址（用于找回密码）"
          className="rounded-lg h-12"
        />
      </Form.Item>

      {/* SMS Code with Get Code Button */}
      <Form.Item
        name="smsCode"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Space.Compact className="w-full">
          <Input
            size="large"
            prefix={<SafetyOutlined className="text-gray-400" />}
            placeholder="请输入验证码"
            maxLength={6}
            className="rounded-lg h-12 flex-1"
          />
          <Button
            size="large"
            type="primary"
            onClick={handleSendRegSms}
            loading={regSmsLoading}
            disabled={regSmsCountdown > 0}
            className="h-12 px-4 rounded-lg bg-pink-500 hover:bg-pink-600 border-pink-500 whitespace-nowrap"
          >
            {regSmsCountdown > 0 ? `${regSmsCountdown}s` : '获取验证码'}
          </Button>
        </Space.Compact>
      </Form.Item>

      {/* Hidden smsToken field */}
      <Form.Item name="smsToken" hidden>
        <Input />
      </Form.Item>

      {/* Password */}
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请设置密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="设置密码（6位以上）"
          className="rounded-lg h-12"
          iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        />
      </Form.Item>

      {/* Confirm Password */}
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
              return Promise.reject(new Error('两次密码输入不一致'))
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="确认密码"
          className="rounded-lg h-12"
          iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        />
      </Form.Item>

      {/* Agreement */}
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
          <span className="text-sm text-gray-500">
            我已阅读并同意 <a href="/agreement" target="_blank" className="text-pink-500 hover:text-pink-600">用户协议</a> 和 <a href="/privacy" target="_blank" className="text-pink-500 hover:text-pink-600">隐私政策</a>
          </span>
        </Checkbox>
      </Form.Item>

      {/* Register Button */}
      <Form.Item className="mb-0">
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="rounded-lg bg-pink-500 hover:bg-pink-600 border-0 h-12 text-base font-medium"
        >
          注 册
        </Button>
      </Form.Item>
    </Form>
  )

  const renderForgotForm = () => (
    <Form
      form={forgotForm}
      onFinish={handleForgotPassword}
      layout="vertical"
      requiredMark={false}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <Text className="text-lg font-medium">找回密码</Text>
        <Paragraph type="secondary" className="text-xs mt-1 mb-0">
          输入注册邮箱，我们将发送验证码帮助您重置密码
        </Paragraph>
      </div>

      {/* Email */}
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input
          size="large"
          prefix={<MailOutlined className="text-gray-400" />}
          placeholder="注册邮箱"
          className="rounded-lg h-12"
        />
      </Form.Item>

      {/* SMS Code */}
      <Form.Item
        name="smsCode"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          size="large"
          prefix={<SafetyOutlined className="text-gray-400" />}
          placeholder="请输入验证码"
          maxLength={6}
          className="rounded-lg h-12 flex-1"
        />
      </Form.Item>

      {/* Hidden smsToken field */}
      <Form.Item name="smsToken" hidden>
        <Input />
      </Form.Item>

      {/* SMS Button */}
      <Button
        size="large"
        onClick={handleSendForgotSms}
        loading={forgotSmsLoading}
        disabled={forgotSmsCountdown > 0}
        className="rounded-lg h-12 w-full"
      >
        {forgotSmsCountdown > 0 ? `已发送 ${forgotSmsCountdown}s` : '获取验证码'}
      </Button>

      {/* New Password */}
      <Form.Item
        name="newPassword"
        rules={[
          { required: true, message: '请设置新密码' },
          { min: 6, message: '密码至少6个字符' },
        ]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="设置新密码（6位以上）"
          className="rounded-lg h-12"
          iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请确认新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次密码输入不一致'))
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          prefix={<LockOutlined className="text-gray-400" />}
          placeholder="确认新密码"
          className="rounded-lg h-12"
          iconRender={(visible) => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
        />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item className="mb-0">
        <Button
          type="primary"
          htmlType="submit"
          loading={forgotLoading}
          block
          size="large"
          className="rounded-lg bg-pink-500 hover:bg-pink-600 border-0 h-12 text-base font-medium"
        >
          重置密码
        </Button>
      </Form.Item>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setShowForgotForm(false)}
          className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
        >
          返回登录
        </button>
      </div>
    </Form>
  )

  const renderWechatLoginPanel = () => (
    <div className="flex flex-col items-center py-6">
      {wechatQrLoading ? (
        <Spin size="large" className="my-8" />
      ) : wechatQrUrl ? (
        <>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <img
              src={wechatQrUrl}
              alt="微信扫码登录"
              className="w-48 h-48"
            />
          </div>
          <Text className="text-sm text-gray-500 mt-4">
            请使用微信扫描二维码
          </Text>
          <Text type="secondary" className="text-xs mt-1">
            扫码后将在微信内确认登录
          </Text>
          <button
            type="button"
            onClick={generateWechatQr}
            className="mt-4 text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
          >
            <ScanOutlined /> 刷新二维码
          </button>
        </>
      ) : (
        <div className="text-center text-gray-400">
          <ScanOutlined className="text-4xl mb-2" />
          <Text type="secondary">加载中...</Text>
        </div>
      )}
      <button
        type="button"
        onClick={handleSwitchToPasswordLogin}
        className="mt-6 text-sm text-gray-500 hover:text-pink-500 transition-colors"
      >
        返回账号密码登录
      </button>
    </div>
  )

  // ============ WECHAT REGISTER ============
  type RegisterMethod = 'email' | 'wechat'

  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('email')

  const renderWechatRegisterPanel = () => (
    <div className="flex flex-col items-center py-6">
      {wechatQrLoading ? (
        <Spin size="large" className="my-8" />
      ) : wechatQrUrl ? (
        <>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <img
              src={wechatQrUrl}
              alt="微信扫码注册"
              className="w-48 h-48"
            />
          </div>
          <Text className="text-sm text-gray-500 mt-4">
            请使用微信扫描二维码
          </Text>
          <Text type="secondary" className="text-xs mt-1">
            扫码后将在微信内确认注册
          </Text>
          <button
            type="button"
            onClick={generateWechatQr}
            className="mt-4 text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
          >
            <ScanOutlined /> 刷新二维码
          </button>
        </>
      ) : (
        <div className="text-center text-gray-400">
          <ScanOutlined className="text-4xl mb-2" />
          <Text type="secondary">加载中...</Text>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setRegisterMethod('email')
          if (wechatPollingRef.current) clearInterval(wechatPollingRef.current)
        }}
        className="mt-6 text-sm text-gray-500 hover:text-pink-500 transition-colors"
      >
        返回邮箱注册
      </button>
    </div>
  )

  const renderRegisterFormContent = () => (
    registerMethod === 'wechat' ? renderWechatRegisterPanel() : renderRegisterForm()
  )

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <div>
          {/* Login Method Toggle */}
          {loginMethod !== 'wechat' ? (
            <>
              <div className="flex mb-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 pb-3 text-sm border-b-2 transition-colors ${loginMethod === 'password' ? 'border-pink-500 text-pink-500 font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  密码登录
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('sms')}
                  className={`flex-1 pb-3 text-sm border-b-2 transition-colors ${loginMethod === 'sms' ? 'border-pink-500 text-pink-500 font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  免密登录
                </button>
              </div>

              {loginMethod === 'password' ? renderLoginForm() : renderSmsLoginForm()}
            </>
          ) : renderWechatLoginPanel()}

          {/* Social Login */}
          <Divider className="my-4" plain>
            <Text type="secondary" className="text-xs">其他登录方式</Text>
          </Divider>

          <div className="flex justify-center gap-4">
            <Tooltip title="QQ登录">
              <button
                type="button"
                onClick={handleQqLogin}
                className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors shadow-sm"
              >
                <QqOutlined className="text-xl" />
              </button>
            </Tooltip>
            <Tooltip title="微信扫码登录">
              <button
                type="button"
                onClick={handleWechatLogin}
                className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors shadow-sm"
              >
                <WechatOutlined className="text-xl" />
              </button>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <div>
          {/* Register Method Toggle */}
          <div className="flex mb-4 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setRegisterMethod('email')}
              className={`flex-1 pb-3 text-sm border-b-2 transition-colors ${registerMethod === 'email' ? 'border-pink-500 text-pink-500 font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              邮箱注册
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMethod('wechat')
                generateWechatQr()
              }}
              className={`flex-1 pb-3 text-sm border-b-2 transition-colors ${registerMethod === 'wechat' ? 'border-pink-500 text-pink-500 font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              微信扫码注册
            </button>
          </div>
          {renderRegisterFormContent()}
        </div>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
      destroyOnHidden
      mask={{ closable: true }}
      closeIcon={<CloseCircleFilled className="text-gray-300 hover:text-gray-500 text-xl" />}
      styles={{
        body: { padding: '28px 28px 24px' },
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <Text className="text-xl font-semibold text-gray-800">Hi！请先登录</Text>
      </div>

      {/* Forgot Password Form */}
      {showForgotForm ? (
        renderForgotForm()
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as any)}
            items={tabItems}
            centered
            className="auth-modal-tabs"
          />

          {/* Bottom Links */}
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            {activeTab === 'login' ? (
              <Text type="secondary" className="text-sm">
                还没有账号？{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  立即注册
                </button>
              </Text>
            ) : (
              <Text type="secondary" className="text-sm">
                已有账号？{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  立即登录
                </button>
              </Text>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
