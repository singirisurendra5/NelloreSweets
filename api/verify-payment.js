const crypto = require("crypto");
const razorpay = require("./_lib/razorpay-client");
const { computeOrderTotal } = require("./_lib/products");
const { notifyOrderSuccess } = require("./_lib/notify");

module.exports = async (req, res) => {
  if (req.method !== "POST"){
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      shipping,
      items
    } = req.body || {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature){
      return res.status(400).json({ verified: false, error: "Missing payment details" });
    }
    if (!shipping || !shipping.fullName || !shipping.phone || !shipping.email || !shipping.address){
      return res.status(400).json({ verified: false, error: "Missing shipping details" });
    }

    // 1) Verify the Razorpay signature — proves this callback genuinely
    //    came from Razorpay and the order/payment IDs weren't tampered with.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature){
      console.warn("[verify-payment] signature mismatch for order", razorpay_order_id);
      return res.status(400).json({ verified: false, error: "Signature verification failed" });
    }

    // 2) Recompute the trusted total from our price list, and confirm the
    //    amount Razorpay actually captured matches it exactly.
    const { amountPaise: expectedAmountPaise, totalRupees, lineItems } = computeOrderTotal(items);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured"){
      console.warn("[verify-payment] payment not captured, status:", payment.status);
      return res.status(400).json({ verified: false, error: "Payment not captured" });
    }
    if (payment.amount !== expectedAmountPaise){
      console.error("[verify-payment] amount mismatch! expected", expectedAmountPaise, "got", payment.amount);
      return res.status(400).json({ verified: false, error: "Amount mismatch" });
    }

    // 3) Payment is genuine — send WhatsApp + email notifications (best-effort).
    const notifyResult = await notifyOrderSuccess({
      shipping,
      items: lineItems,
      total: totalRupees,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

    return res.status(200).json({ verified: true, notify: notifyResult });
  } catch (err){
    console.error("[verify-payment] error:", err);
    return res.status(500).json({ verified: false, error: err.message || "Verification failed" });
  }
};
