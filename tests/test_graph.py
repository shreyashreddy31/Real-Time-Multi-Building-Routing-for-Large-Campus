import pytest
from backend.graph.adjacency_list import AdjacencyListGraph
from backend.graph.adjacency_matrix import AdjacencyMatrixGraph
from backend.graph.adaptive_graph import AdaptiveGraph

def test_adjacency_list(sample_graph):
    assert sample_graph.node_count() == 6
    assert sample_graph.edge_count() == 7
    assert sample_graph.get_weight("n0", "n1") == 2.0
    neighbors = sample_graph.get_neighbors("n0")
    assert len(neighbors) == 2
    sample_graph.remove_edge("n0", "n1")
    assert sample_graph.get_weight("n0", "n1") is None

def test_adjacency_matrix():
    g = AdjacencyMatrixGraph()
    g.add_node("A")
    g.add_node("B")
    g.add_edge("A", "B", 5.0)
    assert g.get_weight("A", "B") == 5.0
    assert g.edge_count() == 1
    g.remove_edge("A", "B")
    assert g.get_weight("A", "B") is None

def test_adaptive_graph():
    g = AdaptiveGraph()
    for i in range(100):
        g.add_node(str(i))
    info = g.representation_info()
    assert info.get("representation_type") == "AdjacencyListGraph"
    
    for i in range(90):
        for j in range(i+1, 100):
            g.add_edge(str(i), str(j), 1.0)
            
    info = g.representation_info()
    assert info.get("representation_type") == "AdjacencyMatrixGraph"
