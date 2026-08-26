const razorpay = require("./_lib/razorpay-client");
const { computeOrderTotal } = require("./_lib/products");

module.exports = async (req, res) => {
  if (req.method !== "POST"){
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body || {};

    // Price is ALWAYS recomputed from our trusted server-side price list —
    // the browser only tells us *what* was added to the cart, never *how much* to charge.
    const { amountPaise, totalRupees, subtotal, shipping } = computeOrderTotal(items);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rb_${Date.now()}`,
      notes: { source: "nellore-sweets-website" }
    });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      subtotal,
      shipping,
      total: totalRupees
    });
  } catch (err){
    console.error("[create-order] error:", err);
    return res.status(400).json({ error: err.message || "Could not create order" });
  }
};
