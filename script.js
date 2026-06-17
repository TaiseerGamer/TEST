let coins = 0;

let currentOrder = [];
let currentBurger = [];

const possibleOrders = [
    ["Patty"],
    ["Patty", "Cheese"],
    ["Patty", "Lettuce"],
    ["Patty", "Cheese", "Lettuce"]
];

let pattyCooked = false;

function newOrder() {
    currentOrder =
        possibleOrders[Math.floor(Math.random() * possibleOrders.length)];

    document.getElementById("order").textContent =
        currentOrder.join(", ");

    resetBurger();
}

function cookPatty() {
    pattyCooked = true;
    alert("Patty cooked!");
}

function addPatty() {
    if (!pattyCooked) {
        alert("Cook the patty first!");
        return;
    }

    currentBurger.push("Patty");
    updateBurger();
    pattyCooked = false;
}

function addCheese() {
    currentBurger.push("Cheese");
    updateBurger();
}

function addLettuce() {
    currentBurger.push("Lettuce");
    updateBurger();
}

function updateBurger() {
    const list = document.getElementById("burgerList");
    list.innerHTML = "";

    currentBurger.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}

function serveBurger() {
    const orderSorted = [...currentOrder].sort().join(",");
    const burgerSorted = [...currentBurger].sort().join(",");

    if (orderSorted === burgerSorted) {
        coins += 10;
        document.getElementById("coins").textContent = coins;
        alert("Customer happy! +10 Coins");
    } else {
        alert("Wrong burger!");
    }

    newOrder();
}

function resetBurger() {
    currentBurger = [];
    updateBurger();
}

newOrder();