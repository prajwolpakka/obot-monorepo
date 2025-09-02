import os
from dotenv import load_dotenv

# Ensure .env is loaded before reading any environment variables
load_dotenv()

# Embeddings configuration (Voyage AI by default)
# Common models and their typical dimensions:
# - voyage-3.5-lite  -> 1024 (fast, cost-effective)
# - voyage-3-lite    -> 1024
# - voyage-3         -> 1536 or higher (check docs)
# You can override via EMBEDDINGS_MODEL and EMBEDDING_DIM in the environment.
EMBEDDINGS_MODEL = os.environ.get('EMBEDDINGS_MODEL', 'voyage-3.5-lite')

# Base URLs for providers used in the app
# Voyage (embeddings)
VOYAGE_BASE_URL = os.environ.get('VOYAGE_BASE_URL', 'https://api.voyageai.com/v1')
# OpenRouter (chat/completions provider still used elsewhere)
OPENROUTER_BASE_URL = os.environ.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

QDRANT_COLLECTION_NAME = os.environ.get('QDRANT_COLLECTION_NAME', 'bot_documents')
CHUNK_SIZE = int(os.environ.get('CHUNK_SIZE', '1000'))
# Reduce overlap to 10% of default chunk size to cut duplication
CHUNK_OVERLAP = int(os.environ.get('CHUNK_OVERLAP', '100'))

# Embedding dimension must match the selected model
# Default aligns with voyage-3.5-lite
EMBEDDING_DIM = int(os.environ.get('EMBEDDING_DIM', '1024'))
