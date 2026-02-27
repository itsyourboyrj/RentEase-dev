'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFlat(formData: FormData) {
  const supabase = await createClient()

  const building_id = formData.get('building_id') as string
  const flat_code = formData.get('flat_code') as string
  const floor = parseInt(formData.get('floor') as string)
  const rent_amount = parseFloat(formData.get('rent_amount') as string)

  const { error } = await supabase.from('flats').insert({
    building_id,
    flat_code,
    floor,
    rent_amount,
    is_occupied: false
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/buildings/${building_id}`)
}

export async function updateFlatStatus(flatId: string, newStatus: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: flat, error: flatError } = await supabase
    .from('flats')
    .select('id, building_id, buildings(owner_id)')
    .eq('id', flatId)
    .single()

  if (flatError || !flat) throw new Error('Flat not found')

  const building = flat.buildings as { owner_id?: string } | null
  if (!building?.owner_id || building.owner_id !== user.id) {
    throw new Error('Not authorized to update this flat')
  }

  const normalizedStatus = newStatus?.trim().toLowerCase()

  const { data, error } = await supabase
    .from('flats')
    .update({
      status: newStatus,
      is_occupied: normalizedStatus === 'occupied'
    })
    .eq('id', flatId)
    .select()

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Flat not found or update failed')

  revalidatePath('/flats')
  revalidatePath('/buildings')
}
