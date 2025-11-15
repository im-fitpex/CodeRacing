import numpy as np
from typing import List, Dict, Tuple
import logging
from collections import defaultdict

from app.models.schemas import SearchQuery, SearchResult
from app.services.embedding_service import embedding_service
from app.services.search_service import faiss_service
from app.utils.bm25 import BM25Search
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class HybridSearchService:
    """Hybrid search combining semantic (FAISS) and keyword (BM25) search"""
    
    def __init__(self):
        self.bm25_search = None
        self.documents = []
    
    def initialize(self, documents: List[Dict]):
        """Initialize search indices"""
        logger.info(f"Initializing hybrid search with {len(documents)} documents")
        
        self.documents = documents
        
        # Build BM25 index
        self.bm25_search = BM25Search(documents)
        
        # Generate embeddings and build FAISS index
        embeddings = embedding_service.encode_documents(documents)
        faiss_service.build_index(documents, embeddings)
        
        logger.info("Hybrid search initialized successfully")
    
    def search(self, search_query: SearchQuery) -> List[SearchResult]:
        """
        Perform hybrid search
        
        Combines:
        1. Semantic search (FAISS + Sentence Transformers)
        2. Keyword search (BM25)
        
        Args:
            search_query: Search query with parameters
            
        Returns:
            List of search results sorted by relevance
        """
        query = search_query.query
        top_k = search_query.top_k or settings.TOP_K_RESULTS
        semantic_weight = search_query.semantic_weight or settings.SEMANTIC_WEIGHT
        keyword_weight = 1.0 - semantic_weight
        
        # 1. Semantic Search
        query_embedding = embedding_service.encode(query, normalize=True)
        semantic_results = faiss_service.search(query_embedding, top_k=top_k * 2)
        
        # 2. Keyword Search (BM25)
        bm25_results = self.bm25_search.get_top_k(query, top_k=top_k * 2)
        
        # 3. Combine scores using weighted sum
        combined_scores = self._combine_scores(
            semantic_results,
            bm25_results,
            semantic_weight,
            keyword_weight
        )
        
        # 4. Apply filters
        filtered_results = self._apply_filters(
            combined_scores,
            search_query.category_filter,
            search_query.free_only
        )
        
        # 5. Sort and select top K
        sorted_results = sorted(
            filtered_results.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )[:top_k]
        
        # 6. Convert to SearchResult objects
        results = []
        for doc_idx, score_data in sorted_results:
            doc = self.documents[doc_idx]
            
            if score_data['score'] < settings.MIN_SIMILARITY_SCORE:
                continue
            
            results.append(SearchResult(
                app_id=doc['id'],
                name=doc['name'],
                developer=doc['developer'],
                category=doc['category'],
                short_description=doc['short_description'],
                rating=doc['rating'],
                downloads=doc['downloads'],
                icon_url=doc['icon_url'],
                relevance_score=round(score_data['score'], 4),
                match_type=score_data['match_type']
            ))
        
        return results
    
    def _combine_scores(
        self,
        semantic_results: List[Tuple[int, float]],
        bm25_results: List[Tuple[int, float]],
        semantic_weight: float,
        keyword_weight: float
    ) -> Dict[int, Dict]:
        """
        Combine semantic and keyword scores
        
        Uses Reciprocal Rank Fusion for robust combination
        """
        combined = defaultdict(lambda: {'score': 0.0, 'match_type': 'none'})
        
        # Normalize semantic scores
        semantic_dict = {}
        if semantic_results:
            max_semantic = max(score for _, score in semantic_results)
            semantic_dict = {
                idx: score / max_semantic if max_semantic > 0 else 0
                for idx, score in semantic_results
            }
        
        # Normalize BM25 scores
        bm25_dict = {}
        if bm25_results:
            max_bm25 = max(score for _, score in bm25_results)
            bm25_dict = {
                idx: score / max_bm25 if max_bm25 > 0 else 0
                for idx, score in bm25_results
            }
        
        # Combine scores
        all_indices = set(semantic_dict.keys()) | set(bm25_dict.keys())
        
        for idx in all_indices:
            semantic_score = semantic_dict.get(idx, 0.0)
            keyword_score = bm25_dict.get(idx, 0.0)
            
            # Weighted combination
            final_score = (
                semantic_weight * semantic_score +
                keyword_weight * keyword_score
            )
            
            # Determine match type
            if semantic_score > 0 and keyword_score > 0:
                match_type = 'hybrid'
            elif semantic_score > 0:
                match_type = 'semantic'
            else:
                match_type = 'keyword'
            
            combined[idx] = {
                'score': final_score,
                'match_type': match_type
            }
        
        return combined
    
    def _apply_filters(
        self,
        results: Dict[int, Dict],
        category_filter: str = None,
        free_only: bool = None
    ) -> Dict[int, Dict]:
        """Apply category and price filters"""
        if not category_filter and free_only is None:
            return results
        
        filtered = {}
        for idx, score_data in results.items():
            doc = self.documents[idx]
            
            # Category filter
            if category_filter and doc['category'].lower() != category_filter.lower():
                continue
            
            # Free apps filter
            if free_only is not None and doc['is_free'] != free_only:
                continue
            
            filtered[idx] = score_data
        
        return filtered

# Singleton instance
hybrid_search_service = HybridSearchService()
