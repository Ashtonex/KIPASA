// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Triggered by Webhook when Paynow confirms payment
 */
export async function sendOrderConfirmation(email: string, orderId: string, totalAmount: number) {
  try {
    await resend.emails.send({
      from: 'Kipasa Store <orders@yourdomain.com>',
      to: email,
      subject: `Order Confirmed - Kipasa Store #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #059669;">Payment Successful!</h2>
          <p>Hi there,</p>
          <p>Thank you for your order. We've received your payment and our team in Mutare is now preparing your items.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 0;"><strong>Amount Paid:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          <p>You can track your order progress anytime here:</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
             style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Track My Order
          </a>
          <p style="margin-top: 25px; font-size: 12px; color: #6b7280;">
            If you have any questions, reply to this email or contact Kipasa Support.
          </p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Confirmation email failed:", error);
    return { success: false };
  }
}

/**
 * Triggered by Admin Dashboard when status is set to 'shipped'
 */
export async function sendShippingEmail(email: string, orderId: string, trackingNumber?: string) {
  try {
    await resend.emails.send({
      from: 'Kipasa Store <orders@yourdomain.com>',
      to: email,
      subject: `Your Kipasa Order #${orderId.slice(0, 8)} has Shipped!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #d97706;">Your Order is on the Way! 🚚</h2>
          <p>Order Reference: <strong>${orderId.slice(0, 8).toUpperCase()}</strong></p>
          <p>Your package has been handed over to our delivery partner.</p>
          ${trackingNumber ? `
            <div style="background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0; border: 1px solid #fcd34d;">
              <p style="margin: 0; font-size: 14px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
            </div>
          ` : ''}
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
               Track Real-Time Status
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Thank you for shopping with Kipasa Store, Mutare.
          </p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Shipping email failed to send:", error);
    return { success: false };
  }
}

/**
 * Triggered by Admin Dashboard when order arrives at Mutare Branch
 */
export async function sendReadyForPickupEmail(email: string, orderId: string, firstName: string) {
  try {
    await resend.emails.send({
      from: 'Kipasa Store <orders@yourdomain.com>',
      to: email,
      subject: "Ready for Collection! 📍 Kipasa Store Mutare",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #d97706;">Good News, ${firstName}!</h2>
          <p>Your order <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> has arrived at our Mutare branch and is ready for collection.</p>
          
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Collection Details:</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              <strong>Location:</strong> Mutare CBD Office (Main Street)<br/>
              <strong>Hours:</strong> Mon - Fri (8am - 5pm), Sat (8am - 1pm)
            </p>
          </div>

          <p>Please bring your <strong>Order Receipt</strong> (printed or on your phone) so our staff can scan the QR code for verification.</p>
          
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               View My Receipt
            </a>
          </div>
          
          <p style="margin-top: 25px; font-size: 12px; color: #6b7280;">
            Need help? Contact us on WhatsApp: +263 77 690 5673
          </p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Pickup email failed:", error);
    return { success: false };
  }
}

/**
 * Triggered by scheduled task for abandoned carts
 */
export async function sendAbandonedCartEmail(email: string, firstName: string, cartItems: any[]) {
  try {
    const itemsHtml = cartItems.map(item => `<li>${item.name} (Qty: ${item.quantity})</li>`).join('');
    await resend.emails.send({
      from: 'Kipasa Store <orders@yourdomain.com>',
      to: email,
      subject: "You left something behind! 🛒",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #d97706;">Hi ${firstName},</h2>
          <p>We noticed you left some items in your cart. Don't worry—we've saved them for you!</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Items:</strong></p>
            <ul>${itemsHtml}</ul>
          </div>
          <p>Ready to complete your purchase? We offer fast delivery across Zimbabwe.</p>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout" 
               style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Complete My Order
            </a>
          </div>
          <p style="margin-top: 25px; font-size: 12px; color: #6b7280;">
            Questions? Chat with us on WhatsApp at +263 77 690 5673.
          </p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Abandoned cart email failed:", error);
    return { success: false };
  }
}