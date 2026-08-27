// Game State
let coins = 0;
const boxCost = 15;
const unlockedIds = new Set();

// Food Database with weighted probabilities
const FOOD_LIST = [
  { id: 'apple', name: 'Apple', icon: '🍎', rarity: 'common', weight: 40 },
  { id: 'banana', name: 'Banana', icon: '🍌', rarity: 'common', weight: 40 },
  { id: 'cookie', name: 'Cookie', icon: '🍪', rarity: 'common', weight: 40 },
  { id: 'carrot', name: 'Carrot', icon: '🥕', rarity: 'common', weight: 40 },
  
  { id: 'pizza', name: 'Pizza', icon: '🍕', rarity: 'rare', weight: 20 },
  { id: 'burger', name: 'Burger', icon: '🍔', rarity: 'rare', weight: 20 },
  { id: 'taco', name: 'Taco', icon: '🌮', rarity: 'rare', weight: 20 },
  
  { id: 'sushi', name: 'Sushi', icon: '🍣', rarity: 'epic', weight: 10 },
  { id: 'ramen', name: 'Ramen', icon: '🍜', rarity: 'epic', weight: 10 },
  
  { id: 'cake', name: 'Birthday Cake', icon: '🎂', rarity: 'legendary', weight: 3 },
  { id: 'lobster', name: 'Lobster', icon: '🦞', rarity: 'legendary', weight: 2 }
];

// DOM Elements
const coinCountEl = document.getElementById('coin-count');
const coinBtn = document.getElementById('coin-btn');
const buyBoxBtn = document.getElementById('buy-box-btn');
const displayBox = document.getElementById('display-box');
const collectionGrid = document.getElementById('collection-grid');
const collectionTracker = document.getElementById('collection-tracker');

// Initialize Collection Grid
function renderGrid() {
  collectionGrid.innerHTML = '';
  FOOD_LIST.forEach(food => {
    const isUnlocked = unlockedIds.has(food.id);
    const card = document.createElement('div');
    card.className = `food-card rarity-${food.rarity} ${isUnlocked ? 'unlocked' : ''}`;
    card.id = `food-${food.id}`;
    
    card.innerHTML = `
      <div class="food-icon">${isUnlocked ? food.icon : '❓'}</div>
      <div class="food-name">${isUnlocked ? food.name : '???'}</div>
      <div class="food-rarity">${food.rarity}</div>
    `;
    collectionGrid.appendChild(card);
  });
  updateTracker();
}

// Update UI Stats
function updateUI() {
  coinCountEl.textContent = coins;
  buyBoxBtn.disabled = coins < boxCost;
}

function updateTracker() {
  collectionTracker.textContent = `${unlockedIds.size} / ${FOOD_LIST.length}`;
}

// Earn Coins
coinBtn.addEventListener('click', () => {
  coins++;
  updateUI();
});

// Loot Box Logic (Weighted Drop)
function getRandomFood() {
  const totalWeight = FOOD_LIST.reduce((sum, item) => sum + item.weight, 0);
  let randomNum = Math.random() * totalWeight;

  for (const food of FOOD_LIST) {
    if (randomNum < food.weight) {
      return food;
    }
    randomNum -= food.weight;
  }
  return FOOD_LIST[0];
}

// Open Box
buyBoxBtn.addEventListener('click', () => {
  if (coins < boxCost) return;

  coins -= boxCost;
  updateUI();

  const pulledFood = getRandomFood();
  unlockedIds.add(pulledFood.id);

  // Animation & Reveal
  displayBox.classList.remove('animate-open');
  void displayBox.offsetWidth; // Trigger reflow
  displayBox.textContent = pulledFood.icon;
  displayBox.classList.add('animate-open');

  renderGrid();
});

// Initial Setup
renderGrid();
updateUI();