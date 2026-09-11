let money = 0;
let inventory = [];

document.getElementById("coin").addEventListener("click", () => {
  money += 1;
  updateMoney();
});

function updateMoney() {
  document.getElementById("money").textContent = money;
}

function buyBox(type) {
  let cost = type === "cheap" ? 10 : 50;
  if (money < cost) {
    alert("Not enough money!");
    return;
  }
  money -= cost;
  updateMoney();

  let food = getFood(type);
  inventory.push(food);
  displayInventory();
}

function getFood(type) {
  const cheapFoods = ["🍎 Apple", "🥖 Bread", "🥔 Potato"];
  const rareFoods = ["🍣 Sushi", "🍫 Chocolate", "🥩 Steak"];

  if (type === "cheap") {
    return Math.random() < 0.8 ? randomItem(cheapFoods) : randomItem(rareFoods);
  } else {
    return Math.random() < 0.7 ? randomItem(rareFoods) : randomItem(cheapFoods);
  }
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function displayInventory() {
  const list = document.getElementById("inventory");
  list.innerHTML = "";
  inventory.forEach(item => {
    let li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}
