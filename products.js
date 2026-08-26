/* =========================================================
   SERVER-SIDE price list (CommonJS copy of assets/js/products.js)

   Why duplicated: the checkout amount must be calculated on the
   SERVER from trusted prices — never trust an amount sent by the
   browser, or anyone could open devtools and pay ₹1 for a ₹1000
   order. This file is the source of truth for what Razorpay
   actually charges.

   ⚠️ IMPORTANT: whenever you add a product or change a price in
   assets/js/products.js, make the SAME change here.
   ========================================================= */

const PRODUCTS = {
  "murukulu":       { name: "Murukulu",        variants: { "250g": 149, "500g": 279, "1kg": 529 } },
  "mixture":        { name: "Andhra Mixture",  variants: { "250g": 139, "500g": 259, "1kg": 489 } },
  "chekkalu":       { name: "Chekkalu",        variants: { "250g": 129, "500g": 239, "1kg": 449 } },
  "ribbon-pakodi":  { name: "Ribbon Pakodi",   variants: { "250g": 145, "500g": 269, "1kg": 509 } },
  "chegodilu":      { name: "Chegodilu",       variants: { "250g": 135, "500g": 249, "1kg": 469 } },
  "boondi-laddu":   { name: "Boondi Laddu",    variants: { "250g": 179, "500g": 339, "1kg": 649 } },
  "kaju-katli":     { name: "Kaju Katli",      variants: { "250g": 299, "500g": 579, "1kg": 1129 } },
  "kobbari-laddu":  { name: "Kobbari Laddu",   variants: { "250g": 169, "500g": 319, "1kg": 599 } },
  "palli-chikki":   { name: "Palli Chikki",    variants: { "250g": 119, "500g": 219, "1kg": 409 } },
  "karam-boondi":   { name: "Karam Boondi",    variants: { "250g": 125, "500g": 235, "1kg": 439 } },
  "sunnundalu":     { name: "Sunnundalu",      variants: { "250g": 189, "500g": 359, "1kg": 689 } },
  "masala-kaju":    { name: "Masala Kaju",     variants: { "250g": 259, "500g": 499, "1kg": 969 } }
};

const SHIPPING = {
  freeShippingAbove: 999, // rupees
  shippingFee: 79          // rupees
};

/**
 * Recompute a trusted order total (in paise) from a list of
 * { id, variant, qty } sent by the client. Throws if any item
 * is invalid so we never silently charge the wrong amount.
 */
function computeOrderTotal(items){
  if (!Array.isArray(items) || items.length === 0){
    throw new Error("Cart is empty");
  }
  let subtotal = 0;
  const lineItems = items.map(item => {
    const product = PRODUCTS[item.id];
    if (!product) throw new Error(`Unknown product: ${item.id}`);
    const price = product.variants[item.variant];
    if (!price) throw new Error(`Unknown variant "${item.variant}" for ${item.id}`);
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 50) throw new Error("Invalid quantity");
    const lineTotal = price * qty;
    subtotal += lineTotal;
    return { id: item.id, name: product.name, variant: item.variant, qty, price, lineTotal };
  });
  const shipping = subtotal >= SHIPPING.freeShippingAbove ? 0 : SHIPPING.shippingFee;
  const totalRupees = subtotal + shipping;
  return {
    lineItems,
    subtotal,
    shipping,
    totalRupees,
    amountPaise: Math.round(totalRupees * 100)
  };
}

module.exports = { PRODUCTS, SHIPPING, computeOrderTotal };
