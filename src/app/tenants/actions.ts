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

export async function updateTenant(tenantId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const rawOccupancy = formData.get('occupancy_count') as string
  const parsedOccupancy = rawOccupancy ? parseInt(rawOccupancy, 10) : undefined

  const updates: Record<string, unknown> = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    aadhar_number: formData.get('aadhar_number') as string,
    gender: formData.get('gender') as string,
    employment_status: formData.get('employment_status') as string,
    marital_status: formData.get('marital_status') as string,
    emergency_contact: formData.get('emergency_contact') as string,
    address: formData.get('address') as string,
  }

  if (Number.isFinite(parsedOccupancy)) {
    updates.occupancy_count = parsedOccupancy
  }

  const { data: updatedRows, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', tenantId)
    .eq('owner_id', user.id)
    .select('id')

  if (error) throw new Error(error.message)
  if (!updatedRows || updatedRows.length === 0) {
    throw new Error('Tenant not found or not owned by user')
  }

  revalidatePath(`/tenants/${tenantId}`)
  revalidatePath('/tenants')
}

export async function checkoutTenant(tenantId: string, flatId: string, finalReading: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Mark tenant as inactive — enforce ownership
  const updatePayload: Record<string, unknown> = {
    is_active: false,
    checkout_date: new Date().toISOString(),
  }
  if (Number.isFinite(finalReading)) {
    updatePayload.final_meter_reading = finalReading
  }

  const { data: updatedRows, error: tError } = await supabase
    .from('tenants')
    .update(updatePayload)
    .eq('id', tenantId)
    .eq('owner_id', user.id)
    .select('id')

  if (tError) throw new Error("Check-out failed: " + tError.message)
  if (!updatedRows || updatedRows.length === 0) {
    throw new Error("Check-out failed: tenant not found or not owned by user")
  }

  // 2. Mark flat as vacant
  const { error: fError } = await supabase
    .from('flats')
    .update({ is_occupied: false })
    .eq('id', flatId)

  if (fError) throw new Error("Failed to update flat status: " + fError.message)

  revalidatePath('/tenants')
  revalidatePath('/flats')
}
