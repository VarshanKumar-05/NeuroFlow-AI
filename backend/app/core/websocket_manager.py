import asyncio
import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Maps topic -> set of active WebSocket connections
        self.topics: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"Client connected: {user_id}. Total connections for user: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if len(self.active_connections[user_id]) == 0:
                del self.active_connections[user_id]
        
        # Remove from all topics
        for topic in list(self.topics.keys()):
            if websocket in self.topics[topic]:
                self.topics[topic].remove(websocket)
                if len(self.topics[topic]) == 0:
                    del self.topics[topic]
                    
        logger.info(f"Client disconnected: {user_id}")

    async def subscribe(self, websocket: WebSocket, topic: str):
        if topic not in self.topics:
            self.topics[topic] = set()
        self.topics[topic].add(websocket)

    async def unsubscribe(self, websocket: WebSocket, topic: str):
        if topic in self.topics and websocket in self.topics[topic]:
            self.topics[topic].remove(websocket)
            if len(self.topics[topic]) == 0:
                del self.topics[topic]

    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        if user_id in self.active_connections:
            websockets = list(self.active_connections[user_id])
            for websocket in websockets:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
                    self.disconnect(websocket, user_id)

    async def broadcast(self, message: Dict[str, Any], topic: str = None):
        """
        Broadcast a message to a specific topic or to all connected clients if topic is None.
        """
        if topic:
            if topic in self.topics:
                websockets = list(self.topics[topic])
                for websocket in websockets:
                    try:
                        await websocket.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to topic {topic}: {e}")
        else:
            for user_id, websockets_set in list(self.active_connections.items()):
                for websocket in list(websockets_set):
                    try:
                        await websocket.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to user {user_id}: {e}")
                        self.disconnect(websocket, user_id)

manager = ConnectionManager()
