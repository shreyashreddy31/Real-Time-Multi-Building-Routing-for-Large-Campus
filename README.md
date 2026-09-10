# Meridian Smart Campus

Meridian Smart Campus is an intelligent routing and campus management system.

## Features
- Real-time campus navigation using Dijkstra and A* algorithms
- Dynamic traffic and crowd simulation
- Incident and roadblock management with automatic rerouting
- Emergency vehicle dispatch optimization
- Smart parking availability tracking
- Extensive backend API and modern React frontend

## Architecture
```mermaid
graph TD;
    Client-->API Gateway;
    API Gateway-->Route Manager;
    API Gateway-->Traffic Manager;
    API Gateway-->Incident Manager;
    Route Manager-->Graph;
    Traffic Manager-->Graph;
    Incident Manager-->Graph;
```

## Tech Stack
| Component | Technology |
| --- | --- |
| Backend | FastAPI (Python) |
| Frontend | React, TailwindCSS |
| Algorithms | Dijkstra, A* |
| Real-time | WebSockets |

## Setup Instructions

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Documentation
- `GET /api/network`: Get full campus graph data.
- `GET /api/places`: List all campus locations.
- `POST /api/route`: Calculate shortest path.
- `POST /api/traffic`: Update traffic levels.
- `POST /api/incident`: Report an incident.
- `GET /api/parking`: Get parking availability.

## DSA Concepts
- **Adjacency List & Matrix**: Dual graph representation for efficient algorithm execution.
- **Dijkstra's Algorithm**: For optimal, unbounded shortest paths.
- **A* Algorithm**: Heuristic-based fast pathfinding.
- **Min-Heap**: Priority queue for graph traversal algorithms.

## Testing
Run the test suite from the project root:
```bash
pytest tests/
```

## License
MIT License
