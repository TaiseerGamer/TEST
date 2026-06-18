let money = 100;
let ordersServed = 0;
let currentBurger = [];
let customers = [];

function updateUI() {
  document.getElementById("money").textContent = money;
  document.getElementById("orders").textContent = ordersServed;
}

function addIngredient(type) {
  currentBurger.push(type);
  let burgerDiv = document.getElementById("burger");
  let item = document.createElement("div");
  item.textContent = type;
  burgerDiv.appendChild(item);
}

function assembleBurger() {
  if (currentBurger.length === 0) {
    alert("No ingredients added!");
    return;
  }
  alert("Burger assembled!");
}

function newCustomer() {
  let orderOptions = [["bun","patty"],["bun","patty","cheese"],["bun","patty","lettuce"],["bun","patty","cheese","lettuce"]];
  let order = orderOptions[Math.floor(Math.random()*orderOptions.length)];
  
  let customer = {
    id: Date.now(),
    order: order,
    patience: 100
  };
  customers.push(customer);
  renderCustomers();
  tickPatience(customer);
}

function renderCustomers() {
  let container = document.getElementById("customers");
  container.innerHTML = "";
  customers.forEach(c => {
    let div = document.createElement("div");
    div.className = "customer";
    div.innerHTML = `
      <p>Order: ${c.order.join(", ")}</p>
      <div class="progress"><div class="progress-bar" id="bar-${c.id}"></div></div>
      <button onclick="serveCustomer(${c.id})">Serve</button>
    `;
    container.appendChild(div);
  });
}

function tickPatience(customer) {
  let interval = setInterval(() => {
    customer.patience -= 5;
    let bar = document.getElementById("bar-"+customer.id);
    if (bar) bar.style.width = customer.patience + "%";
    
    if (customer.patience <= 0) {
      customers = customers.filter(c => c.id !== customer.id);
      renderCustomers();
      clearInterval(interval);
      alert("Customer left unhappy!");
    }
  }, 1000);
}

function serveCustomer(id) {
  let customer = customers.find(c => c.id === id);
  if (!customer) return;
  
  let correct = JSON.stringify(currentBurger) === JSON.stringify(customer.order);
  
  if (correct) {
    money += 20;
    ordersServed++;
    alert("Customer happy! +$20");
  } else {
    money -= 10;
    alert("Wrong order! -$10");
  }
  
  currentBurger = [];
  document.getElementById("burger").innerHTML = "";
  customers = customers.filter(c => c.id !== id);
  renderCustomers();
  updateUI();
}

updateUI();
