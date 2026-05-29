import { DrawEngine } from './draw.js';

export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.drawEngine = new DrawEngine(this.ctx);
    }

    render(state) {
        this.drawEngine.clear();
        this.drawEngine.drawGrid(state.walls);
        
        if (state.runnerPath && state.runnerPath.length > 0) {
            this.drawEngine.drawPath(state.runnerPath);
        }
        
        this.drawEngine.drawGoal(state.goal);
        this.drawEngine.drawRunner(state.runner);
        this.drawEngine.drawHunter(state.hunter);
    }
}