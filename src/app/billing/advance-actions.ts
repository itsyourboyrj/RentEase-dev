'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAdvancePayment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tenantId = formData.get('tenantId') as string
  if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
    throw new Error('Tenant ID is required')
  }

  const amount = parseFloat(formData.get('amount') as string)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number')
  }

  // Use atomic increment via RPC to avoid lost updates under concurrency
  const { error } = await (supabase.rpc as any)('increment_advance_balance', {
    tenant_id: tenantId,
    increment_amount: amount
  })

  if (error) throw new Error(error.message)

  revalidatePath('/billing')
  revalidatePath('/tenants')
  return { success: true }
}
