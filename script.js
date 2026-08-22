/* ============================================================
   Coin Clicker & Food Boxes
   - Local login/signup (saved in browser localStorage)
   - Auto-save of progress
   - Ready for future online features
   ============================================================ */

// -------------------- DATA --------------------
const FOODS = {
  common: [
    { id: "apple", name: "Apple", emoji: "🍎", value: 1 },
    { id: "banana", name: "Banana", emoji: "🍌", value: 1 },
    { id: "carrot", name: "Carrot", emoji: "🥕", value: 1 },
    { id: "bread", name: "Bread", emoji: "🍞", value: 1 },
    { id: "cookie", name: "Cookie", emoji: "🍪", value: 2 },
  ],
  uncommon: [
    { id: "pizza", name: "Pizza Slice", emoji: "🍕", value: 5 },
    { id: "burger", name: "Burger", emoji: "🍔", value: 5 },
    { id: "icecream", name: "Ice Cream", emoji: "🍦", value: 6 },
    { id: "donut", name: "Donut", emoji: "🍩", value: 5 },
    { id: "taco", name: "Taco", emoji: "🌮", value: 6 },
  ],
  rare: [
    { id: "sushi", name: "Sushi", emoji: "🍣", value: 15 },
    { id: "cake", name: "Cake", emoji: "🍰", value: 18 },
    { id: "steak", name: "Steak", emoji: "🥩", value: 20 },
    { id: "ramen", name: "Ramen", emoji: "🍜", value: 16 },
  ],
  epic: [
    { id: "lobster", name: "Lobster", emoji: "🦞", value: 50 },
    { id: "champagne", name: "Fancy Drink", emoji: "🥂", value: 45 },
    { id: "truffle", name: "Truffle Pasta", emoji: "🍝", value: 55 },
  ],
  legendary: [
    { id: "golden_apple", name: "Golden Apple", emoji: "✨🍎", value: 200 },
    { id: "rainbow_cake", name: "Rainbow Cake", emoji: "🌈🎂", value: 250 },
    { id: "diamond_pizza", name: "Diamond Pizza", emoji: "💎🍕", value: 300 },
  ],
};

const BOXES = [
  {
    id: "common",
    name: "Common Box",
    emoji: "📦",
    cost: 25,
    luck: "Low luck",
    // chances: common, uncommon, rare, epic, legendary
    weights: [80, 15, 4, 1, 0],
  },
  {
    id: "uncommon",
    name: "Uncommon Box",
    emoji: "🎁",
    cost: 100,
    luck: "Better luck",
    weights: [40, 40, 15, 4, 1],
  },
  {
    id: "rare",
    name: "Rare Box",
    emoji: "💎",
    cost: 400,
    luck: "Good luck",
    weights: [10, 30, 40, 15, 5],
  },
  {
    id: "epic",
    name: "Epic Box",
    emoji: "🔮",
    cost: 1500,
    luck: "Great luck",
    weights: [0, 10, 30, 45, 15],
  },
  {
    id: "legendary",
    name: "Legendary Box",
    emoji: "👑",
    cost: 5000,
    luck: "Amazing luck!",
    weights: [0, 0, 15, 35, 50],
  },
];

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

// -------------------- STATE --------------------
let currentUser = null; // username string
let gameData = {
  money: 0,
  inventory: {}, // { foodId: count }
  totalClicks: 0,
};

// -------------------- STORAGE HELPERS --------------------
const USERS_KEY = "coinClicker_users";
const CURRENT_USER_KEY = "coinClicker_currentUser";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveProgress() {
  if (!currentUser) return;
  const users = getUsers();
  if (users[currentUser]) {
    users[currentUser].data = { ...gameData };
    saveUsers(users);
  }
}

function loadProgress(username) {
  const users = getUsers();
  if (users[username] && users[username].data) {
    gameData = {
      money: users[username].data.money || 0,
      inventory: users[username].data.inventory || {},
      totalClicks: users[username].data.totalClicks || 0,
    };
  } else {
    gameData = { money: 0, inventory: {}, totalClicks: 0 };
  }
}

// Auto-save every 3 seconds + on important actions
setInterval(() => {
  if (currentUser) saveProgress();
}, 3000);

window.addEventListener("beforeunload", () => {
  if (currentUser) saveProgress();
});

// -------------------- AUTH --------------------
const authScreen = document.getElementById("auth-screen");
const gameScreen = document.getElementById("game-screen");
const authForm = document.getElementById("auth-form");
const authError = document.getElementById("auth-error");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const authSubmit = document.getElementById("auth-submit");

let isSignupMode = false;

tabLogin.addEventListener("click", () => {
  isSignupMode = false;
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  authSubmit.textContent = "Log In";
  authError.textContent = "";
});

tabSignup.addEventListener("click", () => {
  isSignupMode = true;
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  authSubmit.textContent = "Sign Up";
  authError.textContent = "";
});

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username.length < 3) {
    authError.textContent = "Username must be at least 3 characters.";
    return;
  }
  if (password.length < 3) {
    authError.textContent = "Password must be at least 3 characters.";
    return;
  }

  const users = getUsers();

  if (isSignupMode) {
    if (users[username]) {
      authError.textContent = "Username already taken.";
      return;
    }
    users[username] = {
      password: password, // stored locally only (for demo)
      data: { money: 0, inventory: {}, totalClicks: 0 },
    };
    saveUsers(users);
    showToast("Account created! Welcome 🎉");
  } else {
    if (!users[username] || users[username].password !== password) {
      authError.textContent = "Wrong username or password.";
      return;
    }
  }

  // Success
  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, username);
  loadProgress(username);
  startGame();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  saveProgress();
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  gameScreen.classList.add("hidden");
  authScreen.classList.remove("hidden");
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  authError.textContent = "";
});

// Auto-login if already logged in
(function checkAutoLogin() {
  const savedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (savedUser) {
    const users = getUsers();
    if (users[savedUser]) {
      currentUser = savedUser;
      loadProgress(savedUser);
      startGame();
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
})();

// -------------------- GAME LOGIC --------------------
function startGame() {
  authScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  document.getElementById("display-username").textContent = currentUser;
  renderShop();
  updateUI();
}

function updateUI() {
  document.getElementById("money-count").textContent = formatNumber(gameData.money);
  document.getElementById("click-power").textContent = "1";

  // Inventory
  const invList = document.getElementById("inventory-list");
  const foodIds = Object.keys(gameData.inventory).filter(
    (id) => gameData.inventory[id] > 0
  );

  let totalFoods = 0;
  let collectionValue = 0;

  // Calculate totals
  for (const rarity of RARITY_ORDER) {
    for (const food of FOODS[rarity]) {
      const count = gameData.inventory[food.id] || 0;
      totalFoods += count;
      collectionValue += count * food.value;
    }
  }

  document.getElementById("total-foods").textContent = totalFoods;
  document.getElementById("collection-value").textContent = formatNumber(collectionValue);

  if (foodIds.length === 0) {
    invList.innerHTML = `<div class="empty-inventory">No food yet. Open some boxes!</div>`;
    return;
  }

  // Build sorted list (by rarity then name)
  let html = "";
  for (const rarity of RARITY_ORDER) {
    for (const food of FOODS[rarity]) {
      const count = gameData.inventory[food.id] || 0;
      if (count > 0) {
        html += `
          <div class="food-item ${rarity}">
            <span class="count-badge">${count}</span>
            <span class="food-emoji">${food.emoji}</span>
            <div class="food-name">${food.name}</div>
            <div class="food-rarity">${rarity}</div>
          </div>
        `;
      }
    }
  }
  invList.innerHTML = html;
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

// -------------------- COIN CLICK --------------------
const coinBtn = document.getElementById("coin-btn");

coinBtn.addEventListener("click", (e) => {
  gameData.money += 1;
  gameData.totalClicks += 1;
  updateUI();
  saveProgress();

  // Visual feedback
  coinBtn.classList.add("clicked");
  setTimeout(() => coinBtn.classList.remove("clicked"), 100);

  // Floating +1
  const rect = coinBtn.getBoundingClientRect();
  const floater = document.createElement("div");
  floater.className = "float-text";
  floater.textContent = "+1";
  floater.style.left = e.clientX - 15 + "px";
  floater.style.top = e.clientY - 20 + "px";
  floater.style.position = "fixed";
  document.body.appendChild(floater);
  setTimeout(() => floater.remove(), 800);
});

// -------------------- SHOP / BOXES --------------------
function renderShop() {
  const container = document.getElementById("shop-boxes");
  container.innerHTML = BOXES.map(
    (box) => `
    <div class="box-card ${box.id}">
      <span class="box-emoji">${box.emoji}</span>
      <div class="box-name">${box.name}</div>
      <div class="box-cost">🪙 ${formatNumber(box.cost)}</div>
      <div class="box-luck">${box.luck}</div>
      <button class="buy-btn" data-box="${box.id}" ${
        gameData.money < box.cost ? "disabled" : ""
      }>
        Buy & Open
      </button>
    </div>
  `
  ).join("");

  // Attach listeners
  container.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", () => buyBox(btn.dataset.box));
  });
}

function buyBox(boxId) {
  const box = BOXES.find((b) => b.id === boxId);
  if (!box) return;

  if (gameData.money < box.cost) {
    showToast("Not enough coins!");
    return;
  }

  gameData.money -= box.cost;

  // Roll rarity
  const rarity = rollRarity(box.weights);
  const foodList = FOODS[rarity];
  const food = foodList[Math.floor(Math.random() * foodList.length)];

  // Add to inventory
  if (!gameData.inventory[food.id]) {
    gameData.inventory[food.id] = 0;
  }
  gameData.inventory[food.id] += 1;

  updateUI();
  renderShop(); // refresh disabled states
  saveProgress();

  showToast(`You got ${food.emoji} ${food.name} (${rarity})!`);
}

function rollRarity(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return RARITY_ORDER[i];
  }
  return RARITY_ORDER[0];
}

// -------------------- TOAST --------------------
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// Keep shop buttons updated when money changes
const originalUpdateUI = updateUI;
updateUI = function () {
  originalUpdateUI();
  // Re-enable/disable buy buttons without full re-render if possible
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    const box = BOXES.find((b) => b.id === btn.dataset.box);
    if (box) {
      btn.disabled = gameData.money < box.cost;
    }
  });
};