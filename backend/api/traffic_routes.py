from fastapi import APIRouter, Request, HTTPException
from backend.api.models import TrafficUpdateRequest, RoadCloseRequest, IncidentRequest, IncidentResponse
import time
import dataclasses

router = APIRouter()


@router.post("/traffic")
async def update_traffic(req: TrafficUpdateRequest, request: Request):
    """Update traffic level on a road segment."""
    tm = request.app.state.traffic_manager
    graph = request.app.state.graph
    tm.update_traffic(req.from_node, req.to_node, req.level)

    # Broadcast traffic update
    ws = request.app.state.websocket_manager
    await ws.broadcast({
        "type": "traffic_update",
        "data": {
            "from_node": req.from_node,
            "to_node": req.to_node,
            "level": req.level,
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    # Check for affected routes and reroute
    changed_edges = graph.get_changed_edges()
    if changed_edges:
        await request.app.state.rerouter.on_graph_change(
            changed_edges, request.app.state.node_data_dict
        )

    return {"success": True, "message": f"Traffic on {req.from_node}->{req.to_node} set to {req.level}"}


@router.post("/road/close")
async def close_road(req: RoadCloseRequest, request: Request):
    """Close a road segment."""
    graph = request.app.state.graph
    graph.close_road(req.from_node, req.to_node)

    # Broadcast
    ws = request.app.state.websocket_manager
    await ws.broadcast({
        "type": "road_closed",
        "data": {"from_node": req.from_node, "to_node": req.to_node, "reason": req.reason},
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    # Check rerouting
    changed_edges = graph.get_changed_edges()
    if changed_edges:
        await request.app.state.rerouter.on_graph_change(
            changed_edges, request.app.state.node_data_dict
        )

    return {"success": True, "message": f"Road {req.from_node}->{req.to_node} closed"}


@router.post("/road/open")
async def open_road(req: RoadCloseRequest, request: Request):
    """Reopen a closed road segment."""
    graph = request.app.state.graph
    graph.open_road(req.from_node, req.to_node)

    ws = request.app.state.websocket_manager
    await ws.broadcast({
        "type": "road_opened",
        "data": {"from_node": req.from_node, "to_node": req.to_node},
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    changed_edges = graph.get_changed_edges()
    if changed_edges:
        await request.app.state.rerouter.on_graph_change(
            changed_edges, request.app.state.node_data_dict
        )

    return {"success": True, "message": f"Road {req.from_node}->{req.to_node} reopened"}


@router.post("/incident")
async def create_incident(req: IncidentRequest, request: Request):
    """Create a new incident (construction, accident, flood, etc.)."""
    im = request.app.state.incident_manager
    graph = request.app.state.graph
    node_data = request.app.state.node_data_dict

    incident = im.create_incident(
        req.type, req.from_node, req.to_node, req.severity, req.description, req.duration_minutes
    )

    # Add human-readable names
    incident["from_name"] = node_data.get(req.from_node, {}).get("name", req.from_node)
    incident["to_name"] = node_data.get(req.to_node, {}).get("name", req.to_node)
    incident["road_name"] = f"{incident['from_name']} → {incident['to_name']}"

    # Broadcast incident creation
    ws = request.app.state.websocket_manager
    await ws.broadcast({
        "type": "incident_created",
        "data": incident,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    # Check rerouting for affected active routes
    changed_edges = graph.get_changed_edges()
    if changed_edges:
        await request.app.state.rerouter.on_graph_change(
            changed_edges, request.app.state.node_data_dict
        )

    return incident


@router.post("/incident/{id}/resolve")
async def resolve_incident(id: str, request: Request):
    """Resolve an active incident and restore the road."""
    im = request.app.state.incident_manager
    graph = request.app.state.graph

    incident = im.get_incident(id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    success = im.resolve_incident(id)
    if not success:
        raise HTTPException(status_code=400, detail="Could not resolve incident")

    # Broadcast resolution
    ws = request.app.state.websocket_manager
    await ws.broadcast({
        "type": "incident_resolved",
        "data": {"id": id, "status": "resolved"},
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    })

    # Check if any routes can be improved
    changed_edges = graph.get_changed_edges()
    if changed_edges:
        await request.app.state.rerouter.on_graph_change(
            changed_edges, request.app.state.node_data_dict
        )

    return {"success": True, "message": f"Incident {id} resolved"}


@router.get("/incidents")
async def get_incidents(request: Request):
    """Get all active incidents."""
    im = request.app.state.incident_manager
    node_data = request.app.state.node_data_dict
    active = im.get_active_incidents()
    for inc in active:
        inc["from_name"] = node_data.get(inc["from_node"], {}).get("name", inc["from_node"])
        inc["to_name"] = node_data.get(inc["to_node"], {}).get("name", inc["to_node"])
        inc["road_name"] = f"{inc['from_name']} → {inc['to_name']}"
    return active
