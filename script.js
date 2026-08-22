/* =========================================
   FOOD COIN SIMULATOR
   v0.0.0 - SCRIPT.JS
========================================= */


/* =========================================
   GAME CONFIG
========================================= */

const GAME_VERSION = "0.0.0";

const SAVE_KEY = "foodCoinSimulator_accounts";

const CURRENT_USER_KEY = "foodCoinSimulator_currentUser";

const AUTOSAVE_INTERVAL = 5000;


/* =========================================
   FOOD DATABASE
========================================= */

const foods = [

    /* COMMON */

    {
        id: "bread",
        name: "Bread",
        icon: "🍞",
        rarity: "Common",
        value: 10
    },

    {
        id: "apple",
        name: "Apple",
        icon: "🍎",
        rarity: "Common",
        value: 15
    },

    {
        id: "banana",
        name: "Banana",
        icon: "🍌",
        rarity: "Common",
        value: 20
    },

    {
        id: "egg",
        name: "Egg",
        icon: "🥚",
        rarity: "Common",
        value: 25
    },


    /* UNCOMMON */

    {
        id: "sandwich",
        name: "Sandwich",
        icon: "🥪",
        rarity: "Uncommon",
        value: 50
    },

    {
        id: "donut",
        name: "Donut",
        icon: "🍩",
        rarity: "Uncommon",
        value: 75
    },

    {
        id: "fries",
        name: "Fries",
        icon: "🍟",
        rarity: "Uncommon",
        value: 100
    },


    /* RARE */

    {
        id: "burger",
        name: "Burger",
        icon: "🍔",
        rarity: "Rare",
        value: 250
    },

    {
        id: "pizza",
        name: "Pizza",
        icon: "🍕",
        rarity: "Rare",
        value: 350
    },

    {
        id: "taco",
        name: "Taco",
        icon: "🌮",
        rarity: "Rare",
        value: 450
    },


    /* EPIC */

    {
        id: "sushi",
        name: "Sushi",
        icon: "🍣",
        rarity: "Epic",
        value: 1000
    },

    {
        id: "ramen",
        name: "Ramen",
        icon: "🍜",
        rarity: "Epic",
        value: 1500
    },

    {
        id: "steak",
        name: "Steak",
        icon: "🥩",
        rarity: "Epic",
        value: 2000
    },


    /* LEGENDARY */

    {
        id: "lobster",
        name: "Lobster",
        icon: "🦞",
        rarity: "Legendary",
        value: 10000
    },

    {
        id: "goldenburger",
        name: "Golden Burger",
        icon: "🍔",
        rarity: "Legendary",
        value: 25000
    },


    /* MYTHIC */

    {
        id: "goldenpizza",
        name: "Golden Pizza",
        icon: "🍕",
        rarity: "Mythic",
        value: 100000
    },

    {
        id: "rainbowcake",
        name: "Rainbow Cake",
        icon: "🍰",
        rarity: "Mythic",
        value: 250000
    },


    /* SECRET */

    {
        id: "cosmicfood",
        name: "Cosmic Food",
        icon: "🌌",
        rarity: "Secret",
        value: 1000000
    },

    {
        id: "godlyburger",
        name: "Godly Burger",
        icon: "🍔",
        rarity: "Secret",
        value: 5000000
    }

];


/* =========================================
   RARITY CONFIGURATION
========================================= */

const rarities = {

    Common: {
        weight: 6000
    },

    Uncommon: {
        weight: 2500
    },

    Rare: {
        weight: 1000
    },

    Epic: {
        weight: 400
    },

    Legendary: {
        weight: 80
    },

    Mythic: {
        weight: 19
    },

    Secret: {
        weight: 1
    }

};


/* =========================================
   BOX CONFIGURATION
========================================= */

const boxes = {

    basic: {

        name: "Basic Box",

        icon: "📦",

        price: 100,

        luck: 1,

        rarityMultiplier: {

            Common: 1,
            Uncommon: 1,
            Rare: 1,
            Epic: 0.4,
            Legendary: 0.1,
            Mythic: 0.02,
            Secret: 0.001

        }

    },


    good: {

        name: "Good Box",

        icon: "🎁",

        price: 1000,

        luck: 2,

        rarityMultiplier: {

            Common: 0.7,
            Uncommon: 1,
            Rare: 1.5,
            Epic: 1,
            Legendary: 0.5,
            Mythic: 0.1,
            Secret: 0.01

        }

    },


    premium: {

        name: "Premium Box",

        icon: "💎",

        price: 10000,

        luck: 5,

        rarityMultiplier: {

            Common: 0.3,
            Uncommon: 0.7,
            Rare: 1.5,
            Epic: 2,
            Legendary: 1.5,
            Mythic: 0.5,
            Secret: 0.05

        }

    },


    royal: {

        name: "Royal Box",

        icon: "👑",

        price: 100000,

        luck: 10,

        rarityMultiplier: {

            Common: 0.1,
            Uncommon: 0.3,
            Rare: 1,
            Epic: 2,
            Legendary: 3,
            Mythic: 2,
            Secret: 0.2

        }

    },


    god: {

        name: "GOD Box",

        icon: "🌌",

        price: 1000000,

        luck: 25,

        rarityMultiplier: {

            Common: 0.01,
            Uncommon: 0.05,
            Rare: 0.2,
            Epic: 1,
            Legendary: 3,
            Mythic: 5,
            Secret: 2

        }

    }

};


/* =========================================
   GAME STATE
========================================= */

let gameData = {

    money: 0,

    clicks: 0,

    boxesOpened: 0,

    clickPower: 1,

    inventory: {},

    discoveredFoods: [],

    lastReward: null,

    activeEvent: null,

    statistics: {

        totalMoneyEarned: 0,

        totalMoneySpent: 0,

        totalBoxesOpened: 0

    }

};


let currentUsername = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const authScreen =
    document.getElementById("authScreen");

const gameScreen =
    document.getElementById("gameScreen");


/* Auth */

const loginTab =
    document.getElementById("loginTab");

const signupTab =
    document.getElementById("signupTab");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");

const signupUsername =
    document.getElementById("signupUsername");

const signupPassword =
    document.getElementById("signupPassword");

const signupPasswordConfirm =
    document.getElementById("signupPasswordConfirm");

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

const logoutButton =
    document.getElementById("logoutButton");


/* Game */

const playerUsername =
    document.getElementById("playerUsername");

const moneyDisplay =
    document.getElementById("moneyDisplay");

const clickDisplay =
    document.getElementById("clickDisplay");

const boxDisplay =
    document.getElementById("boxDisplay");

const coinButton =
    document.getElementById("coinButton");

const clickReward =
    document.getElementById("clickReward");

const clickValueDisplay =
    document.getElementById("clickValueDisplay");

const inventoryContainer =
    document.getElementById("inventoryContainer");

const inventoryCount =
    document.getElementById("inventoryCount");

const resultCard =
    document.getElementById("resultCard");

const saveStatus =
    document.getElementById("saveStatus");


/* Modal */

const resultModal =
    document.getElementById("resultModal");

const closeModalButton =
    document.getElementById("closeModalButton");

const modalContinueButton =
    document.getElementById("modalContinueButton");

const modalBoxIcon =
    document.getElementById("modalBoxIcon");

const modalFoodIcon =
    document.getElementById("modalFoodIcon");

const modalFoodName =
    document.getElementById("modalFoodName");

const modalFoodRarity =
    document.getElementById("modalFoodRarity");

const modalFoodValue =
    document.getElementById("modalFoodValue");


/* =========================================
   LOCAL ACCOUNT DATABASE
========================================= */

function getAccounts() {

    const saved =
        localStorage.getItem(SAVE_KEY);

    if (!saved) {
        return {};
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Could not load accounts:",
            error
        );

        return {};

    }

}


/* =========================================
   SAVE ACCOUNTS
========================================= */

function saveAccounts(accounts) {

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(accounts)
    );

}


/* =========================================
   CREATE DEFAULT GAME DATA
========================================= */

function createDefaultGameData() {

    return {

        money: 0,

        clicks: 0,

        boxesOpened: 0,

        clickPower: 1,

        inventory: {},

        discoveredFoods: [],

        lastReward: null,

        activeEvent: null,

        statistics: {

            totalMoneyEarned: 0,

            totalMoneySpent: 0,

            totalBoxesOpened: 0

        }

    };

}


/* =========================================
   SIGN UP
========================================= */

function signUp() {

    const username =
        signupUsername.value.trim();

    const password =
        signupPassword.value;

    const confirmPassword =
        signupPasswordConfirm.value;


    signupMessage.textContent = "";


    /* Username validation */

    if (username.length < 3) {

        signupMessage.textContent =
            "Username must be at least 3 characters.";

        return;

    }


    if (username.length > 20) {

        signupMessage.textContent =
            "Username is too long.";

        return;

    }


    /* Simple username validation */

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {

        signupMessage.textContent =
            "Username can only use letters, numbers and _.";

        return;

    }


    /* Password validation */

    if (password.length < 4) {

        signupMessage.textContent =
            "Password must be at least 4 characters.";

        return;

    }


    if (password !== confirmPassword) {

        signupMessage.textContent =
            "Passwords do not match.";

        return;

    }


    const accounts = getAccounts();

    const accountKey =
        username.toLowerCase();


    if (accounts[accountKey]) {

        signupMessage.textContent =
            "That username already exists.";

        return;

    }


    /* Create account */

    accounts[accountKey] = {

        username: username,

        password: password,

        gameData: createDefaultGameData()

    };


    saveAccounts(accounts);


    /* Automatically login */

    currentUsername = accountKey;

    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUsername
    );


    gameData =
        createDefaultGameData();


    showGame();


    saveGame();

}


/* =========================================
   LOGIN
========================================= */

function login() {

    const username =
        loginUsername.value.trim();

    const password =
        loginPassword.value;


    loginMessage.textContent = "";


    if (!username || !password) {

        loginMessage.textContent =
            "Enter your username and password.";

        return;

    }


    const accounts = getAccounts();

    const accountKey =
        username.toLowerCase();


    const account =
        accounts[accountKey];


    if (!account) {

        loginMessage.textContent =
            "Account not found.";

        return;

    }


    if (account.password !== password) {

        loginMessage.textContent =
            "Incorrect password.";

        return;

    }


    currentUsername = accountKey;


    localStorage.setItem(
        CURRENT_USER_KEY,
        currentUsername
    );


    /* Load saved game */

    gameData = {

        ...createDefaultGameData(),

        ...account.gameData,

        statistics: {

            ...createDefaultGameData().statistics,

            ...(account.gameData.statistics || {})

        }

    };


    showGame();

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    saveGame();


    currentUsername = null;

    localStorage.removeItem(
        CURRENT_USER_KEY
    );


    gameScreen.classList.add("hidden");

    authScreen.classList.remove("hidden");


    loginUsername.value = "";

    loginPassword.value = "";

}


/* =========================================
   SHOW GAME
========================================= */

function showGame() {

    authScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");


    playerUsername.textContent =
        gameData.username ||
        getCurrentDisplayUsername();


    updateAllUI();

}


/* =========================================
   GET DISPLAY USERNAME
========================================= */

function getCurrentDisplayUsername() {

    const accounts =
        getAccounts();

    if (
        currentUsername &&
        accounts[currentUsername]
    ) {

        return accounts[currentUsername].username;

    }

    return "Player";

}


/* =========================================
   SAVE GAME
========================================= */

function saveGame() {

    if (!currentUsername) {
        return;
    }


    const accounts =
        getAccounts();


    if (!accounts[currentUsername]) {
        return;
    }


    accounts[currentUsername].gameData =
        gameData;


    saveAccounts(accounts);


    saveStatus.textContent =
        "💾 Saved";


    saveStatus.style.color =
        "#8dff9f";

}


/* =========================================
   AUTO SAVE
========================================= */

setInterval(() => {

    if (currentUsername) {

        saveGame();

    }

}, AUTOSAVE_INTERVAL);


/* =========================================
   AUTO LOGIN
========================================= */

function checkAutoLogin() {

    const savedUser =
        localStorage.getItem(
            CURRENT_USER_KEY
        );


    if (!savedUser) {
        return;
    }


    const accounts =
        getAccounts();


    const account =
        accounts[savedUser];


    if (!account) {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        return;

    }


    currentUsername =
        savedUser;


    gameData = {

        ...createDefaultGameData(),

        ...account.gameData,

        statistics: {

            ...createDefaultGameData().statistics,

            ...(account.gameData.statistics || {})

        }

    };


    showGame();

}


/* =========================================
   CLICK COIN
========================================= */

function clickCoin() {

    const amount =
        Number(gameData.clickPower) || 1;


    gameData.money += amount;

    gameData.clicks++;

    gameData.statistics.totalMoneyEarned +=
        amount;


    showClickReward(amount);

    updateMoney();

    updateStatistics();

    saveGame();

}


/* =========================================
   CLICK REWARD ANIMATION
========================================= */

function showClickReward(amount) {

    clickReward.textContent =
        `+$${formatNumber(amount)}`;


    clickReward.classList.remove("show");


    /* Force browser reflow */

    void clickReward.offsetWidth;


    clickReward.classList.add("show");

}


/* =========================================
   FORMAT NUMBERS
========================================= */

function formatNumber(number) {

    number =
        Number(number) || 0;


    if (number < 1000) {

        return Math.floor(number)
            .toLocaleString();

    }


    if (number < 1000000) {

        return (
            number / 1000
        ).toFixed(
            number >= 100000 ? 0 : 1
        ) + "K";

    }


    if (number < 1000000000) {

        return (
            number / 1000000
        ).toFixed(
            number >= 100000000 ? 0 : 1
        ) + "M";

    }


    if (number < 1000000000000) {

        return (
            number / 1000000000
        ).toFixed(1) + "B";

    }


    return (
        number / 1000000000000
    ).toFixed(1) + "T";

}


/* =========================================
   UPDATE MONEY
========================================= */

function updateMoney() {

    moneyDisplay.textContent =
        "$" + formatNumber(gameData.money);


    moneyDisplay.classList.remove(
        "money-pop"
    );


    void moneyDisplay.offsetWidth;


    moneyDisplay.classList.add(
        "money-pop"
    );

}


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStatistics() {

    clickDisplay.textContent =
        formatNumber(gameData.clicks);

    boxDisplay.textContent =
        formatNumber(gameData.boxesOpened);

    clickValueDisplay.textContent =
        "$" + formatNumber(gameData.clickPower);

}


/* =========================================
   UPDATE EVERYTHING
========================================= */

function updateAllUI() {

    updateMoney();

    updateStatistics();

    updateInventory();

    updateLatestReward();

}


/* =========================================
   GET RANDOM RARITY
========================================= */

function getRandomRarity(box) {

    const weightedRarities = [];


    for (
        const rarityName in rarities
    ) {

        const baseWeight =
            rarities[rarityName].weight;


        const multiplier =
            box.rarityMultiplier[
                rarityName
            ] || 0;


        const finalWeight =
            baseWeight * multiplier;


        if (finalWeight > 0) {

            weightedRarities.push({

                name: rarityName,

                weight: finalWeight

            });

        }

    }


    let totalWeight = 0;


    for (
        const rarity of weightedRarities
    ) {

        totalWeight +=
            rarity.weight;

    }


    let random =
        Math.random() * totalWeight;


    for (
        const rarity of weightedRarities
    ) {

        random -= rarity.weight;


        if (random <= 0) {

            return rarity.name;

        }

    }


    return "Common";

}


/* =========================================
   GET FOOD FROM RARITY
========================================= */

function getFoodByRarity(rarity) {

    const matchingFoods =
        foods.filter(
            food =>
                food.rarity === rarity
        );


    if (matchingFoods.length === 0) {

        return foods[0];

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            matchingFoods.length
        );


    return matchingFoods[randomIndex];

}


/* =========================================
   OPEN BOX
========================================= */

function openBox(boxID) {

    const box =
        boxes[boxID];


    if (!box) {

        console.error(
            "Invalid box:",
            boxID
        );

        return;

    }


    /* Check money */

    if (
        gameData.money <
        box.price
    ) {

        showNotEnoughMoney(box);

        return;

    }


    /* Spend money */

    gameData.money -=
        box.price;


    gameData.statistics.totalMoneySpent +=
        box.price;


    /* Get rarity */

    const rarity =
        getRandomRarity(box);


    /* Get food */

    const food =
        getFoodByRarity(rarity);


    /* Update statistics */

    gameData.boxesOpened++;

    gameData.statistics.totalBoxesOpened++;


    /* Inventory */

    if (
        !gameData.inventory[food.id]
    ) {

        gameData.inventory[food.id] = 0;

    }


    gameData.inventory[food.id]++;


    /* Discovery */

    if (
        !gameData.discoveredFoods.includes(
            food.id
        )
    ) {

        gameData.discoveredFoods.push(
            food.id
        );

    }


    /* Save latest reward */

    gameData.lastReward = {

        foodID: food.id,

        boxID: boxID,

        timestamp: Date.now()

    };


    /* Update UI */

    updateAllUI();

    updateInventory();

    showRewardModal(
        food,
        box
    );


    saveGame();

}


/* =========================================
   NOT ENOUGH MONEY
========================================= */

function showNotEnoughMoney(box) {

    resultCard.innerHTML = `

        <div style="
            text-align:center;
            width:100%;
        ">

            <div style="
                font-size:40px;
                margin-bottom:8px;
            ">
                💸
            </div>

            <strong>
                Not enough money!
            </strong>

            <p style="
                color:#8c94a6;
                margin-top:5px;
                font-size:13px;
            ">
                You need $${formatNumber(
                    box.price - gameData.money
                )} more.
            </p>

        </div>

    `;

}


/* =========================================
   SHOW REWARD MODAL
========================================= */

function showRewardModal(food, box) {

    modalBoxIcon.textContent =
        box.icon;


    modalFoodIcon.textContent =
        food.icon;


    modalFoodName.textContent =
        food.name;


    modalFoodRarity.textContent =
        food.rarity;


    modalFoodRarity.className =
        "modal-rarity rarity-" +
        food.rarity.toLowerCase();


    modalFoodValue.textContent =
        "Value: $" +
        formatNumber(food.value);


    resultModal.classList.remove(
        "hidden"
    );


    /* Update latest reward */

    resultCard.innerHTML = `

        <div class="food-card"
             style="
                width:100%;
                max-width:300px;
             ">

            <div class="food-icon">
                ${food.icon}
            </div>

            <div class="food-name">
                ${food.name}
            </div>

            <div class="food-rarity rarity-${food.rarity.toLowerCase()}">
                ${food.rarity}
            </div>

            <div class="food-value">
                Value: $${formatNumber(food.value)}
            </div>

        </div>

    `;

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeRewardModal() {

    resultModal.classList.add(
        "hidden"
    );

}


/* =========================================
   UPDATE LATEST REWARD
========================================= */

function updateLatestReward() {

    if (
        !gameData.lastReward
    ) {

        return;

    }


    const food =
        foods.find(
            item =>
                item.id ===
                gameData.lastReward.foodID
        );


    if (!food) {
        return;
    }


    resultCard.innerHTML = `

        <div class="food-card"
             style="
                width:100%;
                max-width:300px;
             ">

            <div class="food-icon">
                ${food.icon}
            </div>

            <div class="food-name">
                ${food.name}
            </div>

            <div class="food-rarity rarity-${food.rarity.toLowerCase()}">
                ${food.rarity}
            </div>

            <div class="food-value">
                Value: $${formatNumber(food.value)}
            </div>

        </div>

    `;

}


/* =========================================
   UPDATE INVENTORY
========================================= */

function updateInventory() {

    inventoryContainer.innerHTML = "";


    const itemIDs =
        Object.keys(
            gameData.inventory
        ).filter(
            id =>
                gameData.inventory[id] > 0
        );


    inventoryCount.textContent =
        gameData.discoveredFoods.length;


    if (itemIDs.length === 0) {

        inventoryContainer.innerHTML = `

            <div class="inventory-placeholder">
                Your collection is empty.
            </div>

        `;

        return;

    }


    /* Sort by rarity */

    itemIDs.sort(
        (a, b) => {

            const foodA =
                foods.find(
                    food =>
                        food.id === a
                );

            const foodB =
                foods.find(
                    food =>
                        food.id === b
                );


            return (
                getRarityRank(
                    foodB.rarity
                ) -
                getRarityRank(
                    foodA.rarity
                )
            );

        }
    );


    for (
        const foodID of itemIDs
    ) {

        const food =
            foods.find(
                item =>
                    item.id === foodID
            );


        if (!food) {
            continue;
        }


        const amount =
            gameData.inventory[
                foodID
            ];


        const card =
            document.createElement("div");


        card.className =
            "food-card";


        card.innerHTML = `

            <div class="food-icon">
                ${food.icon}
            </div>

            <div class="food-name">
                ${food.name}
            </div>

            <div class="food-rarity rarity-${food.rarity.toLowerCase()}">
                ${food.rarity}
            </div>

            <div class="food-value">
                Value: $${formatNumber(food.value)}
            </div>

            <div style="
                margin-top:8px;
                color:#9da5b6;
                font-size:12px;
            ">
                Owned: ${formatNumber(amount)}
            </div>

        `;


        inventoryContainer.appendChild(
            card
        );

    }

}


/* =========================================
   RARITY RANK
========================================= */

function getRarityRank(rarity) {

    const ranks = {

        Common: 1,

        Uncommon: 2,

        Rare: 3,

        Epic: 4,

        Legendary: 5,

        Mythic: 6,

        Secret: 7

    };


    return ranks[rarity] || 0;

}


/* =========================================
   BOX BUTTONS
========================================= */

const boxButtons =
    document.querySelectorAll(
        ".open-box-button"
    );


boxButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const boxID =
                    button.dataset.box;


                button.classList.add(
                    "box-opening"
                );


                setTimeout(
                    () => {

                        button.classList.remove(
                            "box-opening"
                        );

                    },
                    500
                );


                openBox(boxID);

            }
        );

    }
);


/* =========================================
   AUTH TAB SWITCHING
========================================= */

loginTab.addEventListener(
    "click",
    () => {

        loginTab.classList.add(
            "active"
        );

        signupTab.classList.remove(
            "active"
        );

        loginForm.classList.remove(
            "hidden"
        );

        signupForm.classList.add(
            "hidden"
        );

        loginMessage.textContent = "";

        signupMessage.textContent = "";

    }
);


signupTab.addEventListener(
    "click",
    () => {

        signupTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );

        signupForm.classList.remove(
            "hidden"
        );

        loginForm.classList.add(
            "hidden"
        );

        loginMessage.textContent = "";

        signupMessage.textContent = "";

    }
);


/* =========================================
   AUTH BUTTONS
========================================= */

loginButton.addEventListener(
    "click",
    login
);


signupButton.addEventListener(
    "click",
    signUp
);


logoutButton.addEventListener(
    "click",
    logout
);


/* =========================================
   ENTER KEY LOGIN
========================================= */

loginPassword.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* =========================================
   ENTER KEY SIGN UP
========================================= */

signupPasswordConfirm.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            signUp();

        }

    }
);


/* =========================================
   COIN BUTTON
========================================= */

coinButton.addEventListener(
    "click",
    clickCoin
);


/* =========================================
   MODAL BUTTONS
========================================= */

closeModalButton.addEventListener(
    "click",
    closeRewardModal
);


modalContinueButton.addEventListener(
    "click",
    closeRewardModal
);


/* =========================================
   CLICK OUTSIDE MODAL
========================================= */

resultModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            resultModal
        ) {

            closeRewardModal();

        }

    }
);


/* =========================================
   ESCAPE TO CLOSE MODAL
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !resultModal.classList.contains(
                "hidden"
            )
        ) {

            closeRewardModal();

        }

    }
);


/* =========================================
   SAVE BEFORE PAGE CLOSE
========================================= */

window.addEventListener(
    "beforeunload",
    () => {

        saveGame();

    }
);


/* =========================================
   INITIALIZE
========================================= */

function initializeGame() {

    console.log(
        `Food Coin Simulator v${GAME_VERSION} loaded.`
    );


    checkAutoLogin();

}


/* =========================================
   START GAME
========================================= */

initializeGame();