/* =========================
   Burger Cooking Simulator
   v0.1.0
========================= */

const game = {
    money: 0,
    xp: 0,
    level: 1,
    reputation: 100,
    combo: 1,
    day: 1,

    dailyEarnings: 0,

    customersServed: 0,
    burgersMade: 0,
    totalEarnings: 0,
    highestCombo: 1,
    burntBurgers: 0,

    achievements: [],

    grillSpeed: 1,
    customerSpeed: 1,
    assemblySpeed: 1,

    unlocked: {
        cheese: false,
        tomato: false,
        onion: false,
        pickles: false,
        chicken: false,
        mayo: false
    }
};

const SAVE_KEY = "burgerCookingSimulatorSave";

/* =========================
   DOM
========================= */

const mainMenu = document.getElementById("mainMenu");
const gameScreen = document.getElementById("game");

const moneyEl = document.getElementById("money");
const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const reputationEl = document.getElementById("reputation");
const comboEl = document.getElementById("combo");
const dayEl = document.getElementById("day");

const xpBar = document.getElementById("xpBar");

const customerQueue = document.getElementById("customerQueue");

const burgerStack = document.getElementById("burgerStack");

const statBurgers = document.getElementById("statBurgers");
const statCustomers = document.getElementById("statCustomers");
const statEarnings = document.getElementById("statEarnings");
const statCombo = document.getElementById("statCombo");
const statBurnt = document.getElementById("statBurnt");

const dailyEarningsEl = document.getElementById("dailyEarnings");

/* =========================
   GAME VARIABLES
========================= */

let currentBurger = [];
let customers = [];
let grillSlots = [];
let customerID = 0;

/* =========================
   ORDERS
========================= */

const orderPool = [
    {
        name: "Cheeseburger",
        ingredients: [
            "Bottom Bun",
            "Beef Patty",
            "Cheese",
            "Top Bun"
        ]
    },
    {
        name: "Hamburger",
        ingredients: [
            "Bottom Bun",
            "Beef Patty",
            "Top Bun"
        ]
    },
    {
        name: "Veggie Burger",
        ingredients: [
            "Bottom Bun",
            "Lettuce",
            "Top Bun"
        ]
    }
];

/* =========================
   SAVE SYSTEM
========================= */

function saveGame() {

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
    );

}

function loadGame() {

    const save = localStorage.getItem(SAVE_KEY);

    if (!save) return;

    const data = JSON.parse(save);

    Object.assign(game, data);

    updateUI();

}

setInterval(saveGame, 5000);

/* =========================
   UI
========================= */

function updateUI() {

    moneyEl.textContent = "$" + game.money;
    xpEl.textContent = game.xp;
    levelEl.textContent = game.level;
    reputationEl.textContent = game.reputation;
    comboEl.textContent = "x" + game.combo;
    dayEl.textContent = game.day;

    dailyEarningsEl.textContent =
        "$" + game.dailyEarnings;

    statBurgers.textContent =
        game.burgersMade;

    statCustomers.textContent =
        game.customersServed;

    statEarnings.textContent =
        "$" + game.totalEarnings;

    statCombo.textContent =
        game.highestCombo;

    statBurnt.textContent =
        game.burntBurgers;

    let neededXP =
        game.level * 100;

    xpBar.style.width =
        Math.min(
            (game.xp / neededXP) * 100,
            100
        ) + "%";

}

/* =========================
   NOTIFICATIONS
========================= */

function notify(text) {

    const container =
        document.getElementById(
            "notificationContainer"
        );

    const note =
        document.createElement("div");

    note.className = "notification";

    note.textContent = text;

    container.appendChild(note);

    setTimeout(() => {

        note.remove();

    }, 3000);

}

/* =========================
   LEVEL SYSTEM
========================= */

function gainXP(amount) {

    game.xp += amount;

    while (
        game.xp >=
        game.level * 100
    ) {

        game.xp -=
            game.level * 100;

        game.level++;

        notify(
            "Level Up! Level " +
            game.level
        );

        unlockContent();
    }

    updateUI();

}

function unlockContent() {

    if (
        game.level >= 2 &&
        !game.unlocked.cheese
    ) {

        game.unlocked.cheese = true;

        notify(
            "Unlocked Cheese!"
        );

    }

    if (
        game.level >= 3 &&
        !game.unlocked.tomato
    ) {

        game.unlocked.tomato = true;

        notify(
            "Unlocked Tomato!"
        );

    }

    if (
        game.level >= 4 &&
        !game.unlocked.onion
    ) {

        game.unlocked.onion = true;

        notify(
            "Unlocked Onion!"
        );

    }

    if (
        game.level >= 5 &&
        !game.unlocked.pickles
    ) {

        game.unlocked.pickles = true;

        notify(
            "Unlocked Pickles!"
        );

    }

    if (
        game.level >= 6 &&
        !game.unlocked.chicken
    ) {

        game.unlocked.chicken = true;

        notify(
            "Unlocked Chicken Patty!"
        );

    }

}

/* =========================
   CUSTOMER SYSTEM
========================= */

function spawnCustomer() {

    const order =
        orderPool[
            Math.floor(
                Math.random() *
                orderPool.length
            )
        ];

    const customer = {
        id: customerID++,
        order: order,
        patience: 100
    };

    customers.push(customer);

    renderCustomers();

    notify(
        "Customer Arrived!"
    );

}

function renderCustomers() {

    customerQueue.innerHTML = "";

    customers.forEach(customer => {

        const card =
            document.createElement("div");

        card.className =
            "customer-card";

        card.innerHTML = `
            <div class="customer-name">
                Customer #${customer.id}
            </div>

            <div class="customer-order">
                ${customer.order.name}
            </div>

            <div class="patience-bar">
                <div
                    class="patience-fill"
                    style="
                    width:${customer.patience}%
                    ">
                </div>
            </div>
        `;

        customerQueue.appendChild(card);

    });

}

setInterval(() => {

    customers.forEach(c => {

        c.patience -= 2;

    });

    customers = customers.filter(c => {

        if (c.patience <= 0) {

            game.reputation -= 5;

            game.combo = 1;

            notify(
                "Customer Left!"
            );

            updateUI();

            return false;
        }

        return true;

    });

    renderCustomers();

}, 1000);

/* =========================
   CUSTOMER SPAWNING
========================= */

setInterval(() => {

    if (
        customers.length < 5
    ) {

        spawnCustomer();

    }

}, 7000);

/* =========================
   BURGER ASSEMBLY
========================= */

function renderBurger() {

    burgerStack.innerHTML = "";

    currentBurger.forEach(layer => {

        const div =
            document.createElement("div");

        div.className =
            "burger-layer";

        div.textContent =
            layer;

        burgerStack.appendChild(div);

    });

}

document
.querySelectorAll(".ingredient")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (
                button.classList.contains(
                    "locked"
                )
            ) return;

            currentBurger.push(
                button.dataset.item ||
                button.textContent
            );

            renderBurger();

        }
    );

});

document
.getElementById(
    "clearBurgerBtn"
)
.addEventListener(
    "click",
    () => {

        currentBurger = [];

        renderBurger();

    }
);

/* =========================
   START GAME
========================= */

document
.getElementById("playBtn")
.addEventListener(
    "click",
    () => {

        mainMenu.classList.add(
            "hidden"
        );

        gameScreen.classList.remove(
            "hidden"
        );

        loadGame();

        updateUI();

        spawnCustomer();

    }
);

updateUI();
/* =========================
   GRILL SYSTEM
========================= */

const grillArea =
    document.getElementById("grillArea");

function createPatty(type = "Beef Patty") {

    return {
        type: type,
        progress: 0,
        stage: "Raw"
    };

}

function updatePattyStage(patty) {

    if (patty.progress < 25) {
        patty.stage = "Raw";
    }
    else if (patty.progress < 60) {
        patty.stage = "Cooking";
    }
    else if (patty.progress < 80) {
        patty.stage = "Perfect";
    }
    else if (patty.progress < 95) {
        patty.stage = "Overcooked";
    }
    else {
        patty.stage = "Burnt";
    }

}

function renderGrill() {

    const slots =
        document.querySelectorAll(
            ".grill-slot"
        );

    slots.forEach((slot, index) => {

        const patty =
            grillSlots[index];

        const label =
            slot.querySelector(
                ".grill-label"
            );

        const progress =
            slot.querySelector(
                ".cook-progress"
            );

        if (!patty) {

            label.textContent =
                "Empty Grill";

            progress.style.width =
                "0%";

            progress.style.background =
                "limegreen";

            return;
        }

        label.innerHTML = `
            ${patty.type}
            <br>
            ${patty.stage}
        `;

        progress.style.width =
            patty.progress + "%";

        switch (patty.stage) {

            case "Raw":
                progress.style.background =
                    "#777";
                break;

            case "Cooking":
                progress.style.background =
                    "#ff9800";
                break;

            case "Perfect":
                progress.style.background =
                    "#4caf50";
                break;

            case "Overcooked":
                progress.style.background =
                    "#ff5722";
                break;

            case "Burnt":
                progress.style.background =
                    "#111";
                break;

        }

    });

}

setInterval(() => {

    grillSlots.forEach(patty => {

        if (!patty) return;

        patty.progress +=
            1 * game.grillSpeed;

        updatePattyStage(
            patty
        );

    });

    renderGrill();

}, 250);

/* =========================
   ADD PATTIES
========================= */

document
.getElementById(
    "addBeefBtn"
)
.addEventListener(
    "click",
    () => {

        const index =
            grillSlots.findIndex(
                slot => !slot
            );

        if (index === -1) {

            notify(
                "No Free Grill!"
            );

            return;
        }

        grillSlots[index] =
            createPatty(
                "Beef Patty"
            );

        renderGrill();

    }
);

document
.getElementById(
    "addChickenBtn"
)
.addEventListener(
    "click",
    () => {

        const index =
            grillSlots.findIndex(
                slot => !slot
            );

        if (index === -1) return;

        grillSlots[index] =
            createPatty(
                "Chicken Patty"
            );

        renderGrill();

    }
);

/* =========================
   CLICK PATTY TO TAKE
========================= */

grillArea.addEventListener(
    "click",
    e => {

        const slot =
            e.target.closest(
                ".grill-slot"
            );

        if (!slot) return;

        const index =
            Number(
                slot.dataset.slot
            );

        const patty =
            grillSlots[index];

        if (!patty) return;

        currentBurger.push(
            patty.type
        );

        if (
            patty.stage ===
            "Burnt"
        ) {

            game.burntBurgers++;

        }

        grillSlots[index] =
            null;

        renderBurger();
        renderGrill();

    }
);

/* =========================
   SERVE SYSTEM
========================= */

function arraysEqual(a, b) {

    if (
        a.length !== b.length
    ) return false;

    for (
        let i = 0;
        i < a.length;
        i++
    ) {

        if (
            a[i] !== b[i]
        ) return false;

    }

    return true;

}

document
.getElementById(
    "serveBurgerBtn"
)
.addEventListener(
    "click",
    serveBurger
);

function serveBurger() {

    if (
        customers.length === 0
    ) {

        notify(
            "No Customers!"
        );

        return;
    }

    const customer =
        customers[0];

    const correct =
        arraysEqual(
            currentBurger,
            customer.order.ingredients
        );

    if (correct) {

        let reward =
            25 * game.combo;

        let xpReward =
            15 * game.combo;

        game.money += reward;
        game.xp += xpReward;

        game.totalEarnings +=
            reward;

        game.dailyEarnings +=
            reward;

        game.customersServed++;
        game.burgersMade++;

        game.combo++;

        if (
            game.combo >
            game.highestCombo
        ) {

            game.highestCombo =
                game.combo;

        }

        gainXP(0);

        notify(
            "+" +
            reward +
            "$ Served!"
        );

    }
    else {

        game.combo = 1;

        game.reputation -= 5;

        notify(
            "Wrong Burger!"
        );

    }

    customers.shift();

    currentBurger = [];

    renderCustomers();
    renderBurger();

    updateUI();

    checkAchievements();

}

/* =========================
   ACHIEVEMENTS
========================= */

function unlockAchievement(
    name
) {

    if (
        game.achievements.includes(
            name
        )
    ) return;

    game.achievements.push(
        name
    );

    const popup =
        document.getElementById(
            "achievementPopup"
        );

    document.getElementById(
        "achievementText"
    ).textContent = name;

    popup.style.display =
        "block";

    setTimeout(() => {

        popup.style.display =
            "none";

    }, 3000);

}

function checkAchievements() {

    if (
        game.customersServed >= 1
    ) {

        unlockAchievement(
            "First Customer"
        );

    }

    if (
        game.customersServed >= 10
    ) {

        unlockAchievement(
            "10 Burgers Served"
        );

    }

    if (
        game.customersServed >= 50
    ) {

        unlockAchievement(
            "50 Burgers Served"
        );

    }

    if (
        game.money >= 1000
    ) {

        unlockAchievement(
            "Burger Master"
        );

    }

    if (
        game.money >= 1000000
    ) {

        unlockAchievement(
            "Millionaire Chef"
        );

    }

}

/* =========================
   UPGRADES
========================= */

document
.getElementById(
    "grillUpgrade"
)
.addEventListener(
    "click",
    () => {

        if (
            game.money < 100
        ) return;

        game.money -= 100;

        game.grillSpeed +=
            0.5;

        notify(
            "Grill Upgraded!"
        );

        updateUI();

    }
);

document
.getElementById(
    "customerUpgrade"
)
.addEventListener(
    "click",
    () => {

        if (
            game.money < 150
        ) return;

        game.money -= 150;

        game.customerSpeed +=
            0.5;

        notify(
            "Customer Upgrade!"
        );

        updateUI();

    }
);

document
.getElementById(
    "reputationUpgrade"
)
.addEventListener(
    "click",
    () => {

        if (
            game.money < 200
        ) return;

        game.money -= 200;

        game.reputation += 10;

        notify(
            "Reputation Increased!"
        );

        updateUI();

    }
);

document
.getElementById(
    "speedUpgrade"
)
.addEventListener(
    "click",
    () => {

        if (
            game.money < 250
        ) return;

        game.money -= 250;

        game.assemblySpeed +=
            0.25;

        notify(
            "Assembly Speed Up!"
        );

        updateUI();

    }
);

/* =========================
   KITCHEN EXPANSION
========================= */

document
.getElementById(
    "kitchenUpgrade"
)
.addEventListener(
    "click",
    () => {

        if (
            game.money < 500
        ) return;

        game.money -= 500;

        const slot =
            document.createElement(
                "div"
            );

        slot.className =
            "grill-slot";

        slot.dataset.slot =
            document.querySelectorAll(
                ".grill-slot"
            ).length;

        slot.innerHTML = `
            <div class="grill-label">
                Empty Grill
            </div>

            <div class="cook-bar">
                <div class="cook-progress"></div>
            </div>
        `;

        grillArea.appendChild(
            slot
        );

        grillSlots.push(null);

        notify(
            "Kitchen Expanded!"
        );

        updateUI();

    }
);

/* =========================
   DAY SYSTEM
========================= */

setInterval(() => {

    if (
        game.customersServed > 0 &&
        game.customersServed %
        10 === 0
    ) {

        game.day++;

        updateUI();

    }

}, 5000);

/* =========================
   CONTINUE BUTTON
========================= */

document
.getElementById(
    "continueBtn"
)
.addEventListener(
    "click",
    () => {

        loadGame();

        mainMenu.classList.add(
            "hidden"
        );

        gameScreen.classList.remove(
            "hidden"
        );

        renderCustomers();
        renderBurger();
        renderGrill();
        updateUI();

    }
);

/* =========================
   RESET SAVE
========================= */

document
.getElementById(
    "resetBtn"
)
.addEventListener(
    "click",
    () => {

        if (
            confirm(
                "Delete save?"
            )
        ) {

            localStorage.removeItem(
                SAVE_KEY
            );

            location.reload();

        }

    }
);

/* =========================
   INITIAL SETUP
========================= */

grillSlots = [null];

renderGrill();
renderBurger();
renderCustomers();
updateUI();

notify(
    "Burger Cooking Simulator v0.1.0 Loaded!"
);