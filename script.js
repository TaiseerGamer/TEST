// ==========================================
// FOOD BOX COLLECTOR
// Version 0.0.1
// Patch Update
// ==========================================


// ==========================================
// SAVE SYSTEM
// ==========================================

const SAVE_KEY = "foodBoxCollectorSave_v001";

let money = 0;
let collection = {};


// ==========================================
// FOODS
// ==========================================

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
        name: "Mystery Food",
        emoji: "❓",
        rarity: "Legendary",
        chance: 0.01
    }

];


// ==========================================
// BOXES
// ==========================================

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


// ==========================================
// DOM ELEMENTS
// ==========================================

const moneyElement =
    document.getElementById("money");

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

const resultOwned =
    document.getElementById("resultOwned");

const newBadge =
    document.getElementById("newBadge");

const closeModal =
    document.getElementById("closeModal");

const openAgain =
    document.getElementById("openAgain");

const collectionElement =
    document.getElementById("collection");

const notification =
    document.getElementById("notification");

const coinParticles =
    document.getElementById("coinParticles");


// ==========================================
// LOAD SAVE
// ==========================================

function loadGame() {

    try {

        const savedData =
            localStorage.getItem(SAVE_KEY);

        if (!savedData) {
            return;
        }

        const data =
            JSON.parse(savedData);

        if (
            typeof data.money === "number" &&
            data.money >= 0
        ) {

            money = data.money;

        }

        if (
            data.collection &&
            typeof data.collection === "object"
        ) {

            collection = data.collection;

        }

    } catch (error) {

        console.log(
            "Could not load save:",
            error
        );

    }

}


// ==========================================
// SAVE GAME
// ==========================================

function saveGame() {

    const saveData = {

        money: money,

        collection: collection

    };

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

    } catch (error) {

        console.log(
            "Could not save game:",
            error
        );

    }

}


// ==========================================
// UPDATE UI
// ==========================================

function updateUI() {

    moneyElement.textContent =
        "$" + money.toLocaleString();

    const collected =
        Object.keys(collection).length;

    collectionCountElement.textContent =
        `${collected} / ${foods.length}`;

    renderCollection();

}


// ==========================================
// COIN CLICK
// ==========================================

coinButton.addEventListener(
    "click",
    () => {

        money += 1;

        updateUI();

        saveGame();

        createFloatingMoney();

    }
);


// ==========================================
// FLOATING MONEY
// ==========================================

function createFloatingMoney() {

    const text =
        document.createElement("div");

    text.className =
        "coin-float";

    text.textContent =
        "+$1";

    coinParticles.appendChild(text);

    setTimeout(() => {

        text.remove();

    }, 800);

}


// ==========================================
// BUY BUTTONS
// ==========================================

document
    .querySelectorAll(".buy-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const boxType =
                    button.dataset.box;

                buyBox(boxType);

            }
        );

    });


// ==========================================
// BUY BOX
// ==========================================

function buyBox(boxType) {

    const box =
        boxes[boxType];

    if (!box) {
        return;
    }

    if (money < box.price) {

        const missing =
            box.price - money;

        showNotification(
            `You need $${missing.toLocaleString()} more!`
        );

        return;
    }

    money -= box.price;

    updateUI();

    saveGame();

    openBox(boxType);

}


// ==========================================
// OPEN BOX
// ==========================================

function openBox(boxType) {

    const box =
        boxes[boxType];

    modal.classList.remove("hidden");

    result.classList.add("hidden");

    newBadge.classList.add("hidden");

    openAgain.classList.add("hidden");

    openingBox.classList.remove("reveal");

    openingBox.textContent =
        "📦";

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


// ==========================================
// RANDOM FOOD
// ==========================================

function getRandomFood(luck) {

    const weightedFoods =
        foods.map(food => {

            let weight =
                food.chance;


            // Normal foods stay mostly unchanged
            if (
                food.rarity === "Uncommon"
            ) {

                weight *=
                    1 + (luck - 1) * 0.15;

            }


            // Rare foods receive a larger boost
            if (
                food.rarity === "Rare"
            ) {

                weight *=
                    luck;

            }


            // Epic foods receive an even larger boost
            if (
                food.rarity === "Epic"
            ) {

                weight *=
                    luck * 1.5;

            }


            // Legendary foods benefit the most
            if (
                food.rarity === "Legendary"
            ) {

                weight *=
                    luck * 2;

            }


            return {
                food: food,
                weight: weight
            };

        });


    let totalWeight = 0;

    weightedFoods.forEach(item => {

        totalWeight += item.weight;

    });


    let random =
        Math.random() * totalWeight;


    for (
        const item of weightedFoods
    ) {

        random -= item.weight;

        if (random <= 0) {

            return item.food;

        }

    }


    return foods[0];

}


// ==========================================
// SHOW RESULT
// ==========================================

function showFoodResult(food) {

    const wasNew =
        !collection[food.id];


    // Add food to collection
    if (wasNew) {

        collection[food.id] = 1;

    } else {

        collection[food.id]++;

    }


    const owned =
        collection[food.id];


    openingText.textContent =
        "You got:";


    openingBox.textContent =
        food.emoji;

    openingBox.classList.add("reveal");


    resultEmoji.textContent =
        food.emoji;

    resultName.textContent =
        food.name;

    resultRarity.textContent =
        food.rarity;

    resultOwned.textContent =
        `Owned: ${owned}`;


    // NEW badge
    if (wasNew) {

        newBadge.classList.remove("hidden");

    } else {

        newBadge.classList.add("hidden");

    }


    result.classList.remove("hidden");

    openAgain.classList.remove("hidden");


    updateUI();

    saveGame();

}


// ==========================================
// CLOSE / OPEN AGAIN
// ==========================================

openAgain.addEventListener(
    "click",
    () => {

        closeModalFunction();

    }
);


closeModal.addEventListener(
    "click",
    () => {

        closeModalFunction();

    }
);


modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeModalFunction();

        }

    }
);


function closeModalFunction() {

    modal.classList.add("hidden");

}


// ==========================================
// COLLECTION
// ==========================================

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


        if (owned > 0) {

            card.innerHTML = `

                <div class="food-emoji">
                    ${food.emoji}
                </div>

                <div class="food-name">
                    ${food.name}
                </div>

                <div class="food-rarity">
                    ${food.rarity}
                </div>

                <div class="food-owned">
                    Owned: ${owned}
                </div>

            `;

        } else {

            card.innerHTML = `

                <div class="food-emoji">
                    ❔
                </div>

                <div class="food-name">
                    ???
                </div>

                <div class="food-rarity">
                    Not discovered
                </div>

            `;

        }


        collectionElement.appendChild(card);

    });

}


// ==========================================
// NOTIFICATION
// ==========================================

let notificationTimeout;


function showNotification(message) {

    notification.textContent =
        message;

    notification.classList.add(
        "show"
    );


    clearTimeout(
        notificationTimeout
    );


    notificationTimeout =
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 2000);

}


// ==========================================
// AUTO SAVE
// ==========================================

// Save every 10 seconds
setInterval(
    saveGame,
    10000
);


// Save when leaving the page
window.addEventListener(
    "beforeunload",
    saveGame
);


// ==========================================
// START
// ==========================================

loadGame();

updateUI();