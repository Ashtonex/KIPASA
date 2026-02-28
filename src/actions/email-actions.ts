"use server"

import { Resend } from 'resend';
import QRCode from 'qrcode';

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

async function generateItemsHtml(items: EmailItem[], orderId: string) {
  const itemsWithQr = await Promise.all(
    items.map(async (item) => {
      const qrData = `${orderId}:${item.id || 'unknown'}`;
      const qrBase64 = await QRCode.toDataURL(qrData);
      return { ...item, qrBase64 };
    })
  );

  return itemsWithQr
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-size: 10px; color: #888;">ID: ${item.id || 'N/A'}</div>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        <img src="${item.qrBase64}" width="60" height="60" alt="QR Code" style="display: block; margin-left: auto;" />
      </td>
    </tr>
  `
    )
    .join('');
}

export async function sendOrderEmail(data: OrderEmailProps & { confirmationCode?: string }) {
  try {
    const { orderId, customerName, email, phone, address, items, total, paymentMethod, confirmationCode } = data;
    const itemsHtml = await generateItemsHtml(items, orderId);

    const { data: resendData, error } = await resend.emails.send({
      from: 'Kipasa Store <david@kipasastore.com>',
      to: ['harvestinventive@gmail.com', 'kipasagiftshop@gmail.com', 'ashytana@gmail.com'],
      subject: `New Order Received - #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">New Order Placement</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
          ${confirmationCode ? `<p><strong>EcoCash Confirmation:</strong> <span style="color: #16a34a; font-weight: bold;">${confirmationCode}</span></p>` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Scan</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <h3>Total: $${total.toFixed(2)}</h3>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f0f7ff; border-radius: 8px; font-size: 13px;">
            <strong>Digital Receipt Protocol:</strong> Each item above has a unique QR code for verification and tracking.
          </div>

          <p style="font-size: 12px; color: #888; margin-top: 40px;">
            This is an automated notification from your Kipasa Store.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data: resendData };
  } catch (err: any) {
    console.error("Email send exception:", err.message);
    return { success: false, error: err.message };
  }
}

export async function sendCustomerOrderEmail(data: OrderEmailProps) {
  try {
    const { orderId, customerName, email, items, total, paymentMethod } = data;
    const itemsHtml = await generateItemsHtml(items, orderId);

    const { data: resendData, error } = await resend.emails.send({
      from: 'Kipasa Store <david@kipasastore.com>',
      to: [email],
      subject: `Your Kipasa Store Order is Ready! - #${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1e293b; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Your request has been successfully logged, ${customerName}.</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Order Reference</p>
            <p style="margin: 4px 0 0 0; color: #0f172a; font-size: 18px; font-weight: 800; font-family: monospace;">#${orderId.toUpperCase()}</p>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Your order is now being processed. If you chose <strong>EcoCash</strong>, please ensure you have submitted your confirmation code on the success page or via WhatsApp for faster processing.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">Item</th>
                <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #475569; text-transform: uppercase;">Qty</th>
                <th style="padding: 12px 8px; text-align: right; font-size: 12px; color: #475569; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 24px; text-align: right; border-top: 2px solid #0f172a; pt: 16px;">
            <p style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a;">Total Amount: $${total.toFixed(2)}</p>
          </div>

          <div style="margin-top: 32px; padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #dbeafe;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1e40af; text-transform: uppercase;">Next Steps</h3>
            <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
              - Screenshot the QR codes above for easy verification at pickup.<br/>
              - Reach out on WhatsApp (+263772368435) for instant support.<br/>
              - Delivery times vary based on your location and chosen method.
            </p>
          </div>

          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <p style="color: #94a3b8; font-size: 11px;">Kipasa Store • The Continental Protocol</p>
            <p style="color: #cbd5e1; font-size: 10px; margin-top: 4px;">Automated Transmission - Do not reply directly to this address</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Customer Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data: resendData };
  } catch (err: any) {
    console.error("Customer email send exception:", err.message);
    return { success: false, error: err.message };
  }
}
