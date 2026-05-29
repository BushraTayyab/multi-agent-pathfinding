import { aStar } from '../core/astar.js';

export class Runner {
    constructor(x, y) {
        this.position = { x, y };
        this.currentPath = [];
        this.stepsTaken = 0;
    }

    setPosition(x, y) {
        this.position = { x, y };
    }

    updatePath(goal, walls) {
        const result = aStar(this.position, goal, walls);
        this.currentPath = result.path;
        return result.exploredCount;
    }

    moveOneStep() {
        if (this.currentPath.length >= 2) {
            this.position = { ...this.currentPath[1] };
            this.stepsTaken++;
            return true;
        }
        return false;
    }

    hasReached(goal) {
        return this.position.x === goal.x && this.position.y === goal.y;
    }

    getDistanceTo(goal) {
        return Math.abs(this.position.x - goal.x) + Math.abs(this.position.y - goal.y);
    }
}