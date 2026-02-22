'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOwnerSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const fullName = formData.get('fullName') as string
  const upiId = formData.get('upiId') as string
  const lang = formData.get('lang') as string
  const profileFile = formData.get('profileFile') as File
  const qrFile = formData.get('qrFile') as File

  const updates: any = {
    full_name: fullName,
    upi_id: upiId,
    preferred_lang: lang
  }

  if (profileFile && profileFile.size > 0) {
    const path = `owners/${user.id}/profile.jpg`
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

  if (qrFile && qrFile.size > 0) {
    const path = `owners/${user.id}/upi_qr.jpg`
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
  if (!user) return

  const column = type === 'profile' ? 'profile_url' : 'upi_qr_url'
  await supabase.from('owners').update({ [column]: null }).eq('id', user.id)
  revalidatePath('/settings')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const newPassword = formData.get('newPassword') as string
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export const changePassword = updatePassword
