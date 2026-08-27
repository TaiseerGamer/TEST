// ===============================
// FOOD COLLECTOR v0.0.0
// ===============================

// Coins
let coins = 0;

// Currently owned box
let ownedBox = null;

// Food waiting to be collected
let pendingFood = null;


// ===============================
// FOOD DATABASE
// ===============================

const foods = [

    // Common
    {
        name: "Apple",
        icon: "🍎",
        rarity: "Common",
        chance: 45
    },

    {
        name: "Bread",
        icon: "🍞",
        rarity: "Common",
        chance: 30
    },

    {
        name: "Banana",
        icon: "🍌",
        rarity: "Common",
        chance: 15
    },

    // Uncommon
    {
        name: "Burger",
        icon: "🍔",
        rarity: "Uncommon",
        chance: 5
    },

    {
        name: "Pizza",
        icon: "🍕",
        rarity: "Uncommon",
        chance: 3
    },

    // Rare
    {
        name: "Sushi",
        icon: "🍣",
        rarity: "Rare",
        chance: 1
    },

    {
        name: "Donut",
        icon: "🍩",
        rarity: "Rare",
        chance: 1
    }
];


// ===============================
// COLLECTION
// ===============================

let collection = [];


// ===============================
// ELEMENTS
// ===============================

const coinButton = document.getElementById("coinButton");
const coinCount = document.getElementById("coinCount");

const buyButtons = document.querySelectorAll(".buy-button");

const openingSection = document.getElementById("openingSection");
const openButton = document.getElementById("openButton");

const resultSection = document.getElementById("resultSection");

const foodResult = document.getElementById("foodResult");
const foodName = document.getElementById("foodName");
const foodRarity = document.getElementById("foodRarity");

const collectButton = document.getElementById("collectButton");

const collectionGrid = document.getElementById("collectionGrid");

const collectionCount = document.getElementById("collectionCount");
const totalFoods = document.getElementById("totalFoods");


// ===============================
// COIN SYSTEM
// ===============================

coinButton.addEventListener("click", () => {

    coins++;

    updateCoins();

});

function updateCoins() {

    coinCount.textContent = coins;

}


// ===============================
// BUY BOX
// ===============================

buyButtons.forEach(button => {

    button.addEventListener("click", () => {

        const boxType = button.dataset.box;

        if (boxType === "basic") {

            buyBasicBox();

        }

    });

});


function buyBasicBox() {

    const price = 25;

    if (coins < price) {

        alert("You don't have enough coins!");

        return;

    }

    coins -= price;

    updateCoins();

    ownedBox = "basic";

    openingSection.classList.remove("hidden");

    openingSection.scrollIntoView({
        behavior: "smooth"
    });

}


// ===============================
// OPEN BOX
// ===============================

openButton.addEventListener("click", () => {

    if (!ownedBox) {
        return;
    }

    pendingFood = getRandomFood();

    foodResult.textContent = pendingFood.icon;
    foodName.textContent = pendingFood.name;
    foodRarity.textContent = pendingFood.rarity;

    resultSection.classList.remove("hidden");

    ownedBox = null;

    openingSection.classList.add("hidden");

    resultSection.scrollIntoView({
        behavior: "smooth"
    });

});


// ===============================
// RANDOM FOOD
// ===============================

function getRandomFood() {

    const totalChance = foods.reduce(
        (total, food) => total + food.chance,
        0
    );

    let random = Math.random() * totalChance;

    for (const food of foods) {

        random -= food.chance;

        if (random <= 0) {
            return food;
        }

    }

    return foods[0];

}


// ===============================
// COLLECT FOOD
// ===============================

collectButton.addEventListener("click", () => {

    if (!pendingFood) {
        return;
    }

    if (!collection.includes(pendingFood.name)) {

        collection.push(pendingFood.name);

    }

    pendingFood = null;

    resultSection.classList.add("hidden");

    updateCollection();

    collectionGrid.scrollIntoView({
        behavior: "smooth"
    });

});


// ===============================
// UPDATE COLLECTION
// ===============================

function updateCollection() {

    collectionGrid.innerHTML = "";

    totalFoods.textContent = foods.length;

    collectionCount.textContent = collection.length;


    foods.forEach(food => {

        const card = document.createElement("div");

        card.classList.add("food-card");


        const collected = collection.includes(food.name);


        if (!collected) {

            card.classList.add("locked");

        }


        card.innerHTML = `

            <div class="food-icon">
                ${collected ? food.icon : "❓"}
            </div>

            <h3>
                ${collected ? food.name : "Unknown Food"}
            </h3>

            <p>
                ${collected ? food.rarity : "Not discovered"}
            </p>

        `;


        collectionGrid.appendChild(card);

    });

}


// ===============================
// START GAME
// ===============================

updateCoins();
updateCollection();