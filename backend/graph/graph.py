from abc import ABC, abstractmethod
from typing import List, Tuple, Optional

class Graph(ABC):
    """Abstract base class for all graph representations."""
    
    @abstractmethod
    def add_node(self, node_id: str, data: dict = None) -> None:
        pass
        
    @abstractmethod
    def add_edge(self, from_id: str, to_id: str, weight: float, data: dict = None) -> None:
        pass
        
    @abstractmethod
    def remove_edge(self, from_id: str, to_id: str) -> None:
        pass
        
    @abstractmethod
    def get_neighbors(self, node_id: str) -> List[Tuple[str, float]]:
        pass
        
    @abstractmethod
    def get_weight(self, from_id: str, to_id: str) -> Optional[float]:
        pass
        
    @abstractmethod
    def has_node(self, node_id: str) -> bool:
        pass
        
    @abstractmethod
    def has_edge(self, from_id: str, to_id: str) -> bool:
        pass
        
    @abstractmethod
    def get_nodes(self) -> List[str]:
        pass
        
    @abstractmethod
    def get_edges(self) -> List[Tuple[str, str, float]]:
        pass
        
    @abstractmethod
    def get_node_data(self, node_id: str) -> Optional[dict]:
        pass
        
    @abstractmethod
    def node_count(self) -> int:
        pass
        
    @abstractmethod
    def edge_count(self) -> int:
        pass
        
    @abstractmethod
    def density(self) -> float:
        pass
        
    @abstractmethod
    def average_degree(self) -> float:
        pass
