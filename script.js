// ==========================================
// FOOD BOX COLLECTOR
// Version 0.0.0
// ==========================================

// -------------------------
// PLAYER DATA
// -------------------------

let money = 0;
let collection = {};


// -------------------------
// FOODS
// -------------------------

const foods = [

    // COMMON
    {
        id: "apple",
        name: "Apple",
        emoji: "🍎",
        rarity: "Common",
        chance: 35
    },

    {
        id: "bread",
        name: "Bread",
        emoji: "🍞",
        rarity: "Common",
        chance: 30
    },

    {
        id: "banana",
        name: "Banana",
        emoji: "🍌",
        rarity: "Common",
        chance: 25
    },

    {
        id: "egg",
        name: "Egg",
        emoji: "🥚",
        rarity: "Common",
        chance: 20
    },

    {
        id: "fries",
        name: "Fries",
        emoji: "🍟",
        rarity: "Common",
        chance: 15
    },

    // UNCOMMON
    {
        id: "burger",
        name: "Burger",
        emoji: "🍔",
        rarity: "Uncommon",
        chance: 12
    },

    {
        id: "pizza",
        name: "Pizza",
        emoji: "🍕",
        rarity: "Uncommon",
        chance: 10
    },

    {
        id: "donut",
        name: "Donut",
        emoji: "🍩",
        rarity: "Uncommon",
        chance: 9
    },

    {
        id: "taco",
        name: "Taco",
        emoji: "🌮",
        rarity: "Uncommon",
        chance: 8
    },

    // RARE
    {
        id: "sushi",
        name: "Sushi",
        emoji: "🍣",
        rarity: "Rare",
        chance: 5
    },

    {
        id: "steak",
        name: "Steak",
        emoji: "🥩",
        rarity: "Rare",
        chance: 4
    },

    {
        id: "lobster",
        name: "Lobster",
        emoji: "🦞",
        rarity: "Rare",
        chance: 3
    },

    {
        id: "ramen",
        name: "Ramen",
        emoji: "🍜",
        rarity: "Rare",
        chance: 2.5
    },

    // EPIC
    {
        id: "goldburger",
        name: "Golden Burger",
        emoji: "🍔",
        rarity: "Epic",
        chance: 1
    },

    {
        id: "goldpizza",
        name: "Golden Pizza",
        emoji: "🍕",
        rarity: "Epic",
        chance: 0.8
    },

    {
        id: "rainbowdonut",
        name: "Rainbow Donut",
        emoji: "🍩",
        rarity: "Epic",
        chance: 0.6
    },

    // LEGENDARY
    {
        id: "cosmicpizza",
        name: "Cosmic Pizza",
        emoji: "🌌",
        rarity: "Legendary",
        chance: 0.15
    },

    {
        id: "goldenfeast",
        name: "Golden Feast",
        emoji: "🍱",
        rarity: "Legendary",
        chance: 0.08
    },

    {
        id: "galaxyburger",
        name: "Galaxy Burger",
        emoji: "🌠",
        rarity: "Legendary",
        chance: 0.03
    },

    {
        id: "mysteryfood",
        name: "???",
        emoji: "❓",
        rarity: "Legendary",
        chance: 0.01
    }
];


// -------------------------
// BOXES
// -------------------------

const boxes = {

    basic: {
        name: "Basic Box",
        price: 25,
        luck: 1
    },

    premium: {
        name: "Premium Box",
        price: 150,
        luck: 3
    },

    legendary: {
        name: "Legendary Box",
        price: 1000,
        luck: 8
    }

};


// -------------------------
// ELEMENTS
// -------------------------

const moneyElement = document.getElementById("money");
const collectionCountElement =
    document.getElementById("collectionCount");

const coinButton =
    document.getElementById("coinButton");

const modal =
    document.getElementById("modal");

const openingBox =
    document.getElementById("openingBox");

const openingText =
    document.getElementById("openingText");

const result =
    document.getElementById("result");

const resultEmoji =
    document.getElementById("resultEmoji");

const resultName =
    document.getElementById("resultName");

const resultRarity =
    document.getElementById("resultRarity");

const closeModal =
    document.getElementById("closeModal");

const openAgain =
    document.getElementById("openAgain");

const collectionElement =
    document.getElementById("collection");

const notification =
    document.getElementById("notification");


// -------------------------
// UPDATE UI
// -------------------------

function updateUI() {

    moneyElement.textContent =
        "$" + money.toLocaleString();

    const collected =
        Object.keys(collection).length;

    collectionCountElement.textContent =
        `${collected} / ${foods.length}`;

    renderCollection();
}


// -------------------------
// COIN
// -------------------------

coinButton.addEventListener("click", () => {

    money += 1;

    updateUI();

    // Small click animation
    coinButton.style.transform =
        "scale(0.93)";

    setTimeout(() => {

        coinButton.style.transform =
            "";

    }, 80);

});


// -------------------------
// BUY BOX
// -------------------------

document.querySelectorAll(".buy-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const boxType =
                button.dataset.box;

            buyBox(boxType);

        });

    });


function buyBox(boxType) {

    const box = boxes[boxType];

    if (money < box.price) {

        showNotification(
            `You need $${box.price - money} more!`
        );

        return;
    }

    money -= box.price;

    updateUI();

    openBox(boxType);
}


// -------------------------
// OPEN BOX
// -------------------------

function openBox(boxType) {

    const box = boxes[boxType];

    modal.classList.remove("hidden");

    result.classList.add("hidden");
    openAgain.classList.add("hidden");

    openingBox.textContent = "📦";

    openingText.textContent =
        `Opening ${box.name}...`;

    openingBox.classList.add("shake");

    setTimeout(() => {

        openingBox.classList.remove("shake");

        const food =
            getRandomFood(box.luck);

        showFoodResult(food);

    }, 1500);
}


// -------------------------
// RANDOM FOOD
// -------------------------

function getRandomFood(luck) {

    // Higher luck boosts rarer foods
    const weightedFoods =
        foods.map(food => {

            let weight = food.chance;

            if (
                food.rarity === "Rare"
            ) {
                weight *= luck;
            }

            if (
                food.rarity === "Epic"
            ) {
                weight *= luck * 1.5;
            }

            if (
                food.rarity === "Legendary"
            ) {
                weight *= luck * 2;
            }

            return {
                food,
                weight
            };

        });

    let totalWeight = 0;

    weightedFoods.forEach(item => {
        totalWeight += item.weight;
    });

    let random =
        Math.random() * totalWeight;

    for (const item of weightedFoods) {

        random -= item.weight;

        if (random <= 0) {
            return item.food;
        }

    }

    return foods[0];
}


// -------------------------
// SHOW RESULT
// -------------------------

function showFoodResult(food) {

    openingText.textContent =
        "You got:";

    resultEmoji.textContent =
        food.emoji;

    resultName.textContent =
        food.name;

    resultRarity.textContent =
        food.rarity;

    result.classList.remove("hidden");

    openAgain.classList.remove("hidden");

    // Add to collection
    if (!collection[food.id]) {

        collection[food.id] = 1;

    } else {

        collection[food.id]++;

    }

    updateUI();

}


// -------------------------
// OPEN ANOTHER
// -------------------------

openAgain.addEventListener("click", () => {

    closeModalFunction();

});


// -------------------------
// CLOSE MODAL
// -------------------------

closeModal.addEventListener("click", () => {

    closeModalFunction();

});


function closeModalFunction() {

    modal.classList.add("hidden");

}


// -------------------------
// COLLECTION
// -------------------------

function renderCollection() {

    collectionElement.innerHTML = "";

    foods.forEach(food => {

        const card =
            document.createElement("div");

        const owned =
            collection[food.id] || 0;

        card.className =
            owned > 0
                ? "food-card"
                : "food-card locked";

        card.innerHTML = `

            <div class="food-emoji">
                ${owned > 0 ? food.emoji : "❔"}
            </div>

            <div class="food-name">
                ${owned > 0 ? food.name : "???"
                }
            </div>

            <div class="food-rarity">
                ${owned > 0
                    ? food.rarity
                    : "Not discovered"
                }
            </div>

            ${
                owned > 0
                    ? `<div class="food-rarity">
                        Owned: ${owned}
                       </div>`
                    : ""
            }

        `;

        collectionElement.appendChild(card);

    });

}


// -------------------------
// NOTIFICATION
// -------------------------

let notificationTimeout;

function showNotification(message) {

    notification.textContent =
        message;

    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout =
        setTimeout(() => {

            notification.classList.remove("show");

        }, 2000);

}


// -------------------------
// START GAME
// -------------------------

updateUI();