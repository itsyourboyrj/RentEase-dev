'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function getExtFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return map[mimeType] || 'jpg'
}

export async function updateOwnerSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const upiId = formData.get('upiId') as string
  const lang = formData.get('lang') as string
  const profileFile = formData.get('profileFile') as File | null
  const qrFile = formData.get('qrFile') as File | null

  // Validate required fields
  if (!fullName?.trim()) return { error: "Name is required" }
  if (!lang?.trim()) return { error: "Language preference is required" }

  const updates: any = {
    full_name: fullName.trim(),
    phone: phone?.trim() || null,
    upi_id: upiId?.trim() || null,
    preferred_lang: lang
  }

  if (profileFile && profileFile instanceof File && profileFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(profileFile.type)) {
      return { error: `Profile photo must be an image (${ALLOWED_IMAGE_TYPES.join(', ')})` }
    }
    const ext = getExtFromMime(profileFile.type)
    const path = `owners/${user.id}/profile.${ext}`
    const { error: upError } = await supabase.storage
      .from('tenant-documents')
      .upload(path, profileFile, {
        upsert: true,
        contentType: profileFile.type,
        cacheControl: '0',
      })
    if (upError) return { error: "Profile upload failed: " + upError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('tenant-documents')
      .getPublicUrl(path)
    updates.profile_url = `${publicUrl}?t=${Date.now()}`
  }

  if (qrFile && qrFile instanceof File && qrFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(qrFile.type)) {
      return { error: `QR image must be an image (${ALLOWED_IMAGE_TYPES.join(', ')})` }
    }
    const ext = getExtFromMime(qrFile.type)
    const path = `owners/${user.id}/upi_qr.${ext}`
    const { error: qrUpError } = await supabase.storage
      .from('tenant-documents')
      .upload(path, qrFile, {
        upsert: true,
        contentType: qrFile.type,
        cacheControl: '0',
      })
    if (qrUpError) return { error: "QR upload failed: " + qrUpError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('tenant-documents')
      .getPublicUrl(path)
    updates.upi_qr_url = `${publicUrl}?t=${Date.now()}`
  }

  const { error } = await supabase.from('owners').update(updates).eq('id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function removeOwnerFile(type: 'profile' | 'qr') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const column = type === 'profile' ? 'profile_url' : 'upi_qr_url'
  const storagePrefix = type === 'profile' ? 'profile' : 'upi_qr'

  // Delete file from storage (try both common extensions)
  for (const ext of ['jpg', 'png', 'webp', 'gif']) {
    const path = `owners/${user.id}/${storagePrefix}.${ext}`
    await supabase.storage.from('tenant-documents').remove([path])
  }

  const { error } = await supabase.from('owners').update({ [column]: null }).eq('id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const newPassword = formData.get('newPassword') as string
  const currentPassword = formData.get('currentPassword') as string

  if (!currentPassword?.trim()) {
    return { error: 'Current password is required' }
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  // Get current user email for re-authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Not authenticated' }

  // Reauthenticate to verify current password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (authError) return { error: 'Current password is incorrect' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export const changePassword = updatePassword
