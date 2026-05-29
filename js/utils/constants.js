// Game Constants
export const GRID_SIZE = 21;
export const CELL_SIZE = 550 / GRID_SIZE;

// Agent Types
export const AGENT = {
    RUNNER: 'runner',
    HUNTER: 'hunter',
    GOAL: 'goal'
};

// Game States
export const GAME_STATE = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    RUNNER_WIN: 'runner_win',
    HUNTER_WIN: 'hunter_win'
};

// Direction Vectors
export const DIRECTIONS = [
    { dx: 0, dy: 1 },  // down
    { dx: 1, dy: 0 },  // right
    { dx: 0, dy: -1 }, // up
    { dx: -1, dy: 0 }  // left
];

// Colors
export const COLORS = {
    WALL_DARK: '#1a1f2e',
    WALL_LIGHT: '#2a2f44',
    CELL_DARK: '#0f1422',
    CELL_LIGHT: '#161c30',
    GRID_LINE: '#20273f',
    PATH_GLOW: '#aaffdd',
    GOAL: '#f5b042',
    RUNNER: '#3ac569',
    HUNTER: '#e34d4d'
};