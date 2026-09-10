import math
from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict, Any
from backend.api.models import RouteRequest, RouteResponse
import dataclasses
import uuid
from backend.algorithms.dijkstra import dijkstra
from backend.algorithms.astar import astar

router = APIRouter()


def _safe_weight(w):
    """Convert inf/nan to JSON-safe values."""
    if math.isinf(w) or math.isnan(w):
        return -1  # -1 signals closed/invalid
    return w


@router.get("/network")
async def get_network(request: Request):
    graph = request.app.state.graph
    info = graph.representation_info()
    return {
        "nodes": graph.get_nodes(),
        "edges": [
            {"from": u, "to": v, "weight": _safe_weight(w), "closed": math.isinf(w)}
            for u, v, w in graph.get_edges()
        ],
        **info
    }


@router.get("/places")
async def get_places(request: Request):
    return list(request.app.state.places_dict.values())


@router.get("/places/{id}")
async def get_place(id: str, request: Request):
    place = request.app.state.places_dict.get(id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place


@router.get("/nodes")
async def get_nodes(request: Request):
    return list(request.app.state.node_data_dict.values())


@router.get("/edges")
async def get_edges(request: Request):
    graph = request.app.state.graph
    road_data = request.app.state.road_data_dict
    edges = []
    for u, v, w in graph.get_edges():
        data = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        edges.append({
            "from": u,
            "to": v,
            "weight": _safe_weight(w),
            "closed": math.isinf(w),
            "name": data.get("name", "Unknown Road"),
            "distance": data.get("distance", 0),
            "base_time": data.get("base_time", _safe_weight(w)),
        })
    return edges


@router.post("/route")
async def get_route(req: RouteRequest, request: Request):
    graph = request.app.state.graph
    node_data = request.app.state.node_data_dict
    road_data = request.app.state.road_data_dict
    route_manager = request.app.state.route_manager

    if req.algorithm == "dijkstra":
        res = dijkstra(graph, req.from_node, req.to_node, node_data)
    else:
        res = astar(graph, req.from_node, req.to_node, node_data)

    from backend.api.simulation_routes import _build_route_dict
    res_dict = _build_route_dict(res, node_data, road_data, graph)

    route_id = route_manager.add_route(res_dict)
    res_dict["route_id"] = route_id

    return res_dict
