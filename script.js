// Game State
let coins = 0;
let boxes = 0;
const boxCost = 10;

const foods = [
    { id: 'apple', name: 'Apple', icon: '🍎', count: 0 },
    { id: 'banana', name: 'Banana', icon: '🍌', count: 0 },
    { id: 'pizza', name: 'Pizza', icon: '🍕', count: 0 },
    { id: 'burger', name: 'Burger', icon: '🍔', count: 0 },
    { id: 'taco', name: 'Taco', icon: '🌮', count: 0 },
    { id: 'donut', name: 'Donut', icon: '🍩', count: 0 },
    { id: 'sushi', name: 'Sushi', icon: '🍣', count: 0 },
    { id: 'ramen', name: 'Ramen', icon: '🍜', count: 0 },
    { id: 'icecream', name: 'Ice Cream', icon: '🍦', count: 0 },
    { id: 'cookie', name: 'Cookie', icon: '🍪', count: 0 }
];

// UI Elements
const coinCountEl = document.getElementById('coin-count');
const boxCountEl = document.getElementById('box-count');
const unlockedCountEl = document.getElementById('unlocked-count');
const coinBtn = document.getElementById('coin-btn');
const buyBoxBtn = document.getElementById('buy-box-btn');
const openBoxBtn = document.getElementById('open-box-btn');
const collectionGrid = document.getElementById('collection-grid');

// Click Coin
coinBtn.addEventListener('click', () => {
    coins++;
    updateUI();
});

// Buy Box
buyBoxBtn.addEventListener('click', () => {
    if (coins >= boxCost) {
        coins -= boxCost;
        boxes++;
        updateUI();
    }
});

// Open Box
openBoxBtn.addEventListener('click', () => {
    if (boxes > 0) {
        boxes--;
        
        // Pick random food
        const randomIndex = Math.floor(Math.random() * foods.length);
        foods[randomIndex].count++;

        updateUI();
    }
});

// Initialize Collection UI
function renderCollection() {
    collectionGrid.innerHTML = '';
    let totalUnlocked = 0;

    foods.forEach(food => {
        const isUnlocked = food.count > 0;
        if (isUnlocked) totalUnlocked++;

        const foodEl = document.createElement('div');
        foodEl.className = `food-item ${isUnlocked ? 'unlocked' : ''}`;
        foodEl.innerHTML = `
            <div class="food-icon">${isUnlocked ? food.icon : '❓'}</div>
            <div class="food-name">${isUnlocked ? food.name : '???'}</div>
            <div class="food-count">${isUnlocked ? 'x' + food.count : ''}</div>
        `;
        collectionGrid.appendChild(foodEl);
    });

    unlockedCountEl.textContent = totalUnlocked;
}

// Update Dynamic Displays
function updateUI() {
    coinCountEl.textContent = coins;
    boxCountEl.textContent = boxes;
    
    // Enable/disable buttons based on state
    buyBoxBtn.disabled = coins < boxCost;
    openBoxBtn.disabled = boxes <= 0;

    renderCollection();
}

// Initial setup
updateUI();