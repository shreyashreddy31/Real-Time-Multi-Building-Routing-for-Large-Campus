from fastapi import APIRouter, Request, HTTPException
from backend.api.models import RouteResponse
from pydantic import BaseModel

class NavigateParkingRequest(BaseModel):
    from_node: str
    zone_id: str

router = APIRouter()

@router.get("/parking")
async def get_parking(request: Request):
    pm = request.app.state.parking_manager
    return pm.get_all_zones()

@router.post("/parking/navigate", response_model=RouteResponse)
async def navigate_parking(req: NavigateParkingRequest, request: Request):
    pm = request.app.state.parking_manager
    graph = request.app.state.graph
    node_data = request.app.state.node_data_dict
    
    res = pm.navigate_to_parking(req.from_node, req.zone_id, graph, node_data)
    if not res:
        raise HTTPException(status_code=404, detail="Route not found")
    return res
