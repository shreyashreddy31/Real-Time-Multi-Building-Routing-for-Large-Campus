import random
from backend.graph.dynamic_graph import DynamicGraph

class TrafficManager:
    """Manages road traffic levels."""
    TRAFFIC_LEVELS = {
        "normal": 1.0,
        "moderate": 1.8,
        "heavy": 3.0,
        "severe": 5.0
    }
    
    def __init__(self, graph: DynamicGraph):
        self.graph = graph
        self._road_traffic = {} # (u, v) -> level
        
    def update_traffic(self, from_node: str, to_node: str, level: str) -> None:
        if level not in self.TRAFFIC_LEVELS:
            level = "normal"
            
        self._road_traffic[(from_node, to_node)] = level
        self.graph.apply_traffic_multiplier(from_node, to_node, self.TRAFFIC_LEVELS[level])
        
    def get_traffic(self, from_node: str, to_node: str) -> str:
        return self._road_traffic.get((from_node, to_node), "normal")
        
    def get_all_traffic(self) -> dict:
        return self._road_traffic.copy()

    def get_all_traffic_serializable(self) -> dict:
        """Return traffic as a JSON-safe dict keyed by 'from-to' strings."""
        return {f"{u}-{v}": level for (u, v), level in self._road_traffic.items()}

    def simulate_tick(self) -> None:
        """Randomly change some traffic levels for demo purposes."""
        levels = list(self.TRAFFIC_LEVELS.keys())
        edges = self.graph.get_edges()
        if not edges:
            return

        num_changes = max(1, len(edges) // 20)
        for _ in range(num_changes):
            u, v, _ = random.choice(edges)
            new_level = random.choice(levels)
            self.update_traffic(u, v, new_level)

    def get_traffic_color(self, level: str) -> str:
        colors = {
            "normal": "#2ecc71",   # Green
            "moderate": "#f1c40f", # Yellow
            "heavy": "#e67e22",    # Orange
            "severe": "#e74c3c"    # Red
        }
        return colors.get(level, "#2ecc71")
