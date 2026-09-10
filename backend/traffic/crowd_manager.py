import random

class CrowdManager:
    """Manages crowd levels on pedestrian paths or places."""
    CROWD_LEVELS = {
        "low": 1.0,
        "medium": 1.5,
        "high": 2.5,
        "extreme": 4.0
    }
    
    def __init__(self):
        self._node_crowds = {} # node_id -> level
        
    def update_crowd(self, node_id: str, level: str) -> None:
        if level not in self.CROWD_LEVELS:
            level = "low"
        self._node_crowds[node_id] = level
        
    def get_crowd(self, node_id: str) -> str:
        return self._node_crowds.get(node_id, "low")
        
    def simulate_tick(self) -> None:
        levels = list(self.CROWD_LEVELS.keys())
        if not self._node_crowds:
            return
            
        num_changes = max(1, len(self._node_crowds) // 10)
        nodes = list(self._node_crowds.keys())
        for _ in range(num_changes):
            node = random.choice(nodes)
            self.update_crowd(node, random.choice(levels))
