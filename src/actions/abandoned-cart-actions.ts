"use server"

import { createClient } from "@/lib/supabase/server"
import { sendAbandonedCartEmail } from "@/lib/email"

export async function processAbandonedCarts() {
  const supabase = await createClient()
  
  // Find orders created more than 2 hours ago that are still 'pending'
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: abandonedOrders } = await supabase
    .from("orders")
    .select(`
      id, 
      contact_email, 
      first_name, 
      order_items (products (name), quantity)
    `)
    .eq("status", "pending")
    .lt("created_at", twoHoursAgo)
    .is("abandoned_email_sent", false) // Ensure you add this boolean column to your DB

  if (!abandonedOrders) return;

  for (const order of abandonedOrders) {
    // Map order items for the email template
    const items = order.order_items.map((oi: any) => ({
      name: oi.products.name,
      quantity: oi.quantity
    }))

    const { success } = await sendAbandonedCartEmail(
      order.contact_email, 
      order.first_name, 
      items
    )

    if (success) {
      // Mark as sent so we don't spam the customer
      await supabase
        .from("orders")
        .update({ abandoned_email_sent: true })
        .eq("id", order.id)
    }
  }
}