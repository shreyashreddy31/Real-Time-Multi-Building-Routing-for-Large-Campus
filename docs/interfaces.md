# Shared Interfaces & Contracts

## Project Root
`C:\Users\rupal\.gemini\antigravity\scratch\meridian-smart-campus`

## Node ID Format
String identifiers, lowercase with underscores: `"main_gate"`, `"central_library"`, `"cse_dept"`, `"north_junction"`

## Campus Coordinate System
Campus centered around lat=28.5450, lng=77.1926 (fictional campus near Delhi).
Campus spans approximately 0.015 degrees lat (~1.7km) and 0.018 degrees lng (~1.7km).

## Data Schemas

### Place (places.json)
```json
{
  "id": "central_library",
  "name": "Central Library",
  "type": "academic",
  "category": "Academic",
  "description": "Main campus library with 3 floors...",
  "lat": 28.5460,
  "lng": 77.1930,
  "hours": "7:00 AM - 10:00 PM",
  "services": ["WiFi", "Study Rooms", "Computers"],
  "crowd_level": "moderate",
  "status": "open",
  "photo_url": "",
  "nearby_parking": "library_parking"
}
```
Type enum: academic, dining, recreation, services, emergency, transport, residential, administrative, commercial

### Road (roads.json)
```json
{
  "id": "main_gate_to_central_junction",
  "name": "Main Avenue",
  "from": "main_gate",
  "to": "central_junction",
  "distance": 350,
  "base_time": 120,
  "type": "road",
  "bidirectional": true,
  "speed_limit": 30
}
```
distance in meters, base_time in seconds.
type enum: road, path, crossing, internal_road

### Parking Zone (parking.json)
```json
{
  "id": "main_parking",
  "name": "Main Parking",
  "lat": 28.5440,
  "lng": 77.1920,
  "total_spaces": 200,
  "occupied": 142,
  "ev_spaces": 20,
  "type": "general",
  "nearby_node": "main_gate"
}
```

### Emergency Facility (emergency.json)
```json
{
  "id": "campus_hospital",
  "name": "Campus Hospital & Medical Center",
  "type": "hospital",
  "lat": 28.5435,
  "lng": 77.1955,
  "node_id": "medical_center",
  "services": ["ambulance", "first_aid", "emergency"],
  "vehicles": ["ambulance_1", "ambulance_2"]
}
```
type enum: hospital, fire_station, police, security

## Graph Interface (graph/graph.py)

```python
class Graph(ABC):
    def add_node(self, node_id: str, data: dict = None) -> None: ...
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None: ...
    def remove_edge(self, from_id: str, to_id: str) -> None: ...
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]: ...
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]: ...
    def has_node(self, node_id: str) -> bool: ...
    def has_edge(self, from_id: str, to_id: str) -> bool: ...
    def get_nodes(self) -> List[str]: ...
    def get_edges(self) -> List[Tuple[str, str, float]]: ...
    def get_node_data(self, node_id: str) -> Optional[dict]: ...
    def node_count(self) -> int: ...
    def edge_count(self) -> int: ...
    def density(self) -> float: ...
    def average_degree(self) -> float: ...
```

## Algorithm Return Type

```python
@dataclass
class RouteResult:
    path: List[str]             # ordered node IDs
    cost: float                 # total weighted cost
    distance: float             # total distance in meters
    eta_seconds: float          # estimated travel time
    nodes_explored: int
    edges_processed: int
    execution_time_ms: float
    algorithm: str              # "dijkstra" or "astar"
    instructions: List[str]     # turn-by-turn
    found: bool                 # whether a valid route exists
```

## Traffic Levels & Multipliers
```
NORMAL = 1.0
MODERATE = 1.8
HEAVY = 3.0
SEVERE = 5.0
```

## Obstacle Types & Effects
```
construction:       multiplier=3.0
pothole:           multiplier=1.5
accident:          multiplier=4.0 or block
blocked_lane:      multiplier=2.5
flood:             block (infinity)
fallen_tree:       block (infinity)
crowd:             multiplier=2.0
restricted:        block (infinity)
emergency_blockage: block (infinity)
```

## Crowd Levels & Multipliers
```
LOW = 1.0
MEDIUM = 1.5
HIGH = 2.5
EXTREME = 4.0
```

## API Endpoints (backend base: http://localhost:8000)

```
GET  /api/network          -> {nodes, edges, density, avg_degree, representation, node_count, edge_count}
GET  /api/places            -> [PlaceResponse]
GET  /api/places/{id}       -> PlaceResponse
GET  /api/nodes             -> [{id, lat, lng, name, type}]
GET  /api/edges             -> [{from, to, weight, name, traffic, distance, base_time}]
POST /api/route             -> RouteResponse  body: {from, to, algorithm, avoid_crowds, route_type}
POST /api/reroute           -> RouteResponse  body: {route_id}
POST /api/traffic           -> {success}  body: {from_node, to_node, level}
POST /api/incident          -> IncidentResponse  body: {type, from_node, to_node, severity, description, duration_minutes}
POST /api/incident/{id}/resolve -> {success}
POST /api/road/close        -> {success}  body: {from_node, to_node, reason}
POST /api/road/open         -> {success}  body: {from_node, to_node}
POST /api/emergency         -> EmergencyResponse  body: {type, from_node, to_node}
GET  /api/parking            -> [ParkingResponse]
POST /api/parking/navigate   -> RouteResponse  body: {from_node, zone_id}
GET  /api/statistics         -> {nodes, edges, density, avg_degree, active_routes, active_incidents, ...}
GET  /api/performance        -> {benchmarks: [...]}
POST /api/benchmark/run      -> BenchmarkResult  body: {source, target, algorithms}
GET  /api/incidents          -> [IncidentResponse]
GET  /api/search?q=...       -> [SearchResult]
WS   /ws                     -> WebSocket for live updates
```

## WebSocket Message Format
```json
{
  "type": "traffic_update|incident_created|incident_resolved|route_update|parking_update|emergency_update|reroute",
  "data": { ... },
  "timestamp": "2026-08-31T20:00:00Z"
}
```

## Frontend Routes (React Router)
```
/                -> Home
/explore         -> ExploreCampus
/navigate        -> Navigation
/places          -> Places
/live            -> LiveConditions
/emergency       -> Emergency
/parking         -> Parking
/dsa             -> DSAPerformance
/admin           -> Admin
```

## Pydantic Models (backend/api/)

```python
class RouteRequest(BaseModel):
    from_node: str
    to_node: str
    algorithm: str = "astar"  # "dijkstra" or "astar"
    avoid_crowds: bool = False
    route_type: str = "fastest"  # "fastest", "shortest", "safe"

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
    coordinates: List[List[float]]  # [[lat, lng], ...]

class IncidentRequest(BaseModel):
    type: str
    from_node: str
    to_node: str
    severity: str = "medium"  # low, medium, high, critical
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
    status: str  # active, resolved
    created_at: str
    road_name: str

class EmergencyRequest(BaseModel):
    vehicle_type: str  # ambulance, fire, police, security
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
    level: str  # normal, moderate, heavy, severe

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
```

## Python Module Imports (how modules reference each other)
```python
# All imports relative to backend/ being on sys.path
from graph.adjacency_list import AdjacencyListGraph
from graph.adjacency_matrix import AdjacencyMatrixGraph
from graph.adaptive_graph import AdaptiveGraph
from graph.dynamic_graph import DynamicGraph
from algorithms.dijkstra import dijkstra
from algorithms.astar import astar
from algorithms.priority_queue import MinHeap
from algorithms.heuristics import haversine_distance, euclidean_distance
from traffic.traffic_manager import TrafficManager
from traffic.crowd_manager import CrowdManager
from incidents.incident_manager import IncidentManager
from routing.route_manager import RouteManager
from routing.rerouter import Rerouter
from emergency.emergency_router import EmergencyRouter
from parking.parking_manager import ParkingManager
from osm.osm_loader import OSMLoader
from benchmarks.benchmark import BenchmarkRunner
from database.db import Database
```
