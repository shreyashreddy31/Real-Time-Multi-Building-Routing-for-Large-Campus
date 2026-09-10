import random
import dataclasses
import uuid
from typing import List
from backend.algorithms.heuristics import haversine_distance
from backend.algorithms.astar import astar
from backend.graph.dynamic_graph import DynamicGraph

class ParkingManager:
    """Manages parking zones and availability."""
    def __init__(self, zones_data: List[dict]):
        self._zones = {z["id"]: z for z in zones_data}
        
    def get_all_zones(self) -> List[dict]:
        return list(self._zones.values())
        
    def get_zone(self, zone_id: str) -> dict:
        return self._zones.get(zone_id)
        
    def find_nearest_available(self, node_id: str, node_data: dict) -> List[dict]:
        start_info = node_data.get(node_id)
        if not start_info:
            return []
            
        available_zones = [z for z in self._zones.values() if z.get("occupied", 0) < z.get("total_spaces", 0)]
        
        for z in available_zones:
            z["_dist"] = haversine_distance(
                start_info.get("lat", 0), start_info.get("lng", 0),
                z.get("lat", 0), z.get("lng", 0)
            )
            
        available_zones.sort(key=lambda x: x["_dist"])
        return available_zones
        
    def update_occupancy(self, zone_id: str, delta: int) -> None:
        if zone_id in self._zones:
            zone = self._zones[zone_id]
            new_occ = max(0, min(zone["total_spaces"], zone["occupied"] + delta))
            zone["occupied"] = new_occ
            
    def simulate_tick(self) -> None:
        if not self._zones:
            return
        num_changes = max(1, len(self._zones) // 3)
        zone_ids = list(self._zones.keys())
        for _ in range(num_changes):
            zid = random.choice(zone_ids)
            delta = random.randint(-5, 5)
            self.update_occupancy(zid, delta)
            
    def navigate_to_parking(self, from_node: str, zone_id: str, graph: DynamicGraph, node_data: dict) -> dict:
        zone = self.get_zone(zone_id)
        if not zone or not zone.get("nearby_node"):
            return None
            
        target = zone["nearby_node"]
        res = astar(graph, from_node, target, node_data)
        
        res_dict = dataclasses.asdict(res)
        res_dict["route_id"] = str(uuid.uuid4())
        res_dict["path_names"] = [node_data.get(n, {}).get("name", n) for n in res_dict["path"]] if node_data else res_dict["path"]
        res_dict["eta_display"] = f"{int(res_dict['eta_seconds'] // 60)} min"
        res_dict["coordinates"] = [[node_data.get(n, {}).get("lat", 0), node_data.get(n, {}).get("lng", 0)] for n in res_dict["path"]] if node_data else []
        
        return res_dict
