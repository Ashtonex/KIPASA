"use server"

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailItem = { name: string; quantity: number; price: number; id?: string };

type OrderEmailProps = {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: EmailItem[];
  total: number;
  paymentMethod: string;
};

/**
 * Standard Professional Item Table Fragment
 */
function generateOrderTable(items: EmailItem[]) {
  return items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #111;">${item.name}</div>
        <div style="font-size: 11px; color: #666;">SKU/ID: ${item.id?.slice(0, 8) || 'N/A'}</div>
      </td>
      <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center; color: #444;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; color: #111; font-weight: 500;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');
}

export async function sendOrderEmail(data: OrderEmailProps & { confirmationCode?: string }) {
  try {
    const { orderId, customerName, email, phone, address, items, total, paymentMethod, confirmationCode } = data;
    const recipients = ['harvestinventive@gmail.com', 'kipasagiftshop@gmail.com', 'ashytana@gmail.com'];
    const timestamp = new Date().toLocaleString();
    const orderRef = orderId.slice(0, 8);

    console.log(`[INDUSTRY-STANDARD] Initiating Staggered Dispatch for Order #${orderId}...`);

    const results = [];

    // Staggered Delivery for maximum reliability
    for (const [index, recipient] of recipients.entries()) {
      if (index > 0) await new Promise(resolve => setTimeout(resolve, 1000));

      const uniqueHash = Math.random().toString(36).substring(7);

      const res = await resend.emails.send({
        from: 'Kipasa Store <david@kipasastore.com>',
        to: recipient,
        replyTo: 'david@kipasastore.com',
        subject: `Order Notification #${orderRef} [${timestamp}]`,
        text: `NEW ORDER: #${orderId}\nCustomer: ${customerName}\nPayment: ${paymentMethod.toUpperCase()}\nTotal: $${total.toFixed(2)}\n\nItems:\n${items.map(i => `- ${i.name} x${i.quantity}`).join('\n')}`,
        html: `
          <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 40px 20px; color: #334155;">
            <div style="margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
              <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">New Order Alert</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">Ref: #${orderId}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.1em;">Order Summary</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Item</th>
                    <th style="text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Qty</th>
                    <th style="text-align: right; font-size: 11px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${generateOrderTable(items)}
                </tbody>
              </table>
            </div>

            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="font-weight: 600; color: #1e293b;">Customer Details</div>
              </div>
              <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>Name:</strong> ${customerName}<br/>
                <strong>Phone:</strong> ${phone}<br/>
                <strong>Email:</strong> ${email}<br/>
                <strong>Address:</strong> ${address}
              </p>
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px;"><strong>Payment:</strong> <span style="text-transform: uppercase;">${paymentMethod}</span></p>
                ${confirmationCode ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #16a34a;"><strong>Verify Code:</strong> ${confirmationCode}</p>` : ''}
              </div>
              <div style="margin-top: 15px; border-top: 2px solid #0f172a; padding-top: 15px; text-align: right;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-right: 10px;">Total Due</span>
                <span style="font-size: 20px; font-weight: 800; color: #0f172a;">$${total.toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 12px;">
              <p>Transmission ID: ${uniqueHash} • ${timestamp}</p>
              <p>Kipasa Store © 2026</p>
            </div>
          </div>
        `,
      });

      results.push(res);
      console.log(`[IND-PHASE-${index + 1} OK] ${recipient}: ID ${res.data?.id}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Standard email send exception:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendDiagnosticPulse() {
  const recipients = ['harvestinventive@gmail.com', 'kipasagiftshop@gmail.com', 'ashytana@gmail.com'];
  const timestamp = new Date().toLocaleString();

  try {
    const promises = recipients.map(recipient =>
      resend.emails.send({
        from: 'Kipasa Store <david@kipasastore.com>',
        to: recipient,
        subject: `System Pulse: Kipasa Store Domain Verifier [${timestamp}]`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; border-radius: 10px; max-width: 600px; margin: auto; text-align: center;">
            <h1 style="color: #0f172a;">Transmission Pulse</h1>
            <p>Verification successful for domain <strong>kipasastore.com</strong>.</p>
            <p style="color: #64748b; font-size: 12px;">Timestamp: ${timestamp}</p>
          </div>
        `
      })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendCustomerOrderEmail(data: OrderEmailProps) {
  try {
    const { orderId, customerName, email, items, total, paymentMethod } = data;
    const { data: resendData, error } = await resend.emails.send({
      from: 'Kipasa Store <david@kipasastore.com>',
      to: [email],
      replyTo: 'david@kipasastore.com',
      subject: `Order Confirmation - Kipasa Store #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 40px 20px; color: #334155;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">Thank You, ${customerName}</h1>
            <p style="color: #64748b; margin-top: 10px;">We've received your order and are preparing it for you.</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 8px; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase;">Order Reference</div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace;">#${orderId.toUpperCase()}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 12px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Description</th>
                <th style="text-align: center; padding: 12px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Qty</th>
                <th style="text-align: right; padding: 12px 0; color: #94a3b8; font-size: 11px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${generateOrderTable(items)}
            </tbody>
          </table>

          <div style="text-align: right; border-top: 2px solid #0f172a; padding-top: 20px;">
            <div style="color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">Total Paid</div>
            <div style="font-size: 24px; font-weight: 900; color: #0f172a;">$${total.toFixed(2)}</div>
          </div>

          <div style="margin-top: 40px; padding: 24px; background-color: #eff6ff; border-radius: 16px; border: 1px solid #dbeafe;">
            <h3 style="margin: 0; font-size: 14px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">Next Steps</h3>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af; line-height: 1.6;">
              If you chose EcoCash, please verify your payment using the link on the success page or reach out to us on WhatsApp (+263772368435).
            </p>
          </div>

          <div style="margin-top: 48px; text-align: center; color: #cbd5e1; font-size: 12px;">
            <p>Kipasa Store • The Continental Protocol</p>
            <p style="margin-top: 4px;">Automated Transmission - Do not reply directly</p>
          </div>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data: resendData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
