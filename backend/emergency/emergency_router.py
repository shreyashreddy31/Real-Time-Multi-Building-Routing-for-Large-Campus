import uuid
import dataclasses
from typing import List, Dict
from backend.graph.dynamic_graph import DynamicGraph
from backend.algorithms.astar import astar
from backend.algorithms.heuristics import haversine_distance

class EmergencyRouter:
    """Handles priority routing for emergency vehicles."""
    def __init__(self, graph: DynamicGraph, facilities: List[Dict]):
        self.graph = graph
        self.facilities = facilities
        self.active_dispatches = {}
        
    def dispatch(self, vehicle_type: str, from_node: str, to_node: str, node_data: dict = None) -> dict:
        dispatch_id = str(uuid.uuid4())
        
        # Apply 0.5x emergency priority multiplier across all edges temporarily?
        # Actually, let's just do a normal A* but scale down the cost in the response,
        # or temporarily change graph, compute, then revert.
        # Given dynamic graph doesn't have a global multiplier, we'll just report a scaled down ETA
        # to represent emergency speed.
        
        res = astar(self.graph, from_node, to_node, node_data)
        res.eta_seconds *= 0.5
        res.cost *= 0.5
        
        res_dict = dataclasses.asdict(res)
        res_dict["route_id"] = str(uuid.uuid4())
        res_dict["path_names"] = [node_data.get(n, {}).get("name", n) for n in res_dict["path"]] if node_data else res_dict["path"]
        res_dict["eta_display"] = f"{int(res_dict['eta_seconds'] // 60)} min (Emergency)"
        res_dict["coordinates"] = [[node_data.get(n, {}).get("lat", 0), node_data.get(n, {}).get("lng", 0)] for n in res_dict["path"]] if node_data else []
        
        dispatch_info = {
            "route": res_dict,
            "vehicle_type": vehicle_type,
            "dispatch_id": dispatch_id,
            "priority": "high",
            "status": "dispatched"
        }
        
        self.active_dispatches[dispatch_id] = dispatch_info
        return dispatch_info
        
    def find_nearest_facility(self, target_node: str, facility_type: str, node_data: dict) -> dict:
        target_info = node_data.get(target_node)
        if not target_info:
            return None
            
        best_fac = None
        min_dist = float('inf')
        
        for fac in self.facilities:
            if fac.get("type") == facility_type:
                dist = haversine_distance(
                    target_info.get("lat", 0), target_info.get("lng", 0),
                    fac.get("lat", 0), fac.get("lng", 0)
                )
                if dist < min_dist:
                    min_dist = dist
                    best_fac = fac
                    
        return best_fac
