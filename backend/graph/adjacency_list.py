from typing import List, Tuple, Optional
from backend.graph.graph import Graph

class AdjacencyListGraph(Graph):
    """Adjacency list implementation of Graph."""
    
    def __init__(self):
        self._adj = {}
        self._node_data = {}
        self._edges_count = 0
        
    def add_node(self, node_id: str, data: dict = None) -> None:
        if node_id not in self._adj:
            self._adj[node_id] = {}
        self._node_data[node_id] = data or {}
        
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None:
        if from_id not in self._adj:
            self.add_node(from_id)
        if to_id not in self._adj:
            self.add_node(to_id)
            
        if to_id not in self._adj[from_id]:
            self._edges_count += 1
            
        self._adj[from_id][to_id] = weight
        # store edge data if we want, though standard interface stores node data
        
    def remove_edge(self, from_id: str, to_id: str) -> None:
        if from_id in self._adj and to_id in self._adj[from_id]:
            del self._adj[from_id][to_id]
            self._edges_count -= 1
            
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        if node_id not in self._adj:
            return []
        return list(self._adj[node_id].items())
        
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]:
        if from_id in self._adj and to_id in self._adj[from_id]:
            return self._adj[from_id][to_id]
        return None
        
    def has_node(self, node_id: str) -> bool:
        return node_id in self._adj
        
    def has_edge(self, from_id: str, to_id: str) -> bool:
        return from_id in self._adj and to_id in self._adj[from_id]
        
    def get_nodes(self) -> List[str]:
        return list(self._adj.keys())
        
    def get_edges(self) -> List[Tuple[str, str, float]]:
        edges = []
        for from_id, neighbors in self._adj.items():
            for to_id, weight in neighbors.items():
                edges.append((from_id, to_id, weight))
        return edges
        
    def get_node_data(self, node_id: str) -> Optional[dict]:
        return self._node_data.get(node_id)
        
    def node_count(self) -> int:
        return len(self._adj)
        
    def edge_count(self) -> int:
        return self._edges_count
        
    def density(self) -> float:
        n = self.node_count()
        if n <= 1:
            return 0.0
        # directed graph max edges n*(n-1)
        return self.edge_count() / (n * (n - 1))
        
    def average_degree(self) -> float:
        n = self.node_count()
        if n == 0:
            return 0.0
        return self.edge_count() / n
