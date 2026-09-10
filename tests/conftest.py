import pytest
import sys
import os
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from backend.graph.adjacency_list import AdjacencyListGraph
from backend.graph.dynamic_graph import DynamicGraph

@pytest.fixture
def node_data():
    return {
        "n0": {"lat": 0.0, "lng": 0.0},
        "n1": {"lat": 1.0, "lng": 1.0},
        "n2": {"lat": 2.0, "lng": 2.0},
        "n3": {"lat": 3.0, "lng": 3.0},
        "n4": {"lat": 4.0, "lng": 4.0},
        "n5": {"lat": 5.0, "lng": 5.0},
    }

@pytest.fixture
def sample_graph():
    g = AdjacencyListGraph()
    for i in range(6):
        g.add_node(f"n{i}", {"lat": float(i), "lng": float(i)})
    g.add_edge("n0", "n1", 2.0)
    g.add_edge("n1", "n2", 3.0)
    g.add_edge("n0", "n2", 6.0)
    g.add_edge("n2", "n3", 1.0)
    g.add_edge("n3", "n4", 4.0)
    g.add_edge("n4", "n5", 2.0)
    g.add_edge("n2", "n5", 5.0)
    return g

@pytest.fixture
def dynamic_graph():
    g = DynamicGraph()
    for i in range(6):
        g.add_node(f"n{i}", {"lat": float(i), "lng": float(i)})
    g.add_edge("n0", "n1", 2.0)
    g.add_edge("n1", "n2", 3.0)
    g.add_edge("n0", "n2", 6.0)
    g.add_edge("n2", "n3", 1.0)
    g.add_edge("n3", "n4", 4.0)
    g.add_edge("n4", "n5", 2.0)
    g.add_edge("n2", "n5", 5.0)
    return g
