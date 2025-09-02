from typing import List, Union
import os
import httpx
from dotenv import load_dotenv
from utils.logger import logger
from config.constants import EMBEDDINGS_MODEL, OPENROUTER_BASE_URL


class Embedder:
    """Simple OpenRouter embeddings wrapper with batch support."""

    def __init__(self, model_name: str | None = None):
        load_dotenv()
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY environment variable is not set")
        self.api_key = api_key
        self.base_url = OPENROUTER_BASE_URL.rstrip("/")
        self.model_name = model_name or EMBEDDINGS_MODEL
        self.client = httpx.Client(timeout=30, follow_redirects=False)

    def _headers(self) -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        site_url = os.environ.get("OPENROUTER_SITE_URL") or os.environ.get("OPENROUTER_REFERRER")
        app_name = os.environ.get("OPENROUTER_APP_NAME") or os.environ.get("OPENROUTER_TITLE")
        if site_url:
            headers["HTTP-Referer"] = site_url
            headers["Origin"] = site_url
        if app_name:
            headers["X-Title"] = app_name
        headers["User-Agent"] = os.environ.get("USER_AGENT", "obot-ai/1.0 (+httpx)")
        return headers

    def encode(self, texts: Union[str, List[str]], batch_size: int = 64) -> Union[List[float], List[List[float]]]:
        if isinstance(texts, str):
            texts = [texts]

        embeddings: List[List[float]] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            resp = self.client.post(
                f"{self.base_url}/embeddings",
                headers=self._headers(),
                json={"model": self.model_name, "input": batch},
            )
            if 300 <= resp.status_code < 400:
                location = resp.headers.get("location", "<none>")
                logger.error(f"Embeddings request redirected to: {location}")
                resp.raise_for_status()
            resp.raise_for_status()
            data = resp.json()
            embeddings.extend([item["embedding"] for item in data["data"]])

        return embeddings[0] if len(embeddings) == 1 else embeddings
    
