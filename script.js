let isLoginMode = true;
let currentUser = null;

// Default Game State Template
const defaultState = {
  coins: 0,
  inventory: {}
};

let gameState = { ...defaultState };

// Box Configurations & Drop Tables
const boxes = {
  basic: {
    cost: 10,
    table: [
      { rarity: 'common', chance: 0.9, pool: ['🍎 Apple', '🍞 Bread', '🥕 Carrot'] },
      { rarity: 'rare', chance: 0.1, pool: ['🧀 Cheese', '🍕 Pizza Slice'] }
    ]
  },
  super: {
    cost: 50,
    table: [
      { rarity: 'common', chance: 0.5, pool: ['🍞 Bread', '🥕 Carrot'] },
      { rarity: 'rare', chance: 0.35, pool: ['🍕 Pizza Slice', '🍔 Burger'] },
      { rarity: 'legendary', chance: 0.15, pool: ['🥩 Steak', 'Sushi Roll 🍣'] }
    ]
  },
  ultra: {
    cost: 200,
    table: [
      { rarity: 'common', chance: 0.1, pool: ['🥕 Carrot'] },
      { rarity: 'rare', chance: 0.4, pool: ['🍔 Burger'] },
      { rarity: 'legendary', chance: 0.5, pool: ['🥩 Steak', 'Sushi Roll 🍣', 'Golden Apple 🍏'] }
    ]
  }
};

// --- AUTHENTICATION SYSTEM ---

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Sign Up';
  document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Sign Up';
  document.querySelector('.toggle-text').innerText = isLoginMode 
    ? "Don't have an account? Sign Up" 
    : "Already have an account? Login";
  document.getElementById('auth-error').innerText = '';
}

function handleAuth() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('auth-error');

  if (!user || !pass) {
    errorEl.innerText = "Please fill in all fields.";
    return;
  }

  const users = JSON.parse(localStorage.getItem('registered_users') || '{}');

  if (isLoginMode) {
    if (users[user] && users[user] === pass) {
      loginUser(user);
    } else {
      errorEl.innerText = "Invalid username or password.";
    }
  } else {
    if (users[user]) {
      errorEl.innerText = "Username already exists.";
    } else {
      users[user] = pass;
      localStorage.setItem('registered_users', JSON.stringify(users));
      loginUser(user);
    }
  }
}

function loginUser(username) {
  currentUser = username;
  document.getElementById('user-display').innerText = username;
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  loadGame();
  startAutoSave();
}

function logout() {
  saveGame();
  currentUser = null;
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

// --- GAME LOGIC ---

function clickCoin() {
  gameState.coins += 1;
  updateUI();
}

function openBox(boxType) {
  const box = boxes[boxType];
  if (gameState.coins < box.cost) {
    alert("Not enough coins!");
    return;
  }

  gameState.coins -= box.cost;

  // Roll for rarity
  const rand = Math.random();
  let cumulative = 0;
  let selectedGroup = null;

  for (const group of box.table) {
    cumulative += group.chance;
    if (rand <= cumulative) {
      selectedGroup = group;
      break;
    }
  }

  // Select item from pool
  const item = selectedGroup.pool[Math.floor(Math.random() * selectedGroup.pool.length)];
  const rarity = selectedGroup.rarity;

  // Add to inventory
  if (!gameState.inventory[item]) {
    gameState.inventory[item] = { count: 0, rarity: rarity };
  }
  gameState.inventory[item].count += 1;

  updateUI();
}

function updateUI() {
  document.getElementById('coin-count').innerText = gameState.coins;
  
  const invContainer = document.getElementById('inventory-list');
  invContainer.innerHTML = '';

  const items = Object.keys(gameState.inventory);
  if (items.length === 0) {
    invContainer.innerHTML = '<p>No items yet. Open some boxes!</p>';
    return;
  }

  items.forEach(itemName => {
    const data = gameState.inventory[itemName];
    const div = document.createElement('div');
    div.className = data.rarity;
    div.innerText = `${itemName} x${data.count} [${data.rarity.toUpperCase()}]`;
    invContainer.appendChild(div);
  });
}

// --- SAVE / LOAD SYSTEM ---

function saveGame() {
  if (!currentUser) return;
  const saveData = JSON.stringify(gameState);
  localStorage.setItem(`save_${currentUser}`, saveData);
}

function loadGame() {
  const saved = localStorage.getItem(`save_${currentUser}`);
  if (saved) {
    gameState = JSON.parse(saved);
  } else {
    gameState = JSON.parse(JSON.stringify(defaultState));
  }
  updateUI();
}

function startAutoSave() {
  setInterval(() => {
    saveGame();
  }, 5000); // Auto-saves every 5 seconds
}