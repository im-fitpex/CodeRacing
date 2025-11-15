import faiss
import numpy as np
from typing import List, Dict, Tuple
import logging

from app.config import get_settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)
settings = get_settings()

class FAISSSearchService:
    """FAISS-based vector search service"""
    
    def __init__(self):
        self.index = None
        self.documents = []
        self.embeddings = None
    
    def build_index(self, documents: List[Dict], embeddings: np.ndarray):
        """
        Build FAISS index from embeddings
        
        Args:
            documents: List of app documents
            embeddings: Document embeddings matrix
        """
        try:
            self.documents = documents
            self.embeddings = embeddings
            
            n_docs, embedding_dim = embeddings.shape
            logger.info(f"Building FAISS index: {n_docs} documents, dim={embedding_dim}")
            
            # Ensure embeddings are float32
            embeddings = embeddings.astype('float32')
            
            if n_docs < 1000:
                # For small datasets, use simple flat index
                self.index = faiss.IndexFlatIP(embedding_dim)
                self.index.add(embeddings)
            else:
                # For larger datasets, use IVF with clustering
                nlist = min(settings.FAISS_NLIST, n_docs // 10)
                quantizer = faiss.IndexFlatIP(embedding_dim)
                self.index = faiss.IndexIVFFlat(
                    quantizer, 
                    embedding_dim, 
                    nlist, 
                    faiss.METRIC_INNER_PRODUCT
                )
                
                # Train the index
                self.index.train(embeddings)
                self.index.add(embeddings)
                self.index.nprobe = settings.FAISS_NPROBE
            
            logger.info(f"FAISS index built: {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Error building FAISS index: {str(e)}")
            raise
    
    def search(self, query_embedding: np.ndarray, top_k: int = 20) -> List[Tuple[int, float]]:
        """
        Search similar documents using FAISS
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            
        Returns:
            List of (doc_index, similarity_score) tuples
        """
        if self.index is None:
            raise ValueError("Index not initialized. Call build_index first.")
        
        try:
            # Ensure query is 2D and float32
            query_embedding = query_embedding.astype('float32').reshape(1, -1)
            
            # Search
            distances, indices = self.index.search(query_embedding, top_k)
            
            # Convert to list of tuples
            results = [
                (int(idx), float(score)) 
                for idx, score in zip(indices[0], distances[0])
                if idx != -1  # Filter out padding indices
            ]
            
            return results
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            raise
    
    def save_index(self, filepath: str):
        """Save FAISS index to disk"""
        if self.index is not None:
            faiss.write_index(self.index, filepath)
            logger.info(f"Index saved to {filepath}")
    
    def load_index(self, filepath: str, documents: List[Dict]):
        """Load FAISS index from disk"""
        self.index = faiss.read_index(filepath)
        self.documents = documents
        logger.info(f"Index loaded from {filepath}")

# Singleton instance
faiss_service = FAISSSearchService()
