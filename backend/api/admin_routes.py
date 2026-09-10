from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/statistics")
async def get_statistics(request: Request):
    """Get comprehensive system statistics."""
    graph = request.app.state.graph
    rm = request.app.state.route_manager
    im = request.app.state.incident_manager
    tm = request.app.state.traffic_manager
    pm = request.app.state.parking_manager
    info = graph.representation_info()

    total_parking = sum(z.get("total_spaces", 0) for z in pm.get_all_zones())
    occupied_parking = sum(z.get("occupied", 0) for z in pm.get_all_zones())

    return {
        "node_count": graph.node_count(),
        "edge_count": graph.edge_count(),
        "density": round(info.get("density", 0), 4),
        "average_degree": round(info.get("average_degree", 0), 2),
        "representation": info.get("representation_type", "unknown"),
        "active_routes": len(rm.get_active_routes()),
        "active_incidents": len(im.get_active_incidents()),
        "total_reroutes": rm.reroute_count,
        "route_affecting_updates": rm.route_affecting_updates,
        "ignored_updates": rm.ignored_updates,
        "avg_reroute_time_ms": round(
            rm.total_reroute_time_ms / max(1, rm.reroute_count), 2
        ),
        "total_parking_spaces": total_parking,
        "available_parking": total_parking - occupied_parking,
        "traffic_states": tm.get_all_traffic_serializable(),
    }


import math
def _safe_weight(w):
    if math.isinf(w) or math.isnan(w):
        return -1
    return w

@router.get("/edges/list")
async def list_edges(request: Request):
    """List all edges with names for admin UI dropdowns."""
    graph = request.app.state.graph
    road_data = request.app.state.road_data_dict
    node_data = request.app.state.node_data_dict
    edges = []
    seen = set()
    for u, v, w in graph.get_edges():
        key = f"{u}-{v}"
        if key in seen:
            continue
        seen.add(key)
        u_name = node_data.get(u, {}).get("name", u)
        v_name = node_data.get(v, {}).get("name", v)
        # Look up road name
        road_name = None
        for rid, rd in road_data.items():
            if (rd.get("from") == u and rd.get("to") == v) or (rd.get("from") == v and rd.get("to") == u):
                road_name = rd.get("name")
                break
        edges.append({
            "from_node": u,
            "to_node": v,
            "from_name": u_name,
            "to_name": v_name,
            "road_name": road_name or f"{u_name} → {v_name}",
            "weight": _safe_weight(w),
            "closed": math.isinf(w)
        })
    return edges


@router.get("/active-routes")
async def get_active_routes(request: Request):
    """Get all currently active routes."""
    rm = request.app.state.route_manager
    return rm.get_active_routes()


@router.get("/rerouting-stats")
async def get_rerouting_stats(request: Request):
    """Get event-driven rerouting statistics."""
    rm = request.app.state.route_manager
    return {
        "total_updates": rm.total_updates,
        "route_affecting_updates": rm.route_affecting_updates,
        "ignored_updates": rm.ignored_updates,
        "reroute_count": rm.reroute_count,
        "total_reroute_time_ms": round(rm.total_reroute_time_ms, 2),
        "avg_reroute_time_ms": round(
            rm.total_reroute_time_ms / max(1, rm.reroute_count), 2
        ),
    }
