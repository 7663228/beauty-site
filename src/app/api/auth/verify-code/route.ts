import { NextRequest, NextResponse } from 'next/server'
import { codeStore } from '../send-code/route'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { email, code, token, purpose } = await request.json()

    if (!email || !code || !token) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 })
    }

    // Find the code entry
    const entry = codeStore.get(token)

    if (!entry) {
      return NextResponse.json({ success: false, error: '验证码已过期，请重新获取' }, { status: 400 })
    }

    if (entry.used) {
      return NextResponse.json({ success: false, error: '验证码已被使用' }, { status: 400 })
    }

    if (Date.now() > entry.expiresAt) {
      codeStore.delete(token)
      return NextResponse.json({ success: false, error: '验证码已过期，请重新获取' }, { status: 400 })
    }

    if (entry.code !== code) {
      return NextResponse.json({ success: false, error: '验证码错误' }, { status: 400 })
    }

    // Mark as used
    entry.used = true
    codeStore.delete(token)

    // For login: authenticate user and return session
    if (purpose === 'login') {
      try {
        // Find user by email
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (!user) {
          return NextResponse.json({ success: false, error: '该邮箱未注册，请先注册' }, { status: 400 })
        }

        // For SMS login, we need to create a session directly
        // Get the user's auth ID from metadata if available, or create a session token
        // Since we don't store auth ID, we'll return a success that tells client to use password
        return NextResponse.json({
          success: true,
          requiresPassword: true,
          message: '验证码验证成功，请输入密码完成登录',
          userId: user.id,
        })
      } catch (authError: any) {
        console.error('Auth error:', authError)
        return NextResponse.json({ success: false, error: '登录失败，请稍后重试' }, { status: 500 })
      }
    }

    // For register: verify email is not taken and create user
    if (purpose === 'register') {
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        return NextResponse.json({ success: false, error: '该邮箱已被注册，请直接登录' }, { status: 400 })
      }

      // Create user in Supabase Auth
      const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          username: email.split('@')[0],
        }
      })

      if (signUpError) {
        console.error('Sign up error:', signUpError)
        return NextResponse.json({ success: false, error: '注册失败，请稍后重试' }, { status: 500 })
      }

      // Generate a unique ID for the users table (sequential)
      // First try to get the max id
      const { data: maxIdData } = await supabaseAdmin
        .from('users')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      const newId = maxIdData ? maxIdData.id + 1 : 1

      // Create user in users table with auth_id
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: newId,
        username: email.split('@')[0],
        email: email,
        user_level: '普通用户',
        auth_id: authData.user.id,
      })

      if (insertError) {
        console.error('Insert user error:', insertError)
      }

      return NextResponse.json({
        success: true,
        message: '注册成功，请登录',
      })
    }

    // For forgot: verify user exists
    if (purpose === 'forgot') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!user) {
        return NextResponse.json({ success: false, error: '该邮箱未注册' }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, message: '验证成功' })
  } catch (error: any) {
    console.error('Verify code error:', error)
    return NextResponse.json({ success: false, error: '验证失败，请稍后重试' }, { status: 500 })
  }
}
