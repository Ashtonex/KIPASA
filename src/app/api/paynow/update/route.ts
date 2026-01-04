import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Paynow } from "paynow"
import { sendReceiptEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const params = new URLSearchParams(text)
    const reference = params.get("reference")
    const pollUrl = params.get("pollurl")

    if (!pollUrl || !reference) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    // 1. Initialize Paynow with all 4 arguments for TypeScript compliance
    // Empty strings are used for URLs as they aren't required for polling.
    const paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID!, 
      process.env.PAYNOW_INTEGRATION_KEY!,
      "", 
      ""
    )

    // 2. Poll the transaction status from Paynow
    const statusResponse = await paynow.pollTransaction(pollUrl)

    if (statusResponse.paid()) {
      const supabase = await createClient()

      // 3. Update Status in Database
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", reference)
        .select("email, total_amount") 
        .single()

      if (!error && order) {
        // 4. Trigger Receipt Email via Resend
        await sendReceiptEmail(order.email, reference, order.total_amount)
        console.log(`✅ Receipt sent to ${order.email}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Polling Error:", error.message)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}