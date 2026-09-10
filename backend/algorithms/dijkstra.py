import time
from typing import List
from dataclasses import dataclass
from backend.graph.dynamic_graph import DynamicGraph
from backend.algorithms.priority_queue import MinHeap

@dataclass
class RouteResult:
    path: List[str]
    cost: float
    distance: float
    eta_seconds: float
    nodes_explored: int
    edges_processed: int
    execution_time_ms: float
    algorithm: str
    instructions: List[str]
    found: bool

def dijkstra(graph: DynamicGraph, source: str, target: str, node_data: dict = None) -> RouteResult:
    start_time = time.perf_counter()
    if not graph.has_node(source) or not graph.has_node(target):
        return RouteResult([], 0.0, 0.0, 0.0, 0, 0, 0.0, "dijkstra", [], False)
        
    pq = MinHeap()
    pq.push(0.0, source)
    
    distances = {source: 0.0}
    parent = {source: None}
    visited = set()
    
    nodes_explored = 0
    edges_processed = 0
    
    while not pq.is_empty():
        curr_dist, curr_node = pq.pop()
        
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
            new_dist = curr_dist + weight
            
            if neighbor not in distances or new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                parent[neighbor] = curr_node
                pq.push(new_dist, neighbor)
                
    end_time = time.perf_counter()
    execution_time_ms = (end_time - start_time) * 1000.0
    
    if target not in parent and source != target:
        return RouteResult([], 0.0, 0.0, 0.0, nodes_explored, edges_processed, execution_time_ms, "dijkstra", [], False)
        
    # Reconstruct path
    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = parent.get(curr)
    path.reverse()
    
    # Calculate distance and instructions
    total_dist = 0.0
    instructions = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        # fetch base distance
        meta = graph._edge_metadata.get((u, v), {}) if hasattr(graph, '_edge_metadata') else {}
        total_dist += meta.get('distance', 0.0)
        
        u_name = u
        v_name = v
        if node_data:
            u_name = node_data.get(u, {}).get("name", u)
            v_name = node_data.get(v, {}).get("name", v)
            
        instructions.append(f"Go from {u_name} to {v_name}")
        
    cost = distances.get(target, 0.0)
    
    return RouteResult(
        path=path,
        cost=cost,
        distance=total_dist,
        eta_seconds=cost, # cost is travel time in seconds
        nodes_explored=nodes_explored,
        edges_processed=edges_processed,
        execution_time_ms=execution_time_ms,
        algorithm="dijkstra",
        instructions=instructions,
        found=True
    )
