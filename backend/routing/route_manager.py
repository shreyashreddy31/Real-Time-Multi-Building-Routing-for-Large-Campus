import uuid
from typing import List, Set

class RouteManager:
    """Manages active routes and checks for affected routes upon graph changes."""
    def __init__(self):
        self._routes = {} # route_id -> route dict/result
        
        self.total_updates = 0
        self.route_affecting_updates = 0
        self.ignored_updates = 0
        self.reroute_count = 0
        self.total_reroute_time_ms = 0.0
        
    def add_route(self, route_result: dict) -> str:
        route_id = str(uuid.uuid4())
        route_result["route_id"] = route_id
        self._routes[route_id] = route_result
        return route_id
        
    def remove_route(self, route_id: str) -> None:
        if route_id in self._routes:
            del self._routes[route_id]
            
    def get_route(self, route_id: str) -> dict:
        return self._routes.get(route_id)
        
    def get_active_routes(self) -> List[dict]:
        return list(self._routes.values())
        
    def check_affected_routes(self, changed_edges: Set[tuple]) -> List[str]:
        self.total_updates += 1
        affected_ids = []
        for route_id, route in self._routes.items():
            path = route.get("path", [])
            affected = False
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                if (u, v) in changed_edges:
                    affected = True
                    break
            if affected:
                affected_ids.append(route_id)
                
        if affected_ids:
            self.route_affecting_updates += 1
        else:
            self.ignored_updates += 1
            
        return affected_ids
