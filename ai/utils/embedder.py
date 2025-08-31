from typing import List, Union
import os
from openai import OpenAI
from utils.logger import logger
from config.constants import OPENAI_EMBEDDINGS_MODEL


class Embedder:
    """Simple OpenAI embeddings wrapper with batch support."""

    def __init__(self, model_name: str | None = None):
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)
        self.model_name = model_name or OPENAI_EMBEDDINGS_MODEL

    def encode(self, texts: Union[str, List[str]], batch_size: int = 64) -> Union[List[float], List[List[float]]]:
        if isinstance(texts, str):
            texts = [texts]

        embeddings: List[List[float]] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            resp = self.client.embeddings.create(model=self.model_name, input=batch)
            embeddings.extend([item.embedding for item in resp.data])

        return embeddings[0] if len(embeddings) == 1 else embeddings
    
