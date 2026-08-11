const formatDate = (date?: Date | string | null) => {
  if (!date) return 'not available'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'not available'

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const getSubscriptionEmailTemplate = (payload: {
  name?: string
  title: string
  description: string
  productId?: string | null
  eventType?: string
  expiresAt?: Date | string | null
}) => {
  return `
    <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <div style="background:#111827;padding:24px 28px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Deenindunya</h1>
            <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">Subscription Update</p>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">Hi ${payload.name || 'there'},</p>
            <h2 style="margin:0 0 12px;color:#111827;font-size:24px;font-weight:700;">${payload.title}</h2>
            <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">${payload.description}</p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#111827;font-size:14px;"><strong>Product:</strong> ${payload.productId || 'N/A'}</p>
              <p style="margin:0 0 8px;color:#111827;font-size:14px;"><strong>Event:</strong> ${payload.eventType || 'N/A'}</p>
              <p style="margin:0;color:#111827;font-size:14px;"><strong>Valid Until:</strong> ${formatDate(payload.expiresAt)}</p>
            </div>
            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">If you did not expect this update, please contact support.</p>
          </div>
          <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 28px;">
            <p style="margin:0;color:#6b7280;font-size:12px;">This email was sent by Deenindunya subscription system.</p>
          </div>
        </div>
      </div>
    </div>
  `
}
