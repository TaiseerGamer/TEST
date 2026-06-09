// --- Recipes Data Models ---
const DICTIONARY_BURGER_RECIPES = [
    {
        id: "classic_cheese",
        name: "Classic Cheeseburger",
        ingredients: ["bun_bottom", "patty", "cheese", "lettuce", "tomato", "bun_top"]
    },
    {
        id: "bacon_beast",
        name: "Bacon Beast Burger",
        ingredients: ["bun_bottom", "patty", "cheese", "bacon", "patty", "cheese", "bacon", "bun_top"]
    },
    {
        id: "green_garden",
        name: "Garden Fresh Stack",
        ingredients: ["bun_bottom", "lettuce", "tomato", "patty", "lettuce", "tomato", "bun_top"]
    },
    {
        id: "bbq_triple",
        name: "BBQ Triple Stack",
        ingredients: ["bun_bottom", "patty", "cheese", "patty", "cheese", "patty", "cheese", "sauce", "bun_top"]
    },
    {
        id: "blt_crunch",
        name: "Crispy BLT Burger",
        ingredients: ["bun_bottom", "sauce", "patty", "bacon", "lettuce", "tomato", "bun_top"]
    }
];

// --- Global Simulation Engine States ---
let simState = {
    activeRecipeIndex: 0,
    timer: 0,
    heat: 'low',
    facingDown: 'A',
    sideA: 0,
    sideB: 0,
    assemblyStack: [],
    // Tracks the state of the *most recent* cooked patty pulled off the grill
    latestPlatedPatty: { cookedA: 0, cookedB: 0 } 
};

const configRates = { low: 0.8, med: 1.8, high: 3.5 };
const configGlows = { low: 0.15, med: 0.45, high: 0.85 };

let engineLoop = null;
let visualFumeLoop = null;

// --- DOM Elements Reference Tree ---
const physicalPatty = document.getElementById('physicalPatty');
const pattyHitbox = document.getElementById('pattyHitbox');
const sideVisualTag = document.getElementById('sideVisualTag');
const heatGlow = document.getElementById('heatGlow');
const grillArea = document.querySelector('.grill-area');
const burgerStackContainer = document.getElementById('burgerStackContainer');
const recipeList = document.getElementById('recipeList');

const telemetryTime = document.getElementById('telemetryTime');
const telemetryA = document.getElementById('telemetryA');
const telemetryB = document.getElementById('telemetryB');
const stackCount = document.getElementById('stackCount');

const evalWindow = document.getElementById('evalWindow');
const evalStars = document.getElementById('evalStars');
const evalTitle = document.getElementById('evalTitle');
const evalDesc = document.getElementById('evalDesc');
const lblTargetName = document.getElementById('lblTargetName');
const lblPattyScore = document.getElementById('lblPattyScore');
const lblAssemblyScore = document.getElementById('lblAssemblyScore');
const lblCombinedScore = document.getElementById('lblCombinedScore');

// --- Application Construction & Initialization ---
function initApp() {
    renderRecipesPanel();
    bindInputEventListeners();
    startKitchenLoop();
}

function renderRecipesPanel() {
    recipeList.innerHTML = "";
    DICTIONARY_BURGER_RECIPES.forEach((recipe, idx) => {
        const card = document.createElement('div');
        card.className = `recipe-card ${idx === simState.activeRecipeIndex ? 'active' : ''}`;
        card.dataset.index = idx;
        
        // Formulate readable presentation strings
        const displayIngredients = recipe.ingredients.map(ing => ing.replace('_', ' ')).join(', ');
        
        card.innerHTML = `
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-ingredients">Structure: ${displayIngredients}</div>
        `;
        
        card.addEventListener('click', () => {
            if (simState.assemblyStack.length > 0) {
                if (!confirm("Changing active orders will clear your current assembly table work stack. Proceed?")) return;
            }
            simState.activeRecipeIndex = idx;
            document.querySelectorAll('.recipe-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            clearAssemblyStack();
        });

        recipeList.appendChild(card);
    });
}

// --- Color Conversion Mapping Functions ---
function computeColorSpectrum(pct) {
    let r, g, b;
    if (pct <= 100) {
        let f = pct / 100;
        r = Math.round(209 + (84 - 209) * f);
        g = Math.round(93 + (49 - 93) * f);
        b = Math.round(109 + (28 - 109) * f);
    } else {
        let f = Math.min((pct - 100) / 50, 1);
        r = Math.round(84 + (26 - 84) * f);
        g = Math.round(49 + (17 - 49) * f);
        b = Math.round(28 + (13 - 28) * f);
    }
    return `rgb(${r}, ${g}, ${b})`;
}

// --- Core Clockwork Frame Loops ---
function startKitchenLoop() {
    engineLoop = setInterval(() => {
        // Advance global timeline metrics
        simState.timer += 0.1;
        telemetryTime.textContent = simState.timer.toFixed(1) + 's';

        // Apply thermodynamics metrics onto active down side component structures
        let tickRate = configRates[simState.heat];
        if (simState.facingDown === 'A') {
            simState.sideA = Math.min(simState.sideA + tickRate, 150);
            telemetryA.textContent = Math.floor(simState.sideA) + '%';
        } else {
            simState.sideB = Math.min(simState.sideB + tickRate, 150);
            telemetryB.textContent = Math.floor(simState.sideB) + '%';
        }

        // Render dynamic surface color adaptations
        let currentVisualPct = simState.facingDown === 'A' ? simState.sideA : simState.sideB;
        physicalPatty.style.backgroundColor = computeColorSpectrum(currentVisualPct);

        // Apply subtle vibration mechanics relative to physical power states
        let shakeAmplitude = simState.heat === 'high' ? (Math.random() * 2.5 - 1.25) : 
                             simState.heat === 'med' ? (Math.random() * 1.2 - 0.6) : 0;
        physicalPatty.style.transform = `translate(${shakeAmplitude}px, ${shakeAmplitude}px)`;

    }, 100);

    syncParticleEngine();
}

function syncParticleEngine() {
    clearInterval(visualFumeLoop);
    let speed = simState.heat === 'high' ? 60 : simState.heat === 'med' ? 140 : 320;
    
    visualFumeLoop = setInterval(() => {
        const bubble = document.createElement('div');
        bubble.className = 'particle';
        
        const bounds = physicalPatty.getBoundingClientRect();
        const parentBounds = grillArea.getBoundingClientRect();
        
        let xPos = (bounds.left - parentBounds.left) + Math.random() * bounds.width;
        let yPos = (bounds.top - parentBounds.top) + Math.random() * bounds.height;

        bubble.style.left = xPos + 'px';
        bubble.style.top = yPos + 'px';
        
        let size = Math.random() * 12 + 8;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';

        if (simState.heat === 'high') {
            bubble.style.animationDuration = '0.5s';
            bubble.style.background = 'rgba(240,240,240,0.4)';
        } else if (simState.heat === 'med') {
            bubble.style.animationDuration = '0.9s';
        } else {
            bubble.style.animationDuration = '1.3s';
        }

        grillArea.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1400);

    }, speed);
}

// --- Interaction Event Mechanics ---
function performFlipAction() {
    pattyHitbox.classList.add('flipping');
    setTimeout(() => {
        simState.facingDown = simState.facingDown === 'A' ? 'B' : 'A';
        sideVisualTag.textContent = "SIDE " + simState.facingDown;
        
        let upPct = simState.facingDown === 'A' ? simState.sideA : simState.sideB;
        physicalPatty.style.backgroundColor = computeColorSpectrum(upPct);
        pattyHitbox.classList.remove('flipping');
    }, 180);
}

function pushIngredientToStack(ingKey) {
    // Internal Logic Safeguard Interception
    if (ingKey === 'patty') {
        // Snapshot the current exact cook status states onto this added object component instance
        simState.latestPlatedPatty.cookedA = simState.sideA;
        simState.latestPlatedPatty.cookedB = simState.sideB;
        
        // Clear the grill stats so the chef can cook another patty if needed for triple stacks!
        simState.sideA = 0;
        simState.sideB = 0;
        simState.facingDown = 'A';
        sideVisualTag.textContent = "SIDE A";
        telemetryA.textContent = "0%";
        telemetryB.textContent = "0%";
        physicalPatty.style.backgroundColor = computeColorSpectrum(0);
    }

    simState.assemblyStack.push(ingKey);
    renderAssemblyStackUI();
}

function renderAssemblyStackUI() {
    burgerStackContainer.innerHTML = "";
    stackCount.textContent = `${simState.assemblyStack.length} item${simState.assemblyStack.length === 1 ? '' : 's'} stacked`;
    
    simState.assemblyStack.forEach(ing => {
        const element = document.createElement('div');
        element.className = `stacked-item stk-${ing}`;
        element.textContent = ing.replace('_', ' ');
        burgerStackContainer.appendChild(element);
    });
}

function clearAssemblyStack() {
    simState.assemblyStack = [];
    renderAssemblyStackUI();
}

// --- Analytics Grading & Performance Scoring Evaluation ---
function evaluateSubmissionOrder() {
    clearInterval(engineLoop);
    clearInterval(visualFumeLoop);

    const activeBlueprint = DICTIONARY_BURGER_RECIPES[simState.activeRecipeIndex];
    
    // 1. Calculate Patty Cooking Quality Score (Max: 50 points)
    let scorePatty = 0;
    let targetA = simState.latestPlatedPatty.cookedA;
    let targetB = simState.latestPlatedPatty.cookedB;
    
    // If the recipe requires a patty, but none was compiled on line
    if (activeBlueprint.ingredients.includes('patty') && targetA === 0 && targetB === 0) {
        scorePatty = 0;
    } else {
        let devA = Math.abs(100 - targetA);
        let devB = Math.abs(100 - targetB);
        let combinedDev = devA + devB;
        
        let rawPattyPts = 50 - (combinedDev * 0.4);
        scorePatty = Math.max(0, Math.round(rawPattyPts));
    }

    // 2. Calculate Assembly Precision Score (Max: 50 points)
    let scoreAssembly = 50;
    const targetList = activeBlueprint.ingredients;
    const builtList = simState.assemblyStack;

    // Penalty for length mismatches
    let lengthDiff = Math.abs(targetList.length - builtList.length);
    scoreAssembly -= (lengthDiff * 8);

    // Item matching checklist validation
    let checks = Math.min(targetList.length, builtList.length);
    for (let i = 0; i < checks; i++) {
        if (targetList[i] !== builtList[i]) {
            scoreAssembly -= 6; // Penalize wrong ingredient order sequence
        }
    }
    scoreAssembly = Math.max(0, scoreAssembly);

    // 3. Combined Final Total Output
    let finalCombinedScore = scorePatty + scoreAssembly;

    // Interface String Configuration mapping logic
    let strStars = "⭐";
    let strTitle = "Kitchen Disaster";
    let strDesc = "The assembly line execution deviated heavily from the client's order ticket blueprint specs.";

    if (finalCombinedScore >= 94) {
        strStars = "⭐⭐⭐⭐⭐";
        strTitle = "Flawless Elite Chef!";
        strDesc = "Stunning! The structural ingredient layers match parameters precisely, and your thermal meat profiles are pristine.";
    } else if (finalCombinedScore >= 80) {
        strStars = "⭐⭐⭐⭐";
        strTitle = "Top Tier Diner Grub";
        strDesc = "High-quality production output! Minor variations in stacking alignments or thermal readings caught you, but solid work.";
    } else if (finalCombinedScore >= 60) {
        strStars = "⭐⭐⭐";
        strTitle = "Average Line Cook";
        strDesc = "Edible, but rough around the edges. Keep closer monitoring metrics over your stacking queues and meat timelines next turn.";
    } else if (finalCombinedScore >= 35) {
        strStars = "⭐⭐";
        strTitle = "Sloppy Assembly Line";
        strDesc = "Noticeable construction failures. Missing core layout items or serving raw/charred elements.";
    }

    // Bind values directly into modal UI elements
    lblTargetName.textContent = activeBlueprint.name;
    lblPattyScore.textContent = `${scorePatty} / 50`;
    lblAssemblyScore.textContent = `${scoreAssembly} / 50`;
    lblCombinedScore.textContent = `${finalCombinedScore} / 100`;
    
    evalStars.textContent = strStars;
    evalTitle.textContent = strTitle;
    evalDesc.textContent = strDesc;

    evalWindow.classList.add('active');
}

function advanceToNextRoundTicket() {
    // Re-zero application performance registers
    simState.timer = 0;
    simState.sideA = 0;
    simState.sideB = 0;
    simState.facingDown = 'A';
    simState.latestPlatedPatty = { cookedA: 0, cookedB: 0 };
    
    sideVisualTag.textContent = "SIDE A";
    telemetryA.textContent = "0%";
    telemetryB.textContent = "0%";
    telemetryTime.textContent = "0.0s";
    
    clearAssemblyStack();
    evalWindow.classList.remove('active');
    
    // Reinitialize core loops execution cycles
    startKitchenLoop();
}

// --- Event Binding Systems ---
function bindInputEventListeners() {
    document.getElementById('cmdFlip').addEventListener('click', performFlipAction);
    pattyHitbox.addEventListener('click', performFlipAction);
    
    document.getElementById('cmdClearStack').addEventListener('click', clearAssemblyStack);
    document.getElementById('cmdServe').addEventListener('click', evaluateSubmissionOrder);
    document.getElementById('cmdNextTicket').addEventListener('click', advanceToNextRoundTicket);

    // Map individual cooking station ingredient buttons click events
    document.querySelectorAll('.btn-ingredient').forEach(btn => {
        btn.addEventListener('click', () => {
            pushIngredientToStack(btn.dataset.ing);
        });
    });

    // Map heat profile selector dials switching engine configurations
    document.querySelectorAll('.btn-heat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-heat').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            simState.heat = e.target.dataset.heat;
            heatGlow.style.opacity = configGlows[simState.heat];
            syncParticleEngine();
        });
    });
}

// Run application on container window initialization
window.addEventListener('DOMContentLoaded', initApp);