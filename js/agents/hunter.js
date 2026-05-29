import { aStar } from '../core/astar.js';
import { manhattanDistance } from '../core/heuristics.js';

export class Hunter {
    constructor(x, y) {
        this.position = { x, y };
        this.stepsTaken = 0;
    }

    setPosition(x, y) {
        this.position = { x, y };
    }

    predictIntercept(runnerPos, goal, walls, predictionDepth = 3) {
        const runnerPath = aStar(runnerPos, goal, walls).path;
        
        for (let step = 0; step < Math.min(runnerPath.length, predictionDepth + 5); step++) {
            const futureRunner = runnerPath[step];
            if (!futureRunner) break;
            
            const hunterDist = manhattanDistance(this.position, futureRunner);
            if (hunterDist <= step) {
                return futureRunner;
            }
        }
        return runnerPos;
    }

    getNextMove(runnerPos, goal, walls) {
        const interceptPoint = this.predictIntercept(runnerPos, goal, walls);
        const pathToIntercept = aStar(this.position, interceptPoint, walls).path;
        
        if (pathToIntercept.length >= 2) {
            const nextPos = pathToIntercept[1];
            if (!(nextPos.x === this.position.x && nextPos.y === this.position.y)) {
                this.stepsTaken++;
            }
            return nextPos;
        }
        return this.position;
    }

    move(runnerPos, goal, walls) {
        const nextPos = this.getNextMove(runnerPos, goal, walls);
        this.position = nextPos;
        return this.position;
    }

    hasCaught(runnerPos) {
        return this.position.x === runnerPos.x && this.position.y === runnerPos.y;
    }
}