'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) return { error: error.message }

  // Send welcome email — non-blocking fire-and-forget, failure won't affect signup
  const safeName = escapeHtml(fullName ?? "")
  resend.emails.send({
    from: 'RentEase <onboarding@resend.dev>',
    to: [email],
    subject: 'Welcome to the Empire! 🏢',
    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${safeName}!</h1>
          </div>
          <div style="padding: 40px; color: #374151; line-height: 1.6;">
            <p style="font-size: 18px; font-weight: bold;">नमस्ते / Hello!</p>
            <p>We are excited to have you onboard. RentEase is built to help you manage your properties with clarity and speed.</p>
            <p><strong>Next Steps to get started:</strong></p>
            <ul style="padding-left: 20px;">
              <li>Complete your profile in Settings.</li>
              <li>Add your first Building.</li>
              <li>Onboard your tenants and generate professional UPI-integrated invoices.</li>
            </ul>
            <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 12px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Need help? Just reply to this email.</p>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; border-top: 1px solid #f3f4f6;">
            <p style="font-size: 12px; color: #9ca3af;">&copy; 2026 RentEase Property Management</p>
          </div>
        </div>
      `,
    })
  }).catch((emailError) => {
    console.error("Welcome email failed:", emailError)
  })

  return { success: true }
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Use your Vercel URL in production, localhost in dev
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // REDIRECT TO CALLBACK -> THEN TO RESET PAGE
    redirectTo: `${baseUrl}/auth/callback?next=/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  redirect('/')
}

export async function sendOTP(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function verifyOTP(email: string, token: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Step 1: Send a verification OTP to the user's CURRENT email
export async function authorizeEmailChange() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: "No email found" }

  const { error } = await supabase.auth.signInWithOtp({ email: user.email })
  if (error) return { error: error.message }
  return { success: true }
}

// Step 2: Verify the OTP then update to the NEW email
export async function finalizeEmailChange(token: string, newEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: "Not authenticated" }

  const trimmed = newEmail?.trim()
  if (!trimmed) return { error: "Invalid email" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { error: "Invalid email" }
  if (trimmed.toLowerCase() === user.email.toLowerCase()) return { error: "Email unchanged" }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: user.email,
    token,
    type: 'email',
  })
  if (verifyError) return { error: "Invalid or expired code" }

  const { error: updateError } = await supabase.auth.updateUser({ email: trimmed })
  if (updateError) return { error: updateError.message }
  return { success: true }
}
