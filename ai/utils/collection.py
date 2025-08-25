from kms_ai.utils.qdrand_db import client
from qdrant_client.models import VectorParams, Distance


def ensure_qdrant_collection_exists(collection_name: str, embedding_dim: int = 768):
    """Ensure a Qdrant collection exists, and create it if not."""
    collections = client.get_collections().collections
    if not any(c.name == collection_name for c in collections):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=embedding_dim,
                distance=Distance.COSINE
            )
        )
        print(f"Collection '{collection_name}' created.")
    else:
        print(f"Collection '{collection_name}' already exists.")