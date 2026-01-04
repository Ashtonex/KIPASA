"use server"

import { createClient } from "@/lib/supabase/server"

export async function getShippingMethods() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("shipping_methods")
    .select("*")
    .eq("is_active", true) // Ensure this column was created in Step 1
    .order("price", { ascending: true })

  if (error) {
    // This logs the empty {} error you saw earlier if RLS or columns are wrong
    console.error("Error fetching shipping:", error)
    return []
  }

  return data
}