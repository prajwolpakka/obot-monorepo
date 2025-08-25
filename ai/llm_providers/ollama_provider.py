
import os
import requests
import httpx
import json
from typing import AsyncGenerator
from .base import LLMProvider
from utils.logger import logger
from dotenv import load_dotenv

load_dotenv()

class OllamaProvider(LLMProvider):
    def __init__(self, model_name="llama3.2-vision:latest", host=os.getenv('LLAMA3_API_KEY')):
        self.model_name = model_name
        self.host = host

    async def generate_response(self, prompt: str, stream: bool = False):
    # async def generate_response(self, prompt: str, stream: bool = False):
        logger.info(f"Looking for the generating response on : {prompt}")
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": stream
        }
        logger.info(f"API URL : {url}")
        

        try:
            r = requests.post(url, json=payload)
            if r.status_code == 200:
                response_json = r.json()
                response = response_json.get("response")
                if response:
                    return response
                else:
                    logger.error("API response does not contain the expected 'response' field.")
                    return None
            else:
                logger.error(f"Failed to get response, status code: {r.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error during request: {e}")
            return None
        
    async def generate_response_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Generate a response from the LLM in a streaming manner.

        Args:
            prompt: The input prompt for the LLM

        Returns:
            AsyncGenerator[str, None]: A generator yielding response chunks
        """
        logger.info(f"Streaming response for prompt: {prompt}")
        url = f"{self.host}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": True  # Keep this to inform the API that you want streaming
        }

        try:
            async with httpx.AsyncClient() as client:
                # No stream=True here
                response = await client.post(url, json=payload)
                
                if response.status_code == 200:
                    # Stream the response using aiter_lines
                    async for line in response.aiter_lines():
                        if line:
                            # Parse the JSON string into a dictionary
                            try:
                                parsed_line = json.loads(line)
                                # Access the 'response' field from the parsed dictionary
                                yield parsed_line.get("response", "")
                            except json.JSONDecodeError as e:
                                logger.error(f"Error parsing JSON: {e}")
                                yield ""  # If JSON parsing fails, yield empty string
                else:
                    logger.error(f"Failed to get response, status code: {response.status_code}")
                    yield ""
        except Exception as e:
            logger.error(f"Error during request: {e}")
            yield ""
