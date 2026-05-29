import { PriorityQueue } from './priorityQueue.js';
import { manhattanDistance } from './heuristics.js';
import { getNeighbors, getKey } from '../utils/gridHelpers.js';

export function aStar(start, goal, walls) {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = getKey(start.x, start.y);
    gScore.set(startKey, 0);
    fScore.set(startKey, manhattanDistance(start, goal));
    openSet.push(start, fScore.get(startKey));
    
    const exploredSet = new Set();
    
    while (!openSet.isEmpty()) {
        const current = openSet.pop();
        const curKey = getKey(current.x, current.y);
        exploredSet.add(curKey);
        
        if (current.x === goal.x && current.y === goal.y) {
            const path = [];
            let cur = current;
            while (cameFrom.has(getKey(cur.x, cur.y))) {
                path.unshift(cur);
                cur = cameFrom.get(getKey(cur.x, cur.y));
            }
            path.unshift(start);
            return { path, exploredCount: exploredSet.size };
        }
        
        const neighbors = getNeighbors(current, walls);
        for (const neighbor of neighbors) {
            const tentativeG = (gScore.get(curKey) || Infinity) + 1;
            const neighKey = getKey(neighbor.x, neighbor.y);
            
            if (tentativeG < (gScore.get(neighKey) || Infinity)) {
                cameFrom.set(neighKey, current);
                gScore.set(neighKey, tentativeG);
                const fVal = tentativeG + manhattanDistance(neighbor, goal);
                fScore.set(neighKey, fVal);
                openSet.push(neighbor, fVal);
            }
        }
    }
    
    return { path: [], exploredCount: exploredSet.size };
}