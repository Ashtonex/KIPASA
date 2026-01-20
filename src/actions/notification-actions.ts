"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin" // <--- IMPORT THIS
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 1. Register a customer for restock alerts
 * Triggered from the Product Page "Notify Me" button.
 */
export async function registerStockInterest(productId: string, email: string) {
  const supabase = await createClient()

  // Using 'product_waitlist' table
  const { error } = await supabase
    .from("product_waitlist")
    .insert({ product_id: productId, email: email, status: 'pending' })

  if (error) {
    // Unique constraint violation (User already signed up)
    if (error.code === "23505") return { success: false, message: "You are already on the list!" }
    return { success: false, message: "Something went wrong. Please try again." }
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath("/admin/notifications")
  return { success: true, message: "We'll notify you when it's back!" }
}

/**
 * 2. Fetch Waitlist Summary for the Admin Dashboard
 * Aggregates rows by product to show "5 people waiting for iPhone".
 */
export async function getNotificationSummary() {
  // --- THE FIX: Use Admin Client to bypass RLS policies ---
  const supabase = await createAdminClient()

  // Fetch pending requests + product details
  // FIX APPLIED: Added '!fk_product' to disambiguate the relationship
  const { data: requests, error } = await supabase
    .from("product_waitlist")
    .select(`
      id,
      created_at,
      status,
      product_id,
      products:products!fk_product (
        id,
        name,
        images,
        stock
      )
    `)

  if (error || !requests) {
    console.error("Waitlist fetch error:", error)
    return []
  }

  // Aggregate by Product ID
  const summaryMap = requests.reduce((acc: any, item: any) => {
    // We access the joined data. It might be null if product was deleted.
    const product = item.products
    if (!product) return acc

    if (!acc[product.id]) {
      acc[product.id] = {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || null,
        currentStock: product.stock,
        waitlistCount: 0,
        lastSent: null,
        oldestRequest: item.created_at
      }
    }

    // Only count 'pending' requests for the active count
    if (item.status === 'pending') {
      acc[product.id].waitlistCount += 1
    }

    // Track when the last notification was sent (if status is 'notified')
    if (item.status === 'notified') {
      acc[product.id].lastSent = item.created_at
    }

    // Track oldest pending request
    if (item.status === 'pending' && new Date(item.created_at) < new Date(acc[product.id].oldestRequest)) {
      acc[product.id].oldestRequest = item.created_at
    }

    return acc
  }, {})

  // Filter & Sort: Show actionable items (waitlist > 0 or stock > 0)
  return Object.values(summaryMap)
    .filter((i: any) => i.waitlistCount > 0 || i.currentStock > 0)
    .sort((a: any, b: any) => b.waitlistCount - a.waitlistCount)
}

/**
 * 3. Fetch specific emails for a Product
 * Used by the Modal to show who is waiting.
 */
export async function getProductWaitlistEmails(productId: string) {
  // Use Admin Client here too just in case
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("product_waitlist")
    .select("email, created_at")
    .eq("product_id", productId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) return []
  return data
}

/**
 * 4. SEND EMAILS (The heavy lifter)
 * Triggered by the "Notify Customers" button in Admin.
 */
export async function processRestockNotifications(productId: string) {
  // Use Admin Client to ensure we can read emails and update status
  const supabase = await createAdminClient()

  // A. Fetch Product Details
  const { data: product } = await supabase
    .from("products")
    .select("name, price")
    .eq("id", productId)
    .single()

  // B. Fetch Pending Emails
  const { data: recipients } = await supabase
    .from("product_waitlist")
    .select("id, email")
    .eq("product_id", productId)
    .eq("status", "pending")

  if (!recipients || recipients.length === 0 || !product) {
    return { success: false, message: "No pending recipients found." }
  }

  // C. Send Emails via Resend
  let sentCount = 0

  for (const recipient of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: 'Kipasa Store <updates@kipasa.co.zw>',
        to: recipient.email,
        subject: `It's Back! ${product.name} is now in stock`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
               <h1 style="color: #111; font-size: 24px; font-weight: 800; text-transform: uppercase;">Back in Stock</h1>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Hi there, <br/><br/>
              Great news! You asked to be notified about <strong>${product.name}</strong>. 
              We just restocked it, and it's available now for <strong>$${product.price}</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products/${productId}" 
                 style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                 Secure Yours Now
              </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Kipasa Store Mutare • Fast Delivery • Quality Guaranteed
            </p>
          </div>
        `
      })

      if (!error) {
        sentCount++

        // D. Mark as Notified in DB
        await supabase
          .from("product_waitlist")
          .update({ status: 'notified' })
          .eq("id", recipient.id)
      }

    } catch (err) {
      console.error(`Failed to email ${recipient.email}`, err)
    }
  }

  revalidatePath("/admin/notifications")
  return { success: true, message: `Successfully notified ${sentCount} customers.` }
}