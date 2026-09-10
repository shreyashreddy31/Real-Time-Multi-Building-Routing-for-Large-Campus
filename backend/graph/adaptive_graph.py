from typing import List, Tuple, Optional
from backend.graph.graph import Graph
from backend.graph.adjacency_list import AdjacencyListGraph
from backend.graph.adjacency_matrix import AdjacencyMatrixGraph

class AdaptiveGraph(Graph):
    """Wrapper that picks AdjacencyListGraph or AdjacencyMatrixGraph based on density."""
    
    def __init__(self, threshold: float = 0.3):
        self.threshold = threshold
        self._graph = AdjacencyListGraph()
        
    def representation_info(self) -> dict:
        return {
            "node_count": self.node_count(),
            "edge_count": self.edge_count(),
            "density": self.density(),
            "average_degree": self.average_degree(),
            "representation_type": type(self._graph).__name__
        }
        
    def _check_and_switch(self):
        d = self._graph.density()
        if type(self._graph) == AdjacencyListGraph and d >= self.threshold:
            self._switch_to(AdjacencyMatrixGraph())
        elif type(self._graph) == AdjacencyMatrixGraph and d < self.threshold:
            self._switch_to(AdjacencyListGraph())
            
    def _switch_to(self, new_graph: Graph):
        for node in self._graph.get_nodes():
            new_graph.add_node(node, self._graph.get_node_data(node))
        for u, v, w in self._graph.get_edges():
            new_graph.add_edge(u, v, w)
        self._graph = new_graph
        
    def add_node(self, node_id: str, data: dict = None) -> None:
        self._graph.add_node(node_id, data)
        self._check_and_switch()
        
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None:
        self._graph.add_edge(from_id, to_id, weight, data)
        self._check_and_switch()
        
    def remove_edge(self, from_id: str, to_id: str) -> None:
        self._graph.remove_edge(from_id, to_id)
        self._check_and_switch()
        
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        return self._graph.get_neighbors(node_id)
        
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]:
        return self._graph.get_weight(from_id, to_id)
        
    def has_node(self, node_id: str) -> bool:
        return self._graph.has_node(node_id)
        
    def has_edge(self, from_id: str, to_id: str) -> bool:
        return self._graph.has_edge(from_id, to_id)
        
    def get_nodes(self) -> List[str]:
        return self._graph.get_nodes()
        
    def get_edges(self) -> List[Tuple[str, str, float]]:
        return self._graph.get_edges()
        
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
