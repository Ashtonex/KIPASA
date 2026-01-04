"use server"
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSupportTicket(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  try {
    await resend.emails.send({
      from: 'Kipasa Support <support@yourdomain.com>',
      to: 'your-admin-email@gmail.com',
      subject: `New Support Inquiry from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}