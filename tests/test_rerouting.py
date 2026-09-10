import pytest
from backend.routing.rerouter import Rerouter
from backend.routing.route_manager import RouteManager


@pytest.mark.asyncio
async def test_rerouting(dynamic_graph, node_data):
    """Test that closing a road triggers rerouting for affected routes."""
    rm = RouteManager()

    # Add a route that goes through n2->n3
    route_id = rm.add_route({
        "path": ["n0", "n1", "n2", "n3", "n4", "n5"],
        "algorithm": "dijkstra"
    })

    rr = Rerouter(dynamic_graph, rm, None)

    # Close road n2->n3
    dynamic_graph.close_road("n2", "n3")

    # Check that the route is affected
    affected = rm.check_affected_routes({("n2", "n3")})
    assert len(affected) == 1
    assert affected[0] == route_id

    # Reroute
    results = await rr.on_graph_change({("n2", "n3")}, node_data)
    assert len(results) == 1
    new_route = results[0]
    assert new_route["found"] is True
    # n2->n3 is closed, so it should go via n2->n5
    # Best path: n0->n1->n2->n5 (cost=10) or n0->n2->n5 (cost=11)
    assert "n3" not in new_route["path"]  # must not use closed road


@pytest.mark.asyncio
async def test_unaffected_route_not_rerouted(dynamic_graph, node_data):
    """Test that routes not using changed edges are not rerouted."""
    rm = RouteManager()

    # A route that doesn't go through n3->n4
    route_id = rm.add_route({
        "path": ["n0", "n1", "n2"],
        "algorithm": "dijkstra"
    })

    rr = Rerouter(dynamic_graph, rm, None)

    # Close road n3->n4 (not used by our route)
    dynamic_graph.close_road("n3", "n4")

    affected = rm.check_affected_routes({("n3", "n4")})
    assert len(affected) == 0  # our route is unaffected


def test_rerouting_stats():
    """Test rerouting statistics tracking."""
    rm = RouteManager()
    rm.add_route({"path": ["a", "b", "c"], "algorithm": "dijkstra"})

    # First check: edge b->c changed -> should be affecting
    affected = rm.check_affected_routes({("b", "c")})
    assert len(affected) == 1
    assert rm.route_affecting_updates == 1
    assert rm.ignored_updates == 0

    # Second check: edge x->y changed -> should be ignored
    affected = rm.check_affected_routes({("x", "y")})
    assert len(affected) == 0
    assert rm.ignored_updates == 1
