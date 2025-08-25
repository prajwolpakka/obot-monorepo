from typing import List, Union
from sentence_transformers import SentenceTransformer
from utils.logger import logger
from config.constants import EMBEDDER_MODEL

class Embedder:
    """
    Enhanced embedder with batch processing and async support
    """
    def __init__(self, model_name: str = EMBEDDER_MODEL):
        """
        Initialize the embedder with async capabilities
        
        Args:
            model_name (str): Name of the sentence transformer model
        """
        self.model = SentenceTransformer(model_name, trust_remote_code=True)
        
    def encode(self, texts: Union[str, List[str]], language: str = 'en', batch_size: int = 32) -> Union[List[float], List[List[float]]]:
        """
        Encode texts synchronously (backward compatibility)
        
        Args:
            texts: Single text or list of texts to embed
            language: Language for optimized embeddings
            batch_size: Batch size for processing
            
        Returns:
            Embeddings as list(s) of floats
        """
        if isinstance(texts, str):
            texts = [texts]
            
        # Process in batches for memory efficiency
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.model.encode(batch, convert_to_tensor=False)
            embeddings.extend(batch_embeddings)
            
        return embeddings[0] if len(texts) == 1 else embeddings
    