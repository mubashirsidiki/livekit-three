import uuid

import aiohttp

from core.logging.logger import LOG
from constants import CHATBOT_API_URL


class JambhalaClient:
    def __init__(self):
        self._session_id = str(uuid.uuid4())

    async def chat(self, message: str) -> str | None:
        """Send a message to the Jambhala chatbot and return the reply."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    CHATBOT_API_URL,
                    json={
                        "message": message,
                        "session_id": self._session_id,
                    },
                ) as resp:
                    resp.raise_for_status()
                    data = await resp.json()
                    return data.get("reply") or None
        except Exception as e:
            LOG.error(f"Jambhala API error: {e}")
            return None


jambhala_client = JambhalaClient()
