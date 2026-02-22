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
