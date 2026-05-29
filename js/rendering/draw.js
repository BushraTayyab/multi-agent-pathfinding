import { CELL_SIZE, COLORS } from '../utils/constants.js';

export class DrawEngine {
    constructor(ctx) {
        this.ctx = ctx;
    }

    clear() {
        this.ctx.clearRect(0, 0, 550, 550);
    }

    drawGrid(walls) {
        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 21; j++) {
                const x = i * CELL_SIZE;
                const y = j * CELL_SIZE;
                
                if (walls.has(`${i},${j}`)) {
                    this.ctx.fillStyle = COLORS.WALL_DARK;
                    this.ctx.fillRect(x, y, CELL_SIZE - 0.5, CELL_SIZE - 0.5);
                    this.ctx.fillStyle = COLORS.WALL_LIGHT;
                    this.ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else {
                    this.ctx.fillStyle = COLORS.CELL_DARK;
                    this.ctx.fillRect(x, y, CELL_SIZE - 0.5, CELL_SIZE - 0.5);
                    this.ctx.fillStyle = COLORS.CELL_LIGHT;
                    this.ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }
                
                this.ctx.strokeStyle = COLORS.GRID_LINE;
                this.ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    drawPath(path) {
        if (!path || path.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x * CELL_SIZE + CELL_SIZE / 2, path[0].y * CELL_SIZE + CELL_SIZE / 2);
        
        for (let i = 1; i < path.length; i++) {
            this.ctx.lineTo(path[i].x * CELL_SIZE + CELL_SIZE / 2, path[i].y * CELL_SIZE + CELL_SIZE / 2);
        }
        
        this.ctx.strokeStyle = COLORS.PATH_GLOW;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = "#00ffcc";
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.ctx.lineWidth = 1;
    }

    drawGoal(goal) {
        const x = goal.x * CELL_SIZE + CELL_SIZE / 2;
        const y = goal.y * CELL_SIZE + CELL_SIZE / 2;
        
        this.ctx.fillStyle = COLORS.GOAL;
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#ffdd88";
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.18, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#ffaa33";
        this.ctx.font = `${CELL_SIZE * 0.5}px monospace`;
        this.ctx.fillText("⭐", goal.x * CELL_SIZE + CELL_SIZE * 0.25, goal.y * CELL_SIZE + CELL_SIZE * 0.7);
    }

    drawRunner(runner) {
        const x = runner.x * CELL_SIZE + CELL_SIZE / 2;
        const y = runner.y * CELL_SIZE + CELL_SIZE / 2;
        
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#2effaa";
        this.ctx.fillStyle = COLORS.RUNNER;
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.32, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#b0ffd0";
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.16, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawHunter(hunter) {
        const x = hunter.x * CELL_SIZE + CELL_SIZE / 2;
        const y = hunter.y * CELL_SIZE + CELL_SIZE / 2;
        
        this.ctx.fillStyle = COLORS.HUNTER;
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.32, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#ffa0a0";
        this.ctx.beginPath();
        this.ctx.arc(x, y, CELL_SIZE * 0.14, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(x - 4, y - 4, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}