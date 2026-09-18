const FOODS = [
  { id: "apple", name: "Apple", emoji: "🍎", rarity: "common" },
  { id: "banana", name: "Banana", emoji: "🍌", rarity: "common" },
  { id: "bread", name: "Bread", emoji: "🍞", rarity: "common" },
  { id: "carrot", name: "Carrot", emoji: "🥕", rarity: "common" },
  { id: "egg", name: "Egg", emoji: "🥚", rarity: "common" },
  { id: "corn", name: "Corn", emoji: "🌽", rarity: "common" },
  { id: "pizza", name: "Pizza", emoji: "🍕", rarity: "uncommon" },
  { id: "burger", name: "Burger", emoji: "🍔", rarity: "uncommon" },
  { id: "donut", name: "Donut", emoji: "🍩", rarity: "uncommon" },
  { id: "icecream", name: "Ice Cream", emoji: "🍦", rarity: "uncommon" },
  { id: "sushi", name: "Sushi", emoji: "🍣", rarity: "uncommon" },
  { id: "taco", name: "Taco", emoji: "🌮", rarity: "rare" },
  { id: "cake", name: "Cake", emoji: "🎂", rarity: "rare" },
  { id: "steak", name: "Steak", emoji: "🥩", rarity: "rare" },
  { id: "ramen", name: "Ramen", emoji: "🍜", rarity: "rare" },
  { id: "pancakes", name: "Pancakes", emoji: "🥞", rarity: "rare" },
  { id: "bento", name: "Bento", emoji: "🍱", rarity: "epic" },
  { id: "cupcake", name: "Fancy Cupcake", emoji: "🧁", rarity: "epic" },
  { id: "mango", name: "Golden Mango", emoji: "🥭", rarity: "epic" },
  { id: "feast", name: "Party Feast", emoji: "🍽️", rarity: "epic" },
  { id: "cosmic", name: "Cosmic Pizza", emoji: "🌌", rarity: "legendary" },
  { id: "treasure", name: "Treasure Burger", emoji: "👑", rarity: "legendary" },
  { id: "rainbow", name: "Rainbow Cake", emoji: "🌈", rarity: "legendary" }
];

const BOXES = [
  {
    id: "snack",
    name: "Snack Box",
    emoji: "📦",
    price: 10,
    blurb: "Mostly everyday snacks",
    weights: { common: 70, uncommon: 25, rare: 5, epic: 0, legendary: 0 }
  },
  {
    id: "picnic",
    name: "Picnic Box",
    emoji: "🧺",
    price: 50,
    blurb: "Better chance of tasty finds",
    weights: { common: 40, uncommon: 40, rare: 16, epic: 4, legendary: 0 }
  },
  {
    id: "party",
    name: "Party Box",
    emoji: "🎁",
    price: 200,
    blurb: "Good luck for rare foods",
    weights: { common: 18, uncommon: 30, rare: 32, epic: 16, legendary: 4 }
  },
  {
    id: "chef",
    name: "Chef's Chest",
    emoji: "💎",
    price: 800,
    blurb: "Best luck in the kitchen",
    weights: { common: 5, uncommon: 15, rare: 30, epic: 35, legendary: 15 }
  }
];

const VERSION = "0.0.1";
const SAVE_KEY = "yummy-boxes-v1";
const PATCH_SEEN_KEY = "yummy-boxes-seen-patch";

const DUPLICATE_REFUND = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 50
};

const state = {
  money: 0,
  clicks: 0,
  opened: 0,
  collection: {},
  lastDrop: null
};

const els = {
  money: document.getElementById("money"),
  clicks: document.getElementById("clicks"),
  opened: document.getElementById("opened"),
  found: document.getElementById("found"),
  totalFoods: document.getElementById("totalFoods"),
  coin: document.getElementById("coin"),
  shop: document.getElementById("shop"),
  reveal: document.getElementById("reveal"),
  foods: document.getElementById("foods"),
  toast: document.getElementById("toast"),
  confetti: document.getElementById("confetti"),
  reset: document.getElementById("reset"),
  patchNotes: document.getElementById("patchNotes"),
  patchModal: document.getElementById("patchModal"),
  closePatch: document.getElementById("closePatch")
};

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.money = data.money || 0;
    state.clicks = data.clicks || 0;
    state.opened = data.opened || 0;
    state.collection = data.collection || {};
    state.lastDrop = data.lastDrop || null;
  } catch (e) {}
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function uniqueCount() {
  return Object.keys(state.collection).length;
}

function renderStats() {
  els.money.textContent = state.money;
  els.clicks.textContent = state.clicks;
  els.opened.textContent = state.opened;
  els.found.textContent = uniqueCount();
  els.totalFoods.textContent = FOODS.length;
}

function renderShop() {
  els.shop.innerHTML = BOXES.map((box) => {
    const missing = box.price - state.money;
    const canBuy = missing <= 0;
    const extra = canBuy ? box.blurb : `Need ${missing} more coin${missing === 1 ? "" : "s"}`;
    return `
      <button class="box-btn" data-box="${box.id}" ${canBuy ? "" : "disabled"}>
        <span class="box-emoji">${box.emoji}</span>
        <span>
          <strong>${box.name}</strong>
          <small>${extra}</small>
        </span>
        <span class="price">🪙 ${box.price}</span>
      </button>
    `;
  }).join("");
}

function renderCollection() {
  els.foods.innerHTML = FOODS.map((food) => {
    const count = state.collection[food.id] || 0;
    const locked = count === 0;
    return `
      <div class="food-card ${locked ? "locked" : ""}">
        <div class="icon">${locked ? "❓" : food.emoji}</div>
        <div class="name">${locked ? "Mystery" : food.name}</div>
        <div class="count ${food.rarity}">${locked ? food.rarity : "x" + count}</div>
      </div>
    `;
  }).join("");
}

function renderAll() {
  renderStats();
  renderShop();
  renderCollection();
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 1600);
}

function spawnFloat(text) {
  const stage = els.coin.parentElement;
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  const rect = els.coin.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  el.style.left = (rect.left - stageRect.left + rect.width / 2 + (Math.random() * 40 - 20)) + "px";
  el.style.top = (rect.top - stageRect.top + 20) + "px";
  stage.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function pickRarity(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries[0][0];
}

function pickFood(rarity) {
  const pool = FOODS.filter((f) => f.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function burst(emoji) {
  for (let i = 0; i < 18; i++) {
    const bit = document.createElement("div");
    bit.className = "bit";
    bit.textContent = emoji;
    bit.style.left = Math.random() * 100 + "vw";
    bit.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
    bit.style.fontSize = 14 + Math.random() * 16 + "px";
    els.confetti.appendChild(bit);
    setTimeout(() => bit.remove(), 2800);
  }
}

function showDrop(drop) {
  if (!drop) {
    els.reveal.textContent = "Open a box to find a yummy food!";
    return;
  }
  const refundText = drop.refund
    ? ` • duplicate refund +${drop.refund}`
    : "";
  els.reveal.innerHTML = `
    <span class="food">${drop.emoji}</span>
    <div>
      <div><strong>${drop.isNew ? "New food!" : "You got"} ${drop.name}</strong></div>
      <div class="rarity ${drop.rarity}">${drop.rarity} • from ${drop.boxName}${refundText}</div>
    </div>
  `;
}

function earn(amount) {
  state.clicks += 1;
  const lucky = state.clicks % 10 === 0;
  const gained = lucky ? amount + 2 : amount;
  state.money += gained;
  spawnFloat(lucky ? "+" + gained + " lucky!" : "+" + gained);
  renderStats();
  renderShop();
  save();
}

function openBox(box) {
  if (state.money < box.price) {
    toast("Need more coins!");
    return;
  }
  state.money -= box.price;
  state.opened += 1;
  const rarity = pickRarity(box.weights);
  const food = pickFood(rarity);
  const isNew = !state.collection[food.id];
  state.collection[food.id] = (state.collection[food.id] || 0) + 1;

  let refund = 0;
  if (!isNew) {
    refund = DUPLICATE_REFUND[rarity] || 0;
    state.money += refund;
  }

  state.lastDrop = {
    name: food.name,
    emoji: food.emoji,
    rarity,
    boxName: box.name,
    isNew,
    refund
  };
  showDrop(state.lastDrop);

  if (rarity === "legendary") burst("✨");
  else if (rarity === "epic") burst("🎉");
  else if (isNew) burst(food.emoji);

  if (isNew) toast("New food added to your collection!");
  else if (refund) toast("Duplicate! +" + refund + " coins back");
  renderAll();
  save();
}

els.coin.addEventListener("pointerdown", () => {
  els.coin.classList.add("pressed");
  earn(1);
});
els.coin.addEventListener("pointerup", () => els.coin.classList.remove("pressed"));
els.coin.addEventListener("pointerleave", () => els.coin.classList.remove("pressed"));

els.shop.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-box]");
  if (!btn) return;
  const box = BOXES.find((b) => b.id === btn.dataset.box);
  if (box) openBox(box);
});

els.reset.addEventListener("click", () => {
  if (!confirm("Reset all coins and foods?")) return;
  state.money = 0;
  state.clicks = 0;
  state.opened = 0;
  state.collection = {};
  state.lastDrop = null;
  showDrop(null);
  renderAll();
  save();
});

function openPatchNotes() {
  els.patchModal.hidden = false;
}

function closePatchNotes() {
  els.patchModal.hidden = true;
  localStorage.setItem(PATCH_SEEN_KEY, VERSION);
}

els.patchNotes.addEventListener("click", openPatchNotes);
els.closePatch.addEventListener("click", closePatchNotes);
els.patchModal.addEventListener("click", (e) => {
  if (e.target === els.patchModal) closePatchNotes();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Escape" && !els.patchModal.hidden) {
    closePatchNotes();
    return;
  }
  if (e.code !== "Space" && e.code !== "Enter") return;
  if (e.target !== document.body && e.target !== els.coin) return;
  e.preventDefault();
  els.coin.classList.add("pressed");
  earn(1);
  setTimeout(() => els.coin.classList.remove("pressed"), 90);
});

load();
renderAll();
showDrop(state.lastDrop);

if (localStorage.getItem(PATCH_SEEN_KEY) !== VERSION) {
  openPatchNotes();
}
