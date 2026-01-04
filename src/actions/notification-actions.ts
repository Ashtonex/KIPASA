"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 1. Register a customer for restock alerts
 */
export async function registerStockInterest(productId: string, email: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("stock_notifications")
    .insert({ product_id: productId, email: email })

  if (error) {
    if (error.code === "23505") return { message: "You are already on the list!" }
    return { message: "Something went wrong. Please try again." }
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath("/admin/notifications")
  return { success: true, message: "We'll notify you when it's back!" }
}

/**
 * 2. Fetch Waitlist Summary for the Admin Dashboard (Enhanced with Last Sent)
 */
export async function getNotificationSummary() {
  const supabase = await createClient()

  // Fetch all notifications to see both pending and recently sent
  const { data, error } = await supabase
    .from("stock_notifications")
    .select(`
      product_id,
      is_sent,
      updated_at,
      products ( name, stock, images )
    `)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  const summary = data.reduce((acc: any, item: any) => {
    const id = item.product_id
    if (!acc[id]) {
      acc[id] = {
        id,
        name: item.products.name,
        image: item.products.images?.[0],
        currentStock: item.products.stock,
        waitlistCount: 0,
        lastSent: item.is_sent ? item.updated_at : null 
      }
    }
    
    // Only count active (unsent) notifications for the waitlist total
    if (!item.is_sent) acc[id].waitlistCount++
    
    // Keep the most recent 'updated_at' if multiple emails were sent
    if (item.is_sent && (!acc[id].lastSent || new Date(item.updated_at) > new Date(acc[id].lastSent))) {
        acc[id].lastSent = item.updated_at
    }
    
    return acc
  }, {})

  return Object.values(summary).sort((a: any, b: any) => b.waitlistCount - a.waitlistCount)
}

/**
 * 3. Fetch specific emails for the "Customer Detail" Modal
 * (This is the new addition)
 */
export async function getProductWaitlistEmails(productId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("stock_notifications")
    .select("email, created_at")
    .eq("product_id", productId)
    .eq("is_sent", false)
    .order("created_at", { ascending: true })

  if (error) return []
  return data
}

/**
 * 4. Automated Restock Email Trigger via Resend
 */
export async function processRestockNotifications(productId: string) {
  const supabase = await createClient()

  // 1. Fetch product details and pending notifications
  const { data: product } = await supabase
    .from("products")
    .select("name, price")
    .eq("id", productId)
    .single()

  const { data: notifications } = await supabase
    .from("stock_notifications")
    .select("id, email")
    .eq("product_id", productId)
    .eq("is_sent", false)

  if (!notifications || notifications.length === 0 || !product) return

  // 2. Send emails via Resend
  for (const entry of notifications) {
    try {
      await resend.emails.send({
        from: 'Kipasa Store <updates@yourdomain.com>',
        to: entry.email,
        subject: `Great news! ${product.name} is back in stock!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1 style="color: #000; font-size: 24px;">It's Back!</h1>
            <p>Hi there,</p>
            <p>You asked us to let you know when <strong>${product.name}</strong> was back in stock. Good news—it's available now for <strong>$${product.price}</strong>!</p>
            <div style="margin: 30px 0;">
              <a href="https://kipasa.store/products/${productId}" 
                 style="background: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 Buy It Now
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">Kipasa Store - Mutare, Zimbabwe</p>
          </div>
        `
      })
    } catch (err) {
      console.error(`Failed to send email to ${entry.email}:`, err)
    }
  }

  // 3. Mark as sent in Supabase
  await supabase
    .from("stock_notifications")
    .update({ is_sent: true })
    .eq("product_id", productId)

  revalidatePath("/admin/notifications")
}