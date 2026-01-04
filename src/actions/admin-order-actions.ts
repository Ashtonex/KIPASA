"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendShippingEmail, sendReadyForPickupEmail } from "@/lib/email"

/**
 * CORE: Update Order Status & Notify Customer
 */
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()
  
  const orderId = formData.get("orderId") as string
  const status = formData.get("status") as string
  const trackingNumber = formData.get("trackingNumber") as string
  
  // 1. Update Database
  const { data: order, error } = await supabase
    .from("orders")
    .update({ 
      status,
      tracking_number: trackingNumber || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select("contact_email, first_name") 
    .single()

  if (error) {
    console.error("Order Update Error:", error.message)
    throw new Error(error.message)
  }

  // 2. TRIGGER: Shipped Notification
  if (status === "shipped" && order?.contact_email) {
    await sendShippingEmail(
      order.contact_email, 
      orderId, 
      trackingNumber
    )
  }

  // 3. TRIGGER: Ready for Pickup Notification
  if (status === "ready_for_pickup" && order?.contact_email) {
    await sendReadyForPickupEmail(
      order.contact_email,
      orderId,
      order.first_name || "Valued Customer"
    )
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin") // Refresh revenue charts
}

/**
 * REVENUE: Confirm Cash Receipt
 * Switches status from 'pending_cash' to 'paid' to lock in revenue.
 */
export async function confirmCashPayment(orderId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "paid",
      updated_at: new Date().toISOString() 
    })
    .eq("id", orderId)
    .eq("status", "pending_cash") // Security: Only allow if it's a COD order

  if (error) {
    console.error("Cash Verification Error:", error.message)
    return { success: false, message: error.message }
  }

  // Refresh dashboard telemetry and order views
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  
  return { success: true }
}