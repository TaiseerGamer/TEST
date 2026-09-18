let money = 0;
let inventory = [];

// Coin click
document.getElementById("coin").addEventListener("click", () => {
    money += 1;
    updateMoney();

    document.getElementById("result").textContent = "+$1";
});

// Update money display
function updateMoney() {
    document.getElementById("money").textContent = money;
}

// Buy a box
function buyBox(type) {
    const cost = type === "cheap" ? 8 : 45;

    if (money < cost) {
        document.getElementById("result").textContent =
            "❌ Not enough money!";
        return;
    }

    money -= cost;
    updateMoney();

    const food = getFood(type);

    inventory.push(food);

    document.getElementById("result").textContent =
        `🎉 You got ${food}!`;

    displayInventory();
}

// Food loot table
function getFood(type) {
    const commonFoods = [
        "🍎 Apple",
        "🥖 Bread",
        "🥔 Potato"
    ];

    const rareFoods = [
        "🍣 Sushi",
        "🍫 Chocolate",
        "🥩 Steak"
    ];

    if (type === "cheap") {
        return Math.random() < 0.82
            ? randomItem(commonFoods)
            : randomItem(rareFoods);
    } else {
        return Math.random() < 0.75
            ? randomItem(rareFoods)
            : randomItem(commonFoods);
    }
}

// Random picker
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Update inventory
function displayInventory() {
    const list = document.getElementById("inventory");
    list.innerHTML = "";

    inventory.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    document.getElementById("foodCount").textContent =
        inventory.length;
}