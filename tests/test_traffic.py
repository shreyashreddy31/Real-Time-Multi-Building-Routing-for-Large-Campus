import pytest
from backend.traffic.traffic_manager import TrafficManager

def test_traffic_multipliers(dynamic_graph):
    tm = TrafficManager(dynamic_graph)
    tm.update_traffic("n0", "n1", "heavy")
    assert dynamic_graph.get_effective_weight("n0", "n1") == 2.0 * 3.0
    tm.simulate_tick()
    # verify some roads changed
