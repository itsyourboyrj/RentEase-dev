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
  const current_reading_date = formData.get('current_reading_date') as string
  const previous_reading = parseFloat(formData.get('previous_reading') as string)
  const current_reading = parseFloat(formData.get('current_reading') as string)
  const electricity_amount = parseFloat(formData.get('electricity_amount') as string)
  const rent_amount = parseFloat(formData.get('rent_amount') as string)

  // 1. Fetch Tenant's current Arrears and Advance
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('advance_balance, total_arrears_balance')
    .eq('id', tenant_id)
    .single()

  if (tenantError || !tenant) {
    throw new Error(`Failed to fetch tenant: ${tenantError?.message ?? 'Tenant not found'}`)
  }

  const arrears = Number(tenant.total_arrears_balance || 0)
  const advance = Number(tenant.advance_balance || 0)

  // 2. Calculate Final Amount
  // Total = (Rent + Elec + Past Arrears) - Existing Advance
  const subTotal = rent_amount + electricity_amount + arrears
  const advanceToApply = Math.min(subTotal, advance)
  const finalTotal = subTotal - advanceToApply

  const { data: bill, error } = await supabase.from('bills').insert({
    tenant_id,
    billing_month,
    billing_start_date,
    billing_end_date,
    current_reading_date,
    previous_reading,
    current_reading,
    electricity_amount,
    rent_amount,
    arrears_included: arrears,
    advance_applied: advanceToApply,
    total_amount: finalTotal,
    remaining_balance: finalTotal,
    status: finalTotal === 0 ? 'Paid' : 'Due',
    is_paid: finalTotal === 0
  }).select().single()

  if (error) throw new Error(error.message)

  // 3. Update Tenant Record: Clear used advance/arrears
  const { error: tenantUpdateError } = await supabase.from('tenants').update({
    advance_balance: advance - advanceToApply,
    total_arrears_balance: 0
  }).eq('id', tenant_id)

  if (tenantUpdateError) {
    console.error(`Failed to update tenant ${tenant_id} after bill ${bill.id}: ${tenantUpdateError.message}`, { tenant_id, advance, advanceToApply })
    // Rollback: delete the created bill to avoid inconsistency
    await supabase.from('bills').delete().eq('id', bill.id)
    throw new Error(`Bill created but tenant update failed: ${tenantUpdateError.message}`)
  }

  revalidatePath('/billing')
  revalidatePath('/')
  return bill
}

export async function markAsPaid(billId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bills')
    .update({ is_paid: true })
    .eq('id', billId)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
  revalidatePath('/')
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

export async function recordPayment(billId: string, amountReceived: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (amountReceived < 0) throw new Error('Payment amount cannot be negative')
  if (amountReceived === 0) throw new Error('Payment amount must be greater than zero')

  const { data: bill, error: fetchError } = await supabase.from('bills').select('*').eq('id', billId).single()
  if (fetchError) throw new Error(`Failed to fetch bill: ${fetchError.message}`)
  if (!bill) throw new Error('Bill not found')

  const currentRemaining = Number(bill.remaining_balance ?? bill.total_amount)
  const newRemaining = Math.max(0, currentRemaining - amountReceived)
  const newPaidAmount = (Number(bill.paid_amount) || 0) + amountReceived
  const newStatus = newRemaining === 0 ? 'Paid' : 'Partial'

  const { error } = await supabase
    .from('bills')
    .update({
      paid_amount: newPaidAmount,
      remaining_balance: newRemaining,
      status: newStatus,
      is_paid: newStatus === 'Paid'
    })
    .eq('id', billId)

  if (error) throw new Error(error.message)

  // If there was an overpayment, add to tenant advance
  if (amountReceived > currentRemaining) {
    const overpayment = amountReceived - currentRemaining
    const { data: tenant, error: tenantFetchError } = await supabase
      .from('tenants')
      .select('advance_balance')
      .eq('id', bill.tenant_id)
      .single()

    if (tenantFetchError || !tenant) {
      console.error(`Failed to fetch tenant ${bill.tenant_id} for overpayment of ${overpayment}:`, tenantFetchError?.message)
      throw new Error(`Payment recorded but failed to apply overpayment to tenant advance: ${tenantFetchError?.message ?? 'Tenant not found'}`)
    }

    const currentAdvance = Number(tenant.advance_balance || 0)
    const { error: advanceUpdateError } = await supabase
      .from('tenants')
      .update({ advance_balance: currentAdvance + overpayment })
      .eq('id', bill.tenant_id)

    if (advanceUpdateError) {
      console.error(`Failed to update advance for tenant ${bill.tenant_id}, overpayment: ${overpayment}:`, advanceUpdateError.message)
      throw new Error(`Payment recorded but failed to update tenant advance: ${advanceUpdateError.message}`)
    }
  }

  revalidatePath('/billing')
  revalidatePath('/')
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

export async function saveInvoiceUrl(billId: string, url: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!url || typeof url !== 'string') throw new Error('Invalid URL')
  try { new URL(url) } catch { throw new Error('URL is not a valid URL') }

  const { error } = await supabase
    .from('bills')
    .update({ pdf_url: url })
    .eq('id', billId)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
}

export async function deleteBills(billIds: string[]) {
  if (!billIds.length) return

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Get PDF URLs before deleting rows
  const { data: billsToCleanup } = await supabase
    .from('bills')
    .select('pdf_url')
    .in('id', billIds)

  // 2. Extract storage paths from URLs
  const filesToDelete = (billsToCleanup ?? [])
    .map(bill => {
      if (!bill.pdf_url) return null
      const parts = bill.pdf_url.split('invoices/')
      return parts[1] // "tenant_id/bill_id.pdf"
    })
    .filter(Boolean) as string[]

  // 3. Delete files from Supabase Storage
  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('invoices')
      .remove(filesToDelete)

    if (storageError) console.error('Storage cleanup error:', storageError.message)
  }

  // 4. Delete DB records
  const { error } = await supabase
    .from('bills')
    .delete()
    .in('id', billIds)

  if (error) throw new Error(error.message)
  revalidatePath('/billing')
  revalidatePath('/')
}
