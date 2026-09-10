from fastapi import APIRouter, Request
import urllib.parse

router = APIRouter()

@router.get("/search")
async def search_places(q: str, request: Request):
    q = urllib.parse.unquote(q).lower()
    places_dict = request.app.state.places_dict
    
    results = []
    for p_id, p in places_dict.items():
        name = p.get("name", "").lower()
        ptype = p.get("type", "").lower()
        category = p.get("category", "").lower()
        services = [s.lower() for s in p.get("services", [])]
        
        score = 0
        if q == name:
            score += 100
        elif name.startswith(q):
            score += 50
        elif q in name:
            score += 20
            
        if q == ptype or q == category:
            score += 15
        elif q in ptype or q in category:
            score += 10
            
        if any(q in s for s in services):
            score += 5
            
        if score > 0:
            results.append({
                "id": p_id,
                "name": p.get("name", ""),
                "type": p.get("type", ""),
                "category": p.get("category", ""),
                "lat": p.get("lat", 0),
                "lng": p.get("lng", 0),
                "match_score": score
            })
            
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:20]
