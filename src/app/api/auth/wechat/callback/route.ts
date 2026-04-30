'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') || ''
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/?wechat_error=${encodeURIComponent(error)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?wechat_error=no_code', request.url))
  }

  try {
    const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID
    const appSecret = process.env.WECHAT_APP_SECRET

    if (!appId || !appSecret) {
      return NextResponse.redirect(new URL('/?wechat_error=missing_config', request.url))
    }

    // Exchange code for access token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (tokenData.errcode) {
      console.error('WeChat token error:', tokenData)
      return NextResponse.redirect(new URL(`/?wechat_error=${encodeURIComponent(tokenData.errmsg || 'token_error')}`, request.url))
    }

    // Get user info
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
    const userInfoRes = await fetch(userInfoUrl)
    const userInfo = await userInfoRes.json()

    const isRegister = state.includes('register')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists by wechat openid
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .eq('wechat_openid', tokenData.openid)
      .single()

    if (existingUser) {
      // Existing user - create session
      const { data: authData, error: signInError } = await supabaseAdmin.auth.admin.createSession({
        userId: existingUser.id.toString(),
      })

      if (signInError || !authData.session) {
        return NextResponse.redirect(new URL('/?wechat_error=session_error', request.url))
      }

      const sessionJson = Buffer.from(JSON.stringify(authData.session)).toString('base64')
      return NextResponse.redirect(new URL(`/?wechat_callback=1&session=${sessionJson}`, request.url))
    } else if (isRegister) {
      // New user - create account
      const userId = Math.floor(Math.random() * 900000000) + 100000000
      const username = userInfo.nickname || `微信用户${userId.toString().slice(-6)}`

      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId,
        username: username,
        wechat_openid: tokenData.openid,
        wechat_unionid: userInfo.unionid || null,
        avatar_url: userInfo.headimgurl || null,
        user_level: '普通用户',
      })

      if (insertError) {
        console.error('Failed to create WeChat user:', insertError)
        return NextResponse.redirect(new URL('/?wechat_error=create_user_error', request.url))
      }

      // Create auth session
      const { data: authData } = await supabaseAdmin.auth.admin.createSession({
        userId: userId.toString(),
      })

      if (authData.session) {
        const sessionJson = Buffer.from(JSON.stringify(authData.session)).toString('base64')
        return NextResponse.redirect(new URL(`/?wechat_callback=1&session=${sessionJson}`, request.url))
      }

      return NextResponse.redirect(new URL('/?wechat_error=session_error', request.url))
    } else {
      // Login but user not found
      return NextResponse.redirect(new URL('/?wechat_error=user_not_found', request.url))
    }
  } catch (err) {
    console.error('WeChat OAuth error:', err)
    return NextResponse.redirect(new URL('/?wechat_error=unknown_error', request.url))
  }
}
