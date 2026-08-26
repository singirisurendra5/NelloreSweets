/* =========================================================
   Nellore Sweets — Notification helpers
   sendWhatsApp() uses Twilio's WhatsApp API.
   sendEmail()    uses Nodemailer over plain SMTP
                  (works with Gmail App Passwords, Zoho, Resend
                   SMTP, SendGrid SMTP, etc. — anything with an
                   SMTP host/port/user/pass).
   Both are "best effort": failures are logged and returned,
   never thrown, so one failed channel never breaks the order.
   ========================================================= */

const nodemailer = require("nodemailer");
const twilio = require("twilio");

function formatINR(n){ return "₹" + Number(n).toLocaleString("en-IN"); }

function orderLinesText(items){
  return items.map(i => `• ${i.name} (${i.variant}) × ${i.qty} — ${formatINR(i.lineTotal)}`).join("\n");
}

function orderLinesHtml(items){
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0e2d3;">${i.name} (${i.variant}) × ${i.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0e2d3;text-align:right;">${formatINR(i.lineTotal)}</td>
    </tr>`).join("");
}

/* ---------------- WhatsApp (Twilio) ---------------- */

function getTwilioClient(){
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

async function sendWhatsApp(toPhoneE164WithoutPlus, message){
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886" (Twilio sandbox number)
  if (!client || !from){
    console.warn("[notify] Twilio WhatsApp not configured — skipping WhatsApp message.");
    return { ok: false, skipped: true };
  }
  try {
    const to = toPhoneE164WithoutPlus.startsWith("whatsapp:") ? toPhoneE164WithoutPlus : `whatsapp:+${toPhoneE164WithoutPlus.replace(/^\+/, "")}`;
    const res = await client.messages.create({ from, to, body: message });
    return { ok: true, sid: res.sid };
  } catch (err){
    console.error("[notify] WhatsApp send failed:", err.message);
    return { ok: false, error: err.message };
  }
}

/* ---------------- Email (Nodemailer / SMTP) ---------------- */

function getMailTransport(){
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendEmail({ to, subject, html, text }){
  const transport = getMailTransport();
  if (!transport){
    console.warn("[notify] SMTP not configured — skipping email.");
    return { ok: false, skipped: true };
  }
  try {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const info = await transport.sendMail({ from: `"Nellore Sweets" <${from}>`, to, subject, html, text });
    return { ok: true, messageId: info.messageId };
  } catch (err){
    console.error("[notify] Email send failed:", err.message);
    return { ok: false, error: err.message };
  }
}

/* ---------------- Order notification templates ---------------- */

async function notifyOrderSuccess({ shipping, items, total, paymentId, orderId }){
  const customerMsg =
    `🥟 *Nellore Sweets* — Order Confirmed!\n\n` +
    `Hi ${shipping.fullName}, thank you for your order!\n\n` +
    `${orderLinesText(items)}\n\n` +
    `*Total Paid:* ${formatINR(total)}\n` +
    `*Payment ID:* ${paymentId}\n\n` +
    `*Shipping to:*\n${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}\n\n` +
    `We'll pack your snacks fresh and ship within 24 hours. Questions? Just reply here!`;

  const ownerMsg =
    `🔔 *New Order Received* — Nellore Sweets\n\n` +
    `${orderLinesText(items)}\n\n` +
    `*Total:* ${formatINR(total)}\n` +
    `*Payment ID:* ${paymentId}\n` +
    `*Razorpay Order:* ${orderId}\n\n` +
    `*Customer:* ${shipping.fullName}\n` +
    `*Phone:* ${shipping.phone}\n` +
    `*Email:* ${shipping.email}\n` +
    `*Address:* ${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}\n` +
    (shipping.notes ? `*Notes:* ${shipping.notes}\n` : "");

  const customerEmailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2b1a10;">
      <h2 style="color:#ea580c;">🥟 Nellore Sweets — Order Confirmed!</h2>
      <p>Hi ${shipping.fullName}, thank you for your order. Here's your summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${orderLinesHtml(items)}</table>
      <p><strong>Total Paid:</strong> ${formatINR(total)}<br><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Shipping to:</strong><br>${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}</p>
      <p>We'll pack your snacks fresh and ship within 24 hours. Questions? Just reply to this email or WhatsApp us.</p>
      <p style="color:#8a7461;font-size:12px;margin-top:24px;">Nellore Sweets · hello@nelloresweets.com</p>
    </div>`;

  const ownerEmailHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2b1a10;">
      <h2 style="color:#ea580c;">🔔 New Order Received</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${orderLinesHtml(items)}</table>
      <p><strong>Total:</strong> ${formatINR(total)}<br><strong>Payment ID:</strong> ${paymentId}<br><strong>Razorpay Order:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${shipping.fullName}<br>
         <strong>Phone:</strong> ${shipping.phone}<br>
         <strong>Email:</strong> ${shipping.email}<br>
         <strong>Address:</strong> ${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}
         ${shipping.notes ? `<br><strong>Notes:</strong> ${shipping.notes}` : ""}</p>
    </div>`;

  const ownerWhatsApp = process.env.STORE_WHATSAPP_TO; // e.g. "919000000000"
  const ownerEmail = process.env.STORE_EMAIL_TO;

  const results = await Promise.allSettled([
    sendWhatsApp(shipping.phone.startsWith("91") ? shipping.phone : `91${shipping.phone}`, customerMsg),
    ownerWhatsApp ? sendWhatsApp(ownerWhatsApp, ownerMsg) : Promise.resolve({ ok:false, skipped:true }),
    sendEmail({ to: shipping.email, subject: "Your Nellore Sweets order is confirmed! 🥟", html: customerEmailHtml, text: customerMsg }),
    ownerEmail ? sendEmail({ to: ownerEmail, subject: `New order — ${formatINR(total)} — ${shipping.fullName}`, html: ownerEmailHtml, text: ownerMsg }) : Promise.resolve({ ok:false, skipped:true })
  ]);

  return {
    customerWhatsApp: results[0],
    ownerWhatsApp: results[1],
    customerEmail: results[2],
    ownerEmail: results[3]
  };
}

module.exports = { sendWhatsApp, sendEmail, notifyOrderSuccess, formatINR };
