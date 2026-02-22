'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const tenant_id = formData.get('tenant_id') as string
  const doc_name = formData.get('name') as string
  const doc_type = formData.get('type') as string

  if (!file || file.size === 0) throw new Error("No file provided")

  // 1. Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const filePath = `${tenant_id}/${Math.random()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('tenant-documents')
    .upload(filePath, file)

  if (uploadError) throw new Error(uploadError.message)

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('tenant-documents')
    .getPublicUrl(filePath)

  // 3. Save to database
  const { error: dbError } = await supabase.from('documents').insert({
    tenant_id,
    name: doc_name,
    file_url: publicUrl,
    file_type: doc_type
  })

  if (dbError) throw new Error(dbError.message)

  revalidatePath(`/tenants/${tenant_id}`)
}

export async function deleteDocument(docId: string, fileUrl: string) {
  const supabase = await createClient()

  // Extract file path from URL
  // URL looks like: .../storage/v1/object/public/tenant-documents/tenant_id/file.jpg
  const pathParts = fileUrl.split('tenant-documents/')
  const filePath = pathParts[1]

  await supabase.storage.from('tenant-documents').remove([filePath])
  await supabase.from('documents').delete().eq('id', docId)

  revalidatePath('/tenants')
}

export async function updateProfilePicture(tenantId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) return

  const fileExt = file.name.split('.').pop()
  const filePath = `${tenantId}/profile_${Math.random()}.${fileExt}`

  await supabase.storage.from('tenant-documents').upload(filePath, file)

  const { data: { publicUrl } } = supabase.storage
    .from('tenant-documents')
    .getPublicUrl(filePath)

  await supabase.from('tenants').update({ profile_url: publicUrl }).eq('id', tenantId)

  revalidatePath(`/tenants/${tenantId}`)
}

export async function removeProfilePicture(tenantId: string) {
  const supabase = await createClient()
  await supabase.from('tenants').update({ profile_url: null }).eq('id', tenantId)
  revalidatePath(`/tenants/${tenantId}`)
}
