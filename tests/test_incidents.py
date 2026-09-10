import pytest
from backend.incidents.incident_manager import IncidentManager
import math

def test_incident_creation_and_resolution(dynamic_graph):
    im = IncidentManager(dynamic_graph)
    base_weight = dynamic_graph.get_weight("n0", "n1")
    incident = im.create_incident("construction", "n0", "n1", "high", "Road work", 60)
    incident_id = incident["id"]
    assert dynamic_graph.get_effective_weight("n0", "n1") == base_weight * 3.0
    im.resolve_incident(incident_id)
    assert dynamic_graph.get_effective_weight("n0", "n1") == base_weight

def test_flood_blocks_road(dynamic_graph):
    im = IncidentManager(dynamic_graph)
    im.create_incident("flood", "n1", "n2", "critical", "Flooded", 120)
    assert dynamic_graph.get_effective_weight("n1", "n2") == math.inf
