import os
import time
import socket
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from config.constants import QDRANT_COLLECTION_NAME
from dotenv import load_dotenv

load_dotenv()

DEFAULT_QDRANT_HOST = os.environ.get('QDRANT_HOST', 'localhost')
DEFAULT_QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))
DEFAULT_EMBEDDING_DIM = 768

def wait_for_qdrant(host: str = DEFAULT_QDRANT_HOST, port: int = DEFAULT_QDRANT_PORT,
                    retries: int = 10, delay: int = 2) -> None:
    """
    Wait until Qdrant is reachable via TCP.

    Raises:
        ConnectionError: If Qdrant is not reachable within the timeout period.
    """
    for attempt in range(1, retries + 1):
        try:
            with socket.create_connection((host, port), timeout=2):
                print(f"[OK] Qdrant is reachable at {host}:{port}")
                return
        except Exception:
            print(f"[WAIT] Waiting for Qdrant ({host}:{port})... attempt {attempt}/{retries}")
            time.sleep(delay)
    raise ConnectionError(f"[ERROR] Could not connect to Qdrant at {host}:{port}")


def ensure_collection_exists(client: QdrantClient, collection_name: str,
                             embedding_dim: int = DEFAULT_EMBEDDING_DIM) -> None:
    """
    Create the collection in Qdrant if it doesn't already exist.

    Args:
        client (QdrantClient): Initialized Qdrant client
        collection_name (str): Name of the collection to check/create
        embedding_dim (int): Dimensionality of vectors

    """
    existing_collections = {col.name for col in client.get_collections().collections}
    if collection_name in existing_collections:
        print(f"[INFO] Collection '{collection_name}' already exists.")
        return

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=embedding_dim,
            distance=Distance.COSINE
        )
    )
    print(f"Collection '{collection_name}' created.")


def initialize_qdrant(host: str = DEFAULT_QDRANT_HOST,
                      port: int = DEFAULT_QDRANT_PORT,
                      collection_name: str = QDRANT_COLLECTION_NAME,
                      embedding_dim: int = DEFAULT_EMBEDDING_DIM) -> QdrantClient:
    """
    Initialize Qdrant client and ensure required collection exists.

    Returns:
        QdrantClient: Initialized and verified client
    """
    wait_for_qdrant(host=host, port=port)
    client = QdrantClient(host=host, port=port)
    ensure_collection_exists(client, collection_name, embedding_dim)
    return client


client = initialize_qdrant(collection_name=QDRANT_COLLECTION_NAME)