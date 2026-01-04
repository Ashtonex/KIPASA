import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Paynow } from "paynow"
import { sendOrderConfirmation } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const payload = Object.fromEntries(formData)

    // 1. Initialize Paynow with your credentials
    const paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID!,
      process.env.PAYNOW_INTEGRATION_KEY!
    )

    // 2. Validate the signature (Crucial for security in Zimbabwe)
    // This ensures the request actually came from Paynow
    const response = paynow.parseStatusUpdate(payload)

    if (response.status.toLowerCase() === "paid" || response.status.toLowerCase() === "awaiting delivery") {
      const supabase = await createClient()
      
      // Clean the orderId: Remove "Order #" prefix to get the raw UUID
      const rawReference = payload.reference as string
      const orderId = rawReference.replace(/^Order\s*#/, "").trim()

      // 3. Update the order status
      // We check 'status' in the .eq() to ensure we don't trigger the email twice
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({ 
          status: "paid",
          paid_at: new Date().toISOString(),
          paynow_reference: payload.paynowreference // Store for troubleshooting
        })
        .eq("id", orderId)
        .neq("status", "paid") // Optimization: Only update if not already paid
        .select("contact_email, total_amount, status") 
        .single()

      if (error) {
        // If it's already updated (error code for single() with 0 rows), just ignore
        console.log("Order already processed or not found:", orderId)
      } else if (updatedOrder?.contact_email) {
        // 4. Send confirmation receipt via Resend
        await sendOrderConfirmation(
          updatedOrder.contact_email, 
          orderId, 
          updatedOrder.total_amount
        )
      }
    }

    // Paynow requires a 200 OK response to confirm receipt of the notification
    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error("Webhook Execution Error:", error.message)
    return new NextResponse("Webhook Failed", { status: 500 })
  }
}