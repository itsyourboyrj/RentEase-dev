import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isSafeRedirect(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return false
  if (/[a-z]+:/i.test(path)) return false
  if (/[\\]/.test(path)) return false
  if (/[\r\n]/.test(path)) return false
  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // If the link has a 'next' param (like /auth/reset-password), use it.
  // Otherwise, default to the home page.
  const rawNext = searchParams.get('next') ?? '/'
  const next = isSafeRedirect(rawNext) ? rawNext : '/'

  if (code) {
    const supabase = await createClient()

    // EXPLICIT HANDSHAKE: Convert the code into a real session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // SUCCESS: The user is now officially logged in.
      // We use origin to ensure it's an absolute URL
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error("Auth Callback Error: Code exchange failed", error.message)
    const errorMsg = encodeURIComponent("Invalid or expired link")
    return NextResponse.redirect(`${origin}/login?error=${errorMsg}`)
  }

  // FAIL: No code provided
  console.error("Auth Callback Error: No code parameter provided")
  const errorMsg = encodeURIComponent("Invalid or expired link")
  return NextResponse.redirect(`${origin}/login?error=${errorMsg}`)
}
