import pytest
from backend.parking.parking_manager import ParkingManager

def test_parking_manager(node_data):
    zones = [
        {"id": "z1", "lat": 0.0, "lng": 0.0, "type": "general", "nearby_node": "n0", "total_spaces": 100, "occupied": 50, "ev_spaces": 10},
        {"id": "z2", "lat": 2.0, "lng": 2.0, "type": "general", "nearby_node": "n2", "total_spaces": 50, "occupied": 50, "ev_spaces": 5}
    ]
    pm = ParkingManager(zones)
    
    nearest = pm.find_nearest_available("n0", node_data)
    assert len(nearest) == 1
    assert nearest[0]["id"] == "z1"
    
    pm.update_occupancy("z1", 50) # occupy remaining 50 spaces
    nearest2 = pm.find_nearest_available("n0", node_data)
    assert len(nearest2) == 0
