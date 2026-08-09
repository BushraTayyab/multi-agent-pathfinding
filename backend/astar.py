import heapq
from typing import List, Set, Tuple, Dict, Any

class AStarPathfinder:
    def __init__(self, grid_size: int = 21):
        self.grid_size = grid_size

    def heuristic(self, a: Tuple[int, int], b: Tuple[int, int]) -> int:
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def get_neighbors(self, pos: Tuple[int, int], walls: Set[Tuple[int, int]]) -> List[Tuple[int, int]]:
        x, y = pos
        neighbors = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
        valid = []
        for nx, ny in neighbors:
            if 0 <= nx < self.grid_size and 0 <= ny < self.grid_size and (nx, ny) not in walls:
                valid.append((nx, ny))
        return valid

    def find_path(self, start: Tuple[int, int], goal: Tuple[int, int], walls: List[Tuple[int, int]]) -> Dict[str, Any]:
        if not (0 <= start[0] < self.grid_size and 0 <= start[1] < self.grid_size):
            return {"path": [], "explored_count": 0, "path_length": 0}
        if not (0 <= goal[0] < self.grid_size and 0 <= goal[1] < self.grid_size):
            return {"path": [], "explored_count": 0, "path_length": 0}
        
        walls_set = set(walls)
        open_set = []
        counter = 0
        heapq.heappush(open_set, (self.heuristic(start, goal), counter, start))
        came_from = {}
        g_score = {start: 0}
        explored = set()
        max_iterations = self.grid_size * self.grid_size * 4
        
        while open_set and len(explored) < max_iterations:
            _, _, current = heapq.heappop(open_set)
            explored.add(current)
            
            if current == goal:
                path = []
                cur = current
                while cur in came_from:
                    path.append(cur)
                    cur = came_from[cur]
                path.append(start)
                path.reverse()
                return {"path": path, "explored_count": len(explored), "path_length": len(path)-1}
            
            for neighbor in self.get_neighbors(current, walls_set):
                if not (0 <= neighbor[0] < self.grid_size and 0 <= neighbor[1] < self.grid_size):
                    continue
                tentative_g = g_score.get(current, float('inf')) + 1
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_val = tentative_g + self.heuristic(neighbor, goal)
                    counter += 1
                    heapq.heappush(open_set, (f_val, counter, neighbor))
        
        return {"path": [], "explored_count": len(explored), "path_length": 0}