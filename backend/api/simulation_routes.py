"""Simulation & Route Comparison API — What-If scenarios without modifying the live graph."""
import copy
import math
import time
import dataclasses
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from backend.graph.dynamic_graph import DynamicGraph
from backend.algorithms.dijkstra import dijkstra
from backend.algorithms.astar import astar

router = APIRouter()


# ── Request / Response models ──────────────────────────────────────────

class ScenarioAction(BaseModel):
    action: str  # "close_road", "heavy_traffic", "moderate_traffic", "severe_traffic", "accident", "flood", "construction", "crowd_surge"
    from_node: str
    to_node: str

class SimulateRequest(BaseModel):
    from_node: str
    to_node: str
    algorithm: str = "astar"
    actions: List[ScenarioAction]
    accessibility: Optional[Dict[str, bool]] = None  # avoid_stairs, prefer_lifts, wheelchair_only

class CompareRequest(BaseModel):
    from_node: str
    to_node: str
    modes: List[str] = ["fastest", "shortest", "eco", "low_congestion"]
    accessibility: Optional[Dict[str, bool]] = None


# ── Helpers ────────────────────────────────────────────────────────────

TRAFFIC_MULTIPLIERS = {"normal": 1.0, "moderate": 1.8, "heavy": 3.0, "severe": 5.0}
INCIDENT_MULTIPLIERS = {"accident": 4.0, "construction": 3.0, "crowd_surge": 2.5, "flood": 999.0}

ECO_WEIGHTS = {
    "distance_factor": 0.4,   # longer distance = more energy
    "congestion_factor": 0.35, # stop-and-go = more emissions
    "speed_factor": 0.25,      # higher speed = more fuel
}


def _safe(w):
    return -1 if (math.isinf(w) or math.isnan(w)) else w


def _build_route_dict(res, node_data, road_data, graph):
    """Convert a RouteResult into a rich JSON dict with intelligence data."""
    d = dataclasses.asdict(res)
    d["path_names"] = [node_data.get(n, {}).get("name", n) for n in d["path"]]
    d["eta_display"] = f"{int(d['eta_seconds'] // 60)} min"
    d["coordinates"] = [
        [node_data.get(n, {}).get("lat", 0), node_data.get(n, {}).get("lng", 0)]
        for n in d["path"]
    ]

    # ── Route Intelligence: explain WHY this route was chosen ──
    intelligence = _build_intelligence(d, node_data, road_data, graph)
    d["intelligence"] = intelligence

    # ── Eco score ──
    d["eco_score"] = _calc_eco_score(d, road_data, graph)

    # ── Accessibility info ──
    d["accessibility_info"] = _calc_accessibility_info(d, road_data)

    return d


def _build_intelligence(route_dict, node_data, road_data, graph):
    """Generate 'Why this route?' explanation from real graph data."""
    path = route_dict["path"]
    if not path or len(path) < 2:
        return {"summary": "No route found.", "details": []}

    details = []
    avoided_roads = []
    congested_segments = []
    closed_segments = []
    total_segments = 0

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        total_segments += 1
        rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        road_name = rd.get("name", f"{node_data.get(u,{}).get('name',u)} → {node_data.get(v,{}).get('name',v)}")

        # Check traffic multiplier on this segment
        meta = graph._edge_metadata.get((u, v), {})
        mult = meta.get("traffic_multiplier", 1.0)
        if mult >= 3.0:
            congested_segments.append({"road": road_name, "level": "severe" if mult >= 5.0 else "heavy"})

    # Check what roads were avoided (closed or very congested roads NOT on path)
    all_closed = list(graph._closed_roads)
    for u, v in all_closed:
        rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        rn = rd.get("name", f"{u} → {v}")
        closed_segments.append(rn)

    # Build summary
    summary_parts = []
    summary_parts.append(f"Route uses {total_segments} road segments via {route_dict['algorithm'].upper()}.")
    if route_dict.get("distance", 0) > 0:
        summary_parts.append(f"Total distance: {route_dict['distance']:.0f}m, ETA: {route_dict.get('eta_display', '?')}.")
    if closed_segments:
        summary_parts.append(f"Avoided {len(closed_segments)} closed road(s).")
    if congested_segments:
        summary_parts.append(f"Traverses {len(congested_segments)} congested segment(s).")
    else:
        summary_parts.append("No significant congestion on this route.")

    # Key junctions (nodes with degree >= 3)
    major_junctions = []
    for n in path[1:-1]:
        try:
            neighbors = graph._graph.get_neighbors(n) if hasattr(graph, '_graph') else graph.get_neighbors(n)
            if len(neighbors) >= 3:
                major_junctions.append(node_data.get(n, {}).get("name", n))
        except Exception:
            pass

    return {
        "summary": " ".join(summary_parts),
        "segments_used": total_segments,
        "closed_roads_avoided": closed_segments,
        "congested_segments": congested_segments,
        "major_junctions": major_junctions[:5],
        "algorithm": route_dict["algorithm"],
        "nodes_explored": route_dict.get("nodes_explored", 0),
        "edges_processed": route_dict.get("edges_processed", 0),
        "execution_time_ms": route_dict.get("execution_time_ms", 0),
        "details": details,
    }


def _calc_eco_score(route_dict, road_data, graph):
    """Estimate relative eco impact (0-100, lower is greener)."""
    path = route_dict["path"]
    if not path or len(path) < 2:
        return {"score": 0, "label": "N/A", "breakdown": {}}

    total_distance = route_dict.get("distance", 0)
    congestion_penalty = 0
    speed_penalty = 0

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        meta = graph._edge_metadata.get((u, v), {})
        mult = meta.get("traffic_multiplier", 1.0)
        congestion_penalty += (mult - 1.0) * rd.get("distance", 50)
        speed_limit = rd.get("speed_limit", 20)
        if speed_limit > 30:
            speed_penalty += (speed_limit - 30) * 0.5

    # Normalize to 0-100
    dist_score = min(total_distance / 30, 100) * ECO_WEIGHTS["distance_factor"]
    cong_score = min(congestion_penalty / 10, 100) * ECO_WEIGHTS["congestion_factor"]
    spd_score = min(speed_penalty, 100) * ECO_WEIGHTS["speed_factor"]
    raw = dist_score + cong_score + spd_score
    score = min(round(raw, 1), 100)

    if score < 25:
        label = "Excellent"
    elif score < 50:
        label = "Good"
    elif score < 75:
        label = "Moderate"
    else:
        label = "High Impact"

    return {
        "score": score,
        "label": label,
        "breakdown": {
            "distance_impact": round(dist_score, 1),
            "congestion_impact": round(cong_score, 1),
            "speed_impact": round(spd_score, 1),
        },
        "note": "Estimated relative environmental impact based on distance, congestion and speed. Lower is greener."
    }


def _calc_accessibility_info(route_dict, road_data):
    """Report accessibility characteristics of the route."""
    path = route_dict["path"]
    stairs_count = 0
    lift_count = 0
    wheelchair_ok = True
    steep_count = 0
    surfaces = set()

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        if rd.get("has_stairs", False):
            stairs_count += 1
        if rd.get("has_lift", False):
            lift_count += 1
        if not rd.get("wheelchair_accessible", True):
            wheelchair_ok = False
        if rd.get("gradient", 0) >= 3:
            steep_count += 1
        surfaces.add(rd.get("surface", "unknown"))

    return {
        "stairs_segments": stairs_count,
        "lift_segments": lift_count,
        "wheelchair_accessible": wheelchair_ok,
        "steep_segments": steep_count,
        "surfaces": list(surfaces),
    }


def _apply_accessibility_costs(graph, road_data, node_data, prefs):
    """Apply accessibility preference penalties to a graph (call on temp copy only)."""
    if not prefs:
        return
    avoid_stairs = prefs.get("avoid_stairs", False)
    prefer_lifts = prefs.get("prefer_lifts", False)
    wheelchair_only = prefs.get("wheelchair_only", False)

    for u, v, w in list(graph.get_edges()):
        rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
        penalty = 1.0
        if avoid_stairs and rd.get("has_stairs", False) and not rd.get("has_lift", False):
            penalty *= 10.0  # heavy penalty
        if wheelchair_only and not rd.get("wheelchair_accessible", True):
            penalty *= 50.0  # near-prohibitive
        if prefer_lifts and rd.get("has_lift", False):
            penalty *= 0.7  # slight bonus
        if rd.get("gradient", 0) >= 3 and (avoid_stairs or wheelchair_only):
            penalty *= 3.0

        if penalty != 1.0:
            new_w = w * penalty
            graph.update_edge_weight(u, v, new_w)


def _clone_graph(live_graph):
    """Create a deep copy of the DynamicGraph for simulation (never touches live)."""
    sim = DynamicGraph()
    # Copy nodes
    for n in live_graph.get_nodes():
        data = live_graph.get_node_data(n)
        sim.add_node(n, data)
    # Copy edges with raw base weights from inner graph
    for u, v, w in live_graph._graph.get_edges():
        meta = live_graph._edge_metadata.get((u, v))
        sim.add_edge(u, v, w, copy.copy(meta) if meta else None)
    # Copy closed roads
    for u, v in live_graph._closed_roads:
        sim.close_road(u, v)
    # Copy traffic multipliers from metadata
    for (u, v), meta in live_graph._edge_metadata.items():
        if "traffic_multiplier" in meta:
            sim.apply_traffic_multiplier(u, v, meta["traffic_multiplier"])
    # Clear changed edges so simulation doesn't pollute
    sim.get_changed_edges()
    return sim


# ── Endpoints ──────────────────────────────────────────────────────────

@router.post("/simulate")
async def simulate_scenario(req: SimulateRequest, request: Request):
    """Run a what-if simulation on a TEMPORARY graph copy."""
    live_graph = request.app.state.graph
    node_data = request.app.state.node_data_dict
    road_data = request.app.state.road_data_dict

    if not live_graph.has_node(req.from_node) or not live_graph.has_node(req.to_node):
        raise HTTPException(400, "Invalid source or destination node")

    # 1. Current route on LIVE graph
    algo_fn = dijkstra if req.algorithm == "dijkstra" else astar
    current_result = algo_fn(live_graph, req.from_node, req.to_node, node_data)
    current_dict = _build_route_dict(current_result, node_data, road_data, live_graph)

    # 2. Clone graph for simulation
    sim_graph = _clone_graph(live_graph)

    # 3. Apply scenario actions
    applied = []
    for act in req.actions:
        u, v = act.from_node, act.to_node
        if not sim_graph.has_node(u) or not sim_graph.has_node(v):
            continue
        if act.action == "close_road":
            sim_graph.close_road(u, v)
            if sim_graph.has_edge(v, u):
                sim_graph.close_road(v, u)
            applied.append(f"Closed {u} ↔ {v}")
        elif act.action in ("heavy_traffic", "moderate_traffic", "severe_traffic"):
            level = act.action.replace("_traffic", "")
            mult = TRAFFIC_MULTIPLIERS.get(level, 3.0)
            sim_graph.apply_traffic_multiplier(u, v, mult)
            if sim_graph.has_edge(v, u):
                sim_graph.apply_traffic_multiplier(v, u, mult)
            applied.append(f"{level.capitalize()} traffic on {u} ↔ {v}")
        elif act.action in INCIDENT_MULTIPLIERS:
            mult = INCIDENT_MULTIPLIERS[act.action]
            if mult >= 999:
                sim_graph.close_road(u, v)
                if sim_graph.has_edge(v, u):
                    sim_graph.close_road(v, u)
            else:
                sim_graph.apply_traffic_multiplier(u, v, mult)
                if sim_graph.has_edge(v, u):
                    sim_graph.apply_traffic_multiplier(v, u, mult)
            applied.append(f"{act.action.replace('_',' ').title()} on {u} ↔ {v}")

    # 4. Apply accessibility preferences
    if req.accessibility:
        _apply_accessibility_costs(sim_graph, road_data, node_data, req.accessibility)

    # 5. Route on simulated graph
    sim_result = algo_fn(sim_graph, req.from_node, req.to_node, node_data)
    sim_dict = _build_route_dict(sim_result, node_data, road_data, sim_graph)

    # 6. Compute deltas
    eta_change = sim_dict["eta_seconds"] - current_dict["eta_seconds"]
    cost_change = sim_dict["cost"] - current_dict["cost"]
    dist_change = sim_dict["distance"] - current_dict["distance"]

    return {
        "current_route": current_dict,
        "simulated_route": sim_dict,
        "actions_applied": applied,
        "comparison": {
            "eta_change_seconds": round(eta_change, 1),
            "eta_change_display": f"{'+' if eta_change > 0 else ''}{int(eta_change // 60)} min {int(abs(eta_change) % 60)} sec",
            "cost_change": round(cost_change, 1),
            "distance_change_meters": round(dist_change, 1),
            "current_nodes_explored": current_dict["nodes_explored"],
            "simulated_nodes_explored": sim_dict["nodes_explored"],
            "route_changed": current_dict["path"] != sim_dict["path"],
            "simulated_route_found": sim_dict["found"],
        }
    }


@router.post("/compare-routes")
async def compare_routes(req: CompareRequest, request: Request):
    """Compare multiple route strategies side-by-side."""
    live_graph = request.app.state.graph
    node_data = request.app.state.node_data_dict
    road_data = request.app.state.road_data_dict

    if not live_graph.has_node(req.from_node) or not live_graph.has_node(req.to_node):
        raise HTTPException(400, "Invalid source or destination node")

    results = {}
    algo_fn = astar  # Use A* for all comparisons

    for mode in req.modes:
        # Clone for each mode to apply different cost modifications
        g = _clone_graph(live_graph)

        if mode == "shortest":
            # Re-weight edges by distance instead of time
            for u, v, w in list(live_graph._graph.get_edges()):
                rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
                dist = rd.get("distance", 50)
                g.update_edge_weight(u, v, dist)
        elif mode == "eco":
            # Penalize high-speed, high-congestion roads
            for u, v, w in list(live_graph._graph.get_edges()):
                rd = road_data.get(f"{u}_{v}") or road_data.get(f"{v}_{u}", {})
                meta = live_graph._edge_metadata.get((u, v), {})
                mult = meta.get("traffic_multiplier", 1.0)
                speed = rd.get("speed_limit", 20)
                eco_penalty = 1.0 + (mult - 1.0) * 0.5 + max(0, speed - 20) * 0.02
                g.update_edge_weight(u, v, w * eco_penalty)
        elif mode == "low_congestion":
            # Heavily penalize congested roads
            for u, v, w in list(live_graph._graph.get_edges()):
                meta = live_graph._edge_metadata.get((u, v), {})
                mult = meta.get("traffic_multiplier", 1.0)
                cong_penalty = 1.0 + (mult - 1.0) * 3.0
                g.update_edge_weight(u, v, w * cong_penalty)
        # "fastest" uses the live graph weights as-is

        # Apply accessibility if specified
        if req.accessibility:
            _apply_accessibility_costs(g, road_data, node_data, req.accessibility)

        res = algo_fn(g, req.from_node, req.to_node, node_data)
        rd_dict = _build_route_dict(res, node_data, road_data, g)
        rd_dict["mode"] = mode
        results[mode] = rd_dict

    # Determine recommendation
    valid = {k: v for k, v in results.items() if v.get("found")}
    recommended = None
    if valid:
        # Score: lower is better (normalized ETA + eco)
        best = min(valid.items(), key=lambda kv: kv[1]["cost"] * 0.6 + kv[1].get("eco_score", {}).get("score", 50) * 0.4)
        recommended = best[0]
        reason = f"Best balance of travel time ({results[recommended]['eta_display']}) and environmental impact (eco score: {results[recommended].get('eco_score',{}).get('score','?')})."
    else:
        reason = "No valid routes found."

    return {
        "routes": results,
        "recommended": recommended,
        "recommendation_reason": reason,
    }


@router.post("/route-with-intelligence")
async def route_with_intelligence(req: SimulateRequest, request: Request):
    """Calculate a single route with full intelligence, eco, and accessibility data."""
    live_graph = request.app.state.graph
    node_data = request.app.state.node_data_dict
    road_data = request.app.state.road_data_dict

    if not live_graph.has_node(req.from_node) or not live_graph.has_node(req.to_node):
        raise HTTPException(400, "Invalid source or destination node")

    g = live_graph
    if req.accessibility:
        g = _clone_graph(live_graph)
        _apply_accessibility_costs(g, road_data, node_data, req.accessibility)

    algo_fn = dijkstra if req.algorithm == "dijkstra" else astar
    res = algo_fn(g, req.from_node, req.to_node, node_data)
    route = _build_route_dict(res, node_data, road_data, g)
    return route
