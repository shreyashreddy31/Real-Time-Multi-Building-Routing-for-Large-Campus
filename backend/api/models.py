from pydantic import BaseModel
from typing import List

class RouteRequest(BaseModel):
    from_node: str
    to_node: str
    algorithm: str = "astar"
    avoid_crowds: bool = False
    route_type: str = "fastest"

class RouteResponse(BaseModel):
    path: List[str]
    path_names: List[str]
    cost: float
    distance: float
    eta_seconds: float
    eta_display: str
    nodes_explored: int
    edges_processed: int
    execution_time_ms: float
    algorithm: str
    instructions: List[str]
    found: bool
    route_id: str
    coordinates: List[List[float]]

class IncidentRequest(BaseModel):
    type: str
    from_node: str
    to_node: str
    severity: str = "medium"
    description: str = ""
    duration_minutes: int = 30

class IncidentResponse(BaseModel):
    id: str
    type: str
    from_node: str
    to_node: str
    from_name: str
    to_name: str
    severity: str
    description: str
    status: str
    created_at: str
    road_name: str

class EmergencyRequest(BaseModel):
    vehicle_type: str
    from_node: str
    to_node: str

class EmergencyResponse(BaseModel):
    route: RouteResponse
    vehicle_type: str
    dispatch_id: str
    priority: str
    status: str

class TrafficUpdateRequest(BaseModel):
    from_node: str
    to_node: str
    level: str

class RoadCloseRequest(BaseModel):
    from_node: str
    to_node: str
    reason: str = ""

class BenchmarkRequest(BaseModel):
    source: str
    target: str
    algorithms: List[str] = ["dijkstra", "astar"]

class SearchResult(BaseModel):
    id: str
    name: str
    type: str
    category: str
    lat: float
    lng: float
    match_score: float
