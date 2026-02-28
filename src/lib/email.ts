// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = 'Kipasa Store <david@kipasastore.com>';
const REPLY_TO = 'david@kipasastore.com';

const BASE_STYLE = "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 40px 20px; color: #334155;";
const HEADER_STYLE = "margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;";
const TITLE_STYLE = "font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;";
const BOX_STYLE = "background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px solid #e2e8f0;";
const FOOT_STYLE = "text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;";

/**
 * Triggered by Paynow Update Route
 */
export async function sendReceiptEmail(email: string, orderId: string, amount: number) {
  try {
    const orderRef = orderId.slice(0, 8).toUpperCase();
    await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: REPLY_TO,
      subject: `Payment Received - #${orderRef}`,
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE}">
            <h1 style="${TITLE_STYLE}">Payment Successful</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Order: #${orderRef}</p>
          </div>
          <div style="${BOX_STYLE}">
            <p style="margin: 0; font-size: 14px;">We've successfully received your payment of <strong>$${amount.toFixed(2)}</strong>.</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Your order is now being processed by our fulfillment team.</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View Order Details
            </a>
          </div>
          <div style="${FOOT_STYLE}">
            <p>Kipasa Store • Mutare Center</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Triggered by Webhook when Paynow confirms payment
 */
export async function sendOrderConfirmation(email: string, orderId: string, totalAmount: number) {
  try {
    const orderRef = orderId.slice(0, 8).toUpperCase();
    await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: REPLY_TO,
      subject: `Order Confirmed - #${orderRef}`,
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE}">
            <h1 style="${TITLE_STYLE}">Order Confirmed</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Ref: #${orderRef}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Thank you for your purchase. Our team in Mutare has received your order and is currently preparing your items for fulfillment.</p>
          <div style="${BOX_STYLE}">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Amount Paid</div>
            <div style="font-size: 24px; font-weight: 800; color: #0f172a;">$${totalAmount.toFixed(2)}</div>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Track My Order
            </a>
          </div>
          <div style="${FOOT_STYLE}">
            <p>Kipasa Store • Zimbabwe</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Triggered by Admin Dashboard when status is set to 'shipped'
 */
export async function sendShippingEmail(email: string, orderId: string, trackingNumber?: string) {
  try {
    const orderRef = orderId.slice(0, 8).toUpperCase();
    await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: REPLY_TO,
      subject: `Your Order #${orderRef} is on the way`,
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE}">
            <h1 style="${TITLE_STYLE}">Order Shipped</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Ref: #${orderRef}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Great news! Your order has been dispatched and is currently in transit to your location.</p>
          ${trackingNumber ? `
            <div style="${BOX_STYLE}">
              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Tracking Number</div>
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${trackingNumber}</div>
            </div>
          ` : ''}
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Track Real-Time Status
            </a>
          </div>
          <div style="${FOOT_STYLE}">
            <p>Thank you for shopping with Kipasa Store.</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Triggered by Admin Dashboard when order arrives at Mutare Branch
 */
export async function sendReadyForPickupEmail(email: string, orderId: string, firstName: string) {
  try {
    const orderRef = orderId.slice(0, 8).toUpperCase();
    await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: REPLY_TO,
      subject: `Ready for Collection - #${orderRef}`,
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE}">
            <h1 style="${TITLE_STYLE}">Ready for Pickup</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Order: #${orderRef}</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Hi ${firstName}, your order has arrived at our Mutare branch and is now ready for collection.</p>
          <div style="${BOX_STYLE}">
            <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Collection Point</div>
            <p style="margin: 0; font-size: 14px;">
              <strong>Mutare CBD Office</strong><br/>
              Main Street, Mutare<br/>
              Mon - Sat (Regular Hours)
            </p>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Please bring your order reference number for verification during pickup.</p>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/track" 
               style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View Fulfillment Card
            </a>
          </div>
          <div style="${FOOT_STYLE}">
            <p>Questions? Reach us on WhatsApp: +263 77 690 5673</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Triggered by scheduled task for abandoned carts
 */
export async function sendAbandonedCartEmail(email: string, firstName: string, cartItems: any[]) {
  try {
    await resend.emails.send({
      from: SENDER,
      to: email,
      replyTo: REPLY_TO,
      subject: "Incomplete Purchase at Kipasa Store",
      html: `
        <div style="${BASE_STYLE}">
          <div style="${HEADER_STYLE}">
            <h1 style="${TITLE_STYLE}">Still Interested?</h1>
          </div>
          <p style="font-size: 14px; line-height: 1.6;">Hi ${firstName}, we noticed you left some items in your cart. We've saved them for you so you can easily complete your purchase.</p>
          <div style="${BOX_STYLE}">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 10px;">Items in your cart</div>
            <ul style="margin: 0; padding: 0; list-style: none; font-size: 14px;">
              ${cartItems.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                  ${item.name} <span style="color: #94a3b8;">(x${item.quantity})</span>
                </li>
              `).join('')}
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/checkout" 
               style="display: inline-block; background: #0f172a; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Complete Checkout
            </a>
          </div>
          <div style="${FOOT_STYLE}">
            <p>Fast delivery available Zimbabwe-wide.</p>
          </div>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
