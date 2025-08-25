from llm_providers.ollama_provider import OllamaProvider
from llm_providers.gemini_provider import GeminiProvider
from utils.logger import logger
from typing import Literal

def get_llm(provider: Literal["ollama", "gemini"], **kwargs):
    if provider == "ollama":
        return OllamaProvider(**kwargs)
    elif provider == "gemini":
        return GeminiProvider(**kwargs)
    else:
        raise ValueError("Invalid provider")

async def generate_response(prompt: str, provider="gemini", stream=False, **kwargs):
    try:
        llm = get_llm(provider, **kwargs)
        
        if stream:
            return llm.generate_response_stream(prompt)
        
        response = await llm.generate_response(prompt, stream=stream)
        return response
        
    except Exception as e:
        raise
