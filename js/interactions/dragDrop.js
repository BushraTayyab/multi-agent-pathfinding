import { getKey } from '../utils/gridHelpers.js';
import { CELL_SIZE, GRID_SIZE } from '../utils/constants.js';

export class DragDropManager {
    constructor(canvas, onUpdate) {
        this.canvas = canvas;
        this.onUpdate = onUpdate;
        this.dragTarget = null;
        this.setupEventListeners();
    }

    getCellFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
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

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('touchstart', (e) => this.onMouseDown(e));
        window.addEventListener('touchmove', (e) => this.onMouseMove(e));
        window.addEventListener('touchend', () => this.onMouseUp());
    }

    onMouseDown(e) {
        e.preventDefault();
        const cell = this.getCellFromEvent(e);
        if (!cell) return;
        
        if (this.onUpdate && this.onUpdate.getDragTarget) {
            this.dragTarget = this.onUpdate.getDragTarget(cell);
            if (!this.dragTarget && this.onUpdate.toggleWall) {
                this.onUpdate.toggleWall(cell);
            }
        }
    }

    onMouseMove(e) {
        if (!this.dragTarget || !this.onUpdate) return;
        const cell = this.getCellFromEvent(e);
        if (cell && this.onUpdate.moveAgent) {
            this.onUpdate.moveAgent(this.dragTarget, cell);
        }
    }

    onMouseUp() {
        this.dragTarget = null;
        if (this.onUpdate && this.onUpdate.onDragEnd) {
            this.onUpdate.onDragEnd();
        }
    }
}