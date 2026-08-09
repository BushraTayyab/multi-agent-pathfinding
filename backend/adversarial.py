from typing import List, Tuple, Optional, Dict, Any
from backend.astar import AStarPathfinder

class AdversarialHunter:
    def __init__(self, grid_size: int = 21):
        self.pathfinder = AStarPathfinder(grid_size)
        self.steps_taken = 0

    def predict_intercept(self, hunter_pos: Tuple[int, int], runner_pos: Tuple[int, int],
                         goal: Tuple[int, int], walls: List[Tuple[int, int]]) -> Optional[Tuple[int, int]]:
        runner_result = self.pathfinder.find_path(runner_pos, goal, walls)
        runner_path = runner_result["path"]
        if not runner_path:
            return None
        for step, future_runner in enumerate(runner_path):
            hunter_distance = self.pathfinder.heuristic(hunter_pos, future_runner)
            if hunter_distance <= step:
                return future_runner
        return None

    def get_next_move(self, hunter_pos: Tuple[int, int], runner_pos: Tuple[int, int],
                     goal: Tuple[int, int], walls: List[Tuple[int, int]]) -> Dict[str, Any]:
        intercept_point = self.predict_intercept(hunter_pos, runner_pos, goal, walls)
        if intercept_point is None:
            path_to_runner = self.pathfinder.find_path(hunter_pos, runner_pos, walls)
            if path_to_runner["path"] and len(path_to_runner["path"]) > 1:
                self.steps_taken += 1
                return {"next_position": path_to_runner["path"][1], "intercept_point": None, "steps_taken": self.steps_taken}
            return {"next_position": hunter_pos, "intercept_point": None, "steps_taken": self.steps_taken}
        
        path_to_intercept = self.pathfinder.find_path(hunter_pos, intercept_point, walls)
        if path_to_intercept["path"] and len(path_to_intercept["path"]) > 1:
            self.steps_taken += 1
            return {"next_position": path_to_intercept["path"][1], "intercept_point": intercept_point, "steps_taken": self.steps_taken}
        return {"next_position": hunter_pos, "intercept_point": intercept_point, "steps_taken": self.steps_taken}

    def reset(self):
        self.steps_taken = 0