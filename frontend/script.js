// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'http://127.0.0.1:8000/api';
const GRID_SIZE = 21;
let CELL_SIZE = 550 / GRID_SIZE;

// ============================================
// DOM REFERENCES
// ============================================
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const nodesCountSpan = document.getElementById('nodesCount');
const pathLengthSpan = document.getElementById('pathLength');
const hunterStepsSpan = document.getElementById('hunterSteps');
const statusMsg = document.getElementById('statusMsg');

// ============================================
// STATE
// ============================================
let gameState = null;
let isRunning = false;
let pollInterval = null;
let dragTarget = null;

// ============================================
// API HELPERS
// ============================================
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

// ============================================
// GAME FUNCTIONS
// ============================================
async function getState() {
    return await apiCall('/state');
}

async function resetGame() {
    const result = await apiCall('/reset', 'POST');
    console.log('🔄 Reset complete');
    return result;
}

async function startGame() {
    const result = await apiCall('/start', 'POST');
    console.log('▶️ Game started');
    return result;
}

async function pauseGame() {
    const result = await apiCall('/pause', 'POST');
    console.log('⏸ Game paused');
    return result;
}

async function toggleWall(x, y) {
    return await apiCall('/toggle-wall', 'POST', { x, y });
}

async function clearWalls() {
    return await apiCall('/clear-walls', 'POST');
}

async function randomWalls() {
    return await apiCall('/random-walls', 'POST');
}

async function moveAgent(type, x, y) {
    return await apiCall('/move-agent', 'POST', {
        agent_type: type,
        x: x,
        y: y
    });
}

// ============================================
// RENDER FUNCTION
// ============================================
function render(state) {
    if (!state) {
        console.warn('⚠️ No state to render');
        return;
    }
    
    gameState = state;
    const data = state.state || state;
    const runnerPath = state.runner_path || [];
    
    // Update stats
    nodesCountSpan.textContent = state.runner_explored || 0;
    pathLengthSpan.textContent = runnerPath.length > 0 ? runnerPath.length - 1 : 0;
    hunterStepsSpan.textContent = state.hunter_steps || 0;
    
    // Update status
    if (state.game_over) {
        if (state.winner === 'runner') {
            statusMsg.innerHTML = '🏆 RUNNER ESCAPED! VICTORY! 🏆';
            statusMsg.style.borderLeftColor = '#2effaa';
        } else if (state.winner === 'hunter') {
            statusMsg.innerHTML = '💀 HUNTER CAUGHT THE RUNNER! GAME OVER 💀';
            statusMsg.style.borderLeftColor = '#ff4444';
        }
    } else if (data.status === 'active') {
        statusMsg.innerHTML = '⚔️ Chase in progress...';
        statusMsg.style.borderLeftColor = '#7caeff';
    } else if (data.status === 'paused') {
        statusMsg.innerHTML = '⏸ Paused. Press RUN to continue.';
        statusMsg.style.borderLeftColor = '#ffaa44';
    } else {
        statusMsg.innerHTML = '🧠 Ready! Press RUN to start.';
        statusMsg.style.borderLeftColor = '#7caeff';
    }
    
    // Draw grid
    drawGrid(data, runnerPath);
}

function drawGrid(data, runnerPath) {
    const walls = data.walls || [];
    const runner = data.runner || { x: 2, y: 10 };
    const hunter = data.hunter || { x: 18, y: 10 };
    const goal = data.goal || { x: 10, y: 18 };
    
    const size = data.grid_size || GRID_SIZE;
    CELL_SIZE = canvas.width / size;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = i * CELL_SIZE;
            const y = j * CELL_SIZE;
            
            const isWall = walls.some(w => w.x === i && w.y === j);
            
            if (isWall) {
                ctx.fillStyle = '#1a1f2e';
                ctx.fillRect(x, y, CELL_SIZE - 0.5, CELL_SIZE - 0.5);
                ctx.fillStyle = '#2a2f44';
                ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            } else {
                ctx.fillStyle = '#0f1422';
                ctx.fillRect(x, y, CELL_SIZE - 0.5, CELL_SIZE - 0.5);
                ctx.fillStyle = '#161c30';
                ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
            
            ctx.strokeStyle = '#20273f';
            ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }
    
    // Draw Runner path
    if (runnerPath && runnerPath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(runnerPath[0].x * CELL_SIZE + CELL_SIZE / 2, runnerPath[0].y * CELL_SIZE + CELL_SIZE / 2);
        for (let i = 1; i < runnerPath.length; i++) {
            ctx.lineTo(runnerPath[i].x * CELL_SIZE + CELL_SIZE / 2, runnerPath[i].y * CELL_SIZE + CELL_SIZE / 2);
        }
        ctx.strokeStyle = '#aaffdd';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffcc';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
    }
    
    // Draw Goal
    ctx.fillStyle = '#f5b042';
    ctx.beginPath();
    ctx.arc(goal.x * CELL_SIZE + CELL_SIZE / 2, goal.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffdd88';
    ctx.beginPath();
    ctx.arc(goal.x * CELL_SIZE + CELL_SIZE / 2, goal.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.18, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffaa33';
    ctx.font = `${CELL_SIZE * 0.5}px monospace`;
    ctx.fillText('⭐', goal.x * CELL_SIZE + CELL_SIZE * 0.25, goal.y * CELL_SIZE + CELL_SIZE * 0.7);
    
    // Draw Runner
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#2effaa';
    ctx.fillStyle = '#3ac569';
    ctx.beginPath();
    ctx.arc(runner.x * CELL_SIZE + CELL_SIZE / 2, runner.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.32, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#b0ffd0';
    ctx.beginPath();
    ctx.arc(runner.x * CELL_SIZE + CELL_SIZE / 2, runner.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.16, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw Hunter
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ff4444';
    ctx.fillStyle = '#e34d4d';
    ctx.beginPath();
    ctx.arc(hunter.x * CELL_SIZE + CELL_SIZE / 2, hunter.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.32, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffa0a0';
    ctx.beginPath();
    ctx.arc(hunter.x * CELL_SIZE + CELL_SIZE / 2, hunter.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE * 0.14, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(hunter.x * CELL_SIZE + CELL_SIZE / 2 - 3, hunter.y * CELL_SIZE + CELL_SIZE / 2 - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// ============================================
// GAME LOOP
// ============================================
async function gameLoop() {
    if (!isRunning) return;
    
    try {
        const state = await apiCall('/tick', 'POST');
        render(state);
        
        if (state.game_over) {
            stopGame();
        }
    } catch (error) {
        console.error('❌ Game loop error:', error);
        stopGame();
    }
}

function startGameLoop() {
    if (pollInterval) return;
    
    console.log('▶️ Starting game loop');
    isRunning = true;
    
    startGame().then(state => {
        render(state);
    }).catch(error => {
        console.error('❌ Failed to start:', error);
        isRunning = false;
    });
    
    pollInterval = setInterval(gameLoop, 500);
    document.getElementById('runBtn').textContent = '⏸ PAUSE';
}

function stopGame() {
    console.log('⏹ Stopping game');
    isRunning = false;
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    pauseGame().then(state => {
        render(state);
    }).catch(() => {});
    document.getElementById('runBtn').textContent = '▶ RUN';
}

// ============================================
// UI CONTROLS
// ============================================
document.getElementById('runBtn').addEventListener('click', () => {
    if (isRunning) {
        stopGame();
    } else {
        startGameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', stopGame);

document.getElementById('resetBtn').addEventListener('click', async () => {
    console.log('🔄 RESET button clicked');
    stopGame();
    try {
        const state = await resetGame();
        render(state);
        document.getElementById('runBtn').textContent = '▶ RUN';
        statusMsg.innerHTML = '🔄 Reset complete. Press RUN to start.';
    } catch (error) {
        console.error('❌ Reset failed:', error);
    }
});

document.getElementById('clearWallsBtn').addEventListener('click', async () => {
    if (isRunning) stopGame();
    try {
        const state = await clearWalls();
        render(state);
        statusMsg.innerHTML = '🗑 All walls cleared.';
    } catch (error) {
        console.error('❌ Clear walls failed:', error);
    }
});

document.getElementById('randomWallsBtn').addEventListener('click', async () => {
    if (isRunning) stopGame();
    try {
        const state = await randomWalls();
        render(state);
        statusMsg.innerHTML = '🎲 Random walls generated!';
    } catch (error) {
        console.error('❌ Random walls failed:', error);
    }
});

// ============================================
// INTERACTIONS: Drag & Click
// ============================================
function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    if (canvasX < 0 || canvasY < 0) return null;
    
    const gridX = Math.floor(canvasX / CELL_SIZE);
    const gridY = Math.floor(canvasY / CELL_SIZE);
    
    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
        return { x: gridX, y: gridY };
    }
    return null;
}

function getAgentAt(cell) {
    if (!gameState) return null;
    const data = gameState.state || gameState;
    const runner = data.runner;
    const hunter = data.hunter;
    const goal = data.goal;
    
    if (runner && runner.x === cell.x && runner.y === cell.y) return 'runner';
    if (hunter && hunter.x === cell.x && hunter.y === cell.y) return 'hunter';
    if (goal && goal.x === cell.x && goal.y === cell.y) return 'goal';
    return null;
}

async function handleCanvasClick(e) {
    if (isRunning) return;
    
    const cell = getCellFromEvent(e);
    if (!cell) return;
    
    const agent = getAgentAt(cell);
    if (agent) {
        dragTarget = agent;
        return;
    }
    
    try {
        await toggleWall(cell.x, cell.y);
        const state = await getState();
        render(state);
    } catch (error) {
        console.error('Toggle wall failed:', error);
    }
}

async function handleCanvasMove(e) {
    if (!dragTarget) return;
    
    const cell = getCellFromEvent(e);
    if (!cell) return;
    
    if (gameState && gameState.state) {
        const walls = gameState.state.walls || [];
        if (walls.some(w => w.x === cell.x && w.y === cell.y)) return;
    }
    
    try {
        await moveAgent(dragTarget, cell.x, cell.y);
        const state = await getState();
        render(state);
    } catch (error) {
        console.error('Move agent failed:', error);
    }
}

async function handleCanvasUp() {
    if (dragTarget) {
        dragTarget = null;
        try {
            const state = await getState();
            render(state);
        } catch (error) {
            console.error('Get state failed:', error);
        }
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
canvas.addEventListener('mousedown', handleCanvasClick);
window.addEventListener('mousemove', handleCanvasMove);
window.addEventListener('mouseup', handleCanvasUp);
canvas.addEventListener('touchstart', handleCanvasClick);
window.addEventListener('touchmove', handleCanvasMove);
window.addEventListener('touchend', handleCanvasUp);

// ============================================
// INITIAL LOAD
// ============================================
async function init() {
    console.log('🚀 Initializing frontend...');
    console.log('📍 API URL:', API_BASE);
    
    try {
        const state = await getState();
        render(state);
        statusMsg.innerHTML = '🧠 Ready! Press RUN to start the chase.';
        console.log('✅ Initialized successfully');
    } catch (error) {
        console.error('❌ Init error:', error);
        statusMsg.innerHTML = `
            ❌ Cannot connect to backend.<br>
            <small style="color:#6a7fa0;">
                Make sure server is running on port 8000
            </small>
        `;
    }
}

// Start!
init();