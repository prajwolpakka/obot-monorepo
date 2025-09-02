import os
from dotenv import load_dotenv

# Ensure .env is loaded before reading any environment variables
load_dotenv()

# Embeddings configuration (OpenRouter)
# Example models:
# - openai/text-embedding-3-small (1536)
# - openai/text-embedding-3-large (3072)
# - jinaai/jina-embeddings-v2-base-en (1024)
EMBEDDINGS_MODEL = os.environ.get('EMBEDDINGS_MODEL', 'openai/text-embedding-3-small')
OPENROUTER_BASE_URL = os.environ.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

QDRANT_COLLECTION_NAME = os.environ.get('QDRANT_COLLECTION_NAME', 'bot_documents')
CHUNK_SIZE = int(os.environ.get('CHUNK_SIZE', '1000'))
# Reduce overlap to 10% of default chunk size to cut duplication
CHUNK_OVERLAP = int(os.environ.get('CHUNK_OVERLAP', '100'))

# Embedding dimension must match the selected model
# Default aligns with openai/text-embedding-3-small
EMBEDDING_DIM = int(os.environ.get('EMBEDDING_DIM', '1536'))
