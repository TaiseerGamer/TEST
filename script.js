let money = 100;
let shelves = [];
let customers = [];

function updateMoney() {
  document.getElementById("money").textContent = money;
}

function buyShelf() {
  if (money >= 50) {
    money -= 50;
    let shelf = document.createElement("div");
    shelf.className = "shelf";
    document.getElementById("store").appendChild(shelf);
    shelves.push({ stocked: false });
    updateMoney();
  } else {
    alert("Not enough money!");
  }
}

function stockShelf() {
  if (money >= 20 && shelves.length > 0) {
    money -= 20;
    shelves.forEach(s => s.stocked = true);
    updateMoney();
  } else {
    alert("No shelves or not enough money!");
  }
}

function spawnCustomer() {
  let store = document.getElementById("store");
  let customer = document.createElement("div");
  customer.className = "customer";
  customer.style.left = Math.random() * 350 + "px";
  customer.style.top = Math.random() * 350 + "px";
  store.appendChild(customer);

  if (shelves.some(s => s.stocked)) {
    money += 30; // customer buys something
    updateMoney();
  }
}
