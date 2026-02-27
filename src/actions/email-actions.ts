"use server"

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailProps = {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
};

export async function sendOrderEmail(data: OrderEmailProps) {
  try {
    const { orderId, customerName, email, phone, address, items, total, paymentMethod } = data;

    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const { data: resendData, error } = await resend.emails.send({
      from: 'Kipasa Store <onboarding@resend.dev>', // You should update this to your domain once verified
      to: ['ashytana@gmail.com'],
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

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <h3>Total: $${total.toFixed(2)}</h3>
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
