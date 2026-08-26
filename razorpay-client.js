const Razorpay = require("razorpay");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET){
  console.warn("[nellore-sweets] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. " +
    "Add them in your Vercel Project → Settings → Environment Variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;
