let coins = 0;
let xp = 0;
let level = 1;

let customers = [];
let maxCustomers = 3;

let currentIngredients = [];

let upgrades = {
  speed: 1,
  tips: 1
};

const recipes = ["Coffee", "Burger", "Sandwich", "Pizza", "Juice"];

/* ---------- CUSTOMER SYSTEM ---------- */

function spawnCustomer() {
  if (customers.length >= maxCustomers) return;

  const customer = {
    id: Date.now(),
    order: recipes[Math.floor(Math.random() * recipes.length)],
    patience: 100
  };

  customers.push(customer);
  renderCustomers();
}

function renderCustomers() {
  const container = document.getElementById("customers");
  container.innerHTML = "";

  customers.forEach(c => {
    container.innerHTML += `
      <div class="customer">
        <div>Order: ${c.order}</div>
        <div class="bar">
          <div class="fill" id="bar-${c.id}"></div>
        </div>
      </div>
    `;
  });
}

/* ---------- PATIENCE SYSTEM ---------- */

function updatePatience() {
  customers.forEach((c, i) => {
    c.patience -= 1 * upgrades.speed;

    const bar = document.getElementById("bar-" + c.id);
    if (bar) bar.style.width = c.patience + "%";

    if (c.patience <= 0) {
      customers.splice(i, 1);
      coins = Math.max(0, coins - 10);
    }
  });

  renderCustomers();
  updateUI();
}

/* ---------- COOKING ---------- */

function addIngredient(item) {
  currentIngredients.push(item);
  document.getElementById("orderText").innerText =
    currentIngredients.join(" + ");
}

function serveOrder() {
  if (!customers.length) return;

  const customer = customers[0];

  if (currentIngredients.length === 1 &&
      currentIngredients[0] === customer.order) {

    coins += 20 * upgrades.tips;
    xp += 10;

  } else {
    coins = Math.max(0, coins - 5);
  }

  customers.shift();
  currentIngredients = [];

  checkLevel();
  renderCustomers();
  updateUI();
}

/* ---------- UPGRADES ---------- */

function upgrade(type) {
  if (type === "speed" && coins >= 50) {
    coins -= 50;
    upgrades.speed += 0.2;
  }

  if (type === "tips" && coins >= 75) {
    coins -= 75;
    upgrades.tips += 0.5;
  }

  if (type === "capacity" && coins >= 100) {
    coins -= 100;
    maxCustomers++;
  }

  updateUI();
}

/* ---------- LEVEL SYSTEM ---------- */

function checkLevel() {
  if (xp >= level * 50) {
    level++;
    xp = 0;
  }
}

/* ---------- UI ---------- */

function updateUI() {
  document.getElementById("coins").innerText = coins;
  document.getElementById("xp").innerText = xp;
  document.getElementById("level").innerText = level;
}

/* ---------- GAME LOOP ---------- */

function spawnCustomer() {
  if (customers.length >= maxCustomers) return;

  const customer = {
    id: Date.now() + Math.random(),
    order: recipes[Math.floor(Math.random() * recipes.length)],
    patience: 100
  };

  customers.push(customer);
  renderCustomers();
}; // spawn one immediately so game is not empty
setInterval(spawnCustomer, 3500)
;setInterval(updatePatience, 1000);

updateUI();