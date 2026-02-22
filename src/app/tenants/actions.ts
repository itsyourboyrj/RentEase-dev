'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTenant(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const flat_id = formData.get('flat_id') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const join_date = formData.get('join_date') as string
  const security_deposit = parseFloat(formData.get('security_deposit') as string)
  const meter_number = formData.get('meter_number') as string
  const emergency_contact = formData.get('emergency_contact') as string
  const address = formData.get('address') as string

  // 1. Create the tenant
  const { error: tenantError } = await supabase.from('tenants').insert({
    owner_id: user.id,
    flat_id,
    name,
    phone,
    email,
    join_date,
    security_deposit,
    meter_number,
    emergency_contact,
    address,
    is_active: true
  })

  if (tenantError) throw new Error(tenantError.message)

  // 2. Mark the flat as occupied
  const { error: flatError } = await supabase
    .from('flats')
    .update({ is_occupied: true })
    .eq('id', flat_id)

  if (flatError) throw new Error(flatError.message)

  revalidatePath('/tenants')
  revalidatePath('/flats')
}

export async function checkoutTenant(tenantId: string, flatId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Mark tenant as inactive
  const { error: tError } = await supabase
    .from('tenants')
    .update({ is_active: false, checkout_date: new Date().toISOString() })
    .eq('id', tenantId)

  // 2. Mark flat as vacant
  const { error: fError } = await supabase
    .from('flats')
    .update({ is_occupied: false })
    .eq('id', flatId)

  if (tError || fError) throw new Error("Check-out failed")

  revalidatePath('/tenants')
  revalidatePath('/flats')
}
