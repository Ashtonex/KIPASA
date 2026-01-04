"use server"

import { createClient } from "@/lib/supabase/server"

export async function checkPaymentStatus(orderId: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("status, paynow_poll_url")
    .eq("id", orderId)
    .single()

  if (!order) return { status: "not_found" }
  if (order.status === "paid") return { status: "paid" }

  if (order.paynow_poll_url) {
    try {
      const res = await fetch(order.paynow_poll_url, { cache: 'no-store' })
      const text = await res.text()
      const lowerText = text.toLowerCase()
      
      // SUCCESS: Paid or Awaiting Delivery
      if (lowerText.includes("status=paid") || lowerText.includes("status=awaiting+delivery")) {
        await supabase.from("orders").update({ status: "paid" }).eq("id", orderId)
        return { status: "paid" }
      }
      
      // FAILURE: Cancelled or Error
      if (lowerText.includes("status=cancelled") || lowerText.includes("status=error") || lowerText.includes("status=failed")) {
        return { status: "failed" }
      }
    } catch (e) {
      console.error("Polling error:", e)
    }
  }

  return { status: order.status }
}