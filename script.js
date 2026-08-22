// Simple local-only auth + game with autosave.
// Data stored in localStorage under keys:
//  - "users" -> JSON object { username: password, ... }
//  - "game_<username>" -> JSON game state

// ---------- Config ----------
const AUTO_SAVE_INTERVAL_MS = 5000;

// ---------- State ----------
let currentUser = null;
let gameData = { money: 0, inventory: [] };
const boxes = [
  { name: "Basic Box", cost: 10, luck: 0.5 },
  { name: "Rare Box", cost: 50, luck: 0.7 },
  { name: "Epic Box", cost: 200, luck: 0.9 }
];

// ---------- Helpers ----------
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "{}");
  } catch {
    return {};
  }
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function showAuthMessage(text, isError = false) {
  const el = document.getElementById("authMessage");
  el.textContent = text || "";
  el.style.color = isError ? "#b00020" : "";
}
function updateUI() {
  document.getElementById("money").textContent = gameData.money;
  const inv = document.getElementById("inventory");
  inv.innerHTML = "";
  gameData.inventory.forEach((it, idx) => {
    const li = document.createElement("li");
    li.textContent = it;
    inv.appendChild(li);
  });
  document.getElementById("playerName").textContent = currentUser || "—";
}

// ---------- Auth ----------
function signup() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  if (!user || !pass) {
    showAuthMessage("Enter username and password.", true);
    return;
  }
  const users = getUsers();
  if (users[user]) {
    showAuthMessage("User already exists. Please login.", true);
    return;
  }
  users[user] = pass;
  saveUsers(users);
  // initialize game save
  localStorage.setItem("game_" + user, JSON.stringify({ money: 0, inventory: [] }));
  showAuthMessage("Account created. You are now logged in.");
  // auto-login after signup
  loginUser(user);
}

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  if (!user || !pass) {
    showAuthMessage("Enter username and password.", true);
    return;
  }
  const users = getUsers();
  if (!users[user]) {
    showAuthMessage("No account found. Please sign up.", true);
    return;
  }
  if (users[user] !== pass) {
    showAuthMessage("Incorrect password.", true);
    return;
  }
  showAuthMessage("");
  loginUser(user);
}

function loginUser(user) {
  currentUser = user;
  // hide auth, show game
  document.getElementById("auth").style.display = "none";
  document.getElementById("game").style.display = "block";
  loadGame();
}

// ---------- Logout ----------
function logout() {
  saveGame();
  currentUser = null;
  gameData = { money: 0, inventory: [] };
  document.getElementById("game").style.display = "none";
  document.getElementById("auth").style.display = "block";
  showAuthMessage("Logged out.");
  // clear input fields for convenience
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

// ---------- Game actions ----------
function buyBox(boxIndex) {
  const box = boxes[boxIndex];
  if (!box) return;
  if (gameData.money < box.cost) {
    alert("Not enough money!");
    return;
  }
  gameData.money -= box.cost;
  const gotFood = Math.random() < box.luck;
  if (gotFood) {
    const food = getRandomFood();
    gameData.inventory.push(food);
  } else {
    // small non-blocking feedback
    alert("Bad luck! No food this time.");
  }
  updateUI();
  saveGame();
}

function getRandomFood() {
  const foods = ["🍎 Apple", "🍔 Burger", "🍕 Pizza", "🍣 Sushi", "🍩 Donut", "🥗 Salad", "🌮 Taco"];
  return foods[Math.floor(Math.random() * foods.length)];
}

// ---------- Save / Load ----------
function saveGame() {
  if (!currentUser) return;
  try {
    localStorage.setItem("game_" + currentUser, JSON.stringify(gameData));
  } catch (e) {
    console.warn("Save failed", e);
  }
}

function loadGame() {
  if (!currentUser) return;
  const saved = localStorage.getItem("game_" + currentUser);
  if (saved) {
    try {
      gameData = JSON.parse(saved);
    } catch {
      gameData = { money: 0, inventory: [] };
    }
  } else {
    gameData = { money: 0, inventory: [] };
  }
  updateUI();
}

// ---------- Initialization ----------
document.addEventListener("DOMContentLoaded", () => {
  // wire auth buttons
  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // coin click
  document.getElementById("coin").addEventListener("click", () => {
    gameData.money = (gameData.money || 0) + 1;
    updateUI();
    saveGame();
  });

  // render boxes
  const boxContainer = document.getElementById("boxes");
  boxContainer.innerHTML = "";
  boxes.forEach((b, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${b.name} - $${b.cost}`;
    btn.addEventListener("click", () => buyBox(i));
    boxContainer.appendChild(btn);
  });

  // autosave interval
  setInterval(saveGame, AUTO_SAVE_INTERVAL_MS);

  // save on unload
  window.addEventListener("beforeunload", saveGame);

  // Optional: if only one user exists and they have a saved session, do not auto-login.
  // Keep auth visible by default.
});
