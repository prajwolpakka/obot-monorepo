from .base import LLMProvider
from typing import AsyncGenerator
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv
from utils.logger import logger
import asyncio

load_dotenv()

class GeminiProvider(LLMProvider):
    API_KEYS = list(filter(None, [
        os.getenv('GOOGLE_API_KEY'),
        os.getenv('GOOGLE_API_KEY1'),
        os.getenv('GOOGLE_API_KEY2'),
        os.getenv('GOOGLE_API_KEY3'),
    ]))

    def __init__(self, model_name: str = "gemini-2.5-flash"):
        if not self.API_KEYS:
            raise ValueError("No valid Google API keys found in environment variables.")
        self.api_key = random.choice(self.API_KEYS)
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name)
        self.model_name = model_name

    async def generate_response(self, prompt: str, stream: bool = False) -> str:
        """Generate a response using the Gemini model."""
        
        try:
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            
            if response and response.text:
                return response.text
            else:
                return "I apologize, but I couldn't generate a response. Please try again."
                
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
    

    async def generate_response_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        """Generate response in streaming mode using Gemini."""
        try:
            # Define a synchronous function to get and iterate the stream
            def _sync_stream_generator():
                stream = self.model.generate_content(prompt, stream=True)
                for chunk in stream:
                    if chunk and chunk.text:
                        print(f"Yielding Gemini chunk inside: {chunk.text}")
                        yield chunk.text

            # Run the synchronous generator in a separate thread
            async def _async_stream_wrapper():
                loop = asyncio.get_event_loop()
                for chunk in await loop.run_in_executor(None, lambda: list(_sync_stream_generator())):
                    yield chunk

            async for text_chunk in _async_stream_wrapper():
                yield text_chunk

        except Exception as e:
            logger.error(f"Error during Gemini streaming: {e}")
            yield ""
