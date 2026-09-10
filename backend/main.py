import os
import sys
import json
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database.seed import SeedDatabase
from backend.traffic.traffic_manager import TrafficManager
from backend.traffic.crowd_manager import CrowdManager
from backend.incidents.incident_manager import IncidentManager
from backend.routing.route_manager import RouteManager
from backend.routing.rerouter import Rerouter
from backend.emergency.emergency_router import EmergencyRouter
from backend.parking.parking_manager import ParkingManager
from backend.benchmarks.benchmark import BenchmarkRunner
from backend.api.websocket import ConnectionManager

from backend.api import routes
from backend.api import traffic_routes
from backend.api import emergency_routes
from backend.api import parking_routes
from backend.api import admin_routes
from backend.api import benchmark_routes
from backend.api import search
from backend.api import simulation_routes


async def simulation_tick(app: FastAPI):
    """Background task that periodically simulates traffic, crowd, and parking changes."""
    while True:
        await asyncio.sleep(30)
        try:
            app.state.traffic_manager.simulate_tick()
            app.state.crowd_manager.simulate_tick()
            app.state.parking_manager.simulate_tick()

            # Get changed edges and check for affected routes
            changed_edges = app.state.graph.get_changed_edges()
            if changed_edges:
                reroute_results = await app.state.rerouter.on_graph_change(
                    changed_edges, app.state.node_data_dict
                )

                # Broadcast traffic update
                await app.state.websocket_manager.broadcast({
                    "type": "traffic_update",
                    "data": {
                        "changed_edges": [[u, v] for u, v in changed_edges],
                        "traffic_states": app.state.traffic_manager.get_all_traffic_serializable(),
                    },
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                })

                # Broadcast parking update
                await app.state.websocket_manager.broadcast({
                    "type": "parking_update",
                    "data": {
                        "zones": app.state.parking_manager.get_all_zones(),
                    },
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                })
        except Exception as e:
            print(f"[simulation_tick] Error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: load data, build graph, init managers."""
    # Resolve data directory
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "campus")
    data_dir = os.path.abspath(data_dir)

    seeder = SeedDatabase(data_dir)
    graph, node_data, road_data, places = seeder.build_campus_graph()
    print(f"[startup] Graph loaded: {graph.node_count()} nodes, {graph.edge_count()} edges")

    app.state.graph = graph
    app.state.node_data_dict = node_data
    app.state.road_data_dict = road_data
    app.state.places_dict = places

    # Initialize managers
    app.state.traffic_manager = TrafficManager(graph)
    app.state.crowd_manager = CrowdManager()
    app.state.incident_manager = IncidentManager(graph)
    app.state.route_manager = RouteManager()
    app.state.websocket_manager = ConnectionManager()

    async def broadcast_callback(msg):
        await app.state.websocket_manager.broadcast(msg)

    app.state.rerouter = Rerouter(graph, app.state.route_manager, broadcast_callback)

    # Load emergency facilities from emergency.json
    emergency_facilities = []
    try:
        with open(os.path.join(data_dir, "emergency.json"), "r") as f:
            emergency_facilities = json.load(f)
    except Exception:
        # Fallback: extract emergency-type places
        emergency_facilities = [
            p for p in places.values()
            if p.get("type") in ("emergency", "hospital", "fire_station", "police", "security")
        ]
    app.state.emergency_router = EmergencyRouter(graph, emergency_facilities)

    # Load parking zones
    parking_data = []
    try:
        with open(os.path.join(data_dir, "parking.json"), "r") as f:
            parking_data = json.load(f)
    except Exception:
        pass
    app.state.parking_manager = ParkingManager(parking_data)

    app.state.benchmark_runner = BenchmarkRunner(graph, node_data)

    # Start background simulation
    task = asyncio.create_task(simulation_tick(app))

    print(f"[startup] Meridian Smart Campus ready at http://0.0.0.0:8000")
    yield

    task.cancel()


app = FastAPI(title="Meridian Smart Campus", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(routes.router, prefix="/api", tags=["Core"])
app.include_router(traffic_routes.router, prefix="/api", tags=["Traffic & Incidents"])
app.include_router(emergency_routes.router, prefix="/api", tags=["Emergency"])
app.include_router(parking_routes.router, prefix="/api", tags=["Parking"])
app.include_router(admin_routes.router, prefix="/api", tags=["Admin"])
app.include_router(benchmark_routes.router, prefix="/api", tags=["Benchmarks"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(simulation_routes.router, prefix="/api", tags=["Simulation & Intelligence"])


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await app.state.websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming messages if needed
    except WebSocketDisconnect:
        app.state.websocket_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8080, reload=True)
