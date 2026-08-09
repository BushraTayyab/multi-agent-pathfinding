from pydantic import BaseModel
from typing import List, Optional

class Point(BaseModel):
    x: int
    y: int

class HunterMoveRequest(BaseModel):
    hunter: Point
    runner: Point
    goal: Point
    walls: List[Point] = []