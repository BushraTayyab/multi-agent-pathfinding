from typing import List, Dict, Any, Tuple
import random

class GameEngine:
    def __init__(self, grid_size: int = 21):
        self.grid_size = grid_size
        self.runner = (2, 10)
        self.hunter = (18, 10)
        self.goal = (10, 18)
        self.walls = []
        self.status = "paused"
        self.winner = None
        self.runner_path = []
        self.runner_explored = 0
        self.hunter_steps = 0
        self.hunter_agent = None
        print("GameEngine initialized!")

    def reset(self) -> Dict[str, Any]:
        self.runner = (2, 10)
        self.hunter = (18, 10)
        self.goal = (10, 18)
        self.walls = []
        self.status = "paused"
        self.winner = None
        self.runner_path = []
        self.runner_explored = 0
        self.hunter_steps = 0
        self.hunter_agent = None
        return self.get_state_dict()

    def update_runner_path(self):
        from backend.astar import AStarPathfinder
        pathfinder = AStarPathfinder(self.grid_size)
        result = pathfinder.find_path(self.runner, self.goal, self.walls)
        self.runner_path = result["path"]
        self.runner_explored = result["explored_count"]
        return result

    def toggle_wall(self, x: int, y: int) -> Dict[str, Any]:
        point = (x, y)
        if point in self.walls:
            self.walls.remove(point)
        else:
            if point != self.runner and point != self.hunter and point != self.goal:
                self.walls.append(point)
        self.update_runner_path()
        return self.get_state_dict()

    def clear_walls(self) -> Dict[str, Any]:
        self.walls = []
        self.update_runner_path()
        return self.get_state_dict()

    def move_agent(self, agent_type: str, x: int, y: int) -> bool:
        point = (x, y)
        if point in self.walls:
            return False
        if agent_type == "runner":
            if point != self.hunter and point != self.goal:
                self.runner = point
                self.update_runner_path()
                return True
        elif agent_type == "hunter":
            if point != self.runner and point != self.goal:
                self.hunter = point
                return True
        elif agent_type == "goal":
            if point != self.runner and point != self.hunter:
                self.goal = point
                self.update_runner_path()
                return True
        return False

    def tick(self) -> Dict[str, Any]:
        if self.status != "active":
            return self.get_state_dict()
        
        self.update_runner_path()
        if len(self.runner_path) >= 2:
            self.runner = self.runner_path[1]
        
        if self.runner == self.goal:
            self.status = "runner_win"
            self.winner = "runner"
            return self.get_state_dict()
        
        from backend.adversarial import AdversarialHunter
        if self.hunter_agent is None:
            self.hunter_agent = AdversarialHunter(self.grid_size)
        
        hunter_move = self.hunter_agent.get_next_move(self.hunter, self.runner, self.goal, self.walls)
        self.hunter = hunter_move["next_position"]
        self.hunter_steps = hunter_move["steps_taken"]
        
        if self.hunter == self.runner:
            self.status = "hunter_win"
            self.winner = "hunter"
            return self.get_state_dict()
        
        self.update_runner_path()
        return self.get_state_dict()

    def get_state_dict(self) -> Dict[str, Any]:
        walls_list = [{"x": w[0], "y": w[1]} for w in self.walls]
        path_list = [{"x": p[0], "y": p[1]} for p in self.runner_path]
        
        return {
            "state": {
                "grid_size": self.grid_size,
                "walls": walls_list,
                "runner": {"x": self.runner[0], "y": self.runner[1]},
                "hunter": {"x": self.hunter[0], "y": self.hunter[1]},
                "goal": {"x": self.goal[0], "y": self.goal[1]},
                "status": self.status,
                "winner": self.winner
            },
            "runner_path": path_list,
            "runner_explored": self.runner_explored,
            "hunter_steps": self.hunter_steps,
            "game_over": self.status in ["runner_win", "hunter_win"],
            "winner": self.winner
        }

    def start(self) -> Dict[str, Any]:
        if self.status in ["runner_win", "hunter_win"]:
            self.reset()
        self.status = "active"
        self.update_runner_path()
        return self.get_state_dict()

    def pause(self) -> Dict[str, Any]:
        self.status = "paused"
        return self.get_state_dict()

    def random_walls(self, count: int = None) -> Dict[str, Any]:
        if count is None:
            count = int(self.grid_size * 1.5)
        self.clear_walls()
        for _ in range(count):
            rand_x = random.randint(0, self.grid_size - 1)
            rand_y = random.randint(0, self.grid_size - 1)
            point = (rand_x, rand_y)
            if point != self.runner and point != self.hunter and point != self.goal:
                self.walls.append(point)
        self.update_runner_path()
        return self.get_state_dict()