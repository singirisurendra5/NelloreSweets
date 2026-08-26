/* =========================================================
   Ruchi Bites — Cart (localStorage based, no backend needed)
   Cart shape: [{ id, variant, qty }]
   ========================================================= */

const CART_KEY = "ruchibites_cart_v1";

const Cart = {
  read(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  },
  write(items){
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
    document.dispatchEvent(new CustomEvent("cart:changed", { detail: items }));
  },
  add(id, variant, qty = 1){
    const items = Cart.read();
    const existing = items.find(i => i.id === id && i.variant === variant);
    if (existing) existing.qty += qty;
    else items.push({ id, variant, qty });
    Cart.write(items);
  },
  setQty(id, variant, qty){
    let items = Cart.read();
    if (qty <= 0){
      items = items.filter(i => !(i.id === id && i.variant === variant));
    } else {
      const existing = items.find(i => i.id === id && i.variant === variant);
      if (existing) existing.qty = qty;
    }
    Cart.write(items);
  },
  remove(id, variant){ Cart.setQty(id, variant, 0); },
  clear(){ Cart.write([]); },
  count(){ return Cart.read().reduce((sum, i) => sum + i.qty, 0); },
  lines(){
    return Cart.read().map(i => {
      const p = findProduct(i.id);
      if (!p) return null;
      const price = p.variants[i.variant];
      return { ...i, product: p, price, lineTotal: price * i.qty };
    }).filter(Boolean);
  },
  subtotal(){ return Cart.lines().reduce((s, l) => s + l.lineTotal, 0); },
  shipping(){
    const sub = Cart.subtotal();
    if (sub === 0) return 0;
    return sub >= SITE.freeShippingAbove ? 0 : SITE.shippingFee;
  },
  total(){ return Cart.subtotal() + Cart.shipping(); },
  updateBadge(){
    document.querySelectorAll(".cart-count").forEach(el => {
      const c = Cart.count();
      el.textContent = c;
      el.style.display = c > 0 ? "flex" : "none";
    });
  }
};

document.addEventListener("DOMContentLoaded", Cart.updateBadge);
