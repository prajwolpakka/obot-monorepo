from llm_providers.openrouter_provider import OpenRouterProvider
from llm_providers.ollama_provider import OllamaProvider
from utils.logger import logger
from typing import Literal


def get_llm(provider: Literal["openrouter", "ollama"] | str = "openrouter", **kwargs):
    provider = (provider or "openrouter").lower()
    if provider == "ollama":
        return OllamaProvider(**kwargs)
    # Default and only other option
    return OpenRouterProvider(**kwargs)


async def generate_response(prompt: str, provider: str = "openrouter", stream: bool = False, **kwargs):
    try:
        llm = get_llm(provider, **kwargs)

        if stream:
            # For streaming, return the async generator directly
            return llm.generate_response_stream(prompt)

        response = await llm.generate_response(prompt, stream=stream)
        return response

    except Exception as e:
        raise
