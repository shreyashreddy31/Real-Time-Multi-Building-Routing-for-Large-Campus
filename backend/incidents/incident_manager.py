import uuid
from datetime import datetime
from backend.graph.dynamic_graph import DynamicGraph

class IncidentManager:
    """Manages road incidents and their effects on the graph."""
    INCIDENT_EFFECTS = {
        "construction": {"multiplier": 3.0, "block": False},
        "pothole": {"multiplier": 1.5, "block": False},
        "accident": {"multiplier": 4.0, "block": True}, # Can block depending on severity, assume block for extreme
        "blocked_lane": {"multiplier": 2.5, "block": False},
        "flood": {"multiplier": 1.0, "block": True},
        "fallen_tree": {"multiplier": 1.0, "block": True},
        "crowd": {"multiplier": 2.0, "block": False},
        "restricted": {"multiplier": 1.0, "block": True},
        "emergency_blockage": {"multiplier": 1.0, "block": True}
    }
    
    def __init__(self, graph: DynamicGraph):
        self.graph = graph
        self._incidents = {}
        
    def create_incident(self, type: str, from_node: str, to_node: str, severity: str, description: str, duration: int) -> dict:
        incident_id = str(uuid.uuid4())
        incident = {
            "id": incident_id,
            "type": type,
            "from_node": from_node,
            "to_node": to_node,
            "severity": severity,
            "description": description,
            "duration_minutes": duration,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        self._incidents[incident_id] = incident
        
        effect = self.INCIDENT_EFFECTS.get(type, {"multiplier": 2.0, "block": False})
        if effect["block"] or severity == "critical":
            self.graph.close_road(from_node, to_node)
        else:
            self.graph.apply_traffic_multiplier(from_node, to_node, effect["multiplier"])
            
        return incident
        
    def resolve_incident(self, id: str) -> bool:
        if id not in self._incidents:
            return False
            
        incident = self._incidents[id]
        if incident["status"] == "resolved":
            return True
            
        incident["status"] = "resolved"
        self.graph.open_road(incident["from_node"], incident["to_node"])
        self.graph.apply_traffic_multiplier(incident["from_node"], incident["to_node"], 1.0)
        return True
        
    def get_active_incidents(self) -> list:
        return [inc for inc in self._incidents.values() if inc["status"] == "active"]
        
    def get_incident(self, id: str) -> dict:
        return self._incidents.get(id)
