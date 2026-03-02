'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Allowlist of tables that can be deleted via this generic endpoint.
// RLS policies provide defense-in-depth on top of these checks.
const ALLOWED_TABLES = ['buildings', 'tenants', 'flats', 'bills', 'documents'] as const
type AllowedTable = (typeof ALLOWED_TABLES)[number]

// Maps each table to how we resolve the owner_id for a given record.
const OWNERSHIP_CONFIG: Record<AllowedTable, { ownerField?: string; join?: string }> = {
  buildings: { ownerField: 'owner_id' },
  tenants: { ownerField: 'owner_id' },
  flats: { join: 'buildings(owner_id)' },
  bills: { join: 'tenants(owner_id)' },
  documents: { join: 'tenants(owner_id)' },
}

export async function deleteEntity(table: string, id: string) {
  if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
    return { error: 'Invalid table' }
  }
  const validTable = table as AllowedTable

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const config = OWNERSHIP_CONFIG[validTable]

  // Verify ownership before deleting
  if (config.ownerField) {
    const { data: record, error: fetchError } = await supabase
      .from(validTable)
      .select(config.ownerField)
      .eq('id', id)
      .single()

    if (fetchError || !record) return { error: 'Record not found' }
    if ((record as Record<string, unknown>)[config.ownerField!] !== user.id) {
      return { error: 'Unauthorized' }
    }
  } else if (config.join) {
    const { data: record, error: fetchError } = await supabase
      .from(validTable)
      .select(`id, ${config.join}`)
      .eq('id', id)
      .single()

    if (fetchError || !record) return { error: 'Record not found' }
    const joined = (record as Record<string, unknown>)[config.join!.split('(')[0]] as Record<string, unknown> | null
    if (!joined || joined.owner_id !== user.id) {
      return { error: 'Unauthorized' }
    }
  }

  const { error } = await supabase.from(validTable).delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function initiateAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Not authenticated' }

  const { error } = await supabase.auth.signInWithOtp({ email: user.email })
  if (error) return { error: error.message }
  return { success: true }
}

export async function confirmAccountDeletion(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Not authenticated' }

  // 1. Verify OTP
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: user.email,
    token,
    type: 'email',
  })
  if (verifyError) return { error: 'Invalid or expired code' }

  // 2. Delete owner record (cascades to related data via foreign keys)
  const { error: deleteError } = await supabase.from('owners').delete().eq('id', user.id)
  if (deleteError) return { error: `Failed to delete account data: ${deleteError.message}` }

  // 3. Delete the auth user via admin client
  const adminClient = createAdminClient()
  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (authDeleteError) return { error: `Failed to remove auth account: ${authDeleteError.message}` }

  // 4. Sign out
  await supabase.auth.signOut()
  return { success: true }
}
