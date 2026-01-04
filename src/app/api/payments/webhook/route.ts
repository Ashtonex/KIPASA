import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Paynow } from "paynow"
import { sendOrderConfirmation } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const payload = Object.fromEntries(formData)

    // 1. Initialize Paynow with all 4 arguments to satisfy TypeScript [.d.ts]
    // Note: We use empty strings for the URLs as they aren't used during webhook parsing.
    const paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID!,
      process.env.PAYNOW_INTEGRATION_KEY!,
      "", 
      ""  
    )

    // 2. Validate the signature (Crucial for security in Zimbabwe)
    // We use parseStatusUpdate to verify the Paynow Hash
    const response = paynow.parseStatusUpdate(payload)

    if (response.status.toLowerCase() === "paid" || response.status.toLowerCase() === "awaiting delivery") {
      const supabase = await createClient()
      
      // Clean the orderId: Remove "Order #" prefix to get the raw UUID
      const rawReference = payload.reference as string
      const orderId = rawReference.replace(/^Order\s*#/, "").trim()

      // 3. Update the order status
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update({ 
          status: "paid",
          paid_at: new Date().toISOString(),
          paynow_reference: payload.paynowreference 
        })
        .eq("id", orderId)
        .neq("status", "paid") 
        .select("contact_email, total_amount, status") 
        .single()

      if (error) {
        console.log("Order already processed or not found:", orderId)
      } else if (updatedOrder?.contact_email) {
        // 4. Trigger the Resend email transmission
        await sendOrderConfirmation(
          updatedOrder.contact_email, 
          orderId, 
          updatedOrder.total_amount
        )
      }
    }

    // Paynow requires a 200 OK response to stop retrying the notification
    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error("Webhook Execution Error:", error.message)
    return new NextResponse("Webhook Failed", { status: 500 })
  }
}