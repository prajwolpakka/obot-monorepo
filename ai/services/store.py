from typing import List, Dict, Any, Optional
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue, MatchAny
from pydantic import BaseModel
import logging
from datetime import datetime

from utils.qdrant_db import client
from config.constants import QDRANT_COLLECTION_NAME
from utils.logger import logger
import uuid

class StoreService:
    """Service for handling document storage and retrieval with Qdrant."""
    
    def __init__(self, collection_name: str = QDRANT_COLLECTION_NAME):
        """
        Initialize the store service.
        
        Args:
            collection_name: Name of the Qdrant collection to use
        """
        self.collection_name = collection_name
        self.client = client

    def store_document(
        self,
        document: Any,
        vector: List[float],
        document_id: Optional[str],
        **additional_metadata,
    ) -> bool:
        """
        Store a document with its vector embedding in Qdrant.
        
        Args:
            document: Document to store (must be Pydantic model or dict)
            vector: The embedding vector for the document
            document_id: Optional custom ID for the document
            **additional_metadata: Additional metadata to store with the document
            
        Returns:
            bool: True if storage was successful
        """
        logger.info(
            f"Storing point id={document_id or 'auto'} for doc={getattr(document, 'id', additional_metadata.get('id', 'unknown'))}"
        )
        try:
            # Convert various document types into a base payload
            base_payload: Dict[str, Any] = {}
            if isinstance(document, BaseModel):
                # Pydantic v2
                base_payload = document.model_dump() if hasattr(document, 'model_dump') else document.dict()
            elif hasattr(document, 'page_content') and hasattr(document, 'metadata'):
                # LangChain Document-like
                base_payload = {
                    "page_content": getattr(document, 'page_content', None),
                    "metadata": getattr(document, 'metadata', {}) or {},
                }
            elif isinstance(document, dict):
                base_payload = document
            else:
                try:
                    base_payload = dict(document)
                except Exception:
                    base_payload = {k: v for k, v in vars(document).items()}

            # Merge and flatten payload
            metadata = base_payload.pop("metadata", {})
            if not isinstance(metadata, dict):
                metadata = {}
            payload = {
                **base_payload,
                **metadata,
                **additional_metadata,
                "stored_at": datetime.utcnow().isoformat(),
            }
            logger.debug(f"Payload keys: {list(payload.keys())}")

            # Create point structure for Qdrant
            point = PointStruct(
                id=document_id or uuid.uuid4().hex,
                vector=vector,
                payload={**payload, "stored_at": datetime.utcnow().isoformat()},
            )
            
            # Upsert the point
            self.client.upsert(collection_name=self.collection_name, points=[point])
            
            return True
            
        except Exception as e:
            logger.error(f"Error storing document {getattr(document, 'id', 'unknown')}: {str(e)}")
            raise
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a document by its ID.
        
        Args:
            document_id: ID of the document to retrieve
            
        Returns:
            Optional[Dict]: The document payload if found, None otherwise
        """
        try:
            result = self.client.retrieve(
                collection_name=self.collection_name, ids=[document_id], with_vectors=False
            )
            return result[0].payload if result else None
        except Exception as e:
            logger.error(f"Error retrieving document {document_id}: {str(e)}")
            return None
    
    def search_similar(
        self, 
        query_vector: List[float], 
        limit: int = 5,
        score_threshold: float = 0.7,
        **filters
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents using vector similarity.
        
        Args:
            query_vector: The query embedding vector
            limit: Maximum number of results to return
            score_threshold: Minimum similarity score (0-1)
            **filters: Additional filter conditions
            
        Returns:
            List of matching documents with scores
        """
        try:
            # Build filter conditions if any
            filter_conditions = []
            for field, value in filters.items():
                filter_conditions.append(
                    FieldCondition(
                        key=field,
                        match=MatchValue(value=value)
                    )
                )
            
            search_filters = Filter(must=filter_conditions) if filter_conditions else None
            
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=search_filters,
                limit=limit,
                score_threshold=score_threshold
            )
            
            return [
                {
                    "id": hit.id,
                    "score": hit.score,
                    **hit.payload
                }
                for hit in search_results
            ]
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []

    def search_chunks_by_ids(self, vector: list[float], ids: list[str], limit: int = 10):
        filter_by_ids = Filter(
            must=[
                FieldCondition(
                    key="id",
                    match=MatchAny(any=ids)
                )
            ]
        )

        results = client.search(
            collection_name=QDRANT_COLLECTION_NAME,
            query_vector=vector,
            query_filter=filter_by_ids,
            limit=limit,
        )
        return results
