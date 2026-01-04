"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Internal helper to verify admin status.
 */
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role?.toLowerCase()
  
  if (role !== 'admin') {
    throw new Error("Unauthorized: Only admins can manage staff.")
  }
  return true
}

// 1. MUST BE EXPORTED: For the Staff Scanner
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

// 2. MUST BE EXPORTED: For Team Management
export async function updateStaffRole(userId: string, newRole: string) {
  try {
    await verifyAdmin(); 
    const supabase = await createClient()

    await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

    await supabase.auth.admin.updateUserById(userId, { 
      user_metadata: { role: newRole } 
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

// 3. MUST BE EXPORTED: For Revoking Access
export async function removeStaff(userId: string) {
  try {
    await verifyAdmin();
    const supabase = await createClient()

    await supabase.from("profiles").update({ role: 'user' }).eq("id", userId)
    await supabase.auth.admin.updateUserById(userId, { 
      user_metadata: { role: 'user' } 
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}