# 🧠 Multi-Agent Pathfinding | Adversarial A*

> *Two agents. One goal. The Runner wants freedom. The Hunter wants capture. Both use A* — but only one thinks ahead.*

---

## 🎯 The Premise

| Agent | Symbol | Goal | Strategy |
|-------|--------|------|----------|
| **Runner** | 🟢 | Reach the ⭐ goal | Standard A* (shortest path) |
| **Hunter** | 🔴 | Capture the Runner | **Predictive A*** — anticipates Runner's route and intercepts |

The Hunter doesn't just chase. It **thinks ahead** — running A* from the Runner's perspective to find the best intercept point.

---

## 🔬 Why This Is Different

Most pathfinding demos show a single agent finding a path through static obstacles. This project adds:

| Concept | What It Means |
|---------|---------------|
| **Adversarial reasoning** | Agents with opposing goals |
| **Predictive modeling** | Hunter simulates Runner's future decisions |
| **Real-time replanning** | Both agents adapt every frame |
| **Multi-agent coordination** | Foundation for MAPF (Multi-Agent Pathfinding) |

---

## 🎮 How to Play

| Action | Control |
|--------|---------|
| Move 🟢 Runner (start) | Drag the green node |
| Move 🔴 Hunter | Drag the red node |
| Move ⭐ Goal | Drag the gold node |
| Draw walls | Click any cell |
| Clear a wall | Right-click a wall cell |
| Clear all walls | Click "Clear Walls" button |
| Reset game | Click "Reset" button |
| Adjust speed | Move the slider |

---

## 🧠 Algorithm Deep Dive

### Standard A* (Runner)

The Runner uses the classic A* search algorithm to find the optimal path to the goal.
f(n) = g(n) + h(n)

Where:

f(n) = Total estimated cost through node n

g(n) = Actual cost from start to node n (path length so far)

h(n) = Heuristic estimate from node n to goal (Manhattan distance)


**The Process:**

1. Initialize OPEN set with start node

2. Initialize CLOSED set (empty)

3. While OPEN is not empty:
a. Pop node with lowest f(n) from OPEN
b. If node is goal → reconstruct path and return
c. Add node to CLOSED set
d. For each neighbor:

4. Calculate tentative g score

5. If better than known, update and add to OPEN

6. Return empty array (no path exists)

### Predictive A* (Hunter)

The Hunter doesn't just chase. It **thinks ahead** by simulating the Runner's behavior.

```javascript
1. Predict Runner's path using A*
2. Find earliest point where Hunter can intercept
3. Move Hunter toward intercept point
4. Re-run prediction every frame
