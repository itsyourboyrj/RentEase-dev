'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_STATUSES = ['Paid', 'Advance Paid', 'Due', 'Pending', 'Cancelled'] as const

export async function createBill(formData: FormData) {
  const supabase = await createClient()

  const tenant_id = formData.get('tenant_id') as string
  const billing_month = formData.get('billing_month') as string
  const billing_start_date = formData.get('billing_start_date') as string
  const billing_end_date = formData.get('billing_end_date') as string
  const previous_reading = parseFloat(formData.get('previous_reading') as string)
  const current_reading = parseFloat(formData.get('current_reading') as string)
  const electricity_amount = parseFloat(formData.get('electricity_amount') as string)
  const rent_amount = parseFloat(formData.get('rent_amount') as string)
  const total_amount = parseFloat(formData.get('total_amount') as string)

  const { data, error } = await supabase.from('bills').insert({
    tenant_id,
    billing_month,
    billing_start_date,
    billing_end_date,
    previous_reading,
    current_reading,
    electricity_amount,
    rent_amount,
    total_amount,
    is_paid: false
  }).select().single()

  if (error) throw new Error(error.message)

  revalidatePath('/billing')
  return data // Return the bill data for PDF generation
}

export async function markAsPaid(billId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bills')
    .update({ is_paid: true })
    .eq('id', billId)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
}

export async function updateBillStatus(billId: string, newStatus: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!ALLOWED_STATUSES.includes(newStatus as typeof ALLOWED_STATUSES[number])) {
    throw new Error(`Invalid status: "${newStatus}". Allowed: ${ALLOWED_STATUSES.join(', ')}`)
  }

  const { error } = await supabase
    .from('bills')
    .update({
      status: newStatus,
      is_paid: newStatus === 'Paid' || newStatus === 'Advance Paid'
    })
    .eq('id', billId)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
  revalidatePath('/')
}

export async function deleteBills(billIds: string[]) {
  if (!billIds.length) return

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('bills')
    .delete()
    .in('id', billIds)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
  revalidatePath('/')
}
