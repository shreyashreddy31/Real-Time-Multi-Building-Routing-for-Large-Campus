import pytest
from backend.emergency.emergency_router import EmergencyRouter

def test_emergency_dispatch(dynamic_graph, node_data):
    facilities = [{"id": "h1", "node_id": "n5", "type": "hospital", "services": ["ambulance"], "vehicles": ["a1"]}]
    er = EmergencyRouter(dynamic_graph, facilities)
    
    res = er.dispatch("ambulance", "n0", "n2", node_data)
    assert res is not None
    assert res["route"]["found"] is True
    assert "Emergency" in res["route"]["eta_display"]
