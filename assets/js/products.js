/* =========================================================
   Ruchi Bites — Product Catalog
   Replace `emoji` with a real product photo any time by
   editing productMedia() in main.js (drop image files into
   /assets/images/ and swap the <div class="emoji"> for <img>).
   Prices are in INR. Add/remove products freely — every page
   (shop grid, cart, checkout) reads from this single file.
   ========================================================= */

const PRODUCTS = [
  {
    id: "murukulu",
    name: "Murukulu",
    category: "savory",
    emoji: "🌀",
    tag: "Bestseller",
    veg: true,
    desc: "Crispy rice & urad dal spirals, hand-pressed the traditional way.",
    variants: { "250g": 149, "500g": 279, "1kg": 529 }
  },
  {
    id: "mixture",
    name: "Andhra Mixture",
    category: "savory",
    emoji: "🥘",
    tag: "Bestseller",
    veg: true,
    desc: "Spicy, crunchy blend of sev, peanuts, curry leaves & boondi.",
    variants: { "250g": 139, "500g": 259, "1kg": 489 }
  },
  {
    id: "chekkalu",
    name: "Chekkalu",
    category: "savory",
    emoji: "🫓",
    tag: "",
    veg: true,
    desc: "Rice flour crackers with a peppery, sesame crunch.",
    variants: { "250g": 129, "500g": 239, "1kg": 449 }
  },
  {
    id: "ribbon-pakodi",
    name: "Ribbon Pakodi",
    category: "savory",
    emoji: "🎗️",
    tag: "",
    veg: true,
    desc: "Buttery, crisp ribbons of gram flour — light and moreish.",
    variants: { "250g": 145, "500g": 269, "1kg": 509 }
  },
  {
    id: "chegodilu",
    name: "Chegodilu",
    category: "savory",
    emoji: "🍩",
    tag: "",
    veg: true,
    desc: "Deep-fried rice-flour rings with a peppery kick.",
    variants: { "250g": 135, "500g": 249, "1kg": 469 }
  },
  {
    id: "boondi-laddu",
    name: "Boondi Laddu",
    category: "sweet",
    emoji: "🟠",
    tag: "Bestseller",
    veg: true,
    desc: "Soft, syrup-soaked gram flour pearls rolled into laddus.",
    variants: { "250g": 179, "500g": 339, "1kg": 649 }
  },
  {
    id: "kaju-katli",
    name: "Kaju Katli",
    category: "sweet",
    emoji: "💎",
    tag: "Premium",
    veg: true,
    desc: "Silky cashew fudge diamonds finished with edible silver.",
    variants: { "250g": 299, "500g": 579, "1kg": 1129 }
  },
  {
    id: "kobbari-laddu",
    name: "Kobbari Laddu",
    category: "sweet",
    emoji: "🥥",
    tag: "",
    veg: true,
    desc: "Fresh coconut & jaggery laddus — naturally sweet.",
    variants: { "250g": 169, "500g": 319, "1kg": 599 }
  },
  {
    id: "palli-chikki",
    name: "Palli Chikki",
    category: "sweet",
    emoji: "🥜",
    tag: "",
    veg: true,
    desc: "Roasted peanut & jaggery brittle, snapped fresh to order.",
    variants: { "250g": 119, "500g": 219, "1kg": 409 }
  },
  {
    id: "karam-boondi",
    name: "Karam Boondi",
    category: "savory",
    emoji: "🔶",
    tag: "",
    veg: true,
    desc: "Fiery, tangy gram-flour pearls — a spice-lover's favourite.",
    variants: { "250g": 125, "500g": 235, "1kg": 439 }
  },
  {
    id: "sunnundalu",
    name: "Sunnundalu",
    category: "sweet",
    emoji: "🤎",
    tag: "",
    veg: true,
    desc: "Urad dal & ghee laddus, a protein-rich grandma classic.",
    variants: { "250g": 189, "500g": 359, "1kg": 689 }
  },
  {
    id: "masala-kaju",
    name: "Masala Kaju",
    category: "savory",
    emoji: "🌰",
    tag: "Premium",
    veg: true,
    desc: "Whole cashews roasted with curry leaves & house spice mix.",
    variants: { "250g": 259, "500g": 499, "1kg": 969 }
  }
];

const CATEGORY_LABELS = { all: "All Snacks", savory: "Spicy & Savory", sweet: "Sweets" };

function findProduct(id){ return PRODUCTS.find(p => p.id === id); }
function formatINR(n){ return "₹" + Number(n).toLocaleString("en-IN"); }
