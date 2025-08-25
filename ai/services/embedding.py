from sentence_transformers import SentenceTransformer
from langchain_core.documents import Document as LangchainDocument
from config.constants import EMBEDDER_MODEL
from utils.logger import logger
from typing import List, Optional

class EmbeddingService():
    def __init__(self):
        """Initialize the embedding service with the specified model."""
        logger.info(f"Initializing EmbeddingService with model: {EMBEDDER_MODEL}")
        self.model = SentenceTransformer(EMBEDDER_MODEL, trust_remote_code=True)
        logger.info("EmbeddingService initialized successfully")
    
    def embed_document(self, chunkdoc: LangchainDocument) -> List[float]:
        """
        Generate embeddings for a LangChain document.
        
        Args:
            chunkdoc: LangChain document to embed
            
        Returns:
            List[float]: The embedding vector
        """
        try:
            logger.debug(f"Generating embedding for document with {len(chunkdoc.page_content)} characters")
            vector_embeddings = self.model.encode(chunkdoc.page_content)
            logger.debug(f"Generated embedding with {len(vector_embeddings)} dimensions")
            return vector_embeddings.tolist()  # Convert numpy array to list
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}", exc_info=True)
            raise e
    
    def embed_documents(self, docs: List[LangchainDocument]) -> List[List[float]]:
        """
        Generate embeddings for multiple LangChain documents.
        
        Args:
            docs: List of LangChain documents to embed
            
        Returns:
            List[List[float]]: List of embedding vectors
        """
        try:
            contents = [doc.page_content for doc in docs]
            logger.info(f"Generating embeddings for {len(docs)} documents")
            embeddings = self.model.encode(contents)
            logger.info(f"Generated embeddings for {len(docs)} documents successfully")
            return embeddings.tolist()  # Convert numpy array to list
        except Exception as e:
            logger.error(f"Batch embedding failed: {str(e)}", exc_info=True)
            raise e
