/* ==========================
   BURGER EMPIRE
   SCRIPT.JS
   PART 3A
========================== */

const game = {

    coins: 0,
    xp: 0,
    level: 1,

    reputation: 50,

    combo: 1,

    customersServed: 0,

    challengeProgress: 0,

    grillSpeed: 1,

    customerSpawnRate: 12000,

    currentBurger: [],

    customers: [],

    achievements: [],

    dayTime: true

};

/* ==========================
   DOM
========================== */

const coinsEl = document.getElementById("coins");
const xpEl = document.getElementById("xp");
const levelEl = document.getElementById("level");
const repEl = document.getElementById("reputation");
const comboEl = document.getElementById("combo");
const xpBar = document.getElementById("xpBar");

const customersContainer =
document.getElementById("customers");

const challengeProgressEl =
document.getElementById("challengeProgress");

const saveIndicator =
document.getElementById("saveIndicator");

/* ==========================
   ORDER POOL
========================== */

const orderPool = [

[
"Burger Bun",
"Beef Patty",
"Cheese"
],

[
"Burger Bun",
"Beef Patty",
"Lettuce",
"Tomato"
],

[
"Burger Bun",
"Veggie Patty",
"Onion"
],

[
"Burger Bun",
"Beef Patty",
"Bacon"
],

[
"Burger Bun",
"Beef Patty",
"Cheese",
"Pickles"
],

[
"Burger Bun",
"Beef Patty",
"Cheese",
"BBQ Sauce"
],

[
"Burger Bun",
"Veggie Patty",
"Lettuce",
"Tomato"
],

[
"Burger Bun",
"Beef Patty",
"Cheese",
"Bacon",
"Onion"
]

];

/* ==========================
   UPDATE HUD
========================== */

function updateHUD(){

    coinsEl.textContent =
    Math.floor(game.coins);

    xpEl.textContent =
    Math.floor(game.xp);

    levelEl.textContent =
    game.level;

    repEl.textContent =
    game.reputation;

    comboEl.textContent =
    "x" + game.combo;

    const needed =
    game.level * 100;

    xpBar.style.width =
    (game.xp / needed * 100) + "%";
}

/* ==========================
   XP SYSTEM
========================== */

function addXP(amount){

    game.xp += amount;

    while(
        game.xp >=
        game.level * 100
    ){

        game.xp -=
        game.level * 100;

        game.level++;

        popup(
            "LEVEL " + game.level,
            window.innerWidth / 2,
            120
        );

        game.reputation += 2;
    }

    updateHUD();
}

/* ==========================
   MONEY SYSTEM
========================== */

function addCoins(amount){

    game.coins += amount;

    popup(
        "+" + amount + " 💰",
        250,
        100
    );

    updateHUD();
}

/* ==========================
   REPUTATION
========================== */

function changeReputation(value){

    game.reputation += value;

    if(game.reputation < 0)
        game.reputation = 0;

    if(game.reputation > 100)
        game.reputation = 100;

    updateHUD();
}

/* ==========================
   POPUPS
========================== */

function popup(text,x,y){

    const div =
    document.createElement("div");

    div.className =
    "popup";

    div.textContent =
    text;

    div.style.left =
    x + "px";

    div.style.top =
    y + "px";

    document
    .getElementById(
        "floatingContainer"
    )
    .appendChild(div);

    setTimeout(() => {

        div.remove();

    },1500);

}

/* ==========================
   RANDOM CUSTOMER TYPE
========================== */

function getCustomerType(){

    const roll =
    Math.random();

    if(roll < .08)
        return "vip";

    if(roll < .15)
        return "critic";

    if(roll < .25)
        return "speed";

    return "normal";
}

/* ==========================
   CREATE CUSTOMER
========================== */

function createCustomer(){

    const customer = {

        id:
        Date.now() +
        Math.random(),

        type:
        getCustomerType(),

        patience: 100,

        order:
        structuredClone(
            orderPool[
                Math.floor(
                    Math.random()
                    *
                    orderPool.length
                )
            ]
        )

    };

    if(
        customer.type ===
        "speed"
    ){
        customer.patience = 70;
    }

    if(
        customer.type ===
        "vip"
    ){
        customer.order.push(
            "Cheese"
        );
    }

    game.customers.push(
        customer
    );

    renderCustomers();
}

/* ==========================
   CUSTOMER RENDER
========================== */

function renderCustomers(){

    customersContainer.innerHTML =
    "";

    game.customers.forEach(
        customer => {

        const card =
        document.createElement("div");

        card.className =
        "customer " +
        customer.type;

        card.dataset.id =
        customer.id;

        card.innerHTML =

        `
        <div class="customerName">
        ${
            customer.type
            .toUpperCase()
        }
        CUSTOMER
        </div>

        <div class="orderText">
        ${customer.order.join(" + ")}
        </div>

        <div class="patienceBar">
            <div
            class="patienceFill"
            style="
            width:
            ${customer.patience}%">
            </div>
        </div>
        `;

        customersContainer
        .appendChild(card);

    });

}

/* ==========================
   PATIENCE SYSTEM
========================== */

setInterval(() => {

    game.customers.forEach(
        customer => {

        let loss = .5;

        if(
            customer.type
            === "speed"
        ){
            loss = 1.2;
        }

        customer.patience -=
        loss;

        if(
            customer.patience <= 0
        ){

            failCustomer(
                customer.id
            );

        }

    });

    renderCustomers();

},500);

/* ==========================
   CUSTOMER FAIL
========================== */

function failCustomer(id){

    const index =
    game.customers.findIndex(
        c => c.id === id
    );

    if(index === -1)
        return;

    game.customers.splice(
        index,
        1
    );

    game.combo = 1;

    changeReputation(-5);

    popup(
        "ANGRY CUSTOMER",
        300,
        120
    );

    renderCustomers();
}

/* ==========================
   CUSTOMER SPAWNING
========================== */

function startCustomerSpawner(){

    createCustomer();

    setInterval(() => {

        if(
            game.customers.length < 5
        ){
            createCustomer();
        }

    }, game.customerSpawnRate);

}

/* ==========================
   CHALLENGE SYSTEM
========================== */

function updateChallenge(){

    challengeProgressEl
    .textContent =

    game.challengeProgress +
    " / 5";

}

/* ==========================
   SAVE SYSTEM
========================== */

function saveGame(){

    localStorage.setItem(
        "burgerEmpireSave",
        JSON.stringify(game)
    );

    saveIndicator
    .classList.add("show");

    setTimeout(() => {

        saveIndicator
        .classList
        .remove("show");

    },1500);

}

/* ==========================
   LOAD SYSTEM
========================== */

function loadGame(){

    const save =
    localStorage.getItem(
        "burgerEmpireSave"
    );

    if(!save)
        return;

    const data =
    JSON.parse(save);

    Object.assign(
        game,
        data
    );

    updateHUD();
    renderCustomers();
    updateChallenge();

}

/* ==========================
   AUTOSAVE
========================== */

setInterval(() => {

    saveGame();

},30000);

/* ==========================
   DAY / NIGHT
========================== */

setInterval(() => {

    game.dayTime =
    !game.dayTime;

    document.body
    .classList.toggle(
        "night",
        !game.dayTime
    );

},120000);

/* ==========================
   START GAME
========================== */

loadGame();

updateHUD();

updateChallenge();

startCustomerSpawner();

/* ==========================
   PART 3B
   COOKING + ASSEMBLY
========================== */

/* ==========================
   GRILL DATA
========================== */

const grillSlots = [
    null,
    null,
    null,
    null
];

const grillElements =
document.querySelectorAll(".grill-slot");

/* ==========================
   PATTY BUTTONS
========================== */

const spawnBeef =
document.getElementById("spawnBeef");

const spawnChicken =
document.getElementById("spawnChicken");

const spawnVeggie =
document.getElementById("spawnVeggie");

if(spawnBeef){
    spawnBeef.addEventListener(
        "click",
        () => addPatty("Beef Patty")
    );
}

if(spawnChicken){
    spawnChicken.addEventListener(
        "click",
        () => addPatty("Chicken Patty")
    );
}

if(spawnVeggie){
    spawnVeggie.addEventListener(
        "click",
        () => addPatty("Veggie Patty")
    );
}

/* ==========================
   ADD PATTY TO GRILL
========================== */

function addPatty(type){

    const empty =
    grillSlots.findIndex(
        slot => slot === null
    );

    if(empty === -1){
        popup(
            "NO FREE GRILL!",
            400,
            150
        );
        return;
    }

    grillSlots[empty] = {

        type:type,

        progress:0,

        state:"raw"

    };

    renderGrill();
}

/* ==========================
   RENDER GRILL
========================== */

function renderGrill(){

    grillElements.forEach(
        (slotEl,index) => {

        slotEl.innerHTML = "";

        const patty =
        grillSlots[index];

        if(!patty)
            return;

        const div =
        document.createElement("div");

        div.className =
        "patty " +
        patty.state;

        div.textContent =
        patty.type
        .replace(" Patty","");

        div.addEventListener(
            "click",
            () => collectPatty(index)
        );

        slotEl.appendChild(div);

    });

}

/* ==========================
   COOKING LOOP
========================== */

setInterval(() => {

    grillSlots.forEach(
        patty => {

        if(!patty)
            return;

        patty.progress +=
        1 * game.grillSpeed;

        if(
            patty.progress < 5
        ){
            patty.state =
            "raw";
        }

        else if(
            patty.progress < 10
        ){
            patty.state =
            "cooking";
        }

        else if(
            patty.progress < 16
        ){
            patty.state =
            "perfect";
        }

        else{
            patty.state =
            "burnt";
        }

    });

    renderGrill();

},1000);

/* ==========================
   COLLECT PATTY
========================== */

function collectPatty(index){

    const patty =
    grillSlots[index];

    if(!patty)
        return;

    if(
        patty.state ===
        "burnt"
    ){

        popup(
            "BURNT!",
            350,
            100
        );

        grillSlots[index] =
        null;

        renderGrill();

        return;
    }

    if(
        patty.state !==
        "perfect"
    ){

        popup(
            "NOT READY",
            350,
            100
        );

        return;
    }

    addIngredientToBurger(
        patty.type
    );

    grillSlots[index] =
    null;

    renderGrill();

}

/* ==========================
   BURGER STACK
========================== */

const burgerStack =
document.getElementById(
    "burgerStack"
);

const clearBurgerBtn =
document.getElementById(
    "clearBurger"
);

/* ==========================
   INGREDIENT DRAG
========================== */

let draggedIngredient =
null;

document
.querySelectorAll(
".ingredient"
)
.forEach(item => {

    item.addEventListener(
        "dragstart",
        e => {

        draggedIngredient =
        item.dataset.name;

    });

});

/* ==========================
   DROP AREA
========================== */

burgerStack.addEventListener(
    "dragover",
    e => {

    e.preventDefault();

});

burgerStack.addEventListener(
    "drop",
    e => {

    e.preventDefault();

    if(
        draggedIngredient
    ){

        addIngredientToBurger(
            draggedIngredient
        );

    }

});

/* ==========================
   ADD INGREDIENT
========================== */

function addIngredientToBurger(
ingredient
){

    game.currentBurger.push(
        ingredient
    );

    renderBurgerStack();

}

/* ==========================
   RENDER STACK
========================== */

function renderBurgerStack(){

    burgerStack.innerHTML =
    "";

    if(
        game.currentBurger
        .length === 0
    ){

        burgerStack.innerHTML =
        `
        <p class="placeholder">
        Drag ingredients here
        </p>
        `;

        return;
    }

    game.currentBurger.forEach(
        ingredient => {

        const item =
        document.createElement("div");

        item.className =
        "stackItem";

        item.textContent =
        ingredient;

        burgerStack.appendChild(
            item
        );

    });

}

/* ==========================
   CLEAR BURGER
========================== */

clearBurgerBtn
.addEventListener(
    "click",
    () => {

    game.currentBurger = [];

    renderBurgerStack();

});

/* ==========================
   MOBILE TAP SUPPORT
========================== */

document
.querySelectorAll(
".ingredient"
)
.forEach(item => {

    item.addEventListener(
        "click",
        () => {

        addIngredientToBurger(
            item.dataset.name
        );

    );

});

/* ==========================
   INITIALIZE
========================== */

renderGrill();

renderBurgerStack();

/* ==========================
   PART 3C
   SERVING + PROGRESSION
========================== */

/* ==========================
   SERVE BUTTON
========================== */

const serveBtn =
document.getElementById("serveBurger");

serveBtn.addEventListener(
    "click",
    serveBurger
);

/* ==========================
   SERVE LOGIC
========================== */

function serveBurger(){

    if(game.currentBurger.length === 0){
        popup("EMPTY BURGER", 300, 120);
        return;
    }

    const customer =
    game.customers[0];

    if(!customer){
        popup("NO CUSTOMERS", 300, 120);
        return;
    }

    const match =
    compareOrders(
        game.currentBurger,
        customer.order
    );

    if(match.correct){

        handleSuccess(
            customer,
            match.score
        );

    } else {

        handleFail(customer);

    }

    game.currentBurger = [];
    renderBurgerStack();

}

/* ==========================
   ORDER COMPARISON
========================== */

function compareOrders(burger,order){

    const b = [...burger].sort();
    const o = [...order].sort();

    let score = 0;

    if(b.length !== o.length){
        return { correct:false, score:0 };
    }

    for(let i=0;i<b.length;i++){

        if(b[i] === o[i]){
            score++;
        }

    }

    const perfect =
    score === order.length;

    return {
        correct: perfect,
        score: score / order.length
    };

}

/* ==========================
   SUCCESS
========================== */

function handleSuccess(customer,score){

    let reward =
    10 * score;

    let coinReward =
    10 * score;

    if(customer.type === "vip"){
        reward *= 3;
        coinReward *= 3;
    }

    if(customer.type === "critic"){
        changeReputation(5);
    }

    if(customer.type === "speed"){
        reward *= 1.5;
        coinReward *= 1.5;
    }

    addXP(reward);
    addCoins(coinReward);

    game.combo++;
    game.customersServed++;
    game.challengeProgress++;

    popup("ORDER SERVED!", 320, 120);

    removeCustomer(customer.id);

    checkAchievements();
    updateChallenge();
}

/* ==========================
   FAIL SERVE
========================== */

function handleFail(customer){

    changeReputation(-10);

    game.combo = 1;

    popup("WRONG ORDER!", 320, 120);

    removeCustomer(customer.id);
}

/* ==========================
   REMOVE CUSTOMER
========================== */

function removeCustomer(id){

    game.customers =
    game.customers.filter(
        c => c.id !== id
    );

    renderCustomers();
}

/* ==========================
   UPGRADES
========================== */

const upgradeGrill =
document.getElementById("upgradeGrill");

const upgradeSpawn =
document.getElementById("upgradeSpawn");

const upgradeRep =
document.getElementById("upgradeRep");

upgradeGrill.addEventListener(
    "click",
    () => {

    if(game.coins < 50){
        popup("NOT ENOUGH COINS", 300, 120);
        return;
    }

    game.coins -= 50;
    game.grillSpeed += 0.5;

    popup("GRILL FASTER!", 300, 120);

    updateHUD();

});

upgradeSpawn.addEventListener(
    "click",
    () => {

    if(game.coins < 100){
        popup("NOT ENOUGH COINS", 300, 120);
        return;
    }

    game.coins -= 100;
    game.customerSpawnRate =
    Math.max(5000, game.customerSpawnRate - 2000);

    popup("MORE CUSTOMERS!", 300, 120);

    updateHUD();

    startCustomerSpawner();

});

upgradeRep.addEventListener(
    "click",
    () => {

    if(game.coins < 75){
        popup("NOT ENOUGH COINS", 300, 120);
        return;
    }

    game.coins -= 75;
    game.reputation += 10;

    popup("REPUTATION BOOST!", 300, 120);

    updateHUD();

});

/* ==========================
   ACHIEVEMENTS
========================== */

function checkAchievements(){

    if(game.customersServed >= 1){
        unlock("🍔 First Burger");
    }

    if(game.customersServed >= 10){
        unlock("👨‍🍳 Master Chef");
    }

    if(game.customersServed >= 25){
        unlock("🔥 Grill Expert");
    }

}

/* ==========================
   UNLOCK SYSTEM
========================== */

function unlock(name){

    if(game.achievements.includes(name))
        return;

    game.achievements.push(name);

    popup("ACHIEVEMENT: " + name, 320, 140);

}

/* ==========================
   COMBO TIMER RESET
========================== */

setInterval(() => {

    game.combo = 1;
    updateHUD();

},15000);

/* ==========================
   AUTO SAVE FINAL
========================== */

setInterval(() => {

    saveGame();

},10000);

/* ==========================
   FINAL INIT FIXES
========================== */

updateHUD();
renderCustomers();
renderBurgerStack();
renderGrill();