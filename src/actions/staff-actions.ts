"use server"

import { createClient } from "@/lib/supabase/server"
// You need to create this file in your lib folder (see Step 2 below)
import { createAdminClient } from "@/lib/supabase/admin" 
import { revalidatePath } from "next/cache"

/**
 * Internal helper to verify admin status.
 * Uses the standard client to verify the CURRENT logged-in user.
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can manage staff.")
  }
  return true
}

export async function markAsCollected(orderId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "delivered", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", orderId)

  if (error) {
    console.error("Collection Error:", error.message)
    return { success: false, message: error.message }
  }
  
  revalidatePath("/admin/staff/scanner")
  return { success: true }
}

export async function updateStaffRole(userId: string, newRole: string) {
  try {
    await verifyAdmin(); 
    
    // Use the Admin Client for sensitive auth overrides
    const adminClient = await createAdminClient() 

    // 1. Update the Public Profile Table
    const { error: dbError } = await adminClient
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
    
    if (dbError) throw dbError

    // 2. Update Auth Metadata (This requires the Service Role Key)
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, { 
      user_metadata: { role: newRole } 
    })
    
    if (authError) throw authError

    revalidatePath("/admin/staff") 
    return { success: true }
  } catch (err: any) {
    console.error("Update Role Error:", err.message)
    return { success: false, message: err.message }
  }
}

export async function removeStaff(userId: string) {
  try {
    await verifyAdmin();
    const adminClient = await createAdminClient()

    // Downgrade to 'user' in both places using the privileged client
    await adminClient.from("profiles").update({ role: 'user' }).eq("id", userId)
    await adminClient.auth.admin.updateUserById(userId, { 
      user_metadata: { role: 'user' } 
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (err: any) {
    console.error("Remove Staff Error:", err.message)
    return { success: false, message: err.message }
  }
}