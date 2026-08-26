# Nellore Sweets — Your Snacks Website

Congratulations! This is a complete, ready-to-launch online store for selling homemade snacks — built exactly the way you described: browse snacks, pick 250g/500g/1kg packs, add to cart, fill in shipping details, pay online (Razorpay), and automatically get a WhatsApp + email confirmation with the order and shipping details. It also includes separate Privacy Policy, Refund Policy, Terms, and Contact Us pages, and is set up to be found on Google (SEO).

**This guide assumes zero coding experience.** Follow it top to bottom and your store will be live. Budget about 45–60 minutes for the first-time setup.

> 📌 **Placeholder brand name:** Everything currently says "Nellore Sweets" — you told us you'd decide your real name later. See **Step 1** below for exactly where to change it.

---

## What's inside

```
index.html          → Home page
shop.html            → Full product menu
cart.html            → Shopping cart
checkout.html        → Shipping details + payment
success.html         → Order confirmation page
privacy.html          → Privacy Policy
refund.html           → Refund & Cancellation Policy
terms.html            → Terms & Conditions
contact.html          → Contact Us page + form
assets/css/style.css  → All the design/styling (colors, fonts, animations)
assets/js/            → Cart, checkout, product data, animations
api/                  → Backend (runs on Vercel): payment + WhatsApp + email
```

There's no complicated app to install. It's a website (plain HTML/CSS/JS) plus a small backend (3 files in `/api`) that handles payments and sends notifications. You'll host it for free on **Vercel**.

---

## Step 1 — Put in your real brand details

Open these files in any text editor (Notepad, or free tools like **VS Code** or **Notepad++**) and replace the sample values:

1. **`assets/js/site-config.js`** — the single most important file. Change:
   - `brandName` — your real business name
   - `phone`, `whatsapp`, `email`, `address`
   - `instagram`, `facebook`
   - `fssai` — your FSSAI food license number (**required by Indian law** to sell food online — apply at [fssai.gov.in](https://fssai.gov.in) if you don't have one yet; it's quick to get for a small home business)
   - `freeShippingAbove` / `shippingFee` — your delivery charges

2. **Brand name & contact info also appear as plain text** in the header/footer of every `.html` page (this is intentional — it keeps the site fast with zero setup). The easiest way to change "Nellore Sweets" everywhere: use your editor's **Find & Replace All** across the whole folder, replacing `Nellore Sweets` with your real name, and replacing the sample phone/email/address the same way.

3. **Products & prices** — open `assets/js/products.js`. Each snack is one block:
   ```js
   {
     id: "murukulu",
     name: "Murukulu",
     category: "savory",       // "savory" or "sweet"
     emoji: "🌀",                // placeholder icon — see Step 2 for real photos
     tag: "Bestseller",         // "Bestseller", "Premium", or "" for none
     veg: true,
     desc: "Crispy rice & urad dal spirals...",
     variants: { "250g": 149, "500g": 279, "1kg": 529 }
   }
   ```
   Copy/paste a block to add a new snack, delete a block to remove one, or just edit the prices.

   ⚠️ **Important:** Prices also live in a second file, **`api/_lib/products.js`**, in the exact same format. This is deliberate — it's what stops someone from tampering with the price in their browser and paying less. **Whenever you change a product or price, update it in BOTH files.**

---

## Step 2 — Add your real product photos (optional but recommended)

Right now every product shows a large emoji icon on a soft gradient card — clean and stylish, but you'll want real photos.

1. Create a folder: `assets/images/`
2. Add clear, well-lit square photos (1000×1000px works well), named to match each product `id`, e.g. `murukulu.jpg`, `kaju-katli.jpg`.
3. Open **`assets/js/main.js`**, find this function near the top of the "shared product card renderer" section:
   ```js
   function productMedia(p){
     return `<div class="emoji">${p.emoji}</div>`;
   }
   ```
   Replace it with:
   ```js
   function productMedia(p){
     return `<img src="assets/images/${p.id}.jpg" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
   }
   ```
   Every product card across the whole site will now show your photo instead of the emoji.

---

## Step 3 — Get your Razorpay keys (for accepting payments)

1. Sign up at [razorpay.com](https://razorpay.com) (free) and complete their KYC (needed before you can accept **live** payments — takes 1–2 days for approval, but you can test everything immediately using **Test Mode**).
2. In the Razorpay Dashboard, go to **Settings → API Keys → Generate Test Key**. Copy the **Key Id** and **Key Secret**.
3. Open **`assets/js/site-config.js`** and paste the Key Id into `razorpayKeyId`.
4. Keep the **Key Secret** aside — you'll paste it into Vercel (never into any website file) in Step 6.
5. Once you're ready to accept real payments, repeat this using **Live Mode** keys after your KYC is approved.

---

## Step 4 — Set up WhatsApp order notifications (Twilio)

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio) (free trial available).
2. Go to the [WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn) in your Twilio Console. Follow the on-screen instructions to join the sandbox (you send a short WhatsApp code to a Twilio number once).
3. From the Twilio Console home page, copy your **Account SID** and **Auth Token**.
4. Note the sandbox WhatsApp number shown (usually `whatsapp:+14155238886`).
5. Keep all of this aside for Step 6.

📌 The sandbox is great for testing but every recipient must first "join" it. For real customers to receive WhatsApp messages automatically, apply for a **WhatsApp Business Sender** in Twilio (Console → Messaging → Senders) — this takes Meta a few days to approve. Until then, orders still work perfectly and email notifications go out immediately; WhatsApp will simply be limited to numbers that joined your sandbox.

---

## Step 5 — Set up email notifications

Easiest option — use your own Gmail:

1. Turn on 2-Step Verification on your Google Account (Google Account → Security).
2. Go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)** and create an App Password (choose "Mail" as the app). Google gives you a 16-character password — copy it.
3. Keep your Gmail address + this app password aside for Step 6.

(You can also use Zoho Mail, Resend, or SendGrid's SMTP — any SMTP host/port/user/pass works the same way.)

---

## Step 6 — Deploy your website to Vercel (free hosting)

1. Create a free account at [github.com](https://github.com) if you don't have one, and one at [vercel.com](https://vercel.com) (sign up using your GitHub account — it's the easiest option).
2. On GitHub, create a **New repository** (e.g. name it after your brand), and upload this entire project folder to it (GitHub's website lets you drag-and-drop files directly — no command line needed. Look for "Add file → Upload files").
3. In Vercel, click **Add New → Project**, choose **Import** next to your new GitHub repository, and click **Deploy**. Vercel auto-detects everything — no configuration needed.
4. Before or right after the first deploy, go to your Vercel Project → **Settings → Environment Variables** and add each of these (see `.env.example` in this project for the full list with explanations):

   | Name | Value |
   |---|---|
   | `RAZORPAY_KEY_ID` | from Step 3 |
   | `RAZORPAY_KEY_SECRET` | from Step 3 |
   | `TWILIO_ACCOUNT_SID` | from Step 4 |
   | `TWILIO_AUTH_TOKEN` | from Step 4 |
   | `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` (from Step 4) |
   | `STORE_WHATSAPP_TO` | your own WhatsApp number, e.g. `919000000000` |
   | `STORE_EMAIL_TO` | your own email — where you want new-order alerts |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | the 16-character App Password from Step 5 |
   | `MAIL_FROM` | your Gmail address |

5. Click **Redeploy** (Vercel Project → Deployments → ⋯ → Redeploy) so the new environment variables take effect.
6. Your site is now live at a `your-project.vercel.app` address! Open it, add something to your cart, and try a **test payment** — Razorpay's test mode accepts card number `4111 1111 1111 1111`, any future expiry, any CVV, to simulate a successful payment without moving real money.

### Using your own domain name (e.g. www.yourbrand.com)

In Vercel → your Project → **Settings → Domains**, add your domain and follow the instructions to point it there (usually just adding one or two DNS records at wherever you bought the domain — GoDaddy, Namecheap, Google Domains, etc.). This normally takes a few minutes to a few hours to activate.

---

## Going live checklist

- [ ] Real brand name, logo emoji, phone, email, address updated (Step 1)
- [ ] FSSAI license number added (required for food businesses in India)
- [ ] Real product photos added (Step 2) — or you're happy with the emoji-icon look
- [ ] Prices double-checked in **both** `assets/js/products.js` and `api/_lib/products.js`
- [ ] Razorpay KYC approved and **live** keys swapped in (Step 3)
- [ ] Twilio WhatsApp sender approved for production (Step 4) — or you're fine starting with the sandbox
- [ ] Test order placed successfully end-to-end (cart → checkout → payment → WhatsApp/email received)
- [ ] Custom domain connected (optional)
- [ ] `sitemap.xml` and every page's `<link rel="canonical">` updated with your real domain (currently set to `https://www.nelloresweets.com/` as a placeholder — find & replace this too)

---

## Troubleshooting

**Payment succeeds but no WhatsApp/email arrives.** Check Vercel → your Project → the `verify-payment` function's logs (Project → Deployments → click a deployment → Functions tab) — it prints a clear warning if Twilio or SMTP credentials are missing or wrong. The order still completes either way; notifications are "best effort" so a WhatsApp hiccup never blocks the customer's payment.

**"Payment failed" or checkout button does nothing.** Almost always a missing/incorrect `RAZORPAY_KEY_ID` in `assets/js/site-config.js` or `RAZORPAY_KEY_SECRET` in Vercel's environment variables — double check both, and that you redeployed after adding env variables.

**I changed a price but the customer was still charged the old amount.** Remember prices must be updated in **both** `assets/js/products.js` (what customers see) and `api/_lib/products.js` (what they're actually charged) — and redeployed.

**Want to test everything without spending real money?** Keep Razorpay in **Test Mode** (Step 3) for as long as you like — the whole flow, including WhatsApp/email notifications, works identically to live mode.

---

## A note on how payments are kept secure

The checkout page never trusts the browser to say how much to charge — the amount is always recalculated on the server from your official price list (`api/_lib/products.js`), and the payment is verified twice: once via Razorpay's cryptographic signature, and once by re-checking the captured amount against your price list. This is standard practice for any real online store and protects you from anyone trying to manipulate the price in their browser's dev tools.

---

Made with ❤️ — good luck with your snacks business! 🥟
