/**
 * Supermarket Tycoon - Core System Script Engine
 */

// Global App State Object Instance
let gameState = {
    cash: 0,
    lifetimeCash: 0,
    shares: 0,
    aisles: {
        produce: { level: 0, baseCost: 10, baseIncome: 1, name: "Produce Section" },
        bakery: { level: 0, baseCost: 100, baseIncome: 8, name: "Fresh Bakery" },
        dairy: { level: 0, baseCost: 1100, baseIncome: 45, name: "Dairy Aisle" },
        meat: { level: 0, baseCost: 12000, baseIncome: 260, name: "Meat & Seafood" },
        electronics: { level: 0, baseCost: 130000, baseIncome: 1400, name: "Electronics Dept" }
    },
    staff: {
        cashier: { level: 0, cost: 50, multiplier: 0.15, purchased: false, name: "Express Cashiers", desc: "+15% click rate bonus per tier" },
        stocker: { level: 0, cost: 400, multiplier: 1.10, purchased: false, name: "Aisle Stockers", desc: "Boosts all core passive outputs by 10%" },
        manager: { level: 0, cost: 5000, multiplier: 1.50, purchased: false, name: "Floor Managers", desc: "Automates scaling operations (+50% output)" }
    },
    upgrades: {
        expressLanes: { purchased: false, cost: 750, multiplier: 2.0, name: "Express Checkout Lanes", desc: "Doubles physical clicking efficiency value" },
        refrigeration: { purchased: false, cost: 8500, multiplier: 1.25, name: "Sub-Zero Coolers", desc: "Improves fresh sections yields by 25%" },
        supplyChain: { purchased: false, cost: 95000, multiplier: 1.50, name: "Just-In-Time Logistics", desc: "Global layout infrastructure boost of 50%" }
    }
};

// Initial Config Reference State for Reset Logic Execution
const baseStateString = JSON.stringify(gameState);

// UI Formatting Engine
function formatNumber(num) {
    if (num < 0) return "$0.00";
    if (num < 1000) return `$${num.toFixed(2)}`;
    
    const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
    const i = Math.floor(Math.log10(num) / 3);
    const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return `$${formatted}${units[i]}`;
}

// Compute System Multipliers & Secondary Calculations
function getGlobalMultiplier() {
    // Each Corporate Share provides a compounding +2% global income yield
    return 1 + (gameState.shares * 0.02);
}

function getClickValue() {
    let value = 1; // Base manual click value baseline
    const totalPps = getPassiveIncomeRate();
    
    // Manual click gains a 10% boost derived from continuous operational baseline yields
    value += (totalPps * 0.10);
    
    if (gameState.upgrades.expressLanes.purchased) {
        value *= gameState.upgrades.expressLanes.multiplier;
    }
    
    // Add Tier Scaling Cashier Staff Level Multipliers
    value += (gameState.staff.cashier.level * gameState.staff.cashier.multiplier);
    
    return value * getGlobalMultiplier();
}

function getAisleIncome(id) {
    const aisle = gameState.aisles[id];
    if (aisle.level === 0) return 0;
    
    let income = aisle.baseIncome * aisle.level;
    
    // Apply Stocker Unit Adjustments
    if (gameState.staff.stocker.level > 0) {
        income *= Math.pow(gameState.staff.stocker.multiplier, gameState.staff.stocker.level);
    }
    
    // Apply Operational Manager Multiplier Adjustments
    if (gameState.staff.manager.level > 0) {
        income *= Math.pow(gameState.staff.manager.multiplier, gameState.staff.manager.level);
    }
    
    // Apply Targeted Infrastructure Module Adjustments
    if (id === 'produce' || id === 'dairy' || id === 'meat') {
        if (gameState.upgrades.refrigeration.purchased) {
            income *= gameState.upgrades.refrigeration.multiplier;
        }
    }
    
    if (gameState.upgrades.supplyChain.purchased) {
        income *= gameState.upgrades.supplyChain.multiplier;
    }
    
    return income * getGlobalMultiplier();
}

function getPassiveIncomeRate() {
    let total = 0;
    Object.keys(gameState.aisles).forEach(id => {
        total += getAisleIncome(id);
    });
    return total;
}

function getAisleCost(id) {
    const aisle = gameState.aisles[id];
    return aisle.baseCost * Math.pow(1.15, aisle.level);
}

function getStaffCost(id) {
    const staff = gameState.staff[id];
    return staff.cost * Math.pow(1.65, staff.level);
}

function calculatePendingShares() {
    // Formula calculating corporate equity based on lifetime valuation totals
    if (gameState.lifetimeCash < 100000) return 0;
    const earnedShares = Math.floor(Math.sqrt(gameState.lifetimeCash / 100000));
    return Math.max(0, earnedShares - gameState.shares);
}

function getNextShareCost() {
    const currentTotalTarget = Math.pow(gameState.shares + 1, 2) * 100000;
    return currentTotalTarget;
}

// Visual DOM Update Synchronization System
function updateUI() {
    // Sync Dashboard Stat Cards
    document.getElementById("cash-display").innerText = formatNumber(gameState.cash);
    document.getElementById("pps-display").innerText = `${formatNumber(getPassiveIncomeRate())}/sec`;
    document.getElementById("shares-display").innerText = `${gameState.shares} (+${(gameState.shares * 2).toFixed(0)}% Boost)`;
    document.getElementById("click-value-display").innerText = `+${formatNumber(getClickValue())}`;
    
    // Render Active Tab Content Panes Safely
    renderAislesTab();
    renderStaffTab();
    renderUpgradesTab();
    renderCorporateTab();
}

function renderAislesTab() {
    const listContainer = document.getElementById("aisles-list");
    const monitorsContainer = document.getElementById("aisle-monitors");
    
    let listHTML = "";
    let monitorHTML = "";
    
    Object.keys(gameState.aisles).forEach(id => {
        const aisle = gameState.aisles[id];
        const cost = getAisleCost(id);
        const income = getAisleIncome(id);
        const canAfford = gameState.cash >= cost;
        
        listHTML += `
            <div class="upgrade-card">
                <div class="card-details">
                    <span class="card-title">${aisle.name} [Lv. ${aisle.level}]</span>
                    <span class="card-meta">Yields: ${formatNumber(income)}/sec (Base: ${formatNumber(aisle.baseIncome)}/sec)</span>
                </div>
                <button class="action-btn" onclick="buyAisle('${id}')" ${!canAfford ? 'disabled' : ''}>
                    Buy Space <br> ${formatNumber(cost)}
                </button>
            </div>
        `;
        
        // Populate left-hand action panel monitoring display indicators
        if (aisle.level > 0) {
            monitorHTML += `
                <div class="monitor-row">
                    <div class="monitor-info">
                        <span class="monitor-name">${aisle.name}</span>
                        <span class="monitor-rate">${formatNumber(income)}/sec</span>
                    </div>
                    <div class="progress-track">
                        <div id="progress-${id}" class="progress-bar"></div>
                    </div>
                </div>
            `;
        }
    });
    
    if(monitorHTML === "") {
        monitorHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No automated systems active. Buy custom departments inside the operational dashboard tabs.</p>`;
    }
    
    listContainer.innerHTML = listHTML;
    monitorsContainer.innerHTML = monitorHTML;
}

function renderStaffTab() {
    const container = document.getElementById("staff-list");
    let html = "";
    
    Object.keys(gameState.staff).forEach(id => {
        const item = gameState.staff[id];
        const cost = getStaffCost(id);
        const canAfford = gameState.cash >= cost;
        
        html += `
            <div class="upgrade-card">
                <div class="card-details">
                    <span class="card-title">${item.name} [Lv. ${item.level}]</span>
                    <span class="card-meta">${item.desc}</span>
                </div>
                <button class="action-btn" onclick="buyStaff('${id}')" ${!canAfford ? 'disabled' : ''}>
                    Hire Worker <br> ${formatNumber(cost)}
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function renderUpgradesTab() {
    const container = document.getElementById("upgrades-list");
    let html = "";
    
    Object.keys(gameState.upgrades).forEach(id => {
        const up = gameState.upgrades[id];
        
        if (up.purchased) {
            html += `
                <div class="upgrade-card maxed">
                    <div class="card-details">
                        <span class="card-title" style="text-decoration: line-through; color: var(--text-muted);">${up.name}</span>
                        <span class="card-meta" style="color: var(--accent-money);">Operational Efficiency Achieved</span>
                    </div>
                    <button class="action-btn" disabled>Acquired</button>
                </div>
            `;
        } else {
            const canAfford = gameState.cash >= up.cost;
            html += `
                <div class="upgrade-card">
                    <div class="card-details">
                        <span class="card-title">${up.name}</span>
                        <span class="card-meta">${up.desc}</span>
                    </div>
                    <button class="action-btn" onclick="buyUpgrade('${id}')" ${!canAfford ? 'disabled' : ''}>
                        Procure <br> ${formatNumber(up.cost)}
                    </button>
                </div>
            `;
        }
    });
    container.innerHTML = html;
}

function renderCorporateTab() {
    const pending = calculatePendingShares();
    document.getElementById("lifetime-cash").innerText = formatNumber(gameState.lifetimeCash);
    document.getElementById("pending-shares").innerText = `${pending} Corporate Shares`;
    document.getElementById("next-share-cost").innerText = formatNumber(getNextShareCost());
    
    const prestigeBtn = document.getElementById("prestige-btn");
    if (pending > 0) {
        prestigeBtn.removeAttribute("disabled");
    } else {
        prestigeBtn.setAttribute("disabled", "true");
    }
}

// System Operations Logic Interaction Routing Functions
function buyAisle(id) {
    const cost = getAisleCost(id);
    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.aisles[id].level++;
        updateUI();
    }
}

function buyStaff(id) {
    const cost = getStaffCost(id);
    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.staff[id].level++;
        updateUI();
    }
}

function buyUpgrade(id) {
    const up = gameState.upgrades[id];
    if (gameState.cash >= up.cost && !up.purchased) {
        gameState.cash -= up.cost;
        up.purchased = true;
        updateUI();
    }
}

// Liquidate Progress for Corporate Shares (Prestige)
function triggerCorporatePrestige() {
    const pending = calculatePendingShares();
    if (pending > 0) {
        if(confirm(`Are you ready to liquidate your current supermarket assets? You will claim ${pending} Corporate Shares and reset progress, gaining a permanent compounding baseline efficiency multiplier.`)) {
            gameState.shares += pending;
            
            // Clean Reset of core production metrics back to base properties
            const savedShares = gameState.shares;
            const savedLifetime = gameState.lifetimeCash;
            
            // Re-instantiate pristine object tree mapping structural variables
            gameState = JSON.parse(baseStateString);
            gameState.shares = savedShares;
            gameState.lifetimeCash = savedLifetime;
            
            saveGameData();
            updateUI();
        }
    }
}

// User Action Manual Click Click-Capture Interface Handler
document.getElementById("click-btn").addEventListener("click", (e) => {
    const value = getClickValue();
    gameState.cash += value;
    gameState.lifetimeCash += value;
    
    // Render dynamic floating money context elements
    createFloatingText(e.clientX, e.clientY, `+${formatNumber(value)}`);
    updateUI();
});

function createFloatingText(x, y, str) {
    const el = document.createElement("div");
    el.className = "floating-text";
    el.innerText = str.split('.')[0]; // Display clean, integer-focused values for visual sleekness
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, 800);
}

// Interactive Layout Automation Tab Switching Engine
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        
        btn.classList.add("active");
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
});

// Storage and Persistence Drivers
function saveGameData() {
    localStorage.setItem("supermarket_tycoon_save_state", JSON.stringify(gameState));
    const status = document.getElementById("autosave-status");
    status.innerText = "Progress Saved Successfully";
    setTimeout(() => {
        status.innerText = "System Operational";
    }, 2000);
}

function loadGameData() {
    const data = localStorage.getItem("supermarket_tycoon_save_state");
    if (data) {
        try {
            const loadedState = JSON.parse(data);
            // Dynamic deeply nested deep-merge tracking properties protection array parsing
            Object.keys(loadedState).forEach(key => {
                if (typeof loadedState[key] === 'object' && loadedState[key] !== null) {
                    gameState[key] = { ...gameState[key], ...loadedState[key] };
                } else {
                    gameState[key] = loadedState[key];
                }
            });
        } catch (e) {
            console.error("Critical error reconstructing persistent browser storage indices", e);
        }
    }
    updateUI();
}

function triggerHardReset() {
    if (confirm("CRITICAL WARNING: This action will permanently erase your supermarket, staff hires, upgrades, and corporate shares. Are you absolute certain you wish to start over from scratch?")) {
        localStorage.removeItem("supermarket_tycoon_save_state");
        window.location.reload();
    }
}

// Document Event Attachment Mapping Initialization Hooks
document.getElementById("save-btn").addEventListener("click", saveGameData);
document.getElementById("reset-btn").addEventListener("click", triggerHardReset);
document.getElementById("prestige-btn").addEventListener("click", triggerCorporatePrestige);

// Dynamic 100ms High Frequency Delta Calculation Game Loop Engine
let progressTrackers = {};
const tickRateMs = 100;

setInterval(() => {
    // Generate automated passive yields split up over 10 ticks per continuous second metrics
    const pps = getPassiveIncomeRate();
    const tickCash = pps / (1000 / tickRateMs);
    
    gameState.cash += tickCash;
    gameState.lifetimeCash += tickCash;
    
    // Drive continuous visual timeline filling elements for unlocked monitoring views
    Object.keys(gameState.aisles).forEach(id => {
        const aisle = gameState.aisles[id];
        if (aisle.level > 0) {
            if (!progressTrackers[id]) progressTrackers[id] = 0;
            
            // Step loop tracks relative to simulated frequency rates
            progressTrackers[id] += (tickRateMs / 10); 
            if (progressTrackers[id] >= 100) {
                progressTrackers[id] = 0;
            }
            
            const bar = document.getElementById(`progress-${id}`);
            if (bar) {
                bar.style.width = `${progressTrackers[id]}%`;
            }
        }
    });

    // Update financial status boxes without running complex full DOM rebuild passes
    document.getElementById("cash-display").innerText = formatNumber(gameState.cash);
    document.getElementById("pps-display").innerText = `${formatNumber(getPassiveIncomeRate())}/sec`;
    
    // Check click values dynamically as income scales
    document.getElementById("click-value-display").innerText = `+${formatNumber(getClickValue())}`;
}, tickRateMs);

// Low-Frequency Interface Redraw Loop
setInterval(() => {
    updateUI();
}, 1000);

// Auto-Save Management Timer Loop
setInterval(() => {
    saveGameData();
}, 10000);

// Run Initialization Core Launch Hooks
window.onload = () => {
    loadGameData();
};