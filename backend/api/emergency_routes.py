from fastapi import APIRouter, Request, HTTPException
from backend.api.models import EmergencyRequest, EmergencyResponse

router = APIRouter()

@router.post("/emergency", response_model=EmergencyResponse)
async def dispatch_emergency(req: EmergencyRequest, request: Request):
    em = request.app.state.emergency_router
    node_data = request.app.state.node_data_dict
    
    dispatch_info = em.dispatch(req.vehicle_type, req.from_node, req.to_node, node_data)
    if not dispatch_info:
        raise HTTPException(status_code=500, detail="Dispatch failed")
        
    return dispatch_info
