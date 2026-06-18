let money = 100;
let ordersServed = 0;
let pattiesOnGrill = [];
let cookedPatty = false;

function updateUI() {
  document.getElementById("money").textContent = money;
  document.getElementById("orders").textContent = ordersServed;
}

function cookPatty() {
  let grill = document.getElementById("grill");
  let patty = document.createElement("div");
  patty.className = "patty";
  patty.style.left = Math.random() * 300 + "px";
  patty.style.top = Math.random() * 80 + "px";
  grill.appendChild(patty);

  pattiesOnGrill.push(patty);

  setTimeout(() => {
    patty.style.background = "#a0522d"; // cooked color
    cookedPatty = true;
    alert("Patty cooked!");
  }, 2000); // 2 seconds to cook
}

function assembleBurger() {
  if (cookedPatty) {
    let ingredients = document.getElementById("ingredients");
    let burger = document.createElement("div");
    burger.textContent = "🍔 Burger Ready!";
    burger.style.margin = "5px";
    ingredients.appendChild(burger);
    cookedPatty = false;
  } else {
    alert("No cooked patty available!");
  }
}

function serveCustomer() {
  let ingredients = document.getElementById("ingredients");
  if (ingredients.children.length > 0) {
    ingredients.removeChild(ingredients.children[0]);
    money += 20;
    ordersServed++;
    updateUI();
    alert("Customer served!");
  } else {
    alert("No burger to serve!");
  }
}

updateUI();
