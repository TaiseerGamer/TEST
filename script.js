/* Coin & Crate - Game Logic */

const FOODS = [
    // COMMON
    { id:1, name:"Bread", emoji:"🍞", rarity:"common", desc:"Simple but filling" },
    { id:2, name:"Apple", emoji:"🍎", rarity:"common", desc:"Keeps the doctor away" },
    { id:3, name:"Egg", emoji:"🥚", rarity:"common", desc:"Protein packed" },
    { id:4, name:"Rice", emoji:"🍚", rarity:"common", desc:"Everyday staple" },
    { id:5, name:"Cheese", emoji:"🧀", rarity:"common", desc:"Mild and milky" },
    { id:6, name:"Carrot", emoji:"🥕", rarity:"common", desc:"Crunchy & fresh" },
    { id:7, name:"Pretzel", emoji:"🥨", rarity:"common", desc:"Salty twist" },
    { id:8, name:"Banana", emoji:"🍌", rarity:"common", desc:"Potassium boost" },

    // UNCOMMON
    { id:9, name:"Burger", emoji:"🍔", rarity:"uncommon", desc:"Juicy classic" },
    { id:10, name:"Pizza", emoji:"🍕", rarity:"uncommon", desc:"Cheesy perfection" },
    { id:11, name:"Taco", emoji:"🌮", rarity:"uncommon", desc:"Fiesta in a shell" },
    { id:12, name:"Sushi", emoji:"🍣", rarity:"uncommon", desc:"Fresh from the sea" },
    { id:13, name:"Fries", emoji:"🍟", rarity:"uncommon", desc:"Golden & crispy" },
    { id:14, name:"Hot Dog", emoji:"🌭", rarity:"uncommon", desc:"Ballpark favorite" },
    { id:15, name:"Donut", emoji:"🍩", rarity:"uncommon", desc:"Sweet ring of joy" },
    { id:16, name:"Croissant", emoji:"🥐", rarity:"uncommon", desc:"Buttery layers" },

    // RARE
    { id:17, name:"Ramen", emoji:"🍜", rarity:"rare", desc:"Steamy noodle soup" },
    { id:18, name:"Bento", emoji:"🍱", rarity:"rare", desc:"Perfectly packed" },
    { id:19, name:"Steak", emoji:"🥩", rarity:"rare", desc:"Sizzling & tender" },
    { id:20, name:"Lobster", emoji:"🦞", rarity:"rare", desc:"Ocean luxury" },
    { id:21, name:"Paella", emoji:"🥘", rarity:"rare", desc:"Spanish feast" },
    { id:22, name:"Avocado Toast", emoji:"🥑", rarity:"rare", desc:"Trendy & tasty" },

    // EPIC
    { id:23, name:"Birthday Cake", emoji:"🎂", rarity:"epic", desc:"Celebration time!" },
    { id:24, name:"Sundae", emoji:"🍨", rarity:"epic", desc:"Triple scoop dream" },
    { id:25, name:"Boba Tea", emoji:"🧋", rarity:"epic", desc:"Chewy pearls" },
    { id:26, name:"Mooncake", emoji:"🥮", rarity:"epic", desc:"Festival delicacy" },
    { id:27, name:"Curry Feast", emoji:"🍛", rarity:"epic", desc:"Spiced perfection" },

    // LEGENDARY
    { id:28, name:"Golden Apple", emoji:"🍎", rarity:"legendary", desc:"Mythical & shiny ✨", golden:true },
    { id:29, name:"Unicorn Parfait", emoji:"🦄", rarity:"legendary", desc:"Magic in a cup" },
    { id:30, name:"Dragon Roll", emoji:"🐉", rarity:"legendary", desc:"Legendary sushi roll" },
];

const BOXES = [
    {
        id:"snack",
        name:"Snack Crate",
        emoji:"📦",
        price:25,
        luck:"Low Luck",
        color:"#8a8a9a",
        rates:{ common:70, uncommon:24, rare:5, epic:1, legendary:0 },
        activeRarities:["common","uncommon","rare"]
    },
    {
        id:"tasty",
        name:"Tasty Crate",
        emoji:"🎁",
        price:150,
        luck:"Good Luck",
        color:"#60a5fa",
        rates:{ common:20, uncommon:45, rare:25, epic:9, legendary:1 },
        activeRarities:["common","uncommon","rare","epic"]
    },
    {
        id:"feast",
        name:"Feast Crate",
        emoji:"👑",
        price:750,
        luck:"INSANE LUCK",
        color:"#ffd700",
        rates:{ common:2, uncommon:13, rare:35, epic:35, legendary:15 },
        activeRarities:["uncommon","rare","epic","legendary"]
    }
];

let state = {
    money: 0,
    clickPower: 1,
    upgradePrice: 100,
    collection: {}, // id -> count
    boxesOpened: 0,
    clicks: 0,
    lastClickTime: 0,
    streak: 0
};

const els = {
    money: document.getElementById('moneyDisplay'),
    collection: document.getElementById('collectionDisplay'),
    coinBtn: document.getElementById('coinBtn'),
    floatContainer: document.getElementById('floatContainer'),
    boxesGrid: document.getElementById('boxesGrid'),
    collectionGrid: document.getElementById('collectionGrid'),
    filterTabs: document.getElementById('filterTabs'),
    clickPower: document.getElementById('clickPower'),
    streakDisplay: document.getElementById('streakDisplay'),
    upgradeBtn: document.getElementById('upgradeBtn'),
    upgradeCost: document.getElementById('upgradeCost'),
    modal: document.getElementById('openModal'),
    crateAnim: document.getElementById('crateAnim'),
    revealArea: document.getElementById('revealArea'),
    revealRarity: document.getElementById('revealRarity'),
    revealEmoji: document.getElementById('revealEmoji'),
    revealName: document.getElementById('revealName'),
    revealDesc: document.getElementById('revealDesc'),
    revealNew: document.getElementById('revealNew'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    toast: document.getElementById('toast')
};

function load(){
    const saved = localStorage.getItem('coinCrateSave');
    if(saved){
        try{
            const data = JSON.parse(saved);
            state = {...state, ...data};
        }catch{}
    }
}
function save(){
    localStorage.setItem('coinCrateSave', JSON.stringify(state));
}

function init(){
    load();
    renderBoxes();
    renderCollection();
    updateUI();
    setupEvents();
}

function setupEvents(){
    els.coinBtn.addEventListener('click', handleCoinClick);
    els.coinBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleCoinClick(e); }, {passive:false});
    els.upgradeBtn.addEventListener('click', buyUpgrade);
    els.closeModalBtn.addEventListener('click', closeModal);
    els.modal.addEventListener('click', (e)=>{ if(e.target===els.modal) closeModal(); });

    els.filterTabs.addEventListener('click', (e)=>{
        if(e.target.tagName!=='BUTTON') return;
        els.filterTabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        e.target.classList.add('active');
        renderCollection(e.target.dataset.filter);
    });
}

function handleCoinClick(e){
    const now = Date.now();
    const diff = now - state.lastClickTime;
    if(diff < 800){
        state.streak++;
    } else {
        state.streak = 1;
    }
    state.lastClickTime = now;
    state.clicks++;

    // bonus for streak
    let bonus = Math.floor(state.streak / 10);
    let earned = state.clickPower + bonus;

    state.money += earned;

    // visuals
    els.coinBtn.classList.remove('bounce');
    void els.coinBtn.offsetWidth;
    els.coinBtn.classList.add('bounce');

    spawnFloat(`+${earned}`, e);

    updateUI();
    save();

    // streak text
    if(state.streak >= 10){
        els.streakDisplay.textContent = `${state.streak}x STREAK! +${bonus} bonus 🔥`;
        els.streakDisplay.classList.add('hot');
    } else if(state.streak > 3){
        els.streakDisplay.textContent = `${state.streak}x combo!`;
    } else {
        els.streakDisplay.textContent = `Keep clicking! 🔥`;
        els.streakDisplay.classList.remove('hot');
    }
}

function spawnFloat(text, event){
    const el = document.createElement('div');
    el.className = 'float-money';
    el.textContent = text;
    // random offset
    const x = 50 + (Math.random()*40 -20);
    const y = 50 + (Math.random()*20 -10);
    el.style.left = x+'%';
    el.style.top = y+'%';
    els.floatContainer.appendChild(el);
    setTimeout(()=> el.remove(), 800);
}

function buyUpgrade(){
    if(state.money < state.upgradePrice){
        showToast("Not enough cash!");
        return;
    }
    state.money -= state.upgradePrice;
    state.clickPower++;
    state.upgradePrice = Math.floor(state.upgradePrice * 1.7);
    updateUI();
    save();
    showToast(`Tap power upgraded to +${state.clickPower}! ⬆️`);
}

function renderBoxes(){
    els.boxesGrid.innerHTML = '';
    BOXES.forEach(box=>{
        const card = document.createElement('div');
        card.className = 'box-card';
        card.dataset.id = box.id;

        const affordable = state.money >= box.price;
        if(affordable) card.classList.add('affordable');

        // bars visualization of rates
        const barsHtml = ['common','uncommon','rare','epic','legendary'].map(r=>{
            const active = box.activeRarities.includes(r) ? 'active' : '';
            // width proportional to rate?
            const w = box.rates[r];
            return `<div class="bar ${r} ${active}" style="flex:${w || 1}"></div>`;
        }).join('');

        card.innerHTML = `
            <div class="box-top">
                <div class="box-emoji">${box.emoji}</div>
                <div class="box-price">$${box.price}</div>
            </div>
            <div class="box-name">${box.name}</div>
            <div class="box-luck">${box.luck} • ${box.rates.legendary>0 ? box.rates.legendary+'% Legendary' : box.rates.epic+'% Epic+'}</div>
            <div class="box-bars">${barsHtml}</div>
        `;
        card.addEventListener('click', ()=> buyBox(box.id));
        els.boxesGrid.appendChild(card);
    });
}

function buyBox(id){
    const box = BOXES.find(b=>b.id===id);
    if(!box) return;
    if(state.money < box.price){
        showToast(`Need $${box.price - state.money} more!`);
        // shake
        const card = document.querySelector(`.box-card[data-id="${id}"]`);
        card.style.transform='translateX(-6px)';
        setTimeout(()=> card.style.transform='', 120);
        return;
    }
    state.money -= box.price;
    state.boxesOpened++;
    updateUI();
    openCrate(box);
    save();
}

function openCrate(box){
    // open modal
    els.modal.classList.remove('hidden');
    els.crateAnim.textContent = box.emoji;
    els.crateAnim.classList.remove('hidden');
    els.crateAnim.style.display='block';
    els.revealArea.classList.add('hidden');
    els.closeModalBtn.classList.add('hidden');

    // roll after animation
    setTimeout(()=>{
        const food = rollFood(box);
        const isNew = !state.collection[food.id];

        if(!state.collection[food.id]) state.collection[food.id]=0;
        state.collection[food.id]++;

        // reveal
        els.crateAnim.style.display='none';
        els.revealArea.classList.remove('hidden');
        els.revealArea.className = `reveal-area ${food.rarity}`;
        els.revealRarity.textContent = food.rarity;
        els.revealEmoji.textContent = food.emoji;
        if(food.golden) els.revealEmoji.textContent = '✨'+food.emoji+'✨';
        els.revealName.textContent = food.name;
        els.revealDesc.textContent = food.desc;
        els.revealNew.style.display = isNew ? 'inline-block' : 'none';
        els.closeModalBtn.classList.remove('hidden');

        if(food.rarity==='legendary'){
            confetti();
        }

        save();
        renderCollection(document.querySelector('#filterTabs .active')?.dataset.filter || 'all');
        updateUI();
    }, 1300);
}

function rollFood(box){
    const r = Math.random()*100;
    let cum = 0;
    let chosenRarity = 'common';
    for(const rarity of ['common','uncommon','rare','epic','legendary']){
        cum += box.rates[rarity] || 0;
        if(r < cum){
            chosenRarity = rarity;
            break;
        }
    }
    // get foods of that rarity
    const pool = FOODS.filter(f=>f.rarity===chosenRarity);
    // if pool empty (should not), fallback
    if(pool.length===0) return FOODS[0];
    return pool[Math.floor(Math.random()*pool.length)];
}

function closeModal(){
    els.modal.classList.add('hidden');
}

function renderCollection(filter='all'){
    els.collectionGrid.innerHTML='';
    let list = FOODS;
    if(filter!=='all'){
        list = FOODS.filter(f=>f.rarity===filter);
    }
    list.forEach(food=>{
        const count = state.collection[food.id] || 0;
        const collected = count>0;
        const card = document.createElement('div');
        card.className = `food-card ${food.rarity} ${collected?'collected':'locked'}`;
        card.innerHTML = `
            ${count>1? `<div class="food-count">x${count}</div>`:''}
            <div class="food-emoji">${collected? food.emoji : '❓'}</div>
            <div class="food-name">${collected? food.name : '???'}</div>
            <div class="food-rarity">${food.rarity}</div>
        `;
        if(collected){
            card.addEventListener('click', ()=>{
                showToast(`${food.name}: ${food.desc} • Found ${count}x`);
            });
        }
        els.collectionGrid.appendChild(card);
    });
}

function updateUI(){
    els.money.textContent = state.money;
    const collectedCount = Object.keys(state.collection).length;
    els.collection.textContent = `${collectedCount} / ${FOODS.length}`;
    els.clickPower.textContent = `+${state.clickPower}`;
    els.upgradeCost.textContent = `$${state.upgradePrice}`;
    els.upgradeBtn.disabled = state.money < state.upgradePrice;

    // update boxes affordability
    document.querySelectorAll('.box-card').forEach(card=>{
        const box = BOXES.find(b=>b.id===card.dataset.id);
        if(state.money >= box.price) card.classList.add('affordable');
        else card.classList.remove('affordable');
    });
}

function showToast(msg){
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> els.toast.classList.remove('show'), 2500);
}

function confetti(){
    // simple emoji confetti
    for(let i=0;i<18;i++){
        setTimeout(()=>{
            const el = document.createElement('div');
            el.textContent = ['🎉','✨','💫','⭐','🌟'][Math.floor(Math.random()*5)];
            el.style.position='fixed';
            el.style.left = (50 + (Math.random()*60-30))+'%';
            el.style.top = '50%';
            el.style.fontSize = (18+Math.random()*20)+'px';
            el.style.pointerEvents='none';
            el.style.zIndex='100';
            el.style.transition='all 1s cubic-bezier(.25,.46,.45,.94)';
            document.body.appendChild(el);
            requestAnimationFrame(()=>{
                el.style.transform = `translate(${(Math.random()*400-200)}px, ${(Math.random()* -300 -100)}px) rotate(${Math.random()*720}deg)`;
                el.style.opacity='0';
            });
            setTimeout(()=> el.remove(), 1000);
        }, i*60);
    }
}

// init
init();