import aiohttp
from core.logging.logger import LOG
from core.models.models import CallMetadata, PromptDto
from constants import FETCH_PROMPT_URL, CALL_ANALYTICS_URL


class BackendClient:
    def __init__(self):
        self.fetch_prompt_url = FETCH_PROMPT_URL
        self.call_analytics_url = CALL_ANALYTICS_URL

        self._ensure_configured()

    def _ensure_configured(self):
        if not self.fetch_prompt_url or not self.call_analytics_url:
            LOG.error("One or more backend URLs are not configured")
            raise ValueError("One or more backend URLs are not configured")

    async def fetch_prompt(self, access_token: str, prompt_id: str) -> PromptDto:

        self._ensure_configured()

        url = self.fetch_prompt_url + f"/{prompt_id}"
        headers = {"authorization": f"Bearer {access_token}"}

        LOG.info(f"Fetching prompt with id={prompt_id} from backend")

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    response.raise_for_status()
                    data = await response.json()
                    LOG.info("Prompt fetched successfully")
                    return data
        except aiohttp.ClientError as e:
            LOG.error(f"Error fetching prompt: {e}")
            raise
        except Exception as e:
            LOG.error(f"Unexpected error fetching prompt: {e}", exc_info=True)
            raise

    async def send_call_analytics(
        self, access_token: str, metadata: CallMetadata
    ) -> bool:

        url = self.call_analytics_url
        headers = {"authorization": f"Bearer {access_token}"}

        body = metadata.model_dump(mode="json", by_alias=True)

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    headers=headers,
                    json=body,
                ) as resp:
                    resp.raise_for_status()
                    LOG.info("Call metadata sent successfully")
                    return True
        except Exception as e:
            LOG.error(f"Failed to send call metadata: {e}")
            return False


backend_client = BackendClient()
