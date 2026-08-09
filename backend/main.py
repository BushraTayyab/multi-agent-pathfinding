from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import heapq

app = Flask(__name__)
CORS(app)

# ============================================
# GAME STATE (Global variables)
# ============================================
GRID_SIZE = 21
runner = (2, 10)
hunter = (18, 10)
goal = (10, 18)
walls = []
status = "paused"  # "paused", "active", "runner_win", "hunter_win"
winner = None
runner_path = []
runner_explored = 0
hunter_steps = 0

# ============================================
# A* ALGORITHM
# ============================================
def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def get_neighbors(pos, walls_set):
    x, y = pos
    neighbors = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
    valid = []
    for nx, ny in neighbors:
        if 0 <= nx < GRID_SIZE and 0 <= ny < GRID_SIZE and (nx, ny) not in walls_set:
            valid.append((nx, ny))
    return valid

def find_path(start, goal_pos, walls_list):
    walls_set = set(walls_list)
    open_set = []
    counter = 0
    heapq.heappush(open_set, (heuristic(start, goal_pos), counter, start))
    came_from = {}
    g_score = {start: 0}
    explored = set()
    
    while open_set:
        _, _, current = heapq.heappop(open_set)
        explored.add(current)
        
        if current == goal_pos:
            path = []
            cur = current
            while cur in came_from:
                path.append(cur)
                cur = came_from[cur]
            path.append(start)
            path.reverse()
            return path, len(explored)
        
        for neighbor in get_neighbors(current, walls_set):
            tentative_g = g_score.get(current, float('inf')) + 1
            if tentative_g < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_val = tentative_g + heuristic(neighbor, goal_pos)
                counter += 1
                heapq.heappush(open_set, (f_val, counter, neighbor))
    
    return [], len(explored)

# ============================================
# STATE MANAGEMENT
# ============================================
def update_runner_path():
    global runner_path, runner_explored
    path, explored = find_path(runner, goal, walls)
    runner_path = path
    runner_explored = explored
    return path

def get_state_dict():
    """Return clean state dictionary"""
    return {
        "state": {
            "grid_size": GRID_SIZE,
            "walls": [{"x": w[0], "y": w[1]} for w in walls],
            "runner": {"x": runner[0], "y": runner[1]},
            "hunter": {"x": hunter[0], "y": hunter[1]},
            "goal": {"x": goal[0], "y": goal[1]},
            "status": status,
            "winner": winner
        },
        "runner_path": [{"x": p[0], "y": p[1]} for p in runner_path],
        "runner_explored": runner_explored,
        "hunter_steps": hunter_steps,
        "game_over": status in ["runner_win", "hunter_win"],
        "winner": winner
    }

# ============================================
# API ENDPOINTS
# ============================================
@app.route('/')
def root():
    return jsonify({"message": "Multi-Agent Pathfinding API", "status": "running"})

@app.route('/api/state')
def api_state():
    return jsonify(get_state_dict())

@app.route('/api/reset', methods=['POST'])
def api_reset():
    global runner, hunter, goal, walls, status, winner, runner_path, runner_explored, hunter_steps
    runner = (2, 10)
    hunter = (18, 10)
    goal = (10, 18)
    walls = []
    status = "paused"
    winner = None
    runner_path = []
    runner_explored = 0
    hunter_steps = 0
    update_runner_path()
    return jsonify(get_state_dict())

@app.route('/api/toggle-wall', methods=['POST'])
def api_toggle_wall():
    global walls
    data = request.json
    x, y = data['x'], data['y']
    point = (x, y)
    if point in walls:
        walls.remove(point)
    else:
        if point != runner and point != hunter and point != goal:
            walls.append(point)
    update_runner_path()
    return jsonify(get_state_dict())

@app.route('/api/clear-walls', methods=['POST'])
def api_clear_walls():
    global walls
    walls = []
    update_runner_path()
    return jsonify(get_state_dict())

@app.route('/api/move-agent', methods=['POST'])
def api_move_agent():
    global runner, hunter, goal
    data = request.json
    agent_type = data['agent_type']
    x, y = data['x'], data['y']
    point = (x, y)
    
    if point in walls:
        return jsonify({"error": "Invalid position"}), 400
    
    if agent_type == "runner":
        if point != hunter and point != goal:
            runner = point
            update_runner_path()
    elif agent_type == "hunter":
        if point != runner and point != goal:
            hunter = point
    elif agent_type == "goal":
        if point != runner and point != hunter:
            goal = point
            update_runner_path()
    else:
        return jsonify({"error": "Invalid agent type"}), 400
    
    return jsonify(get_state_dict())

@app.route('/api/start', methods=['POST'])
def api_start():
    global status
    if status in ["runner_win", "hunter_win"]:
        api_reset()
    status = "active"
    update_runner_path()
    return jsonify(get_state_dict())

@app.route('/api/pause', methods=['POST'])
def api_pause():
    global status
    status = "paused"
    return jsonify(get_state_dict())

@app.route('/api/tick', methods=['POST'])
def api_tick():
    """✅ FIXED: Properly updates state on each tick"""
    global runner, hunter, status, winner, hunter_steps
    
    print(f"🐛 TICK - Status: {status}")
    
    if status != "active":
        return jsonify(get_state_dict())
    
    # 1. Move Runner
    update_runner_path()
    if len(runner_path) >= 2:
        old_runner = runner
        runner = runner_path[1]
        print(f"🏃 Runner: {old_runner} → {runner}")
    else:
        print("⚠️ No path for Runner!")
    
    # 2. Check if Runner reached goal
    if runner == goal:
        status = "runner_win"
        winner = "runner"
        print("🏆 RUNNER WINS!")
        return jsonify(get_state_dict())
    
    # 3. Move Hunter (simple chase using A*)
    path_to_runner, _ = find_path(hunter, runner, walls)
    if len(path_to_runner) >= 2:
        old_hunter = hunter
        hunter = path_to_runner[1]
        hunter_steps += 1
        print(f"🔴 Hunter: {old_hunter} → {hunter}")
    else:
        print("⚠️ Hunter can't move!")
    
    # 4. Check if Hunter caught Runner
    if hunter == runner:
        status = "hunter_win"
        winner = "hunter"
        print("💀 HUNTER WINS!")
        return jsonify(get_state_dict())
    
    # 5. Update path for next tick
    update_runner_path()
    
    return jsonify(get_state_dict())

@app.route('/api/random-walls', methods=['POST'])
def api_random_walls():
    global walls
    walls = []
    count = int(GRID_SIZE * 1.5)
    for _ in range(count):
        rand_x = random.randint(0, GRID_SIZE - 1)
        rand_y = random.randint(0, GRID_SIZE - 1)
        point = (rand_x, rand_y)
        if point != runner and point != hunter and point != goal:
            walls.append(point)
    update_runner_path()
    return jsonify(get_state_dict())

@app.route('/api/debug', methods=['GET'])
def api_debug():
    """Debug endpoint to see what's happening"""
    return jsonify({
        "runner": runner,
        "hunter": hunter,
        "goal": goal,
        "status": status,
        "winner": winner,
        "runner_path_length": len(runner_path),
        "hunter_steps": hunter_steps
    })

if __name__ == '__main__':
    update_runner_path()
    print("🚀 Server starting on http://localhost:8000")
    print(f"📍 Runner: {runner}, Hunter: {hunter}, Goal: {goal}")
    app.run(host='0.0.0.0', port=8000, debug=True)