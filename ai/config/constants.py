import os

# OpenAI embeddings configuration (OpenAI-only)
OPENAI_EMBEDDINGS_MODEL = os.environ.get('EMBEDDINGS_MODEL', 'text-embedding-3-small')

QDRANT_COLLECTION_NAME = os.environ.get('QDRANT_COLLECTION_NAME', 'bot_documents')
CHUNK_SIZE = int(os.environ.get('CHUNK_SIZE', '1000'))
# Reduce overlap to 10% of default chunk size to cut duplication
CHUNK_OVERLAP = int(os.environ.get('CHUNK_OVERLAP', '100'))

# Embedding dimension must match the embeddings model in use
# text-embedding-3-small default size is 1536
EMBEDDING_DIM = int(os.environ.get('EMBEDDING_DIM', '1536'))
