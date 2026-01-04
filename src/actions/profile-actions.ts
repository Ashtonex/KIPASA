"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  // 1. Get Current User ID safely
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: "Not authenticated", success: false }

  // 2. Extract all fields
  const full_name = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const city = formData.get("city") as string

  // 3. Update Database
  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name,
      phone,
      address,
      city,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id)

  if (error) {
    return { message: "Error updating profile", success: false }
  }

  revalidatePath("/profile")
  return { message: "Profile updated successfully!", success: true }
}