import subprocess
import time
import os
import socket
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from config.constants import QDRANT_COLLECTION_NAME, EMBEDDING_DIM

class QdrantService:
    def __init__(self, collection_name: str = QDRANT_COLLECTION_NAME, embedding_dim: int = EMBEDDING_DIM, host="qdrant", port=6333):
        self.collection_name = collection_name
        self.embedding_dim = embedding_dim
        self.qdrant_process = None
        self.client = QdrantClient(host=host, port=port)
        self.host = host
        self.port = port

    def _is_qdrant_running(self, timeout=2) -> bool:
        """Check if Qdrant is running by attempting a TCP connection."""
        try:
            with socket.create_connection((self.host, self.port), timeout=timeout):
                return True
        except (socket.timeout, ConnectionRefusedError):
            return False

    def start(self):
        if self._is_qdrant_running():
            print("[OK] Qdrant is already running.")
        else:
            print("[START] Starting Qdrant via Docker...")
            self.qdrant_process = subprocess.Popen([
                "docker", "run", "-p", "6333:6333",
                "-v", f"{os.getcwd()}/qdrant_db:/qdrant/storage",
                "qdrant/qdrant"
            ])
            # Wait for Qdrant to become available
            for _ in range(10):
                if self._is_qdrant_running():
                    break
                time.sleep(1)
            else:
                raise RuntimeError("[ERROR] Qdrant failed to start.")

        # Now ensure collection exists
        print("[CONFIG] Ensuring Qdrant collection exists...")
        try:
            collections = self.client.get_collections().collections
            if not any(c.name == self.collection_name for c in collections):
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_dim,
                        distance=Distance.COSINE
                    )
                )
                print(f"[OK] Collection '{self.collection_name}' created.")
            else:
                print(f"[INFO] Collection '{self.collection_name}' already exists.")
        except Exception as e:
            print(f"[ERROR] Failed to connect to Qdrant: {e}")
            raise

    def stop(self):
        if self.qdrant_process:
            print("[STOP] Stopping Qdrant Docker container...")
            self.qdrant_process.terminate()

qdrant_host = os.environ.get("QDRANT_HOST", "localhost")
qdrant_port = int(os.environ.get("QDRANT_PORT", "6333"))
print(f"Qdrant Host : {qdrant_host} : {qdrant_port}")
qdrant_service = QdrantService(collection_name=QDRANT_COLLECTION_NAME, embedding_dim=EMBEDDING_DIM, host=qdrant_host, port=qdrant_port)