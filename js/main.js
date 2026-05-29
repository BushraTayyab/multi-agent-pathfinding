import { GRID_SIZE } from './utils/constants.js';
import { areEqual, getKey } from './utils/gridHelpers.js';
import { aStar } from './core/astar.js';
import { Runner } from './agents/runner.js';
import { Hunter } from './agents/hunter.js';
import { CanvasManager } from './rendering/canvas.js';
import { DragDropManager } from './interactions/dragDrop.js';
import { ControlsManager } from './interactions/controls.js';

class Game {
    constructor() {
        this.walls = new Set();
        this.runner = new Runner(2, 10);
        this.hunter = new Hunter(18, 10);
        this.goal = { x: 10, y: 18 };
        this.isActive = false;
        this.animationFrame = null;
        this.lastTickTime = 0;
        this.speed = 1;
        
        this.canvasManager = new CanvasManager('gridCanvas');
        this.setupInteractions();
        this.setupControls();
        this.updateRunnerPath();
        this.render();
    }

    setupInteractions() {
        this.dragManager = new DragDropManager(
            document.getElementById('gridCanvas'),
            {
                getDragTarget: (cell) => this.getDragTarget(cell),
                moveAgent: (target, cell) => this.moveAgent(target, cell),
                toggleWall: (cell) => this.toggleWall(cell),
                onDragEnd: () => this.onDragEnd()
            }
        );
    }

    getDragTarget(cell) {
        if (areEqual(cell, this.runner.position)) return 'runner';
        if (areEqual(cell, this.hunter.position)) return 'hunter';
        if (areEqual(cell, this.goal)) return 'goal';
        return null;
    }

    moveAgent(target, cell) {
        const key = getKey(cell.x, cell.y);
        if (this.walls.has(key)) return;
        
        if (target === 'runner' && !areEqual(cell, this.hunter.position) && !areEqual(cell, this.goal)) {
            this.runner.setPosition(cell.x, cell.y);
        } else if (target === 'hunter' && !areEqual(cell, this.runner.position) && !areEqual(cell, this.goal)) {
            this.hunter.setPosition(cell.x, cell.y);
        } else if (target === 'goal' && !areEqual(cell, this.runner.position) && !areEqual(cell, this.hunter.position)) {
            this.goal = { x: cell.x, y: cell.y };
        }
        
        this.updateRunnerPath();
        this.render();
    }

    toggleWall(cell) {
        const key = getKey(cell.x, cell.y);
        if (areEqual(cell, this.runner.position) || 
            areEqual(cell, this.hunter.position) || 
            areEqual(cell, this.goal)) return;
        
        if (this.walls.has(key)) {
            this.walls.delete(key);
        } else {
            this.walls.add(key);
        }
        
        this.updateRunnerPath();
        this.render();
    }

    onDragEnd() {
        this.updateRunnerPath();
        this.render();
    }

    updateRunnerPath() {
        const result = aStar(this.runner.position, this.goal, this.walls);
        this.runner.currentPath = result.path;
        document.getElementById('nodesCount').innerText = result.exploredCount;
        document.getElementById('pathLength').innerText = Math.max(0, result.path.length - 1);
    }

    setupControls() {
        this.controlsManager = new ControlsManager(
            () => this.reset(),
            () => this.clearWalls(),
            () => this.randomWalls(),
            () => this.toggleRun(),
            () => this.step(),
            () => this.stop(),
            (speed) => this.speed = speed
        );
    }

    reset() {
        this.stop();
        this.walls.clear();
        this.runner = new Runner(2, 10);
        this.hunter = new Hunter(18, 10);
        this.goal = { x: 10, y: 18 };
        this.hunter.stepsTaken = 0;
        document.getElementById('hunterSteps').innerText = '0';
        this.updateRunnerPath();
        this.render();
        document.getElementById('statusMsg').innerHTML = '✨ Reset complete. Press RUN to start.';
    }

    clearWalls() {
        this.walls.clear();
        this.updateRunnerPath();
        this.render();
        document.getElementById('statusMsg').innerHTML = '🗑 All walls cleared.';
    }

    randomWalls() {
        this.walls.clear();
        for (let i = 0; i < GRID_SIZE * 2.5; i++) {
            const randX = Math.floor(Math.random() * GRID_SIZE);
            const randY = Math.floor(Math.random() * GRID_SIZE);
            const cell = { x: randX, y: randY };
            if (!areEqual(cell, this.runner.position) && 
                !areEqual(cell, this.hunter.position) && 
                !areEqual(cell, this.goal)) {
                this.walls.add(getKey(randX, randY));
            }
        }
        this.updateRunnerPath();
        this.render();
    }

    tick() {
        if (!this.isActive) return false;
        
        const explored = this.runner.updatePath(this.goal, this.walls);
        document.getElementById('nodesCount').innerText = explored;
        
        this.runner.moveOneStep();
        document.getElementById('pathLength').innerText = Math.max(0, this.runner.currentPath.length - 1);
        
        if (this.runner.hasReached(this.goal)) {
            this.isActive = false;
            document.getElementById('statusMsg').innerHTML = '🏆 RUNNER ESCAPED! VICTORY! 🏆';
            this.render();
            return false;
        }
        
        this.hunter.move(this.runner.position, this.goal, this.walls);
        document.getElementById('hunterSteps').innerText = this.hunter.stepsTaken;
        
        if (this.hunter.hasCaught(this.runner.position)) {
            this.isActive = false;
            document.getElementById('statusMsg').innerHTML = '💀 HUNTER CAUGHT THE RUNNER! GAME OVER 💀';
            this.render();
            return false;
        }
        
        this.updateRunnerPath();
        this.render();
        return true;
    }

    animationLoop(now) {
        if (!this.isActive) return;
        
        const stepDelay = 500 - (this.speed * 250);
        const delay = Math.max(40, stepDelay);
        
        if (now - this.lastTickTime >= delay) {
            this.tick();
            this.lastTickTime = now;
        }
        
        this.animationFrame = requestAnimationFrame((t) => this.animationLoop(t));
    }

    toggleRun() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.isActive = true;
        this.lastTickTime = performance.now();
        document.getElementById('statusMsg').innerHTML = '⚔️ Adversarial chase in progress... ⚔️';
        this.animationFrame = requestAnimationFrame((t) => this.animationLoop(t));
    }

    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        document.getElementById('statusMsg').innerHTML = '⏸ Paused. Press RUN to continue.';
        this.render();
    }

    step() {
        if (this.isActive) this.stop();
        this.tick();
    }

    render() {
        const state = {
            walls: this.walls,
            runnerPath: this.runner.currentPath,
            goal: this.goal,
            runner: this.runner.position,
            hunter: this.hunter.position
        };
        this.canvasManager.render(state);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});