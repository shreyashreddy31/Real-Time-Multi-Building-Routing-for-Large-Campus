import json
from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        for room in self.rooms.values():
            if websocket in room:
                room.remove(websocket)

    async def broadcast(self, message: dict):
        # Convert message to JSON string if it's a dict
        msg_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception:
                pass
                
    def subscribe(self, websocket: WebSocket, room: str):
        if room not in self.rooms:
            self.rooms[room] = []
        if websocket not in self.rooms[room]:
            self.rooms[room].append(websocket)

    async def broadcast_to_room(self, room: str, message: dict):
        if room in self.rooms:
            msg_str = json.dumps(message)
            for connection in self.rooms[room]:
                try:
                    await connection.send_text(msg_str)
                except Exception:
                    pass
