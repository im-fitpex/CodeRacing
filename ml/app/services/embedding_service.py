import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Union
import logging
from functools import lru_cache

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class EmbeddingService:
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            self._load_model()
    
    def _load_model(self):
        """Load Sentence Transformer model"""
        try:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            self._model.max_seq_length = settings.MAX_SEQ_LENGTH
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        normalize: bool = True,
        batch_size: int = 32
    ) -> np.ndarray:
        """
        Encode texts into embeddings
        
        Args:
            texts: Single text or list of texts
            normalize: Whether to L2 normalize embeddings
            batch_size: Batch size for encoding
            
        Returns:
            numpy array of embeddings
        """
        try:
            if isinstance(texts, str):
                texts = [texts]
            
            embeddings = self._model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=normalize
            )
            
            return embeddings
        except Exception as e:
            logger.error(f"Encoding error: {str(e)}")
            raise
    
    def encode_documents(self, documents: List[dict]) -> np.ndarray:
        """
        Encode app documents into embeddings
        Combines name, description, and developer for rich representation
        """
        texts = []
        for doc in documents:
            # Combine multiple fields for better semantic understanding
            text = f"{doc['name']}. {doc['developer']}. {doc['description']}"
            texts.append(text)
        
        return self.encode(texts, normalize=True)
    
    @property
    def model(self):
        return self._model

# Singleton instance
embedding_service = EmbeddingService()
