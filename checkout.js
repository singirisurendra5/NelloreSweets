/* =========================================================
   Nellore Sweets — Checkout & Razorpay Payment Flow
   1. Validate shipping form
   2. POST /api/create-order  -> get a Razorpay order id
   3. Open Razorpay Checkout popup
   4. On payment success -> POST /api/verify-payment
      (server verifies signature, then sends WhatsApp + email)
   5. Save order to sessionStorage & redirect to success.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const emptyNotice = document.getElementById("emptyNotice");
  const lines = Cart.lines();

  if (lines.length === 0){
    form.style.display = "none";
    emptyNotice.style.display = "block";
    return;
  }

  renderSummary();

  function renderSummary(){
    const sub = Cart.subtotal(), ship = Cart.shipping(), total = Cart.total();
    document.getElementById("checkoutLines").innerHTML = Cart.lines().map(l => `
      <div class="summary-row"><span>${l.product.name} (${l.variant}) × ${l.qty}</span><span>${formatINR(l.lineTotal)}</span></div>
    `).join("");
    document.getElementById("sumSubtotal").textContent = formatINR(sub);
    document.getElementById("sumShipping").textContent = ship === 0 ? "FREE" : formatINR(ship);
    document.getElementById("sumTotal").textContent = formatINR(total);
  }

  const validators = {
    fullName: v => v.trim().length >= 3,
    phone: v => /^[6-9]\d{9}$/.test(v.trim()),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    address: v => v.trim().length >= 8,
    city: v => v.trim().length >= 2,
    state: v => v.trim().length >= 2,
    pincode: v => /^\d{6}$/.test(v.trim())
  };

  function validateForm(){
    let valid = true;
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      const fieldEl = form.querySelector(`[data-field="${name}"]`);
      const ok = validators[name](input.value);
      fieldEl.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm()){
      showToast("Please fix the highlighted fields", "⚠️");
      form.querySelector(".invalid input, .invalid textarea")?.focus();
      return;
    }

    const shipping = {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      pincode: form.pincode.value.trim(),
      notes: form.notes.value.trim()
    };

    const orderLines = Cart.lines().map(l => ({
      id: l.id, name: l.product.name, variant: l.variant, qty: l.qty, price: l.price, lineTotal: l.lineTotal
    }));
    // Sent only so the server knows WHAT is in the cart — the server looks up
    // its own trusted prices and decides the amount, never trusts a number from here.
    const cartForServer = Cart.read().map(i => ({ id: i.id, variant: i.variant, qty: i.qty }));

    setLoading(true);
    try {
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartForServer })
      });
      if (!createRes.ok) throw new Error("create-order-failed");
      const order = await createRes.json();
      const amountInPaise = order.amount;

      const rzp = new Razorpay({
        key: SITE.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: SITE.brandName,
        description: `Order for ${orderLines.length} item(s)`,
        order_id: order.id,
        prefill: { name: shipping.fullName, email: shipping.email, contact: shipping.phone },
        theme: { color: "#ea580c" },
        handler: async function (response){
          await handlePaymentSuccess(response, shipping, orderLines, amountInPaise);
        },
        modal: {
          ondismiss: function (){
            setLoading(false);
            showToast("Payment cancelled", "ℹ️");
          }
        }
      });

      rzp.on("payment.failed", function (response){
        setLoading(false);
        showToast("Payment failed. Please try again.", "❌");
      });

      rzp.open();
    } catch (err){
      console.error(err);
      setLoading(false);
      showToast("Something went wrong. Please try again.", "❌");
    }
  });

  async function handlePaymentSuccess(response, shipping, orderLines, amountInPaise){
    try {
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          amount: amountInPaise,
          shipping,
          items: orderLines
        })
      });
      const result = await verifyRes.json();

      if (verifyRes.ok && result.verified){
        sessionStorage.setItem("nelloresweets_last_order", JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          items: orderLines,
          shipping,
          total: amountInPaise / 100,
          date: new Date().toISOString()
        }));
        Cart.clear();
        window.location.href = "success.html";
      } else {
        setLoading(false);
        showToast("Payment received but verification failed — our team will confirm your order shortly.", "⚠️");
      }
    } catch (err){
      console.error(err);
      setLoading(false);
      showToast("Payment received. If you don't get a confirmation, please contact support.", "⚠️");
    }
  }

  function setLoading(isLoading){
    const btn = document.getElementById("payBtn");
    const text = document.getElementById("payBtnText");
    btn.disabled = isLoading;
    text.innerHTML = isLoading ? `<span class="spinner"></span> Processing…` : "Pay Securely →";
  }
});
