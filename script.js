// Game Configuration
let gameConfig = {
    playerCount: 3,
    isMultiplayer: false, // 4-6 players
    playerNames: [] // Optional player names
};

// Player Colors - must be defined early
const playerColors = ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c'];

// Menu Navigation Functions
function showMainMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('rules-modal').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
}

function showPlayerSelection() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('player-selection').style.display = 'flex';
    // Hide name section initially
    document.getElementById('player-names-section').style.display = 'none';
}

function showRules() {
    document.getElementById('rules-modal').style.display = 'flex';
}

function closeRules() {
    document.getElementById('rules-modal').style.display = 'none';
}

function selectPlayerCount(playerCount) {
    gameConfig.playerCount = playerCount;
    gameConfig.isMultiplayer = playerCount >= 4;

    // Show name input section
    const nameSection = document.getElementById('player-names-section');
    const nameInputs = document.getElementById('player-name-inputs');
    nameInputs.innerHTML = '';

    // Create input fields for each player with default names
    for (let i = 0; i < playerCount; i++) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'player-name-input';

        const label = document.createElement('label');
        label.innerText = `Player ${i + 1}:`;
        label.style.color = playerColors[i];

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player-name-${i}`;
        input.value = `Player ${i + 1}`; // Pre-fill with default name
        input.maxLength = 20;
        input.style.borderColor = playerColors[i]; // Add colored border

        inputDiv.appendChild(label);
        inputDiv.appendChild(input);
        nameInputs.appendChild(inputDiv);
    }

    nameSection.style.display = 'block';
}

function startGameWithNames() {
    // Collect player names
    gameConfig.playerNames = [];
    for (let i = 0; i < gameConfig.playerCount; i++) {
        const input = document.getElementById(`player-name-${i}`);
        const name = input.value.trim();
        gameConfig.playerNames.push(name || `Player ${i + 1}`);
    }

    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // Initialize the board and game
    initBoard();
}

// Helper function for proper possessive grammar
function getPossessive(name) {
    // If name ends with 's', just add apostrophe, otherwise add 's
    return name.endsWith('s') ? `${name}'` : `${name}'s`;
}

function startGame(playerCount) {
    // Legacy function for direct start without names
    gameConfig.playerCount = playerCount;
    gameConfig.isMultiplayer = playerCount >= 4;
    gameConfig.playerNames = [];

    document.getElementById('player-selection').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    // Initialize the board and game
    initBoard();
}

const board = document.getElementById('board');
const hexSize = 50; // Radius of the hexagon (center to corner)
const hexWidth = Math.sqrt(3) * hexSize;
const hexHeight = 2 * hexSize;

// Axial directions: 6 neighbors
const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

// Modified createHex to accept type
function createHex(q, r, type = 'default') {
    const hex = document.createElement('div');
    hex.classList.add('hex');

    if (type === 'honeycomb') {
        hex.classList.add('honeycomb');
    } else if (type === 'pink') {
        hex.classList.add('field-pink');
    } else if (type === 'black') {
        hex.classList.add('field-black');
    } else if (type === 'gold') {
        hex.classList.add('field-gold');
    } else if (type === 'blackgold') {
        hex.classList.add('field-blackgold');
    }

    // Convert axial to pixel coordinates
    // x = size * (sqrt(3) * q  +  sqrt(3)/2 * r)
    // y = size * (                         3/2 * r)
    const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = hexSize * (3 / 2 * r);

    hex.style.width = `${hexWidth}px`;
    hex.style.height = `${hexHeight}px`;
    hex.style.left = `${x}px`;
    hex.style.top = `${y}px`;

    // Center the hex on its coordinate (since left/top are top-left corner)
    hex.style.marginLeft = `-${hexWidth / 2}px`;
    hex.style.marginTop = `-${hexHeight / 2}px`;

    // hex.innerText = `${q},${r}`; // Removed labels for vintage look
    hex.dataset.q = q;
    hex.dataset.r = r;
    hex.dataset.type = type;

    board.appendChild(hex);
}

function createRing(radius) {
    if (radius === 0) {
        createHex(0, 0, 'pink');
        return;
    }

    // Start at the South-West corner (direction 4 * radius)
    // directions[4] is { q: -1, r: 1 }
    let currentQ = -1 * radius;
    let currentR = 1 * radius;

    for (let i = 0; i < 6; i++) {
        const dir = directions[i];
        for (let j = 0; j < radius; j++) {
            let type = 'default';

            // For multiplayer (4-6 players), black and gold fields are combined
            // For standard (2-3 players), they remain separate
            if (gameConfig.isMultiplayer) {
                // Combined black/gold fields for multiplayer
                if ((currentQ === -2 && currentR === 2) || (currentQ === 2 && currentR === 0) || (currentQ === 0 && currentR === -2) ||
                    (currentQ === -2 && currentR === 0) || (currentQ === 0 && currentR === 2) || (currentQ === 2 && currentR === -2)) {
                    type = 'blackgold'; // New mixed type
                }
            } else {
                // Standard mode: separate black and gold fields
                if (currentQ === -2 && currentR === 2) type = 'black';
                else if (currentQ === 2 && currentR === 0) type = 'black';
                else if (currentQ === 0 && currentR === -2) type = 'black';
                else if (currentQ === -2 && currentR === 0) type = 'gold';
                else if (currentQ === 0 && currentR === 2) type = 'gold';
                else if (currentQ === 2 && currentR === -2) type = 'gold';
            }

            createHex(currentQ, currentR, type);
            currentQ += dir.q;
            currentR += dir.r;
        }
    }
}

function addHoneycombs() {
    const corners = [
        { q: 0, r: -3 }, { q: 3, r: -3 }, { q: 3, r: 0 },
        { q: 0, r: 3 }, { q: -3, r: 3 }, { q: -3, r: 0 }
    ];

    corners.forEach(corner => {
        // Check all 6 neighbors of the corner
        directions.forEach(dir => {
            const neighborQ = corner.q + dir.q;
            const neighborR = corner.r + dir.r;

            // Calculate distance from center
            // dist = (|q| + |r| + |q+r|) / 2
            const dist = (Math.abs(neighborQ) + Math.abs(neighborR) + Math.abs(neighborQ + neighborR)) / 2;

            // If distance > 3, it's outside the main board, so it's a honeycomb spot
            if (dist > 3) {
                createHex(neighborQ, neighborR, 'honeycomb');
            }
        });
    });
}

function initBoard() {
    // Clear the board and state
    board.innerHTML = '';
    nectarTokens.length = 0;

    // Ring 0 (Center)
    createRing(0);
    // Ring 1 (6 neighbors)
    createRing(1);
    // Ring 2 (12 neighbors)
    createRing(2);
    // Ring 3 (18 neighbors)
    createRing(3);

    addHoneycombs();
    initGame();
}

// Game State
const players = [];
const bees = [];

class Player {
    constructor(id, color, homeCorners) {
        this.id = id;
        this.color = color;
        this.score = 0;
        this.bees = [];
        this.homeCorners = homeCorners; // Array of {q, r} for the 3 home honeycombs
    }
}


class Bee {
    constructor(id, ownerId, q, r) {
        this.id = id;
        this.ownerId = ownerId;
        this.q = q;
        this.r = r;
        this.tokens = []; // Array of nectar values
        this.tokenElements = []; // Visual elements for carried tokens
        this.element = null;
        this.movedThisTurn = false;
        this.remainingMoves = 1;
    }

    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add('bee', `player-${this.ownerId}`);
            // Text removed via CSS
            board.appendChild(this.element);

            // Add hover tooltip for carried nectar
            this.element.addEventListener('mouseenter', () => {
                const totalNectar = this.tokens.reduce((sum, val) => sum + val, 0);
                if (totalNectar > 0) {
                    const tooltip = document.createElement('div');
                    tooltip.classList.add('bee-tooltip');
                    tooltip.innerText = totalNectar;
                    tooltip.id = `tooltip-${this.id}`;

                    // Position tooltip above the bee
                    const x = hexSize * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r);
                    const y = hexSize * (3 / 2 * this.r);
                    tooltip.style.left = `${x}px`;
                    tooltip.style.top = `${y}px`;

                    board.appendChild(tooltip);
                }
            });

            this.element.addEventListener('mouseleave', () => {
                const tooltip = document.getElementById(`tooltip-${this.id}`);
                if (tooltip) {
                    tooltip.remove();
                }
            });
        }

        // Convert axial to pixel coordinates
        const x = hexSize * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r);
        const y = hexSize * (3 / 2 * this.r);

        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;

        // Center the bee
        this.element.style.marginLeft = `-14px`; // Half of width (28px)
        this.element.style.marginTop = `-19px`; // Half of height (38px)

        if (this.movedThisTurn && this.remainingMoves <= 0) {
            this.element.classList.add('moved');
        } else {
            this.element.classList.remove('moved');
        }

        // Render carried tokens
        this.renderTokens();
    }


    renderTokens() {
        // Remove old token elements
        this.tokenElements.forEach(el => el.remove());
        this.tokenElements = [];

        // Create visual token elements for each carried token
        this.tokens.forEach((tokenValue, index) => {
            const tokenEl = document.createElement('div');
            tokenEl.classList.add('nectar-token', `nectar-${tokenValue}`);
            tokenEl.innerText = tokenValue;
            board.appendChild(tokenEl);

            // Position at bee's location
            const x = hexSize * (Math.sqrt(3) * this.q + Math.sqrt(3) / 2 * this.r);
            const y = hexSize * (3 / 2 * this.r);

            tokenEl.style.left = `${x}px`;
            tokenEl.style.top = `${y}px`;
            tokenEl.style.marginLeft = `-15px`; // Half width (30px)
            tokenEl.style.marginTop = `-15px`; // Half height (30px)

            this.tokenElements.push(tokenEl);
        });
    }
}

function initGame() {
    // Clear existing players and bees
    players.length = 0;
    bees.length = 0;

    // All 6 corner positions
    const allStartPositions = [
        { q: 3, r: 0 },   // 0: East
        { q: 0, r: 3 },   // 1: South
        { q: -3, r: 3 },  // 2: South West
        { q: -3, r: 0 },  // 3: West
        { q: 0, r: -3 },  // 4: North
        { q: 3, r: -3 }   // 5: North East
    ];

    // Determine active positions based on player count for symmetry
    let activeIndices = [];
    switch (gameConfig.playerCount) {
        case 2: activeIndices = [0, 2]; break; // East, SW (Both near Black fields for fairness)
        case 3: activeIndices = [0, 2, 4]; break; // East, SW, North
        case 4: activeIndices = [0, 1, 3, 4]; break; // East, South, West, North
        case 5: activeIndices = [0, 1, 2, 3, 4]; break; // All except NE
        case 6: activeIndices = [0, 1, 2, 3, 4, 5]; break; // All
        default: activeIndices = [0, 1, 2]; // Fallback
    }

    // Determine number of bees per player based on player count
    const beesPerPlayer = gameConfig.isMultiplayer ? 2 : 3;

    // Player colors
    const playerColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    activeIndices.forEach((locIdx, index) => {
        const pos = allStartPositions[locIdx];

        // Identify the honeycombs at this corner
        let homeHexes = [];
        directions.forEach(dir => {
            const nQ = pos.q + dir.q;
            const nR = pos.r + dir.r;
            const dist = (Math.abs(nQ) + Math.abs(nR) + Math.abs(nQ + nR)) / 2;
            if (dist > 3) {
                homeHexes.push({ q: nQ, r: nR });
            }
        });

        // Sort homeHexes so the "middle" one (connected to both others) is at index 1
        if (homeHexes.length === 3) {
            // Find the hex that is a neighbor to the other two
            let middleIndex = -1;
            for (let i = 0; i < 3; i++) {
                const current = homeHexes[i];
                const others = homeHexes.filter((_, idx) => idx !== i);

                // Check if current is neighbor to both others
                const isNeighborToFirst = isNeighbor(current, others[0]);
                const isNeighborToSecond = isNeighbor(current, others[1]);

                if (isNeighborToFirst && isNeighborToSecond) {
                    middleIndex = i;
                    break;
                }
            }

            if (middleIndex !== -1 && middleIndex !== 1) {
                // Swap middle one to index 1
                const temp = homeHexes[1];
                homeHexes[1] = homeHexes[middleIndex];
                homeHexes[middleIndex] = temp;
            }
        }

        // Apply visual indicator for ownership
        homeHexes.forEach(hex => {
            const hexEl = document.querySelector(`.hex[data-q="${hex.q}"][data-r="${hex.r}"]`);
            if (hexEl) {
                // Color the honeycomb directly with player color
                hexEl.style.backgroundColor = playerColors[index];
                hexEl.style.boxShadow = ''; // Remove previous glow
                hexEl.dataset.owner = index; // Mark ownership in DOM
            }
        });

        const player = new Player(index, playerColors[index], homeHexes);
        player.locationIndex = locIdx; // Store location index for UI positioning
        players.push(player);

        // Create bees for the player (2 or 3 depending on mode)
        // For multiplayer with 2 bees, leave 1 field distance (skip the middle honeycomb)
        // Since we sorted homeHexes, index 1 is the middle one.
        // So we use indices 0 and 2.
        const beesToCreate = beesPerPlayer;

        if (gameConfig.isMultiplayer) {
            // Create bees at index 0 and 2
            [0, 2].forEach((hexIndex, i) => {
                if (i < beesToCreate && hexIndex < homeHexes.length) {
                    const hex = homeHexes[hexIndex];
                    const bee = new Bee(`${index}-${i}`, index, hex.q, hex.r);
                    player.bees.push(bee);
                    bees.push(bee);
                    bee.render();
                }
            });
        } else {
            // Standard: Create bees at 0, 1, 2
            for (let beeIndex = 0; beeIndex < beesToCreate; beeIndex++) {
                if (beeIndex < homeHexes.length) {
                    const hex = homeHexes[beeIndex];
                    const bee = new Bee(`${index}-${beeIndex}`, index, hex.q, hex.r);
                    player.bees.push(bee);
                    bees.push(bee);
                    bee.render();
                }
            }
        }
    });

    // Initial Weather
    triggerWeather();

    // Initialize Turn Indicator
    const playerName = gameConfig.playerNames[currentPlayerIndex] || `Player ${currentPlayerIndex + 1}`;
    turnIndicator.innerHTML = `<span style="color: ${players[currentPlayerIndex].color}; font-weight: bold;">${getPossessive(playerName)} Turn</span>`;

    // Render initial state
    bees.forEach(bee => bee.render());
    nectarTokens.forEach(token => token.render());

    // Create Progress Bars
    players.forEach(player => {
        const refHex = player.homeCorners[0]; // Just use first home hex as ref
        createProgressBar(player, refHex.q, refHex.r);
    });
}

function isNeighbor(h1, h2) {
    const dist = (Math.abs(h1.q - h2.q) + Math.abs(h1.r - h2.r) + Math.abs((h1.q + h1.r) - (h2.q + h2.r))) / 2;
    return dist === 1;
}

function createProgressBar(player, q, r) {
    const barContainer = document.createElement('div');
    barContainer.classList.add('score-bar-container');
    barContainer.id = `score-bar-${player.id}`;
    barContainer.style.display = 'none'; // Hidden initially
    barContainer.setAttribute('data-score', '0/10'); // Tooltip data

    const barFill = document.createElement('div');
    barFill.classList.add('score-bar-fill');
    barFill.style.backgroundColor = player.color;
    barFill.style.height = '0%'; // Start at 0
    barContainer.appendChild(barFill);

    board.appendChild(barContainer);

    // Calculate base position from the reference hex (or corner)
    // Actually, let's use the corner position from allStartPositions for stability
    const allStartPositions = [
        { q: 3, r: 0 }, { q: 0, r: 3 }, { q: -3, r: 3 },
        { q: -3, r: 0 }, { q: 0, r: -3 }, { q: 3, r: -3 }
    ];
    const pos = allStartPositions[player.locationIndex];

    const x = hexSize * (Math.sqrt(3) * pos.q + Math.sqrt(3) / 2 * pos.r);
    const y = hexSize * (3 / 2 * pos.r);

    // Manual offsets based on location index
    let offsetX = 0;
    let offsetY = 0;

    if (player.locationIndex === 0) { // East (3, 0)
        offsetX = 80;
        offsetY = -75;
    } else if (player.locationIndex === 1) { // South (0, 3)
        offsetX = 0;
        offsetY = 80;
    } else if (player.locationIndex === 2) { // SW (-3, 3)
        offsetX = -90;
        offsetY = 30;
    } else if (player.locationIndex === 3) { // West (-3, 0)
        offsetX = -90;
        offsetY = -75;
    } else if (player.locationIndex === 4) { // North (0, -3)
        offsetX = 0;
        offsetY = -180;
    } else if (player.locationIndex === 5) { // NE (3, -3)
        offsetX = 90;
        offsetY = -180;
    }

    barContainer.style.left = `${x + offsetX}px`;
    barContainer.style.top = `${y + offsetY}px`;
}



// Nectar Management
const nectarTokens = []; // Array of {q, r, value, element}

function spawnNectar(value, type) {
    // Find all hexes of the given type
    const hexes = document.querySelectorAll(`.hex.field-${type}`);
    hexes.forEach(hex => {
        const q = parseInt(hex.dataset.q);
        const r = parseInt(hex.dataset.r);

        // Check if there's already a bee or nectar on this hex
        // Rules say: "If a bee stands on a nectar field, it covers it and prevents the formation of new nectar tokens there."
        // Also check if nectar is already there? Rules imply new tokens are placed.
        // "The dice number indicates which nectar tokens are placed on the board."
        // Assuming multiple tokens can stack or replace? "New nectar tokens can only be picked up when the previous movement is finished."
        // Let's assume for now we just place a token if no bee is there.

        const beeOnHex = bees.find(b => b.q === q && b.r === r);
        if (beeOnHex) return;

        // Check if nectar already exists there
        const existingNectar = nectarTokens.find(n => n.q === q && n.r === r);
        if (existingNectar) {
            // Remove existing (or stack? Rules unclear. "prevents the formation of new nectar tokens there" applies to bees covering.
            // Let's assume we replace or just don't add if one is there.
            // "If three, five or six is rolled, nothing changes."
            // "If a bee stands on a nectar field, it covers it..."
            // Let's assume we add a token if empty.
            return;
        }

        createNectarToken(q, r, value);
    });
}

function createNectarToken(q, r, value) {
    const token = document.createElement('div');
    token.classList.add('nectar-token', `nectar-${value}`);
    token.innerText = value;
    board.appendChild(token);

    // Convert axial to pixel coordinates
    const x = hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = hexSize * (3 / 2 * r);

    token.style.left = `${x}px`;
    token.style.top = `${y}px`;
    token.style.marginLeft = `-15px`; // Half width (30px)
    token.style.marginTop = `-15px`; // Half height (30px)

    nectarTokens.push({ q, r, value, element: token });
}

function triggerWeather() {
    const roll = Math.floor(Math.random() * 6) + 1;
    const weatherDisplay = document.getElementById('weather-display');

    let flavorText = "Nothing new blooms";

    if (gameConfig.isMultiplayer) {
        // Multiplayer: 1 and 2 tokens spawn on blackgold fields
        if (roll === 1) {
            spawnNectar(1, 'blackgold');
            flavorText = "1 Nectar Token have sprung up";
        } else if (roll === 2) {
            spawnNectar(2, 'blackgold');
            flavorText = "2 Nectar Tokens have sprung up";
        } else if (roll === 4) {
            spawnNectar(4, 'pink');
            flavorText = "4 Nectar Tokens have sprung up";
        }
    } else {
        // Standard mode: separate black and gold fields
        if (roll === 1) {
            spawnNectar(1, 'black');
            flavorText = "1 Nectar Token have sprung up";
        } else if (roll === 2) {
            spawnNectar(2, 'gold');
            flavorText = "2 Nectar Tokens have sprung up";
        } else if (roll === 4) {
            spawnNectar(4, 'pink');
            flavorText = "4 Nectar Tokens have sprung up";
        }
    }
    // 3, 5, 6: Nothing changes

    weatherDisplay.innerText = flavorText;
    console.log(`Weather Roll: ${roll} - ${flavorText}`);
}

// Status Bar Management
function updateStatusBar() {
    const container = document.getElementById('status-bar-container');
    container.innerHTML = ''; // Clear existing bars

    players.forEach(player => {
        if (player.score >= 1) {
            const barDiv = document.createElement('div');
            barDiv.classList.add('player-status-bar');
            barDiv.id = `status-bar-player-${player.id}`;

            const fillDiv = document.createElement('div');
            fillDiv.classList.add('status-fill');
            fillDiv.style.backgroundColor = player.color;
            fillDiv.style.width = `${(player.score / 10) * 100}%`;

            const labelDiv = document.createElement('div');
            labelDiv.classList.add('status-label');
            labelDiv.style.color = player.color;
            const displayName = gameConfig.playerNames[player.id] || `PLAYER ${player.id + 1}`;
            labelDiv.innerHTML = `<span>${displayName.toUpperCase()}</span><span>${player.score} / 10</span>`;

            barDiv.appendChild(fillDiv);
            barDiv.appendChild(labelDiv);
            container.appendChild(barDiv);
        }
    });
}

// Turn Management
let currentPlayerIndex = 0;
let currentRound = 1;
let playerHasMovedThisTurn = false;

// UI Layer Setup
const uiLayer = document.getElementById('ui-layer');
uiLayer.style.display = 'flex';
uiLayer.style.flexDirection = 'column';
uiLayer.style.alignItems = 'flex-start';
uiLayer.style.gap = '10px';

// 1. Turn Indicator (Top)
const turnIndicator = document.createElement('div');
turnIndicator.style.color = 'white'; // White for static text
turnIndicator.style.fontSize = '24px';
turnIndicator.style.fontWeight = 'normal'; // Less bold
turnIndicator.style.marginBottom = '10px';
turnIndicator.style.fontFamily = "'Georgia', serif";
// Initial placeholder - will be updated in initGame
turnIndicator.innerText = "";
uiLayer.appendChild(turnIndicator);

function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Track rounds (when we cycle back to player 0)
    if (currentPlayerIndex === 0) {
        currentRound++;
    }

    // Manage Move All Out button visibility
    if (moveAllOutBtn) {
        if (currentRound === 1) {
            moveAllOutBtn.style.display = 'block'; // Show for next player in round 1
        } else {
            moveAllOutBtn.style.display = 'none'; // Hide after round 1
        }
    }

    // Update Turn Indicator: Only color the name
    const playerName = gameConfig.playerNames[currentPlayerIndex] || `Player ${currentPlayerIndex + 1}`;
    turnIndicator.innerHTML = `<span style="color: ${players[currentPlayerIndex].color}; font-weight: bold;">${getPossessive(playerName)} Turn</span>`;

    // Reset bee movement flags
    bees.forEach(bee => {
        bee.movedThisTurn = false;
        bee.remainingMoves = 1; // Reset to 1 regular move
        if (bee.element) {
            bee.element.classList.remove('moved');
        }
    });

    // Reset selected bee
    if (selectedBee) {
        selectedBee.element.style.border = '';
        selectedBee = null;
        updateBeePanel();
    }

    // Reset movement flag and disable Next Turn button
    playerHasMovedThisTurn = false;
    nextTurnBtn.disabled = true;
    nextTurnBtn.classList.add('disabled'); // Use class for styling
    nextTurnBtn.style.cursor = 'not-allowed';

    // Trigger Weather for the new turn
    triggerWeather();
}

// 2. Next Turn Button
const nextTurnBtn = document.createElement('button');
nextTurnBtn.innerText = "NEXT TURN";
nextTurnBtn.className = "game-btn disabled"; // Add class
nextTurnBtn.disabled = true;
nextTurnBtn.addEventListener('click', () => {
    if (!nextTurnBtn.disabled) {
        nextTurn();
    }
});
uiLayer.appendChild(nextTurnBtn);

// Space bar shortcut for Next Turn or Move All Out
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling

        // Prioritize Move All Out if visible
        if (moveAllOutBtn && moveAllOutBtn.style.display !== 'none') {
            moveAllOut();
        } else if (!nextTurnBtn.disabled) {
            nextTurn();
        }
    }
});

// 3. Move All Out Button
const moveAllOutBtn = document.createElement('button');
moveAllOutBtn.innerText = "MOVE ALL OUT";
moveAllOutBtn.className = "game-btn"; // Add class
moveAllOutBtn.addEventListener('click', moveAllOut);
uiLayer.appendChild(moveAllOutBtn);

// 4. Weather Display (Bottom, Subtle)
// Move existing weather display to end of UI layer
const weatherDisplay = document.getElementById('weather-display');
uiLayer.appendChild(weatherDisplay);
weatherDisplay.style.marginTop = "10px";
weatherDisplay.style.fontSize = "14px"; // Smaller font
weatherDisplay.style.color = "rgba(255, 255, 255, 0.7)"; // More subtle color
weatherDisplay.style.background = "rgba(0,0,0,0.3)"; // More subtle background
weatherDisplay.style.padding = "5px 10px";
weatherDisplay.style.fontStyle = "italic";

function moveAllOut() {
    const player = players[currentPlayerIndex];
    // Filter bees that are at home and haven't moved
    const beesToMove = player.bees.filter(bee => {
        const isHome = player.homeCorners.some(h => h.q === bee.q && h.r === bee.r);
        return isHome && !bee.movedThisTurn;
    });

    if (beesToMove.length === 0) {
        console.log("No bees to move out.");
        return;
    }

    // Calculate valid board neighbors for each bee
    const beeMoves = beesToMove.map(bee => {
        const validNeighbors = [];
        for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const targetQ = bee.q + dir.q;
            const targetR = bee.r + dir.r;

            // Check distance (must be <= 3 to be on board)
            const dist = (Math.abs(targetQ) + Math.abs(targetR) + Math.abs(targetQ + targetR)) / 2;
            if (dist > 3) continue;

            // Check if occupied by another bee
            const occupied = bees.find(b => b.q === targetQ && b.r === targetR);
            if (!occupied) {
                validNeighbors.push({ q: targetQ, r: targetR });
            }
        }
        return { bee, validNeighbors };
    });

    // We need to select one move for each bee such that they don't conflict
    // and ideally maximize distance between them to avoid adjacency.

    // Generate all combinations of moves
    // Since we have at most 3 bees, we can use recursion.
    const combinations = [];

    function generateCombinations(index, currentMoves) {
        if (index === beeMoves.length) {
            combinations.push([...currentMoves]);
            return;
        }

        const { bee, validNeighbors } = beeMoves[index];

        if (validNeighbors.length === 0) {
            // If a bee has no moves, it stays put (null move)
            generateCombinations(index + 1, [...currentMoves, { bee, target: null }]);
        } else {
            for (const target of validNeighbors) {
                // Check if this target is already used by a previous bee in this combination
                const isUsed = currentMoves.some(m => m.target && m.target.q === target.q && m.target.r === target.r);
                if (!isUsed) {
                    generateCombinations(index + 1, [...currentMoves, { bee, target }]);
                }
            }
        }
    }

    generateCombinations(0, []);

    if (combinations.length === 0) {
        console.log("No valid move combinations found.");
        return;
    }

    // Score combinations
    // Score = Sum of distances between all pairs of destinations
    // We prefer higher distance.
    // Also prefer moving more bees (count non-null targets).

    let bestCombination = null;
    let maxScore = -Infinity;

    combinations.forEach(combo => {
        let score = 0;
        const activeMoves = combo.filter(m => m.target !== null);

        // Reward moving bees
        score += activeMoves.length * 1000;

        // Calculate distances between destinations
        for (let i = 0; i < activeMoves.length; i++) {
            for (let j = i + 1; j < activeMoves.length; j++) {
                const t1 = activeMoves[i].target;
                const t2 = activeMoves[j].target;
                const dist = (Math.abs(t1.q - t2.q) + Math.abs(t1.r - t2.r) + Math.abs((t1.q + t1.r) - (t2.q + t2.r))) / 2;

                if (dist === 1) {
                    score -= 500; // Penalize adjacency heavily
                } else {
                    score += dist * 10; // Reward distance
                }
            }
        }

        if (score > maxScore) {
            maxScore = score;
            bestCombination = combo;
        }
    });

    if (bestCombination) {
        let movedAny = false;
        bestCombination.forEach(move => {
            if (move.target) {
                moveBee(move.bee, move.target.q, move.target.r);
                movedAny = true;
            }
        });

        if (movedAny) {
            // Enable Next Turn button if not already enabled
            if (!playerHasMovedThisTurn) {
                playerHasMovedThisTurn = true;
                nextTurnBtn.disabled = false;
                nextTurnBtn.style.opacity = '1';
                nextTurnBtn.style.cursor = 'pointer';
            }
        }
    }
}

// Bee Movement
let selectedBee = null;
const beePanel = document.getElementById('bee-panel');

function updateBeePanel() {
    if (!selectedBee) {
        beePanel.style.display = 'none';
        return;
    }

    beePanel.style.display = 'block';
    beePanel.innerHTML = ''; // Clear existing content

    const header = document.createElement('h3');
    header.innerText = `Bee ${selectedBee.id}`;
    beePanel.appendChild(header);

    if (selectedBee.tokens.length === 0) {
        const noNectar = document.createElement('p');
        noNectar.innerText = 'No Nectar';
        beePanel.appendChild(noNectar);
    } else {
        selectedBee.tokens.forEach((tokenValue, index) => {
            const tokenDiv = document.createElement('div');
            tokenDiv.className = 'token-item';
            tokenDiv.innerText = `Nectar: ${tokenValue}`;

            // Action Buttons Container
            const actionContainer = document.createElement('div');
            actionContainer.className = 'action-buttons';

            // Boost Button
            const boostBtn = document.createElement('button');
            boostBtn.className = 'boost-btn';
            boostBtn.innerHTML = '⚡ BOOST'; // Sleek symbol
            boostBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent hex click
                useBoost(selectedBee, index);
            };
            actionContainer.appendChild(boostBtn);

            // Chain Button (check if neighbors exist)
            const neighbors = getNeighborBees(selectedBee);
            if (neighbors.length > 0) {
                const chainBtn = document.createElement('button');
                chainBtn.className = 'chain-btn';
                chainBtn.innerHTML = '🔗 CHAIN'; // Sleek symbol
                chainBtn.onclick = (e) => {
                    e.stopPropagation();
                    startChain(selectedBee, index, neighbors);
                };
                actionContainer.appendChild(chainBtn);
            }
            tokenDiv.appendChild(actionContainer);

            beePanel.appendChild(tokenDiv);
        });
    }

    const movesText = document.createElement('p');
    movesText.innerText = `Moves: ${selectedBee.remainingMoves}`;
    beePanel.appendChild(movesText);
}

function getNeighborBees(bee) {
    return bees.filter(b => {
        if (b.id === bee.id) return false; // Self
        // Check distance = 1
        const dist = (Math.abs(bee.q - b.q) + Math.abs(bee.r - b.r) + Math.abs((bee.q + bee.r) - (b.q + b.r))) / 2;
        return dist === 1;
    });
}

function getConnectedBees(sourceBee) {
    // BFS to find all bees connected through an uninterrupted chain
    // Only includes bees of the same color (same owner)
    const visited = new Set([sourceBee.id]);
    const queue = [sourceBee];
    const connected = [];

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = getNeighborBees(current);

        for (const neighbor of neighbors) {
            // Only connect to bees of the same color
            if (!visited.has(neighbor.id) && neighbor.ownerId === sourceBee.ownerId) {
                visited.add(neighbor.id);
                connected.push(neighbor);
                queue.push(neighbor); // Continue searching from this bee
            }
        }
    }

    return connected;
}

function useBoost(bee, tokenIndex) {
    const tokenValue = bee.tokens[tokenIndex];
    bee.tokens.splice(tokenIndex, 1); // Remove token
    bee.remainingMoves += tokenValue; // Add moves
    console.log(`Used boost! Added ${tokenValue} moves. Remaining: ${bee.remainingMoves}`);
    bee.render(); // Update visual state (remove greyed out look)
    updateBeePanel();
}

function startChain(bee, tokenIndex, neighbors) {
    // Find all bees connected through an uninterrupted chain
    const connectedBees = getConnectedBees(bee);

    if (connectedBees.length === 0) {
        console.log("No connected bees to chain to.");
        return;
    }

    console.log(`Starting chain... ${connectedBees.length} bees reachable.`);

    // Clear previous highlights
    bees.forEach(b => {
        if (b.element) b.element.style.borderColor = '';
    });

    connectedBees.forEach(connectedBee => {
        if (connectedBee.element) {
            connectedBee.element.style.borderColor = 'yellow';
            connectedBee.element.style.cursor = 'pointer';
        }
    });

    chainMode = {
        sourceBee: bee,
        tokenIndex: tokenIndex,
        targets: connectedBees
    };
    console.log("Chain mode active. Click a yellow-highlighted bee to pass.");
}

let chainMode = null; // { sourceBee, tokenIndex, targets }
let captureMode = null; // { attacker, victim }

function passNectar(sourceBee, tokenIndex, targetBee) {
    const tokenValue = sourceBee.tokens[tokenIndex];
    sourceBee.tokens.splice(tokenIndex, 1);

    // Check if target bee is at home
    const targetPlayer = players[targetBee.ownerId];
    const isHome = targetPlayer.homeCorners.some(h => h.q === targetBee.q && h.r === targetBee.r);

    if (isHome) {
        // Auto-score: add to player score
        targetPlayer.score += tokenValue;
        console.log(`Nectar ${tokenValue} reached home! Player ${targetPlayer.id} score: ${targetPlayer.score}`);

        // Update Status Bar
        updateStatusBar();

        // Update Progress Bar
        const barContainer = document.getElementById(`score-bar-${targetPlayer.id}`);
        if (barContainer) {
            barContainer.style.display = 'flex'; // Show on first score
            const barFill = barContainer.querySelector('.score-bar-fill');
            const percentage = Math.min(targetPlayer.score * 10, 100);
            barFill.style.height = `${percentage}%`;
            // Update tooltip
            barContainer.setAttribute('data-score', `${targetPlayer.score}/10`);
        }
        // Visually remove token from source bee
        sourceBee.renderTokens();

        // Check win condition
        if (targetPlayer.score >= 10) {
            const winModal = document.getElementById('win-modal');
            const winnerText = document.getElementById('winner-text');
            winnerText.innerText = `Player ${targetPlayer.id + 1} Wins!`;
            winnerText.style.color = targetPlayer.color;
            winModal.style.display = 'flex';
        }

        // End chain
        chainMode = null;
        updateBeePanel();

        // Reset highlights
        bees.forEach(b => {
            if (b.element) {
                if (b === selectedBee) b.element.style.border = '3px solid white';
                else b.element.style.border = '';
            }
        });
    } else {
        // Token goes to target bee
        targetBee.tokens.push(tokenValue);
        sourceBee.renderTokens(); // Update source bee visual
        targetBee.renderTokens(); // Update target bee visual
        console.log(`Passed nectar ${tokenValue} from Bee ${sourceBee.id} to Bee ${targetBee.id}`);

        // End chain immediately as per user request
        chainMode = null;
        updateBeePanel();

        // Reset all highlights
        bees.forEach(b => {
            if (b.element) {
                if (b === selectedBee) b.element.style.border = '3px solid white';
                else b.element.style.border = '';
            }
        });
        console.log("Chain ended after one pass.");
    }
}

function handleHexClick(event) {
    let q, r;
    let targetBee = null;

    // 1. Determine coordinates and check for bee
    if (event.target.classList.contains('bee')) {
        // Clicked on a bee element
        targetBee = bees.find(b => b.element === event.target);
        if (targetBee) {
            q = targetBee.q;
            r = targetBee.r;
        }
    } else if (event.target.classList.contains('nectar-token')) {
        // Clicked on a token (which is on top of hex/bee?)
        // Tokens are children of board, absolute positioned.
        // We can find the bee or hex at this position.
        // Actually, tokens might block clicks if they are on top.
        // Let's assume tokens are pointer-events: none or we handle them.
        // Wait, tokens have pointer-events? CSS doesn't say none.
        // Let's handle token clicks by finding the underlying hex/bee.
        // We can use the token's position to find q,r?
        // Or just rely on the fact that tokens are usually on bees or hexes.
        // Let's assume we can get q,r from the token object if we had a map, 
        // but we don't easily.
        // Simpler: Check closest hex? No, token is child of board.
        // Let's try to find the hex based on coordinates if possible, 
        // OR just ignore token clicks if they bubble? 
        // Actually, let's make tokens pointer-events: none in CSS to be safe?
        // Or handle them here.
        // Let's assume for now the user clicks the bee or hex.
        // If they click a token, event.target is token.
        // Let's try to find the bee/hex at the same position.
        const style = window.getComputedStyle(event.target);
        const left = parseInt(style.left);
        const top = parseInt(style.top);
        // Reverse calc q,r? Too complex.
        // Let's just assume tokens pass events or we fix CSS.
        // For now, let's assume the user clicks the bee/hex.
        return; // Ignore token clicks for now, or fix CSS.
    } else {
        // Clicked on a hex (or child of hex)
        const hex = event.target.closest('.hex');
        if (hex) {
            q = parseInt(hex.dataset.q);
            r = parseInt(hex.dataset.r);
            // Check if there is a bee at this location
            targetBee = bees.find(b => b.q === q && b.r === r);
        }
    }

    if (q === undefined || r === undefined) return;

    // 2. Unified Logic

    // If in chain mode, handle passing
    if (chainMode) {
        // We need a target bee for passing
        if (targetBee) {
            if (chainMode.targets.includes(targetBee)) {
                passNectar(chainMode.sourceBee, chainMode.tokenIndex, targetBee);
                return;
            }
        }
        // If clicked elsewhere (empty hex or invalid bee), maybe cancel chain?
        // "click elsewhere to end chain"
        if (!targetBee || !chainMode.targets.includes(targetBee)) {
            console.log("Chain ended (clicked invalid target).");
            chainMode = null;
            updateBeePanel();
            // Reset highlights
            bees.forEach(b => {
                if (b.element) {
                    if (b === selectedBee) b.element.style.border = '3px solid white';
                    else b.element.style.border = '';
                }
            });
            return;
        }
    }

    // If in capture mode, handle target selection
    if (captureMode) {
        // We need a hex (home)
        // Check if this hex is one of the victim's home corners
        const victimPlayer = players[captureMode.victim.ownerId];
        const isHome = victimPlayer.homeCorners.some(h => h.q === q && h.r === r);

        if (isHome) {
            // Check if occupied?
            if (targetBee) {
                console.log("Cannot send captured bee to an occupied home!");
                return;
            }

            executeCapture(q, r);
            return;
        } else {
            console.log("Must choose one of the opponent's starting honeycombs!");
            return;
        }
    }

    // Standard Selection / Movement
    if (targetBee) {
        // Interaction with a bee
        if (targetBee.ownerId === currentPlayerIndex) {
            // Select own bee
            if (selectedBee) {
                selectedBee.element.style.border = ''; // Deselect previous
            }
            selectedBee = targetBee;
            selectedBee.element.style.border = '3px solid white'; // Highlight selection
            console.log(`Selected bee at ${q},${r}`);
            updateBeePanel();
            return;
        } else {
            // Interaction with opponent bee
            if (selectedBee) {
                // Try to attack/move to this bee's position
                moveBee(selectedBee, q, r);
                return;
            }
            console.log("Not your bee!");
            return;
        }
    } else {
        // Interaction with empty hex
        if (selectedBee) {
            moveBee(selectedBee, q, r);
        }
    }
}

function moveBee(bee, targetQ, targetR) {
    // Check if bee has moves remaining
    if (bee.remainingMoves <= 0) {
        console.log("No moves remaining!");
        return;
    }

    // Basic validation: Is it a neighbor?
    // Distance check
    const dist = (Math.abs(bee.q - targetQ) + Math.abs(bee.r - targetR) + Math.abs((bee.q + bee.r) - (targetQ + targetR))) / 2;

    if (dist !== 1) {
        console.log("Invalid move: Not a neighbor");
        return;
    }

    // Check if target is occupied by another bee
    const occupied = bees.find(b => b.q === targetQ && b.r === targetR);
    if (occupied) {
        if (occupied.ownerId !== bee.ownerId) {
            // Combat Logic
            if (occupied.tokens.length === 0) {
                console.log("Invalid move: Blockade (Opponent has no tokens)");
                return;
            } else {
                initiateCapture(bee, occupied);
                return;
            }
        }
        console.log("Invalid move: Occupied by another bee");
        return;
    }

    // Check if target is a honeycomb
    const targetHex = document.querySelector(`.hex[data-q="${targetQ}"][data-r="${targetR}"]`);
    if (targetHex && targetHex.classList.contains('honeycomb')) {
        // Check if it belongs to the current player
        const player = players[bee.ownerId];
        const isMyHome = player.homeCorners.some(h => h.q === targetQ && h.r === targetR);

        if (!isMyHome) {
            console.log("Invalid move: Cannot enter honeycomb that is not yours");
            return;
        }
    }

    // Move the bee
    bee.q = targetQ;
    bee.r = targetR;
    bee.movedThisTurn = true;
    bee.remainingMoves--;
    bee.render();

    // Check for nectar on this hex
    const nectarIndex = nectarTokens.findIndex(n => n.q === targetQ && n.r === targetR);
    if (nectarIndex !== -1) {
        const nectar = nectarTokens[nectarIndex];
        // Pick up nectar
        bee.tokens.push(nectar.value);
        console.log(`Bee picked up nectar value ${nectar.value}. Tokens: ${bee.tokens}`);

        // Remove nectar token from board and array
        nectar.element.remove();
        nectarTokens.splice(nectarIndex, 1);

        // Render token visually attached to bee
        bee.renderTokens();

        updateBeePanel();
    }

    // Check if returned to home honeycomb
    const player = players[bee.ownerId];
    const isHome = player.homeCorners.some(h => h.q === targetQ && h.r === targetR);

    if (isHome && bee.tokens.length > 0) {
        // Secure nectar
        const totalValue = bee.tokens.reduce((a, b) => a + b, 0);
        player.score += totalValue;
        console.log(`Player ${player.id} secured ${totalValue} nectar! Total Score: ${player.score}`);
        bee.tokens = [];
        bee.renderTokens(); // Clear visual tokens
        updateBeePanel();

        // Update Status Bar
        updateStatusBar();

        // Check Win Condition
        if (player.score >= 10) {
            const winModal = document.getElementById('win-modal');
            const winnerText = document.getElementById('winnerText');

            // Sort players by score (descending)
            const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

            // Build the win message with all scores
            const winnerName = gameConfig.playerNames[player.id] || `Player ${player.id + 1}`;
            let message = `<span style="color: ${player.color}; font-size: 48px;">${winnerName} Wins!</span><br><br>`;
            message += '<div style="font-size: 24px; margin-top: 20px;">';
            sortedPlayers.forEach((p, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
                const pName = gameConfig.playerNames[p.id] || `Player ${p.id + 1}`;
                message += `<div style="margin: 10px 0; color: ${p.color};">${medal} ${pName}: ${p.score} / 10</div>`;
            });
            message += '</div>';

            winnerText.innerHTML = message;
            winModal.style.display = 'flex';
        }
    }

    // Deselect if no moves left AND no tokens to use
    if (bee.remainingMoves <= 0 && bee.tokens.length === 0) {
        if (selectedBee) {
            selectedBee.element.style.border = '';
            selectedBee = null;
            updateBeePanel();
        }
    } else {
        updateBeePanel();
    }

    // Enable Next Turn button
    if (!playerHasMovedThisTurn) {
        playerHasMovedThisTurn = true;
        nextTurnBtn.disabled = false;
        nextTurnBtn.classList.remove('disabled'); // Remove disabled class
        nextTurnBtn.style.cursor = 'pointer';
    }

    // Hide the button after use
    moveAllOutBtn.style.display = 'none';
}

function initiateCapture(attacker, victim) {
    console.log("Capture initiated! Choose a home for the captured bee.");
    captureMode = { attacker, victim };

    // Highlight victim's home corners
    const victimPlayer = players[victim.ownerId];
    victimPlayer.homeCorners.forEach(corner => {
        // Find the hex element
        const hex = document.querySelector(`.hex[data-q="${corner.q}"][data-r="${corner.r}"]`);
        if (hex) {
            hex.style.border = '3px solid red';
            hex.style.zIndex = '100'; // Make sure it's visible
        }
    });

    // Show UI message?
    const beePanel = document.getElementById('bee-panel');
    beePanel.style.display = 'block';
    beePanel.innerHTML = '<h3>Capture!</h3><p>Select a home honeycomb for the captured bee.</p>';
}

function executeCapture(targetQ, targetR) {
    const { attacker, victim } = captureMode;

    // Transfer tokens from victim to attacker
    if (victim.tokens.length > 0) {
        attacker.tokens.push(...victim.tokens);
        console.log(`Attacker stole tokens: ${victim.tokens}`);
        victim.tokens = [];
        attacker.renderTokens();
        victim.renderTokens();
    }

    // 1. Move victim to target home
    // Capture old position of victim (which is where attacker will go)
    const oldVictimQ = victim.q;
    const oldVictimR = victim.r;

    // Move victim
    victim.q = targetQ;
    victim.r = targetR;
    victim.movedThisTurn = true; // Victim moved (forced)
    victim.render();

    // 2. Move attacker to target
    attacker.q = oldVictimQ; // Attacker moves to victim's original spot
    attacker.r = oldVictimR;
    attacker.movedThisTurn = true;
    attacker.remainingMoves--;
    attacker.render();

    // Check for nectar on target hex (unlikely if occupied, but possible if victim was on nectar)
    // Actually, if victim was on nectar, they would have picked it up.
    // But if there's a token UNDER the victim that wasn't picked up (e.g. max capacity? No max capacity).
    // So usually no nectar on ground under a bee.

    captureMode = null;

    // Reset highlights
    const victimPlayer = players[victim.ownerId];
    victimPlayer.homeCorners.forEach(corner => {
        const hex = document.querySelector(`.hex[data-q="${corner.q}"][data-r="${corner.r}"]`);
        if (hex) {
            hex.style.border = '';
            hex.style.zIndex = '';
        }
    });

    updateBeePanel();

    // Enable Next Turn
    if (!playerHasMovedThisTurn) {
        playerHasMovedThisTurn = true;
        nextTurnBtn.disabled = false;
        nextTurnBtn.style.opacity = '1';
        nextTurnBtn.style.cursor = 'pointer';
    }
}

// Options Menu Logic
function toggleOptions() {
    const modal = document.getElementById('options-modal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        updateOptionsContent();
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

function updateOptionsContent() {
    const list = document.getElementById('player-scores-list');
    list.innerHTML = '';

    // Sort players: Current player first, then others in order
    const orderedPlayers = [
        players[currentPlayerIndex],
        ...players.filter((_, i) => i !== currentPlayerIndex)
    ];

    orderedPlayers.forEach(player => {
        const item = document.createElement('div');
        item.className = 'score-item';

        const name = document.createElement('span');
        name.innerText = `PLAYER ${player.id + 1}`;
        name.style.color = player.color;

        const score = document.createElement('span');
        score.innerText = `${player.score} / 10`;
        score.style.color = 'white';

        item.appendChild(name);
        item.appendChild(score);
        list.appendChild(item);
    });
}

function endGame() {
    if (confirm("Are you sure you want to end the game?")) {
        location.reload(); // Simple reload to go back to main menu
    }
}

board.addEventListener('click', handleHexClick);

initBoard();
