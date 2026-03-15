// lib/whatsapp.ts
// wa.me deep link message templates for fabb.booking
// These open WhatsApp with pre-filled messages

const BIZ = process.env.NEXT_PUBLIC_BIZ_NAME || 'Ansil Dress House'

export interface WAMessageParams {
  customerName: string
  orderNum: string
  items?: string
  startDate?: string
  endDate?: string
  total?: string
  deposit?: string
  penaltyDays?: number
  penaltyAmount?: string
}

export const WA_TEMPLATES = {
  // ✅ Booking Confirmed
  bookingConfirmed: (p: WAMessageParams) =>
    `🎉 *Booking Confirmed — ${BIZ}*\n\n` +
    `Hello ${p.customerName} 🙏\n\n` +
    `Your booking is confirmed!\n\n` +
    `📋 *Order:* ${p.orderNum}\n` +
    `👗 *Items:* ${p.items || 'As discussed'}\n` +
    `📅 *Pickup:* ${p.startDate}\n` +
    `📅 *Return:* ${p.endDate}\n` +
    `💰 *Total:* ${p.total}\n` +
    `🔒 *Deposit:* ${p.deposit}\n\n` +
    `Please bring a valid ID proof at the time of pickup.\n\n` +
    `Thank you for choosing ${BIZ}! 🙏`,

  // 📅 Day Before Pickup Reminder
  pickupReminder: (p: WAMessageParams) =>
    `⏰ *Pickup Reminder — ${BIZ}*\n\n` +
    `Hello ${p.customerName} 🙏\n\n` +
    `This is a reminder that your rental items are ready for pickup *tomorrow (${p.startDate})*.\n\n` +
    `📋 *Order:* ${p.orderNum}\n` +
    `👗 *Items:* ${p.items || 'As booked'}\n` +
    `🔒 *Deposit due:* ${p.deposit}\n\n` +
    `Please bring a valid ID proof.\n\n` +
    `See you tomorrow! — ${BIZ}`,

  // ✅ Order Returned Thank You
  returnThankYou: (p: WAMessageParams) =>
    `✅ *Thank You — ${BIZ}*\n\n` +
    `Hello ${p.customerName} 🙏\n\n` +
    `Thank you for returning the items from order *${p.orderNum}*.\n\n` +
    `Your security deposit will be refunded shortly.\n\n` +
    `We hope you enjoyed the outfits! We look forward to serving you again. 😊\n\n` +
    `— ${BIZ}, Palakkad`,

  // ⚠️ Overdue Return
  overdueReturn: (p: WAMessageParams) =>
    `⚠️ *Overdue Return — ${BIZ}*\n\n` +
    `Hello ${p.customerName},\n\n` +
    `Your rental items from order *${p.orderNum}* were due for return on *${p.endDate}*.\n\n` +
    `📅 *Overdue by:* ${p.penaltyDays} day${(p.penaltyDays||0)>1?'s':''}\n` +
    `💰 *Penalty amount:* ${p.penaltyAmount}\n\n` +
    `Please return the items at the earliest to avoid further charges.\n\n` +
    `Contact us: ${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}\n\n` +
    `— ${BIZ}`,

  // 💰 Deposit Received
  depositReceived: (p: WAMessageParams) =>
    `✅ *Deposit Received — ${BIZ}*\n\n` +
    `Hello ${p.customerName} 🙏\n\n` +
    `We have received your security deposit of *${p.deposit}* for order *${p.orderNum}*.\n\n` +
    `This amount will be refunded when items are returned in good condition.\n\n` +
    `Thank you! — ${BIZ}`,
}

// Build wa.me URL
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

// Open WhatsApp in new tab
export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message)
  window.open(url, '_blank')
}

// Get days overdue
export function getOverdueDays(endDate: string): number {
  const t = new Date().setHours(0,0,0,0)
  const e = new Date(endDate).setHours(0,0,0,0)
  return Math.max(0, Math.round((t - e) / 86400000))
}
