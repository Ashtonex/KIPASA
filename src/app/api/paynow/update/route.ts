import { NextRequest, NextResponse } from "next/server"
import { Paynow } from "paynow"
import { createClient } from "@/lib/supabase/server"
import { sendReceiptEmail } from "@/lib/email" // <--- Import

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const params = new URLSearchParams(text)
    const reference = params.get("reference")
    const pollUrl = params.get("pollurl")
    const status = params.get("status")

    if (!pollUrl || !reference) return NextResponse.json({ error: "Missing data" }, { status: 400 })

    const paynow = new Paynow(process.env.PAYNOW_INTEGRATION_ID!, process.env.PAYNOW_INTEGRATION_KEY!)
    const statusResponse = await paynow.pollTransaction(pollUrl)

    if (statusResponse.paid()) {
      const supabase = await createClient()

      // 1. Update Status
      const { data: order, error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", reference)
        .select("email, total_amount") // Fetch email to send receipt
        .single()

      if (!error && order) {
        // 2. Trigger Email 📧
        await sendReceiptEmail(order.email, reference, order.total_amount)
        console.log(`✅ Receipt sent to ${order.email}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}