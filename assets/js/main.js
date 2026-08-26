/* =========================================================
   Ruchi Bites — Shared UI behaviour (nav, scroll reveal, toast)
   ========================================================= */

/* ---------- Scroll reveal (shared observer, safe for dynamically-inserted content) ----------
   Call observeReveals(root) any time NEW .reveal elements are added to the page
   after load (e.g. product cards rendered into a grid via JS) — it only observes
   elements that aren't already being watched, so it's safe to call repeatedly. */
let _revealIO = null;
function observeReveals(root = document){
  const els = root.querySelectorAll ? root.querySelectorAll(".reveal:not([data-reveal-bound])") : [];
  if (!els.length) return;

  if (!("IntersectionObserver" in window)){
    els.forEach(el => el.classList.add("in-view"));
    return;
  }
  if (!_revealIO){
    _revealIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          _revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }
  els.forEach(el => {
    el.setAttribute("data-reveal-bound", "1");
    _revealIO.observe(el);
    // Safety net: never leave content permanently invisible if the observer
    // callback is delayed/blocked (some extensions, bfcache edge cases, etc.)
    setTimeout(() => el.classList.add("in-view"), 2500);
  });
}

(function(){
  // Sticky header shrink shadow
  const header = document.getElementById("site-header");
  if (header){
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav toggle
  const burger = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  const scrim = document.getElementById("navScrim");
  function closeNav(){ navLinks?.classList.remove("open"); scrim?.classList.remove("open"); }
  function toggleNav(){ navLinks?.classList.toggle("open"); scrim?.classList.toggle("open"); }
  burger?.addEventListener("click", toggleNav);
  scrim?.addEventListener("click", closeNav);
  navLinks?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));

  // Highlight active nav link based on current page
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });

  // Footer year
  document.querySelectorAll(".footer-year").forEach(el => { el.textContent = new Date().getFullYear(); });

  // Scroll reveal for anything already in the initial HTML
  observeReveals(document);

  // Cart badge on load
  if (window.Cart) Cart.updateBadge();
})();

// Toast helper
let toastTimer;
function showToast(msg, icon = "✅"){
  let toast = document.getElementById("toast");
  if (!toast){
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- Shared product card renderer (used by index.html + shop.html) ---------- */
function productMedia(p){
  // Swap this for a real <img> once you have product photos:
  // return `<img src="assets/images/${p.id}.jpg" alt="${p.name}" loading="lazy">`;
  return `<div class="emoji">${p.emoji}</div>`;
}

function renderProductCard(p){
  const variantKeys = Object.keys(p.variants);
  const defaultVariant = variantKeys[0];
  return `
  <div class="product-card reveal" data-id="${p.id}">
    <div class="product-media" style="background:linear-gradient(135deg,var(--brand-100),var(--brand-200));">
      ${p.tag ? `<span class="badge">${p.tag}</span>` : ""}
      ${p.veg ? `<span class="badge veg"></span>` : ""}
      ${productMedia(p)}
    </div>
    <div class="product-body">
      <h3>${p.name}</h3>
      <p class="desc">${p.desc}</p>
      <div class="variant-row" data-variants>
        ${variantKeys.map((v, idx) => `<button type="button" class="variant-btn ${idx === 0 ? "active" : ""}" data-variant="${v}">${v}</button>`).join("")}
      </div>
      <div class="price-row">
        <span class="price" data-price>${formatINR(p.variants[defaultVariant])}</span>
        <button type="button" class="add-btn" data-add title="Add to cart" aria-label="Add to cart">+</button>
      </div>
    </div>
  </div>`;
}

function wireProductCards(root = document){
  observeReveals(root);
  root.querySelectorAll(".product-card").forEach(card => {
    const id = card.dataset.id;
    const product = findProduct(id);
    let selectedVariant = Object.keys(product.variants)[0];

    card.querySelectorAll(".variant-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        card.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedVariant = btn.dataset.variant;
        card.querySelector("[data-price]").textContent = formatINR(product.variants[selectedVariant]);
      });
    });

    card.querySelector("[data-add]").addEventListener("click", (e) => {
      Cart.add(id, selectedVariant, 1);
      const btn = e.currentTarget;
      btn.classList.remove("added");
      void btn.offsetWidth;
      btn.classList.add("added");
      showToast(`${product.name} (${selectedVariant}) added to cart`, "🛒");
    });
  });
}
