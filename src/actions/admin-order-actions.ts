"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendShippingEmail, sendReadyForPickupEmail } from "@/lib/email"

/**
 * ============================================================
 * CORE (FORM ACTION)
 * Update Order Status + Tracking + Email Notifications
 * ============================================================
 */
export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()

  const orderId = formData.get("orderId") as string
  const status = formData.get("status") as string
  const trackingNumber = formData.get("trackingNumber") as string | null

  if (!orderId || !status) {
    throw new Error("Missing orderId or status")
  }

  // 1. Update order
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_number: trackingNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("contact_email, first_name")
    .single()

  if (error) {
    console.error("Order Update Error:", error.message)
    throw new Error(error.message)
  }

  // 2. Email: shipped
  if (status === "shipped" && order?.contact_email) {
    await sendShippingEmail(order.contact_email, orderId, trackingNumber || "")
  }

  // 3. Email: ready for pickup
  if (status === "ready_for_pickup" && order?.contact_email) {
    await sendReadyForPickupEmail(
      order.contact_email,
      orderId,
      order.first_name || "Valued Customer"
    )
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

/**
 * ============================================================
 * CORE (DIRECT CALL)
 * Update Order Status via params (backward compatible)
 * ============================================================
 */
export async function updateOrderStatusDirect(
  orderId: string,
  newStatus: string
) {
  const supabase = await createClient()

  if (!orderId || !newStatus) {
    throw new Error("Missing orderId or newStatus")
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) {
    console.error("Direct Order Update Error:", error.message)
    throw new Error("Failed to update order status")
  }

  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

/**
 * ============================================================
 * REVENUE
 * Confirm Cash on Delivery Payment
 * ============================================================
 */
export async function confirmCashPayment(orderId: string) {
  const supabase = await createClient()

  if (!orderId) {
    return { success: false, message: "Missing orderId" }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending_cash") // Security guard

  if (error) {
    console.error("Cash Verification Error:", error.message)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/orders")

  return { success: true }
}
