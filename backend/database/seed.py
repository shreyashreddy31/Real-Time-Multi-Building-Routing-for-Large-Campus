import json
import os
from backend.graph.dynamic_graph import DynamicGraph

class SeedDatabase:
    """Seeds the database and builds initial DynamicGraph from JSON data."""
    def __init__(self, data_dir: str = "data/campus"):
        self.data_dir = data_dir
        
    def build_campus_graph(self):
        graph = DynamicGraph()
        places_dict = {}
        road_data_dict = {}
        node_data_dict = {}
        
        places_path = os.path.join(self.data_dir, "places.json")
        roads_path = os.path.join(self.data_dir, "roads.json")
        
        # We need mock data if files don't exist
        if not os.path.exists(places_path):
            self._create_mock_data()
            
        try:
            with open(places_path, "r") as f:
                places = json.load(f)
            with open(roads_path, "r") as f:
                roads = json.load(f)
        except Exception:
            places = []
            roads = []
            
        for p in places:
            node_id = p["id"]
            node_data_dict[node_id] = p
            places_dict[node_id] = p
            graph.add_node(node_id, p)
            
        for r in roads:
            from_node = r["from"]
            to_node = r["to"]
            weight = r["base_time"]
            r_id = r["id"]
            road_data_dict[r_id] = r
            road_data_dict[f"{from_node}_{to_node}"] = r
            if r.get('bidirectional', True):
                road_data_dict[f"{to_node}_{from_node}"] = r
            
            # Ensure nodes exist
            if not graph.has_node(from_node):
                graph.add_node(from_node)
            if not graph.has_node(to_node):
                graph.add_node(to_node)
                
            graph.add_edge(from_node, to_node, weight, r)
            if r.get("bidirectional", True):
                graph.add_edge(to_node, from_node, weight, r)
                
        return graph, node_data_dict, road_data_dict, places_dict
        
    def _create_mock_data(self):
        os.makedirs(self.data_dir, exist_ok=True)
        places = [
            {"id": "main_gate", "name": "Main Gate", "type": "entrance", "lat": 28.5440, "lng": 77.1920},
            {"id": "central_library", "name": "Central Library", "type": "academic", "lat": 28.5460, "lng": 77.1930},
            {"id": "cse_dept", "name": "CSE Department", "type": "academic", "lat": 28.5470, "lng": 77.1950},
            {"id": "hostel_a", "name": "Hostel A", "type": "residential", "lat": 28.5480, "lng": 77.1960},
            {"id": "medical_center", "name": "Medical Center", "type": "emergency", "lat": 28.5435, "lng": 77.1955},
        ]
        roads = [
            {"id": "r1", "from": "main_gate", "to": "central_library", "base_time": 120, "distance": 350, "bidirectional": True},
            {"id": "r2", "from": "central_library", "to": "cse_dept", "base_time": 90, "distance": 200, "bidirectional": True},
            {"id": "r3", "from": "cse_dept", "to": "hostel_a", "base_time": 60, "distance": 150, "bidirectional": True},
            {"id": "r4", "from": "main_gate", "to": "medical_center", "base_time": 80, "distance": 250, "bidirectional": True},
            {"id": "r5", "from": "medical_center", "to": "central_library", "base_time": 100, "distance": 300, "bidirectional": True}
        ]
        parking = [
            {"id": "main_parking", "name": "Main Parking", "lat": 28.5440, "lng": 77.1920, "total_spaces": 200, "occupied": 142, "nearby_node": "main_gate"}
        ]
        emergency = [
            {"id": "campus_hospital", "name": "Campus Hospital", "type": "hospital", "lat": 28.5435, "lng": 77.1955, "node_id": "medical_center"}
        ]
        
        with open(os.path.join(self.data_dir, "places.json"), "w") as f:
            json.dump(places, f)
        with open(os.path.join(self.data_dir, "roads.json"), "w") as f:
            json.dump(roads, f)
        with open(os.path.join(self.data_dir, "parking.json"), "w") as f:
            json.dump(parking, f)
        with open(os.path.join(self.data_dir, "emergency.json"), "w") as f:
            json.dump(emergency, f)
