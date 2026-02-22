'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBuilding(formData: FormData) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Extract form data
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const electricity_rate = parseFloat(formData.get('electricity_rate') as string)

  // Insert into database
  const { error } = await supabase.from('buildings').insert({
    name,
    address,
    electricity_rate,
    owner_id: user.id
  })

  if (error) {
    console.error("Error creating building:", error.message)
    throw new Error(error.message)
  }

  // Refresh the page data
  revalidatePath('/buildings')
}
