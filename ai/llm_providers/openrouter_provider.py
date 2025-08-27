from .base import LLMProvider
from typing import AsyncGenerator
import os
import json
import httpx
import asyncio
from utils.logger import logger

class OpenRouterProvider(LLMProvider):
    """LLM provider for OpenRouter"""

    BASE_URL = "https://openrouter.ai/api/v1"

    def __init__(self, model_name: str | None = None):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY not set in environment variables.")
        self.api_key = api_key
        self.model_name = model_name or os.getenv("OPENROUTER_MODEL", "gpt-3.5-turbo")

        # Log basic configuration
        logger.info(f"🤖 OpenRouter initialized with model: {self.model_name}")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.getenv("OPENROUTER_REFERRER", "http://localhost"),
            "X-Title": os.getenv("OPENROUTER_TITLE", "obot"),
        }

    async def generate_response(self, prompt: str, stream: bool = False, retries: int = 3):
        if stream:
            return self.generate_response_stream(prompt)

        for attempt in range(retries):
            try:
                payload = {
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                }

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.BASE_URL}/chat/completions",
                        headers=self.headers,
                        json=payload,
                        timeout=60,
                    )

                    response.raise_for_status()
                    data = response.json()

                    return data["choices"][0]["message"]["content"].strip()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and attempt < retries - 1:
                    # Rate limited - exponential backoff
                    wait_time = (2 ** attempt) * 60  # 2min, 4min, 8min
                    logger.warning(f"🚦 OpenRouter rate limited (attempt {attempt + 1}/{retries}). Waiting {wait_time}s before retry.")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    logger.error(f"❌ OpenRouter HTTP {e.response.status_code}: {e.response.text[:200]}...")
                    raise
            except Exception as e:
                logger.error(f"💥 OpenRouter request failed: {str(e)}")
                if attempt < retries - 1:
                    logger.warning(f"🔄 Retrying in {2 ** attempt}s (attempt {attempt + 1}/{retries})")
                    await asyncio.sleep(2 ** attempt)
                    continue
                else:
                    raise

    async def generate_response_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json=payload,
            ) as response:
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line[len("data:"):].strip()
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        content = chunk["choices"][0]["delta"].get("content")
                        if content:
                            yield content
                    except Exception as e:
                        logger.error(f"Error parsing OpenRouter stream chunk: {e}")
                        continue
