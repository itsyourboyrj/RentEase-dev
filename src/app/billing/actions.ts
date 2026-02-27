'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALLOWED_STATUSES = ['Paid', 'Advance Paid', 'Due', 'Pending', 'Cancelled', 'Partial'] as const

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

export async function recordPayment(billId: string, amount: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (amount < 0) throw new Error('Payment amount cannot be negative')
  if (amount === 0) throw new Error('Payment amount must be greater than zero')

  const { data: bill, error: fetchError } = await supabase.from('bills').select('total_amount').eq('id', billId).single()
  if (fetchError) throw new Error(`Failed to fetch bill: ${fetchError.message}`)
  if (!bill) throw new Error('Bill not found')

  const newStatus = amount >= bill.total_amount ? 'Paid' : 'Partial'

  const { error } = await supabase
    .from('bills')
    .update({
      paid_amount: amount,
      status: newStatus,
      is_paid: newStatus === 'Paid'
    })
    .eq('id', billId)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
}

export async function bulkCreateBills(billsData: any[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!Array.isArray(billsData) || billsData.length === 0) {
    throw new Error('No bills data provided')
  }

  for (const bill of billsData) {
    if (!bill.tenant_id || typeof bill.tenant_id !== 'string') throw new Error('Each bill must have a valid tenant_id')
    if (!bill.billing_month || typeof bill.billing_month !== 'string') throw new Error('Each bill must have a valid billing_month')
    if (typeof bill.previous_reading !== 'number' || !Number.isFinite(bill.previous_reading)) throw new Error('Each bill must have a valid previous_reading')
    if (typeof bill.current_reading !== 'number' || !Number.isFinite(bill.current_reading)) throw new Error('Each bill must have a valid current_reading')
    if (typeof bill.electricity_amount !== 'number' || !Number.isFinite(bill.electricity_amount)) throw new Error('Each bill must have a valid electricity_amount')
    if (typeof bill.rent_amount !== 'number' || !Number.isFinite(bill.rent_amount)) throw new Error('Each bill must have a valid rent_amount')
    if (typeof bill.total_amount !== 'number' || !Number.isFinite(bill.total_amount)) throw new Error('Each bill must have a valid total_amount')
  }

  const { error } = await supabase.from('bills').insert(billsData)

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
