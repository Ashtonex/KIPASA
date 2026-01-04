"use server"

import { Paynow } from "paynow"
import { createClient } from "@/lib/supabase/server"

/**
 * Initiates payment with Paynow.
 * @param method - 'mobile' for EcoCash/OneMoney, 'card' for Visa/Mastercard
 * @param phone - Required for mobile payments (e.g. 077... or 071...)
 */
export async function initiatePayment(orderId: string, email: string, method: string, phone?: string) {
  try {
    const supabase = await createClient()

    // 1. Fetch the order details
    const { data: order, error } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", orderId)
      .single()

    if (error || !order) throw new Error("Order not found")

    // --- SANITIZATION & URL PREPARATION ---
    const integrationId = process.env.PAYNOW_INTEGRATION_ID?.trim();
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY?.trim();
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

    if (!siteUrl.startsWith('http')) {
      siteUrl = `https://${siteUrl}`; // Defaulting to https for production safety
    }

    if (!integrationId || !integrationKey) {
      throw new Error("Paynow credentials missing in environment variables.");
    }

    // Prepare URLs for the constructor
    const resultUrl = `${siteUrl}/api/payments/webhook`;
    const returnUrl = `${siteUrl}/checkout/success?orderId=${orderId}`;

    // 2. Initialize Paynow with 4 arguments to satisfy TypeScript [.d.ts]
    const paynow = new Paynow(
      integrationId, 
      integrationKey, 
      resultUrl, 
      returnUrl
    );

    // 3. Create the payment
    const payment = paynow.createPayment(`Order #${orderId.slice(0, 8)}`, email)
    payment.add("Kipasa Store Purchase", order.total_amount)

    // 4. DETERMINE PAYMENT FLOW: Express (Mobile) vs. Redirect (Card)
    let response;
    
    if (method === "mobile" && phone) {
      // Determine if it's ecocash or onemoney based on prefix
      const zimMethod = phone.startsWith("071") ? "onemoney" : "ecocash";
      
      // Send USSD Push Prompt directly to the phone
      response = await paynow.sendMobile(payment, phone, zimMethod)
    } else {
      // Standard Redirect Flow for Visa/Mastercard
      response = await paynow.send(payment)
    }

    if (response.success) {
      // 5. Save Poll URL and instructions for your records
      await supabase
        .from("orders")
        .update({ 
          paynow_poll_url: response.pollUrl,
          payment_method_preference: method,
          paynow_instructions: response.instructions || null 
        })
        .eq("id", orderId)

      return { 
        success: true, 
        redirectUrl: response.redirectUrl, // Used for 'card' redirect
        instructions: response.instructions // Used for 'mobile' USSD prompt
      }
    } else {
      console.error("Paynow Error Details:", response.error)
      return { success: false, error: response.error }
    }
  } catch (error: any) {
    console.error("Payment Init Exception:", error.message)
    return { success: false, error: error.message }
  }
}