// ---------- Data ----------

const RARITIES = {
  common:    { label: "Common",    color: "#93a399", sellPrice: 5 },
  uncommon:  { label: "Uncommon",  color: "#5c8a52", sellPrice: 15 },
  rare:      { label: "Rare",      color: "#3e7cb1", sellPrice: 50 },
  epic:      { label: "Epic",      color: "#8b5fbf", sellPrice: 150 },
  legendary: { label: "Legendary", color: "#e8a93b", sellPrice: 500 },
  mythic:    { label: "Mythic",    color: "#d6476b", sellPrice: 1500 },
};

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];

const FOODS = [
  // common
  { id: "apple",   name: "Apple",       emoji: "🍎", rarity: "common" },
  { id: "bread",   name: "Bread Slice", emoji: "🍞", rarity: "common" },
  { id: "egg",     name: "Boiled Egg",  emoji: "🥚", rarity: "common" },
  { id: "carrot",  name: "Carrot",      emoji: "🥕", rarity: "common" },
  { id: "banana",  name: "Banana",      emoji: "🍌", rarity: "common" },
  { id: "rice",    name: "Rice Bowl",   emoji: "🍚", rarity: "common" },
  // uncommon
  { id: "cheese",    name: "Cheese Wedge", emoji: "🧀", rarity: "uncommon" },
  { id: "sandwich",  name: "Sandwich",     emoji: "🥪", rarity: "uncommon" },
  { id: "pretzel",   name: "Pretzel",      emoji: "🥨", rarity: "uncommon" },
  { id: "popcorn",   name: "Popcorn",      emoji: "🍿", rarity: "uncommon" },
  { id: "taco",      name: "Taco",         emoji: "🌮", rarity: "uncommon" },
  // rare
  { id: "sushi",   name: "Sushi Roll", emoji: "🍣", rarity: "rare" },
  { id: "burger",  name: "Burger",     emoji: "🍔", rarity: "rare" },
  { id: "pizza",   name: "Pizza Slice",emoji: "🍕", rarity: "rare" },
  { id: "steak",   name: "Steak",      emoji: "🥩", rarity: "rare" },
  { id: "pasta",   name: "Pasta",      emoji: "🍝", rarity: "rare" },
  // epic
  { id: "lobster", name: "Lobster Tail",  emoji: "🦞", rarity: "epic" },
  { id: "ramen",   name: "Ramen Deluxe",  emoji: "🍜", rarity: "epic" },
  { id: "paella",  name: "Paella",        emoji: "🥘", rarity: "epic" },
  { id: "hotpot",  name: "Hot Pot",       emoji: "🍲", rarity: "epic" },
  { id: "sundae",  name: "Sundae",        emoji: "🍨", rarity: "epic" },
  // legendary
  { id: "cake",    name: "Rainbow Cake",   emoji: "🎂", rarity: "legendary" },
  { id: "crab",    name: "Golden Crab",    emoji: "🦀", rarity: "legendary" },
  { id: "feast",   name: "Royal Feast",    emoji: "🍱", rarity: "legendary" },
  { id: "caviar",  name: "Caviar Platter", emoji: "🐟", rarity: "legendary" },
  // mythic
  { id: "pie",     name: "Cosmic Pie",       emoji: "🥧", rarity: "mythic" },
  { id: "phoenix", name: "Phoenix Roast",    emoji: "🔥", rarity: "mythic" },
  { id: "ambrosia",name: "Ambrosia Nectar",  emoji: "🍯", rarity: "mythic" },
];

const BOXES = [
  {
    id: "paper", name: "Paper Bag", emoji: "🛍️", price: 15,
    odds: { common: 62, uncommon: 28, rare: 9, epic: 1, legendary: 0, mythic: 0 },
  },
  {
    id: "crate", name: "Wooden Crate", emoji: "📦", price: 75,
    odds: { common: 38, uncommon: 35, rare: 21, epic: 5, legendary: 1, mythic: 0 },
  },
  {
    id: "tin", name: "Tin Box", emoji: "🥫", price: 300,
    odds: { common: 18, uncommon: 30, rare: 32, epic: 15, legendary: 4, mythic: 1 },
  },
  {
    id: "golden", name: "Golden Chest", emoji: "🎁", price: 1200,
    odds: { common: 4, uncommon: 13, rare: 30, epic: 32, legendary: 18, mythic: 3 },
  },
  {
    id: "diamond", name: "Diamond Cooler", emoji: "💎", price: 6000,
    odds: { common: 0, uncommon: 4, rare: 14, epic: 30, legendary: 37, mythic: 15 },
  },
];

const SAVE_KEY = "snackStashSave";

// ---------- State ----------

let state = {
  money: 0,
  clickPower: 1,
  clickLevel: 0,
  autoIncome: 0,
  autoLevel: 0,
  boxesOpened: 0,
  collection: {}, // foodId -> count
};

function clickUpgradeCost() {
  return Math.round(50 * Math.pow(1.6, state.clickLevel));
}

function autoUpgradeCost() {
  return Math.round(200 * Math.pow(1.7, state.autoLevel));
}

// ---------- Save / Load ----------

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // storage unavailable, ignore
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state = Object.assign({}, state, saved, {
      collection: Object.assign({}, saved.collection || {}),
    });
  } catch (e) {
    // corrupt save, ignore
  }
}

// ---------- DOM refs ----------

const moneyDisplay = document.getElementById("moneyDisplay");
const clickPowerDisplay = document.getElementById("clickPowerDisplay");
const autoIncomeDisplay = document.getElementById("autoIncomeDisplay");
const coinBtn = document.getElementById("coinBtn");
const floaters = document.getElementById("floaters");

const clickUpgradeBtn = document.getElementById("clickUpgradeBtn");
const clickUpgradeDesc = document.getElementById("clickUpgradeDesc");
const autoUpgradeBtn = document.getElementById("autoUpgradeBtn");
const autoUpgradeDesc = document.getElementById("autoUpgradeDesc");

const boxGrid = document.getElementById("boxGrid");
const foodGrid = document.getElementById("foodGrid");
const collectionProgress = document.getElementById("collectionProgress");
const sellDuplicatesBtn = document.getElementById("sellDuplicatesBtn");

const boxOverlay = document.getElementById("boxOverlay");
const revealBox = document.getElementById("revealBox");
const revealResult = document.getElementById("revealResult");
const revealEmoji = document.getElementById("revealEmoji");
const revealName = document.getElementById("revealName");
const revealRarity = document.getElementById("revealRarity");
const revealCloseBtn = document.getElementById("revealCloseBtn");

const toast = document.getElementById("toast");

let toastTimer = null;
let overlayBusy = false;

// ---------- Helpers ----------

function formatMoney(n) {
  return "$" + Math.floor(n).toLocaleString();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function pulseWallet() {
  moneyDisplay.classList.remove("pulse");
  // force reflow so the animation can retrigger
  void moneyDisplay.offsetWidth;
  moneyDisplay.classList.add("pulse");
}

// ---------- Rendering ----------

function render() {
  moneyDisplay.textContent = formatMoney(state.money);
  clickPowerDisplay.textContent = formatMoney(state.clickPower);
  autoIncomeDisplay.textContent = formatMoney(state.autoIncome);

  const cCost = clickUpgradeCost();
  clickUpgradeDesc.textContent = `+$1 per press (now $${state.clickPower})`;
  clickUpgradeBtn.textContent = `Upgrade — ${formatMoney(cCost)}`;
  clickUpgradeBtn.disabled = state.money < cCost;

  const aCost = autoUpgradeCost();
  autoUpgradeDesc.textContent = `+$1 per second (now $${state.autoIncome}/s)`;
  autoUpgradeBtn.textContent = `Hire — ${formatMoney(aCost)}`;
  autoUpgradeBtn.disabled = state.money < aCost;

  renderBoxes();
  renderCollection();
}

function renderBoxes() {
  boxGrid.innerHTML = "";
  BOXES.forEach((box) => {
    const card = document.createElement("div");
    card.className = "box-card";

    const oddsRows = RARITY_ORDER
      .filter((r) => box.odds[r] > 0)
      .map((r) => {
        const info = RARITIES[r];
        return `<div class="odds-row">
          <span><span class="odds-dot" style="background:${info.color}"></span>${info.label}</span>
          <span>${box.odds[r]}%</span>
        </div>`;
      })
      .join("");

    card.innerHTML = `
      <div class="box-emoji">${box.emoji}</div>
      <div class="box-name">${box.name}</div>
      <div class="box-price">${formatMoney(box.price)}</div>
      <details class="box-odds">
        <summary>Odds</summary>
        ${oddsRows}
      </details>
      <button class="btn box-buy-btn" type="button">Open</button>
    `;

    const buyBtn = card.querySelector(".box-buy-btn");
    buyBtn.disabled = state.money < box.price;
    buyBtn.addEventListener("click", () => openBox(box));

    boxGrid.appendChild(card);
  });
}

function renderCollection() {
  foodGrid.innerHTML = "";
  let discoveredCount = 0;

  const sorted = [...FOODS].sort(
    (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
  );

  sorted.forEach((food) => {
    const count = state.collection[food.id] || 0;
    const info = RARITIES[food.rarity];
    const slot = document.createElement("div");
    slot.className = "food-slot " + (count > 0 ? "discovered" : "locked");
    if (count > 0) {
      slot.style.setProperty("--slot-color", info.color);
      discoveredCount++;
      slot.innerHTML = `
        <span class="food-emoji">${food.emoji}</span>
        <span class="food-name">${food.name}</span>
        ${count > 1 ? `<span class="food-count">x${count}</span>` : ""}
      `;
    } else {
      slot.innerHTML = `
        <span class="food-emoji">❓</span>
        <span class="food-name">???</span>
      `;
    }
    foodGrid.appendChild(slot);
  });

  collectionProgress.textContent = `${discoveredCount} of ${FOODS.length} foods found`;
}

// ---------- Coin click ----------

function spawnFloater(text) {
  const el = document.createElement("span");
  el.className = "floater";
  el.textContent = text;
  const x = 50 + (Math.random() * 30 - 15);
  el.style.left = x + "%";
  el.style.top = "40%";
  floaters.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

coinBtn.addEventListener("click", () => {
  state.money += state.clickPower;
  spawnFloater("+" + formatMoney(state.clickPower));

  coinBtn.classList.remove("pressed");
  void coinBtn.offsetWidth;
  coinBtn.classList.add("pressed");

  render();
  saveGame();
});

// ---------- Upgrades ----------

clickUpgradeBtn.addEventListener("click", () => {
  const cost = clickUpgradeCost();
  if (state.money < cost) return;
  state.money -= cost;
  state.clickPower += 1;
  state.clickLevel += 1;
  render();
  saveGame();
});

autoUpgradeBtn.addEventListener("click", () => {
  const cost = autoUpgradeCost();
  if (state.money < cost) return;
  state.money -= cost;
  state.autoIncome += 1;
  state.autoLevel += 1;
  render();
  saveGame();
});

setInterval(() => {
  if (state.autoIncome > 0) {
    state.money += state.autoIncome;
    pulseWallet();
    render();
    saveGame();
  }
}, 1000);

// ---------- Box opening ----------

function pickRarity(odds) {
  const total = RARITY_ORDER.reduce((sum, r) => sum + (odds[r] || 0), 0);
  let roll = Math.random() * total;
  for (const r of RARITY_ORDER) {
    const weight = odds[r] || 0;
    if (roll < weight) return r;
    roll -= weight;
  }
  return RARITY_ORDER[0];
}

function pickFood(rarity) {
  const pool = FOODS.filter((f) => f.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

function openBox(box) {
  if (overlayBusy) return;
  if (state.money < box.price) {
    showToast("Not enough money for that box yet.");
    return;
  }

  state.money -= box.price;
  state.boxesOpened += 1;
  render();
  saveGame();

  overlayBusy = true;
  boxOverlay.classList.add("open");
  revealResult.hidden = true;
  revealBox.hidden = false;
  revealBox.textContent = box.emoji;
  revealBox.classList.remove("shaking");
  void revealBox.offsetWidth;
  revealBox.classList.add("shaking");

  setTimeout(() => {
    const rarity = pickRarity(box.odds);
    const food = pickFood(rarity);
    const info = RARITIES[rarity];

    state.collection[food.id] = (state.collection[food.id] || 0) + 1;
    render();
    saveGame();

    revealBox.hidden = true;
    revealEmoji.textContent = food.emoji;
    revealName.textContent = food.name;
    revealRarity.textContent = info.label;
    revealRarity.style.setProperty("--rarity-color", info.color);
    revealRarity.style.color = info.color;
    revealResult.hidden = false;

    if (rarity === "epic" || rarity === "legendary" || rarity === "mythic") {
      showToast(`${info.label} find: ${food.name}!`);
    }
  }, 650);
}

revealCloseBtn.addEventListener("click", () => {
  boxOverlay.classList.remove("open");
  overlayBusy = false;
});

// ---------- Sell duplicates ----------

sellDuplicatesBtn.addEventListener("click", () => {
  let earned = 0;
  let itemsSold = 0;

  Object.keys(state.collection).forEach((foodId) => {
    const count = state.collection[foodId];
    if (count > 1) {
      const food = FOODS.find((f) => f.id === foodId);
      if (!food) return;
      const extra = count - 1;
      earned += extra * RARITIES[food.rarity].sellPrice;
      itemsSold += extra;
      state.collection[foodId] = 1;
    }
  });

  if (itemsSold === 0) {
    showToast("No duplicates to sell right now.");
    return;
  }

  state.money += earned;
  showToast(`Sold ${itemsSold} duplicate${itemsSold === 1 ? "" : "s"} for ${formatMoney(earned)}.`);
  render();
  saveGame();
});

// ---------- Reset ----------

document.getElementById("resetBtn").addEventListener("click", () => {
  const sure = confirm("Reset all progress? This cannot be undone.");
  if (!sure) return;
  state = {
    money: 0,
    clickPower: 1,
    clickLevel: 0,
    autoIncome: 0,
    autoLevel: 0,
    boxesOpened: 0,
    collection: {},
  };
  saveGame();
  render();
  showToast("Progress reset.");
});

// ---------- Init ----------

loadGame();
render();