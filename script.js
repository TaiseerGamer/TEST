let currentUser = null;
let gameData = { money: 0, inventory: [] };

document.addEventListener("DOMContentLoaded", () => {
  // Auth buttons
  document.getElementById("signupBtn").onclick = signup;
  document.getElementById("loginBtn").onclick = login;
  document.getElementById("logoutBtn").onclick = logout;

  // Coin click
  document.getElementById("coin").onclick = () => {
    gameData.money++;
    updateUI();
    saveGame();
  };

  // Loot boxes
  const boxes = [
    { name: "Basic Box", cost: 10, luck: 0.5 },
    { name: "Rare Box", cost: 50, luck: 0.7 },
    { name: "Epic Box", cost: 200, luck: 0.9 }
  ];
  const boxContainer = document.getElementById("boxes");
  boxes.forEach((box, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${box.name} - $${box.cost}`;
    btn.onclick = () => buyBox(box);
    boxContainer.appendChild(btn);
  });
});

// --- Authentication ---
function signup() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!user || !pass) {
    document.getElementById("authMessage").innerText = "Enter username & password!";
    return;
  }
  if (localStorage.getItem("user_" + user)) {
    document.getElementById("authMessage").innerText = "User already exists. Please login.";
    return;
  }
  localStorage.setItem("user_" + user, pass);
  localStorage.setItem("game_" + user, JSON.stringify({ money: 0, inventory: [] }));
  document.getElementById("authMessage").innerText = "Account created! Now login.";
}

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const savedPass = localStorage.getItem("user_" + user);

  if (!savedPass) {
    document.getElementById("authMessage").innerText = "No account found. Sign up first.";
    return;
  }
  if (savedPass !== pass) {
    document.getElementById("authMessage").innerText = "Wrong password!";
    return;
  }

  currentUser = user;
  document.getElementById("auth").style.display = "none";
  document.getElementById("game").style.display = "block";
  loadGame();
}

function logout() {
  currentUser = null;
  document.getElementById("game").style.display = "none";
  document.getElementById("auth").style.display = "block";
  document.getElementById("authMessage").innerText = "Logged out.";
}

// --- Game Logic ---
function buyBox(box) {
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
