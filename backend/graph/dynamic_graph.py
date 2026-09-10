from typing import List, Tuple, Optional, Set
from backend.graph.graph import Graph
from backend.graph.adaptive_graph import AdaptiveGraph

class DynamicGraph(Graph):
    """Wraps AdaptiveGraph and adds dynamic edge weights (traffic, closures, etc.)."""
    
    def __init__(self):
        self._graph = AdaptiveGraph()
        self._closed_roads = set()
        self._edge_metadata = {} # (u, v) -> dict
        self._changed_edges = set() # (u, v) tuples
        
    def _mark_changed(self, u: str, v: str):
        self._changed_edges.add((u, v))
        
    def add_node(self, node_id: str, data: dict = None) -> None:
        self._graph.add_node(node_id, data)
        
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None:
        self._graph.add_edge(from_id, to_id, weight, data)
        if data:
            self._edge_metadata[(from_id, to_id)] = data
            
    def remove_edge(self, from_id: str, to_id: str) -> None:
        self._graph.remove_edge(from_id, to_id)
        if (from_id, to_id) in self._edge_metadata:
            del self._edge_metadata[(from_id, to_id)]
        self._closed_roads.discard((from_id, to_id))
        self._mark_changed(from_id, to_id)
            
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        # Return effective weights
        neighbors = self._graph.get_neighbors(node_id)
        res = []
        for n, w in neighbors:
            ew = self.get_effective_weight(node_id, n)
            if ew != float('inf'):
                res.append((n, ew))
        return res
        
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]:
        return self._graph.get_weight(from_id, to_id)
        
    def get_effective_weight(self, from_id: str, to_id: str) -> float:
        if (from_id, to_id) in self._closed_roads:
            return float('inf')
            
        base_w = self._graph.get_weight(from_id, to_id)
        if base_w is None:
            return float('inf')
            
        meta = self._edge_metadata.get((from_id, to_id), {})
        multiplier = meta.get("traffic_multiplier", 1.0)
        return base_w * multiplier
        
    def has_node(self, node_id: str) -> bool:
        return self._graph.has_node(node_id)
        
    def has_edge(self, from_id: str, to_id: str) -> bool:
        return self._graph.has_edge(from_id, to_id)
        
    def get_nodes(self) -> List[str]:
        return self._graph.get_nodes()
        
    def get_edges(self) -> List[Tuple[str, str, float]]:
        # return effective weights
        edges = []
        for u, v, w in self._graph.get_edges():
            edges.append((u, v, self.get_effective_weight(u, v)))
        return edges
        
    def get_node_data(self, node_id: str) -> Optional[dict]:
        return self._graph.get_node_data(node_id)
        
    def node_count(self) -> int:
        return self._graph.node_count()
        
    def edge_count(self) -> int:
        return self._graph.edge_count()
        
    def density(self) -> float:
        return self._graph.density()
        
    def average_degree(self) -> float:
        return self._graph.average_degree()
        
    def update_edge_weight(self, from_id: str, to_id: str, weight: float) -> None:
        self._graph.add_edge(from_id, to_id, weight)
        self._mark_changed(from_id, to_id)
        
    def close_road(self, from_id: str, to_id: str) -> None:
        self._closed_roads.add((from_id, to_id))
        self._mark_changed(from_id, to_id)
        
    def open_road(self, from_id: str, to_id: str, original_weight: float = None) -> None:
        self._closed_roads.discard((from_id, to_id))
        self._mark_changed(from_id, to_id)
        
    def apply_traffic_multiplier(self, from_id: str, to_id: str, multiplier: float) -> None:
        if (from_id, to_id) not in self._edge_metadata:
            self._edge_metadata[(from_id, to_id)] = {}
        self._edge_metadata[(from_id, to_id)]["traffic_multiplier"] = multiplier
        self._mark_changed(from_id, to_id)
        
    def get_changed_edges(self) -> Set[Tuple[str, str]]:
        changed = self._changed_edges.copy()
        self._changed_edges.clear()
        return changed
        
    def representation_info(self) -> dict:
        return self._graph.representation_info()
