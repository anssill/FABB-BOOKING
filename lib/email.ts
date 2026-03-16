// lib/email.ts — Email templates and sending via Resend
// Note: Resend API key is stored in Settings table and passed at runtime

export interface EmailData {
  customerName?: string
  orderNumber?: string
  startDate?: string
  endDate?: string
  items?: string
  total?: string
  deposit?: string
  businessName?: string
  businessPhone?: string
  businessAddress?: string
  returnDate?: string
  overdueDays?: string
  penalty?: string
  paymentMethod?: string
  amount?: string
}

export function getEmailTemplate(template: string, data: EmailData): { subject: string; html: string } {
  const biz = data.businessName || 'Fabb.booking'
  const phone = data.businessPhone || ''

  const baseStyle = `font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; max-width: 600px; margin: 0 auto;`
  const headerStyle = `background: linear-gradient(135deg, #FF6B35, #ff8c5a); color: white; padding: 32px 40px; border-radius: 12px 12px 0 0;`
  const bodyStyle = `background: #ffffff; padding: 32px 40px; border: 1px solid #e8e8e8; border-top: none;`
  const footerStyle = `background: #f8f9fa; padding: 20px 40px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 12px 12px; text-align: center; font-size: 12px; color: #6b7280;`
  const btnStyle = `display: inline-block; background: #FF6B35; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;`

  switch (template) {
    case 'booking_confirmed':
      return {
        subject: `Booking Confirmed — ${data.orderNumber} | ${biz}`,
        html: `<div style="${baseStyle}">
  <div style="${headerStyle}">
    <h1 style="margin:0;font-size:24px;">✅ Booking Confirmed!</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Your rental is all set</p>
  </div>
  <div style="${bodyStyle}">
    <p style="font-size:16px;">Dear <strong>${data.customerName}</strong>,</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:8px;">
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;width:40%;">Order Number</td><td style="padding:12px 16px;font-weight:700;color:#FF6B35;">${data.orderNumber}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Pickup Date</td><td style="padding:12px 16px;">${data.startDate}</td></tr>
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Return Date</td><td style="padding:12px 16px;">${data.endDate}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Items</td><td style="padding:12px 16px;">${data.items}</td></tr>
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Total Amount</td><td style="padding:12px 16px;font-weight:700;">₹${data.total}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Security Deposit</td><td style="padding:12px 16px;">₹${data.deposit}</td></tr>
    </table>
    <p style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin:20px 0;">
      📋 Please bring a valid photo ID when collecting your items.
    </p>
    <p>For queries, call us at <strong>${phone}</strong></p>
  </div>
  <div style="${footerStyle}">${biz} · Thank you for choosing us!</div>
</div>`,
      }

    case 'reminder_24h':
      return {
        subject: `Reminder: Your pickup is tomorrow — ${data.orderNumber} | ${biz}`,
        html: `<div style="${baseStyle}">
  <div style="${headerStyle}">
    <h1 style="margin:0;font-size:24px;">⏰ Pickup Reminder</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Your items are ready for collection</p>
  </div>
  <div style="${bodyStyle}">
    <p>Dear <strong>${data.customerName}</strong>,</p>
    <p>This is a friendly reminder that your rental pickup is scheduled for <strong>tomorrow, ${data.startDate}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:8px;">
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Order</td><td style="padding:12px 16px;font-weight:700;color:#FF6B35;">${data.orderNumber}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Items</td><td style="padding:12px 16px;">${data.items}</td></tr>
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Return By</td><td style="padding:12px 16px;">${data.endDate}</td></tr>
    </table>
    <p>📍 <strong>${data.businessAddress || 'Our store'}</strong></p>
    <p>📞 <strong>${phone}</strong></p>
  </div>
  <div style="${footerStyle}">${biz} · See you tomorrow!</div>
</div>`,
      }

    case 'return_due':
      return {
        subject: `Return Due Tomorrow — ${data.orderNumber} | ${biz}`,
        html: `<div style="${baseStyle}">
  <div style="${headerStyle}">
    <h1 style="margin:0;font-size:24px;">📦 Return Due Tomorrow</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Please return items on time</p>
  </div>
  <div style="${bodyStyle}">
    <p>Dear <strong>${data.customerName}</strong>,</p>
    <p>Your rental items are due for return <strong>tomorrow, ${data.returnDate}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:8px;">
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Order</td><td style="padding:12px 16px;font-weight:700;color:#FF6B35;">${data.orderNumber}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Items</td><td style="padding:12px 16px;">${data.items}</td></tr>
    </table>
    <p style="background:#d1ecf1;border:1px solid #bee5eb;border-radius:8px;padding:12px 16px;">
      ℹ️ Late returns attract a penalty charge. Return on time to avoid extra charges.
    </p>
    <p>Call <strong>${phone}</strong> to arrange return.</p>
  </div>
  <div style="${footerStyle}">${biz} · Thank you for renting with us!</div>
</div>`,
      }

    case 'overdue_notice':
      return {
        subject: `⚠️ Overdue Return Notice — ${data.orderNumber} | ${biz}`,
        html: `<div style="${baseStyle}">
  <div style="background: linear-gradient(135deg, #dc3545, #e85d74); color: white; padding: 32px 40px; border-radius: 12px 12px 0 0;">
    <h1 style="margin:0;font-size:24px;">⚠️ Overdue Return Notice</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Immediate action required</p>
  </div>
  <div style="${bodyStyle}">
    <p>Dear <strong>${data.customerName}</strong>,</p>
    <p>Your rental items for order <strong>${data.orderNumber}</strong> are <strong>${data.overdueDays} day(s) overdue</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:8px;">
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Items</td><td style="padding:12px 16px;">${data.items}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Days Overdue</td><td style="padding:12px 16px;color:#dc3545;font-weight:700;">${data.overdueDays} days</td></tr>
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Penalty Accrued</td><td style="padding:12px 16px;font-weight:700;">₹${data.penalty}</td></tr>
    </table>
    <p style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:12px 16px;color:#721c24;">
      Please return the items immediately. Additional charges apply for each overdue day.
    </p>
    <p>Contact us urgently: <strong>${phone}</strong></p>
  </div>
  <div style="${footerStyle}">${biz}</div>
</div>`,
      }

    case 'payment_receipt':
      return {
        subject: `Payment Receipt — ${data.orderNumber} | ${biz}`,
        html: `<div style="${baseStyle}">
  <div style="${headerStyle}">
    <h1 style="margin:0;font-size:24px;">🧾 Payment Receipt</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Payment confirmed</p>
  </div>
  <div style="${bodyStyle}">
    <p>Dear <strong>${data.customerName}</strong>,</p>
    <p>We've received your payment. Here's your receipt:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:8px;">
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Order</td><td style="padding:12px 16px;font-weight:700;color:#FF6B35;">${data.orderNumber}</td></tr>
      <tr style="background:#fff;"><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Amount Paid</td><td style="padding:12px 16px;font-weight:700;font-size:18px;">₹${data.amount}</td></tr>
      <tr><td style="padding:12px 16px;font-weight:600;color:#6b7280;">Payment Method</td><td style="padding:12px 16px;">${data.paymentMethod}</td></tr>
    </table>
    <p style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;color:#155724;">
      ✅ Payment received successfully. Thank you!
    </p>
  </div>
  <div style="${footerStyle}">${biz} · Keep this email for your records.</div>
</div>`,
      }

    default:
      return { subject: 'Message from ' + biz, html: '<p>No template found.</p>' }
  }
}

export async function sendEmail(params: {
  to: string
  template: string
  data: EmailData
  apiKey: string
  orderId?: string
  customerId?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { subject, html } = getEmailTemplate(params.template, params.data)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${params.data.businessName || 'Fabb.booking'} <onboarding@resend.dev>`,
        to: [params.to],
        subject,
        html,
      }),
    })
    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.message }
    }
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: String(err) }
  }
}
