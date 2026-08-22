// --- Authentication ---
function signup() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (!user || !pass) {
    document.getElementById("authMessage").innerText = "Enter username & password!";
    return;
  }
  localStorage.setItem("user_" + user, pass);
  document.getElementById("authMessage").innerText = "Account created! Please login.";
}

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const savedPass = localStorage.getItem("user_" + user);

  if (savedPass === pass) {
    currentUser = user;
    loadGame();
    document.getElementById("auth").style.display = "none";
    document.getElementById("game").style.display = "block";
  } else {
    document.getElementById("authMessage").innerText = "Invalid login!";
  }
}

let currentUser = null;
let gameData = { money: 0, inventory: [] };

// --- Game Setup ---
const boxes = [
  { name: "Basic Box", cost: 10, luck: 0.5 },
  { name: "Rare Box", cost: 50, luck: 0.7 },
  { name: "Epic Box", cost: 200, luck: 0.9 }
];

document.addEventListener("DOMContentLoaded", () => {
  const boxContainer = document.getElementById("boxes");
  boxes.forEach((box, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${box.name} - $${box.cost}`;
    btn.onclick = () => buyBox(i);
    boxContainer.appendChild(btn);
  });

  document.getElementById("coin").onclick = () => {
    gameData.money++;
    updateUI();
    saveGame();
  };
});

// --- Buy Box ---
function buyBox(index) {
  const box = boxes[index];
  if (gameData.money >= box.cost) {
    gameData.money -= box.cost;
    const gotFood = Math.random() < box.luck;
    if (gotFood) {
      const food = getRandomFood();
      gameData.inventory.push(food);
    } else {
      alert("Bad luck! No food this time.");
    }
    updateUI();
    saveGame();
  } else {
    alert("Not enough money!");
  }
}

function getRandomFood() {
  const foods = ["🍎 Apple", "🍔 Burger", "🍕 Pizza", "🍣 Sushi", "🍩 Donut"];
  return foods[Math.floor(Math.random() * foods.length)];
}

// --- UI Update ---
function updateUI() {
  document.getElementById("money").innerText = gameData.money;
  const inv = document.getElementById("inventory");
  inv.innerHTML = "";
  gameData.inventory.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    inv.appendChild(li);
  });
}

// --- Save & Load ---
function saveGame() {
  if (currentUser) {
    localStorage.setItem("game_" + currentUser, JSON.stringify(gameData));
  }
}

function loadGame() {
  const saved = localStorage.getItem("game_" + currentUser);
  if (saved) {
    gameData = JSON.parse(saved);
  }
  updateUI();
}
