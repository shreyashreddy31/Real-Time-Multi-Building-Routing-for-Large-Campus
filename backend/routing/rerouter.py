from backend.graph.dynamic_graph import DynamicGraph
from backend.routing.route_manager import RouteManager
from backend.algorithms.dijkstra import dijkstra
from backend.algorithms.astar import astar
import time
import dataclasses

class Rerouter:
    """Handles automatic rerouting of affected active routes."""
    def __init__(self, graph: DynamicGraph, route_manager: RouteManager, broadcast_callback):
        self.graph = graph
        self.route_manager = route_manager
        self.broadcast_callback = broadcast_callback
        
    async def on_graph_change(self, changed_edges: set, node_data: dict = None) -> list:
        if not changed_edges:
            return []
            
        affected_ids = self.route_manager.check_affected_routes(changed_edges)
        reroute_results = []
        
        for route_id in affected_ids:
            old_route = self.route_manager.get_route(route_id)
            if not old_route:
                continue
                
            path = old_route.get("path", [])
            if len(path) < 2:
                continue
                
            source = path[0]
            target = path[-1]
            algorithm = old_route.get("algorithm", "astar")
            
            start_time = time.perf_counter()
            if algorithm == "dijkstra":
                res = dijkstra(self.graph, source, target, node_data)
            else:
                res = astar(self.graph, source, target, node_data)
            end_time = time.perf_counter()
            
            exec_time = (end_time - start_time) * 1000.0
            self.route_manager.reroute_count += 1
            self.route_manager.total_reroute_time_ms += exec_time
            
            res_dict = dataclasses.asdict(res)
            res_dict["route_id"] = route_id
            
            # Additional keys if needed by frontend
            res_dict["path_names"] = [node_data.get(n, {}).get("name", n) for n in res_dict["path"]] if node_data else res_dict["path"]
            res_dict["eta_display"] = f"{int(res_dict['eta_seconds'] // 60)} min"
            res_dict["coordinates"] = [[node_data.get(n, {}).get("lat", 0), node_data.get(n, {}).get("lng", 0)] for n in res_dict["path"]] if node_data else []
            
            # Update route manager
            self.route_manager._routes[route_id] = res_dict
            reroute_results.append(res_dict)
            
            if self.broadcast_callback:
                await self.broadcast_callback({
                    "type": "reroute",
                    "data": res_dict,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                })
                
        return reroute_results
