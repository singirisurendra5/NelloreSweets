const { sendEmail } = require("./_lib/notify");

module.exports = async (req, res) => {
  if (req.method !== "POST"){
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message){
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    const ownerEmail = process.env.STORE_EMAIL_TO;
    if (!ownerEmail){
      console.warn("[contact] STORE_EMAIL_TO not set — message logged only:", { name, email, phone, message });
      return res.status(200).json({ ok: true, note: "logged-only" });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#2b1a10;">
        <h2 style="color:#ea580c;">📩 New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}<br>
           <strong>Email:</strong> ${email}<br>
           ${phone ? `<strong>Phone:</strong> ${phone}<br>` : ""}
        </p>
        <p style="white-space:pre-wrap;background:#fff7ed;padding:14px;border-radius:10px;">${message}</p>
      </div>`;

    const result = await sendEmail({
      to: ownerEmail,
      subject: `New contact form message from ${name}`,
      html,
      text: `${name} <${email}>${phone ? " / " + phone : ""}\n\n${message}`
    });

    return res.status(200).json({ ok: true, sent: result.ok });
  } catch (err){
    console.error("[contact] error:", err);
    return res.status(500).json({ error: "Could not send message" });
  }
};
