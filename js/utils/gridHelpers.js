import { GRID_SIZE } from './constants.js';

export function isWalkable(x, y, walls, ignoreAgents = false) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (walls.has(`${x},${y}`)) return false;
    return true;
}

export function getNeighbors(node, walls) {
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const neighbors = [];
    
    for (const [dx, dy] of directions) {
        const nx = node.x + dx;
        const ny = node.y + dy;
        if (isWalkable(nx, ny, walls)) {
            neighbors.push({ x: nx, y: ny });
        }
    }
    return neighbors;
}

export function getKey(x, y) {
    return `${x},${y}`;
}

export function areEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}