import redis.asyncio as redis
from .config import settings
import json
from typing import Any

class RedisManager:
    def __init__(self):
        self.redis = None

    async def connect(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Any:
        if not self.redis:
            return None
        val = await self.redis.get(key)
        if val:
            try:
                return json.loads(val)
            except:
                return val
        return None

    async def set(self, key: str, value: Any, expire: int = None):
        if not self.redis:
            return
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await self.redis.set(key, value, ex=expire)

    async def delete(self, key: str):
        if not self.redis:
            return
        await self.redis.delete(key)
        
    async def publish(self, channel: str, message: Any):
        if not self.redis:
            return
        if isinstance(message, (dict, list)):
            message = json.dumps(message)
        await self.redis.publish(channel, message)

redis_client = RedisManager()

async def get_redis():
    return redis_client
