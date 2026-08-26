/* =========================================================
   Nellore Sweets — Site Configuration
   Change your brand name, contact details & socials here —
   every page (header, footer, contact page) reads from this
   single file, so you only edit it once.
   ========================================================= */

const SITE = {
  brandName: "Nellore Sweets",
  tagline: "Homemade Telugu Snacks, Delivered Fresh",
  logoEmoji: "🥟",
  // Razorpay PUBLIC key id (safe to expose in the browser). Get it from
  // Razorpay Dashboard → Settings → API Keys. Never put the KEY SECRET here —
  // that stays only in your Vercel environment variables (see /api).
  razorpayKeyId: "rzp_test_TUIB6xVV5Kmak1",
  phone: "+91 90000 00000",
  whatsapp: "919000000000", // country code + number, no + or spaces
  email: "hello@nelloresweets.com",
  address: "12-34, Snack Street, Ameerpet, Hyderabad, Telangana 500016",
  instagram: "https://instagram.com/nelloresweets",
  facebook: "https://facebook.com/nelloresweets",
  fssai: "1234XXXXXXXXXX", // replace with your real FSSAI license number
  freeShippingAbove: 999,
  shippingFee: 79,
  codAvailable: false
};
