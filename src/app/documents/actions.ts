'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const tenant_id = formData.get('tenant_id') as string
  const doc_name = formData.get('name') as string
  const doc_type = formData.get('type') as string

  // Validate inputs
  if (!file || !(file instanceof File) || file.size === 0) throw new Error('No file provided')
  if (!tenant_id?.trim()) throw new Error('Tenant ID is required')
  if (!doc_name?.trim()) throw new Error('Document name is required')

  // Verify the caller owns this tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('owner_id')
    .eq('id', tenant_id)
    .single()
  if (tenant?.owner_id !== user.id) throw new Error('Unauthorized: tenant not found or access denied')

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

  // 3. Save to database — clean up orphaned file if insert fails
  const { error: dbError } = await supabase.from('documents').insert({
    tenant_id,
    name: doc_name,
    file_url: publicUrl,
    file_type: doc_type || null
  })

  if (dbError) {
    await supabase.storage.from('tenant-documents').remove([filePath])
    throw new Error(dbError.message)
  }

  revalidatePath(`/tenants/${tenant_id}`)
}

export async function deleteDocument(docId: string, fileUrl: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify ownership via document -> tenant -> owner_id
  const { data: doc } = await supabase
    .from('documents')
    .select('tenant_id, tenants(owner_id)')
    .eq('id', docId)
    .single()
  if (!doc || (doc.tenants as any)?.owner_id !== user.id) {
    throw new Error('Unauthorized: document not found or access denied')
  }

  // Extract file path from URL
  // URL looks like: .../storage/v1/object/public/tenant-documents/tenant_id/file.jpg
  const pathParts = fileUrl.split('tenant-documents/')
  const filePath = pathParts[1]
  if (!filePath) throw new Error('Invalid file URL: could not extract storage path')

  // Fetch the full document row before deletion (for potential restore)
  const { data: fullDoc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', docId)
    .maybeSingle()

  // Delete DB record first
  const { error: dbError } = await supabase.from('documents').delete().eq('id', docId)
  if (dbError) throw new Error(dbError.message)

  // Delete storage file; if this fails, attempt to restore the DB record
  const { error: storageError } = await supabase.storage.from('tenant-documents').remove([filePath])
  if (storageError) {
    console.error('Storage deletion failed after DB delete:', storageError.message)
    if (fullDoc) {
      const { error: restoreError } = await supabase.from('documents').insert(fullDoc)
      if (restoreError) console.error('Failed to restore document row after storage failure:', restoreError.message)
    }
    throw new Error(storageError.message)
  }

  revalidatePath('/tenants')
}

export async function updateProfilePicture(tenantId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file || !(file instanceof File) || file.size === 0) throw new Error('No file provided')

  // Verify ownership and get old profile URL
  const { data: tenant } = await supabase.from('tenants').select('owner_id, profile_url').eq('id', tenantId).single()
  if (tenant?.owner_id !== user.id) throw new Error('Unauthorized')

  const fileExt = file.name.split('.').pop()
  const filePath = `${tenantId}/profile_${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage.from('tenant-documents').upload(filePath, file, { upsert: true })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage.from('tenant-documents').getPublicUrl(filePath)

  const { error: dbError } = await supabase.from('tenants').update({ profile_url: publicUrl }).eq('id', tenantId)
  if (dbError) {
    // Clean up orphaned file
    await supabase.storage.from('tenant-documents').remove([filePath]).catch((e: unknown) => console.error('Failed to clean up orphaned profile file:', e))
    throw new Error(dbError.message)
  }

  // Remove old profile photo to avoid accumulation
  if (tenant?.profile_url) {
    const oldParts = tenant.profile_url.split('tenant-documents/')
    if (oldParts[1]) {
      await supabase.storage.from('tenant-documents').remove([oldParts[1].split('?')[0]])
    }
  }

  revalidatePath(`/tenants/${tenantId}`)
}

export async function removeProfilePicture(tenantId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: tenant } = await supabase.from('tenants').select('owner_id, profile_url').eq('id', tenantId).single()
  if (tenant?.owner_id !== user.id) throw new Error('Unauthorized')

  // Delete the file from storage
  if (tenant?.profile_url) {
    const pathParts = tenant.profile_url.split('tenant-documents/')
    if (pathParts[1]) {
      const storagePath = pathParts[1].split('?')[0]
      await supabase.storage.from('tenant-documents').remove([storagePath])
    }
  }

  const { error } = await supabase.from('tenants').update({ profile_url: null }).eq('id', tenantId)
  if (error) throw new Error(error.message)

  revalidatePath(`/tenants/${tenantId}`)
}
