// Game State
let money = 0;

// Food Database (with added sell values)
const foods = [
  // Common
  { id: 'apple', name: 'Apple', icon: '🍎', rarity: 'Common', value: 2 },
  { id: 'bread', name: 'Bread', icon: '🍞', rarity: 'Common', value: 2 },
  { id: 'carrot', name: 'Carrot', icon: '🥕', rarity: 'Common', value: 2 },
  
  // Uncommon
  { id: 'pizza', name: 'Pizza', icon: '🍕', rarity: 'Uncommon', value: 8 },
  { id: 'burger', name: 'Burger', icon: '🍔', rarity: 'Uncommon', value: 8 },
  { id: 'taco', name: 'Taco', icon: '🌮', rarity: 'Uncommon', value: 8 },
  
  // Rare
  { id: 'sushi', name: 'Sushi', icon: '🍣', rarity: 'Rare', value: 25 },
  { id: 'ramen', name: 'Ramen', icon: '🍜', rarity: 'Rare', value: 25 },
  { id: 'steak', name: 'Steak', icon: '🥩', rarity: 'Rare', value: 25 },

  // Epic
  { id: 'cake', name: 'Cake', icon: '🎂', rarity: 'Epic', value: 80 },
  { id: 'lobster', name: 'Lobster', icon: '🦞', rarity: 'Epic', value: 80 },
  { id: 'bento', name: 'Bento', icon: '🍱', rarity: 'Epic', value: 80 },

  // Legendary
  { id: 'golden_apple', name: 'Golden Apple', icon: '🍏', rarity: 'Legendary', value: 300 },
  { id: 'caviar', name: 'Caviar', icon: '🍲', rarity: 'Legendary', value: 300 },
  { id: 'champagne', name: 'Champagne', icon: '🍾', rarity: 'Legendary', value: 300 }
];

// Boxes Config
const boxes = [
  {
    id: 'basic',
    name: 'Basic Box',
    price: 10,
    odds: { Common: 70, Uncommon: 20, Rare: 9, Epic: 1, Legendary: 0 }
  },
  {
    id: 'silver',
    name: 'Silver Box',
    price: 50,
    odds: { Common: 30, Uncommon: 45, Rare: 18, Epic: 6, Legendary: 1 }
  },
  {
    id: 'gold',
    name: 'Gold Box',
    price: 200,
    odds: { Common: 5, Uncommon: 25, Rare: 40, Epic: 20, Legendary: 10 }
  }
];

// Player Inventory (food_id -> quantity)
let inventory = {};
foods.forEach(food => inventory[food.id] = 0);

// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const coin = document.getElementById('coin');
const shopContainer = document.getElementById('shop-container');
const inventoryContainer = document.getElementById('inventory-container');
const resultDisplay = document.getElementById('result-display');
const resetBtn = document.getElementById('reset-btn');

// --- SAVE / LOAD SYSTEM ---
function saveGame() {
  const saveData = {
    money: money,
    inventory: inventory
  };
  localStorage.setItem('food_clicker_save', JSON.stringify(saveData));
}

function loadGame() {
  const saved = localStorage.getItem('food_clicker_save');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      money = parsed.money || 0;
      if (parsed.inventory) {
        inventory = { ...inventory, ...parsed.inventory };
      }
    } catch (e) {
      console.error('Failed to load save data:', e);
    }
  }
}

resetBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all your progress?')) {
    money = 0;
    foods.forEach(food => inventory[food.id] = 0);
    saveGame();
    updateUI();
    resultDisplay.innerHTML = '';
  }
});

// Click Coin Action
coin.addEventListener('click', (e) => {
  money += 1;
  saveGame();
  updateUI();

  // Floating text effect
  const pop = document.createElement('div');
  pop.className = 'click-pop';
  pop.innerText = '+$1';
  
  const rect = coin.getBoundingClientRect();
  const x = e.clientX - rect.left - 20;
  const y = e.clientY - rect.top - 20;
  
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  coin.parentElement.appendChild(pop);

  setTimeout(() => pop.remove(), 800);
});

// Generate Shop Cards
function renderShop() {
  shopContainer.innerHTML = '';
  boxes.forEach(box => {
    const card = document.createElement('div');
    card.className = 'box-card';
    card.id = `box-card-${box.id}`;
    card.innerHTML = `
      <div class="box-info">
        <h3>${box.name}</h3>
        <p>Best Odds: ${getBestOddsText(box.odds)}</p>
      </div>
      <button class="buy-btn" id="buy-${box.id}">
        $${box.price}
      </button>
    `;

    const buyBtn = card.querySelector(`#buy-${box.id}`);
    buyBtn.addEventListener('click', () => buyBox(box.id));

    shopContainer.appendChild(card);
  });
}

function getBestOddsText(odds) {
  if (odds.Legendary > 0) return `${odds.Legendary}% Legendary`;
  if (odds.Epic > 0) return `${odds.Epic}% Epic`;
  return `${odds.Rare}% Rare`;
}

// Buy & Open Box
function buyBox(boxId) {
  const box = boxes.find(b => b.id === boxId);
  if (!box || money < box.price) return;

  money -= box.price;

  // Pulse animation on the opened box
  const card = document.getElementById(`box-card-${boxId}`);
  if (card) {
    card.classList.remove('opening');
    void card.offsetWidth; // Trigger reflow
    card.classList.add('opening');
  }
  
  // Determine Rarity based on Box Odds
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedRarity = 'Common';

  for (const [rarity, percent] of Object.entries(box.odds)) {
    cumulative += percent;
    if (rand <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  // Select random food of that rarity
  const availableFoods = foods.filter(f => f.rarity === selectedRarity);
  const wonFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];

  // Add to inventory
  inventory[wonFood.id] += 1;

  // Show result text
  resultDisplay.className = `unboxed-result ${wonFood.rarity}`;
  resultDisplay.innerHTML = `You pulled: ${wonFood.icon} ${wonFood.name} (${wonFood.rarity})!`;

  saveGame();
  updateUI();
}

// Sell Food Action
function sellFood(foodId) {
  const food = foods.find(f => f.id === foodId);
  if (!food || inventory[foodId] <= 0) return;

  inventory[foodId] -= 1;
  money += food.value;

  resultDisplay.className = `unboxed-result Common`;
  resultDisplay.innerHTML = `Sold 1x ${food.icon} ${food.name} for +$${food.value}!`;

  saveGame();
  updateUI();
}

// Render Collection Inventory
function renderInventory() {
  inventoryContainer.innerHTML = '';
  foods.forEach(food => {
    const count = inventory[food.id];
    const card = document.createElement('div');
    card.className = `food-card ${food.rarity} ${count === 0 ? 'locked' : ''}`;
    
    card.innerHTML = `
      ${count > 0 ? `<div class="food-count">x${count}</div>` : ''}
      <div class="food-icon">${count > 0 ? food.icon : '❓'}</div>
      <div class="food-name">${count > 0 ? food.name : '???'}</div>
      ${count > 0 ? `<button class="sell-btn" id="sell-${food.id}">Sell ($${food.value})</button>` : ''}
    `;

    if (count > 0) {
      const sellBtn = card.querySelector(`#sell-${food.id}`);
      sellBtn.addEventListener('click', () => sellFood(food.id));
    }

    inventoryContainer.appendChild(card);
  });
}

// Update UI elements
function updateUI() {
  moneyDisplay.innerText = money.toLocaleString();

  // Enable/Disable Buy Buttons
  boxes.forEach(box => {
    const btn = document.getElementById(`buy-${box.id}`);
    if (btn) {
      btn.disabled = money < box.price;
    }
  });

  renderInventory();
}

// Initialize Game
loadGame();
renderShop();
updateUI();