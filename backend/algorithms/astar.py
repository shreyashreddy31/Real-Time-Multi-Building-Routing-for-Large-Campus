import time
from backend.graph.dynamic_graph import DynamicGraph
from backend.algorithms.priority_queue import MinHeap
from backend.algorithms.heuristics import haversine_distance
from backend.algorithms.dijkstra import RouteResult

def astar(graph: DynamicGraph, source: str, target: str, node_data: dict = None) -> RouteResult:
    start_time = time.perf_counter()
    if not graph.has_node(source) or not graph.has_node(target):
        return RouteResult([], 0.0, 0.0, 0.0, 0, 0, 0.0, "astar", [], False)
        
    def heuristic(u: str, v: str) -> float:
        if not node_data:
            return 0.0
        u_data = node_data.get(u, {})
        v_data = node_data.get(v, {})
        if 'lat' in u_data and 'lng' in u_data and 'lat' in v_data and 'lng' in v_data:
            # Distance in meters / rough speed limit to get time heuristic (e.g. 1m/s)
            dist = haversine_distance(u_data['lat'], u_data['lng'], v_data['lat'], v_data['lng'])
            # dividing by roughly 5 m/s (~18 km/h) to convert distance to time heuristic
            # this ensures it remains admissible if base_time is derived from distance/speed
            return dist / 5.0
        return 0.0

    pq = MinHeap()
    pq.push(0.0, source)
    
    g_costs = {source: 0.0}
    parent = {source: None}
    visited = set()
    
    nodes_explored = 0
    edges_processed = 0
    
    while not pq.is_empty():
        _, curr_node = pq.pop()
        
        if curr_node in visited:
            continue
            
        visited.add(curr_node)
        nodes_explored += 1
        
        if curr_node == target:
            break
            
        for neighbor, weight in graph.get_neighbors(curr_node):
            if weight >= float('inf'):
                continue
                
            edges_processed += 1
            new_g = g_costs[curr_node] + weight
            
            if neighbor not in g_costs or new_g < g_costs[neighbor]:
                g_costs[neighbor] = new_g
                parent[neighbor] = curr_node
                f_cost = new_g + heuristic(neighbor, target)
                pq.push(f_cost, neighbor)
                
    end_time = time.perf_counter()
    execution_time_ms = (end_time - start_time) * 1000.0
    
    if target not in parent and source != target:
        return RouteResult([], 0.0, 0.0, 0.0, nodes_explored, edges_processed, execution_time_ms, "astar", [], False)
        
    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = parent.get(curr)
    path.reverse()
    
    total_dist = 0.0
    instructions = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        meta = graph._edge_metadata.get((u, v), {}) if hasattr(graph, '_edge_metadata') else {}
        total_dist += meta.get('distance', 0.0)
        
        u_name = u
        v_name = v
        if node_data:
            u_name = node_data.get(u, {}).get("name", u)
            v_name = node_data.get(v, {}).get("name", v)
            
        instructions.append(f"Go from {u_name} to {v_name}")
        
    cost = g_costs.get(target, 0.0)
    
    return RouteResult(
        path=path,
        cost=cost,
        distance=total_dist,
        eta_seconds=cost,
        nodes_explored=nodes_explored,
        edges_processed=edges_processed,
        execution_time_ms=execution_time_ms,
        algorithm="astar",
        instructions=instructions,
        found=True
    )
