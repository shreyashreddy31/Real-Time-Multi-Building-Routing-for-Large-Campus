from typing import List, Tuple, Optional
from backend.graph.graph import Graph

class AdjacencyMatrixGraph(Graph):
    """Adjacency matrix implementation of Graph."""
    
    def __init__(self):
        self._node_to_idx = {}
        self._idx_to_node = []
        self._node_data = {}
        self._matrix = []
        self._edges_count = 0
        
    def _resize(self):
        new_size = len(self._idx_to_node)
        for row in self._matrix:
            while len(row) < new_size:
                row.append(float('inf'))
        while len(self._matrix) < new_size:
            self._matrix.append([float('inf')] * new_size)
            
    def add_node(self, node_id: str, data: dict = None) -> None:
        if node_id not in self._node_to_idx:
            idx = len(self._idx_to_node)
            self._node_to_idx[node_id] = idx
            self._idx_to_node.append(node_id)
            self._resize()
        self._node_data[node_id] = data or {}
        
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None:
        if from_id not in self._node_to_idx:
            self.add_node(from_id)
        if to_id not in self._node_to_idx:
            self.add_node(to_id)
            
        i = self._node_to_idx[from_id]
        j = self._node_to_idx[to_id]
        
        if self._matrix[i][j] == float('inf'):
            self._edges_count += 1
            
        self._matrix[i][j] = weight
        
    def remove_edge(self, from_id: str, to_id: str) -> None:
        if from_id in self._node_to_idx and to_id in self._node_to_idx:
            i = self._node_to_idx[from_id]
            j = self._node_to_idx[to_id]
            if self._matrix[i][j] != float('inf'):
                self._matrix[i][j] = float('inf')
                self._edges_count -= 1
                
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        if node_id not in self._node_to_idx:
            return []
        i = self._node_to_idx[node_id]
        neighbors = []
        for j, weight in enumerate(self._matrix[i]):
            if weight != float('inf'):
                neighbors.append((self._idx_to_node[j], weight))
        return neighbors
        
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]:
        if from_id in self._node_to_idx and to_id in self._node_to_idx:
            i = self._node_to_idx[from_id]
            j = self._node_to_idx[to_id]
            w = self._matrix[i][j]
            if w != float('inf'):
                return w
        return None
        
    def has_node(self, node_id: str) -> bool:
        return node_id in self._node_to_idx
        
    def has_edge(self, from_id: str, to_id: str) -> bool:
        w = self.get_weight(from_id, to_id)
        return w is not None
        
    def get_nodes(self) -> List[str]:
        return list(self._idx_to_node)
        
    def get_edges(self) -> List[Tuple[str, str, float]]:
        edges = []
        for i, row in enumerate(self._matrix):
            for j, weight in enumerate(row):
                if weight != float('inf'):
                    edges.append((self._idx_to_node[i], self._idx_to_node[j], weight))
        return edges
        
    def get_node_data(self, node_id: str) -> Optional[dict]:
        return self._node_data.get(node_id)
        
    def node_count(self) -> int:
        return len(self._idx_to_node)
        
    def edge_count(self) -> int:
        return self._edges_count
        
    def density(self) -> float:
        n = self.node_count()
        if n <= 1:
            return 0.0
        return self.edge_count() / (n * (n - 1))
        
    def average_degree(self) -> float:
        n = self.node_count()
        if n == 0:
            return 0.0
        return self.edge_count() / n
