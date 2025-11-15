from rank_bm25 import BM25Okapi
import numpy as np
from typing import List, Dict
import re

class BM25Search:
    """BM25 keyword-based search"""
    
    def __init__(self, documents: List[Dict]):
        self.documents = documents
        self.bm25 = None
        self._build_index()
    
    def _preprocess_text(self, text: str) -> List[str]:
        """Tokenize and normalize text"""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters
        text = re.sub(r'[^\w\s]', ' ', text)
        # Split into words
        tokens = text.split()
        # Remove short tokens
        tokens = [t for t in tokens if len(t) > 2]
        return tokens
    
    def _build_index(self):
        """Build BM25 index from documents"""
        corpus = []
        for doc in self.documents:
            # Combine searchable fields
            text = f"{doc['name']} {doc['developer']} {doc['description']} {doc['category']}"
            tokens = self._preprocess_text(text)
            corpus.append(tokens)
        
        self.bm25 = BM25Okapi(corpus)
    
    def search(self, query: str, top_k: int = 20) -> np.ndarray:
        """
        Search using BM25
        
        Returns:
            Array of BM25 scores for all documents
        """
        query_tokens = self._preprocess_text(query)
        scores = self.bm25.get_scores(query_tokens)
        return scores
    
    def get_top_k(self, query: str, top_k: int = 20) -> List[tuple]:
        """
        Get top K results with their scores
        
        Returns:
            List of (doc_index, score) tuples
        """
        scores = self.search(query, top_k)
        # Get indices sorted by score
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = [(idx, scores[idx]) for idx in top_indices if scores[idx] > 0]
        return results
