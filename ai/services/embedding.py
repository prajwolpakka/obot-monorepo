import os
from typing import List
from langchain_core.documents import Document as LangchainDocument
from utils.logger import logger
from config.constants import OPENAI_EMBEDDINGS_MODEL
from openai import OpenAI


class EmbeddingService:
    def __init__(self):
        """Initialize the embedding service with the OpenAI embeddings API."""
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)
        self.model_name = OPENAI_EMBEDDINGS_MODEL
        logger.info(f"EmbeddingService initialized with OpenAI model: {self.model_name}")

    def embed_document(self, chunkdoc: LangchainDocument) -> List[float]:
        """Generate an embedding for a single LangChain document using OpenAI."""
        try:
            text = chunkdoc.page_content
            logger.debug(f"Generating embedding for document with {len(text)} characters")
            resp = self.client.embeddings.create(model=self.model_name, input=text)
            vec = resp.data[0].embedding
            logger.debug(f"Generated embedding with {len(vec)} dimensions")
            return vec
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}", exc_info=True)
            raise e

    def embed_documents(self, docs: List[LangchainDocument]) -> List[List[float]]:
        """Generate embeddings for multiple LangChain documents using OpenAI."""
        try:
            contents = [doc.page_content for doc in docs]
            logger.info(f"Generating embeddings for {len(docs)} documents")
            resp = self.client.embeddings.create(model=self.model_name, input=contents)
            vectors = [item.embedding for item in resp.data]
            logger.info(f"Generated embeddings for {len(docs)} documents successfully")
            return vectors
        except Exception as e:
            logger.error(f"Batch embedding failed: {str(e)}", exc_info=True)
            raise e
