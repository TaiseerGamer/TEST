
"use strict";

/*
  VENDTECH VT-100
  Fully simulated browser vending machine.
  All prices are stored as integer fils (1 JD = 1000 fils).
  No real payment processing or hardware control.
*/

const STORAGE_KEY = "vendtech_vt100_save_v1";
const MAX_STOCK = 10;
const MAX_CREDIT = 100000; // JD 100.000
const MAX_CASHBOX = 10000000;

const $ = (id) => document.getElementById(id);

const money = (fils) => {
  const value = Number(fils || 0) / 1000;
  return "JD " + value.toFixed(3);
};

const denominations = [
  { fils: 50, label: "50 fils" },
  { fils: 100, label: "100 fils" },
  { fils: 250, label: "250 fils" },
  { fils: 500, label: "500 fils" },
  { fils: 1000, label: "1 JD" },
  { fils: 5000, label: "5 JD" },
  { fils: 10000, label: "10 JD" },
  { fils: 20000, label: "20 JD" }
];

const catalog = [
  { name: "Cola", icon: "🥤", price: 750, category: "Drinks" },
  { name: "Orange Soda", icon: "🧃", price: 800, category: "Drinks" },
  { name: "Water", icon: "💧", price: 350, category: "Drinks" },
  { name: "Energy Drink", icon: "⚡", price: 1250, category: "Drinks" },
  { name: "Iced Tea", icon: "🧋", price: 900, category: "Drinks" },
  { name: "Lemon Soda", icon: "🍋", price: 800, category: "Drinks" },
  { name: "Apple Juice", icon: "🧃", price: 850, category: "Drinks" },
  { name: "Coffee", icon: "☕", price: 1000, category: "Drinks" },
  { name: "Milk Drink", icon: "🥛", price: 700, category: "Drinks" },
  { name: "Sports Drink", icon: "🍶", price: 1100, category: "Drinks" },
  { name: "Potato Chips", icon: "🍟", price: 650, category: "Snacks" },
  { name: "Tortilla Chips", icon: "🌮", price: 700, category: "Snacks" },
  { name: "Popcorn", icon: "🍿", price: 600, category: "Snacks" },
  { name: "Pretzels", icon: "🥨", price: 550, category: "Snacks" },
  { name: "Crackers", icon: "🍘", price: 500, category: "Snacks" },
  { name: "Peanuts", icon: "🥜", price: 600, category: "Snacks" },
  { name: "Trail Mix", icon: "🥣", price: 950, category: "Snacks" },
  { name: "Cheese Puffs", icon: "🧀", price: 700, category: "Snacks" },
  { name: "Rice Cakes", icon: "🍘", price: 500, category: "Snacks" },
  { name: "Granola", icon: "🥣", price: 850, category: "Snacks" },
  { name: "Chocolate Bar", icon: "🍫", price: 900, category: "Sweets" },
  { name: "Gummy Candy", icon: "🍬", price: 650, category: "Sweets" },
  { name: "Lollipop", icon: "🍭", price: 350, category: "Sweets" },
  { name: "Cookies", icon: "🍪", price: 800, category: "Sweets" },
  { name: "Donut", icon: "🍩", price: 1100, category: "Sweets" },
  { name: "Wafer", icon: "🍫", price: 500, category: "Sweets" },
  { name: "Brownie", icon: "🟫", price: 1000, category: "Sweets" },
  { name: "Marshmallows", icon: "🍡", price: 550, category: "Sweets" },
  { name: "Caramel Bar", icon: "🍮", price: 850, category: "Sweets" },
  { name: "Jelly Beans", icon: "🫘", price: 600, category: "Sweets" },
  { name: "Gum", icon: "🫧", price: 300, category: "Sweets" },
  { name: "Mints", icon: "🌿", price: 300, category: "Sweets" },
  { name: "Fruit Gummies", icon: "🍓", price: 700, category: "Sweets" },
  { name: "Cupcake", icon: "🧁", price: 1200, category: "Sweets" },
  { name: "Candy Roll", icon: "🍬", price: 450, category: "Sweets" },
  { name: "Oat Bar", icon: "🌾", price: 750, category: "Snacks" },
  { name: "Protein Bar", icon: "💪", price: 1500, category: "Snacks" },
  { name: "Fruit Bar", icon: "🍎", price: 800, category: "Snacks" },
  { name: "Pretzel Bites", icon: "🥨", price: 650, category: "Snacks" },
  { name: "Mini Muffin", icon: "🧁", price: 850, category: "Snacks" }
];

const rows = "ABCDEFGHIJ".split("");

function buildProducts() {
  const products = [];

  for (let row = 0; row < 10; row++) {
    for (let column = 1; column <= 10; column++) {
      const index = row * 10 + column - 1;
      const item = catalog[index % catalog.length];

      // Each slot is unique, with its own stock and code.
      products.push({
        code: rows[row] + String(column).padStart(2, "0"),
        name: item.name,
        icon: item.icon,
        category: item.category,
        price: item.price,
        stock: MAX_STOCK
      });
    }
  }

  return products;
}

function freshState() {
  return {
    version: 1,
    products: buildProducts(),
    selectedCode: null,
    credit: 0,
    cashBox: 50000, // JD 50.000 virtual starting float
    revenue: 0,
    sold: 0,
    transactions: 0,
    jammed: false,
    delivery: null,
    log: [],
    nextTransactionId: 1
  };
}

function normalizeState(saved) {
  const clean = freshState();

  if (!saved || saved.version !== 1) return clean;

  const validCodes = new Set(clean.products.map((p) => p.code));

  if (Array.isArray(saved.products)) {
    const savedMap = new Map(saved.products.map((p) => [p.code, p]));

    clean.products = clean.products.map((product) => {
      const old = savedMap.get(product.code);
      if (!old) return product;

      return {
        ...product,
        stock: Number.isInteger(old.stock)
          ? Math.max(0, Math.min(MAX_STOCK, old.stock))
          : MAX_STOCK
      };
    });
  }

  clean.selectedCode = validCodes.has(saved.selectedCode)
    ? saved.selectedCode
    : null;

  clean.credit = Number.isInteger(saved.credit)
    ? Math.max(0, Math.min(MAX_CREDIT, saved.credit))
    : 0;

  clean.cashBox = Number.isInteger(saved.cashBox)
    ? Math.max(0, Math.min(MAX_CASHBOX, saved.cashBox))
    : 50000;

  clean.revenue = Number.isInteger(saved.revenue)
    ? Math.max(0, saved.revenue)
    : 0;

  clean.sold = Number.isInteger(saved.sold)
    ? Math.max(0, saved.sold)
    : 0;

  clean.transactions = Number.isInteger(saved.transactions)
    ? Math.max(0, saved.transactions)
    : 0;

  clean.jammed = Boolean(saved.jammed);

  clean.delivery =
    saved.delivery &&
    typeof saved.delivery.code === "string" &&
    validCodes.has(saved.delivery.code) &&
    typeof saved.delivery.name === "string" &&
    typeof saved.delivery.icon === "string"
      ? {
          code: saved.delivery.code,
          name: saved.delivery.name,
          icon: saved.delivery.icon
        }
      : null;

  clean.log = Array.isArray(saved.log)
    ? saved.log.slice(0, 30).filter((entry) =>
        entry &&
        typeof entry.message === "string" &&
        typeof entry.time === "string" &&
        typeof entry.kind === "string"
      )
    : [];

  clean.nextTransactionId =
    Number.isInteger(saved.nextTransactionId) &&
    saved.nextTransactionId > 0
      ? saved.nextTransactionId
      : 1;

  return clean;
}

function loadState() {
  try {
    return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch (error) {
    console.warn("Save data could not be loaded:", error);
    return freshState();
  }
}

let state = loadState();
let toastTimer = null;
let dispensing = false;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("save-status").textContent = "Progress saved automatically";
  } catch (error) {
    $("save-status").textContent = "Save failed — storage unavailable";
    console.warn("Save failed:", error);
  }
}

function selectedProduct() {
  return state.products.find((p) => p.code === state.selectedCode) || null;
}

function totalStock() {
  return state.products.reduce((sum, p) => sum + p.stock, 0);
}

function cashFloat() {
  return state.cashBox;
}

function getChangeDue() {
  const p = selectedProduct();
  return p && state.credit >= p.price ? state.credit - p.price : 0;
}

function machineStatus() {
  if (state.jammed) return "JAMMED";
  if (dispensing) return "DISPENSING";
  if (state.delivery) return "ITEM READY";
  if (state.credit > 0) return "PAYMENT PENDING";
  if (totalStock() === 0) return "SOLD OUT";
  return "READY";
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setMessage(message) {
  $("screen-message").textContent = message;
}

function addLog(message, kind = "success") {
  const now = new Date();
  state.log.unshift({
    id: state.nextTransactionId++,
    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    message,
    kind
  });

  state.log = state.log.slice(0, 30);
  renderLog();
  saveState();
}

function renderProducts() {
  const grid = $("product-grid");
  grid.innerHTML = "";

  for (const product of state.products) {
    const button = document.createElement("button");
    button.type = "button";

    button.className = "product";
    if (product.code === state.selectedCode) button.classList.add("selected");
    if (product.stock === 0) button.classList.add("sold-out");

    button.disabled = dispensing || Boolean(state.delivery) || state.jammed;

    button.setAttribute(
      "aria-label",
      `${product.code}, ${product.name}, ${money(product.price)}, ${product.stock} in stock`
    );

    const icon = document.createElement("span");
    icon.className = "product-icon";
    icon.textContent = product.icon;

    const name = document.createElement("span");
    name.className = "product-name";
    name.textContent = product.name;

    const code = document.createElement("span");
    code.className = "product-code";
    code.textContent = product.code;

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = money(product.price);

    const stock = document.createElement("span");
    stock.className = "product-stock";
    stock.textContent = `Stock: ${product.stock}`;

    button.append(icon, name, code, price, stock);

    if (product.stock === 0) {
      const soldOut = document.createElement("span");
      soldOut.className = "sold-label";
      soldOut.textContent = "SOLD OUT";
      button.append(soldOut);
    }

    button.addEventListener("click", () => selectProduct(product.code));
    grid.append(button);
  }

  $("stock-count").textContent = `${totalStock()} ITEMS`;
}

function renderLog() {
  const container = $("transaction-log");
  container.innerHTML = "";

  if (state.log.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-log";
    empty.textContent = "Waiting for first transaction...";
    container.append(empty);
    return;
  }

  for (const entry of state.log) {
    const item = document.createElement("div");
    item.className = "log-item";

    const top = document.createElement("div");
    top.className = "log-item-top";

    const label = document.createElement("strong");
    label.textContent = entry.message;

    const time = document.createElement("time");
    time.textContent = entry.time;

    top.append(label, time);

    const status = document.createElement("p");
    status.className = entry.kind === "error" ? "log-error" : "log-success";
    status.textContent = entry.kind === "error" ? "ATTENTION REQUIRED" : "RECORDED";

    item.append(top, status);
    container.append(item);
  }
}

function renderDelivery() {
  const animation = $("delivery-animation");
  const icon = animation.querySelector(".delivery-icon");
  const text = $("delivery-text");

  animation.classList.remove("dispensing", "has-item");

  if (state.delivery) {
    icon.textContent = state.delivery.icon;
    text.textContent = `${state.delivery.name} (${state.delivery.code}) — retrieve your item`;
    animation.classList.add("has-item");
  } else {
    icon.textContent = "📦";
    text.textContent = "Your products appear here";
  }

  $("retrieve-btn").disabled = !state.delivery || dispensing;
}

function render() {
  const product = selectedProduct();

  $("selected-code").textContent = product ? product.code : "---";
  $("selected-price").textContent = product ? money(product.price) : money(0);
  $("credit-display").textContent = money(state.credit);
  $("change-display").textContent = money(getChangeDue());

  $("stat-stock").textContent = `${totalStock()} / 100`;
  $("stat-sold").textContent = String(state.sold);
  $("stat-revenue").textContent = money(state.revenue);
  $("stat-cash").textContent = money(cashFloat());
  $("stat-transactions").textContent = String(state.transactions);
  $("machine-status").textContent = machineStatus();

  $("jam-btn").disabled = state.jammed || dispensing;
  $("clear-jam-btn").disabled = !state.jammed || dispensing;

  const blocked = state.jammed || dispensing || Boolean(state.delivery);

  for (const button of document.querySelectorAll(".cash-button")) {
    const denomination = Number(button.dataset.cash) * 1000;
    button.disabled = blocked ||
      state.credit + denomination > MAX_CREDIT ||
      state.cashBox + denomination > MAX_CASHBOX;
  }

  $("card-btn").disabled = blocked;
  $("tap-btn").disabled = blocked;
  $("buy-btn").disabled = blocked;
  $("cancel-btn").disabled = dispensing || Boolean(state.delivery);
  $("select-code-btn").disabled = blocked;

  renderProducts();
  renderDelivery();
  renderLog();
}

function selectProduct(code) {
  if (dispensing || state.delivery) {
    showToast("Retrieve the previous item first.");
    return;
  }

  if (state.jammed) {
    showToast("Machine jammed. Clear the jam first.");
    return;
  }

  const product = state.products.find(
    (p) => p.code === String(code).trim().toUpperCase()
  );

  if (!product) {
    setMessage("Invalid product code. Try again.");
    showToast("That product code does not exist.");
    return;
  }

  if (product.stock <= 0) {
    setMessage(`${product.code} is SOLD OUT.`);
    showToast("This product is sold out.");
    return;
  }

  if (state.credit > 0 && state.selectedCode !== product.code) {
    setMessage("Cancel and refund your cash before changing products.");
    showToast("Refund your credit before changing products.");
    return;
  }

  state.selectedCode = product.code;
  $("code-input").value = product.code;

  setMessage(`${product.name} selected. Price: ${money(product.price)}`);
  render();
  saveState();
}

function handleCodeEntry() {
  selectProduct($("code-input").value);
}

function insertCash(amount) {
  if (!Number.isInteger(amount) || amount <= 0) return;

  if (state.jammed || dispensing || state.delivery) {
    showToast("Cash is not accepted right now.");
    return;
  }

  if (!selectedProduct()) {
    showToast("Select a product before inserting cash.");
    setMessage("Select an item first.");
    return;
  }

  if (state.credit + amount > MAX_CREDIT) {
    showToast("Maximum credit reached.");
    return;
  }

  if (state.cashBox + amount > MAX_CASHBOX) {
    showToast("Cash box capacity reached.");
    return;
  }

  state.credit += amount;
  state.cashBox += amount;

  setMessage(`Accepted ${money(amount)}. Credit: ${money(state.credit)}`);
  addLog(`Cash inserted: ${money(amount)}`);
  render();
  saveState();
}

function calculateChange(amount, availableCash) {
  // Return a feasible change combination using largest denominations first.
  const coins = [10000, 5000, 1000, 500, 250, 100, 50];
  let remaining = amount;
  let available = availableCash;
  const returned = [];

  for (const coin of coins) {
    const count = Math.min(
      Math.floor(remaining / coin),
      Math.floor(available / coin)
    );

    if (count > 0) {
      returned.push({ fils: coin, count });
      remaining -= coin * count;
      available -= coin * count;
    }
  }

  if (remaining !== 0) return null;
  return returned;
}

function changeText(change) {
  if (!change || change.length === 0) return "No change due";

  return change.map((item) =>
    `${item.count} × ${money(item.fils)}`
  ).join(", ");
}

function validatePurchase(paymentMethod) {
  const product = selectedProduct();

  if (!product) {
    showToast("Select a product first.");
    setMessage("Please select a product.");
    return null;
  }

  if (product.stock <= 0) {
    showToast("This product is sold out.");
    return null;
  }

  if (state.jammed) {
    showToast("Machine is jammed. Clear the jam first.");
    setMessage("JAM ERROR — please contact service.");
    return null;
  }

  if (dispensing || state.delivery) {
    showToast("Retrieve the previous item first.");
    return null;
  }

  if (paymentMethod === "cash") {
    if (state.credit < product.price) {
      const missing = product.price - state.credit;
      setMessage(`Insufficient credit. Insert ${money(missing)} more.`);
      showToast(`You need ${money(missing)} more.`);
      return null;
    }

    const changeDue = state.credit - product.price;

    // The change must be available in the cash box after the sale.
    const availableForChange = state.cashBox - state.credit + product.price;

    if (changeDue > 0 && !calculateChange(changeDue, availableForChange)) {
      setMessage("Unable to make exact change. Cancel for a refund.");
      showToast("Machine cannot make this change. Try exact cash.");
      return null;
    }

    return { product, changeDue, paymentMethod };
  }

  // Digital payments do not use the cash balance.
  return { product, changeDue: 0, paymentMethod };
}

function purchase(paymentMethod = "cash") {
  const validated = validatePurchase(paymentMethod);
  if (!validated) return;

  const { product, changeDue } = validated;

  dispensing = true;
  setMessage("Processing payment...");
  render();

  const finishPayment = () => {
    // Re-check conditions in case something changed while processing.
    if (state.jammed) {
      failDispense(paymentMethod, "Machine jam detected.");
      return;
    }

    if (product.stock <= 0 || state.selectedCode !== product.code) {
      failDispense(paymentMethod, "Product unavailable.");
      return;
    }

    if (paymentMethod === "cash") {
      if (state.credit < product.price) {
        dispensing = false;
        setMessage("Payment incomplete.");
        render();
        return;
      }

      if (changeDue > 0) {
        const availableForChange = state.cashBox - state.credit + product.price;
        const combination = calculateChange(changeDue, availableForChange);

        if (!combination) {
          dispensing = false;
          setMessage("Cannot return change. Cancel for a refund.");
          render();
          return;
        }
      }
    }

    // Deduct stock and commit the sale only after all checks pass.
    product.stock -= 1;
    state.sold += 1;
    state.transactions += 1;
    state.revenue += product.price;

    if (paymentMethod === "cash") {
      state.cashBox -= changeDue;
      state.credit = 0;
    }

    state.delivery = {
      code: product.code,
      name: product.name,
      icon: product.icon
    };

    setMessage(
      changeDue > 0
        ? `Dispensing... Change: ${money(changeDue)}`
        : "Payment approved. Dispensing..."
    );

    const animation = $("delivery-animation");
    animation.classList.remove("has-item");
    animation.classList.add("dispensing");

    addLog(
      `Sold ${product.code} ${product.name} — ${money(product.price)} (${paymentMethod})`
    );

    if (changeDue > 0) {
      addLog(`Change returned: ${money(changeDue)}`);
    }

    saveState();
    render();

    // Small delay creates the product-delivery animation.
    setTimeout(() => {
      dispensing = false;
      animation.classList.remove("dispensing");

      setMessage("Product dispensed. Please retrieve your item.");
      render();
      saveState();

      openResult(
        "Purchase successful!",
        `${product.icon} ${product.name} (${product.code}) was dispensed.` +
        (changeDue > 0 ? ` Change returned: ${money(changeDue)}.` : "") +
        " Retrieve your product from the collection tray.",
        "✓"
      );
    }, 850);
  };

  if (paymentMethod === "cash") {
    finishPayment();
  } else {
    // Simulated terminal response; no real payment is submitted.
    setMessage(
      paymentMethod === "contactless"
        ? "Reading simulated contactless payment..."
        : "Authorizing simulated card..."
    );

    setTimeout(() => {
      if (state.jammed) {
        failDispense(paymentMethod, "Machine jam detected.");
        return;
      }

      // Demonstration-only payment approval.
      finishPayment();
    }, 650);
  }
}

function failDispense(paymentMethod, reason) {
  dispensing = false;

  if (paymentMethod === "cash" && state.credit > 0) {
    const refund = state.credit;
    state.cashBox = Math.max(0, state.cashBox - refund);
    state.credit = 0;

    addLog(`Cash refunded: ${money(refund)} — ${reason}`, "error");
  } else {
    addLog(`Payment cancelled — ${reason}`, "error");
  }

  setMessage(`${reason} No sale completed. Please try again.`);
  render();
  saveState();
  showToast(reason + " Payment was not charged.");
}

function cancelAndRefund() {
  if (dispensing) {
    showToast("Please wait for the current operation.");
    return;
  }

  if (state.delivery) {
    showToast("Retrieve the dispensed item first.");
    return;
  }

  if (state.credit > 0) {
    const refund = state.credit;

    if (state.cashBox < refund) {
      setMessage("Refund error. Please use the service panel.");
      showToast("Cash box balance error. Refund could not be completed.");
      addLog("Refund failed: insufficient cash-box balance", "error");
      return;
    }

    state.cashBox -= refund;
    state.credit = 0;

    setMessage(`Refund complete: ${money(refund)} returned.`);
    addLog(`Refund issued: ${money(refund)}`);
    showToast(`${money(refund)} refunded.`);
  } else {
    setMessage("Transaction cancelled. No cash was inserted.");
    showToast("Transaction cancelled.");
  }

  state.selectedCode = null;
  $("code-input").value = "";
  render();
  saveState();
}

function retrieveItem() {
  if (!state.delivery || dispensing) return;

  const item = state.delivery;
  state.delivery = null;
  state.selectedCode = null;
  $("code-input").value = "";

  setMessage(`Thank you! ${item.name} collected.`);
  addLog(`Item retrieved: ${item.code} ${item.name}`);

  render();
  saveState();
  showToast(`You collected ${item.name}.`);
}

function openResult(title, message, icon = "✓") {
  $("dialog-title").textContent = title;
  $("dialog-message").textContent = message;
  $("dialog-icon").textContent = icon;

  const dialog = $("result-dialog");
  if (!dialog.open) dialog.showModal();
}

function simulateJam() {
  if (dispensing || state.delivery) {
    showToast("Finish the current operation before service testing.");
    return;
  }

  state.jammed = true;
  setMessage("JAM ERROR — service required.");
  addLog("Service test: machine jam simulated", "error");
  render();
  saveState();
  showToast("Machine jammed. Purchases are disabled.");
}

function clearJam() {
  if (dispensing) return;

  state.jammed = false;
  setMessage("Jam cleared. Machine ready.");
  addLog("Service: jam cleared");
  render();
  saveState();
  showToast("Jam cleared. Machine is ready.");
}

function restockAll() {
  if (dispensing || state.delivery || state.credit > 0) {
    showToast("Finish the current transaction before restocking.");
    return;
  }

  for (const product of state.products) {
    product.stock = MAX_STOCK;
  }

  state.jammed = false;
  setMessage("Restocking complete. All products replenished.");
  addLog("Service: all 100 product slots restocked");
  render();
  saveState();
  showToast("All 100 product slots restocked.");
}

function factoryReset() {
  if (dispensing) {
    showToast("Wait for the current operation to finish.");
    return;
  }

  const confirmed = window.confirm(
    "Factory reset the machine? This erases stock, sales, logs, credit, and saved progress."
  );

  if (!confirmed) return;

  state = freshState();
  dispensing = false;
  $("code-input").value = "";

  setMessage("Factory reset complete. Welcome!");
  render();
  saveState();
  showToast("Machine reset to factory settings.");
}

function handleKeypad(key) {
  const input = $("code-input");

  if (key === "clear") {
    input.value = "";
    input.focus();
    return;
  }

  if (key === "enter") {
    handleCodeEntry();
    return;
  }

  if (input.value.length < 3) {
    input.value += key;
  }

  input.focus();
}

function initialize() {
  $("select-code-btn").addEventListener("click", handleCodeEntry);

  $("code-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleCodeEntry();
  });

  $("keypad").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key]");
    if (button) handleKeypad(button.dataset.key);
  });

  document.querySelectorAll(".cash-button").forEach((button) => {
    button.addEventListener("click", () => {
      insertCash(Math.round(Number(button.dataset.cash) * 1000));
    });
  });

  $("buy-btn").addEventListener("click", () => purchase("cash"));
  $("card-btn").addEventListener("click", () => purchase("card"));
  $("tap-btn").addEventListener("click", () => purchase("contactless"));
  $("cancel-btn").addEventListener("click", cancelAndRefund);
  $("retrieve-btn").addEventListener("click", retrieveItem);

  $("jam-btn").addEventListener("click", simulateJam);
  $("clear-jam-btn").addEventListener("click", clearJam);
  $("restock-btn").addEventListener("click", restockAll);
  $("reset-btn").addEventListener("click", factoryReset);

  $("dialog-close").addEventListener("click", () => {
    $("result-dialog").close();
  });

  $("result-dialog").addEventListener("click", (event) => {
    if (event.target === $("result-dialog")) {
      $("result-dialog").close();
    }
  });

  $("clock").textContent = "READY";

  if (state.delivery) {
    setMessage("An item is waiting in the collection tray.");
  } else if (state.jammed) {
    setMessage("JAM ERROR — service required.");
  } else if (state.credit > 0) {
    setMessage("Saved transaction restored. Continue or cancel for a refund.");
  } else {
    setMessage("Welcome! Select a product.");
  }

  render();
  saveState();
}

initialize();
